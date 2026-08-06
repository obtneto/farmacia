export function registrarFerramentasRegras(server) {

  server.tool(
    "regras_desenvolvimento",
    "Regras oficiais desenvolvimento projeto",
    {},
    async () => {

      return {
        content: [
          {
            type: "text",
            text: `
              REGRA ABSOLUTA BACKEND

              O backend é responsabilidade principal é do Usuario.

              Nenhum agente deve:
              - criar backend
              - alterar backend
              - refatorar backend
              - implementar endpoints
              - alterar regras críticas

              sem pedido explícito do Usuario.

              Frontend:
              - React 19
              - RSuite


              Import obrigatório:
              import 'rsuite/dist/rsuite.css'


              MCPs:
              - farmacia
              - context7`.trim(),
          },
        ],
      };

    }
  );

}