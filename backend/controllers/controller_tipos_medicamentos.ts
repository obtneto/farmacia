import Database, {iDatabase} from "../connections/dbconn.js";
import TiposMedicamentos, {iTiposMedicamentosFields} from '../model/dao_tipos_medicamentos.js'
import { Request, Response } from "express";
import { iresdata } from "./interface_controllers.js";
import { applyControllerError } from "../utils/controllerError.js";

// Controla o cadastro de tipos de medicamentos da aplicacao.
export default class Controller_TiposMedicamentos {

    static async Listar(req: Request, res: Response) {

        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            const pesq : string = String(req.params.pesq || '*');

            void await db.Connect();

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            }

            const tiposMedicamentos = new TiposMedicamentos(db.connection);
            resdata.data = await tiposMedicamentos.Listar(pesq) as iTiposMedicamentosFields[];

        } catch (error :any) {

            applyControllerError(resdata, error, 'Controller Tipos Medicamentos');

        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

     static async ListarAtivos(req: Request, res: Response) {

        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            const pesq : string = String(req.params.pesq || '*');

            void await db.Connect();

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            }

            const tiposMedicamentos = new TiposMedicamentos(db.connection);
            resdata.data = await tiposMedicamentos.ListarAtivos(pesq) as iTiposMedicamentosFields[];

        } catch (error :any) {

            applyControllerError(resdata, error, 'Controller Tipos Medicamentos');

        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Buscar(req: Request, res: Response) {

        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            const tipo_id : number = Number(req.params.tipo_id || 0);

            void await db.Connect();

            if (tipo_id === 0) {
                const error = new Error('ID do tipo de medicamento não informado');
                error.statusCode = 400;
                throw error;
            }

            const tiposMedicamentos = new TiposMedicamentos(db.connection);
            const dados = await tiposMedicamentos.BuscarPorId(tipo_id) as iTiposMedicamentosFields;

            if (!tiposMedicamentos.found) {
                const error = new Error('Tipo de medicamento não encontrado');
                error.statusCode = 404;
                throw error;
            }

            resdata.data = dados;

        } catch (error: any) {

            applyControllerError(resdata, error, 'Controller Tipos Medicamentos');

        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async BuscarPorCodigo(req: Request, res: Response) {

        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            void await db.Connect();

            const tipo_codigo : string = String(req.params.tipo_codigo || '').toLocaleUpperCase();

            if (!tipo_codigo) {
                const error = new Error('Código do tipo de medicamento não informado');
                error.statusCode = 400;
                throw error;
            }

            const tiposMedicamentos = new TiposMedicamentos(db.connection);
            const dados : iTiposMedicamentosFields = await tiposMedicamentos.BuscarPorCodigo(tipo_codigo);

            if (!tiposMedicamentos.found) {
                const error = new Error('Tipo de medicamento não encontrado');
                error.statusCode = 404;
                throw error;
            }

            resdata.data = dados;

        } catch (error :any ) {

            applyControllerError(resdata, error, 'Controller Tipos Medicamentos');

        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Salvar(req: Request, res: Response) {

        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            void await db.Connect();
            void await db.Begin();

            const tipo_id : number = Number(req.body.tipo_id || 0);
            const tipo_codigo : string = String(req.body.tipo_codigo || '').toLocaleUpperCase().trim();
            const tipo_descr : string = String(req.body.tipo_descr || '').toLocaleUpperCase().trim();
            const tipo_ativo : 0 | 1 = Number(req.body.tipo_ativo || 0) === 1 ? 1 : 0;

            if (!tipo_codigo) {
                const error = new Error('Código do tipo de medicamento não informado');
                error.statusCode = 400;
                throw error;
            }

            if (!tipo_descr) {
                const error = new Error('Descrição do tipo de medicamento não informada');
                error.statusCode = 400;
                throw error;
            }

            if (req.body.tipo_ativo === undefined) {
                const error = new Error('Ativo não informado');
                error.statusCode = 400;
                throw error;
            }

            const tiposMedicamentos = new TiposMedicamentos(db.connection);

            void await tiposMedicamentos.BuscarPorCodigo(tipo_codigo);

            if (tiposMedicamentos.found && tiposMedicamentos.tipo_id === 0) {
                const error = new Error('Código do tipo de medicamento já existe');
                error.statusCode = 400;
                throw error;
            }

            void await tiposMedicamentos.BuscarPorId(tipo_id);
            
            tiposMedicamentos.tipo_id = tipo_id;
            tiposMedicamentos.tipo_codigo = tipo_codigo;
            tiposMedicamentos.tipo_descr = tipo_descr;
            tiposMedicamentos.tipo_ativo = tipo_ativo;

            await tiposMedicamentos.Salvar();

            void await db.Commit();

            resdata.msg = 'Tipo de medicamento salvo com sucesso';

        } catch (error :any) {

            void await db.Rollback();

            applyControllerError(resdata, error, 'Controller Tipos Medicamentos');

        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Excluir(req: Request, res: Response) {

        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            void await db.Connect();
            void await db.Begin();

            const tipo_id : number = Number(req.params.tipo_id || 0);

            if (tipo_id === 0) {
                const error = new Error('ID do tipo de medicamento não informado');
                error.statusCode = 400;
                throw error;
            }

            const tiposMedicamentos = new TiposMedicamentos(db.connection);

            void await tiposMedicamentos.BuscarPorId(tipo_id);

            if (!tiposMedicamentos.found) {
                const error = new Error('Tipo de medicamento não encontrado');
                error.statusCode = 404;
                throw error;
            }

            void await tiposMedicamentos.Excluir();

            void await db.Commit();

            resdata.msg = 'Tipo de medicamento excluído com sucesso';

        } catch (error : any) {

            void await db.Rollback();

            applyControllerError(resdata, error, 'Controller Tipos Medicamentos');

        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

}
