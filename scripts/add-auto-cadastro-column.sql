-- Adicionar coluna auto_cadastro na tabela bilhetes
-- Esta coluna indica se o bilhete foi cadastrado pelo próprio comprador

ALTER TABLE bilhetes
ADD COLUMN auto_cadastro BOOLEAN DEFAULT FALSE AFTER observacao;

-- Atualizar descrição
ALTER TABLE bilhetes MODIFY COLUMN auto_cadastro BOOLEAN DEFAULT FALSE COMMENT 'TRUE se foi auto-cadastrado pelo comprador, FALSE se foi cadastrado pelo vendedor';
