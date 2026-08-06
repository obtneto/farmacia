import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iSolicitacoesFields {
  sol_id: number | null,
  sol_date: Date | string | null,
  sol_dep_ori_id: number | null,
  sol_dep_des_id: number | null,
  sol_user_create: string | null,
  sol_user_aprov: string | null,
  sol_date_aprov: Date | string | null,
  sol_status: number | null,
  sol_obs: string | null,
}

export default class Solicitacoes extends BaseModel implements iBaseModel, iSolicitacoesFields {

  constructor(connection: Connection) {

    if (!connection) {
      throw new Error("Conexão com o banco de dados não estabelecida.");
    }

    const initFields: iSolicitacoesFields = {
      sol_id: 0,
      sol_date: null,
      sol_dep_ori_id: null,
      sol_dep_des_id: null,
      sol_user_create: null,
      sol_user_aprov: null,
      sol_date_aprov: null,
      sol_status: null,
      sol_obs: null,
    };

    super(connection, 'tb_solicitacoes', initFields, 'sol_id');

  }

  get found(): boolean { return this._found; }

  set sol_id(id: number) { this._fields.sol_id = id; }
  get sol_id(): number { return this._fields.sol_id; }

  set sol_date(date: Date | string | null) { this._fields.sol_date = date; }
  get sol_date(): Date | string | null { return this._fields.sol_date; }

  set sol_dep_ori_id(dep_ori_id: number | null) { this._fields.sol_dep_ori_id = dep_ori_id; }
  get sol_dep_ori_id(): number | null { return this._fields.sol_dep_ori_id; }

  set sol_dep_des_id(dep_des_id: number | null) { this._fields.sol_dep_des_id = dep_des_id; }
  get sol_dep_des_id(): number | null { return this._fields.sol_dep_des_id; }

  set sol_user_create(user_create: string | null) { this._fields.sol_user_create = user_create; }
  get sol_user_create(): string | null { return this._fields.sol_user_create; }

  set sol_user_aprov(user_aprov: string | null) { this._fields.sol_user_aprov = user_aprov; }
  get sol_user_aprov(): string | null { return this._fields.sol_user_aprov; }

  set sol_date_aprov(date_aprov: Date | string | null) { this._fields.sol_date_aprov = date_aprov; }
  get sol_date_aprov(): Date | string | null { return this._fields.sol_date_aprov; }

  set sol_status(status: number | null) { this._fields.sol_status = status; }
  get sol_status(): number | null { return this._fields.sol_status; }

  set sol_obs(obs: string | null) { this._fields.sol_obs = obs; }
  get sol_obs(): string | null { return this._fields.sol_obs; }

  public async ListarAbertas(): Promise<RowDataPacket[]> {

    const query: string = `SELECT s.sol_id, s.sol_date,do.dep_descr as deposito_origem,dd.dep_descr as deposito_destino,s.sol_user_create,s.sol_status 
                            FROM tb_solicitacoes s
                            LEFT JOIN tb_depositos do ON s.sol_dep_ori_id = do.dep_id
                            LEFT JOIN tb_depositos dd ON s.sol_dep_des_id = dd.dep_id
                            WHERE s.sol_status = 0`;

    const [rows] = await this.ExecuteQuery(query) as [RowDataPacket[]];

    return rows;

  }

  public async ListarEncerradas(data_ini: string = '', data_fim: string = ''): Promise<RowDataPacket[]> {

    const query: string = `SELECT s.sol_id, s.sol_date,do .dep_descr as deposito_origem,
                                dd.dep_descr as deposito_destino,
                                s.sol_user_create,
                                s.sol_user_aprov,
                                s.sol_date_aprov,
                                s.sol_status 
                            FROM tb_solicitacoes s
                            LEFT JOIN tb_depositos do ON s.sol_dep_ori_id = do.dep_id
                            LEFT JOIN tb_depositos dd ON s.sol_dep_des_id = dd.dep_id
                            WHERE s.sol_status = 1 AND s.sol_date >= :data_ini AND s.sol_date <= :data_fim`;

    const [rows] = await this.ExecuteQuery(query, { data_ini, data_fim }) as [RowDataPacket[]];

    return rows;

  }

}
