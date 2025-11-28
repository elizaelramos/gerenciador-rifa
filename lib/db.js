/**
 * Módulo de Conexão ao Banco de Dados MariaDB/MySQL
 *
 * IMPORTANTE: Por enquanto, este módulo está preparado para trabalhar
 * com dados mock (simulados) até que você configure o banco real.
 */

// Importar mysql2 apenas no servidor (não no navegador)
let mysql;
if (typeof window === 'undefined') {
  mysql = require('mysql2/promise');
}

// Flag para alternar entre modo MOCK e modo REAL
const USE_MOCK_DATA = process.env.USE_MOCK_DATA !== 'false';

// ============================================
// CONEXÃO COM BANCO DE DADOS REAL
// ============================================

let pool = null;

export async function getConnection() {
  if (USE_MOCK_DATA) {
    console.log('⚠️ Usando dados MOCK - Banco de dados não conectado');
    return null;
  }

  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
    });

    console.log('✅ Pool de conexões MySQL criado');
  }

  return pool;
}

export async function query(sql, params) {
  if (USE_MOCK_DATA) {
    console.log('⚠️ Query ignorada (modo MOCK):', sql);
    return { rows: [], fields: [] };
  }

  const connection = await getConnection();
  const [rows, fields] = await connection.execute(sql, params);
  return { rows, fields };
}

// ============================================
// DADOS MOCK (Para desenvolvimento sem BD)
// ============================================

// Rifa de exemplo
export const MOCK_RIFA = {
  id: 1,
  titulo: 'Rifa Beneficente de Natal 2024',
  descricao: 'Rifa para arrecadar fundos para o projeto social',
  qtde_bilhetes: 100,
  tipo_sorteio: 'dezena',
  qtde_blocos: 10,
  bilhetes_por_bloco: 10,
  valor_bilhete: 5.00,
  data_sorteio: '2024-12-24',
  status: 'preparacao',
};

// Prêmios de exemplo
export const MOCK_PREMIOS = [
  { id: 1, rifa_id: 1, posicao: 1, descricao: '1 Moto Honda 0km', valor_estimado: 15000.00, imagem_url: 'https://placehold.co/150x150/png?text=Moto' },
  { id: 2, rifa_id: 1, posicao: 2, descricao: '1 Notebook Dell', valor_estimado: 3500.00 },
  { id: 3, rifa_id: 1, posicao: 3, descricao: 'R$ 1.000 em dinheiro', valor_estimado: 1000.00 },
];

// Blocos de exemplo
export const MOCK_BLOCOS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  rifa_id: 1,
  numero: i + 1,
  qtde_cartoes: 10,
  vendedor_id: null,
  status: 'disponivel',
}));

// Vendedores de exemplo
export const MOCK_VENDEDORES = [
  { id: 1, nome: 'Maria Silva', telefone: '11987654321', bloco_id: 1, ativo: true },
  { id: 2, nome: 'João Santos', telefone: '11976543210', bloco_id: 2, ativo: true },
];

// Bilhetes de exemplo
export const MOCK_BILHETES = [];
for (let i = 0; i < 100; i++) {
  const blocoId = Math.floor(i / 10) + 1;
  const numeroSorte = String(i).padStart(2, '0');

  MOCK_BILHETES.push({
    id: i + 1,
    rifa_id: 1,
    bloco_id: blocoId,
    numero_sorte: numeroSorte,
    status_venda: 'nao_vendido',
    comprador_nome: null,
    comprador_telefone: null,
    observacao: null,
    vendedor_id: null,
    data_venda: null,
  });
}

// Simular algumas vendas
MOCK_BILHETES[0].status_venda = 'pago';
MOCK_BILHETES[0].comprador_nome = 'Pedro Oliveira';
MOCK_BILHETES[0].comprador_telefone = '11965432109';
MOCK_BILHETES[0].vendedor_id = 1;
MOCK_BILHETES[0].data_venda = new Date();

MOCK_BILHETES[15].status_venda = 'pendente';
MOCK_BILHETES[15].comprador_nome = 'Ana Costa';
MOCK_BILHETES[15].comprador_telefone = '11954321098';
MOCK_BILHETES[15].vendedor_id = 1;
MOCK_BILHETES[15].data_venda = new Date();

// ============================================
// FUNÇÕES DE CONSULTA (Mock e Real)
// ============================================

export async function getRifa(rifaId) {
  if (USE_MOCK_DATA) {
    return MOCK_RIFA;
  }

  const result = await query('SELECT * FROM rifas WHERE id = ?', [rifaId]);
  return result.rows[0] || null;
}

export async function getAllRifas() {
  if (USE_MOCK_DATA) {
    return [MOCK_RIFA];
  }

  const result = await query('SELECT * FROM rifas ORDER BY created_at DESC');
  return result.rows;
}

export async function getPremiosByRifa(rifaId) {
  if (USE_MOCK_DATA) {
    return MOCK_PREMIOS;
  }

  const result = await query('SELECT * FROM premios WHERE rifa_id = ? ORDER BY posicao', [rifaId]);
  return result.rows;
}

