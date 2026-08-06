import { Connection, RowDataPacket } from "mysql2/promise";
import BaseModel, { iBaseModel } from "./BaseModel.js";

export interface iMedicamentosFields {
    med_id: number,
    med_descr: string | null,
    med_descr_coml: string | null,
    med_und: string | null,
    med_tipo_codigo: string | null,
    med_tipo_med: string | null,
    med_max: number | null,
    med_min: number | null,
    med_ui_cx: number | null,
    med_bona_codigo: string | null,
    med_alert: number | null,
    med_ativo: 0 | 1 | null,
    med_diag_id: number | null,
}

export default class Medicamentos extends BaseModel implements iMedicamentosFields, iBaseModel {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initialFields: iMedicamentosFields = {
            med_id: 0,
            med_descr: null,
            med_descr_coml: null,
            med_und: null,
            med_tipo_codigo: null,
            med_tipo_med: null,
            med_max: null,
            med_min: null,
            med_ui_cx: null,
            med_bona_codigo: null,
            med_alert: null,
            med_ativo: null,
            med_diag_id: null,
        }

        super(connection, 'tb_medicamentos', initialFields, 'med_id');
    }

    set med_id(id: number) { this._fields.med_id = id; }
    get med_id(): number { return this._fields.med_id; }

    set med_descr(descr: string | null) { this._fields.med_descr = descr; }
    get med_descr(): string | null { return this._fields.med_descr; }

    set med_descr_coml(descr_coml: string | null) { this._fields.med_descr_coml = descr_coml; }
    get med_descr_coml(): string | null { return this._fields.med_descr_coml; }

    set med_und(und: string | null) { this._fields.med_und = und; }
    get med_und(): string | null { return this._fields.med_und; }

    set med_tipo_codigo(tipo_codigo: string | null) { this._fields.med_tipo_codigo = tipo_codigo; }
    get med_tipo_codigo(): string | null { return this._fields.med_tipo_codigo; }

    set med_tipo_med(tipo_med: string | null) { this._fields.med_tipo_med = tipo_med; }
    get med_tipo_med(): string | null { return this._fields.med_tipo_med; }

    set med_max(max: number | null) { this._fields.med_max = max; }
    get med_max(): number | null { return this._fields.med_max; }

    set med_min(min: number | null) { this._fields.med_min = min; }
    get med_min(): number | null { return this._fields.med_min; }

    set med_ui_cx(ui_cx: number | null) { this._fields.med_ui_cx = ui_cx; }
    get med_ui_cx(): number | null { return this._fields.med_ui_cx; }

    set med_bona_codigo(bona_codigo: string | null) { this._fields.med_bona_codigo = bona_codigo; }
    get med_bona_codigo(): string | null { return this._fields.med_bona_codigo; }

    set med_alert(alert: number | null) { this._fields.med_alert = alert; }
    get med_alert(): number | null { return this._fields.med_alert; }

    set med_diag_id(diag_id: number | null) { this._fields.med_diag_id = diag_id; }
    get med_diag_id(): number | null { return this._fields.med_diag_id; }

    set med_ativo(ativo: 0 | 1 | null) { this._fields.med_ativo = ativo; }
    get med_ativo(): 0 | 1 | null { return this._fields.med_ativo; }

    async ListarTodos(pesq: string) {

        let query: string = `SELECT * FROM tb_medicamentos`;

        if (pesq !== '*') {
            query += ` WHERE MATCH(med_descr,med_descr_coml) AGAINST(:pesq IN BOOLEAN MODE) OR med_bona_codigo LIKE CONCAT('%',:pesq,'%')`;
        }

        const [rows] = await this.ExecuteQuery(query, { pesq }) as RowDataPacket[];

        return rows as iMedicamentosFields[];
    }

    async ListarAtivos(pesq: string) {

        let query: string = `SELECT * FROM tb_medicamentos WHERE med_ativo = 1`;

        if (pesq !== '*') {
            query += ` AND (MATCH(med_descr,med_descr_coml) AGAINST(:pesq IN BOOLEAN MODE) OR med_bona_codigo LIKE CONCAT('%',:pesq,'%'))`;
        }

        const [rows] = await this.ExecuteQuery(query, { pesq }) as RowDataPacket[];

        return rows as iMedicamentosFields[];
    }
}
