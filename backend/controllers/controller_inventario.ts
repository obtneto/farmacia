import Database, { iDatabase } from "../connections/dbconn.js";
import Depositos from "../model/dao_depositos.js";
import Inventarios, { eStatus } from "../model/dao_inventarios.js";
import ItensInventario, { iItensInventarioFields } from "../model/dao_itens_inventario.js";
import Medicamentos from "../model/dao_medicamentos.js";
import { iresdata } from "./interface_controllers.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";
import GeraNumeroReq from "../utils/GeraNumero.js";

// Controla o CRUD de inventários com validacao e persistencia transacional.
export default class Controller_Inventarios {

    static async Listar(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            void await db.Connect();

            const date_ini: string = String(req.params.date_ini ?? '');
            const date_fin: string = String(req.params.date_fin ?? '');
            const dep_id: number = Number(req.params.dep_id ?? 0);

            if (Number.isNaN(Date.parse(date_ini))) {
                const error = new Error('Data inicial inválida.');
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(Date.parse(date_fin))) {
                const error = new Error('Data final inválida.');
                error.statusCode = 400;
                throw error;
            }

            if (dep_id === 0) {
                const error = new Error('Depósito deve ser informado.');
                error.statusCode = 400;
                throw error;
            }

            const depositos = new Depositos(db.connection);

            await depositos.BuscarPorId(dep_id);

            if (!depositos.found) {
                const error = new Error('Depósito não encontrado');
                error.statusCode = 404;
                throw error;
            }

            const inventarios = new Inventarios(db.connection);

            const data = await inventarios.ListarPorPeriodo(date_ini, date_fin, dep_id);

            resdata.data = data;

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Inventarios');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Novo(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            void await db.Connect();
            void await db.Begin();

            //valida os campos de inventario
            const inv_date: string = String(req.body.inv_date ?? '');
            const dep_id: number = Number(req.body.dep_id ?? 0);
            const med_tipo_codigo: string = String(req.body.med_tipo_codigo ?? '');
            const inv_tipo: string = String(req.body.inv_tipo || 'Parcial' || 'Total');

            //valida os campos de itens de inventario
            const itens: iItensInventarioFields[] = req.body.itens ?? [];

            //valida os campos de inventario
            if (inv_date === '') {
                const error = new Error('Data deve ser informada.');
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(Date.parse(inv_date))) {
                const error = new Error('Data inválida.');
                error.statusCode = 400;
                throw error;
            }

            if (dep_id === 0) {
                const error = new Error('Depósito deve ser informado.');
                error.statusCode = 400;
                throw error;
            }

            if (!med_tipo_codigo) {
                const error = new Error('Tipo de medicamento deve ser informado.');
                error.statusCode = 400;
                throw error;
            }

            if (inv_tipo !== 'Parcial' && inv_tipo !== 'Total') {
                const error = new Error('Tipo de inventário inválido.');
                error.statusCode = 400;
                throw error;
            }

            const depositos = new Depositos(db.connection);

            await depositos.BuscarPorId(dep_id);

            if (!depositos.found) {
                const error = new Error('Depósito não encontrado');
                error.statusCode = 404;
                throw error;
            }

            if (depositos.dep_bloqueado === 1) {
                const error = new Error('Depósito bloqueado');
                error.statusCode = 409;
                throw error;
            }

            const inventarios = new Inventarios(db.connection);
            const medicamentos = new Medicamentos(db.connection);
            const itens_inventarios = new ItensInventario(db.connection);

            const geraNumero = new GeraNumeroReq();
            const inv_num = `INV${geraNumero.proximoId()}`;

            await inventarios.BuscarPorId(0);

            inventarios.inv_date = new Date(inv_date);
            inventarios.inv_dep_id = dep_id;
            inventarios.inv_med_tipo_codigo = med_tipo_codigo;
            inventarios.inv_tipo = inv_tipo;
            inventarios.inv_num = inv_num;
            inventarios.inv_status = eStatus.Aberto;

            await inventarios.Salvar();

            depositos.dep_bloqueado = 1;

            await depositos.Salvar();

            //percorre os itens do inventário
            for (const item of itens) {

                await medicamentos.BuscarPorId(Number(item.iti_med_id ?? 0));

                if (!medicamentos.found) {
                    const error = new Error('Medicamento não encontrado');
                    error.statusCode = 404;
                    throw error;
                }

                await itens_inventarios.BuscarPorItem(inv_num, Number(item.iti_med_id), String(item.iti_lote));

                if (itens_inventarios.found) {
                    const error = new Error('Item já cadastrado no inventário');
                    error.statusCode = 409;
                    throw error;
                }

                itens_inventarios.iti_inv_num = inv_num;
                itens_inventarios.iti_med_id = Number(item.iti_med_id);
                itens_inventarios.iti_lote = String(item.iti_lote);
                itens_inventarios.iti_validade = new Date(String(item.iti_validade));
                itens_inventarios.iti_qtde_estoque = Number(item.iti_qtde_estoque);

                await itens_inventarios.Salvar();

            }

            void await db.Commit();

            resdata.msg = `Inventário ${inv_num} aberto com sucesso`;

        } catch (error: any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Inventarios.Novo');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Detalhar(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            void await db.Connect();

            const inv_num: string = String(req.params.inv_num ?? '');

            const inventarios = new Inventarios(db.connection);
            const itens_inventarios = new ItensInventario(db.connection);

            const dados_inventario = await inventarios.BuscarPorNum(inv_num);

            if (!inventarios.found) {
                const error = new Error('Inventário não encontrado');
                error.statusCode = 404;
                throw error;
            }

            const itens = await itens_inventarios.ListarPorInventario(inv_num);

            resdata.data = {
                inventario: dados_inventario,
                itens: itens
            };

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Inventarios.Detalhar');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Fechar(req: Request, res: Response) { // deve ser refeito depois

        const db: iDatabase = new Database();
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            void await db.Connect();
            void await db.Begin();

            const inv_num: string = String(req.params.inv_num ?? '');

            const inventarios = new Inventarios(db.connection);

            const dados_inventario = await inventarios.BuscarPorNum(inv_num);

            if (!inventarios.found) {
                const error = new Error('Inventário não encontrado');
                error.statusCode = 404;
                throw error;
            }

            if (inventarios.inv_status !== eStatus.Aberto) {
                const error = new Error('Inventário não está aberto');
                error.statusCode = 400;
                throw error;
            }

            inventarios.inv_num = inv_num;
            inventarios.inv_status = eStatus.Fechado;

            void await inventarios.Salvar();

            void await db.Commit();

            resdata.msg = `Inventário ${inv_num} fechado com sucesso`;

        } catch (error: any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Inventarios.Fechar');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

}
