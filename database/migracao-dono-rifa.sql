-- ============================================
-- MIGRAÇÃO: dono das rifas e dos vendedores
-- Cada rifa e cada vendedor pertencem a um gerenciador (usuarios.id).
-- O admin vê tudo; o gerenciador vê apenas o que é dele.
--
-- Depois de rodar, defina o dono das rifas já existentes, por exemplo:
--   UPDATE rifas SET gerenciador_id = <id do usuário> WHERE id = <id da rifa>;
-- Rifas sem dono (NULL) ficam visíveis apenas para o admin.
-- ============================================

ALTER TABLE rifas
    ADD COLUMN gerenciador_id INT NULL AFTER id,
    ADD INDEX idx_rifas_gerenciador (gerenciador_id),
    ADD CONSTRAINT fk_rifas_gerenciador
        FOREIGN KEY (gerenciador_id) REFERENCES usuarios(id) ON DELETE SET NULL;

ALTER TABLE vendedores
    ADD COLUMN gerenciador_id INT NULL AFTER id,
    ADD INDEX idx_vendedores_gerenciador (gerenciador_id),
    ADD CONSTRAINT fk_vendedores_gerenciador
        FOREIGN KEY (gerenciador_id) REFERENCES usuarios(id) ON DELETE SET NULL;
