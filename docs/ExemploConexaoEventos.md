# Exemplo de Conexão Frontend <-> Backend EventEmitter (via SSE)

Como o `EventEmitter` do Node.js roda exclusivamente na memória do servidor (backend), o frontend (navegador) não pode se conectar a ele diretamente. Para enviar esses eventos em tempo real para o frontend, utilizamos **Server-Sent Events (SSE)**, que é um protocolo unidirecional leve sobre HTTP nativo nos navegadores modernos.

---

## 1. Backend: Criando o Endpoint de Eventos (SSE)

Crie uma rota no backend que mantenha uma conexão aberta com o cliente e repasse os eventos do `appEvents` para a resposta HTTP.

### Exemplo de Controller: `backend/controllers/controller_events.ts`

```typescript
import { Request, Response } from 'express';
import { appEvents, AppEvents } from '../utils/eventEmitter.js';

export default class ControllerEvents {

    static async streamEvents(req: Request, res: Response) {
        // Configura cabeçalhos necessários para manter a conexão SSE aberta
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Envia uma mensagem inicial de conexão estabelecida
        res.write('data: {"status": "connected"}\n\n');

        // Listeners para escutar do EventEmitter e escrever no stream SSE
        const handleEstoque = (data: AppEvents['estoque:atualizado'][0]) => {
            res.write(`event: estoque_atualizado\ndata: ${JSON.stringify(data)}\n\n`);
        };

        const handleRequisicao = (data: AppEvents['requisicao:criada'][0]) => {
            res.write(`event: requisicao_criada\ndata: ${JSON.stringify(data)}\n\n`);
        };

        // Inscreve os listeners no EventEmitter global
        appEvents.on('estoque:atualizado', handleEstoque);
        appEvents.on('requisicao:criada', handleRequisicao);

        // Se o cliente fechar a conexão, removemos os listeners para evitar vazamento de memória
        req.on('close', () => {
            appEvents.off('estoque:atualizado', handleEstoque);
            appEvents.off('requisicao:criada', handleRequisicao);
            res.end();
        });
    }
}
```

### Registrando a rota no backend: `backend/routes/routes_events.ts`

```typescript
import { Router } from 'express';
import ControllerEvents from '../controllers/controller_events.js';

const router = Router();
router.get('/stream', ControllerEvents.streamEvents);

export default router;
```

---

## 2. Frontend: Consumindo os Eventos com React / TypeScript

No frontend (Vite/React), usamos a classe nativa do navegador `EventSource` para se conectar ao endpoint `/stream` e receber os eventos.

### Exemplo de Hook React: `frontend/src/hooks/useAppEvents.ts`

```typescript
import { useEffect, useState } from 'react';

export interface EstoqueAtualizado {
    id_medicamento: number;
    quantidade: number;
    tipo: 'entrada' | 'saida';
}

export interface RequisicaoCriada {
    id_requisicao: number;
    solicitante: string;
}

export function useAppEvents() {
    
    const [ultimoEstoque, setUltimoEstoque] = useState<EstoqueAtualizado | null>(null);
    const [ultimaRequisicao, setUltimaRequisicao] = useState<RequisicaoCriada | null>(null);

    useEffect(() => {
        // Conecta ao endpoint SSE do backend (ajuste a URL se necessário)
        const eventSource = new EventSource('http://localhost:3000/stream', {
            withCredentials: true // se precisar enviar cookies/sessão
        });

        // Ouve o evento 'estoque_atualizado'
        eventSource.addEventListener('estoque_atualizado', (event) => {
            const data: EstoqueAtualizado = JSON.parse(event.data);
            setUltimoEstoque(data);
        });

        // Ouve o evento 'requisicao_criada'
        eventSource.addEventListener('requisicao_criada', (event) => {
            const data: RequisicaoCriada = JSON.parse(event.data);
            setUltimaRequisicao(data);
        });

        // Tratamento de erro ou reconexão
        eventSource.onerror = (err) => {
            console.error('Erro na conexão SSE:', err);
        };

        // Limpa a conexão ao desmontar o componente/hook
        return () => {
            eventSource.close();
        };
    }, []);

    return { ultimoEstoque, ultimaRequisicao };
}
```

### Exemplo de Uso no Componente React: `frontend/src/components/DashboardRealtime.tsx`

```tsx
import React from 'react';
import { useAppEvents } from '../hooks/useAppEvents';

export const DashboardRealtime: React.FC = () => {
    const { ultimoEstoque, ultimaRequisicao } = useAppEvents();

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Painel em Tempo Real</h2>
            
            <div style={{ marginBottom: '15px', border: '1px solid #ccc', padding: '10px' }}>
                <h3>Última Atualização de Estoque</h3>
                {ultimoEstoque ? (
                    <p>Medicamento ID: {ultimoEstoque.id_medicamento} | Qtd: {ultimoEstoque.quantidade} ({ultimoEstoque.tipo})</p>
                ) : (
                    <p>Nenhuma atualização recente.</p>
                )}
            </div>

            <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                <h3>Última Requisição Criada</h3>
                {ultimaRequisicao ? (
                    <p>Requisição ID: {ultimaRequisicao.id_requisicao} | Solicitante: {ultimaRequisicao.solicitante}</p>
                ) : (
                    <p>Nenhuma requisição recente.</p>
                )}
            </div>
        </div>
    );
};
```
