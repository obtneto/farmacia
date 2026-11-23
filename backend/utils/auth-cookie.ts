import type { Request, Response } from 'express';

export const SESSION_COOKIE = 'farmacia_session';
export const SESSION_MAX_AGE_MS = 60 * 60 * 1000;

function cookieOptions(secure: boolean) {
    return {
        httpOnly: true,
        secure,
        sameSite: 'lax' as const,
        path: '/',
    };
}

export function getSessionCookie(req: Request): string | undefined {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return undefined;
    const item = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
    if (!item) return undefined;
    try {
        return decodeURIComponent(item.slice(SESSION_COOKIE.length + 1));
    } catch {
        return undefined;
    }
}

export function setSessionCookie(res: Response, token: string, secure: boolean): void {
    res.cookie(SESSION_COOKIE, token, { ...cookieOptions(secure), maxAge: SESSION_MAX_AGE_MS });
}

export function clearSessionCookie(res: Response, secure: boolean): void {
    res.clearCookie(SESSION_COOKIE, cookieOptions(secure));
}
