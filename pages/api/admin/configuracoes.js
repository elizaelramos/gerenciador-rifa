/**
 * API Route: Configurações do Sistema (Admin)
 * GET  /api/admin/configuracoes  - Retorna status do sistema
 * POST /api/admin/configuracoes  - Altera senha do administrador
 */

import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // ── GET: status do sistema ──────────────────────────────────────────────
  if (req.method === 'GET') {
    const { getConnection } = await import('../../../lib/db');

    const modoMock = process.env.USE_MOCK_DATA !== 'false';
    const urlBase = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    let dbStatus = { conectado: false, mensagem: 'Não testado (modo mock ativo)' };

    if (!modoMock) {
      try {
        const pool = await getConnection();
        await pool.query('SELECT 1');
        dbStatus = { conectado: true, mensagem: 'Conexão estabelecida com sucesso' };
      } catch (err) {
        dbStatus = { conectado: false, mensagem: err.message };
      }
    }

    return res.status(200).json({
      sistema: {
        modoMock,
        urlBase,
        dbHost: process.env.DB_HOST || 'localhost',
        dbNome: process.env.DB_NAME || '-',
        dbStatus,
      },
    });
  }

  // ── POST: alterar senha do admin ─────────────────────────────────────────
  if (req.method === 'POST') {
    const { acao, senhaAtual, novaSenha } = req.body;

    if (acao !== 'mudar-senha') {
      return res.status(400).json({ error: 'Ação inválida' });
    }

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
    }

    // Verificar senha atual (aceita a hardcoded ou a do banco)
    const { validarLogin } = await import('../../../lib/auth');
    const adminEmail = 'admin@rifa.com';
    const adminValido = await validarLogin(adminEmail, senhaAtual);

    if (!adminValido) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    try {
      const { query } = await import('../../../lib/db');
      const senhaHash = await bcrypt.hash(novaSenha, 10);

      // Verificar se já existe registro do admin no banco
      const existe = await query(
        'SELECT id FROM usuarios WHERE email = ? AND tipo = ?',
        [adminEmail, 'admin']
      );

      if (existe.rows && existe.rows.length > 0) {
        // Atualizar senha existente
        await query(
          'UPDATE usuarios SET senha = ? WHERE email = ? AND tipo = ?',
          [senhaHash, adminEmail, 'admin']
        );
      } else {
        // Criar registro do admin no banco (sobrepõe o hardcoded nas próximas sessões)
        await query(
          'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
          ['Administrador', adminEmail, senhaHash, 'admin']
        );
      }

      return res.status(200).json({ success: true, message: 'Senha alterada com sucesso!' });
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      return res.status(500).json({ error: 'Erro ao alterar senha: ' + err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
