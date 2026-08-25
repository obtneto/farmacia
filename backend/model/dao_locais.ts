import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

enum eAtivo {
    Inativo = 0,
    Ativo = 1,
}

export interface iLocaisFields {
    local_id: number,
    local_descr: string | null,
    local_ativo: eAtivo | null,
}

export default class Locais extends BaseModel implements iBaseModel, iLocaisFields {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iLocaisFields = {
            local_id: 0,
            local_descr: null,
            local_ativo: null,
        };

        super(connection, 'tb_locais', initFields, 'local_id');

    }

    get found(): boolean { return this._found; }

    set local_id(id: number) { this._fields.local_id = id; }
    get local_id(): number { return this._fields.local_id; }

    set local_descr(descr: string | null) { this._fields.local_descr = descr; }
    get local_descr(): string | null { return this._fields.local_descr; }

    set local_ativo(ativo: eAtivo | null) { this._fields.local_ativo = ativo; }
    get local_ativo(): eAtivo | null { return this._fields.local_ativo; }

    public async Listar(pesq: string = ''): Promise<iLocaisFields[]> {

        let query: string = "SELECT * FROM tb_locais";

        if (pesq !== '*') {
            query += " WHERE MATCH(local_descr) AGAINST(:pesq IN NATURAL LANGUAGE MODE)";
        }

        const [rows] = await this.ExecuteQuery(query, { pesq: `%${pesq}%` }) as [iLocaisFields[]];

        return rows;

    }

    public async ListarAtivos(pesq: string = '*'): Promise<iLocaisFields[]> {

        let query: string = "SELECT * FROM tb_locais WHERE local_ativo = 1";

        if (pesq !== '*') {
            query += " AND MATCH(local_descr) AGAINST(:pesq IN NATURAL LANGUAGE MODE)";
        }

        const [rows] = await this.ExecuteQuery(query, { pesq }) as [iLocaisFields[]];

        return rows;

    }

}
