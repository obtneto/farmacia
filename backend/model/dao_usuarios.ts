import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iUsuariosFields {
    usu_id: number,
    usu_usuario: string | null,
    usu_nome_completo: string | null,
    usu_nome_usual: string | null,
    usu_cpf: string | null,
    usu_senha: string | null,
    usu_ativo: 0 | 1 | null
}

export default class Usuarios extends BaseModel implements iUsuariosFields, iBaseModel {

    private connection: Connection

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iUsuariosFields = {
            usu_id: 0,
            usu_usuario: null,
            usu_nome_completo: null,
            usu_nome_usual: null,
            usu_cpf: null,
            usu_ativo: 0,
            usu_senha: null
        };

        super(connection, 'tb_usuarios', initFields, 'usu_id');

        this.connection = connection;

    }

    get found(): boolean { return this._found; }

    set usu_id(id: number) { this._fields.usu_id = id }
    get usu_id(): number { return this._fields.usu_id }

    set usu_usuario(usuario: string) { this._fields.usu_usuario = usuario }
    get usu_usuario(): string { return this._fields.usu_usuario }

    set usu_nome_completo(nome_completo: string) { this._fields.usu_nome_completo = nome_completo }
    get usu_nome_completo(): string { return this._fields.usu_nome_completo }

    set usu_nome_usual(nome_usual: string) { this._fields.usu_nome_usual = nome_usual }
    get usu_nome_usual(): string { return this._fields.usu_nome_usual }

    set usu_cpf(cpf: string) { this._fields.usu_cpf = cpf }
    get usu_cpf(): string { return this._fields.usu_cpf }

    set usu_senha(senha: string) { this._fields.usu_senha = senha }
    get usu_senha(): string { return this._fields.usu_senha }

    set usu_ativo(ativo: 0 | 1) { this._fields.ativo = ativo }
    get usu_ativo(): 0 | 1 { return this._fields.ativo }

    public async Listar_Todos(pesq: string): Promise<iUsuariosFields[]> {

        let query: string = "SELECT * FROM tb_usuarios";

        if (pesq !== '*') {
            query += ` WHERE MATCH(usu_usuario,usu_nome_completo,usu_nome_usual) AGAINST(:pesq IN BOOLEAN MODE)`;
        }

        const termoFormatado = pesq.trim().replace(/[+\-><()~*\"@]+/g, ' ').split(/\s+/).filter(palavra => palavra.length >= 3).map(palavra => `+${palavra}*`).join(' ');

        const [rows] = await this.ExecuteQuery(query, { pesq: termoFormatado }) as RowDataPacket[];

        return rows as iUsuariosFields[]

    }

    public async Listar_Ativos(): Promise<iUsuariosFields[]> {

        const query: string = "SELECT * FROM tb_usuarios WHERE usu_ativo = 1";

        const [rows] = await this.ExecuteQuery(query) as RowDataPacket[];

        return rows as iUsuariosFields[]

    }

    public async BuscarUsuario(usuario: string): Promise<iUsuariosFields> {

        const query = `SELECT * FROM tb_usuarios WHERE usu_usuario = :usuario FOR UPDATE`

        const [rows] = await this.connection.query(query, { usuario }) as [RowDataPacket, unknown]

        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0])
            this._found = true
        } else {
            this._found = false
            this.populateFromInitial(this._initialFields)
        }

        return this._fields as iUsuariosFields
    }


}

