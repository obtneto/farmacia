import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import routes_locais from './routes/routes_locais.js';
import routes_boname from './routes/routes_boname.js';
import routes_depositos from './routes/routes_depositos.js';
import routes_tipos_medicamentos from './routes/routes_tipos_medicamentos.js';
import routes_tipos_requisicoes from './routes/routes_tipos_requisicoes.js';
import routes_setores from './routes/routes_setores.js';
import routes_tipos_produtos from './routes/routes_tipos_materias.js';
import routes_diagnosticos from './routes/routes_diagnosticos.js';
import routes_medicamentos from './routes/routes_medicamentos.js';
import routes_requisicoes from './routes/routes_requisicoes.js';
import routes_fornecedores from './routes/routes_fornecedores.js';
import routes_auth from './routes/routes_auth.js';
import { globalErrorHandler } from './utils/ErrorMiddleware.js';
import routes_entradas from './routes/routes_entradas.js';
import routes_demandas_especificas from './routes/routes_demandas_especificas.js';
import routes_estoque from './routes/routes_estoque.js';
import router_movimentacoes from './routes/routes_movimentacoes.js';
import router_pacientes from './routes/routes_pacientes.js';
import router_itens_demandas from './routes/routes_itens_demandas.js';
import router_solicitacoes from './routes/routes_solicitacoes.js';
import router_itens_solicitacoes from './routes/routes_itens_solicitacoes.js';
import router_controle_ddu from './routes/routes_controle_ddu.js';
import router_inventarios from './routes/routes_inventarios.js';
import morgan from 'morgan';
import helmet from 'helmet';

import settings from './utils/settings.js';
import authMiddleware from './middleware/auth.js';
import { config } from 'dotenv';
import { iresdata } from './controllers/interface_controllers.js';

declare global {
    interface Error {
        statusCode?: number;
    }
}

config({ path: '../.env' })

const app = express();
const port: number = Number(process.env.PORT || 3000);
const allowedOrigins = new Set([
    'http://localhost',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://192.168.0.8:5173',
    'http://192.168.0.8:8080'
]);

function isLoopbackOrigin(origin: string): boolean {
    try {
        const { hostname } = new URL(origin);
        return hostname === 'localhost' || hostname === '127.0.0.1';
    } catch {
        return false;
    }
}

function isPrivateNetworkOrigin(origin: string): boolean {
    try {
        const { hostname } = new URL(origin);
        const octets = hostname.split('.').map(Number);

        if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) {
            return false;
        }

        return (
            octets[0] === 10 ||
            (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
            (octets[0] === 192 && octets[1] === 168)
        );
    } catch {
        return false;
    }
}

console.clear();

app.use(helmet());
app.use(morgan('dev'));

app.use(express.json({
    limit: '150kb',
    type: 'application/json'
}));

app.use(cors({

    origin: (origin, callback) => {

        if (!origin || allowedOrigins.has(origin) || isLoopbackOrigin(origin) || isPrivateNetworkOrigin(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`Origin nao permitida: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,

}));

app.use('/auth', routes_auth);

app.use(authMiddleware);

/*****************************************************
* Rotas dos parametros do aplicativo
******************************************************/
app.use('/parametros/locais', routes_locais);
app.use('/parametros/boname', routes_boname);
app.use('/parametros/depositos', routes_depositos);
app.use('/parametros/tipos_medicamentos', routes_tipos_medicamentos);
app.use('/parametros/tipos_requisicoes', routes_tipos_requisicoes);
app.use('/parametros/setores', routes_setores);
app.use('/parametros/tipos_produtos', routes_tipos_produtos);
app.use('/parametros/diagnosticos', routes_diagnosticos);
app.use('/parametros/medicamentos', routes_medicamentos);
app.use('/parametros/fornecedores', routes_fornecedores);
app.use('/requisicoes', routes_requisicoes);
app.use('/entradas', routes_entradas);
app.use('/demandas-especificas', routes_demandas_especificas);
app.use('/estoque', routes_estoque);
app.use('/movimentacoes', router_movimentacoes);
app.use('/pacientes', router_pacientes);
app.use('/itens-demandas', router_itens_demandas);
app.use('/solicitacoes', router_solicitacoes);
app.use('/itens-solicitacoes', router_itens_solicitacoes);
app.use('/controle-ddu', router_controle_ddu);
app.use('/inventarios', router_inventarios);
app.use('/settings', (req: Request, res: Response) => {
    const resdata: iresdata = { err: 0, msg: '', status: 200, data: null }

    resdata.data = { settings }

    res.status(resdata.status).json(resdata)
});
app.use(globalErrorHandler);

app.listen(port, () => {
    console.log(`Server is running TS on port ${port}`);
});
