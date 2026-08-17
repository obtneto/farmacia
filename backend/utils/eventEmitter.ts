import { EventEmitter } from 'events';

/**
 * Tipo que define o mapa de eventos padrão para a aplicação de Farmácia.
 * Adicione novos eventos e seus tipos correspondentes aqui.
 */
export type AppEvents = {
    'estoque:atualizado': [{ id_medicamento: number; quantidade: number; tipo: 'entrada' | 'saida' }];
    'requisicao:criada': [{ id_requisicao: number; solicitante: string }];
    'error:log': [{ message: string; context: string; error?: any }];
}

/**
 * EventEmitter fortemente tipado para prevenir erros de digitação nos nomes de eventos
 * e garantir a assinatura correta dos parâmetros de callback.
 */
export class TypedEventEmitter<T extends Record<string | symbol, any[]>> extends EventEmitter {
    override emit<K extends keyof T>(eventName: K, ...args: T[K]): boolean {
        return super.emit(eventName as string | symbol, ...args);
    }

    override on<K extends keyof T>(eventName: K, listener: (...args: T[K]) => void): this {
        return super.on(eventName as string | symbol, listener as (...args: any[]) => void);
    }

    override once<K extends keyof T>(eventName: K, listener: (...args: T[K]) => void): this {
        return super.once(eventName as string | symbol, listener as (...args: any[]) => void);
    }

    override off<K extends keyof T>(eventName: K, listener: (...args: T[K]) => void): this {
        return super.off(eventName as string | symbol, listener as (...args: any[]) => void);
    }
}

// Instância global única para comunicação de eventos entre diferentes camadas/controllers
export const appEvents = new TypedEventEmitter<AppEvents>();
