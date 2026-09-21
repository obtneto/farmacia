import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Request, Response } from 'express';
import { iresdata } from './interface_controllers.js';
import { applyControllerError } from '../utils/controllerError.js';

type NotificationTone = 'info' | 'warning' | 'success' | 'danger';

export interface NotificationRecord {
    id: string;
    title: string;
    description: string;
    tone: NotificationTone;
    read: boolean;
    createdAt: string;
    actionLabel?: string;
    actionSectionKey?: string;
    critical: boolean | null;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const notificationsFilePath = path.resolve(__dirname, '../utils/notificacoes.json');

class NotificationService extends EventEmitter {

    private notifications: NotificationRecord[] = [];
    private readonly maxHistory = 50;
    private persistQueue: Promise<void> = Promise.resolve();

    constructor() {
        super();
        this.setMaxListeners(200);
        this.notifications = this.loadFromDisk();
    }

    list(): NotificationRecord[] {
        return this.notifications;
    }

    async publish(notification: Pick<NotificationRecord, 'title' | 'description'> & Partial<Pick<NotificationRecord, 'id' | 'tone' | 'actionLabel' | 'actionSectionKey' | 'critical'>>): Promise<NotificationRecord> {
        const existingNotification = this.findExistingNotification(notification.id);

        if (existingNotification) {
            return existingNotification;
        }

        const record: NotificationRecord = {
            id: this.createNotificationId(notification.id),
            title: notification.title.trim(),
            description: notification.description.trim(),
            tone: notification.tone || 'info',
            read: false,
            createdAt: new Date().toISOString(),
            actionLabel: notification.actionLabel?.trim(),
            actionSectionKey: notification.actionSectionKey?.trim(),
            critical: notification.critical ?? false
        };

        this.notifications = [record, ...this.notifications].slice(0, this.maxHistory);
        await this.persist();
        this.emit('notification', record);

        return record;
    }

    private findExistingNotification(requestedId?: string): NotificationRecord | null {
        const id = requestedId?.trim();

        if (!id) {
            return null;
        }

        return this.notifications.find(item => item.id === id) || null;
    }

