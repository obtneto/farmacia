import { Connection, RowDataPacket } from "mysql2/promise";
import BaseModel, { iBaseModel } from "./BaseModel.js";

export interface iEntradaFields {
    ent_id: number;
    ent_dep_id: number | null,
    ent_date: Date | string | null,
    ent_doc: string | null,
    ent_for_id: number | null,
    ent_pac_id: number | null,
    ent_status: number | null,
    ent_user_digit: string | null,
    ent_dt_digit: Date | string | null,
    ent_user_aprov: string | null,
    ent_dt_aprov: Date | string | null
}

export default class Entradas extends BaseModel implements iEntradaFields, iBaseModel {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initialFields: iEntradaFields = {
            ent_id: 0,
            ent_date: null,
            ent_doc: null,
            ent_for_id: null,
            ent_dep_id: null,
            ent_pac_id: null,
            ent_status: null,
            ent_user_digit: null,
            ent_dt_digit: null,
            ent_user_aprov: null,
            ent_dt_aprov: null
        };

        super(connection, 'tb_entradas', initialFields, 'ent_id');
    }

    get found(): boolean { return this._found; }

    set ent_id(ent_id: number) { this._fields.ent_id = ent_id; }
    get ent_id(): number { return this._fields.ent_id; }

    set ent_dep_id(dep_id: number | null) { this._fields.ent_dep_id = dep_id }
    get ent_dep_id(): number | null { return this._fields.ent_dep_id }

    set ent_date(ent_date: Date | string | null) { this._fields.ent_date = ent_date; }
    get ent_date(): Date | string | null { return this._fields.ent_date; }

    set ent_doc(ent_doc: string | null) { this._fields.ent_doc = ent_doc; }
    get ent_doc(): string | null { return this._fields.ent_doc; }

    set ent_for_id(ent_for_id: number | null) { this._fields.ent_for_id = ent_for_id; }
    get ent_for_id(): number | null { return this._fields.ent_for_id; }

    set ent_pac_id(pac_id: number | null) { this._fields.ent_pac_id = pac_id }
    get ent_pac_id(): number | null { return this._fields.ent_pac_id }

    set ent_status(ent_status: number | null) { this._fields.ent_status = ent_status }
    get ent_status(): number | null { return this._fields.ent_status }

    set ent_user_digit(ent_user_digit: string | null) { this._fields.ent_user_digit = ent_user_digit; }
    get ent_user_digit(): string | null { return this._fields.ent_user_digit; }

    set ent_dt_digit(ent_dt_digit: Date | string | null) { this._fields.ent_dt_digit = ent_dt_digit; }
    get ent_dt_digit(): Date | string | null { return this._fields.ent_dt_digit; }

    set ent_user_aprov(ent_user_aprov: string | null) { this._fields.ent_user_aprov = ent_user_aprov; }
    get ent_user_aprov(): string | null { return this._fields.ent_user_aprov; }

    set ent_dt_aprov(ent_dt_aprov: Date | string | null) { this._fields.ent_dt_aprov = ent_dt_aprov; }
    get ent_dt_aprov(): Date | string | null { return this._fields.ent_dt_aprov; }

    async ListarPeriodo(pesq: string, data_inicio: String, data_fim: String): Promise<RowDataPacket[]> {

        let query = `SELECT
                        e.ent_id AS id,
                        e.ent_date AS data,
                        e.ent_doc AS documento,
                        f.for_razao_social AS fornecedor,
                        e.ent_status AS status,
                        d.dep_descr AS deposito,
                        e.ent_user_digit AS user_digitacao,
                        e.ent_dt_digit AS dt_digitacao,
                        e.ent_user_aprov AS user_aprovacao,
                        e.ent_dt_aprov AS dt_aprovacao
                     FROM tb_entradas e
                     LEFT JOIN tb_fornecedores f ON f.for_id = e.ent_for_id
                     LEFT JOIN tb_depositos d ON d.dep_id = e.ent_dep_id
                     LEFT JOIN fsph_ambulatorio.tb_pacientes p ON p.num_paciente = e.ent_pac_id
                     WHERE (e.ent_date >= :data_inicio AND e.ent_date <= :data_fim) AND e.ent_status = 1`;

        if (pesq !== '*' && pesq.length > 0) {

            query += ` AND (
                e.ent_doc LIKE CONCAT('%', :pesq, '%') OR
                MATCH(f.for_razao_social,f.for_nome_fantasia) AGAINST(:pesq IN BOOLEAN MODE)
            )`;
        }

        query += `
            ORDER BY e.ent_id DESC`;

        const [rows] = await this.ExecuteQuery(query, {
            pesq,
            data_inicio,
            data_fim
        });

        return rows as RowDataPacket[];
    }

    async ListarEntradasNaoAprovados(pesq: string, data_inicio: String, data_fim: String, dep_id: number): Promise<RowDataPacket[]> {

        let query = `SELECT
                        e.ent_id AS id,
                        e.ent_date AS data,
                        e.ent_doc AS documento,
                        CONCAT(f.for_razao_social, ' - ', f.for_nome_fantasia) AS fornecedor,
                        e.ent_status AS status,
                        d.dep_descr AS deposito,
                        p.nom_paciente AS paciente,
                        e.ent_user_digit AS user_digitacao,
                        e.ent_dt_digit AS dt_digitacao
                     FROM tb_entradas e
                     LEFT JOIN tb_fornecedores f ON f.for_id = e.ent_for_id
                     LEFT JOIN tb_depositos d ON d.dep_id = e.ent_dep_id
                     LEFT JOIN fsph_ambulatorio.tb_pacientes p ON p.num_paciente = e.ent_pac_id 
                     WHERE e.ent_status = 0 AND e.ent_dep_id = :dep_id AND (e.ent_date >= :data_inicio
                       AND e.ent_date <= :data_fim)`;

        const [rows] = await this.ExecuteQuery(query, {
            data_inicio,
            data_fim,
            dep_id
        });

        return rows as RowDataPacket[];

    }

}
