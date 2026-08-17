import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iMovimentacoesFields {
    mov_id: number,
    mov_date: Date | null,
    mov_tipo: string | null,
    mov_descr: string | null,
    mov_qtde: number | null,
    mov_med_id: number | null,
    mov_med_lote: string | null,
    mov_documento: string | null,
    mov_user: string | null
}

export default class Movimentacoes extends BaseModel implements iMovimentacoesFields, iBaseModel {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iMovimentacoesFields = {
            mov_id: 0,
            mov_date: null,
            mov_tipo: null,
            mov_descr: null,
            mov_qtde: null,
            mov_med_id: null,
            mov_med_lote: null,
            mov_documento: null,
            mov_user: null
        };

        super(connection, 'tb_movimentacoes', initFields, 'mov_id');

    }

    get found(): boolean { return this._found; }

    set mov_id(id: number) { this._fields.mov_id = id; }
    get mov_id(): number { return this._fields.mov_id; }

    set mov_date(date: Date | null) { this._fields.mov_date = date; }
    get mov_date(): Date | null { return this._fields.mov_date; }

    set mov_tipo(tipo: string | null) { this._fields.mov_tipo = tipo; }
    get mov_tipo(): string | null { return this._fields.mov_tipo; }

    set mov_descr(descr: string | null) { this._fields.mov_descr = descr; }
    get mov_descr(): string | null { return this._fields.mov_descr; }

    set mov_qtde(qtde: number | null) { this._fields.mov_qtde = qtde; }
    get mov_qtde(): number | null { return this._fields.mov_qtde; }

    set mov_med_id(med_id: number | null) { this._fields.mov_med_id = med_id }
    get mov_med_id(): number | null { return this._fields.mov_med_id }

    set mov_med_lote(med_lote: string | null) { this._fields.mov_med_lote = med_lote }
    get mov_med_lote(): string | null { return this._fields.mov_med_lote }

    set mov_documento(mov_documento: string | null) { this._fields.mov_documento = mov_documento }
    get mov_documento(): string | null { return this._fields.mov_documento }

    set mov_user(mov_user: string | null) { this._fields.mov_user = mov_user }
    get mov_user(): string | null { return this._fields.mov_user }

    public async Listar(pesq: string, data_ini: string, data_fim: string, tipo_med: string): Promise<RowDataPacket[]> {

        let query: string = `SELECT mv.*, md.med_descr
                             FROM tb_movimentacoes mv
                             LEFT JOIN tb_medicamentos md ON mv.mov_med_id = md.med_id
                             WHERE mv.mov_date >= :data_ini AND mv.mov_date <= :data_fim AND md.med_tipo_codigo = :tipo_med
                            `;

        if (pesq !== '*') {
            query += ` AND (md.med_descr LIKE :pesq OR mv.mov_med_lote LIKE :pesq OR mv.mov_documento LIKE :pesq) 
                        ORDER BY mv.mov_id,md.med_id,mv.mov_med_lote`;
        }

        const [rows] = await this.ExecuteQuery(query, { pesq: `%${pesq}%`, data_ini, data_fim, tipo_med }) as [RowDataPacket[]];

        return rows as RowDataPacket[];

    }

    public async ListarPorMedicamento(med_id: number): Promise<RowDataPacket[]> {

        let query: string = `SELECT mv.*, md.med_descr
                             FROM tb_movimentacoes mv
                             LEFT JOIN tb_medicamentos md ON 
                             mv.mov_med_id = md.med_id AND (mv.mov_descr LIKE :pesq OR md.med_descr LIKE :pesq)
                             WHERE mv.mov_med_id = :med_id
                             ORDER BY mv.mov_id,md.med_id,mv.mov_med_lote`;

        const [rows] = await this.ExecuteQuery(query, { med_id }) as [RowDataPacket[]];

        return rows as RowDataPacket[];

    }
}
