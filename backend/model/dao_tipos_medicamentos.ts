import {Connection,RowDataPacket} from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iTiposMedicamentosFields {
    tipo_id : number,
    tipo_codigo : string | null,
    tipo_descr : string | null,
    tipo_ativo : 0 | 1 | null,
    tipo_vincul : string | null
}


export default class TiposMedicamentos extends BaseModel implements iBaseModel, iTiposMedicamentosFields {
        
    constructor(connection : Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iTiposMedicamentosFields = {
            tipo_id: 0,
            tipo_codigo: null,
            tipo_descr: null,
            tipo_ativo: null,
            tipo_vincul: null
        };

        super(connection, 'tb_tipos_medicamentos', initFields, 'tipo_id');

    }

    get found() :boolean {return this._found;}

    set tipo_id(id : number) { this._fields.tipo_id = id;}
    get tipo_id() :number {return this._fields.tipo_id;}

    set tipo_codigo(codigo : string | null) { this._fields.tipo_codigo = codigo;}
    get tipo_codigo() :string | null {return this._fields.tipo_codigo;}

    set tipo_descr(descr : string | null) { this._fields.tipo_descr = descr;}
    get tipo_descr() :string | null {return this._fields.tipo_descr;}

    set tipo_ativo(ativo : 0 | 1 | null) { this._fields.tipo_ativo = ativo;}
    get tipo_ativo() : 0 | 1 | null {return this._fields.tipo_ativo;}

    set tipo_vincul(vincul : string | null) { this._fields.tipo_vincul = vincul;}
    get tipo_vincul() : string | null {return this._fields.tipo_vincul;}
    
    public async BuscarPorCodigo(tipo_codigo : string) : Promise<iTiposMedicamentosFields>{

        const query : string = "SELECT * FROM tb_tipos_medicamentos WHERE tipo_codigo = :tipo_codigo";

        const [rows]: RowDataPacket[] = await this.ExecuteQuery(query, {tipo_codigo});

        if (rows[0]) {
            this._fields = rows[0] as iTiposMedicamentosFields;
            this._found = true;
        } else {
            this._found = false;
        }

        return this._fields;

    }

    public async Listar(pesq : string): Promise<iTiposMedicamentosFields[]> {

        let query : string = "SELECT * FROM tb_tipos_medicamentos";

        if (pesq !== '*') {
            query += " WHERE tipo_descr LIKE :pesq OR tipo_codigo LIKE :pesq";
        }

        const [rows]: RowDataPacket[] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`});

        return rows as iTiposMedicamentosFields[];

    }

    public async ListarAtivos(pesq : string): Promise<iTiposMedicamentosFields[]> {

        let query : string = "SELECT * FROM tb_tipos_medicamentos";

        if (pesq !== '*') {
            query += " WHERE (tipo_descr LIKE :pesq OR tipo_codigo LIKE :pesq) AND tipo_ativo = 1";
        }

        const [rows]: RowDataPacket[] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`});

        return rows as iTiposMedicamentosFields[];

    }

}
