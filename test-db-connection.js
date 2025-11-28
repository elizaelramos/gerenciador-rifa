/**
 * Script de teste de conexão com o banco de dados
 * Execute: node test-db-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testarConexao() {
  console.log('🔍 Testando conexão com o banco de dados...\n');
  console.log('Configurações:');
  console.log('  Host:', process.env.DB_HOST);
  console.log('  Usuário:', process.env.DB_USER);
  console.log('  Banco:', process.env.DB_NAME);
  console.log('  Porta:', process.env.DB_PORT);
  console.log('  Senha tem', process.env.DB_PASSWORD?.length, 'caracteres');
  console.log('  Primeiro caractere da senha:', process.env.DB_PASSWORD?.[0]);
  console.log('  Último caractere da senha:', process.env.DB_PASSWORD?.[process.env.DB_PASSWORD.length - 1]);
  console.log('');

  let connection;

  try {
    // Tentar conectar
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Testar uma query simples
    const [rows] = await connection.execute('SELECT VERSION() as version, DATABASE() as db');
    console.log('📊 Informações do banco:');
    console.log('  Versão MySQL/MariaDB:', rows[0].version);
    console.log('  Banco de dados atual:', rows[0].db);
    console.log('');

    // Verificar tabelas existentes
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tabelas existentes no banco:');

    if (tables.length === 0) {
      console.log('  ⚠️  Nenhuma tabela encontrada!');
      console.log('  💡 Execute o script database/schema.sql para criar as tabelas');
    } else {
      tables.forEach(table => {
        console.log('  ✓', Object.values(table)[0]);
      });
    }

    console.log('\n✅ Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:\n');
    console.error('Mensagem:', error.message);
    console.error('Código:', error.code);
    console.error('\n💡 Possíveis soluções:');
    console.error('  1. Verifique se o MySQL/MariaDB está rodando');
    console.error('  2. Confirme usuário e senha em .env.local');
    console.error('  3. Verifique se o banco "rifa" existe');
    console.error('  4. Verifique permissões do usuário');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testarConexao();
