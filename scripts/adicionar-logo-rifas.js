/**
 * Script de Migração: Adicionar campo logo_url na tabela rifas
 * 
 * Execute com: node scripts/adicionar-logo-rifas.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function adicionarCampoLogo() {
    console.log('🔄 Adicionando campo logo_url na tabela rifas...\n');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        // Verificar se o campo já existe
        const [columns] = await connection.execute(`
      SHOW COLUMNS FROM rifas LIKE 'logo_url'
    `);

        if (columns.length > 0) {
            console.log('⚠️  Campo logo_url já existe na tabela rifas');
            return;
        }

        // Adicionar o campo logo_url
        await connection.execute(`
      ALTER TABLE rifas 
      ADD COLUMN logo_url VARCHAR(500) DEFAULT NULL 
      AFTER descricao
    `);

        console.log('✅ Campo logo_url adicionado com sucesso!');

        // Mostrar estrutura atualizada
        const [rifas] = await connection.execute('SELECT COUNT(*) as total FROM rifas');
        console.log(`\n📊 Total de rifas no sistema: ${rifas[0].total}`);

    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Executar migração
adicionarCampoLogo()
    .then(() => {
        console.log('\n🎉 Migração concluída!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Falha na migração:', error);
        process.exit(1);
    });
