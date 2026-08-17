import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import type { AuthUser } from '../types/auth.js';

export interface SimulatedAuthSeed {
    id: number;
    user: string;
    fullname: string;
    email: string;
    telephonenumber: string;
}

export const SIMULATED_AUTH_COOKIE_NAME = 'fsph_auth_token';
export const SIMULATED_AUTH_DEFAULT_SEED: SimulatedAuthSeed = {
    id: 1,
    user: 'ovidio.neto',
    fullname: 'Ovidio Batista Trindade Neto',
    email: 'obtneto@gmail.com',
    telephonenumber: '79988199231',
};

function isEnabled(value?: string): boolean {
    return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());
}

export function normalizeSimulatedAuthSeed(seed?: Partial<SimulatedAuthSeed>): SimulatedAuthSeed {
    return {
        id: Number(seed?.id || SIMULATED_AUTH_DEFAULT_SEED.id),
        user: String(seed?.user || SIMULATED_AUTH_DEFAULT_SEED.user).trim(),
        fullname: String(seed?.fullname || SIMULATED_AUTH_DEFAULT_SEED.fullname).trim(),
        email: String(seed?.email || SIMULATED_AUTH_DEFAULT_SEED.email).trim(),
        telephonenumber: String(seed?.telephonenumber || SIMULATED_AUTH_DEFAULT_SEED.telephonenumber).trim(),
    };
}

export function buildSimulatedAuthClaims(seed?: Partial<SimulatedAuthSeed>) {
    const user = normalizeSimulatedAuthSeed(seed);

    return {
        sub: String(user.id),
        uid: user.id,
        user_id: user.id,
        user: user.user,
        user_name: user.user,
        preferred_username: user.user,
        name: user.fullname,
        fullname: user.fullname,
        email: user.email,
        telephonenumber: user.telephonenumber,
        phone_number: user.telephonenumber,
        roles: ['USUARIO_AUTENTICADO'],
    };
}

export function buildSimulatedAuthUser(seed?: Partial<SimulatedAuthSeed>): AuthUser {
    const user = normalizeSimulatedAuthSeed(seed);

    return {
        id: String(user.id),
        name: user.fullname,
        roles: ['USUARIO_AUTENTICADO'],
        tokenVerified: true,
        claims: buildSimulatedAuthClaims(user),
    };
}

function normalizeRoles(payload: JwtPayload | Record<string, any>): string[] {
    const rawRoles = payload.roles || payload.role || payload.authorities || payload.groups || [];

    if (Array.isArray(rawRoles)) {
        return rawRoles.map(role => String(role).trim()).filter(Boolean);
    }

    if (typeof rawRoles === 'string') {
        return rawRoles
            .split(',')
            .map(role => role.trim())
            .filter(Boolean);
    }

    return [];
}

export function buildAuthUserFromPayload(payload: JwtPayload | Record<string, any>, tokenVerified: boolean): AuthUser {
    const name = String(
        payload.name ||
        payload.fullname ||
        payload.preferred_username ||
        payload.username ||
        payload.user_name ||
        payload.user ||
        payload.sub ||
        'USUARIO_AUTENTICADO'
    ).trim();

    return {
        id: String(payload.sub || payload.user_id || payload.uid || name),
        name,
        roles: normalizeRoles(payload),
        tokenVerified,
        claims: payload,
    };
}

export function resolveSimulationSecret(): string {
    return (
        process.env.AUTH_JWT_SECRET?.trim()
        || process.env.AUTH_SIMULATION_JWT_SECRET?.trim()
        || 'farmacia-auth-simulacao'
    );
}

export function createSimulatedAuthToken(seed?: Partial<SimulatedAuthSeed>): string {
    return jwt.sign(buildSimulatedAuthClaims(seed), resolveSimulationSecret(), {
        algorithm: 'HS256',
        expiresIn: '8h',
    });
}

export function parseCookieHeader(cookieHeader?: string): Record<string, string> {
    if (!cookieHeader) {
        return {};
    }

    return cookieHeader.split(';').reduce<Record<string, string>>((cookies, item) => {
        const separatorIndex = item.indexOf('=');

        if (separatorIndex <= 0) {
            return cookies;
        }

        const key = item.slice(0, separatorIndex).trim();
        const value = item.slice(separatorIndex + 1).trim();

        if (key) {
            cookies[key] = decodeURIComponent(value);
        }

        return cookies;
    }, {});
}

export function extractAuthToken(req: Request): string | null {
    const cookies = parseCookieHeader(req.headers.cookie);

    if (cookies[SIMULATED_AUTH_COOKIE_NAME]) {
        return cookies[SIMULATED_AUTH_COOKIE_NAME];
    }

    const authorization = req.headers.authorization;

    if (authorization) {
        const [scheme, token] = authorization.split(' ');

        if (scheme?.toLowerCase() === 'bearer' && token) {
            return token.trim();
        }
    }

    return cookies.authToken || cookies.access_token || null;
}

export function resolveVerificationKey(): string | null {
    const publicKey = process.env.AUTH_JWT_PUBLIC_KEY?.trim();
    const publicKeyBase64 = process.env.AUTH_JWT_PUBLIC_KEY_BASE64?.trim();
    const secret = process.env.AUTH_JWT_SECRET?.trim();
    const simulationSecret = process.env.AUTH_SIMULATION_JWT_SECRET?.trim();

    if (publicKey) {
        return publicKey.replace(/\\n/g, '\n');
    }

    if (publicKeyBase64) {
        return Buffer.from(publicKeyBase64, 'base64').toString('utf-8');
    }

    return secret || simulationSecret || resolveSimulationSecret();
}

export function buildSessionCookieOptions() {
    const secureCookie = isEnabled(process.env.AUTH_COOKIE_SECURE) || process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        secure: secureCookie,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 8 * 60 * 60 * 1000,
    };
}
