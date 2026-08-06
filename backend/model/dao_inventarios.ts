import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

enum eStatus {
    Aberto = 0,
    Fechado = 1,
}

export interface iInventariosFields {
    inv_id: number,
    inv_date: Date | string | null,
    inv_dep_id: number | null,
    inv_med_tipo_codigo: string | null,
    inv_status: eStatus | null,
    inv_mes_ref: number | null,
    inv_ano_ref: number | null,
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
            inv_mes_ref: null,
            inv_ano_ref: null,
        };

        super(connection, 'tb_inventarios', initFields, 'inv_id');

    }

    get found(): boolean {return this._found;}

    set inv_id(id: number) { this._fields.inv_id = id;}
    get inv_id(): number {return this._fields.inv_id;}

    set inv_date(date: Date | string | null) { this._fields.inv_date = date;}
    get inv_date(): Date | string | null {return this._fields.inv_date;}

    set inv_dep_id(dep_id: number | null) { this._fields.inv_dep_id = dep_id;}
    get inv_dep_id(): number | null {return this._fields.inv_dep_id;}

    set inv_med_tipo_codigo(med_tipo_codigo: string | null) { this._fields.inv_med_tipo_codigo = med_tipo_codigo;}
    get inv_med_tipo_codigo(): string | null {return this._fields.inv_med_tipo_codigo;}

    set inv_status(status: eStatus | null) { this._fields.inv_status = status;}
    get inv_status(): eStatus | null {return this._fields.inv_status;}

    set inv_mes_ref(mes_ref: number | null) { this._fields.inv_mes_ref = mes_ref;}
    get inv_mes_ref(): number | null {return this._fields.inv_mes_ref;}

    set inv_ano_ref(ano_ref: number | null) { this._fields.inv_ano_ref = ano_ref;}
    get inv_ano_ref(): number | null {return this._fields.inv_ano_ref;}

    public async ListarPorPeriodo(mes_ref: number, ano_ref: number, dep_id: number,status: eStatus): Promise<RowDataPacket[]> {

        const query: string = `SELECT * FROM 
            tb_inventarios i
            LEFT JOIN tb_depositos d ON d.dep_id = i.inv_dep_id
            LEFT JOIN tb_tipos_medicamentos t ON t.tipo_id = i.inv_med_tipo_codigo
            WHERE i.inv_dep_id = :dep_id AND i.inv_mes_ref = :mes_ref AND i.inv_ano_ref = :ano_ref`;

        const params: any = { mes_ref, ano_ref, dep_id, status };

        const [rows] = await this.ExecuteQuery(query, params) as [RowDataPacket[]];

        return rows;

    }

}
