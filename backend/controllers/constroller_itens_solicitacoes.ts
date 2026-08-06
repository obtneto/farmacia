import Database, {iDatabase} from "../connections/dbconn.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";
import { iresdata } from "./interface_controllers.js";
import ItensSolicitacoes from "../model/dao_itens_solicitacoes.js";

export default class Controller_Itens_Solicitacoes {

    static async BuscarPorId(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');

        const resdata: iresdata = {err: 0, msg: '', status: 200, data: []};

        try {

            await db.Connect();

            const iso_id = Number(req.params.iso_id);
            
            if (isNaN(iso_id)) {
                const error = new Error("Parâmetro 'iso_id' inválido.");
                error.statusCode = 400;
                throw error;
            }

            const itensSolicitacoes = new ItensSolicitacoes(db.connection);

            const result = await itensSolicitacoes.BuscarPorId(iso_id);

            if (!itensSolicitacoes.found) {
                const error = new Error(`Item de solicitação com ID ${iso_id} não encontrado.`);
                error.statusCode = 404;
                throw error;
            }

            resdata.data = result;

        } catch (error: any) {
            applyControllerError(error, resdata,'Controller_Itens_Solicitacoes.BuscarPorId');
        }

        await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async ListarItensSolicitacoes(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');

        const resdata: iresdata = {err: 0, msg: '', status: 200, data: []};

        try {

            await db.Connect();

            const iso_sol_id = Number(req.params.iso_sol_id);
            
            if (isNaN(iso_sol_id)) {
                const error = new Error("Parâmetro 'iso_sol_id' inválido.");
                error.statusCode = 400;
                throw error;
            }

            const itensSolicitacoes = new ItensSolicitacoes(db.connection);

            const result = await itensSolicitacoes.ListarItens(iso_sol_id);

            resdata.data = result;

        } catch (error: any) {
            applyControllerError(error, resdata,'Controller_Itens_Solicitacoes.ListarItensSolicitacoes');
        }

        await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async SalvarItemSolicitacao(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');

        const resdata: iresdata = {err: 0, msg: '', status: 200, data: []};

        try {

            await db.Connect();

            const iso_id = Number(req.body.iso_id);
            const iso_sol_id = Number(req.body.iso_sol_id);
            const iso_med_id = Number(req.body.iso_med_id);
            const iso_med_qtde = Number(req.body.iso_med_qtde);
            const iso_med_lote = req.body.iso_med_lote as string;
            const iso_med_validade = req.body.iso_med_validade || null;

            if (isNaN(iso_sol_id)) {
                const error = new Error("Parâmetro ID Solicitação inválida.");
                error.statusCode = 400;
                throw error;
            }

            if (isNaN(iso_med_id)) {
                const error = new Error("Parâmetro ID Medicamento inválido.");
                error.statusCode = 400;
                throw error;
            }

            if (isNaN(iso_med_qtde)) {
                const error = new Error("Parâmetro Quantidade inválido.");
                error.statusCode = 400;
                throw error;
            }

            const itensSolicitacoes = new ItensSolicitacoes(db.connection);

            await itensSolicitacoes.BuscarPorId(iso_id);

            itensSolicitacoes.iso_id = iso_id;
            itensSolicitacoes.iso_sol_id = iso_sol_id;
            itensSolicitacoes.iso_med_id = iso_med_id;
            itensSolicitacoes.iso_med_qtde = iso_med_qtde;
            itensSolicitacoes.iso_med_lote = iso_med_lote;
            itensSolicitacoes.iso_med_validade = iso_med_validade;

            await itensSolicitacoes.Salvar();

            resdata.msg = "Item de solicitação salvo com sucesso.";

        } catch (error: any) {
            applyControllerError(error, resdata,'Controller_Itens_Solicitacoes.SalvarItemSolicitacao');
        }

        await db.Disconnect();

        res.status(resdata.status).json(resdata);
    }

    static async ExcluirItemSolicitacao(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');

        const resdata: iresdata = {err: 0, msg: '', status: 200, data: []};

        try {

            await db.Connect();

            const iso_id = Number(req.params.iso_id);
            
            if (isNaN(iso_id)) {
                const error = new Error("Parâmetro 'iso_id' inválido.");
                error.statusCode = 400;
                throw error;
            }

            const itensSolicitacoes = new ItensSolicitacoes(db.connection);

            await itensSolicitacoes.BuscarPorId(iso_id);

            if (!itensSolicitacoes.found) {
                const error = new Error(`Item de solicitação com ID ${iso_id} não encontrado.`);
                error.statusCode = 404;
                throw error;
            }

            await itensSolicitacoes.Excluir(iso_id);

            resdata.msg = "Item de solicitação excluído com sucesso.";

        } catch (error: any) {
            applyControllerError(error, resdata,'Controller_Itens_Solicitacoes.ExcluirItemSolicitacao');
        }

        await db.Disconnect();

        res.status(resdata.status).json(resdata);
    }

}

