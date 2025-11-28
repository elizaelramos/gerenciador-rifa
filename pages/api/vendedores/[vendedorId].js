/**
 * API Route: Gerenciar Vendedor Específico
 * PUT /api/vendedores/[vendedorId] - Atualiza um vendedor
 * DELETE /api/vendedores/[vendedorId] - Desativa um vendedor
 */

export default async function handler(req, res) {
  const { query } = await import('../../../lib/db');
  const { vendedorId } = req.query;

  if (req.method === 'PUT') {
    try {
      const { nome, telefone, bloco_id, ativo } = req.body;

      // Validações
      if (!nome || !telefone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
      }

      // Validar formato do telefone
      const numeros = telefone.replace(/\D/g, '');
      if (numeros.length !== 10 && numeros.length !== 11) {
        return res.status(400).json({ error: 'Telefone deve ter 10 ou 11 dígitos (incluindo DDD)' });
      }

      const ddd = parseInt(numeros.slice(0, 2));
      if (ddd < 11 || ddd > 99) {
        return res.status(400).json({ error: 'DDD inválido' });
      }

      // Verificar se o telefone já pertence a outro vendedor
      const checkResult = await query(
        'SELECT id FROM vendedores WHERE telefone = ? AND id != ? AND ativo = TRUE',
        [telefone, vendedorId]
      );

      if (checkResult.rows && checkResult.rows.length > 0) {
        return res.status(400).json({ error: 'Já existe outro vendedor com este telefone' });
      }

      // Atualizar vendedor
      await query(
        'UPDATE vendedores SET nome = ?, telefone = ?, bloco_id = ?, ativo = ? WHERE id = ?',
        [nome, telefone, bloco_id || null, ativo !== undefined ? ativo : true, vendedorId]
      );

      res.status(200).json({
        success: true,
        message: 'Vendedor atualizado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao atualizar vendedor:', error);
      res.status(500).json({ error: 'Erro ao atualizar vendedor' });
    }
  }

  else if (req.method === 'DELETE') {
    try {
      // Desativar vendedor (soft delete)
      await query(
        'UPDATE vendedores SET ativo = FALSE WHERE id = ?',
        [vendedorId]
      );

      res.status(200).json({
        success: true,
        message: 'Vendedor desativado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao desativar vendedor:', error);
      res.status(500).json({ error: 'Erro ao desativar vendedor' });
    }
  }

  else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
