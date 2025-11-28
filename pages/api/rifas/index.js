/**
 * API Route: Listar Rifas
 * GET /api/rifas - Lista todas as rifas
 */

import { getAllRifas } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const rifas = await getAllRifas();
    res.status(200).json({ rifas });
  } catch (error) {
    console.error('Erro ao buscar rifas:', error);
    res.status(500).json({ error: 'Erro ao buscar rifas' });
  }
}
