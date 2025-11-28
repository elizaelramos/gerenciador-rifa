-- Adiciona a coluna logo_url na tabela de rifas
ALTER TABLE rifas
ADD COLUMN logo_url VARCHAR(255) DEFAULT NULL COMMENT 'URL da imagem do logo da rifa';
