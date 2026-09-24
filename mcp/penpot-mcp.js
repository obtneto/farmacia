#!/usr/bin/env node
import "dotenv/config";
import { spawn } from "node:child_process";

const DEFAULT_BASE_URL = "https://design.penpot.app";

function getPenpotUrl() {
  if (process.env.PENPOT_MCP_URL) {
    return process.env.PENPOT_MCP_URL;
  }

  const key = process.env.PENPOT_MCP_KEY;

  if (!key) {
    throw new Error(
      "Configure PENPOT_MCP_KEY ou PENPOT_MCP_URL no .env antes de iniciar o MCP do Penpot."
    );
  }

  const baseUrl = (process.env.PENPOT_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");

  return `${baseUrl}/mcp/stream?userToken=${encodeURIComponent(key)}`;
}

let penpotUrl;

try {
  penpotUrl = getPenpotUrl();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const child = spawn("npx", ["-y", "mcp-remote", penpotUrl], {
  stdio: "inherit",
  env: process.env,
});

child.on("error", (error) => {
  console.error(`Falha ao iniciar mcp-remote: ${error.message}`);
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
