import Database, { iDatabase } from "../connections/dbconn.js";
import { iresdata } from "./interface_controllers.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";
import Movimentacoes from "../model/dao_movimentacoes.js";

export default class Controller_Movimentacoes {

    static async ListarMovimentacoes(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');

        const resdata: iresdata = {err: 0, msg: '', status: 200, data: []};

        try {

            await db.Connect();

            const pesq: string = String(req.params.pesq || '*');
            const data_ini: string = String(req.params.data_ini);
            const data_fin: string = String(req.params.data_fin);
            const tipo_med: string | null = String(req.params.tipo_med || null);

          

 
            if (!tipo_med) {
                const error = new Error('Tipo de Medicamneto obrigatorio.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            
            const movimentacoes = new Movimentacoes(db.connection);

            const result = await movimentacoes.Listar(pesq,data_ini + ' 00:00:00',data_fin + ' 23:59:59',tipo_med);

            resdata.data = result;

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Movimentações');
        }

        await db.Disconnect();
        res.status(resdata.status).json(resdata)
    }

    static async ListaPorMedicamentos(req: Request, res: Response) {
        const db: iDatabase = new Database('fsph_farmacia');
        const resdata: iresdata = {err: 0, msg: '', status: 200, data: []};

        try {
            await db.Connect();

            const med_id: number = Number(req.params.med_id || 0);

            if (med_id === 0 ) {
                const error = new Error('ID medicamentos invalido.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            const movimentacoes = new Movimentacoes(db.connection);
            const result = await movimentacoes.ListarPorMedicamento(med_id);
            resdata.data = result;

        } catch (error :any) {
            applyControllerError(resdata,error,'Controller Movimentações')
        }

        await db.Disconnect();

        res.status(resdata.status).json(resdata)
    }
}
