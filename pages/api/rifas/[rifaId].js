/**
 * API Route: Detalhes de uma Rifa
 * GET /api/rifas/[rifaId] - Retorna dados completos de uma rifa
 * PUT /api/rifas/[rifaId] - Edita dados da rifa (somente dono ou admin)
 */

import fs from 'fs';
import path from 'path';
import { getRifa, getRifaBySlug, getPremiosByRifa, getBilhetesByRifa, query } from '../../../lib/db';
import { exigirRifaDoUsuario } from '../../../lib/session';

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } },
};

/** Salva uma imagem Base64 em /public/uploads e devolve a URL pública. */
function salvarImagemBase64(dataUrl, prefixo) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const filename = `${prefixo}-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(base64Data, 'base64'));
  return `/uploads/${filename}`;
}

/** Mantém a imagem atual, troca por uma nova (Base64) ou remove (vazio). */
function resolverImagem(valor, atual, prefixo) {
  if (valor === undefined) return atual || null;
  if (!valor) return null;
  if (typeof valor === 'string' && valor.startsWith('data:image')) return salvarImagemBase64(valor, prefixo);
  if (typeof valor === 'string' && valor.startsWith('/uploads/')) return valor;
  return atual || null;
}

async function editarRifa(req, res, rifaId) {
  const acesso = await exigirRifaDoUsuario(req, res, rifaId);
  if (!acesso) return;
  const { rifa } = acesso;

  if (rifa.status === 'concluido') {
    return res.status(400).json({ error: 'Rifa já sorteada não pode mais ser editada' });
  }

  const { titulo, descricao, logo_url, data_sorteio, valor_bilhete, premios } = req.body || {};

  const tituloLimpo = String(titulo || '').trim();
  if (!tituloLimpo) return res.status(400).json({ error: 'O título é obrigatório' });
  if (tituloLimpo.length > 255) return res.status(400).json({ error: 'Título muito longo' });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data_sorteio || ''))) {
    return res.status(400).json({ error: 'Data do sorteio inválida' });
  }
  const dia = new Date(`${data_sorteio}T00:00:00`).getDay();
  if (dia !== 0 && dia !== 3) {
    return res.status(400).json({ error: 'A data do sorteio deve ser uma quarta-feira ou um domingo (Loteria Federal)' });
  }

  // Valor do bilhete só muda enquanto nenhum bilhete foi vendido
  const vendidos = await query(
    "SELECT COUNT(*) AS total FROM bilhetes WHERE rifa_id = ? AND status_venda <> 'nao_vendido'",
    [rifa.id]
  );
  const temVendas = Number(vendidos.rows?.[0]?.total || 0) > 0;
  let novoValor = Number(rifa.valor_bilhete);
  if (valor_bilhete !== undefined && Number(valor_bilhete) !== Number(rifa.valor_bilhete)) {
    if (temVendas) {
      return res.status(400).json({ error: 'O valor do bilhete não pode mudar depois que há bilhetes vendidos' });
    }
    novoValor = Number(valor_bilhete);
    if (!(novoValor > 0)) return res.status(400).json({ error: 'Valor do bilhete inválido' });
  }

  if (!Array.isArray(premios) || premios.length === 0) {
    return res.status(400).json({ error: 'Adicione pelo menos um prêmio' });
  }
  if (premios.length > 5) return res.status(400).json({ error: 'Máximo de 5 prêmios' });
  if (premios.some(p => !String(p.descricao || '').trim())) {
    return res.status(400).json({ error: 'Preencha a descrição de todos os prêmios' });
  }

  const atuais = (await query('SELECT * FROM premios WHERE rifa_id = ?', [rifa.id])).rows || [];
  const atuaisPorId = new Map(atuais.map(p => [p.id, p]));
  for (const p of premios) {
    if (p.id && !atuaisPorId.has(Number(p.id))) {
      return res.status(400).json({ error: 'Prêmio não pertence a esta rifa' });
    }
  }

  // O slug (link público) é mantido para não quebrar links já compartilhados
  const novaLogo = resolverImagem(logo_url, rifa.logo_url, 'logo');
  await query(
    `UPDATE rifas SET titulo = ?, descricao = ?, logo_url = ?, data_sorteio = ?, valor_bilhete = ? WHERE id = ?`,
    [tituloLimpo, String(descricao || '').trim() || null, novaLogo, data_sorteio, novoValor, rifa.id]
  );

  // Prêmios: atualiza os existentes, cria os novos e remove os retirados; posições 1..n na ordem enviada
  const mantidos = new Set();
  for (let i = 0; i < premios.length; i++) {
    const p = premios[i];
    const posicao = i + 1;
    const desc = String(p.descricao).trim();
    const valorEst = p.valor_estimado === '' || p.valor_estimado == null ? null : Number(p.valor_estimado);
    if (p.id) {
      const atual = atuaisPorId.get(Number(p.id));
      const img = resolverImagem(p.imagem, atual.imagem_url, `premio-${rifa.id}-${posicao}`);
      await query(
        'UPDATE premios SET posicao = ?, descricao = ?, valor_estimado = ?, imagem_url = ? WHERE id = ?',
        [posicao, desc, valorEst, img, atual.id]
      );
      mantidos.add(atual.id);
    } else {
      const img = resolverImagem(p.imagem, null, `premio-${rifa.id}-${posicao}`);
      await query(
        'INSERT INTO premios (rifa_id, posicao, descricao, valor_estimado, imagem_url) VALUES (?, ?, ?, ?, ?)',
        [rifa.id, posicao, desc, valorEst, img]
      );
    }
  }
  for (const atual of atuais) {
    if (!mantidos.has(atual.id)) await query('DELETE FROM premios WHERE id = ?', [atual.id]);
  }

  return res.status(200).json({ success: true, message: 'Rifa atualizada com sucesso!' });
}

export default async function handler(req, res) {
  const { rifaId } = req.query;

  if (req.method === 'PUT') {
    try {
      return await editarRifa(req, res, rifaId);
    } catch (error) {
      console.error('Erro ao editar rifa:', error);
      return res.status(500).json({ error: 'Erro ao salvar alterações' });
    }
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Suporta tanto ID numérico quanto slug amigável
    const isNumericId = /^\d+$/.test(rifaId);
    const rifa = isNumericId
      ? await getRifa(parseInt(rifaId))
      : await getRifaBySlug(rifaId);

    if (!rifa) {
      return res.status(404).json({ error: 'Rifa não encontrada' });
    }

    const premios = await getPremiosByRifa(rifa.id);
    const bilhetes = await getBilhetesByRifa(rifa.id);

    // Buscar blocos com informações de vendedor
    const blocosResult = await query(
      `SELECT b.*, v.nome as vendedor_nome, v.telefone as vendedor_telefone
       FROM blocos b
       LEFT JOIN vendedores v ON b.vendedor_id = v.id
       WHERE b.rifa_id = ?
       ORDER BY b.numero`,
      [rifa.id]
    );

    res.status(200).json({
      rifa,
      premios,
      blocos: blocosResult.rows || [],
      bilhetes,
    });

  } catch (error) {
    console.error('Erro ao buscar rifa:', error);
    res.status(500).json({ error: 'Erro ao buscar dados da rifa' });
  }
}
