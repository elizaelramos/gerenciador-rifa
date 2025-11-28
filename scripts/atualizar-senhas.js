/**
 * Script para atualizar senhas em texto plano para hash bcrypt
 * Execute: node scripts/atualizar-senhas.js
 */

require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function atualizarSenhas() {
  console.log('🔐 Atualizando senhas para bcrypt...\n');

  let connection;

  try {
    // Conectar ao banco
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    console.log('✅ Conectado ao banco de dados\n');

    // Buscar todos os usuários
    const [usuarios] = await connection.execute(
      'SELECT id, email, senha FROM usuarios'
    );

    console.log(`📋 Encontrados ${usuarios.length} usuários\n`);

    let atualizados = 0;
    let jaHash = 0;

    for (const usuario of usuarios) {
      // Verificar se a senha já é um hash bcrypt (começa com $2b$)
      if (usuario.senha.startsWith('$2b$') || usuario.senha.startsWith('$2a$')) {
        console.log(`⏭️  ${usuario.email} - Senha já é hash, pulando...`);
        jaHash++;
        continue;
      }

      console.log(`🔄 Atualizando ${usuario.email}...`);

      // Gerar hash da senha
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(usuario.senha, saltRounds);

      // Atualizar no banco
      await connection.execute(
        'UPDATE usuarios SET senha = ? WHERE id = ?',
        [senhaHash, usuario.id]
      );

      console.log(`   ✓ Senha atualizada (antiga: "${usuario.senha}")`);
      atualizados++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Processo concluído!`);
    console.log(`   Senhas atualizadas: ${atualizados}`);
    console.log(`   Já eram hash: ${jaHash}`);
    console.log(`   Total: ${usuarios.length}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

atualizarSenhas();
