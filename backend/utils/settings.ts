import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface iSettingsSelectOption {
     name: string;
     value: string;
}

export type SettingsValue = number | string | boolean | null | iSettingsSelectOption[];

export interface iSettings {
     local_id: number;
     tipo_req_id_devolucao: number;
     demandas: iSettingsSelectOption[];
     [key: string]: SettingsValue;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const settingsDataPath = path.resolve(__dirname, 'settings.data.json');

const defaultSettings: iSettings = {
     local_id: 5,
     tipo_req_id_devolucao: 2,
     demandas: [
          {
               name: 'DEMANDAS ESPECIFICAS',
               value: 'DE'
          }
     ]
};

const settings: iSettings = { ...defaultSettings };

function isRecord(value: unknown): value is Record<string, unknown> {
     return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeSelectOptions(value: unknown): iSettingsSelectOption[] {
     if (!Array.isArray(value)) {
          const error = new Error('A configuração deve ser uma lista');
          error.statusCode = 400;
          throw error;
     }

     return value.map((item) => {
          if (!isRecord(item)) {
               const error = new Error('Item da configuração inválido');
               error.statusCode = 400;
               throw error;
          }

          const name = String(item.name || '').toLocaleUpperCase().trim();
          const optionValue = String(item.value || '').toLocaleUpperCase().trim();

          if (!name || !optionValue) {
               const error = new Error('Informe name e value para a configuração');
               error.statusCode = 400;
               throw error;
          }

          return { name, value: optionValue };
     });
}

function normalizeSettingValue(key: string, value: unknown): SettingsValue {
     if (key === 'local_id' || key === 'tipo_req_id_devolucao') {
          const numericValue = Number(value || 0);

          if (!Number.isFinite(numericValue) || numericValue <= 0) {
               const error = new Error(`Valor inválido para ${key}`);
               error.statusCode = 400;
               throw error;
          }

          return numericValue;
     }

     if (key === 'demandas') {
          return normalizeSelectOptions(value);
     }

     if (Array.isArray(value)) {
          return normalizeSelectOptions(value);
     }

     if (typeof value === 'string') {
          return value.trim();
     }

     if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
          return value;
     }

     const error = new Error('Tipo de configuração inválido');
     error.statusCode = 400;
     throw error;
}

function applySettings(values: Record<string, unknown>) {
     Object.entries(values).forEach(([key, value]) => {
          const normalizedKey = key.trim();

          if (normalizedKey) {
               settings[normalizedKey] = normalizeSettingValue(normalizedKey, value);
          }
     });
}

function loadSettingsFromDisk() {
     if (!fs.existsSync(settingsDataPath)) {
          return;
     }

     const fileContent = fs.readFileSync(settingsDataPath, 'utf8');
     const parsedSettings: unknown = JSON.parse(fileContent);

     if (isRecord(parsedSettings)) {
          applySettings(parsedSettings);
     }
}

export function listarSettings(): iSettings {
     return settings;
}

export function buscarSetting(key: string): SettingsValue | undefined {
     return settings[key];
}

export function settingExists(key: string): boolean {
     return Object.prototype.hasOwnProperty.call(settings, key);
}

export async function salvarSetting(key: string, value: unknown): Promise<void> {
     const normalizedKey = key.trim();

     if (!normalizedKey) {
          const error = new Error('Chave da configuração não informada');
          error.statusCode = 400;
          throw error;
     }

     settings[normalizedKey] = normalizeSettingValue(normalizedKey, value);
     await persistSettings();
}

export async function salvarSettings(values: unknown): Promise<void> {
     if (!isRecord(values)) {
          const error = new Error('Configurações não informadas');
          error.statusCode = 400;
          throw error;
     }

     applySettings(values);
     await persistSettings();
}

export async function excluirSetting(key: string): Promise<void> {
     const normalizedKey = key.trim();

     if (!normalizedKey) {
          const error = new Error('Chave da configuração não informada');
          error.statusCode = 400;
          throw error;
     }

     delete settings[normalizedKey];
     await persistSettings();
}

async function persistSettings(): Promise<void> {
     await fs.promises.writeFile(settingsDataPath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
}

loadSettingsFromDisk();

export default settings;
