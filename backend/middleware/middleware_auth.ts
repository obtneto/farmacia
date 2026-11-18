import { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            usuarioLogado?: JwtPayload | string;
        }
    }
}

function verificarJWT(req: Request, res: Response, next: NextFunction) {

    const authHeader = req.headers['authorization'];

    // O formato esperado no header é: "Bearer <token>"
    const [scheme, token] = authHeader?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ mensagem: 'Token não fornecido' });
    }

    const key: string = process.env.KEY_TOKEN || '';

    if (key === '') {
        const error = new Error('A chave secreta não encontrada.');
        error.statusCode = 404;
        throw error;
    }

    try {
        const decoded = jwt.verify(token, key);

        // Salva os dados do usuário na requisição para uso posterior
        req.usuarioLogado = decoded;
        return next();
    } catch {
        return res.status(403).json({ mensagem: 'Token inválido ou expirado' });
    }
}

export default verificarJWT;
