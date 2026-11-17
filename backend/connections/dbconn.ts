import { Connection, Pool, PoolConnection, createPool } from 'mysql2/promise';

export interface iDatabase {
    connection: Connection,
    Connect(): Promise<void>,
    Disconnect(): Promise<void>,
    Begin(): Promise<void>,
    Commit(): Promise<void>,
    Rollback(): Promise<void>,
}

export default class Database implements iDatabase {

    private conn: PoolConnection | null = null;
    private transactionActive = false;
    private pool: Pool | null = null;

    constructor() { }

    // Abre a conexao somente quando ela ainda nao existe no ciclo atual.
    public async Connect(): Promise<void> {

        if (this.conn) {
            return;
        }

        this.conn = await this.getPool().getConnection();

    }
    // instancia o pool de conexoes
    private getPool(): Pool {

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


    // Exige que a conexao tenha sido inicializada antes de expor o driver.
    public get connection(): Connection {

        if (!this.conn) {
            throw new Error('Conexão com banco de dados não inicializada!');
        }

        return this.conn;
    }

    // Libera a conexao para reutilizacao e reseta o estado da transacao local.
    public async Disconnect(): Promise<void> {

        if (!this.conn) {
            return;
        }

        const connection = this.conn;
        this.conn = null;

        try {
            if (this.transactionActive) {
                await connection.rollback();
            }
        } finally {
            connection.release();
            this.transactionActive = false;
        }
    }

    // Inicia transacao apenas uma vez por ciclo de requisicao.
    public async Begin(): Promise<void> {

        if (!this.conn || this.transactionActive) {
            return;
        }

        await this.conn.beginTransaction();
        this.transactionActive = true;
    }

    // Confirma alteracoes somente quando ha transacao ativa.
    public async Commit(): Promise<void> {

        if (!this.conn || !this.transactionActive) {
            return;
        }

        await this.conn.commit();
        this.transactionActive = false;
    }

    // Reverte alteracoes pendentes quando alguma etapa falha.
    public async Rollback(): Promise<void> {

        if (!this.conn || !this.transactionActive) {
            return;
        }

        await this.conn.rollback();
        this.transactionActive = false;
    }
}       