export async function getBlocosByRifa(rifaId) {
  if (USE_MOCK_DATA) {
    return MOCK_BLOCOS;
  }

  const result = await query('SELECT * FROM blocos WHERE rifa_id = ? ORDER BY numero', [rifaId]);
  return result.rows;
}

export async function getBilhetesByBloco(blocoId) {
  if (USE_MOCK_DATA) {
    return MOCK_BILHETES.filter(b => b.bloco_id === blocoId);
  }

  const result = await query('SELECT * FROM bilhetes WHERE bloco_id = ? ORDER BY numero_sorte', [blocoId]);
  return result.rows;
}

export async function getBilhetesByRifa(rifaId) {
  if (USE_MOCK_DATA) {
    return MOCK_BILHETES.filter(b => b.rifa_id === rifaId);
  }

  const result = await query('SELECT * FROM bilhetes WHERE rifa_id = ? ORDER BY bloco_id, numero_sorte', [rifaId]);
  return result.rows;
}

export async function getBilheteByNumero(rifaId, numeroSorte) {
  if (USE_MOCK_DATA) {
    return MOCK_BILHETES.find(b => b.rifa_id === rifaId && b.numero_sorte === numeroSorte) || null;
  }

  const result = await query(
    'SELECT * FROM bilhetes WHERE rifa_id = ? AND numero_sorte = ?',
    [rifaId, numeroSorte]
  );
  return result.rows[0] || null;
}

export async function getVendedorByTelefone(telefone) {
  if (USE_MOCK_DATA) {
    return MOCK_VENDEDORES.find(v => v.telefone === telefone) || null;
  }

  const result = await query('SELECT * FROM vendedores WHERE telefone = ?', [telefone]);
  return result.rows[0] || null;
}

export async function createVendedor(nome, telefone, blocoId = null) {
  if (USE_MOCK_DATA) {
    const novoVendedor = {
      id: MOCK_VENDEDORES.length + 1,
      nome,
      telefone,
      bloco_id: blocoId,
      ativo: true,
      data_cadastro: new Date(),
    };
    MOCK_VENDEDORES.push(novoVendedor);
    return novoVendedor;
  }

  const result = await query(
    'INSERT INTO vendedores (nome, telefone, bloco_id) VALUES (?, ?, ?)',
    [nome, telefone, blocoId]
  );
  return { id: result.rows.insertId, nome, telefone, bloco_id: blocoId };
}

export async function updateBilheteVenda(bilheteId, dados) {
  if (USE_MOCK_DATA) {
    const bilhete = MOCK_BILHETES.find(b => b.id === bilheteId);
    if (bilhete) {
      Object.assign(bilhete, dados, { data_venda: new Date() });
      return bilhete;
    }
    return null;
  }

  const { status_venda, comprador_nome, comprador_telefone, observacao, vendedor_id } = dados;

  await query(
    `UPDATE bilhetes
     SET status_venda = ?, comprador_nome = ?, comprador_telefone = ?,
         observacao = ?, vendedor_id = ?, data_venda = NOW()
     WHERE id = ?`,
    [status_venda, comprador_nome, comprador_telefone, observacao, vendedor_id, bilheteId]
  );

  return await getBilheteById(bilheteId);
}

async function getBilheteById(bilheteId) {
  if (USE_MOCK_DATA) {
    return MOCK_BILHETES.find(b => b.id === bilheteId) || null;
  }

  const result = await query('SELECT * FROM bilhetes WHERE id = ?', [bilheteId]);
  return result.rows[0] || null;
}

// ============================================
// FUNÇÕES PARA CRIAÇÃO DE RIFAS
// ============================================

export async function createRifa(dados) {
  if (USE_MOCK_DATA) {
    console.log('⚠️ Criação de rifa simulada (modo MOCK)');
    return { ...MOCK_RIFA, ...dados, id: 2 };
  }

  const { titulo, descricao, qtde_bilhetes, tipo_sorteio, qtde_blocos, valor_bilhete, data_sorteio } = dados;
  const bilhetes_por_bloco = Math.ceil(qtde_bilhetes / qtde_blocos);

  const result = await query(
    `INSERT INTO rifas (titulo, descricao, qtde_bilhetes, tipo_sorteio, qtde_blocos,
                        bilhetes_por_bloco, valor_bilhete, data_sorteio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [titulo, descricao, qtde_bilhetes, tipo_sorteio, qtde_blocos, bilhetes_por_bloco, valor_bilhete, data_sorteio]
  );

  return { id: result.rows.insertId, ...dados, bilhetes_por_bloco };
}

export default {
  getConnection,
  query,
  getRifa,
  getAllRifas,
  getPremiosByRifa,
  getBlocosByRifa,
  getBilhetesByBloco,
  getBilhetesByRifa,
  getBilheteByNumero,
  getVendedorByTelefone,
  createVendedor,
  updateBilheteVenda,
  createRifa,
};
