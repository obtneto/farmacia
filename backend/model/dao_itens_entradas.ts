import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iItemEntradaFields {
    ite_id: number;
    ite_ent_id: number | null;
    ite_ent_med_id: number | null;
    ite_ent_lote: string | null;
    ite_ent_lote_validade: Date | string | null;
    ite_ent_qtde: number | null;
}

export interface iReciboEntradaCabecalho {
    ent_id: number;
    ent_date: Date | string | null;
    ent_doc: string | null;
    ent_pac_id: number | null;
    paciente: string | null;
}

export interface iReciboEntradaItem {
    codigo: number | null;
    medicamento: string | null;
    und: string | number | null;
    lote: string | null;
    qtde: number | null;
    validade: Date | string | null;
}

export default class ItensEntradas extends BaseModel implements iBaseModel, iItemEntradaFields {
    constructor(connection: Connection) {
        if (!connection) {
            throw new Error('Conexão com o banco de dados não estabelecida.');
        }

        const initialFields: iItemEntradaFields = {
            ite_id: 0,
            ite_ent_id: null,
            ite_ent_med_id: null,
            ite_ent_lote: null,
            ite_ent_lote_validade: null,
            ite_ent_qtde: null,
        };

        super(connection, 'tb_itens_entradas', initialFields, 'ite_id');
    }

    get found(): boolean { return this._found; }

    set ite_id(ite_id: number) { this._fields.ite_id = ite_id; }
    get ite_id(): number { return this._fields.ite_id; }

    set ite_ent_id(ite_ent_id: number | null) { this._fields.ite_ent_id = ite_ent_id; }
    get ite_ent_id(): number | null { return this._fields.ite_ent_id; }

    set ite_ent_med_id(ite_ent_med_id: number | null) { this._fields.ite_ent_med_id = ite_ent_med_id; }
    get ite_ent_med_id(): number | null { return this._fields.ite_ent_med_id; }

    set ite_ent_lote(ite_ent_lote: string | null) { this._fields.ite_ent_lote = ite_ent_lote; }
    get ite_ent_lote(): string | null { return this._fields.ite_ent_lote; }

    set ite_ent_lote_validade(ite_ent_lote_validade: Date | string | null) { this._fields.ite_ent_lote_validade = ite_ent_lote_validade; }
    get ite_ent_lote_validade(): Date | string | null { return this._fields.ite_ent_lote_validade; }

    set ite_ent_qtde(ite_ent_qtde: number | null) { this._fields.ite_ent_qtde = ite_ent_qtde; }
    get ite_ent_qtde(): number | null { return this._fields.ite_ent_qtde; }

    public async ListarItens(ent_id: number): Promise<RowDataPacket[]> {
        const query = `SELECT i.ite_id AS id,
                              i.ite_ent_med_id AS id_medicacao,
                              m.med_descr AS medicacao,
                              m.med_descr_coml AS 'descricao comercial',
                              i.ite_ent_lote AS lote,
                              i.ite_ent_lote_validade AS validade,
                              i.ite_ent_qtde AS quantidade
                         FROM tb_itens_entradas i
                         LEFT JOIN tb_medicamentos m ON m.med_id = i.ite_ent_med_id
                        WHERE i.ite_ent_id = :ent_id`;

        const [rows] = await this.ExecuteQuery(query, { ent_id }) as [RowDataPacket[]];
        return rows as RowDataPacket[];
    }

    public async BuscarCabecalhoRecibo(ent_id: number): Promise<iReciboEntradaCabecalho | null> {
        const query = `SELECT e.ent_id,
                              e.ent_date,
                              e.ent_doc,
                              e.ent_pac_id,
                              p.nom_paciente AS paciente
                         FROM tb_entradas e
                         LEFT JOIN fsph_ambulatorio.tb_pacientes p ON p.num_paciente = e.ent_pac_id
                        WHERE e.ent_id = :ent_id
                        LIMIT 1`;

        const [rows] = await this.ExecuteQuery(query, { ent_id }) as [RowDataPacket[]];

        return rows[0] ? rows[0] as iReciboEntradaCabecalho : null;
    }

    public async ListarItensRecibo(ent_id: number): Promise<iReciboEntradaItem[]> {
        const query = `SELECT i.ite_ent_med_id AS codigo,
                              m.med_descr AS medicamento,
                              COALESCE(NULLIF(TRIM(CAST(m.med_ui_cx AS CHAR)), ''), m.med_und) AS und,
                              i.ite_ent_lote AS lote,
                              i.ite_ent_qtde AS qtde,
                              i.ite_ent_lote_validade AS validade
                         FROM tb_itens_entradas i
                         LEFT JOIN tb_medicamentos m ON m.med_id = i.ite_ent_med_id
                        WHERE i.ite_ent_id = :ent_id
                        ORDER BY m.med_descr, i.ite_id`;

        const [rows] = await this.ExecuteQuery(query, { ent_id }) as [RowDataPacket[]];
        return rows as iReciboEntradaItem[];
    }

    public async ExcluirPorEntrada(ent_id: number): Promise<void> {
        await this.ExecuteQuery('DELETE FROM tb_itens_entradas WHERE ite_ent_id = :ent_id', { ent_id });
    }
}
