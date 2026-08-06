import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iTiposRequisicoesFields {
    tip_req_id: number,
    tip_req_codigo: string | null,
    tip_req_descr: string | null,
}

export default class TiposRequisicoes extends BaseModel implements iBaseModel, iTiposRequisicoesFields {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iTiposRequisicoesFields = {
            tip_req_id: 0,
            tip_req_codigo: null,
            tip_req_descr: null,
        };

        super(connection, 'tb_tipos_requisicoes', initFields, 'tip_req_id');

    }

    get found(): boolean { return this._found; }

    set tip_req_id(id: number) { this._fields.tip_req_id = id; }
    get tip_req_id(): number { return this._fields.tip_req_id; }

    set tip_req_codigo(codigo: string | null) { this._fields.tip_req_codigo = codigo; }
    get tip_req_codigo(): string | null { return this._fields.tip_req_codigo; }

    set tip_req_descr(descr: string | null) { this._fields.tip_req_descr = descr; }
    get tip_req_descr(): string | null { return this._fields.tip_req_descr; }

    public async Listar(): Promise<iTiposRequisicoesFields[]> {

        let query: string = "SELECT * FROM tb_tipos_requisicoes";

        const [rows] = await this.ExecuteQuery(query) as [iTiposRequisicoesFields[]];

        return rows;

    }

}
