import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iDiagnosticosFields {
    diag_id: number,
    diag_descr: string | null,
    diag_ativo: number | null
}

export default class Diagnosticos extends BaseModel implements iDiagnosticosFields, iBaseModel {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iDiagnosticosFields = {
            diag_id: 0,
            diag_descr: null,
            diag_ativo: null
        };

        super(connection, 'tb_diagnosticos', initFields, 'diag_id');
    }

    set diag_id(id: number) { this._fields.diag_id = id; }
    get diag_id(): number { return this._fields.diag_id; }

    set diag_descr(descr: string) { this._fields.diag_descr = descr; }
    get diag_descr(): string { return this._fields.diag_descr; }

    set diag_ativo(ativo: number) { this._fields.diag_ativo = ativo; }
    get diag_ativo(): number { return this._fields.diag_ativo; }

    public async Listar(pesq: string): Promise<iDiagnosticosFields[]> {

        let query: string = "SELECT * FROM tb_diagnosticos";

        if (pesq !== '*') {
            query += " WHERE MATCH(diag_descr) AGAINST(:pesq IN BOOLEAN MODE)";
        }

        const [rows] = await this.ExecuteQuery(query, { pesq }) as RowDataPacket[];

        return rows as iDiagnosticosFields[];

    }

    public async ListarAtivos(pesq: string): Promise<iDiagnosticosFields[]> {

        let query: string = "SELECT * FROM tb_diagnosticos WHERE diag_ativo = 1";

        if (pesq !== '*') {
            query += " AND MATCH(diag_descr) AGAINST(:pesq IN BOOLEAN MODE)";
        }

        const [rows] = await this.ExecuteQuery(query, { pesq }) as RowDataPacket[];

        return rows as iDiagnosticosFields[];

    }

}