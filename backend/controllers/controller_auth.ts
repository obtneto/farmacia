import ActiveDirectory from '../activeDirectory/classldap.js'
import jwt from 'jsonwebtoken'
import Database, { iDatabase } from '../connections/dbconn.js';
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";
import { iresdata } from "./interface_controllers.js";
import { RowDataPacket } from 'mysql2';
import Usuarios from '../model/dao_usuarios.js';

interface iPayload {
    user: string,
    nome_completo: string,
    email: string,
    setor: string,
    perfil: number
}

export default class Controller_Auth {

    public static async Autenticar(req: Request, res: Response) {

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} };

        const db: iDatabase = new Database();

        try {

            await db.Connect('fsph_auth');

            const usuario: string | null = req.body.usuario || null;
            const senha: string | null = req.body.senha || null;
            const id: number = req.body.id_dom | 0;

            if (!usuario) {
                const error = new Error('Usuario obrigatorio.');
                error.statusCode = 403;
                throw error;
            }

            if (!senha) {
                const error = new Error('Senha obrigatoria.');
                error.statusCode = 403;
                throw error;
            }

            if (id === 0) {
                const error = new Error('Dominio não selecionado.');
                error.statusCode = 403;
                throw error;
            }

            /***************************************************************************************
            * Seleciona o dominio para autenticação
            ***************************************************************************************/ 
            const query: string = 'SELECT * FROM tb_domains WHERE id_dom = :id'
            const [domain] = await db.connection.query(query, { id }) as RowDataPacket[];

            if (domain.length === 0) {
                const error = new Error('Nenhum dominio encontrado.');
                error.statusCode = 404;
                throw error;
            }

            /***************************************************************************************
            * Instancia o LDAP para autenticação
            ***************************************************************************************/ 
            const ad = new ActiveDirectory(domain[0].user_dom + '@' + domain[0].domain, domain[0].pass_dom, domain[0].host_ldap_dom, domain[0].basedn_dom, domain[0].port_host_ldap)

            const auth_ok = await ad.Autenticate(usuario + '@' + domain[0].domain, senha);

            if (!auth_ok) {
                const error = new Error('Não foi possivel autenticar. Verifique suas credenciais.');
                error.statusCode = 403;
                throw error;
            }

            //Obtem dados do usuario no LDAP
            const user_data = await ad.FindUser(usuario);

            if (!user_data) {
                const error = new Error('Usuario não disponivel no ActiveDirectory.');
                error.statusCode = 403;
                throw error;
            }

            /***************************************************************************************
            * Check se existe o usuario na base local da aplicação
            ***************************************************************************************/ 
            const usuarios = new Usuarios(db.connection);

            if (!await usuarios.BuscarUsuario(usuario)) {

                usuarios.usu_usuario = usuario
                usuarios.usu_nome_completo = user_data.fullname
                usuarios.usu_nome_usual = user_data.fullname.split(' ')[0]
                usuarios.usu_perfil_id = 3;

                await usuarios.Salvar();

            }

            /***************************************************************************************
            * Cria Token da autenticação
            ****************************************************************************************/
            const payload: iPayload = {
                user: user_data.user,
                nome_completo: user_data.fullname,
                email: user_data.email,
                setor: user_data.sector,
                perfil: usuarios.usu_perfil_id
            }

            const key: string = process.env.KEY_TOKEN || '';

            if (key === '') {
                const error = new Error('A chave secreta não encontrada.');
                error.statusCode = 404;
                throw error;
            }

            const token = jwt.sign(payload, key, {
                expiresIn: '1h' // O token expira em 1 hora
            })

            resdata.data = {
                user_data: payload,
                token
            };

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller_Auth - Autenticar');
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

}