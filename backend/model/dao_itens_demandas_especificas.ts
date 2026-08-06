import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iItensDemandasEspecificasFields {
    ite_id: number,
    ite_dem_id: number | null,
    ite_dem_med_id: number | null,
    ite_dem_med_qtde: number | null,
    ite_dem_med_ativo: number | null,
    ite_ent_id: number | null
}

export default class ItensDemandasEspecificas extends BaseModel implements iItensDemandasEspecificasFields, iBaseModel {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iItensDemandasEspecificasFields = {
            ite_id: 0,
            ite_dem_id: null,
            ite_dem_med_id: null,
            ite_dem_med_qtde: null,
            ite_dem_med_ativo: null,
            ite_ent_id: null
        };

        super(connection, 'tb_itens_demandas_especificas', initFields, 'ite_id');

    }

    get found(): boolean { return this._found; }

    set ite_id(id: number) { this._fields.ite_id = id; }
    get ite_id(): number { return this._fields.ite_id; }

    set ite_dem_id(dem_id: number | null) { this._fields.ite_dem_id = dem_id }
    get ite_dem_id(): number | null { return this._fields.ite_dem_id }

    set ite_dem_med_id(dem_med_id: number | null) { this._fields.ite_dem_med_id = dem_med_id }
    get ite_dem_med_id(): number | null { return this._fields.ite_dem_med_id }

    set ite_dem_med_qtde(dem_med_qtde: number | null) { this._fields.ite_dem_med_qtde = dem_med_qtde }
    get ite_dem_med_qtde(): number { return this._fields.ite_dem_med_qtde }

    set ite_dem_med_ativo(dem_med_ativo: number | null) { this._fields.ite_dem_med_ativo = dem_med_ativo }
    get ite_dem_med_ativo(): number | null { return this._fields.ite_dem_med_ativo }

    set ite_ent_id(ent_id: number | null) { this._fields.ite_ent_id = ent_id }
    get ite_ent_id(): number | null { return this._fields.ite_ent_id }

    public async ListarAtivos(dem_id: number): Promise<RowDataPacket[]> {

        const query: string = `SELECT i.*,m.med_descr,m.med_descr_coml 
                               FROM tb_itens_demandas_especificas i
                               LEFT JOIN tb_medicamentos m ON m.med_id = i.ite_dem_med_id
                               WHERE i.ite_dem_id = :dem_id AND i.ite_dem_med_ativo = 1`;

        const [rows] = await this.ExecuteQuery(query, { dem_id }) as RowDataPacket[];

        return rows as RowDataPacket[];

    }

    public async BuscaItemDemanda(dem_id: number, med_id: number): Promise<RowDataPacket> {

        const query: string = `SELECT * FROM tb_itens_demandas_especificas                 
                               WHERE ite_dem_id = :dem_id AND ite_dem_med_id = :med_id AND ite_dem_med_ativo = 1
                               ORDER BY ite_dem_id`;

        const [rows] = await this.ExecuteQuery(query, { dem_id, med_id }) as RowDataPacket[];

        if (!rows.length) {
            this.populateFromInitial({
                ite_id: 0,
                ite_dem_id: null,
                ite_dem_med_id: null,
                ite_dem_med_qtde: null,
                ite_dem_med_ativo: null,
                ite_ent_id: null
            })
            this._found = false;
            return { med_descr: '', med_descr_coml: '', qtde: 0 } as RowDataPacket;
        } else {
            this.populateFromRow(rows[0])
            this._found = true;
            return rows[0] as RowDataPacket;
        }

    }

}
