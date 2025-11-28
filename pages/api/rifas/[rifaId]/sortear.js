/**
 * API Route: Realizar Sorteio
 * POST /api/rifas/[rifaId]/sortear
 */

import { query } from '../../../../lib/db';
import { extrairNumeroSorte, encontrarGanhadorPorProximidade } from '../../../../lib/rifaLogic';

export default async function handler(req, res) {
    const { rifaId } = req.query;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { numero_loteria_federal } = req.body;

    if (!numero_loteria_federal) {
        return res.status(400).json({ error: 'Número da Loteria Federal é obrigatório' });
    }

    try {
        // Buscar dados da rifa
        const rifaResult = await query('SELECT * FROM rifas WHERE id = ?', [rifaId]);

        if (!rifaResult.rows || rifaResult.rows.length === 0) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        const rifa = rifaResult.rows[0];

        // Verificar se a rifa já foi sorteada
        if (rifa.status === 'concluido') {
            return res.status(400).json({ error: 'Esta rifa já foi sorteada' });
        }

        // Extrair número da sorte baseado no tipo de sorteio
        const numeroSorteado = extrairNumeroSorte(numero_loteria_federal, rifa.tipo_sorteio);
        const maxNum = rifa.tipo_sorteio === 'dezena' ? 99 : 9999;

        // Encontrar o ganhador
        const ganhador = await encontrarGanhadorPorProximidade(rifaId, numeroSorteado, maxNum);

        if (!ganhador) {
            return res.status(400).json({
                error: 'Nenhum bilhete pago encontrado. Não é possível realizar o sorteio.'
            });
        }

        // Atualizar a rifa com o resultado
        await query(
            `UPDATE rifas 
       SET status = 'concluido',
           numero_sorteado = ?,
           numero_ganhador = ?,
           bilhete_ganhador_id = ?,
           numero_loteria_federal = ?,
           data_resultado = NOW()
       WHERE id = ?`,
            [
                ganhador.numeroSorteadoOriginal,
                ganhador.numeroGanhador,
                ganhador.bilheteId,
                numero_loteria_federal,
                rifaId
            ]
        );

        res.status(200).json({
            message: 'Sorteio realizado com sucesso!',
            resultado: {
                numeroLoteriaFederal: numero_loteria_federal,
                numeroSorteado: ganhador.numeroSorteadoOriginal,
                numeroGanhador: ganhador.numeroGanhador,
                bilheteId: ganhador.bilheteId,
                ganhador: {
                    nome: ganhador.compradorNome,
                    telefone: ganhador.compradorTelefone,
                },
                motivo: ganhador.motivo,
                distancia: ganhador.distancia,
            }
        });

    } catch (error) {
        console.error('Erro ao realizar sorteio:', error);
        res.status(500).json({ error: 'Erro ao realizar sorteio' });
    }
}
