/**
 * API Route: Buscar Bilhete por Número
 * GET /api/bilhetes-validacao/[numero]?rifaId=X
 */

export default async function handler(req, res) {
  const { numero, rifaId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!rifaId || !numero) {
    return res.status(400).json({ error: 'rifaId e numero são obrigatórios' });
  }

  try {
    const { query } = await import('../../../lib/db');

    // Buscar bilhete
    const bilheteResult = await query(
      `SELECT b.* FROM bilhetes b
       WHERE b.rifa_id = ? AND b.numero_sorte = ?`,
      [parseInt(rifaId), numero]
    );

    if (!bilheteResult.rows || bilheteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bilhete não encontrado' });
    }

    const bilhete = bilheteResult.rows[0];

    // Buscar informações do vendedor se existir
    let vendedor = null;
    if (bilhete.vendedor_id) {
      const vendedorResult = await query(
        'SELECT * FROM vendedores WHERE id = ?',
        [bilhete.vendedor_id]
      );
      vendedor = vendedorResult.rows[0] || null;
    }

    // Buscar informações do sorteio se existir
    let sorteio = null;
    const sorteioResult = await query(
      'SELECT * FROM sorteios WHERE rifa_id = ?',
      [parseInt(rifaId)]
    );
    sorteio = sorteioResult.rows[0] || null;

    res.status(200).json({
      bilhete,
      vendedor,
      sorteio,
    });

  } catch (error) {
    console.error('Erro ao buscar bilhete:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do bilhete' });
  }
}
