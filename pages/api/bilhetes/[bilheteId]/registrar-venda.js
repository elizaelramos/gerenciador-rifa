/**
 * API Route: Registrar Venda de Bilhete
 * POST /api/bilhetes/[bilheteId]/registrar-venda
 */

export default async function handler(req, res) {
  const { query } = await import('../../../../lib/db');
  const { bilheteId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { vendedor_id, comprador_nome, comprador_telefone, observacao, confirmar_auto_cadastro } = req.body;

    // Validações
    if (!comprador_nome || !comprador_telefone) {
      return res.status(400).json({ error: 'Nome e telefone do comprador são obrigatórios' });
    }

    // Validar formato do telefone
    const numeros = comprador_telefone.replace(/\D/g, '');
    if (numeros.length !== 10 && numeros.length !== 11) {
      return res.status(400).json({ error: 'Telefone do comprador deve ter 10 ou 11 dígitos (incluindo DDD)' });
    }

    const ddd = parseInt(numeros.slice(0, 2));
    if (ddd < 11 || ddd > 99) {
      return res.status(400).json({ error: 'DDD inválido' });
    }

    // Verificar se o bilhete existe
    const bilheteResult = await query(
      'SELECT * FROM bilhetes WHERE id = ?',
      [bilheteId]
    );

    if (!bilheteResult.rows || bilheteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bilhete não encontrado' });
    }

    const bilhete = bilheteResult.rows[0];

    // Se não estiver confirmando auto-cadastro, verificar se já foi vendido
    if (!confirmar_auto_cadastro && bilhete.status_venda !== 'nao_vendido') {
      return res.status(400).json({ error: 'Este bilhete já foi vendido' });
    }

    // Verificar se o vendedor existe (se fornecido)
    if (vendedor_id) {
      const vendedorResult = await query(
        'SELECT * FROM vendedores WHERE id = ? AND ativo = TRUE',
        [vendedor_id]
      );

      if (!vendedorResult.rows || vendedorResult.rows.length === 0) {
        return res.status(404).json({ error: 'Vendedor não encontrado ou inativo' });
      }
    }

    // Registrar ou atualizar a venda
    // Se confirmar_auto_cadastro = true, marca auto_cadastro como FALSE (confirmado pelo vendedor)
    // Status: 'confirmado' quando vendedor registra/confirma
    await query(
      `UPDATE bilhetes
       SET status_venda = 'pago',
           comprador_nome = ?,
           comprador_telefone = ?,
           observacao = ?,
           vendedor_id = ?,
           auto_cadastro = ?,
           data_venda = NOW()
       WHERE id = ?`,
      [
        comprador_nome,
        comprador_telefone,
        observacao || null,
        vendedor_id || null,
        confirmar_auto_cadastro ? false : bilhete.auto_cadastro || false,
        bilheteId
      ]
    );

    res.status(200).json({
      success: true,
      message: confirmar_auto_cadastro ? 'Cadastro confirmado com sucesso!' : 'Venda registrada com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    res.status(500).json({ error: 'Erro ao registrar venda do bilhete' });
  }
}
