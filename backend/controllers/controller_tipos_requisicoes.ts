import Database, { iDatabase } from '../connections/dbconn.js';
import TposRequisicoes from '../model/dao_tipos_requisicoes.js';
import { Request, Response } from 'express';
import { iresdata } from './interface_controllers.js';
import { applyControllerError } from "../utils/controllerError.js";

export default class Controller_TiposRequicoes {

    static async Listar(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata = { err: 0, msg: '', status: 200, data: {} } as iresdata;

        try {

            void await db.Connect();

            const tiposRequisicoes = new TposRequisicoes(db.connection);

            resdata.data = await tiposRequisicoes.Listar();

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Tipos Requicoes');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async BuscarPorId(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}

        } as iresdata;

        try {

            void await db.Connect();

            const id_tipo: number = Number(req.params?.id_tipo || 0);

            if (id_tipo === 0) {
                const error = new Error('ID do tipo de requisição não informado');
                error.statusCode = 400;
                throw error;
            }

            const tiposRequisicoes = new TposRequisicoes(db.connection);

            resdata.data = await tiposRequisicoes.BuscarPorId(id_tipo);

            if (!tiposRequisicoes.found) {
                const error = new Error('Tipo de requisição não encontrado');
                error.statusCode = 404;
                throw error;
            }

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Tipos Requicoes');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Salvar(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}

        } as iresdata;

        try {

            void await db.Connect();
            void await db.Begin();

            const id_tipo: number = Number(req.body?.id_tipo || 0);
            const cod_tipo: string = String(req.body.cod_tipo || '').toLocaleUpperCase().trim();
            const tipo_descr: string = String(req.body.tipo_req_descr || '').toLocaleUpperCase().trim();

            if (!cod_tipo) {
                const error = new Error('Código do tipo de requisição não informado');
                error.statusCode = 400;
                throw error;
            }

            if (!tipo_descr) {
                const error = new Error('Descrição do tipo de requisição não informada');
                error.statusCode = 400;
                throw error;
            }

            const tiposRequisicoes = new TposRequisicoes(db.connection);

            if (id_tipo > 0) {
                await tiposRequisicoes.BuscarPorId(id_tipo);
            }

            if (id_tipo > 0 && !tiposRequisicoes.found) {
                const error = new Error('Tipo de requisição não encontrado');
                error.statusCode = 404;
                throw error;
            }

            tiposRequisicoes.tip_req_id = id_tipo;
            tiposRequisicoes.tip_req_codigo = cod_tipo;
            tiposRequisicoes.tip_req_descr = tipo_descr;

            await tiposRequisicoes.Salvar();

            void await db.Commit();

            resdata.msg = 'Tipo de requisição salvo com sucesso';

        } catch (error: any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Tipos Requicoes');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Excluir(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata = { err: 0, msg: '', status: 200, data: {} } as iresdata;

        try {

            void await db.Connect();
            void await db.Begin();

            const id_tipo: number = Number(req.params.id_tipo || 0);

            if (id_tipo === 0) {
                const error = new Error('ID do tipo de requisição não informado');
                error.statusCode = 400;
                throw error;
            }

            const tiposRequisicoes = new TposRequisicoes(db.connection);

            await tiposRequisicoes.BuscarPorId(id_tipo);

            if (!tiposRequisicoes.found) {
                const error = new Error('Tipo de requisição não encontrado');
                error.statusCode = 404;
                throw error;
            }

            await tiposRequisicoes.Excluir();

            void await db.Commit();

            resdata.msg = 'Tipo de requisição excluído com sucesso';

        } catch (error: any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Tipos Requicoes');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

}
