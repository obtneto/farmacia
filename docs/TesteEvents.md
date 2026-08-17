import { appEvents } from '../../../../../farmacia/backend/utils/eventEmitter.js';

console.log('--- Iniciando teste do EventEmitter ---');

// Registra listeners de teste
appEvents.on('estoque:atualizado', (data) => {
    console.log('[Listener Estoque] Recebido:', data);
});

appEvents.on('requisicao:criada', (data) => {
    console.log('[Listener Requisicao] Recebido:', data);
});

appEvents.on('error:log', (data) => {
    console.error('[Listener Erro] Recebido:', data.message, 'Contexto:', data.context);
});

// Emite eventos de teste
appEvents.emit('estoque:atualizado', { id_medicamento: 42, quantidade: 100, tipo: 'entrada' });
appEvents.emit('requisicao:criada', { id_requisicao: 1024, solicitante: 'Dr. House' });
appEvents.emit('error:log', { message: 'Conexão perdida temporariamente', context: 'Database' });

console.log('--- Fim do teste ---');

