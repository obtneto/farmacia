import { Request, Response } from 'express';
import { iresdata } from './interface_controllers.js';
import { applyControllerError } from '../utils/controllerError.js';
import settings, {
    buscarSetting,
    excluirSetting,
    listarSettings,
    salvarSetting,
    salvarSettings,
    settingExists
} from '../utils/settings.js';

export default class Controller_Settings {

    static async Listar(req: Request, res: Response) {

        const resdata = { err: 0, msg: '', status: 200, data: {} } as iresdata;

        try {
            resdata.data = { settings: listarSettings() };
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Settings');
        }

        res.status(resdata.status).json(resdata);

    }

    static async Buscar(req: Request, res: Response) {

        const resdata = { err: 0, msg: '', status: 200, data: {} } as iresdata;

        try {
            const key = String(req.params?.key || '').trim();

            if (!key) {
                const error = new Error('Chave da configuração não informada');
                error.statusCode = 400;
                throw error;
            }

            if (!settingExists(key)) {
                const error = new Error('Configuração não encontrada');
                error.statusCode = 404;
                throw error;
            }

            resdata.data = { key, value: buscarSetting(key) };
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Settings');
        }

        res.status(resdata.status).json(resdata);

    }

    static async Salvar(req: Request, res: Response) {

        const resdata = { err: 0, msg: '', status: 200, data: {} } as iresdata;

        try {
            const key = String(req.body?.key || '').trim();

            if (key) {
                await salvarSetting(key, req.body?.value);
            } else {
                await salvarSettings(req.body?.settings || req.body);
            }

            resdata.msg = 'Configuração salva com sucesso';
            resdata.data = { settings };
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Settings');
        }

        res.status(resdata.status).json(resdata);

    }

    static async Excluir(req: Request, res: Response) {

        const resdata = { err: 0, msg: '', status: 200, data: {} } as iresdata;

        try {
            const key = String(req.params?.key || '').trim();

            if (!settingExists(key)) {
                const error = new Error('Configuração não encontrada');
                error.statusCode = 404;
                throw error;
            }

            await excluirSetting(key);

            resdata.msg = 'Configuração excluída com sucesso';
            resdata.data = { settings };
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Settings');
        }

        res.status(resdata.status).json(resdata);

    }

}
