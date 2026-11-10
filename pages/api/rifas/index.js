/**
 * API Route: Listar Rifas
 * GET /api/rifas
 *  - admin: todas as rifas
 *  - gerenciador: apenas as rifas dele
 *  - visitante (sem login): rifas públicas (fora de preparação)
 */

import { query } from '../../../lib/db';
import { getUsuario, isAdmin } from '../../../lib/session';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const usuario = await getUsuario(req);

    let result;
    if (isAdmin(usuario)) {
      result = await query('SELECT * FROM rifas ORDER BY created_at DESC');
    } else if (usuario) {
      result = await query(
        'SELECT * FROM rifas WHERE gerenciador_id = ? ORDER BY created_at DESC',
        [usuario.id]
      );
    } else {
      result = await query(
        "SELECT * FROM rifas WHERE status <> 'preparacao' ORDER BY created_at DESC"
      );
    }

    res.status(200).json({ rifas: result.rows || [] });
  } catch (error) {
    console.error('Erro ao buscar rifas:', error);
    res.status(500).json({ error: 'Erro ao buscar rifas' });
  }
}
