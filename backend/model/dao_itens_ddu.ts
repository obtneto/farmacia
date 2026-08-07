import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iItemDDUFields {
    ite_dd_id: number;
    ite_dd_req_num: string | null;
    ite_dd_med_id: number | null;
    ite_dd_lote: string | null;
    ite_dd_qtde: number;
    ite_dd_qtde_retorno: number;
};

export default class ItensDDU extends BaseModel implements iBaseModel, iItemDDUFields {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iItemDDUFields = {
            ite_dd_id: 0,
            ite_dd_req_num: null,
            ite_dd_med_id: null,
            ite_dd_lote: null,
            ite_dd_qtde: 0,
            ite_dd_qtde_retorno: 0,
        };

        super(connection, 'tb_itens_ddu', initFields, 'ite_dd_id');
    }

    get found(): boolean { return this._found; }

    set ite_dd_id(id: number) { this._fields.ite_dd_id = id; }
    get ite_dd_id(): number { return this._fields.ite_dd_id; }

    set ite_dd_req_num(req_num: string | null) { this._fields.ite_dd_req_num = req_num; }
    get ite_dd_req_num(): string | null { return this._fields.ite_dd_req_num; }

    set ite_dd_med_id(med_id: number | null) { this._fields.ite_dd_med_id = med_id; }
    get ite_dd_med_id(): number | null { return this._fields.ite_dd_med_id; }

    set ite_dd_lote(lote: string | null) { this._fields.ite_dd_lote = lote; }
    get ite_dd_lote(): string | null { return this._fields.ite_dd_lote; }

    set ite_dd_qtde(qtde: number) { this._fields.ite_dd_qtde = qtde; }
    get ite_dd_qtde(): number { return this._fields.ite_dd_qtde; }

    set ite_dd_qtde_retorno(qtde_retorno: number) { this._fields.ite_dd_qtde_retorno = qtde_retorno; }
    get ite_dd_qtde_retorno(): number { return this._fields.ite_dd_qtde_retorno; }

    async ListarItensPorRequisicao(pesq: string = '*', req_num: string): Promise<RowDataPacket[]> {

        let query: string = `SELECT 
                                i.ite_dd_id,
                                i.ite_dd_req_num,
                                i.ite_dd_med_id,
                                i.ite_dd_lote,
                                i.ite_dd_qtde,
                                i.ite_dd_qtde_retorno,
                                m.med_descr,
                                m.med_descr_coml
                              FROM itens_ddu i
                              LEFT JOIN tb_medicamentos m ON i.ite_dd_med_id = m.med_id
                              WHERE i.ite_dd_req_num = :req_num`;

        if (pesq !== '*') {
            query += ` AND (MATCH(m.med_descr,m.med_descr_coml) AGAINST(:pesq IN BOOLEAN MODE) OR i.ite_dd_lote LIKE CONCAT('%',:pesq,'%'))`;
        }

        query += " ORDER BY i.ite_dd_req_num";

        const [rows] = await this.ExecuteQuery(query, { req_num: req_num, pesq }) as [RowDataPacket[]];

        return rows;

    }

    async BuscarPorRequisicao(req_num: string, med_id: number, lote: string): Promise<RowDataPacket> {

        let query: string = `SELECT * FROM itens_ddu
                              WHERE ite_dd_req_num = :req_num AND i.ite_dd_med_id = :med_id AND i.ite_dd_lote = :lote`;

        const [rows] = await this.ExecuteQuery(query, { req_num: req_num, med_id: med_id, lote: lote }) as [RowDataPacket[]];

        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
        } else {
            this.populateFromInitial(this._initialFields);
            this._found = false;
        }

        return this._fields as RowDataPacket;
    }

}
