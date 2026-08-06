import mysql from "mysql2/promise";
import "dotenv/config";
import { z } from "zod";

const READ_ONLY_BLOCKLIST = [
  "insert",
  "update",
  "delete",
  "drop",
  "alter",
  "create",
  "truncate",
  "replace",
  "grant",
  "revoke",
  "call",
  "execute",
  "set",
  "lock",
  "unlock",
];

function validarSomenteLeitura(sql) {
  const normalized = sql.trim().toLowerCase();

  if (
    !normalized.startsWith("select") &&
    !normalized.startsWith("show") &&
    !normalized.startsWith("describe")
  ) {
    throw new Error("Apenas SELECT, SHOW e DESCRIBE são permitidos.");
  }

  for (const palavra of READ_ONLY_BLOCKLIST) {
    if (normalized.includes(`${palavra} `)) {
      throw new Error(`Comando bloqueado por segurança: ${palavra}`);
    }
  }
}

async function criarConexao() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    charset: "utf8mb4",
    multipleStatements: false,
  });
}

function validarSchemaPermitido(schema) {
  const schemasPermitidos = [
    process.env.DB_FARMACIA,
    process.env.DB_AMBULATORIO,
  ];

  if (!schemasPermitidos.includes(schema)) {
    throw new Error("Schema não permitido.");
  }
}

export function registrarFerramentasMySQL(server) {
  server.tool(
    "mysql_listar_schemas",
    "Lista os schemas MySQL permitidos do projeto.",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                schemas_permitidos: [
                  process.env.DB_FARMACIA,
                  process.env.DB_AMBULATORIO,
                ],
                observacao: "fsph_ambulatorio é somente leitura.",
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    "mysql_listar_tabelas",
    "Lista tabelas reais de um schema permitido.",
    {
      schema: z.string().describe("Nome do schema: fsph_farmacia ou fsph_ambulatorio"),
    },
    async ({ schema }) => {
      validarSchemaPermitido(schema);

      const connection = await criarConexao();

      const [rows] = await connection.query(
        `
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = ?
        ORDER BY TABLE_NAME
        `,
        [schema]
      );

      await connection.end();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "mysql_descrever_tabela",
    "Lista colunas, tipos, null, chave e default de uma tabela.",
    {
      schema: z.string().describe("Nome do schema"),
      tabela: z.string().describe("Nome da tabela"),
    },
    async ({ schema, tabela }) => {
      validarSchemaPermitido(schema);

      const connection = await criarConexao();

      const [rows] = await connection.query(
        `
        SELECT
          COLUMN_NAME,
          COLUMN_TYPE,
          IS_NULLABLE,
          COLUMN_KEY,
          COLUMN_DEFAULT,
          EXTRA
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
        `,
        [schema, tabela]
      );

      await connection.end();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "mysql_listar_chaves_estrangeiras",
    "Lista foreign keys de uma tabela.",
    {
      schema: z.string(),
      tabela: z.string(),
    },
    async ({ schema, tabela }) => {
      validarSchemaPermitido(schema);

      const connection = await criarConexao();

      const [rows] = await connection.query(
        `
        SELECT
          TABLE_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_SCHEMA,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = ?
          AND REFERENCED_TABLE_NAME IS NOT NULL
        ORDER BY TABLE_NAME, COLUMN_NAME
        `,
        [schema, tabela]
      );

      await connection.end();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "mysql_listar_indices",
    "Lista índices de uma tabela.",
    {
      schema: z.string(),
      tabela: z.string(),
    },
    async ({ schema, tabela }) => {
      validarSchemaPermitido(schema);

      const connection = await criarConexao();

      const [rows] = await connection.query(
        `
        SELECT
          INDEX_NAME,
          COLUMN_NAME,
          NON_UNIQUE,
          SEQ_IN_INDEX
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = ?
        ORDER BY INDEX_NAME, SEQ_IN_INDEX
        `,
        [schema, tabela]
      );

      await connection.end();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "mysql_select_somente_leitura",
    "Executa uma consulta SELECT segura e limitada.",
    {
      sql: z.string().describe("Consulta SELECT, SHOW ou DESCRIBE."),
    },
    async ({ sql }) => {
      validarSomenteLeitura(sql);

      const connection = await criarConexao();

      const [rows] = await connection.query(sql);

      await connection.end();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    }
  );
}