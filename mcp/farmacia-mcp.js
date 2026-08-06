import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registrarFerramentasMySQL } from "./mysql.tools.js";
import { registrarFerramentasEstoque } from "./estoque.tools.js";
import { registrarFerramentasInventario } from "./inventario.tools.js";
import { registrarFerramentasRequisicoes } from "./requisicoes.tools.js";
import { registrarFerramentasBanco } from "./banco.tools.js";
import { registrarFerramentasRegras } from "./regras.tools.js";

const server = new McpServer({
  name: "farmacia-ambulatorial-mcp",
  version: "1.0.1",
});

registrarFerramentasEstoque(server);
registrarFerramentasInventario(server);
registrarFerramentasRequisicoes(server);
registrarFerramentasBanco(server);
registrarFerramentasMySQL(server);
registrarFerramentasRegras(server);

const transport = new StdioServerTransport();

await server.connect(transport);
