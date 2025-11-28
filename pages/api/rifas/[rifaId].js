/**
 * API Route: Detalhes de uma Rifa
 * GET /api/rifas/[rifaId] - Retorna dados completos de uma rifa
 */

import { getRifa, getPremiosByRifa, getBlocosByRifa, getBilhetesByRifa, query } from '../../../lib/db';

export default async function handler(req, res) {
  const { rifaId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const rifa = await getRifa(parseInt(rifaId));

    if (!rifa) {
      return res.status(404).json({ error: 'Rifa não encontrada' });
    }

    const premios = await getPremiosByRifa(parseInt(rifaId));
    const bilhetes = await getBilhetesByRifa(parseInt(rifaId));

    // Buscar blocos com informações de vendedor
    const blocosResult = await query(
      `SELECT b.*, v.nome as vendedor_nome, v.telefone as vendedor_telefone
       FROM blocos b
       LEFT JOIN vendedores v ON b.vendedor_id = v.id
       WHERE b.rifa_id = ?
       ORDER BY b.numero`,
      [parseInt(rifaId)]
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
