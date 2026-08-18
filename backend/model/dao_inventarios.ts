import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export enum eStatus {
    Aberto = 0,
    Fechado = 1,
}

export interface iInventariosFields {
    inv_id: number,
    inv_date: Date | string | null,
    inv_dep_id: number | null,
    inv_med_tipo_codigo: string | null,
    inv_status: eStatus | null,
    inv_tipo: string | null,
    inv_num: string | null,
    tipo_descr?: string | null,
    dep_descr?: string | null,
}

export default class Inventarios extends BaseModel implements iBaseModel, iInventariosFields {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iInventariosFields = {
            inv_id: 0,
            inv_date: null,
            inv_dep_id: null,
            inv_med_tipo_codigo: null,
            inv_status: null,
            inv_tipo: null,
            inv_num: null
        };

        super(connection, 'tb_inventarios', initFields, 'inv_id');

    }

    get found(): boolean { return this._found; }

    set inv_id(id: number) { this._fields.inv_id = id; }
    get inv_id(): number { return this._fields.inv_id; }

    set inv_date(date: Date | string | null) { this._fields.inv_date = date; }
    get inv_date(): Date | string | null { return this._fields.inv_date; }

    set inv_dep_id(dep_id: number | null) { this._fields.inv_dep_id = dep_id; }
    get inv_dep_id(): number | null { return this._fields.inv_dep_id; }

    set inv_med_tipo_codigo(med_tipo_codigo: string | null) { this._fields.inv_med_tipo_codigo = med_tipo_codigo; }
    get inv_med_tipo_codigo(): string | null { return this._fields.inv_med_tipo_codigo; }

    set inv_status(status: eStatus | null) { this._fields.inv_status = status; }
    get inv_status(): eStatus | null { return this._fields.inv_status; }

    set inv_tipo(tipo: string | null) { this._fields.inv_tipo = tipo; }
    get inv_tipo(): string | null { return this._fields.inv_tipo; }

    set inv_num(num: string | null) { this._fields.inv_num = num; }
    get inv_num(): string | null { return this._fields.inv_num; }

    public async ListarPorPeriodo(date_ini: String, date_fin: String, dep_id: number): Promise<iInventariosFields[]> {

        const query: string = `SELECT d.dep_descr,i.inv_id,i.inv_num,i.inv_date,i.inv_med_tipo_codigo,t.tipo_descr,i.inv_status,i.inv_tipo FROM 
            tb_inventarios i
            LEFT JOIN tb_depositos d ON d.dep_id = i.inv_dep_id
            LEFT JOIN tb_tipos_medicamentos t ON t.tipo_codigo = i.inv_med_tipo_codigo
            WHERE i.inv_dep_id = :dep_id  
            AND STR_TO_DATE(:date_ini, '%Y/%m/%d') <= i.inv_date AND STR_TO_DATE(:date_fin, '%Y/%m/%d') >= i.inv_date`;

        const params: any = { date_ini, date_fin, dep_id };

        const [rows] = await this.ExecuteQuery(query, params) as [iInventariosFields[]];

        return rows as iInventariosFields[];

    }

    public async BuscarPorNum(inv_num: string): Promise<iInventariosFields> {

        const query: string = `
            SELECT 
                d.dep_descr,i.inv_id,i.inv_num,i.inv_date,i.inv_dep_id,i.inv_med_tipo_codigo,t.tipo_descr,i.inv_status,i.inv_tipo 
            FROM 
                tb_inventarios i
                LEFT JOIN tb_depositos d ON d.dep_id = i.inv_dep_id
                LEFT JOIN tb_tipos_medicamentos t ON t.tipo_codigo = i.inv_med_tipo_codigo
            WHERE 
                i.inv_num = :inv_num`;

        const [rows] = await this.ExecuteQuery(query, { inv_num }) as [iInventariosFields[]];

        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
        } else {
            this.populateFromInitial(this._initialFields);
            this._found = false;
        }

        return this._fields;
    }

}
