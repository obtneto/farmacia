import { z } from "zod";

export function registrarFerramentasInventario(server) {
  server.tool(
    "regras_inventario",
    "Explica regras do inventário",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `
Regras do inventário:

- apenas um inventário aberto por depósito/mês
- inventário fechado não pode editar
- fechamento sobrescreve estoque
- iti_qtde_dif é VIRTUAL GENERATED
- não enviar iti_qtde_dif em UPDATE
            `.trim(),
          },
        ],
      };
    }
  );

  server.tool(
    "validar_fechamento_inventario",
    "Valida fechamento de inventário",
    {
      inventarioId: z.number(),
    },
    async ({ inventarioId }) => {
      return {
        content: [
          {
            type: "text",
            text: `
Inventário ${inventarioId}

Checklist:
- verificar status aberto
- validar itens preenchidos
- validar transaction
- bloquear edição após fechamento
            `.trim(),
          },
        ],
      };
    }
  );
}