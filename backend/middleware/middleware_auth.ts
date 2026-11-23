import { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import AuthSessions from '../model/dao_auth_sessions.js';
import { clearSessionCookie, getSessionCookie, setSessionCookie } from '../utils/auth-cookie.js';

declare global {
    namespace Express {
        interface Request {
            usuarioLogado?: JwtPayload | string;
        }
    }
}

async function verificarJWT(req: Request, res: Response, next: NextFunction) {
    const token = getSessionCookie(req);
    if (!token) {
        return res.status(401).json({ code: 'AUTH_TOKEN_REQUIRED', mensagem: 'Sessão não fornecida' });
    }

    const key = process.env.KEY_TOKEN || '';
    if (!key) return next(new Error('A chave secreta não encontrada.'));

    let decoded: JwtPayload | string;
    try {
        decoded = jwt.verify(token, key);
    } catch {
        return res.status(401).json({ code: 'AUTH_TOKEN_INVALID', mensagem: 'Sessão inválida ou expirada' });
    }
    if (typeof decoded === 'string' || typeof decoded.sid !== 'string') {
        return res.status(401).json({ code: 'AUTH_TOKEN_INVALID', mensagem: 'Sessão inválida ou expirada' });
    }

    try {
        if (!await AuthSessions.Touch(decoded.sid)) {
            await AuthSessions.Revoke(decoded.sid);
            clearSessionCookie(res, req.secure);
            return res.status(401).json({ code: 'AUTH_SESSION_EXPIRED', mensagem: 'Sessão expirada por inatividade' });
        }

        const { iat: _iat, exp: _exp, nbf: _nbf, ...sessionPayload } = decoded;
        const renewedToken = jwt.sign(sessionPayload, key, { expiresIn: '1h' });
        setSessionCookie(res, renewedToken, req.secure);
        req.usuarioLogado = sessionPayload as JwtPayload;
        return next();
    } catch (error) {
        return next(error);
    }
}

function verificarSessaoOpcional(req: Request, res: Response, next: NextFunction) {
    if (!getSessionCookie(req)) return next();
    return verificarJWT(req, res, next);
}

export default verificarJWT;
export { verificarSessaoOpcional };
