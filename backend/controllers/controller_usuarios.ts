import Database, { iDatabase } from "../connections/dbconn.js";
import Usuarios, { iUsuariosFields } from "../model/dao_usuarios.js";
import { iresdata } from "./interface_controllers.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";
import { RowDataPacket } from "mysql2";

// Controla o CRUD de usuarios com validacao e persistencia transacional.
export default class Controller_Depositos {

    static async Listar(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db: iDatabase = new Database();

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            // Valida o filtro antes da consulta.
            const pesq: string = String(req.params.pesq || '*');

            void await db.Connect();

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            }

            const usuarios = new Usuarios(db.connection);

            resdata.data = await usuarios.Listar_Todos(pesq);

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Usuarios - Listar');
        }

        await db.Disconnect();

        res.status(resdata.status).json(resdata)

    }

    static async Buscar(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db: iDatabase = new Database();

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            // Valida o filtro antes da consulta.
            const usuario: string = String(req.params.usuario || '');

            void await db.Connect();

            const usuarios = new Usuarios(db.connection);

            const user_data = await usuarios.BuscarUsuario(usuario);

            if (!user_data) {
                const error = new Error('Usuario não encontrado');
                error.statusCode = 404;
                throw error;
            }

            resdata.data = user_data;

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Usuarios - Listar');
        }

        await db.Disconnect();

        res.status(resdata.status).json(resdata)

    }

    static async Salvar(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            void await db.Connect();

            const usuario: string = req.body.usuario || ''
            const perfil_id: number = req.body.perfil_id || 0

            if (usuario === '') {
                const error = new Error('Usuario não informado.');
                error.statusCode = 400;
                throw error;
            }

            if (perfil_id === 0) {
                const error = new Error('Perfil do Usuario não informado.');
                error.statusCode = 400;
                throw error;
            }

            const usuarios = new Usuarios(db.connection);

            void await usuarios.BuscarUsuario(usuario);

            usuarios.usu_perfil_id = perfil_id

            void await usuarios.Salvar()

            resdata.msg = 'Usuario salvo com sucesso!';

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Usuarios - Salvar');
        }

        await db.Disconnect();

        res.status(resdata.status).json(resdata)

    }

}
