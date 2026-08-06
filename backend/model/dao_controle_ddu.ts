import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iControleDduFields {
    cdd_id: number,
    cdd_date: Date | null,
    cdd_req_num: string | null,
    cdd_status: 0 | 1 | null,
    cdd_pac_id: number | null,
}

export default class ControleDdu extends BaseModel implements iControleDduFields, iBaseModel {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iControleDduFields = {
            cdd_id: 0,
            cdd_date: null,
            cdd_req_num: null,
            cdd_status: null,
            cdd_pac_id: null,
        };

        super(connection, 'tb_controle_ddu', initFields, 'cdd_id');

    }

    get found(): boolean { return this._found; }

    set cdd_id(id: number) { this._fields.cdd_id = id; }
    get cdd_id(): number { return this._fields.cdd_id; }

    set cdd_date(date: Date | null) { this._fields.cdd_date = date; }
    get cdd_date(): Date | null { return this._fields.cdd_date; }

    set cdd_req_num(req_num: string) { this._fields.cdd_req_num = req_num; }
    get cdd_req_num(): string { return this._fields.cdd_req_num; }

    set cdd_status(status: 0 | 1 | null) { this._fields.cdd_status = status; }
    get cdd_status(): 0 | 1 | null { return this._fields.cdd_status; }

    set cdd_pac_id(pac_id: number | null) { this._fields.cdd_pac_id = pac_id; }
    get cdd_pac_id(): number | null { return this._fields.cdd_pac_id; }

    public async Listar(pesq: string = '*'): Promise<RowDataPacket[]> {

        let query: string = `SELECT ddu.cdd_id,
                                    ddu.cdd_req_num, 
                                    ddu.cdd_date,  
                                    ddu.cdd_pac_id,                                  
                                    pac.nom_paciente as paciente,
                                    ddu.cdd_status
                              FROM tb_controle_ddu ddu
                              LEFT JOIN fsph_ambulatorio.tb_pacientes pac ON ddu.cdd_pac_id = pac.num_paciente`;

        if (pesq !== '*') {
            query += ` WHERE ddu.cdd_status = 0 AND (MATCH(pac.nom_paciente) AGAINST(:pesq IN BOOLEAN MODE))`;
        }

        const [rows] = await this.ExecuteQuery(query, { pesq }) as RowDataPacket[];

        return rows as RowDataPacket[];

    }

    async BuscarPorReqNum(req_num: string): Promise<void> {

        const query = `SELECT *
                        FROM tb_controle_ddu
                        WHERE cdd_req_num = :req_num LIMIT 1`;

        const [rows] = await this.ExecuteQuery(query, { req_num }) as RowDataPacket[];

        if (rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
        } else {
            this._found = false;
            this.populateFromInitial({
                cdd_id: 0,
                cdd_date: null,
                cdd_req_num: null,
                cdd_status: null,
                cdd_pac_id: null
            });
        }
    }

}
