/**
 * API Route: Publicar Rifa
 * POST /api/rifas/[rifaId]/publicar - Abre as vendas (preparacao -> distribuido)
 * para a rifa aparecer na página pública, mesmo sem blocos distribuídos.
 */

import { query } from '../../../../lib/db';
import { exigirRifaDoUsuario } from '../../../../lib/session';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const acesso = await exigirRifaDoUsuario(req, res, req.query.rifaId);
    if (!acesso) return;
    const { rifa } = acesso;

    if (rifa.status !== 'preparacao') {
      return res.status(400).json({ error: 'Esta rifa já está publicada' });
    }

    await query(
      "UPDATE rifas SET status = 'distribuido' WHERE id = ? AND status = 'preparacao'",
      [rifa.id]
    );

    return res.status(200).json({ success: true, message: 'Rifa publicada! Ela já aparece na página inicial.' });
  } catch (error) {
    console.error('Erro ao publicar rifa:', error);
    return res.status(500).json({ error: 'Erro ao publicar rifa' });
  }
}
