-- Execute once in fsph_ambulatorio for existing rows stored as UTC.
UPDATE tb_sessoes_auth
SET ses_ultima_atividade = DATE_SUB(ses_ultima_atividade, INTERVAL 3 HOUR),
    ses_expira_em = DATE_SUB(ses_expira_em, INTERVAL 3 HOUR);
