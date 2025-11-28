/**
 * API Route: Detalhes de um Bilhete
 * GET /api/bilhetes/[bilheteId] - Retorna dados completos de um bilhete
 */

export default async function handler(req, res) {
  const { query } = await import('../../../lib/db');
  const { bilheteId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Buscar bilhete com informações de rifa, bloco e vendedor
    const result = await query(
      `SELECT
        b.*,
        r.titulo as rifa_titulo,
        r.descricao as rifa_descricao,
        r.valor_bilhete as rifa_valor_bilhete,
        r.data_sorteio as rifa_data_sorteio,
        bl.id as bloco_id,
        bl.numero as bloco_numero,
        bl.vendedor_id as bloco_vendedor_id,
        v.id as vendedor_id,
        v.nome as vendedor_nome,
        v.telefone as vendedor_telefone
      FROM bilhetes b
      INNER JOIN rifas r ON b.rifa_id = r.id
      INNER JOIN blocos bl ON b.bloco_id = bl.id
      LEFT JOIN vendedores v ON bl.vendedor_id = v.id
      WHERE b.id = ?`,
      [bilheteId]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Bilhete não encontrado' });
    }

    const bilhete = result.rows[0];

    // Buscar prêmios da rifa
    const premiosResult = await query(
      'SELECT * FROM premios WHERE rifa_id = ? ORDER BY posicao',
      [bilhete.rifa_id]
    );

    // Montar resposta estruturada
    const response = {
      bilhete: {
        id: bilhete.id,
        numero_sorte: bilhete.numero_sorte,
        status_venda: bilhete.status_venda,
        comprador_nome: bilhete.comprador_nome,
        comprador_telefone: bilhete.comprador_telefone,
        observacao: bilhete.observacao,
        data_venda: bilhete.data_venda,
        auto_cadastro: bilhete.auto_cadastro, // Incluindo campo auto_cadastro
      },
      rifa: {
        id: bilhete.rifa_id,
        titulo: bilhete.rifa_titulo,
        descricao: bilhete.rifa_descricao,
        valor_bilhete: bilhete.rifa_valor_bilhete,
        data_sorteio: bilhete.rifa_data_sorteio,
      },
      premios: premiosResult.rows || [],
      bloco: {
        id: bilhete.bloco_id,
        numero: bilhete.bloco_numero,
        vendedor_id: bilhete.bloco_vendedor_id,
      },
      vendedor: bilhete.vendedor_id ? {
        id: bilhete.vendedor_id,
        nome: bilhete.vendedor_nome,
        telefone: bilhete.vendedor_telefone,
      } : null,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Erro ao buscar bilhete:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do bilhete' });
  }
}