    private createNotificationId(requestedId?: string): string {
        return requestedId?.trim() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    async clear(): Promise<void> {
        this.notifications = [];
        await this.persist();
        this.emit('clear');
    }

    async remove(id: string): Promise<void> {
        const currentCount = this.notifications.length;
        this.notifications = this.notifications.filter(item => item.id !== id);

        if (this.notifications.length !== currentCount) {
            await this.persist();
            this.emit('remove', { id });
        }
    }

    async markAsRead(id: string): Promise<NotificationRecord | null> {
        const notification = this.notifications.find(item => item.id === id);

        if (!notification) {
            return null;
        }

        const updatedNotification = { ...notification, read: true };
        this.notifications = this.notifications.map(item => item.id === id ? updatedNotification : item);
        await this.persist();
        this.emit('read', updatedNotification);

        return updatedNotification;
    }

    private loadFromDisk(): NotificationRecord[] {
        if (!fs.existsSync(notificationsFilePath)) {
            return [];
        }

        const fileContent = fs.readFileSync(notificationsFilePath, 'utf8');
        const parsedContent: unknown = JSON.parse(fileContent);

        if (!Array.isArray(parsedContent)) {
            return [];
        }

        return parsedContent
            .filter((item): item is NotificationRecord => {
                return (
                    typeof item === 'object'
                    && item !== null
                    && 'id' in item
                    && 'title' in item
                    && 'description' in item
                    && typeof item.id === 'string'
                    && typeof item.title === 'string'
                    && typeof item.description === 'string'
                );
            })
            .slice(0, this.maxHistory);
    }

    private async persist(): Promise<void> {
        const content = `${JSON.stringify(this.notifications, null, 2)}\n`;
        this.persistQueue = this.persistQueue.then(() => fs.promises.writeFile(notificationsFilePath, content, 'utf8'));
        await this.persistQueue;
    }
}

export const notificationService = new NotificationService();

function writeSseEvent(res: Response, eventName: string, payload: unknown): void {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export default class Controller_Notificacoes {

    static async Listar(req: Request, res: Response) {

        const resdata = { err: 0, msg: '', status: 200, data: {} } as iresdata;

        try {
            resdata.data = { notifications: notificationService.list() };
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Notificacoes');
        }

        res.status(resdata.status).json(resdata);

    }

    static async Publicar(req: Request, res: Response) {

        const resdata = { err: 0, msg: '', status: 200, data: {} } as iresdata;

        try {
            const title = String(req.body?.title || '').trim();
            const description = String(req.body?.description || '').trim();
            const tone = String(req.body?.tone || 'info') as NotificationTone;

            if (!title) {
                const error = new Error('Titulo da notificação não informado');
                error.statusCode = 400;
                throw error;
            }

            if (!description) {
                const error = new Error('Descrição da notificação não informada');
                error.statusCode = 400;
                throw error;
            }

            if (!['info', 'warning', 'success', 'danger'].includes(tone)) {
                const error = new Error('Tipo da notificação inválido');
                error.statusCode = 400;
                throw error;
            }

            resdata.msg = 'Notificação publicada com sucesso';
            resdata.data = {
                notification: await notificationService.publish({
                    title,
                    description,
                    tone,
                    actionLabel: req.body?.actionLabel ? String(req.body.actionLabel) : undefined,
                    actionSectionKey: req.body?.actionSectionKey ? String(req.body.actionSectionKey) : undefined,
                    critical: req.body?.critical !== undefined ? Boolean(req.body.critical) : undefined,
                })
            };
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Notificacoes');
        }

        res.status(resdata.status).json(resdata);

    }

    static async Limpar(req: Request, res: Response) {

        const resdata = { err: 0, msg: '', status: 200, data: {} } as iresdata;

        try {
            await notificationService.clear();
            resdata.msg = 'Notificações limpas com sucesso';
            resdata.data = { notifications: [] };
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Notificacoes');
        }

        res.status(resdata.status).json(resdata);

    }

    static async Remover(req: Request, res: Response) {

        const resdata = { err: 0, msg: '', status: 200, data: {} } as iresdata;

        try {
            const id = String(req.params?.id || '').trim();

            if (!id) {
                const error = new Error('Notificação não informada');
                error.statusCode = 400;
                throw error;
            }

            await notificationService.remove(id);
            resdata.msg = 'Notificação removida com sucesso';
            resdata.data = { id };
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Notificacoes');
        }

        res.status(resdata.status).json(resdata);

    }

    static async MarcarComoLida(req: Request, res: Response) {

        const resdata = { err: 0, msg: '', status: 200, data: {} } as iresdata;

        try {
            const id = String(req.params?.id || '').trim();

            if (!id) {
                const error = new Error('Notificação não informada');
                error.statusCode = 400;
                throw error;
            }

            const notification = await notificationService.markAsRead(id);

            if (!notification) {
                const error = new Error('Notificação não encontrada');
                error.statusCode = 404;
                throw error;
            }

            resdata.msg = 'Notificação marcada como lida';
            resdata.data = { notification };
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Notificacoes');
        }

        res.status(resdata.status).json(resdata);

    }

    static async Stream(req: Request, res: Response) {

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        const sendNotification = (notification: NotificationRecord) => {
            writeSseEvent(res, 'notification', notification);
        };
        const sendClear = () => {
            writeSseEvent(res, 'clear', { notifications: [] });
        };
        const sendRemove = (payload: { id: string }) => {
            writeSseEvent(res, 'remove', payload);
        };
        const sendRead = (notification: NotificationRecord) => {
            writeSseEvent(res, 'read', notification);
        };

        writeSseEvent(res, 'snapshot', { notifications: notificationService.list() });

        notificationService.on('notification', sendNotification);
        notificationService.on('clear', sendClear);
        notificationService.on('remove', sendRemove);
        notificationService.on('read', sendRead);

        req.on('close', () => {
            notificationService.removeListener('notification', sendNotification);
            notificationService.removeListener('clear', sendClear);
            notificationService.removeListener('remove', sendRemove);
            notificationService.removeListener('read', sendRead);
            res.end();
        });

    }

}
