import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iDepositosFields {
    dep_id: number,
    dep_descr: string | null,
    dep_ativo: 0 | 1 | null
    dep_bloqueado: 0 | 1 | null
}

export default class Depositos extends BaseModel implements iDepositosFields, iBaseModel {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iDepositosFields = {
            dep_id: 0,
            dep_descr: null,
            dep_ativo: null,
            dep_bloqueado: null
        };

        super(connection, 'tb_depositos', initFields, 'dep_id');

    }

    get found(): boolean { return this._found; }

    set dep_id(id: number) { this._fields.dep_id = id; }
    get dep_id(): number { return this._fields.dep_id; }

    set dep_descr(descr: string | null) { this._fields.dep_descr = descr; }
    get dep_descr(): string | null { return this._fields.dep_descr; }

    set dep_ativo(ativo: 0 | 1 | null) { this._fields.dep_ativo = ativo; }
    get dep_ativo(): 0 | 1 | null { return this._fields.dep_ativo; }

    set dep_bloqueado(bloqueado: 0 | 1 | null) { this._fields.dep_bloqueado = bloqueado; }
    get dep_bloqueado(): 0 | 1 | null { return this._fields.dep_bloqueado; }

    public async Listar(pesq: string): Promise<iDepositosFields[]> {

        let query: string = "SELECT * FROM tb_depositos";

        if (pesq !== '*') {
            query += " WHERE MATCH(dep_descr) AGAINST(:pesq IN BOOLEAN MODE)";
        }

        const [rows] = await this.ExecuteQuery(query, { pesq }) as RowDataPacket[];

        return rows as iDepositosFields[];

    }

    public async ListarAtivos(): Promise<iDepositosFields[]> {

        let query: string = `SELECT dep_id, dep_descr FROM tb_depositos 
                             WHERE dep_ativo = 1 AND dep_bloqueado = 0`;

        const [rows] = await this.ExecuteQuery(query) as RowDataPacket[];

        return rows as iDepositosFields[];

    }

}

