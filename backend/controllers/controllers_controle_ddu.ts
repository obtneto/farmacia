import Database, { iDatabase } from '../connections/dbconn.js';
import ControleDDU from '../model/dao_controle_ddu.js';
import ItensDDU from '../model/dao_itens_ddu.js';
import { Request, Response } from 'express';
import { iresdata } from './interface_controllers.js';
import { applyControllerError } from "../utils/controllerError.js";

export default class Controller_Controle_DDU {

    static async Listar(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} };

        try {

            void await db.Connect();

            const pesq: string = String(req.params?.pesq || '*');
            const data_ini: string = String(req.params?.data_ini || '');
            const data_fin: string = String(req.params?.data_fin || '');
            const cdd_status: number = Number(req.params?.cdd_status);

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            }

            if (new Date(data_ini) > new Date(data_fin)) {
                const error = new Error('Data inicial maior que a data final');
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(new Date(data_ini).getTime())) {
                const error = new Error('Data inicial inválida');
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(new Date(data_fin).getTime())) {
                const error = new Error('Data final inválida');
                error.statusCode = 400;
                throw error;
            }

            if (new Date(data_ini).getTime() > new Date().getTime()) {
                const error = new Error('Data inicial maior que a data atual');
                error.statusCode = 400;
                throw error;
            }

            const controleDDU = new ControleDDU(db.connection);

            resdata.data = await controleDDU.Listar(pesq, data_ini, data_fin, cdd_status);

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Controle DDU');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async BuscarPorRequisicao(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} };

        try {

            void await db.Connect();

            const req_num: string = String(req.params?.req_num || '');

            if (!req.params.req_num && req_num !== '') {
                const error = new Error('Número da requisição não informado');
                error.statusCode = 400;
                throw error;
            }

            const controleDDU = new ControleDDU(db.connection);

            resdata.data = await controleDDU.BuscarPorReqNum(req_num);

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Buscar Por Requisicao');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async ListarItens(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} };

        try {

            void await db.Connect();

            const pesq: string = String(req.params?.pesq || '*');
            const req_num: string = String(req.params?.req_num || '');

            if (!req.params.req_num && req_num !== '') {
                const error = new Error('Número da requisição não informado');
                error.statusCode = 400;
                throw error;
            }

            const itensDDU = new ItensDDU(db.connection);

            resdata.data = await itensDDU.ListarItensPorRequisicao(pesq, req_num);

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Listar Itens');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async AtualizarItemDDU(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} };

        try {

            void await db.Connect();
            void await db.Begin();

            const req_num: string = String(req.body.req_num || '');

            const itens = req.body.itens as Array<{
                med_id: string;
                lote: string;
                qtde_retorno: number;
            }>;

            if (!Array.isArray(itens)) {
                const error = new Error('Itens inválidos');
                error.statusCode = 400;
                throw error;
            }

            if (req_num == '') {
                const error = new Error('Número da requisição não informado');
                error.statusCode = 400;
                throw error;
            }

            const controleDDU = new ControleDDU(db.connection);
            const itensDDU = new ItensDDU(db.connection);
            let check: Boolean = false;

            for (const item of itens) {

                if (item.med_id == '') {
                    const error = new Error('ID do medicamento não informado');
                    error.statusCode = 400;
                    throw error;
                }

                if (item.lote == '') {
                    const error = new Error('Lote não informado');
                    error.statusCode = 400;
                    throw error;
                }

                if (item.qtde_retorno < 1) {
                    const error = new Error('Quantidade de retorno inválida');
                    error.statusCode = 400;
                    throw error;
                }

                void await itensDDU.BuscarPorRequisicao(req_num, Number(item.med_id), item.lote);

                if (!itensDDU.found) {
                    const error = new Error('Item não encontrado');
                    error.statusCode = 404;
                    throw error;
                }

                if (itensDDU.ite_dd_qtde < item.qtde_retorno) {
                    const error = new Error('Quantidade de retorno maior que a quantidade');
                    error.statusCode = 400;
                    throw error;
                }

                itensDDU.ite_dd_qtde_retorno += item.qtde_retorno;

                await itensDDU.Salvar();

            }

            check = await itensDDU.ValidarStatusRequisicao(req_num);

            await controleDDU.BuscarPorReqNum(req_num);

            if (!controleDDU.found) {
                const error = new Error('Requisição não encontrada');
                error.statusCode = 404;
                throw error;
            }

            controleDDU.cdd_status = check ? 0 : 1;

            await controleDDU.Salvar();

            void await db.Commit();

            resdata.msg = "Item atualizado com sucesso!";

        } catch (error: any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Atualizar Item DDU');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async ExcluirItemDDU(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} };

        try {

            void await db.Connect();
            void await db.Begin();

            //validações de front-end
            const req_num: string = String(req.body.req_num || '');
            const itens = req.body.itens as Array<{
                med_id: string;
                lote: string;
            }>;

            //validações
            if (!Array.isArray(itens)) {
                const error = new Error('Itens inválidos');
                error.statusCode = 400;
                throw error;
            }

            if (req_num == '') {
                const error = new Error('Número da requisição não informado');
                error.statusCode = 400;
                throw error;
            }

            const itensDDU = new ItensDDU(db.connection);

            //verificar se tem quantidade disponivel para exclusão
            for (const item of itens) {

                const med_id: string = String(item.med_id || '');
                const lote: string = String(item.lote || '');

                if (med_id == '') {
                    const error = new Error('ID do medicamento não informado');
                    error.statusCode = 400;
                    throw error;
                }

                if (lote == '') {
                    const error = new Error('Lote não informado');
                    error.statusCode = 400;
                    throw error;
                }

                void await itensDDU.BuscarPorRequisicao(req_num, Number(med_id), lote);

                if (!itensDDU.found) {
                    const error = new Error('Item não encontrado');
                    error.statusCode = 404;
                    throw error;
                }

                await itensDDU.Excluir();

            }

            void await db.Commit();

            resdata.msg = "Item excluído com sucesso!";

        } catch (error: any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Excluir Item DDU');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

}

