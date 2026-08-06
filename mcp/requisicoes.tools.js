import { z } from "zod";

export function registrarFerramentasRequisicoes(server) {
  server.tool(
    "regras_requisicoes",
    "Explica regras de requisições",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `
Regras de requisições:

- requisição inicia pendente
- aprovação baixa estoque
- não permitir saldo negativo
- requisição nominal usa paciente
- paciente vem do schema fsph_ambulatorio
- fsph_ambulatorio é somente leitura
            `.trim(),
          },
        ],
      };
    }
  );

  server.tool(
    "explicar_chave_requisicoes",
    "Explica chave composta de tb_requisicoes",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `
Chave composta:

tb_requisicoes:
- req_id
- req_med_id
- req_lote

Atenção:
- updates devem considerar os 3 campos
- deletes devem considerar os 3 campos
            `.trim(),
          },
        ],
      };
    }
  );

  server.tool(
    "validar_aprovacao_requisicao",
    "Valida aprovação de requisição",
    {
      reqId: z.number(),
    },
    async ({ reqId }) => {
      return {
        content: [
          {
            type: "text",
            text: `
Validação da requisição ${reqId}

Checklist:
- validar saldo
- validar lote
- validar validade
- usar transaction
- atualizar req_aprova
- registrar req_aprovado_por
            `.trim(),
          },
        ],
      };
    }
  );
}