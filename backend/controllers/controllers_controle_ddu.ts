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
            const data_ini: string = String(req.params?.data_ini || '*');
            const data_fin: string = String(req.params?.data_fin || '*');

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

            resdata.data = await controleDDU.Listar(pesq, data_ini, data_fin);

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

            const req_num: string = String(req.params?.req_num || '*');

            if (!req.params.req_num && req_num !== '*') {
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
            const req_num: string = String(req.params?.req_num || '*');

            if (!req.params.req_num && req_num !== '*') {
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

            const req_num: string = String(req.body.req_num || '');
            const med_id: string = String(req.body.med_id || '');
            const lote: string = String(req.body.lote || '');
            const qtde_retorno: number = Number(req.body.qtde_retorno || 0);

            if (req_num == '') {
                const error = new Error('Número da requisição não informado');
                error.statusCode = 400;
                throw error;
            }

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

            if (qtde_retorno < 1) {
                const error = new Error('Quantidade de retorno inválida');
                error.statusCode = 400;
                throw error;
            }

            const itensDDU = new ItensDDU(db.connection);

            const item = await itensDDU.BuscarPorRequisicao(req_num, Number(med_id), lote);

            if (!itensDDU.found) {
                const error = new Error('Item não encontrado');
                error.statusCode = 404;
                throw error;
            }

            if (itensDDU.ite_dd_qtde < qtde_retorno) {
                const error = new Error('Quantidade de retorno maior que a quantidade');
                error.statusCode = 400;
                throw error;
            }

            itensDDU.ite_dd_qtde_retorno += qtde_retorno;

            await itensDDU.Salvar();

            resdata.msg = "Item atualizado com sucesso!";
            resdata.data = item;

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Atualizar Item DDU');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

}

