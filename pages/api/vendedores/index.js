/**
 * API Route: Gerenciar Vendedores
 *
 * GET /api/vendedores
 *  - logado: vendedores do gerenciador (admin: todos)
 * GET /api/vendedores?rifaId=X
 *  - dono da rifa / admin: vendedores do dono da rifa (para atribuir blocos)
 *  - visitante: nome e telefone dos vendedores com bloco nesta rifa (contato público)
 *
 * POST /api/vendedores - Cria um novo vendedor
 *  - logado: o vendedor pertence ao dono da rifa informada em `rifa_id`
 *    (se o usuário puder gerenciá-la) ou ao próprio usuário
 *  - visitante (auto-cadastro pelo QR code): exige `bloco_id` de um bloco
 *    ainda sem vendedor; o vendedor pertence ao dono da rifa desse bloco
 */

import { query } from '../../../lib/db';
import {
  getUsuario,
  isAdmin,
  podeGerenciarRifa,
  buscarRifa,
} from '../../../lib/session';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const usuario = await getUsuario(req);
      const { rifaId } = req.query;

      if (rifaId) {
        const rifa = await buscarRifa(rifaId);
        if (!rifa) {
          return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        if (podeGerenciarRifa(usuario, rifa)) {
          const result = await query(
            `SELECT v.*, b.numero as bloco_numero, r.titulo as rifa_titulo
             FROM vendedores v
             LEFT JOIN blocos b ON v.bloco_id = b.id
             LEFT JOIN rifas r ON b.rifa_id = r.id
             WHERE v.gerenciador_id <=> ?
             ORDER BY v.nome`,
            [rifa.gerenciador_id]
          );
          return res.status(200).json({ vendedores: result.rows || [] });
        }

        // Visitante: só o contato de quem está vendendo esta rifa
        const result = await query(
          `SELECT DISTINCT v.id, v.nome, v.telefone, v.ativo
           FROM vendedores v
           INNER JOIN blocos b ON b.vendedor_id = v.id
           WHERE b.rifa_id = ? AND v.ativo = TRUE
           ORDER BY v.nome`,
          [rifa.id]
        );
        return res.status(200).json({ vendedores: result.rows || [] });
      }

      if (!usuario) {
        return res.status(401).json({ error: 'Faça login para continuar' });
      }

      const admin = isAdmin(usuario);
      const result = await query(
        `SELECT v.*, b.numero as bloco_numero, r.titulo as rifa_titulo
         FROM vendedores v
         LEFT JOIN blocos b ON v.bloco_id = b.id
         LEFT JOIN rifas r ON b.rifa_id = r.id
         ${admin ? '' : 'WHERE v.gerenciador_id = ?'}
         ORDER BY v.data_cadastro DESC`,
        admin ? [] : [usuario.id]
      );

      res.status(200).json({
        vendedores: result.rows || [],
      });
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
      res.status(500).json({ error: 'Erro ao buscar vendedores' });
    }
  }

  else if (req.method === 'POST') {
    try {
      const { nome, telefone, bloco_id, rifa_id } = req.body;

      // Validações
      if (!nome || !telefone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
      }

      // Validar formato do telefone
      const numeros = telefone.replace(/\D/g, '');
      if (numeros.length !== 10 && numeros.length !== 11) {
        return res.status(400).json({ error: 'Telefone deve ter 10 ou 11 dígitos (incluindo DDD)' });
      }

      const ddd = parseInt(numeros.slice(0, 2));
      if (ddd < 11 || ddd > 99) {
        return res.status(400).json({ error: 'DDD inválido' });
      }

      // Definir o dono do vendedor
      const usuario = await getUsuario(req);
      let gerenciadorId;

      if (usuario) {
        gerenciadorId = usuario.id;
        if (rifa_id) {
          const rifa = await buscarRifa(rifa_id);
          if (!rifa) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
          }
          if (!podeGerenciarRifa(usuario, rifa)) {
            return res.status(403).json({ error: 'Esta rifa pertence a outro gerenciador' });
          }
          gerenciadorId = rifa.gerenciador_id;
        }
      } else {
        // Auto-cadastro pelo QR code: só para um bloco que ainda não tem vendedor
        if (!bloco_id) {
          return res.status(401).json({ error: 'Faça login para continuar' });
        }
        const blocoResult = await query(
          `SELECT b.vendedor_id, r.gerenciador_id
           FROM blocos b INNER JOIN rifas r ON b.rifa_id = r.id
           WHERE b.id = ?`,
          [bloco_id]
        );
        const bloco = blocoResult.rows?.[0];
        if (!bloco) {
          return res.status(404).json({ error: 'Bloco não encontrado' });
        }
        if (bloco.vendedor_id) {
          return res.status(403).json({ error: 'Este bloco já tem um vendedor' });
        }
        gerenciadorId = bloco.gerenciador_id;
      }

      // Verificar se já existe vendedor com esse telefone
      const checkResult = await query(
        'SELECT id FROM vendedores WHERE telefone = ? AND ativo = TRUE',
        [telefone]
      );

      if (checkResult.rows && checkResult.rows.length > 0) {
        return res.status(400).json({ error: 'Já existe um vendedor cadastrado com este telefone' });
      }

      // Criar vendedor
      const result = await query(
        'INSERT INTO vendedores (gerenciador_id, nome, telefone, bloco_id, ativo) VALUES (?, ?, ?, ?, TRUE)',
        [gerenciadorId, nome, telefone, bloco_id || null]
      );

      res.status(201).json({
        success: true,
        vendedor: {
          id: result.rows.insertId,
          nome,
          telefone,
          bloco_id: bloco_id || null,
          ativo: true,
        },
        message: 'Vendedor cadastrado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao criar vendedor:', error);
      res.status(500).json({ error: 'Erro ao cadastrar vendedor' });
    }
  }

  else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
