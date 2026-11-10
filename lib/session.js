/**
 * Sessão do usuário (somente servidor)
 *
 * O login grava um cookie httpOnly assinado com HMAC-SHA256 (SESSION_SECRET).
 * Cada API protegida lê o cookie, confere a assinatura e a validade e busca
 * o usuário no banco, para que um usuário desativado perca o acesso na hora.
 */

import crypto from 'crypto';
import { query } from './db';

const COOKIE_NOME = 'rifa_sessao';
const DURACAO_SEGUNDOS = 7 * 24 * 60 * 60; // 7 dias

function segredo() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32 || s.startsWith('troque_')) {
    throw new Error('SESSION_SECRET ausente ou curto demais (mínimo 32 caracteres) no .env.local');
  }
  return s;
}

function assinar(valor) {
  return crypto.createHmac('sha256', segredo()).update(valor).digest('base64url');
}

function montarCookie(valor, maxAge) {
  const partes = [
    `${COOKIE_NOME}=${valor}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (process.env.NODE_ENV === 'production') partes.push('Secure');
  return partes.join('; ');
}

/** Grava o cookie de sessão na resposta. */
export function criarSessao(res, usuario) {
  const payload = Buffer.from(JSON.stringify({
    id: usuario.id,
    exp: Math.floor(Date.now() / 1000) + DURACAO_SEGUNDOS,
  })).toString('base64url');
  res.setHeader('Set-Cookie', montarCookie(`${payload}.${assinar(payload)}`, DURACAO_SEGUNDOS));
}

/** Apaga o cookie de sessão. */
export function encerrarSessao(res) {
  res.setHeader('Set-Cookie', montarCookie('', 0));
}

/**
 * Retorna o usuário logado ({ id, nome, email, tipo }) ou null.
 */
export async function getUsuario(req) {
  const bruto = req.cookies?.[COOKIE_NOME];
  if (!bruto || !bruto.includes('.')) return null;

  const [payload, assinatura] = bruto.split('.');
  const esperada = assinar(payload);
  const a = Buffer.from(assinatura || '');
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let dados;
  try {
    dados = JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return null;
  }
  if (!dados?.id || !dados.exp || dados.exp < Math.floor(Date.now() / 1000)) return null;

  const result = await query(
    'SELECT id, nome, email, tipo FROM usuarios WHERE id = ? AND ativo = TRUE',
    [dados.id]
  );
  return result.rows?.[0] || null;
}

/**
 * Exige login. Retorna o usuário ou responde 401 e retorna null.
 */
export async function exigirLogin(req, res) {
  const usuario = await getUsuario(req);
  if (!usuario) {
    res.status(401).json({ error: 'Faça login para continuar' });
    return null;
  }
  return usuario;
}

/**
 * Exige login de admin. Retorna o usuário ou responde 401/403 e retorna null.
 */
export async function exigirAdmin(req, res) {
  const usuario = await exigirLogin(req, res);
  if (!usuario) return null;
  if (usuario.tipo !== 'admin') {
    res.status(403).json({ error: 'Acesso restrito ao administrador' });
    return null;
  }
  return usuario;
}

export function isAdmin(usuario) {
  return usuario?.tipo === 'admin';
}

/** O usuário pode gerenciar esta rifa? (admin ou dono) */
export function podeGerenciarRifa(usuario, rifa) {
  if (!usuario || !rifa) return false;
  return isAdmin(usuario) || rifa.gerenciador_id === usuario.id;
}

/** O usuário pode gerenciar este vendedor? (admin ou dono) */
export function podeGerenciarVendedor(usuario, vendedor) {
  if (!usuario || !vendedor) return false;
  return isAdmin(usuario) || vendedor.gerenciador_id === usuario.id;
}

/**
 * Exige login e que o usuário seja dono da rifa (ou admin).
 * Aceita id numérico ou slug. Retorna { usuario, rifa } ou responde e retorna null.
 */
export async function exigirRifaDoUsuario(req, res, rifaIdOuSlug) {
  const usuario = await exigirLogin(req, res);
  if (!usuario) return null;

  const rifa = await buscarRifa(rifaIdOuSlug);
  if (!rifa) {
    res.status(404).json({ error: 'Rifa não encontrada' });
    return null;
  }
  if (!podeGerenciarRifa(usuario, rifa)) {
    res.status(403).json({ error: 'Esta rifa pertence a outro gerenciador' });
    return null;
  }
  return { usuario, rifa };
}

/** Busca rifa por id numérico ou slug. */
export async function buscarRifa(rifaIdOuSlug) {
  const valor = String(rifaIdOuSlug || '');
  if (!valor) return null;
  const porId = /^\d+$/.test(valor);
  const result = await query(
    `SELECT * FROM rifas WHERE ${porId ? 'id' : 'slug'} = ?`,
    [porId ? parseInt(valor, 10) : valor]
  );
  return result.rows?.[0] || null;
}
