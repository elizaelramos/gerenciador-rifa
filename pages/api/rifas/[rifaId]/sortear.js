/**
 * API Route: Realizar Sorteio
 * POST /api/rifas/[rifaId]/sortear
 *
 * Recebe um número da Loteria Federal por prêmio e:
 *  1. Extrai a dezena/milhar de cada número
 *  2. Encontra o ganhador por proximidade para cada prêmio
 *  3. Grava na tabela `sorteios`
 *  4. Marca a rifa como 'concluido'
 */

import { query } from '../../../../lib/db';
import { extrairNumeroSorte, encontrarGanhadorPorProximidade } from '../../../../lib/rifaLogic';

export default async function handler(req, res) {
  const { rifaId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Aceita array `numerosLoteria` (um por prêmio) ou campo legado `numero_loteria_federal`
  const { numerosLoteria, numero_loteria_federal } = req.body;

  const numeros = Array.isArray(numerosLoteria) && numerosLoteria.length > 0
    ? numerosLoteria
    : numero_loteria_federal ? [numero_loteria_federal] : [];

  if (numeros.length === 0) {
    return res.status(400).json({ error: 'Informe pelo menos um número da Loteria Federal' });
  }

  try {
    // ── 1. Buscar a rifa ──────────────────────────────────────────────────
    const rifaResult = await query('SELECT * FROM rifas WHERE id = ?', [rifaId]);

    if (!rifaResult.rows || rifaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Rifa não encontrada' });
    }

    const rifa = rifaResult.rows[0];

    if (rifa.status === 'concluido') {
      return res.status(400).json({ error: 'Esta rifa já foi sorteada' });
    }

    // ── 2. Buscar prêmios cadastrados ─────────────────────────────────────
    const premiosResult = await query(
      'SELECT * FROM premios WHERE rifa_id = ? ORDER BY posicao',
      [rifaId]
    );
    const premios = premiosResult.rows || [];
    const totalPremios = Math.min(numeros.length, Math.max(premios.length, 1), 5);

    const maxNum = rifa.tipo_sorteio === 'dezena' ? 99 : 9999;

    // ── 3. Processar cada número / prêmio ────────────────────────────────
    const resultados = [];

    for (let i = 0; i < totalPremios; i++) {
      const numeroLoteria = String(numeros[i] || '').trim();

      if (!numeroLoteria || numeroLoteria.length < 5) {
        return res.status(400).json({
          error: `Número inválido para o ${i + 1}º prêmio. Informe 5 ou 6 dígitos.`
        });
      }

      const numeroSorteado = extrairNumeroSorte(numeroLoteria, rifa.tipo_sorteio);
      const ganhador = await encontrarGanhadorPorProximidade(rifaId, numeroSorteado, maxNum);

      if (!ganhador) {
        return res.status(400).json({
          error: `Nenhum bilhete pago encontrado para o ${i + 1}º prêmio. Realize as vendas antes do sorteio.`
        });
      }

      const premio = premios[i] || null;

      resultados.push({
        posicao: i + 1,
        premio: premio ? { descricao: premio.descricao, valor_estimado: premio.valor_estimado } : null,
        numeroLoteriaFederal: numeroLoteria,
        numeroSorteado: ganhador.numeroSorteadoOriginal,
        numeroGanhador: ganhador.numeroGanhador,
        bilheteId: ganhador.bilheteId,
        ganhador: {
          nome: ganhador.compradorNome,
          telefone: ganhador.compradorTelefone,
        },
        motivo: ganhador.motivo,
        distancia: ganhador.distancia,
      });
    }

    // ── 4. Gravar na tabela `sorteios` ────────────────────────────────────
    const cols = ['rifa_id'];
    const vals = [rifaId];

    for (let i = 0; i < resultados.length; i++) {
      const p = i + 1;
      const r = resultados[i];
      cols.push(
        `resultado_oficial_${p}`,
        `resultado_numero_sorte_${p}`,
        `ganhador_bilhete_id_${p}`
      );
      vals.push(r.numeroLoteriaFederal, r.numeroGanhador, r.bilheteId);
    }

    const placeholders = vals.map(() => '?').join(', ');

    const sorteioExiste = await query(
      'SELECT id FROM sorteios WHERE rifa_id = ?',
      [rifaId]
    );

    if (sorteioExiste.rows && sorteioExiste.rows.length > 0) {
      const updateSets = cols.slice(1).map((c) => `${c} = ?`).join(', ');
      await query(
        `UPDATE sorteios SET ${updateSets} WHERE rifa_id = ?`,
        [...vals.slice(1), rifaId]
      );
    } else {
      await query(
        `INSERT INTO sorteios (${cols.join(', ')}) VALUES (${placeholders})`,
        vals
      );
    }

    // ── 5. Marcar rifa como concluída ─────────────────────────────────────
    await query(`UPDATE rifas SET status = 'concluido' WHERE id = ?`, [rifaId]);

    return res.status(200).json({
      message: 'Sorteio realizado com sucesso!',
      resultados,
      // campo legado para compatibilidade com código que lê `resultado` (singular)
      resultado: resultados[0] || null,
    });

  } catch (error) {
    console.error('Erro ao realizar sorteio:', error);
    return res.status(500).json({ error: 'Erro ao realizar sorteio: ' + error.message });
  }
}
