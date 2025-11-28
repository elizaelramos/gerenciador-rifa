-- Adicionar o status 'confirmado' ao ENUM status_venda
ALTER TABLE bilhetes
MODIFY COLUMN status_venda ENUM('nao_vendido', 'pendente', 'confirmado', 'pago')
DEFAULT 'nao_vendido';
