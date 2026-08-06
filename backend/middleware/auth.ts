import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { logUnexpectedError } from '../utils/controllerError.js';
import {
    buildAuthUserFromPayload,
    extractAuthToken,
    resolveVerificationKey,
} from '../utils/authSession.js';

// Interpreta flags booleanas do ambiente sem depender de capitalizacao.
function isEnabled(value?: string): boolean {
    return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());
}

// Valida tokens externos e anexa as claims do usuario autenticado na requisicao.
export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authRequired = isEnabled(process.env.AUTH_REQUIRED);
    const allowUnverifiedTokens = isEnabled(process.env.AUTH_ALLOW_UNVERIFIED_TOKENS);
    const token = extractAuthToken(req);

    if (!token) {
        if (authRequired) {
            return res.status(401).json({
                err: 401,
                msg: 'Token Bearer não informado.',
                status: 401,
                data: null,
            });
        }

        return next();
    }

    const verificationKey = resolveVerificationKey();
    const algorithms = process.env.AUTH_JWT_ALGORITHMS
        ?.split(',')
        .map(item => item.trim())
        .filter(Boolean);

    try {
        if (verificationKey) {
            const payload = jwt.verify(
                token,
                verificationKey,
                algorithms?.length ? { algorithms } : undefined,
            ) as JwtPayload;

            req.authUser = buildAuthUserFromPayload(payload, true);
            return next();
        }

        if (!allowUnverifiedTokens) {
            const message = 'Autenticação habilitada, mas sem chave pública/segredo configurado para validar o token externo.';

            if (authRequired) {
                logUnexpectedError('AuthMiddleware', new Error(message));
            }

            return res.status(authRequired ? 500 : 401).json({
                err: authRequired ? 500 : 401,
                msg: authRequired
                    ? message
                    : 'Token inválido.',
                status: authRequired ? 500 : 401,
                data: null,
            });
        }

        const decoded = jwt.decode(token);

        if (!decoded || typeof decoded === 'string') {
            return res.status(401).json({
                err: 401,
                msg: 'Token inválido.',
                status: 401,
                data: null,
            });
        }

        req.authUser = buildAuthUserFromPayload(decoded, false);
        return next();
    } catch (error: any) {
        return res.status(401).json({
            err: 401,
            msg: error.message || 'Falha ao validar token.',
            status: 401,
            data: null,
        });
    }
}
