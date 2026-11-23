import ActiveDirectory from '../activeDirectory/classldap.js'
import jwt from 'jsonwebtoken'
import Database, { iDatabase } from '../connections/dbconn.js';
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";
import { iresdata } from "./interface_controllers.js";
import { RowDataPacket } from 'mysql2';
import Usuarios from '../model/dao_usuarios.js';
import AuthSessions from '../model/dao_auth_sessions.js';
import { randomUUID } from 'node:crypto';
import { clearSessionCookie, getSessionCookie, setSessionCookie } from '../utils/auth-cookie.js';

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

        const dbDominios: iDatabase = new Database();
        const dbUsuarios: iDatabase = new Database();

        try {

            await dbDominios.Connect('fsph_auth');

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
            const [domain] = await dbDominios.connection.query(query, { id }) as RowDataPacket[];

            if (domain.length === 0) {
                const error = new Error('Nenhum dominio encontrado.');
                error.statusCode = 404;
                throw error;
            }

            /***************************************************************************************
            * Instancia o AcviDirectory (LDAP) para autenticação
            ***************************************************************************************/
            const ad = new ActiveDirectory(domain[0].user_dom + '@' + domain[0].domain, domain[0].pass_dom, domain[0].host_ldap_dom, domain[0].basedn_dom, domain[0].port_host_ldap)

            const auth_ok = await ad.Autenticate(usuario + '@' + domain[0].domain, senha);

            if (!auth_ok) {
                const error = new Error('Não foi possivel autenticar. Verifique suas credenciais.');
                error.statusCode = 403;
                throw error;
            }

            /***************************************************************************************
            * Obtem dados do usuario no ActiveDirectory (LDAP)
            ***************************************************************************************/
            const user_data = await ad.FindUser(usuario);

            if (!user_data) {
                const error = new Error('Usuario não disponivel no ActiveDirectory.');
                error.statusCode = 403;
                throw error;
            }

            /***************************************************************************************
            * Check se existe o usuario na base local da aplicação
            ***************************************************************************************/
            await dbUsuarios.Connect();

            const usuarios = new Usuarios(dbUsuarios.connection);

            const exist_user = await usuarios.BuscarUsuario(usuario)

            if (!exist_user) {

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

            const sessionId = randomUUID();
            const token = jwt.sign({ ...payload, sid: sessionId }, key, { expiresIn: '1h' });
            await AuthSessions.Create(sessionId, payload.user);
            setSessionCookie(res, token, req.secure);

            resdata.data = {
                user_data: payload,
            };

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller_Auth - Autenticar');
        } finally {
            await Promise.all([dbDominios.Disconnect(), dbUsuarios.Disconnect()]);
        }

        return res.status(resdata.status).json(resdata);

    }

    public static async Sessao(req: Request, res: Response) {
        const user = req.usuarioLogado;
        const authenticated = Boolean(user && typeof user !== 'string');
        const userData = user && typeof user !== 'string' ? {
            user: user.user,
            nome_completo: user.nome_completo,
            email: user.email,
            setor: user.setor,
            perfil: user.perfil,
        } : {};
        return res.status(200).json({ err: 0, msg: '', status: 200, data: { authenticated, user_data: userData } });
    }

    public static async Logout(req: Request, res: Response) {
        try {
            const token = getSessionCookie(req);
            const key = process.env.KEY_TOKEN || '';
            if (token && key) {
                const decoded = jwt.verify(token, key, { ignoreExpiration: true });
                if (typeof decoded !== 'string' && typeof decoded.sid === 'string') {
                    await AuthSessions.Revoke(decoded.sid);
                }
            }
        } catch {
            // Logout sempre limpa o cookie, mesmo quando o token já é inválido.
        }
        clearSessionCookie(res, req.secure);
        return res.status(200).json({ err: 0, msg: '', status: 200, data: {} });
    }

    public static async Listar_Perfis(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db: iDatabase = new Database();

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            void await db.Connect();

            const query: string = `SELECT per_id, per_descricao FROM tb_perfis`;

            const [rows] = await db.connection.query(query) as RowDataPacket[];

            resdata.data = rows;

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller_Auth - Listar Perfis');
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

    public static async Listar_Dominios(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db: iDatabase = new Database();

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            void await db.Connect('fsph_auth');

            const query: string = `SELECT id_dom,nm_dom FROM tb_domains`;

            const [rows] = await db.connection.query(query) as RowDataPacket[];

            resdata.data = rows;

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller_Auth - Listar Dominios');
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

}
