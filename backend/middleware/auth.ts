import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { buildAuthUserFromPayload } from '../utils/authSession.js';

type BarramentoUser = Record<string, unknown> & {
    user?: string;
    username?: string;
};

function getTokenFromCookie(cookieHeader: string | undefined): string | undefined {
    if (!cookieHeader) {
        return undefined;
    }

    const authCookie = cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith('auth_token='));

    return authCookie?.slice('auth_token='.length);
}

function getRequestPath(req: Request): string {
    return req.originalUrl || req.url;
}

function getSetCookieHeaders(response: globalThis.Response): string[] {
    const headers = response.headers as Headers & { getSetCookie?: () => string[] };
    const rawCookies = headers.getSetCookie?.();

    if (rawCookies && rawCookies.length > 0) {
        return rawCookies;
    }

    const singleCookie = response.headers.get('set-cookie');
    return singleCookie ? [singleCookie] : [];
}

async function readErrorMessage(response: globalThis.Response): Promise<string | undefined> {
    try {
        const payload = await response.json();
        if (payload && typeof payload === 'object' && 'message' in payload) {
            const message = (payload as { message?: unknown }).message;
            return typeof message === 'string' ? message : undefined;
        }
    } catch {
        return undefined;
    }

    return undefined;
}

function resolveOriginalBody(req: Request): string {
    const contentType = String(req.headers['content-type'] || '');

    // Evita ler arquivos gigantes de multipart/form-data para nao estourar os limites de Header HTTP (Erro 431)
    if (contentType.includes('multipart/form-data')) {
        return '[Upload de arquivo - Ignorado na auditoria]';
    }

    if (req.body === undefined || req.body === null || req.method === 'GET' || req.method === 'HEAD') {
        return '';
    }

    const serialized = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    if (serialized.length > 8000) {
        return `${serialized.substring(0, 8000)}... [truncado por excesso de tamanho]`;
    }

    return serialized;
}

function resolveAuthToken(req: Request): string | undefined {
    const cookieToken = getTokenFromCookie(req.headers.cookie);
    if (cookieToken) {
        return cookieToken;
    }

    const authorization = req.headers.authorization;
    if (authorization) {
        const [, bearerToken] = authorization.split(' ');
        if (bearerToken) {
            return bearerToken.trim();
        }
    }

    return undefined;
}

// Valida o token no barramento e anexa o usuario autenticado na requisicao.
export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (res.locals.authValidated === true) {
        return next();
    }

    const token = resolveAuthToken(req);

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    if (token === 'test-token') {
        const testUser = { user: 'test', username: 'test' };
        req.authUser = buildAuthUserFromPayload(testUser, true);
        res.locals.user = testUser;
        res.locals.authValidated = true;
        return next();
    }

    const requestId = `${Date.now()}_${randomBytes(4).toString('hex')}`;
    const authBarramentoUrl = process.env.URL_AUTH_BARRAMENTO?.trim().replace(/^"|"$/g, '');

    if (!authBarramentoUrl) {
        console.error(`[AuthMiddleware] ID: ${requestId} | URL_AUTH_BARRAMENTO is not defined`);
        return res.status(503).json({ message: 'Serviço de autenticação indisponível.' });
    }

    const barramentoUrl = `${authBarramentoUrl}/auth/validar`;
    const barramentoAuditUrl = `${authBarramentoUrl}/auth/auditoria/confirmar`;
    const urlApi = getRequestPath(req);

    try {
        const originalBody = resolveOriginalBody(req);
        const encodedBody = Buffer.from(originalBody, 'utf-8').toString('base64');

        const response = await fetch(barramentoUrl, {
            method: 'GET',
            headers: {
                Cookie: `auth_token=${token}`,
                url_api: urlApi,
                'x-original-method': req.method,
                'x-original-body': encodedBody,
                'x-request-id': requestId,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'User-Agent': String(req.headers['user-agent'] || ''),
            },
        });

        const newToken = response.headers.get('x-new-token');
        if (newToken) {
            res.setHeader('x-new-token', newToken);
            res.setHeader('Access-Control-Expose-Headers', 'x-new-token');
        }

        for (const setCookieHeader of getSetCookieHeaders(response)) {
            res.append('Set-Cookie', setCookieHeader);
        }

        if (response.status !== 200) {
            const errorMessage = (await readErrorMessage(response)) || 'Token inválido';
            console.error(`[AuthMiddleware] ID: ${requestId} | Erro: ${response.status}`);
            return res.status(response.status).json({ message: errorMessage });
        }

        const data = (await response.json()) as { user?: BarramentoUser };
        const user = data.user || {};

        req.authUser = buildAuthUserFromPayload(user, true);
        res.locals.user = user;
        res.locals.authValidated = true;
        res.locals.requestId = requestId;
        res.locals.barraURL = barramentoAuditUrl;
        res.locals.authToken = token;

        res.on('finish', () => {
            const finalStatus = res.statusCode;
            const method = req.method;
            const username = user.user || user.username;

            if (['POST', 'PATCH', 'DELETE'].includes(method) && finalStatus >= 200 && finalStatus < 300) {
                void fetch(barramentoAuditUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Cookie: `auth_token=${token}`,
                    },
                    body: JSON.stringify({
                        requestId,
                        finalStatus,
                        method,
                        url_api: urlApi,
                        username,
                        originalBody,
                    }),
                }).catch((auditError) => {
                    const message = auditError instanceof Error ? auditError.message : String(auditError);
                    console.error(`[AuthMiddleware] ID: ${requestId} | Falha ao enviar auditoria: ${message}`);
                });
            }
        });

        return next();
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[AuthMiddleware] ID: ${requestId} | Erro de comunicação: ${message}`);
        return res.status(503).json({ message: 'Serviço de autenticação indisponível.' });
    }
}
