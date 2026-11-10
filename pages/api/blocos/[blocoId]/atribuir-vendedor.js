/**
 * API Route: Atribuir Vendedor ao Bloco
 * POST /api/blocos/[blocoId]/atribuir-vendedor
 */

import { getUsuario, podeGerenciarRifa } from '../../../../lib/session';

export default async function handler(req, res) {
  const { query: dbQuery } = await import('../../../../lib/db');
  const { blocoId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { vendedor_id } = req.body;

    // Validar se o bloco existe
    const blocoResult = await dbQuery(
      'SELECT * FROM blocos WHERE id = ?',
      [blocoId]
    );

    if (!blocoResult.rows || blocoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bloco não encontrado' });
    }

    const bloco = blocoResult.rows[0];

    const rifaResult = await dbQuery('SELECT * FROM rifas WHERE id = ?', [bloco.rifa_id]);
    const rifa = rifaResult.rows[0];

    // O dono da rifa (ou admin) pode trocar/remover o vendedor de qualquer bloco.
    // Sem ser dono, só é permitido o auto-cadastro pelo QR code: atribuir um
    // vendedor a um bloco que ainda não tem nenhum.
    const usuario = await getUsuario(req);
    const ehDono = podeGerenciarRifa(usuario, rifa);
    if (!ehDono && (vendedor_id === null || vendedor_id === undefined || bloco.vendedor_id)) {
      return res.status(usuario ? 403 : 401).json({
        error: usuario ? 'Esta rifa pertence a outro gerenciador' : 'Faça login para continuar',
      });
    }

    // Se vendedor_id for null, estamos removendo o vendedor
    if (vendedor_id === null) {
      await dbQuery(
        'UPDATE blocos SET vendedor_id = NULL, status = "disponivel", data_distribuicao = NULL WHERE id = ?',
        [blocoId]
      );

      // Remover vendedor de todos os bilhetes deste bloco
      await dbQuery(
        'UPDATE bilhetes SET vendedor_id = NULL WHERE bloco_id = ?',
        [blocoId]
      );

      return res.status(200).json({
        success: true,
        message: 'Vendedor removido do bloco com sucesso!',
      });
    }

    // Validar se o vendedor existe e está ativo
    const vendedorResult = await dbQuery(
      'SELECT * FROM vendedores WHERE id = ? AND ativo = TRUE',
      [vendedor_id]
    );

    if (!vendedorResult.rows || vendedorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendedor não encontrado ou inativo' });
    }

    // O vendedor precisa ser do mesmo gerenciador dono da rifa
    if (vendedorResult.rows[0].gerenciador_id !== rifa.gerenciador_id) {
      return res.status(403).json({ error: 'Este vendedor pertence a outro gerenciador' });
    }

    // Atribuir vendedor ao bloco
    await dbQuery(
      'UPDATE blocos SET vendedor_id = ?, status = "distribuido", data_distribuicao = NOW() WHERE id = ?',
      [vendedor_id, blocoId]
    );

    // Atualizar status da rifa para 'distribuido' se estiver em 'preparacao'
    await dbQuery(
      'UPDATE rifas SET status = "distribuido" WHERE id = ? AND status = "preparacao"',
      [bloco.rifa_id]
    );

    // Atribuir vendedor a todos os bilhetes deste bloco
    await dbQuery(
      'UPDATE bilhetes SET vendedor_id = ? WHERE bloco_id = ?',
      [vendedor_id, blocoId]
    );

    // Também atualizar o bloco_id do vendedor (opcional, mas útil para referência)
    await dbQuery(
      'UPDATE vendedores SET bloco_id = ? WHERE id = ?',
      [blocoId, vendedor_id]
    );

    res.status(200).json({
      success: true,
      message: 'Vendedor atribuído ao bloco com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao atribuir vendedor:', error);
    res.status(500).json({ error: 'Erro ao atribuir vendedor ao bloco' });
  }
}
