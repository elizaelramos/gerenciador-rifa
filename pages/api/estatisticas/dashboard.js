/**
 * API Route: Estatísticas do Dashboard
 * GET /api/estatisticas/dashboard
 */

export default async function handler(req, res) {
  const { query } = await import('../../../lib/db');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Total de vendedores ativos
    const vendedoresResult = await query(
      'SELECT COUNT(*) as total FROM vendedores WHERE ativo = TRUE'
    );
    const totalVendedores = vendedoresResult.rows[0]?.total || 0;

    // Total arrecadado (soma de bilhetes vendidos)
    const vendasResult = await query(
      `SELECT
        COUNT(b.id) as total_bilhetes_vendidos,
        SUM(r.valor_bilhete) as total_arrecadado
      FROM bilhetes b
      INNER JOIN rifas r ON b.rifa_id = r.id
      WHERE b.status_venda IN ('pendente', 'confirmado', 'pago')`
    );

    const totalBilhetesVendidos = vendasResult.rows[0]?.total_bilhetes_vendidos || 0;
    const totalArrecadado = parseFloat(vendasResult.rows[0]?.total_arrecadado || 0);

    res.status(200).json({
      vendedores: {
        total: totalVendedores,
      },
      vendas: {
        total_bilhetes: totalBilhetesVendidos,
        total_arrecadado: totalArrecadado,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas do dashboard' });
  }
}
