/**
 * API Route: Auto-cadastro do Comprador
 * POST /api/bilhetes/[bilheteId]/auto-cadastro
 */

export default async function handler(req, res) {
  const { query } = await import('../../../../lib/db');
  const { bilheteId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { nome, telefone, observacao } = req.body;

  // Validar campos obrigatórios
  if (!nome || !telefone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }

  // Validar formato do telefone
  const numeros = telefone.replace(/\D/g, '');
  if (numeros.length !== 10 && numeros.length !== 11) {
    return res.status(400).json({ error: 'Telefone inválido. Use o formato: DD XXXXX-XXXX' });
  }

  const ddd = parseInt(numeros.slice(0, 2));
  if (ddd < 11 || ddd > 99) {
    return res.status(400).json({ error: 'DDD inválido' });
  }

  try {
    // Verificar se o bilhete existe
    const bilheteResult = await query(
      'SELECT * FROM bilhetes WHERE id = ?',
      [bilheteId]
    );

    if (!bilheteResult.rows || bilheteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bilhete não encontrado' });
    }

    const bilhete = bilheteResult.rows[0];

    // Verificar se o bilhete já foi vendido
    if (bilhete.status_venda !== 'nao_vendido') {
      return res.status(400).json({
        error: 'Este bilhete já possui um cadastro',
        bilhete: {
          comprador_nome: bilhete.comprador_nome,
          comprador_telefone: bilhete.comprador_telefone,
        }
      });
    }

    // Registrar o auto-cadastro (status pendente para aprovação do vendedor)
    await query(
      `UPDATE bilhetes
       SET status_venda = 'pendente',
           comprador_nome = ?,
           comprador_telefone = ?,
           observacao = ?,
           auto_cadastro = TRUE,
           data_venda = NOW()
       WHERE id = ?`,
      [nome, telefone, observacao || null, bilheteId]
    );

    res.status(200).json({
      success: true,
      message: 'Auto-cadastro realizado com sucesso! Aguarde a confirmação do vendedor.',
    });
  } catch (error) {
    console.error('Erro ao realizar auto-cadastro:', error);
    res.status(500).json({ error: 'Erro ao realizar auto-cadastro' });
  }
}
