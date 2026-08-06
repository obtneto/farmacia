declare module 'jsonwebtoken' {
    export interface JwtPayload {
        [key: string]: any;
        sub?: string;
        name?: string;
    }

    export type Algorithm = string;

    export interface VerifyOptions {
        algorithms?: Algorithm[];
    }

    export interface SignOptions {
        algorithm?: Algorithm;
        expiresIn?: string | number;
    }

    interface JsonWebTokenApi {
        sign(payload: string | object | Buffer, secretOrPrivateKey: string, options?: SignOptions): string;
        verify(token: string, secretOrPublicKey: string, options?: VerifyOptions): JwtPayload | string;
        decode(token: string): JwtPayload | string | null;
    }

    const jwt: JsonWebTokenApi;
    export default jwt;
}
