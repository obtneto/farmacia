import Database, {iDatabase} from "../connections/dbconn.js";
import Medicamentos, {iMedicamentosFields} from "../model/dao_medicamentos.js";
import { iresdata } from "./interface_controllers.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";

// Controla o cadastro mestre de medicamentos.
export default class Controller_Medicamentos {

    static async Listar (req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = {
          err: 0,
          msg: '',
          status: 200,
          data: null
        };
        
        try {

            void await db.Connect();

            const pesq: string = String(req.params.pesq || '*');

            if (!pesq) {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            }

            const medicamentos = new Medicamentos(db.connection);

            resdata.data = await medicamentos.ListarTodos(pesq) as iMedicamentosFields[];
            
        } catch (error:any) {
            
            applyControllerError(resdata, error, 'Controller Medicamentos');

        }
        
        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
        
    }

    static async ListarAtivos (req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = {
          err: 0,
          msg: '',
          status: 200,
          data: null
        };
        
        try {

            void await db.Connect();

            const pesq: string = String(req.params.pesq || '*');

            if (!pesq) {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            }

            const medicamentos = new Medicamentos(db.connection);

            resdata.data = await medicamentos.ListarAtivos(pesq) as iMedicamentosFields[];
            
        } catch (error:any) {
            
            applyControllerError(resdata, error, 'Controller Medicamentos');

        }
        
        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
        
    }

    static async Buscar(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = {
          err: 0,
          msg: '',
          status: 200,
          data: null
        };
        
        try {

            void await db.Connect();

            const med_id: number = Number(req.params.med_id);

            if (med_id === 0) {
                const error = new Error('ID do medicamento não informado');
                error.statusCode = 400;
                throw error;
            }

            const medicamentos = new Medicamentos(db.connection);

            const data = await medicamentos.BuscarPorId(med_id) as iMedicamentosFields[];

            if (!medicamentos.found) {
                const error = new Error('Medicamento não encontrado');
                error.statusCode = 404;
                throw error;
            }

            resdata.data = data;
            
        } catch (error:any) {
            
            applyControllerError(resdata, error, 'Controller Medicamentos');

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
          data: null
        };
        
        try {

            void await db.Connect();

            void await db.Begin();

            const med_id: number = Number(req.body.med_id || 0);
            const med_descr = String(req.body.med_descr || '').trim().toLocaleUpperCase();
            const med_descr_coml = String(req.body.med_descr_coml || '').trim().toLocaleUpperCase();
            const med_und = String(req.body.med_und || '').trim().toLocaleUpperCase();
            const med_tipo_codigo = String(req.body.med_tipo_codigo || '').trim().toLocaleUpperCase();
            const med_tipo_med = String(req.body.med_tipo_med || '').trim().toLocaleUpperCase();
            const med_max = Number(req.body.med_max || 0);
            const med_min = Number(req.body.med_min || 0);
            const med_ui_cx = Number(req.body.med_ui_cx || 0);
            const med_bona_codigo = typeof req.body.med_bona_codigo === 'string'
                ? req.body.med_bona_codigo.trim().toLocaleUpperCase()
                : null;
            const med_alert = Number(req.body.med_alert || 0);
            const med_diag_id = req.body.med_diag_id === null || req.body.med_diag_id === undefined || req.body.med_diag_id === ''
                ? null
                : Number(req.body.med_diag_id);
            const med_ativo: 0 | 1 = Number(req.body.med_ativo || 0) === 1 ? 1 : 0;

            if (!med_descr) {
                const error = new Error('Descricao do medicamento nao informada');
                error.statusCode = 400;
                throw error;
            }

            if (!med_descr_coml) {
                const error = new Error('Descricao comercial nao informada');
                error.statusCode = 400;
                throw error;
            }

            if (!med_und) {
                const error = new Error('Unidade do medicamento nao informada');
                error.statusCode = 400;
                throw error;
            }

            if (!med_tipo_codigo) {
                const error = new Error('Tipo de medicamento nao informado');
                error.statusCode = 400;
                throw error;
            }

            if (!med_tipo_med) {
                const error = new Error('Categoria do medicamento nao informada');
                error.statusCode = 400;
                throw error;
            }

            if (med_diag_id !== null && Number.isNaN(med_diag_id)) {
                const error = new Error('Diagnostico invalido');
                error.statusCode = 400;
                throw error;
            }

            if (req.body.med_ativo === undefined) {
                const error = new Error('Ativo nao informado');
                error.statusCode = 400;
                throw error;
            }

            const medicamentos = new Medicamentos(db.connection);

            if (med_id > 0) {
                void await medicamentos.BuscarPorId(med_id);
            }

            medicamentos.med_id = med_id;
            medicamentos.med_descr = med_descr;
            medicamentos.med_descr_coml = med_descr_coml;
            medicamentos.med_und = med_und;
            medicamentos.med_tipo_codigo = med_tipo_codigo;
            medicamentos.med_tipo_med = med_tipo_med;
            medicamentos.med_max = med_max;
            medicamentos.med_min = med_min;
            medicamentos.med_ui_cx = med_ui_cx;
            medicamentos.med_bona_codigo = med_bona_codigo;
            medicamentos.med_alert = med_alert;
            medicamentos.med_diag_id = med_diag_id;
            medicamentos.med_ativo = med_ativo;

            void await medicamentos.Salvar();

            void await db.Commit();

            resdata.msg = 'Medicamento salvo com sucesso';
            
        } catch (error:any) {
            
            void await db.Rollback();

            applyControllerError(resdata, error, 'Controller Medicamentos');

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
          data: null
        };
        
        try {

            void await db.Connect();

            void await db.Begin();

            const med_id: number = Number(req.params.med_id);

            if (med_id === 0) {
                const error = new Error('ID do medicamento não informado');
                error.statusCode = 400;
                throw error;
            }

            const medicamentos = new Medicamentos(db.connection);

            void await medicamentos.BuscarPorId(med_id);

            if (!medicamentos.found) {
                const error = new Error('Medicamento não encontrado');
                error.statusCode = 404;
                throw error;
            }
            
            void await medicamentos.Excluir();

            void await db.Commit();

            resdata.msg = 'Medicamento excluído com sucesso';
            
        } catch (error:any) {
            
            void await db.Rollback();

            applyControllerError(resdata, error, 'Controller Medicamentos');

        }
        
        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
        
    }

}
