/**
 * Módulo de Autenticação
 * Funções para login, validação de sessão e controle de acesso
 */

import bcrypt from 'bcryptjs';

// Usuário admin padrão (hardcoded para simplificar)
const ADMIN_DEFAULT = {
  id: 1,
  nome: 'Administrador',
  email: 'admin@rifa.com',
  senha: 'admin123', // Senha em texto plano apenas para comparação
  tipo: 'admin',
};

/**
 * Valida credenciais de login
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Object|null} Dados do usuário ou null
 */
export async function validarLogin(email, senha) {
  // Verificar se é o admin padrão
  if (email === ADMIN_DEFAULT.email && senha === ADMIN_DEFAULT.senha) {
    return {
      id: ADMIN_DEFAULT.id,
      nome: ADMIN_DEFAULT.nome,
      email: ADMIN_DEFAULT.email,
      tipo: ADMIN_DEFAULT.tipo,
    };
  }

  // Buscar no banco de dados
  if (typeof window === 'undefined') {
    const { query } = await import('./db');

    try {
      // Buscar usuário pelo email
      const result = await query(
        'SELECT id, nome, email, senha, tipo FROM usuarios WHERE email = ? AND ativo = TRUE',
        [email]
      );

      if (result.rows && result.rows.length > 0) {
        const usuario = result.rows[0];

        // Comparar senha com hash
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (senhaValida) {
          // Retornar dados sem a senha
          return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo,
          };
        }
      }
    } catch (error) {
      console.error('Erro ao validar login:', error);
    }
  }

  return null;
}

/**
 * Cria um novo gerenciador
 * @param {Object} dados - Dados do gerenciador
 * @returns {Object} Gerenciador criado
 */
export async function criarGerenciador(dados) {
  const { nome, email, senha } = dados;

  if (typeof window === 'undefined') {
    const { query } = await import('./db');

    try {
      // Gerar hash da senha
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      const result = await query(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        [nome, email, senhaHash, 'gerenciador']
      );

      return {
        id: result.rows.insertId,
        nome,
        email,
        tipo: 'gerenciador',
      };
    } catch (error) {
      console.error('Erro ao criar gerenciador:', error);
      throw new Error('Erro ao criar gerenciador');
    }
  }

  return null;
}

/**
 * Lista todos os gerenciadores
 * @returns {Array} Lista de gerenciadores
 */
export async function listarGerenciadores() {
  if (typeof window === 'undefined') {
    const { query } = await import('./db');

    try {
      const result = await query(
        'SELECT id, nome, email, tipo, ativo, created_at FROM usuarios WHERE tipo = ? ORDER BY created_at DESC',
        ['gerenciador']
      );

      return result.rows || [];
    } catch (error) {
      console.error('Erro ao listar gerenciadores:', error);
      return [];
    }
  }

  return [];
}

/**
 * Valida se o usuário tem permissão
 * @param {Object} usuario - Dados do usuário
 * @param {string} tipoRequerido - Tipo de usuário necessário
 * @returns {boolean}
 */
export function validarPermissao(usuario, tipoRequerido) {
  if (!usuario) return false;

  if (tipoRequerido === 'admin') {
    return usuario.tipo === 'admin';
  }

  if (tipoRequerido === 'gerenciador') {
    return usuario.tipo === 'admin' || usuario.tipo === 'gerenciador';
  }

  return false;
}

/**
 * Valida sessão do usuário (middleware)
 * @param {Object} session - Sessão do usuário
 * @returns {Object|null} Usuário ou null
 */
export function validarSessao(session) {
  if (!session || !session.usuario) {
    return null;
  }

  return session.usuario;
}

export default {
  validarLogin,
  criarGerenciador,
  listarGerenciadores,
  validarPermissao,
  validarSessao,
  ADMIN_DEFAULT,
};
