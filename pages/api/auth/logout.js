/**
 * API Route: Logout
 * POST /api/auth/logout - Apaga o cookie de sessão
 */

import { encerrarSessao } from '../../../lib/session';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  encerrarSessao(res);
  res.status(200).json({ success: true });
}
