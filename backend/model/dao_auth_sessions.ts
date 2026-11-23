import { createHash } from 'node:crypto';
import { createPool, type Pool } from 'mysql2/promise';

function hashSessionId(sessionId: string): string {
    return createHash('sha256').update(sessionId).digest('hex');
}

export default class AuthSessions {
    private static pool: Pool | undefined;

    private static getPool(): Pool {
        if (!this.pool) {
            this.pool = createPool({
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: 'fsph_ambulatorio',
                namedPlaceholders: true,
                decimalNumbers: true,
                dateStrings: true,
                timezone: '-03:00',
                charset: 'utf8mb4',
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                enableKeepAlive: true,
                keepAliveInitialDelay: 10000,
            });
        }
        return this.pool;
    }

    public static async Create(sessionId: string, username: string): Promise<void> {
        await this.getPool().execute(
            `INSERT INTO tb_sessoes_auth (ses_hash, ses_usuario, ses_ultima_atividade, ses_expira_em)
             VALUES (?, ?, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 HOUR),
                     DATE_ADD(DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 HOUR), INTERVAL 1 HOUR))`,
            [hashSessionId(sessionId), username],
        );
    }

    public static async Touch(sessionId: string): Promise<boolean> {
        const [result] = await this.getPool().execute(
            `UPDATE tb_sessoes_auth
             SET ses_ultima_atividade = DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 HOUR),
                 ses_expira_em = DATE_ADD(DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 HOUR), INTERVAL 1 HOUR)
             WHERE ses_hash = ?
               AND ses_ultima_atividade >= DATE_SUB(DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 HOUR), INTERVAL 15 MINUTE)
               AND ses_expira_em > DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 HOUR)`,
            [hashSessionId(sessionId)],
        );
        return 'affectedRows' in result && result.affectedRows === 1;
    }

    public static async Revoke(sessionId: string): Promise<void> {
        await this.getPool().execute('DELETE FROM tb_sessoes_auth WHERE ses_hash = ?', [hashSessionId(sessionId)]);
    }
}
