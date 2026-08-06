import { z } from "zod";

export function registrarFerramentasEstoque(server) {
  server.tool(
    "listar_alertas_estoque",
    "Lista regras de alertas do estoque",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `
Alertas do Estoque:

- estoque crítico:
  est_saldo <= med_min

- vencimento próximo:
  est_validade <= ALERTA_VENCIMENTO_DIAS

- lote vencido:
  est_validade < CURRENT_DATE

- estoque controlado por:
  depósito + medicamento + lote
            `.trim(),
          },
        ],
      };
    }
  );

  server.tool(
    "validar_baixa_estoque",
    "Valida se um lote possui saldo suficiente",
    {
      medicamento: z.string(),
      lote: z.string(),
      quantidade: z.number(),
    },
    async ({ medicamento, lote, quantidade }) => {
      return {
        content: [
          {
            type: "text",
            text: `
Validação simulada:

Medicamento: ${medicamento}
Lote: ${lote}
Quantidade: ${quantidade}

Regras:
- validar saldo antes da aprovação
- validar validade do lote
- operação deve usar transaction
            `.trim(),
          },
        ],
      };
    }
  );

  server.tool(
    "explicar_fluxo_estoque",
    "Explica o fluxo de movimentação do estoque",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `
Fluxo de estoque:

ENTRADA
- cria registro em tb_entradas
- soma saldo em tb_estoque

REQUISIÇÃO
- nasce pendente
- só baixa saldo após aprovação

INVENTÁRIO
- Criação de Inventario com uma no numeração e seleção dos itens de estoque
  de acordo o tipo de medicamento, e emitindo uma ficha de inventario em pdf e impressão dessa ficha
- Digitação da ficha de inventario e confronto Saldo x inventario (digitado) 
- Fechamento do inventario e sobrescrevendo saldo de estoque.

TRANSFERÊNCIA
- decrementa origem
- incrementa destino
            `.trim(),
          },
        ],
      };
    }
  );
}