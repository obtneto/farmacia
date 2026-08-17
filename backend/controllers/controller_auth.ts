import type { Response } from 'express';
import { applyControllerError } from '../utils/controllerError.js';
import {
    buildSimulatedAuthUser,
    createSimulatedAuthToken,
    SIMULATED_AUTH_COOKIE_NAME,
    buildSessionCookieOptions,
} from '../utils/authSession.js';
import type { iresdata } from './interface_controllers.js';

export default class Controller_Auth {
    static async SimularSessao(_req: unknown, res: Response) {
        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {},
        };

        try {
            const authUser = buildSimulatedAuthUser();
            const token = createSimulatedAuthToken();

            res.cookie(SIMULATED_AUTH_COOKIE_NAME, token, buildSessionCookieOptions());

            resdata.msg = 'Sessao autenticada simulada criada.';
            resdata.data = {
                user: authUser,
                cookieName: SIMULATED_AUTH_COOKIE_NAME,
                cookieMode: 'httpOnly',
            };
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Auth');
        }

        res.status(resdata.status).json(resdata);
    }
}
