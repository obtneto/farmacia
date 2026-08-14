import { Connection, RowDataPacket } from 'mysql2/promise'
import BaseModel, { iBaseModel } from './BaseModel.js'

export interface iEstoqueFields {
  est_id: number
  est_dep_id: number | null
  est_med_id: number | null
  est_lote: string | null
  est_saldo_disponivel: number
  est_saldo_bloqueado: number
  est_validade: Date | string | null
}

export default class Estoque extends BaseModel implements iEstoqueFields, iBaseModel {
  private connection: Connection

  constructor(connection: Connection) {
    if (!connection) {
      throw new Error('Conexão com o banco de dados não estabelecida.')
    }

    const initFields: iEstoqueFields = {
      est_id: 0,
      est_dep_id: null,
      est_med_id: null,
      est_lote: null,
      est_saldo_disponivel: 0,
      est_saldo_bloqueado: 0,
      est_validade: null,
    }

    super(connection, 'tb_estoque', initFields, 'est_id')
    this.connection = connection
  }

  get found(): boolean { return this._found }
  set est_id(id: number) { this._fields.est_id = id }

  get est_id(): number { return this._fields.est_id }
  set est_dep_id(dep_id: number | null) { this._fields.est_dep_id = dep_id }

  get est_dep_id(): number | null { return this._fields.est_dep_id }

  set est_med_id(med_id: number | null) { this._fields.est_med_id = med_id }

  get est_med_id(): number | null { return this._fields.est_med_id }
  set est_lote(lote: string | null) { this._fields.est_lote = lote }

  get est_lote(): string | null { return this._fields.est_lote }
  set est_saldo_disponivel(saldo_disponivel: number) { this._fields.est_saldo_disponivel = saldo_disponivel }

  get est_saldo_disponivel(): number { return this._fields.est_saldo_disponivel }
  set est_saldo_bloqueado(saldo_bloqueado: number) { this._fields.est_saldo_bloqueado = saldo_bloqueado }

  get est_saldo_bloqueado(): number { return this._fields.est_saldo_bloqueado }
  set est_validade(validade: Date | string | null) { this._fields.est_validade = validade }

  get est_validade(): Date | string | null { return this._fields.est_validade }

  async ListarAtivos(pesq: string = '', dep_id: number, med_tipo_codigo: string): Promise<RowDataPacket[]> {

    let query = `SELECT e.est_id AS id,e.est_id AS est_id,m.med_id AS medicamento_id,m.med_descr AS descricao,m.med_descr_coml AS descricao_comercial,
                  m.med_und AS unidade, e.est_lote AS lote,e.est_saldo_bloqueado AS saldo_bloqueado,
                  e.est_saldo_disponivel AS saldo_disponivel, e.est_validade AS validade,m.med_alert AS alerta_validade,
                CASE
                  WHEN DATEDIFF(e.est_validade, CURDATE()) < 0 THEN '-'
                  ELSE DATEDIFF(e.est_validade, CURDATE())
                END AS dias_para_validade
                FROM tb_estoque e
                LEFT JOIN tb_medicamentos m ON e.est_med_id = m.med_id
                WHERE e.est_dep_id = :dep_id AND e.est_saldo_disponivel > 0
                AND m.med_tipo_codigo = :med_tipo_codigo`

    if (pesq !== '*') {
      query += ` AND ( MATCH(m.med_descr,m.med_descr_coml) AGAINST(:pesq IN BOOLEAN MODE) OR e.est_lote LIKE CONCAT('%',:pesq,'%'))`
    }

    const [rows] = await this.ExecuteQuery(query, { dep_id, med_tipo_codigo, pesq }) as [RowDataPacket[]]

    return rows as RowDataPacket[]
  }

  async BuscarPorItemEstoque(dep_id: number, med_id: number, lote: string): Promise<RowDataPacket> {

    const query = `SELECT * FROM tb_estoque WHERE est_dep_id = :dep_id AND est_med_id = :med_id AND est_lote = :lote`

    const [rows] = await this.connection.query(query, { dep_id, med_id, lote }) as [RowDataPacket[], unknown]

    if (rows && rows.length > 0) {
      this.populateFromRow(rows[0])
      this._found = true
    } else {
      this._found = false
      this.populateFromInitial({
        est_id: 0,
        est_dep_id: null,
        est_med_id: null,
        est_lote: null,
        est_saldo_disponivel: 0,
        est_saldo_bloqueado: 0,
        est_validade: null,
      })
    }

    return this._fields as RowDataPacket
  }

  async BuscarPorItemEstoqueForUpdate(dep_id: number, med_id: number, lote: string): Promise<RowDataPacket> {

    const query = `SELECT * FROM tb_estoque WHERE est_dep_id = :dep_id AND est_med_id = :med_id AND est_lote = :lote FOR UPDATE`

    const [rows] = await this.connection.query(query, { dep_id, med_id, lote }) as [RowDataPacket[], unknown]

    if (rows && rows.length > 0) {
      this.populateFromRow(rows[0])
      this._found = true
    } else {
      this._found = false
      this.populateFromInitial({
        est_id: 0,
        est_dep_id: null,
        est_med_id: null,
        est_lote: null,
        est_saldo_disponivel: 0,
        est_saldo_bloqueado: 0,
        est_validade: null,
      })
    }

    return this._fields as RowDataPacket
  }
}
