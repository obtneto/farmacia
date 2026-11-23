import { Request, Response, NextFunction } from 'express'
import type { JwtPayload } from 'jsonwebtoken'

function getProfileId(req: Request): number {
    const payload = req.usuarioLogado
    if (!payload || typeof payload === 'string') {
        return 0
    }

    const value = (payload as JwtPayload).perfil
    const profileId = typeof value === 'number' ? value : Number(value)
    return Number.isInteger(profileId) ? profileId : 0
}

function isDemandEdit(req: Request): boolean {
    if (req.path === '/demandas-especificas/salvar') {
        return Number(req.body?.id || 0) > 0
    }

    if (req.path === '/itens-demandas/salvar') {
        return Number(req.body?.id || 0) > 0
    }

    return req.path.startsWith('/demandas-especificas/excluir/')
        || req.path.startsWith('/itens-demandas/excluir/')
        || req.path.startsWith('/itens-demandas/ativar_desativar/')
}

function isDeniedForOperator(req: Request, profileId: number): boolean {
    if (req.path === '/estoque/bloquear' || req.path === '/estoque/desbloquear') {
        return true
    }

    if (req.path === '/inventarios/novo' || req.path === '/inventario/novo') {
        return true
    }

    if (req.path.startsWith('/inventario/fechar/')) {
        return true
    }

    if (profileId === 3 && (req.path === '/entradas/aprovar-entradas' || req.path.startsWith('/requisicoes/aprovar/'))) {
        return true
    }

    return isDemandEdit(req)
}

export default function verificarPermissao(req: Request, res: Response, next: NextFunction) {
    const profileId = getProfileId(req)

    if (profileId === 1) {
        return next()
    }

    if ((profileId === 2 || profileId === 3) && isDeniedForOperator(req, profileId)) {
        return res.status(403).json({
            code: 'AUTH_PERMISSION_DENIED',
            mensagem: 'Perfil sem permissão para executar esta ação.',
        })
    }

    if (profileId === 2 || profileId === 3) {
        return next()
    }

    return res.status(403).json({
        code: 'AUTH_PERMISSION_DENIED',
        mensagem: 'Perfil de usuário inválido ou sem permissão.',
    })
}
