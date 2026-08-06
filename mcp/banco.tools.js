export function registrarFerramentasBanco(server) {
  server.tool(
    "listar_schemas",
    "Lista schemas do projeto",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `
Schemas:

1. fsph_farmacia
- leitura e escrita

2. fsph_ambulatorio
- somente leitura
- acesso à tb_pacientes
            `.trim(),
          },
        ],
      };
    }
  );

  server.tool(
    "listar_tabelas_principais",
    "Lista tabelas principais do sistema com base no schema atual",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `
Tabelas principais:

- tb_medicamentos
- tb_estoque
- tb_entradas
- tb_itens_entradas
- tb_requisicoes
- tb_inventarios
- tb_itens_inventario
- tb_depositos
- tb_locais
- tb_boname
- tb_diagnosticos
- tb_demandas_especificas
- tb_pacientes_gaucher
- tb_tipos_medicamentos
- tb_tipos_requisicoes
- tb_fornecedores

Observações:

- schema de referência: fsph_farmacia
- tb_itens_entradas existe no banco atual e representa os itens detalhados da entrada
- o dump local pode estar defasado em relação ao banco atual
            `.trim(),
          },
        ],
      };
    }
  );

  server.tool(
    "regras_banco_legado",
    "Explica regras do banco legado",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `
Regras banco legado:

- nunca recriar tabelas
- nunca usar sync automático ORM
- charset utf8mb4
- usar nomes reais do banco
- respeitar chaves compostas
- não alterar fsph_ambulatorio
            `.trim(),
          },
        ],
      };
    }
  );
}
