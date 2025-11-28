/**
 * Script de Migração: Atualizar vendedor_id nos bilhetes
 * 
 * Este script atualiza todos os bilhetes para terem o vendedor_id
 * correspondente ao vendedor do bloco ao qual pertencem.
 * 
 * Execute com: node scripts/migrar-vendedor-bilhetes.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrarVendedorBilhetes() {
    console.log('🔄 Iniciando migração de vendedor_id nos bilhetes...\n');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        // Atualizar bilhetes com vendedor_id baseado no bloco
        const [result] = await connection.execute(`
      UPDATE bilhetes b
      INNER JOIN blocos bl ON b.bloco_id = bl.id
      SET b.vendedor_id = bl.vendedor_id
      WHERE bl.vendedor_id IS NOT NULL
        AND b.vendedor_id IS NULL
    `);

        console.log(`✅ ${result.affectedRows} bilhetes atualizados com vendedor_id`);

        // Mostrar estatísticas
        const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_bilhetes,
        COUNT(vendedor_id) as bilhetes_com_vendedor,
        COUNT(*) - COUNT(vendedor_id) as bilhetes_sem_vendedor
      FROM bilhetes
    `);

        console.log('\n📊 Estatísticas:');
        console.log(`   Total de bilhetes: ${stats[0].total_bilhetes}`);
        console.log(`   Bilhetes com vendedor: ${stats[0].bilhetes_com_vendedor}`);
        console.log(`   Bilhetes sem vendedor: ${stats[0].bilhetes_sem_vendedor}`);

        // Mostrar bilhetes por vendedor
        const [vendedores] = await connection.execute(`
      SELECT 
        v.nome as vendedor_nome,
        COUNT(b.id) as total_bilhetes,
        COUNT(CASE WHEN b.status_venda = 'pago' THEN 1 END) as vendidos_pagos,
        COUNT(CASE WHEN b.status_venda = 'pendente' THEN 1 END) as vendidos_pendentes,
        COUNT(CASE WHEN b.status_venda = 'nao_vendido' THEN 1 END) as nao_vendidos
      FROM bilhetes b
      INNER JOIN vendedores v ON b.vendedor_id = v.id
      GROUP BY v.id, v.nome
      ORDER BY total_bilhetes DESC
    `);

        if (vendedores.length > 0) {
            console.log('\n👥 Bilhetes por vendedor:');
            vendedores.forEach(v => {
                console.log(`   ${v.vendedor_nome}:`);
                console.log(`      Total: ${v.total_bilhetes}`);
                console.log(`      Vendidos (Pagos): ${v.vendidos_pagos}`);
                console.log(`      Vendidos (Pendentes): ${v.vendidos_pendentes}`);
                console.log(`      Não Vendidos: ${v.nao_vendidos}`);
            });
        }

        console.log('\n✅ Migração concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Executar migração
migrarVendedorBilhetes()
    .then(() => {
        console.log('\n🎉 Processo finalizado!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Falha na migração:', error);
        process.exit(1);
    });
