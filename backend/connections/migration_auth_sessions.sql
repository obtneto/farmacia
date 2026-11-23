-- Execute while connected to fsph_ambulatorio.
CREATE TABLE IF NOT EXISTS tb_sessoes_auth (
    ses_hash CHAR(64) NOT NULL,
    ses_usuario VARCHAR(255) NOT NULL,
    ses_ultima_atividade DATETIME(6) NOT NULL,
    ses_expira_em DATETIME(6) NOT NULL,
    PRIMARY KEY (ses_hash),
    INDEX idx_tb_sessoes_auth_expira (ses_expira_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
