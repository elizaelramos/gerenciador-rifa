/**
 * API Route: Gerenciar Vendedores
 * GET /api/vendedores - Lista todos os vendedores
 * POST /api/vendedores - Cria um novo vendedor
 */

export default async function handler(req, res) {
  const { query } = await import('../../../lib/db');

  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT v.*, b.numero as bloco_numero, r.titulo as rifa_titulo
         FROM vendedores v
         LEFT JOIN blocos b ON v.bloco_id = b.id
         LEFT JOIN rifas r ON b.rifa_id = r.id
         ORDER BY v.data_cadastro DESC`
      );

      res.status(200).json({
        vendedores: result.rows || [],
      });
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
      res.status(500).json({ error: 'Erro ao buscar vendedores' });
    }
  }

  else if (req.method === 'POST') {
    try {
      const { nome, telefone, bloco_id } = req.body;

      // Validações
      if (!nome || !telefone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
      }

      // Validar formato do telefone
      const numeros = telefone.replace(/\D/g, '');
      if (numeros.length !== 10 && numeros.length !== 11) {
        return res.status(400).json({ error: 'Telefone deve ter 10 ou 11 dígitos (incluindo DDD)' });
      }

      const ddd = parseInt(numeros.slice(0, 2));
      if (ddd < 11 || ddd > 99) {
        return res.status(400).json({ error: 'DDD inválido' });
      }

      // Verificar se já existe vendedor com esse telefone
      const checkResult = await query(
        'SELECT id FROM vendedores WHERE telefone = ? AND ativo = TRUE',
        [telefone]
      );

      if (checkResult.rows && checkResult.rows.length > 0) {
        return res.status(400).json({ error: 'Já existe um vendedor cadastrado com este telefone' });
      }

      // Criar vendedor
      const result = await query(
        'INSERT INTO vendedores (nome, telefone, bloco_id, ativo) VALUES (?, ?, ?, TRUE)',
        [nome, telefone, bloco_id || null]
      );

      res.status(201).json({
        success: true,
        vendedor: {
          id: result.rows.insertId,
          nome,
          telefone,
          bloco_id: bloco_id || null,
        },
        message: 'Vendedor cadastrado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao criar vendedor:', error);
      res.status(500).json({ error: 'Erro ao cadastrar vendedor' });
    }
  }

  else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
