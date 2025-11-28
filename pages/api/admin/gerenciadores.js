/**
 * API Route: Gerenciamento de Gerenciadores (Admin)
 * GET /api/admin/gerenciadores - Lista gerenciadores
 * POST /api/admin/gerenciadores - Cria novo gerenciador
 */

import { criarGerenciador, listarGerenciadores } from '../../../lib/auth';

export default async function handler(req, res) {
  // GET - Listar gerenciadores
  if (req.method === 'GET') {
    try {
      const gerenciadores = await listarGerenciadores();
      res.status(200).json({ gerenciadores });
    } catch (error) {
      console.error('Erro ao listar gerenciadores:', error);
      res.status(500).json({ error: 'Erro ao listar gerenciadores' });
    }
    return;
  }

  // POST - Criar gerenciador
  if (req.method === 'POST') {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    try {
      const gerenciador = await criarGerenciador({ nome, email, senha });
      res.status(201).json({
        success: true,
        gerenciador,
      });
    } catch (error) {
      console.error('Erro ao criar gerenciador:', error);
      res.status(500).json({ error: error.message || 'Erro ao criar gerenciador' });
    }
    return;
  }

  res.status(405).json({ error: 'Método não permitido' });
}
