/**
 * API Route: Recolher Bloco
 * POST /api/blocos/[blocoId]/recolher
 * 
 * Marca um bloco como recolhido após o acerto de contas com o vendedor
 */

export default async function handler(req, res) {
    const { query: dbQuery } = await import('../../../../lib/db');
    const { blocoId } = req.query;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        // Validar se o bloco existe
        const blocoResult = await dbQuery(
            'SELECT * FROM blocos WHERE id = ?',
            [blocoId]
        );

        if (!blocoResult.rows || blocoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Bloco não encontrado' });
        }

        const bloco = blocoResult.rows[0];

        // Verificar se o bloco está distribuído
        if (bloco.status !== 'distribuido') {
            return res.status(400).json({
                error: 'Apenas blocos distribuídos podem ser recolhidos'
            });
        }

        // Marcar bloco como recolhido
        await dbQuery(
            'UPDATE blocos SET status = "recolhido", data_recolhimento = NOW() WHERE id = ?',
            [blocoId]
        );

        res.status(200).json({
            success: true,
            message: 'Bloco recolhido com sucesso! Acerto de contas concluído.',
        });

    } catch (error) {
        console.error('Erro ao recolher bloco:', error);
        res.status(500).json({ error: 'Erro ao recolher bloco' });
    }
}
