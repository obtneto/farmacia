import { Connection, RowDataPacket } from 'mysql2/promise'
import BaseModel, { iBaseModel } from './BaseModel.js'

export interface iSetoresFields {
    set_id: number,
    set_descr: string | null,
    set_ativo: number | null
}

export default class Setores extends BaseModel implements iSetoresFields, iBaseModel {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error('Conexão com o banco de dados não estabelecida.');
        }

        const initFields: iSetoresFields = {
            set_id: 0,
            set_descr: null,
            set_ativo: null,
        }

        super(connection, 'tb_setores', initFields, 'set_id');

    }

    get found(): boolean { return this._found }
    set set_id(id: number) { this._fields.set_id = id }
    get set_id(): number { return this._fields.set_id }

    set set_descr(descr: string | null) { this._fields.set_descr = descr }
    get set_descr(): string | null { return this._fields.set_descr }

    set set_ativo(ativo: number | null) { this._fields.set_ativo = ativo }
    get set_ativo(): number | null { return this._fields.set_ativo }

    async ListarAtivos(pesq: string = ''): Promise<RowDataPacket[]> {

        let query = `SELECT set_id, set_descr, set_ativo FROM tb_setores WHERE set_ativo = 1`;

        if (pesq !== '*') {
            query += ' AND (set_descr LIKE :pesq)';
        }

        const [rows] = await this.ExecuteQuery(query, { pesq: `%${pesq}%` }) as [RowDataPacket[]];

        return rows as RowDataPacket[];

    }

    async Listar(pesq: string = ''): Promise<RowDataPacket[]> {

        let query = `SELECT set_id, set_descr, set_ativo FROM tb_setores`;

        if (pesq !== '*') {
            query += ' WHERE (set_descr LIKE :pesq)';
        }

        const [rows] = await this.ExecuteQuery(query, { pesq: `%${pesq}%` }) as [RowDataPacket[]];

        return rows as RowDataPacket[];

    }

}
