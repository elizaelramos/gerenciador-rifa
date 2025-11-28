/**
 * API Route: Relatório Geral
 * GET /api/relatorios/geral
 */

export default async function handler(req, res) {
  const { query } = await import('../../../lib/db');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // ==========================================
    // 1. ESTATÍSTICAS DE VENDAS
    // ==========================================
    const vendasResult = await query(
      `SELECT
        COUNT(CASE WHEN status_venda IN ('pendente', 'confirmado', 'pago') THEN 1 END) as total_bilhetes,
        SUM(CASE WHEN status_venda IN ('pendente', 'confirmado', 'pago') THEN r.valor_bilhete ELSE 0 END) as total_arrecadado,
        COUNT(CASE WHEN status_venda = 'pendente' THEN 1 END) as bilhetes_pendentes,
        COUNT(CASE WHEN status_venda = 'confirmado' THEN 1 END) as bilhetes_confirmados
      FROM bilhetes b
      INNER JOIN rifas r ON b.rifa_id = r.id`
    );

    const vendas = {
      total_bilhetes: parseInt(vendasResult.rows[0]?.total_bilhetes || 0),
      total_arrecadado: parseFloat(vendasResult.rows[0]?.total_arrecadado || 0),
      bilhetes_pendentes: parseInt(vendasResult.rows[0]?.bilhetes_pendentes || 0),
      bilhetes_confirmados: parseInt(vendasResult.rows[0]?.bilhetes_confirmados || 0),
    };

    // ==========================================
    // 2. ESTATÍSTICAS DE VENDEDORES
    // ==========================================

    // Total de vendedores
    const vendedoresTotalResult = await query(
      'SELECT COUNT(*) as total FROM vendedores WHERE ativo = TRUE'
    );
    const totalVendedores = parseInt(vendedoresTotalResult.rows[0]?.total || 0);

    // Vendedores com vendas
    const vendedoresComVendasResult = await query(
      `SELECT COUNT(DISTINCT vendedor_id) as total
       FROM bilhetes
       WHERE status_venda IN ('pendente', 'confirmado', 'pago')
       AND vendedor_id IS NOT NULL`
    );
    const vendedoresComVendas = parseInt(vendedoresComVendasResult.rows[0]?.total || 0);

    // Ranking de vendedores
    const rankingResult = await query(
      `SELECT
        v.id,
        v.nome,
        v.telefone,
        COUNT(b.id) as total_vendas,
        SUM(r.valor_bilhete) as total_arrecadado
      FROM vendedores v
      LEFT JOIN bilhetes b ON v.id = b.vendedor_id AND b.status_venda IN ('pendente', 'confirmado', 'pago')
      LEFT JOIN rifas r ON b.rifa_id = r.id
      WHERE v.ativo = TRUE
      GROUP BY v.id, v.nome, v.telefone
      HAVING COUNT(b.id) > 0
      ORDER BY total_vendas DESC, total_arrecadado DESC
      LIMIT 10`
    );

    const ranking = (rankingResult.rows || []).map(v => ({
      id: v.id,
      nome: v.nome,
      telefone: v.telefone,
      total_vendas: parseInt(v.total_vendas || 0),
      total_arrecadado: parseFloat(v.total_arrecadado || 0),
    }));

    const vendedores = {
      total: totalVendedores,
      com_vendas: vendedoresComVendas,
      sem_vendas: totalVendedores - vendedoresComVendas,
      ranking,
    };

    // ==========================================
    // 3. ESTATÍSTICAS DE RIFAS
    // ==========================================

    // Contagem geral de rifas
    const rifasCountResult = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status != 'concluido' THEN 1 END) as ativas,
        COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidas
      FROM rifas`
    );

    const rifasCount = {
      total: parseInt(rifasCountResult.rows[0]?.total || 0),
      ativas: parseInt(rifasCountResult.rows[0]?.ativas || 0),
      concluidas: parseInt(rifasCountResult.rows[0]?.concluidas || 0),
    };

    // Detalhes por rifa
    const rifasDetalhesResult = await query(
      `SELECT
        r.id,
        r.titulo,
        r.data_sorteio,
        r.status,
        r.qtde_bilhetes as total_bilhetes,
        r.valor_bilhete,
        COUNT(CASE WHEN b.status_venda IN ('pendente', 'confirmado', 'pago') THEN 1 END) as bilhetes_vendidos,
        SUM(CASE WHEN b.status_venda IN ('pendente', 'confirmado', 'pago') THEN r.valor_bilhete ELSE 0 END) as total_arrecadado
      FROM rifas r
      LEFT JOIN bilhetes b ON r.id = b.rifa_id
      GROUP BY r.id, r.titulo, r.data_sorteio, r.status, r.qtde_bilhetes, r.valor_bilhete
      ORDER BY r.id DESC`
    );

    const rifasDetalhes = (rifasDetalhesResult.rows || []).map(rifa => ({
      id: rifa.id,
      titulo: rifa.titulo,
      data_sorteio: rifa.data_sorteio,
      status: rifa.status,
      total_bilhetes: parseInt(rifa.total_bilhetes || 0),
      valor_bilhete: parseFloat(rifa.valor_bilhete || 0),
      bilhetes_vendidos: parseInt(rifa.bilhetes_vendidos || 0),
      total_arrecadado: parseFloat(rifa.total_arrecadado || 0),
    }));

    const rifas = {
      ...rifasCount,
      detalhes: rifasDetalhes,
    };

    // ==========================================
    // RESPOSTA FINAL
    // ==========================================
    res.status(200).json({
      vendas,
      vendedores,
      rifas,
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}
