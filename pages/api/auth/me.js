/**
 * API Route: Usuário logado
 * GET /api/auth/me - Retorna o usuário da sessão ou 401
 */

import { exigirLogin } from '../../../lib/session';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const usuario = await exigirLogin(req, res);
  if (!usuario) return;
  res.status(200).json({ usuario });
}
