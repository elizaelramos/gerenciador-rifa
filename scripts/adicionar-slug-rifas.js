/**
 * Script de Migração: Adicionar campo slug na tabela rifas
 * e gerar slugs para as rifas já cadastradas
 *
 * Execute com: node scripts/adicionar-slug-rifas.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

function gerarSlug(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function migrarSlugs() {
    console.log('🔄 Iniciando migração de slugs para rifas...\n');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        // 1. Verificar se a coluna já existe
        const [columns] = await connection.execute(`
            SHOW COLUMNS FROM rifas LIKE 'slug'
        `);

        if (columns.length === 0) {
            console.log('📋 Adicionando coluna slug na tabela rifas...');
            await connection.execute(`
                ALTER TABLE rifas
                ADD COLUMN slug VARCHAR(255) UNIQUE AFTER titulo
            `);
            console.log('✅ Coluna slug adicionada!\n');
        } else {
            console.log('⚠️  Coluna slug já existe na tabela rifas\n');
        }

        // 2. Buscar todas as rifas sem slug
        const [rifas] = await connection.execute(
            'SELECT id, titulo FROM rifas WHERE slug IS NULL OR slug = ""'
        );

        if (rifas.length === 0) {
            console.log('✅ Todas as rifas já possuem slug!');
            return;
        }

        console.log(`📊 ${rifas.length} rifa(s) sem slug encontrada(s). Gerando slugs...\n`);

        // 3. Gerar e salvar slug para cada rifa
        const slugsUsados = new Set();

        for (const rifa of rifas) {
            let slug = gerarSlug(rifa.titulo);

            // Garantir unicidade: se já existe, adiciona o ID
            if (slugsUsados.has(slug)) {
                slug = `${slug}-${rifa.id}`;
            }

            // Verificar no banco se o slug já está em uso por outra rifa
            const [existente] = await connection.execute(
                'SELECT id FROM rifas WHERE slug = ? AND id != ?',
                [slug, rifa.id]
            );

            if (existente.length > 0) {
                slug = `${slug}-${rifa.id}`;
            }

            slugsUsados.add(slug);

            await connection.execute(
                'UPDATE rifas SET slug = ? WHERE id = ?',
                [slug, rifa.id]
            );

            console.log(`  ✔ Rifa #${rifa.id} → "${rifa.titulo}" → /rifa/${slug}`);
        }

        console.log('\n✅ Slugs gerados com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Executar migração
migrarSlugs()
    .then(() => {
        console.log('\n🎉 Migração concluída!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Falha na migração:', error);
        process.exit(1);
    });
