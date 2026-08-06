import Database, { iDatabase } from '../connections/dbconn.js';
import Setores from '../model/doa_setores.js';
import { Request, Response } from 'express';
import { iresdata } from './interface_controllers.js';
import { applyControllerError } from "../utils/controllerError.js";

export default class Controller_Setores {


    static async Listar(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}

        } as iresdata;

        try {

            void await db.Connect();

            const pesq: string = String(req.params?.pesq || '*');

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            }

            const setores = new Setores(db.connection);

            resdata.data = await setores.Listar(pesq);

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Setores');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async ListarAtivos(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}

        } as iresdata;

        try {

            void await db.Connect();

            const pesq: string = String(req.params?.pesq || '*');

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            }

            const setores = new Setores(db.connection);

            resdata.data = await setores.ListarAtivos(pesq);

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Setores');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Buscar(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}

        } as iresdata;

        try {

            void await db.Connect();

            const id_setor: number = Number(req.params?.id_setor || 0);

            if (id_setor === 0) {
                const error = new Error('ID do setor não informado');
                error.statusCode = 400;
                throw error;
            }

            const setores = new Setores(db.connection);

            resdata.data = await setores.BuscarPorId(id_setor);

            if (!setores.found) {
                const error = new Error('Setor não encontrado');
                error.statusCode = 404;
                throw error;
            }

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Setores');
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

            const id_setor: number = Number(req.body?.id_setor || 0);
            const setor_descr: string = String(req.body.setor_descr || '').toLocaleUpperCase().trim();
            const setor_ativo: 0 | 1 = Number(req.body?.setor_ativo || 0) === 1 ? 1 : 0;

            if (!setor_descr) {
                const error = new Error('Descrição do setor não informada');
                error.statusCode = 400;
                throw error;
            }

            if (req.body.setor_ativo === undefined) {
                const error = new Error('Ativo não informado');
                error.statusCode = 400;
                throw error;
            }

            const setores = new Setores(db.connection);

            if (id_setor > 0) {
                await setores.BuscarPorId(id_setor);
            }

            if (id_setor > 0 && !setores.found) {
                const error = new Error('Setor não encontrado');
                error.statusCode = 404;
                throw error;
            }

            setores.set_id = id_setor;
            setores.set_descr = setor_descr;
            setores.set_ativo = setor_ativo;

            await setores.Salvar();

            void await db.Commit();

            resdata.msg = 'Setor salvo com sucesso';

        } catch (error: any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Setores');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Excluir(req: Request, res: Response) {

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

            const id_setor: number = Number(req.params.id_setor || 0);

            if (id_setor === 0) {
                const error = new Error('ID do setor não informado');
                error.statusCode = 400;
                throw error;
            }

            const setores = new Setores(db.connection);

            await setores.BuscarPorId(id_setor);

            if (!setores.found) {
                const error = new Error('Setor não encontrado');
                error.statusCode = 404;
                throw error;
            }

            await setores.Excluir();

            void await db.Commit();

            resdata.msg = 'Setor excluído com sucesso';

        } catch (error: any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Setores');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

}   
