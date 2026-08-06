import Database, { iDatabase } from '../connections/dbconn.js';
import Fornecedores, { iFornecedoresFields } from '../model/dao_forncedores.js';
import { Request, Response } from 'express';
import { iresdata } from './interface_controllers.js';
import { applyControllerError } from "../utils/controllerError.js";

function isValidCnpj(value: string): boolean {
    const digits = String(value || '').replace(/\D/g, '');

    if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) {
        return false;
    }

    let length = 12;
    let numbers = digits.substring(0, length);
    let sum = 0;
    let pos = length - 7;

    for (let index = length; index >= 1; index -= 1) {
        sum += Number(numbers.charAt(length - index)) * pos;
        pos = pos === 2 ? 9 : pos - 1;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (result !== Number(digits.charAt(12))) {
        return false;
    }

    length = 13;
    numbers = digits.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let index = length; index >= 1; index -= 1) {
        sum += Number(numbers.charAt(length - index)) * pos;
        pos = pos === 2 ? 9 : pos - 1;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    return result === Number(digits.charAt(13));
}

export default class Controller_Fornecedores {

    static async Buscar(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        };

        try {

            const fornecedor_id = Number(req.params.id_fornecedor || 0);

            void await db.Connect();

            if (fornecedor_id === 0) {
                const error = new Error('ID do fornecedor não informado');
                error.statusCode = 400;
                throw error;
            }

            const fornecedores = new Fornecedores(db.connection);
            const result = await fornecedores.BuscarPorId(fornecedor_id);

            if (!fornecedores.found) {
                const error = new Error('Fornecedor não encontrado');
                error.statusCode = 404;
                throw error;
            }

            resdata.data = result

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Fornecedores');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Listar(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        };

        try {

            const pesq = String(req.params.pesq || '*').trim();

            void await db.Connect();

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            }

            const fornecedores = new Fornecedores(db.connection);
            resdata.data = await fornecedores.Listar(pesq) as iFornecedoresFields[];

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Fornecedores');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async ListarAtivos(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        };

        try {

            const pesq = String(req.params.pesq || '*').trim();

            void await db.Connect();

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            }

            const fornecedores = new Fornecedores(db.connection);
            resdata.data = await fornecedores.ListarAtivos(pesq);

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Fornecedores');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Salvar(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        };

        try {

            void await db.Connect();
            void await db.Begin();

            const for_id = Number(req.body.for_id || 0);
            const for_razao_social = String(req.body.for_razao_social || null).trim().toLocaleUpperCase('pt-BR');
            const for_nome_fantasia = String(req.body.for_nome_fantasia || null).trim().toLocaleUpperCase('pt-BR');
            const for_cnpj =  String(req.body.for_cnpj || null).replace(/\D/g, '').slice(0, 14);
            const for_logradouro = String(req.body.for_logradouro || null).trim().toLocaleUpperCase('pt-BR');
            const for_numero = String(req.body.for_numero || null).trim().toLocaleUpperCase('pt-BR').slice(0, 10);
            const for_bairro = String(req.body.for_bairro || null).trim().toLocaleUpperCase('pt-BR');
            const for_cidade = String(req.body.for_cidade || null).trim().toLocaleUpperCase('pt-BR');
            const for_uf = String(req.body.for_uf || '').trim().toLocaleUpperCase('pt-BR').slice(0, 2);
            const for_telefone = String(req.body.for_telefone || null).replace(/\D/g, '').slice(0, 11);
            const for_email = String(req.body.for_email || null).trim().toLocaleLowerCase('pt-BR').slice(0, 120);
            const for_ativo: 0 | 1 = Number(req.body.for_ativo || 0) === 1 ? 1 : 0;

            if (!for_razao_social) {
                const error = new Error('Razão social do fornecedor não informada');
                error.statusCode = 400;
                throw error;
            }

            if (!for_nome_fantasia) {
                const error = new Error('Nome fantasia do fornecedor não informado');
                error.statusCode = 400;
                throw error;
            }

            if (!for_telefone) {
                const error = new Error('Telefone do fornecedor não informado');
                error.statusCode = 400;
                throw error;
            }
            if (for_cnpj && !isValidCnpj(for_cnpj)) {
                const error = new Error('CNPJ do fornecedor inválido');
                error.statusCode = 400;
                throw error;
            }
            if (req.body.for_ativo === undefined) {
                const error = new Error('Ativo não informado');
                error.statusCode = 400;
                throw error;
            }

            console.log(for_ativo)

            const fornecedores = new Fornecedores(db.connection);

            void await fornecedores.BuscarPorId(for_id);

            fornecedores.for_id = for_id;
            fornecedores.for_razao_social = for_razao_social;
            fornecedores.for_nome_fantasia = for_nome_fantasia;
            fornecedores.for_cnpj = for_cnpj === '' ? null : for_cnpj;
            fornecedores.for_logradouro = for_logradouro === '' ? null : for_logradouro;
            fornecedores.for_numero = for_numero === '' ? null : for_numero;
            fornecedores.for_bairro = for_bairro === '' ? null : for_bairro;
            fornecedores.for_cidade = for_cidade === '' ? null : for_cidade;
            fornecedores.for_uf = for_uf === '' ? null : for_uf;
            fornecedores.for_telefone = for_telefone === '' ? null : for_telefone;
            fornecedores.for_email = for_email === '' ? null : for_email;
            fornecedores.for_ativo = for_ativo;

            void await fornecedores.Salvar();

            void await db.Commit();

            resdata.msg = 'Fornecedor salvo com sucesso';
            resdata.data = { for_id: fornecedores.for_id };

        } catch (error: any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Fornecedores');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Excluir(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        };

        try {

            void await db.Connect();
            void await db.Begin();

            const fornecedor_id = Number(req.params.fornecedor_id || 0);

            if (fornecedor_id === 0) {
                const error = new Error('ID do fornecedor não informado');
                error.statusCode = 400;
                throw error;
            }

            const fornecedores = new Fornecedores(db.connection);

            void await fornecedores.BuscarPorId(fornecedor_id);

            if (!fornecedores.found) {
                const error = new Error('Fornecedor não encontrado');
                error.statusCode = 404;
                throw error;
            }

            await fornecedores.Excluir();

            void await db.Commit();

            resdata.msg = 'Fornecedor excluído com sucesso';

        } catch (error: any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Fornecedores');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

}
