import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iBonameFields {
    bona_id: number,
    bona_codigo: string | null,
    bona_descr: string | null,
    bona_qt_ui: number | null,
    bona_ativo: 0 | 1 | null,
    bona_diag_id: number | null,
}

export interface iBonamePrintFields extends iBonameFields {
    diag_descr: string | null,
}

export default class Boname extends BaseModel implements iBonameFields, iBaseModel {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initialFields: iBonameFields = {
            bona_id: 0,
            bona_codigo: null,
            bona_descr: null,
            bona_qt_ui: null,
            bona_ativo: null,
            bona_diag_id: null,

        }

        super(connection, 'tb_boname', initialFields, 'bona_id');
    }

    set bona_id(id: number) { this._fields.bona_id = id; }
    get bona_id(): number { return this._fields.bona_id; }

    set bona_codigo(codigo: string | null) { this._fields.bona_codigo = codigo; }
    get bona_codigo(): string | null { return this._fields.bona_codigo; }

    set bona_descr(descr: string | null) { this._fields.bona_descr = descr; }
    get bona_descr(): string | null { return this._fields.bona_descr; }

    set bona_qt_ui(qt_ui: number | null) { this._fields.bona_qt_ui = qt_ui; }
    get bona_qt_ui(): number | null { return this._fields.bona_qt_ui; }

    set bona_diag_id(diag_id: number | null) { this._fields.bona_diag_id = diag_id; }
    get bona_diag_id(): number | null { return this._fields.bona_diag_id; }

    set bona_ativo(ativo: 0 | 1 | null) { this._fields.bona_ativo = ativo; }
    get bona_ativo(): 0 | 1 | null { return this._fields.bona_ativo; }

    async ListarTodos(pesq: string): Promise<iBonameFields[]> {

        let query: string = `SELECT * FROM tb_boname`;

        if (pesq !== '*') {
            query += " WHERE bona_descr LIKE :pesq OR bona_codigo LIKE :pesq";
        }

        const [rows] = await this.ExecuteQuery(query, { pesq: `%${pesq}%` }) as RowDataPacket[];

        return rows as iBonameFields[];
    }

    async ListarAtivos(pesq: string): Promise<iBonameFields[]> {

        let query: string = `SELECT * FROM tb_boname WHERE bona_ativo = 1`;

        if (pesq !== '*') {
            query += " AND (bona_descr LIKE :pesq OR bona_codigo LIKE :pesq)";
        }

        const [rows] = await this.ExecuteQuery(query, { pesq: `%${pesq}%` }) as RowDataPacket[];

        return rows as iBonameFields[];
    }

    async ListarParaImpressao(pesq: string): Promise<iBonamePrintFields[]> {

        let query: string = `
            SELECT
                b.*,
                d.diag_descr
            FROM tb_boname b
            LEFT JOIN tb_diagnosticos d ON d.diag_id = b.bona_diag_id
        `;

        if (pesq !== '*') {
            query += " WHERE MATCH(bona_descr,bona_codigo) AGAINST(:pesq)";
        }

        query += " ORDER BY b.bona_ativo DESC, b.bona_descr ASC";

        const [rows] = await this.ExecuteQuery(query, { pesq }) as RowDataPacket[];

        return rows as iBonamePrintFields[];
    }

    async BuscarPorCodigo(codigo: string): Promise<void> {

        const query = `SELECT * FROM tb_boname WHERE bona_codigo = :codigo LIMIT 1`;
        const [rows] = await this.ExecuteQuery(query, { codigo }) as RowDataPacket[];

        if (rows.length > 0) {
            this.populateFromRow(rows[0]);
        } else {
            this._found = false;
            this.populateFromInitial({
                bona_id: 0,
                bona_codigo: null,
                bona_descr: null,
                bona_qt_ui: null,
                bona_ativo: null,
                bona_diag_id: null,
            });
        }
    }

}
