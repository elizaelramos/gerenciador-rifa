-- ============================================
-- SISTEMA DE GERENCIAMENTO DE RIFAS
-- Schema do Banco de Dados MariaDB/MySQL
-- ============================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS rifa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rifa;

-- ============================================
-- TABELA: rifas
-- Armazena informações principais de cada rifa
-- ============================================
CREATE TABLE IF NOT EXISTS rifas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    qtde_bilhetes INT NOT NULL,                    -- Ex: 100, 200, 10000
    tipo_sorteio ENUM('dezena', 'milhar') NOT NULL, -- dezena = 2 dígitos, milhar = 4 dígitos
    qtde_blocos INT NOT NULL,                       -- Quantidade de blocos físicos
    bilhetes_por_bloco INT NOT NULL,                -- Calculado: qtde_bilhetes / qtde_blocos
    valor_bilhete DECIMAL(10, 2) NOT NULL,          -- Valor de cada bilhete
    data_sorteio DATE NOT NULL,                     -- Data do sorteio (Loteria Federal)
    status ENUM('preparacao', 'distribuido', 'concluido') DEFAULT 'preparacao',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_data_sorteio (data_sorteio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: premios
-- Armazena os prêmios de cada rifa
-- ============================================
CREATE TABLE IF NOT EXISTS premios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rifa_id INT NOT NULL,
    posicao INT NOT NULL,                           -- 1º, 2º, 3º prêmio
    descricao VARCHAR(255) NOT NULL,                -- Ex: "1 Moto Honda 0km"
    valor_estimado DECIMAL(10, 2),
    FOREIGN KEY (rifa_id) REFERENCES rifas(id) ON DELETE CASCADE,
    INDEX idx_rifa_posicao (rifa_id, posicao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: blocos
-- Armazena informações de cada bloco físico
-- ============================================
CREATE TABLE IF NOT EXISTS blocos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rifa_id INT NOT NULL,
    numero INT NOT NULL,                            -- Número sequencial do bloco (1, 2, 3...)
    qtde_cartoes INT NOT NULL,                      -- Bilhetes por bloco
    vendedor_id INT DEFAULT NULL,                   -- NULL = não distribuído ainda
    data_distribuicao TIMESTAMP NULL,               -- Quando foi entregue ao vendedor
    data_recolhimento TIMESTAMP NULL,               -- Quando foi devolvido
    status ENUM('disponivel', 'distribuido', 'recolhido') DEFAULT 'disponivel',
    FOREIGN KEY (rifa_id) REFERENCES rifas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rifa_bloco (rifa_id, numero),
    INDEX idx_vendedor (vendedor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: vendedores
-- Armazena dados dos vendedores (auto-cadastro)
-- ============================================
CREATE TABLE IF NOT EXISTS vendedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    bloco_id INT DEFAULT NULL,                      -- Primeiro bloco que pegou (auto-associação)
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    UNIQUE KEY unique_telefone (telefone),
    INDEX idx_bloco (bloco_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: bilhetes
-- Armazena cada bilhete individual da rifa
-- ============================================
CREATE TABLE IF NOT EXISTS bilhetes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rifa_id INT NOT NULL,
    bloco_id INT NOT NULL,
    numero_sorte VARCHAR(10) NOT NULL,              -- Ex: "00", "01", "9999"
    status_venda ENUM('nao_vendido', 'pago', 'pendente') DEFAULT 'nao_vendido',
    comprador_nome VARCHAR(255) DEFAULT NULL,
    comprador_telefone VARCHAR(20) DEFAULT NULL,
    observacao TEXT DEFAULT NULL,                   -- Ex: "Taxista do Mercado"
    vendedor_id INT DEFAULT NULL,
    data_venda TIMESTAMP NULL,
    FOREIGN KEY (rifa_id) REFERENCES rifas(id) ON DELETE CASCADE,
    FOREIGN KEY (bloco_id) REFERENCES blocos(id) ON DELETE CASCADE,
    FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL,
    UNIQUE KEY unique_rifa_numero (rifa_id, numero_sorte),
    INDEX idx_status_venda (status_venda),
    INDEX idx_bloco (bloco_id),
    INDEX idx_vendedor (vendedor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: sorteios
-- Registra resultados oficiais dos sorteios
-- ============================================
CREATE TABLE IF NOT EXISTS sorteios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rifa_id INT NOT NULL,
    resultado_oficial_1 VARCHAR(10),                -- Ex: "87452" (número completo da Loteria Federal)
    resultado_numero_sorte_1 VARCHAR(10),           -- Ex: "52" ou "7452" (extraído)
    ganhador_bilhete_id_1 INT DEFAULT NULL,         -- ID do bilhete premiado
    resultado_oficial_2 VARCHAR(10),
    resultado_numero_sorte_2 VARCHAR(10),
    ganhador_bilhete_id_2 INT DEFAULT NULL,
    resultado_oficial_3 VARCHAR(10),
    resultado_numero_sorte_3 VARCHAR(10),
    ganhador_bilhete_id_3 INT DEFAULT NULL,
    resultado_oficial_4 VARCHAR(10),
    resultado_numero_sorte_4 VARCHAR(10),
    ganhador_bilhete_id_4 INT DEFAULT NULL,
    resultado_oficial_5 VARCHAR(10),
    resultado_numero_sorte_5 VARCHAR(10),
    ganhador_bilhete_id_5 INT DEFAULT NULL,
    imagem_url_oficial VARCHAR(255),                -- Print do site da Loteria Federal
    data_processamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processado_por VARCHAR(255),                    -- Nome do gerenciador
    FOREIGN KEY (rifa_id) REFERENCES rifas(id) ON DELETE CASCADE,
    FOREIGN KEY (ganhador_bilhete_id_1) REFERENCES bilhetes(id) ON DELETE SET NULL,
    FOREIGN KEY (ganhador_bilhete_id_2) REFERENCES bilhetes(id) ON DELETE SET NULL,
    FOREIGN KEY (ganhador_bilhete_id_3) REFERENCES bilhetes(id) ON DELETE SET NULL,
    FOREIGN KEY (ganhador_bilhete_id_4) REFERENCES bilhetes(id) ON DELETE SET NULL,
    FOREIGN KEY (ganhador_bilhete_id_5) REFERENCES bilhetes(id) ON DELETE SET NULL,
    UNIQUE KEY unique_rifa_sorteio (rifa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: usuarios (Gerenciadores/Admin)
-- Para autenticação do painel de controle
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,                    -- Hash bcrypt
    tipo ENUM('admin', 'gerenciador') DEFAULT 'gerenciador',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Inserir usuário admin padrão (senha: admin123)
-- IMPORTANTE: Alterar esta senha em produção!
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES ('Administrador', 'admin@rifa.com', '$2b$10$rQ6K8h7XK7y9Z8F7X8F7X8F7X8F7X8F7X8F7X8F7X8F7X8F7X8F7X', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Status geral de vendas por rifa
CREATE OR REPLACE VIEW view_status_vendas AS
SELECT
    r.id AS rifa_id,
    r.titulo,
    r.qtde_bilhetes AS total_bilhetes,
    COUNT(CASE WHEN b.status_venda = 'pago' THEN 1 END) AS vendidos_pagos,
    COUNT(CASE WHEN b.status_venda = 'pendente' THEN 1 END) AS vendidos_pendentes,
    COUNT(CASE WHEN b.status_venda = 'nao_vendido' THEN 1 END) AS nao_vendidos,
    ROUND((COUNT(CASE WHEN b.status_venda = 'pago' THEN 1 END) * 100.0 / r.qtde_bilhetes), 2) AS percentual_pago
FROM rifas r
LEFT JOIN bilhetes b ON r.id = b.rifa_id
GROUP BY r.id, r.titulo, r.qtde_bilhetes;

-- View: Acerto de contas por vendedor
CREATE OR REPLACE VIEW view_acerto_contas AS
SELECT
    v.id AS vendedor_id,
    v.nome AS vendedor_nome,
    v.telefone AS vendedor_telefone,
    r.id AS rifa_id,
    r.titulo AS rifa_titulo,
    r.valor_bilhete,
    COUNT(CASE WHEN b.status_venda = 'pago' THEN 1 END) AS qtde_pagos,
    COUNT(CASE WHEN b.status_venda = 'pendente' THEN 1 END) AS qtde_pendentes,
    COUNT(CASE WHEN b.status_venda = 'pago' THEN 1 END) * r.valor_bilhete AS total_recebido
FROM vendedores v
JOIN bilhetes b ON v.id = b.vendedor_id
JOIN rifas r ON b.rifa_id = r.id
GROUP BY v.id, v.nome, v.telefone, r.id, r.titulo, r.valor_bilhete;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
