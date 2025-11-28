/**
 * API Route: Criar Rifa Completa
 * POST /api/rifas/criar
 *
 * Cria a rifa, prêmios, blocos e todos os bilhetes com números aleatórios
 */

import fs from 'fs';
import path from 'path';
import { gerarNumerosAleatorios } from '../../../lib/rifaLogic';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const {
    titulo,
    descricao,
    logo_url,
    qtde_bilhetes,
    tipo_sorteio,
    qtde_blocos,
    valor_bilhete,
    data_sorteio,
    premios,
    gerenciador_id,
  } = req.body;

  // Validações
  if (!titulo || !qtde_bilhetes || !qtde_blocos || !valor_bilhete || !data_sorteio) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  if (qtde_bilhetes < 10) {
    return res.status(400).json({ error: 'Quantidade mínima de bilhetes é 10' });
  }

  if (qtde_blocos > qtde_bilhetes) {
    return res.status(400).json({ error: 'Quantidade de blocos não pode ser maior que bilhetes' });
  }

  if (!premios || premios.length === 0) {
    return res.status(400).json({ error: 'Adicione pelo menos um prêmio' });
  }

  try {
    const { query } = await import('../../../lib/db');

    // Tratar upload da logo (Base64 -> Arquivo)
    let dbLogoUrl = logo_url;
    if (logo_url && logo_url.startsWith('data:image')) {
      try {
        // Criar diretório de uploads se não existir
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Gerar nome único
        const filename = `logo-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filePath = path.join(uploadDir, filename);

        // Remover prefixo data:image/jpeg;base64,
        const base64Data = logo_url.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Salvar arquivo
        fs.writeFileSync(filePath, buffer);

        // Atualizar URL para salvar no banco
        dbLogoUrl = `/uploads/${filename}`;
      } catch (err) {
        console.error('Erro ao salvar imagem da logo:', err);
        // Em caso de erro, salvamos null ou a string original (que falhará se for longa)
        // Vamos optar por null para garantir que a rifa seja criada
        dbLogoUrl = null;
      }
    }

    // 1. Criar a rifa
    const bilhetes_por_bloco = Math.ceil(qtde_bilhetes / qtde_blocos);

    const resultRifa = await query(
      `INSERT INTO rifas (titulo, descricao, logo_url, qtde_bilhetes, tipo_sorteio, qtde_blocos,
                          bilhetes_por_bloco, valor_bilhete, data_sorteio, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descricao, dbLogoUrl || null, qtde_bilhetes, tipo_sorteio, qtde_blocos,
        bilhetes_por_bloco, valor_bilhete, data_sorteio, 'preparacao']
    );

    const rifaId = resultRifa.rows.insertId;

    // 2. Criar prêmios
    for (const premio of premios) {
      let dbImagemUrl = null;

      // Tratar imagem do prêmio
      if (premio.imagem && premio.imagem.startsWith('data:image')) {
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          const filename = `premio-${rifaId}-${premio.posicao}-${Date.now()}.jpg`;
          const filePath = path.join(uploadDir, filename);

          const base64Data = premio.imagem.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');

          fs.writeFileSync(filePath, buffer);
          dbImagemUrl = `/uploads/${filename}`;
        } catch (err) {
          console.error(`Erro ao salvar imagem do prêmio ${premio.posicao}:`, err);
        }
      }

      await query(
        'INSERT INTO premios (rifa_id, posicao, descricao, valor_estimado, imagem_url) VALUES (?, ?, ?, ?, ?)',
        [rifaId, premio.posicao, premio.descricao, premio.valor_estimado || null, dbImagemUrl]
      );
    }

    // 3. Criar blocos
    const blocos = [];
    for (let i = 1; i <= qtde_blocos; i++) {
      const resultBloco = await query(
        'INSERT INTO blocos (rifa_id, numero, qtde_cartoes, status) VALUES (?, ?, ?, ?)',
        [rifaId, i, bilhetes_por_bloco, 'disponivel']
      );
      blocos.push({ id: resultBloco.rows.insertId, numero: i });
    }

    // 4. Gerar números aleatórios e criar bilhetes
    console.log('Gerando números aleatórios...');
    const numerosAleatorios = gerarNumerosAleatorios(qtde_bilhetes, qtde_blocos, tipo_sorteio);

    console.log(`Criando ${numerosAleatorios.length} bilhetes...`);

    // Criar bilhetes em lote
    for (const item of numerosAleatorios) {
      const bloco = blocos.find(b => b.numero === item.blocoNumero);

      await query(
        `INSERT INTO bilhetes (rifa_id, bloco_id, numero_sorte, status_venda)
         VALUES (?, ?, ?, ?)`,
        [rifaId, bloco.id, item.numeroSorte, 'nao_vendido']
      );
    }

    console.log('✅ Rifa criada com sucesso!');

    res.status(201).json({
      success: true,
      rifa: {
        id: rifaId,
        titulo,
        qtde_bilhetes,
        qtde_blocos,
        status: 'preparacao',
      },
      message: 'Rifa criada com sucesso!',
    });

  } catch (error) {
    console.error('Erro ao criar rifa:', error);
    res.status(500).json({
      error: 'Erro ao criar rifa',
      details: error.message
    });
  }
}
