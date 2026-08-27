import { Connection, RowDataPacket } from "mysql2/promise";
import BaseModel, { iBaseModel } from "./BaseModel.js";

export enum eStatus {
    Pendente = 0,
    Aprovada = 1,
    Reprovada = 2,
    Devolvido = 3
}

export interface iRequisicoesFields {
    req_id: number,
    req_num: string | null,
    req_tip_id: number | null
    req_pac_id: number | null,
    req_date: Date | string | null,
    req_dep_id: number | null,
    req_set_id: number | null,
    req_local_id: number | null,
    req_solicitado_por: string | null,
    req_dt_solicitacao: Date | string | null,
    req_aprovado_por: string | null,
    req_dt_aprovacao: Date | string | null,
    req_reprovado_por: string | null,
    req_dt_reprovacao: Date | string | null,
    req_jus_reprovacao: string | null,
    req_status: eStatus | null,
    req_observacao: string | null,
    req_num_devolucao: string | null
}

export default class Requisicoes extends BaseModel implements iRequisicoesFields, iBaseModel {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iRequisicoesFields = {
            req_id: 0,
            req_num: null,
            req_tip_id: null,
            req_pac_id: null,
            req_date: null,
            req_dep_id: null,
            req_set_id: null,
            req_local_id: null,
            req_solicitado_por: null,
            req_dt_solicitacao: null,
            req_aprovado_por: null,
            req_dt_aprovacao: null,
            req_reprovado_por: null,
            req_dt_reprovacao: null,
            req_jus_reprovacao: null,
            req_status: null,
            req_observacao: null,
            req_num_devolucao: null
        };

        super(connection, 'tb_requisicoes', initFields, 'req_id');
    }

    get found(): boolean { return this._found; }

    set req_id(id: number) { this._fields.req_id = id; }
    get req_id(): number { return this._fields.req_id; }

    set req_num(num: string | null) { this._fields.req_num = num; }
    get req_num(): string | null { return this._fields.req_num; }

    set req_tip_id(tip_id: number | null) { this._fields.req_tip_id = tip_id; }
    get req_tip_id(): number | null { return this._fields.req_tip_id; }

    set req_pac_id(pac_id: number | null) { this._fields.req_pac_id = pac_id; }
    get req_pac_id(): number | null { return this._fields.req_pac_id; }

    set req_date(date: Date | string | null) { this._fields.req_date = date; }
    get req_date(): Date | string | null { return this._fields.req_date; }

    set req_dep_id(dep_id: number | null) { this._fields.req_dep_id = dep_id; }
    get req_dep_id(): number | null { return this._fields.req_dep_id; }

    set req_local_id(local_id: number | null) { this._fields.req_local_id = local_id; }
    get req_local_id(): number | null { return this._fields.req_local_id; }

    set req_set_id(set_id: number | null) { this._fields.req_set_id = set_id; }
    get req_set_id(): number | null { return this._fields.req_set_id; }

    set req_solicitado_por(solicitado_por: string | null) { this._fields.req_solicitado_por = solicitado_por; }
    get req_solicitado_por(): string | null { return this._fields.req_solicitado_por; }

    set req_aprovado_por(aprovado_por: string | null) { this._fields.req_aprovado_por = aprovado_por; }
    get req_aprovado_por(): string | null { return this._fields.req_aprovado_por; }

    set req_dt_aprovacao(dt_aprovacao: Date | string | null) { this._fields.req_dt_aprovacao = dt_aprovacao; }
    get req_dt_aprovacao(): Date | string | null { return this._fields.req_dt_aprovacao; }

    set req_reprovado_por(reprovado_por: string | null) { this._fields.req_reprovado_por = reprovado_por; }
    get req_reprovado_por(): string | null { return this._fields.req_reprovado_por; }

    set req_dt_reprovacao(dt_reprovacao: Date | string | null) { this._fields.req_dt_reprovacao = dt_reprovacao; }
    get req_dt_reprovacao(): Date | string | null { return this._fields.req_dt_reprovacao; }

    set req_jus_reprovacao(jus_reprovacao: string | null) { this._fields.req_jus_reprovacao = jus_reprovacao; }
    get req_jus_reprovacao(): string | null { return this._fields.req_jus_reprovacao; }

    set req_dt_solicitacao(dt_solicitacao: Date | string | null) { this._fields.req_dt_solicitacao = dt_solicitacao; }
    get req_dt_solicitacao(): Date | string | null { return this._fields.req_dt_solicitacao; }

    set req_status(status: eStatus | null) { this._fields.req_status = status; }
    get req_status(): eStatus | null { return this._fields.req_status; }

    set req_observacao(observacao: string | null) { this._fields.req_observacao = observacao };
    get req_observacao(): string | null { return this._fields.req_observacao }

    set req_num_devolucao(num_devolucao: string | null) { this._fields.req_num_devolucao = num_devolucao }
    get req_num_devolucao(): string | null { return this._fields.req_num_devolucao }

    public async ListarPorPeriodo(dat_ini: string | Date, dat_fim: string | Date, dep_id: number): Promise<RowDataPacket[]> {

        const query: string = `SELECT * FROM vw_requisicoes WHERE data >= :dat_ini AND data <= :dat_fim AND req_dep_id = :dep_id AND status = 1`;

        const [rows] = await this.ExecuteQuery(query, { dat_ini, dat_fim, dep_id }) as RowDataPacket[];

        return rows as RowDataPacket[];

    }

    public async ListarRequisicoesNaoAprovadas(): Promise<RowDataPacket[]> {

        const query: string = `SELECT * FROM vw_requisicoes_nao_aprovadas WHERE status = 0`;

        const [rows] = await this.ExecuteQuery(query) as RowDataPacket[];

        return rows as RowDataPacket[];

    }

    public async BuscarDadosImpressao(req_id: number): Promise<RowDataPacket | null> {

        const query = `SELECT * FROM vw_dados_impressao WHERE req_id = :req_id`;

        const [rows] = await this.ExecuteQuery(query, { req_id }) as [RowDataPacket[]];

        return rows[0] ?? null;

    }

    public async BuscarPorNum(req_num: string): Promise<RowDataPacket> {

        const query = `SELECT * FROM tb_requisicoes WHERE req_num = :req_num`;

        const [rows] = await this.ExecuteQuery(query, { req_num }) as [RowDataPacket[]];

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
