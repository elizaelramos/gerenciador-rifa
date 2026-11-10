/**
 * API Route: Listar Rifas
 * GET /api/rifas
 *  - admin: todas as rifas
 *  - gerenciador: apenas as rifas dele
 *  - visitante (sem login): rifas públicas (fora de preparação)
 */

import { query } from '../../../lib/db';
import { getUsuario, isAdmin } from '../../../lib/session';

// Dados extras para os cards: prêmio principal, total de prêmios e bilhetes vendidos
const SELECT_RIFAS = `
  SELECT r.*,
    (SELECT p.descricao FROM premios p WHERE p.rifa_id = r.id ORDER BY p.posicao LIMIT 1) AS premio_principal,
    (SELECT p.imagem_url FROM premios p WHERE p.rifa_id = r.id ORDER BY p.posicao LIMIT 1) AS premio_principal_imagem,
    (SELECT COUNT(*) FROM premios p WHERE p.rifa_id = r.id) AS total_premios,
    (SELECT COUNT(*) FROM bilhetes b WHERE b.rifa_id = r.id AND b.status_venda <> 'nao_vendido') AS bilhetes_vendidos
  FROM rifas r`;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const usuario = await getUsuario(req);

    let result;
    if (isAdmin(usuario)) {
      result = await query(`${SELECT_RIFAS} ORDER BY r.created_at DESC`);
    } else if (usuario) {
      result = await query(
        `${SELECT_RIFAS} WHERE r.gerenciador_id = ? ORDER BY r.created_at DESC`,
        [usuario.id]
      );
    } else {
      result = await query(
        `${SELECT_RIFAS} WHERE r.status <> 'preparacao' ORDER BY r.created_at DESC`
      );
    }

    res.status(200).json({ rifas: result.rows || [] });
  } catch (error) {
    console.error('Erro ao buscar rifas:', error);
    res.status(500).json({ error: 'Erro ao buscar rifas' });
  }
}
