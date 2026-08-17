import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iFornecedoresFields {
    for_id: number,
    for_razao_social: string | null,
    for_nome_fantasia: string | null,
    for_cnpj: string | null,
    for_logradouro: string | null,
    for_numero: string | null,
    for_bairro: string | null,
    for_cidade: string | null,
    for_uf: string | null,
    for_telefone: string | null,
    for_email: string | null,
    for_ativo: 0 | 1 | null,
}

export default class Fornecedores extends BaseModel implements iBaseModel, iFornecedoresFields {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iFornecedoresFields = {
            for_id: 0,
            for_razao_social: null,
            for_nome_fantasia: null,
            for_cnpj: null,
            for_logradouro: null,
            for_numero: null,
            for_bairro: null,
            for_cidade: null,
            for_uf: null,
            for_telefone: null,
            for_email: null,
            for_ativo: null,
        };

        super(connection, 'tb_fornecedores', initFields, 'for_id');

    }

    get found(): boolean { return this._found; }

    set for_id(id: number) { this._fields.for_id = id; }
    get for_id(): number { return this._fields.for_id; }

    set for_razao_social(razao_social: string | null) { this._fields.for_razao_social = razao_social; }
    get for_razao_social(): string | null { return this._fields.for_razao_social; }

    set for_nome_fantasia(nome_fantasia: string | null) { this._fields.for_nome_fantasia = nome_fantasia; }
    get for_nome_fantasia(): string | null { return this._fields.for_nome_fantasia; }

    set for_cnpj(cnpj: string | null) { this._fields.for_cnpj = cnpj; }
    get for_cnpj(): string | null { return this._fields.for_cnpj; }

    set for_logradouro(logradouro: string | null) { this._fields.for_logradouro = logradouro; }
    get for_logradouro(): string | null { return this._fields.for_logradouro; }

    set for_numero(numero: string | null) { this._fields.for_numero = numero; }
    get for_numero(): string | null { return this._fields.for_numero; }

    set for_bairro(bairro: string | null) { this._fields.for_bairro = bairro; }
    get for_bairro(): string | null { return this._fields.for_bairro; }

    set for_cidade(cidade: string | null) { this._fields.for_cidade = cidade; }
    get for_cidade(): string | null { return this._fields.for_cidade; }

    set for_uf(uf: string | null) { this._fields.for_uf = uf; }
    get for_uf(): string | null { return this._fields.for_uf; }

    set for_telefone(telefone: string | null) { this._fields.for_telefone = telefone; }
    get for_telefone(): string |  null { return this._fields.for_telefone; }

    set for_email(email: string | null) { this._fields.for_email = email; }
    get for_email(): string | null { return this._fields.for_email; }

    set for_ativo(ativo: 0 | 1 | null) { this._fields.for_ativo = ativo; }
    get for_ativo(): 0 | 1 | null { return this._fields.for_ativo; }

    public async Listar(pesq: string = ''): Promise<iFornecedoresFields[]> {

        let query = `
            SELECT
                for_id,
                for_razao_social,
                for_nome_fantasia,
                for_cnpj,
                for_logradouro,
                for_numero,
                for_bairro,
                for_cidade,
                for_uf,
                for_telefone,
                for_email,
                for_ativo
            FROM tb_fornecedores
        `;

        if (pesq !== '*') {
            query += `
                WHERE for_razao_social LIKE :pesq
                   OR for_nome_fantasia LIKE :pesq
                   OR for_cnpj LIKE :pesq
            `;
        }

        const [rows] = await this.ExecuteQuery(query, { pesq: `%${pesq}%` }) as [iFornecedoresFields[]];

        return rows;

    }

    public async ListarAtivos(pesq: string = ''): Promise<RowDataPacket[]> {

        let query = `
            SELECT
                for_id,
                CONCAT(for_razao_social, ' - ', for_nome_fantasia) as for_razao_social
            FROM tb_fornecedores
            WHERE for_ativo = 1
        `;

        if (pesq !== '*') {
            query += ' AND (for_razao_social LIKE :pesq OR for_nome_fantasia LIKE :pesq OR for_cnpj LIKE :pesq)';
        }

        const [rows] = await this.ExecuteQuery(query, { pesq: `%${pesq}%` }) as [RowDataPacket[]];

        return rows;

    }

}
