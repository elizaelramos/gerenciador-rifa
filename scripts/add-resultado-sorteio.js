require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function main() {
    console.log('Iniciando migração: Adicionar colunas de resultado do sorteio');

    if (!process.env.DB_HOST) {
        console.error('Erro: Variáveis de ambiente não encontradas. Verifique o .env.local');
        process.exit(1);
    }

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
        });

        console.log('Conectado ao banco de dados.');

        // Verificar e adicionar colunas necessárias
        const colunasParaAdicionar = [
            {
                nome: 'numero_loteria_federal',
                sql: `ALTER TABLE rifas ADD COLUMN numero_loteria_federal VARCHAR(10) NULL AFTER data_sorteio`
            },
            {
                nome: 'numero_sorteado',
                sql: `ALTER TABLE rifas ADD COLUMN numero_sorteado VARCHAR(10) NULL AFTER numero_loteria_federal`
            },
            {
                nome: 'numero_ganhador',
                sql: `ALTER TABLE rifas ADD COLUMN numero_ganhador VARCHAR(10) NULL AFTER numero_sorteado`
            },
            {
                nome: 'bilhete_ganhador_id',
                sql: `ALTER TABLE rifas ADD COLUMN bilhete_ganhador_id INT NULL AFTER numero_ganhador`
            },
            {
                nome: 'data_resultado',
                sql: `ALTER TABLE rifas ADD COLUMN data_resultado DATETIME NULL AFTER bilhete_ganhador_id`
            }
        ];

        for (const coluna of colunasParaAdicionar) {
            const [columns] = await connection.execute(
                `SHOW COLUMNS FROM rifas LIKE '${coluna.nome}'`
            );

            if (columns.length > 0) {
                console.log(`✓ Coluna '${coluna.nome}' já existe.`);
            } else {
                console.log(`Adicionando coluna '${coluna.nome}'...`);
                await connection.execute(coluna.sql);
                console.log(`✓ Coluna '${coluna.nome}' adicionada com sucesso!`);
            }
        }

        console.log('\n✅ Migração concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Conexão fechada.');
        }
    }
}

main();
