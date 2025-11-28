
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function main() {
    console.log('Iniciando migração: Adicionar coluna imagem_url na tabela premios');

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

        // Verificar se a coluna já existe
        const [columns] = await connection.execute(
            `SHOW COLUMNS FROM premios LIKE 'imagem_url'`
        );

        if (columns.length > 0) {
            console.log('A coluna imagem_url já existe na tabela premios.');
        } else {
            console.log('Adicionando coluna imagem_url...');
            await connection.execute(
                `ALTER TABLE premios ADD COLUMN imagem_url VARCHAR(255) NULL AFTER valor_estimado`
            );
            console.log('Coluna imagem_url adicionada com sucesso!');
        }

    } catch (error) {
        console.error('Erro durante a migração:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Conexão fechada.');
        }
    }
}

main();
