import { Connection, RowDataPacket } from 'mysql2/promise'
import BaseModel, { iBaseModel } from './BaseModel.js'
import { iSetoresFields } from './doa_setores.js';

export interface iItensRequisicoesFields {
    ite_id: number | null,
    ite_req_id: number | null,
    ite_med_id: number | null,
    ite_lote: number | null,
    ite_validade: string | null,
    ite_qtde: number | null
}

export default class ItensRequisicoes extends BaseModel implements iItensRequisicoesFields, iBaseModel {

    private connection: Connection;

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error('Conexão com o banco de dados não estabelecida.');
        }

        const initFields: iItensRequisicoesFields = {
            ite_id: 0,
            ite_req_id: null,
            ite_med_id: null,
            ite_lote: null,
            ite_validade: null,
            ite_qtde: null
        }

        super(connection, 'tb_itens_requisicoes', initFields, 'ite_id');
        this.connection = connection;
    }

    get found(): boolean { return this._found }
    set ite_id(id: number) { this._fields.ite_id = id }
    get ite_id(): number { return this._fields.ite_id }

    set ite_req_id(id: number) { this._fields.ite_req_id = id }
    get ite_req_id(): number { return this._fields.ite_req_id }

    set ite_med_id(id: number) { this._fields.ite_med_id = id }
    get ite_med_id(): number { return this._fields.ite_med_id }

    set ite_lote(lote: number | null) { this._fields.ite_lote = lote }
    get ite_lote(): number | null { return this._fields.ite_lote }

    set ite_validade(validade: string | null) { this._fields.ite_validade = validade }
    get ite_validade(): string | null { return this._fields.ite_validade }

    set ite_qtde(qtde: number | null) { this._fields.ite_qtde = qtde }
    get ite_qtde(): number | null { return this._fields.ite_qtde }

    async ListarItensRequisicoes(req_id: number): Promise<RowDataPacket[]> {

        let query = `SELECT ir.ite_id, ir.ite_med_id, m.med_descr, m.med_und, ir.ite_lote, ir.ite_validade, ir.ite_qtde
                     FROM tb_itens_requisicoes ir
                     LEFT JOIN tb_medicamentos m ON ir.ite_med_id = m.med_id
                     WHERE ir.ite_req_id = :req_id`;

        const [rows] = await this.ExecuteQuery(query, { req_id: req_id }) as [RowDataPacket[]];

        return rows as RowDataPacket[];

    }

    async ListarItensParaImpressao(req_id: number): Promise<RowDataPacket[]> {

        const query = `SELECT ir.ite_id, ir.ite_med_id, m.med_bona_codigo, m.med_descr, m.med_descr_coml,
                              m.med_und, ir.ite_lote, ir.ite_validade, ir.ite_qtde
                       FROM tb_itens_requisicoes ir
                       LEFT JOIN tb_medicamentos m ON ir.ite_med_id = m.med_id
                       WHERE ir.ite_req_id = :req_id
                       ORDER BY m.med_descr, ir.ite_lote`;

        const [rows] = await this.ExecuteQuery(query, { req_id }) as [RowDataPacket[]];

        return rows as RowDataPacket[];

    }

    async ExcluirPorRequisicao(req_id: number): Promise<void> {

        const query = `DELETE FROM tb_itens_requisicoes WHERE ite_req_id = :req_id`;

        await this.connection.query(query, { req_id });

    }

    async ContarPorRequisicao(req_id: number): Promise<number> {

        const query = `SELECT COUNT(*) as total FROM tb_itens_requisicoes WHERE ite_req_id = :req_id`;

        const [rows] = await this.connection.query<RowDataPacket[]>(query, { req_id });

        return Number(rows[0]?.total || 0);

    }

}
