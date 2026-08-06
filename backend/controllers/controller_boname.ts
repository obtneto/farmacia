import Database, { iDatabase } from "../connections/dbconn.js";
import Boname, {iBonameFields, iBonamePrintFields} from "../model/dao_boname.js";
import { iresdata } from "./interface_controllers.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";

pdfMake.addVirtualFileSystem(pdfFonts);

// Controla o CRUD de Boname mantendo o contrato padrao das respostas HTTP.
export default class Controller_Boname {

    private static readonly PAGE_MARGIN_HORIZONTAL = 24;
    private static readonly PAGE_CONTENT_WIDTH = 842 - Controller_Boname.PAGE_MARGIN_HORIZONTAL * 2;

    private static async buildPdfBuffer(docDefinition: object): Promise<Buffer> {
        const pdfDocument = pdfMake.createPdf(docDefinition);
        const pdfBlob = await pdfDocument.getBlob();
        const pdfArrayBuffer = await pdfBlob.arrayBuffer();

        return Buffer.from(pdfArrayBuffer);
    }

    private static buildMetricCell(label: string, value: string, tone: string) {
        return {
            stack: [
                { text: label, style: 'metricLabel' },
                { text: value, style: 'metricValue', color: tone, margin: [0, 3, 0, 0] },
            ],
        };
    }

    static async ListarAtivos(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            // Valida o filtro recebido antes de consultar o banco.
            const pesq : string = String(req.params.pesq || '*');

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            } 

            void await db.Connect();

            // Executa a consulta no DAO e devolve a lista filtrada.
            const boname = new Boname(db.connection);
            resdata.data = await boname.ListarAtivos(pesq) as iBonameFields[]; 
            
        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Boname');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

     static async Listar(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            // Valida o filtro recebido antes de consultar o banco.
            const pesq : string = String(req.params.pesq || '*');

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            } 

            void await db.Connect();

            // Executa a consulta no DAO e devolve apenas registros ativos.
            const boname = new Boname(db.connection);
            resdata.data = await boname.ListarTodos(pesq) as iBonameFields[]; 
            
        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Boname');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }


    static async Buscar(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            // Valida o identificador antes de buscar o registro.
            const bona_id : number = Number(req.params.bona_id || 0);

            if (bona_id === 0) {
                const error = new Error('ID Boname não informado');
                error.statusCode = 400;
                throw error;
            } 

            void await db.Connect();

            // Carrega o registro e garante retorno 404 quando ele nao existir.
            const boname = new Boname(db.connection);
            const dados  = await boname.BuscarPorId(bona_id);

            if (!boname.found) { 
                const error = new Error('Boname não encontrado');
                error.statusCode = 404  
                throw error;
            }

            resdata.data = dados; 
            
        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Boname');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Imprimir(req: Request, res: Response) {

        const db : iDatabase = new Database();

        try {

            const pesq : string = String(req.params.pesq || '*');

            void await db.Connect();

            const boname = new Boname(db.connection);
            const registros = await boname.ListarParaImpressao(pesq) as iBonamePrintFields[];
            const filtroAplicado = pesq === '*' ? 'Todos os registros' : `Filtro: ${pesq}`;
            const emitidoEm = new Date().toLocaleString('pt-BR', { timeZone: 'America/Maceio' });
            const ativos = registros.filter((registro) => registro.bona_ativo === 1).length;
            const inativos = registros.length - ativos;

            const docDefinition = {
                info: {
                    title: 'Relatorio de Bonames',
                    author: 'Farmacia Ambulatorial',
                    subject: 'Impressao do cadastro de Bonames',
                },
                pageSize: 'A4',
                pageOrientation: 'landscape',
                pageMargins: [24, 72, 24, 42],
                header: (currentPage: number, pageCount: number) => ({
                    margin: [24, 18, 24, 0],
                    stack: [
                        {
                            columns: [
                                {
                                    width: '*',
                                    stack: [
                                        { text: 'FARMACIA AMBULATORIAL HOSPITALAR', style: 'eyebrow' },
                                        { text: 'Relatorio de Bonames', style: 'reportTitle', margin: [0, 3, 0, 0] },
                                        { text: 'Cadastro parametrico para consulta e impressao operacional', style: 'reportSubtitle', margin: [0, 2, 0, 0] },
                                    ],
                                },
                                {
                                    width: 176,
                                    alignment: 'right',
                                    stack: [
                                        { text: 'Documento operacional', style: 'headerBadge' },
                                        { text: `Pagina ${currentPage} de ${pageCount}`, style: 'headerMeta', margin: [0, 8, 0, 0] },
                                    ],
                                },
                            ],
                        },
                        {
                            canvas: [
                                { type: 'line', x1: 0, y1: 12, x2: Controller_Boname.PAGE_CONTENT_WIDTH, y2: 12, lineWidth: 1, lineColor: '#d7e0ea' },
                            ],
                        },
                    ],
                }),
                footer: (currentPage: number, pageCount: number) => ({
                    margin: [24, 0, 24, 14],
                    columns: [
                        { text: 'Sistema de Farmacia Ambulatorial', style: 'footerMeta' },
                        { text: filtroAplicado, style: 'footerMeta', alignment: 'center' },
                        { text: `Pagina ${currentPage}/${pageCount}`, style: 'footerMeta', alignment: 'right' },
                    ],
                }),
                content: [
                    {
                        margin: [0, 0, 0, 14],
                        table: {
                            widths: ['*', '*', 196],
                            body: [
                                [
                                    {
                                        colSpan: 2,
                                        stack: [
                                            { text: 'Visao geral da impressao', style: 'sectionLabel' },
                                            { text: 'Resumo do filtro e volume de registros', style: 'sectionTitle', margin: [0, 3, 0, 6] },
                                            { text: filtroAplicado, style: 'bodyMuted' },
                                        ],
                                    },
                                    {},
                                    {
                                        stack: [
                                            { text: 'Emitido em', style: 'metaLabel', alignment: 'right' },
                                            { text: emitidoEm, style: 'metaValue', alignment: 'right', margin: [0, 3, 0, 0] },
                                        ],
                                    },
                                ],
                                [
                                    Controller_Boname.buildMetricCell('Total de registros', String(registros.length), '#0f172a'),
                                    Controller_Boname.buildMetricCell('Bonames ativos', String(ativos), '#0f766e'),
                                    Controller_Boname.buildMetricCell('Bonames inativos', String(inativos), '#b45309'),
                                ],
                            ],
                        },
                        layout: {
                            fillColor: () => '#f8fbfc',
                            hLineWidth: (index: number, node: any) => {
                                if (index === 0 || index === node.table.body.length) {
                                    return 1;
                                }

                                return index === 1 ? 1 : 0;
                            },
                            vLineWidth: (index: number, node: any) => {
                                if (index === 0 || index === node.table.widths.length) {
                                    return 1;
                                }

                                return 0;
                            },
                            hLineColor: () => '#dce7ef',
                            vLineColor: () => '#dce7ef',
                            paddingLeft: (index: number) => index === 0 ? 14 : 12,
                            paddingRight: (index: number, node: any) => index === node.table.widths.length - 1 ? 14 : 12,
                            paddingTop: (rowIndex: number) => rowIndex === 0 ? 16 : 12,
                            paddingBottom: (rowIndex: number) => rowIndex === 0 ? 14 : 14,
                        },
                    },
                    {
                        margin: [0, 0, 0, 8],
                        columns: [
                            { text: 'Detalhamento cadastral', style: 'sectionTitle' },
                            { text: 'Status e diagnostico por registro', style: 'bodyMuted', alignment: 'right', margin: [0, 4, 0, 0] },
                        ],
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: [38, 78, '*', 56, '*', 68],
                            body: [
                                [
                                    { text: 'ID', style: 'tableHeader' },
                                    { text: 'CODIGO', style: 'tableHeader' },
                                    { text: 'DESCRICAO', style: 'tableHeader' },
                                    { text: 'QT. UI', style: 'tableHeader' },
                                    { text: 'DIAGNOSTICO', style: 'tableHeader' },
                                    { text: 'STATUS', style: 'tableHeader' },
                                ],
                                ...registros.map((registro) => ([
                                    { text: String(registro.bona_id), style: 'tableCellCenter' },
                                    { text: registro.bona_codigo, style: 'tableCellStrong' },
                                    { text: registro.bona_descr, style: 'tableCell' },
                                    { text: String(registro.bona_qt_ui), style: 'tableCellCenter' },
                                    { text: registro.diag_descr || `ID ${registro.bona_diag_id}`, style: 'tableCell' },
                                    {
                                        text: registro.bona_ativo === 1 ? 'ATIVO' : 'INATIVO',
                                        style: registro.bona_ativo === 1 ? 'statusActive' : 'statusInactive',
                                        alignment: 'center',
                                    },
                                ])),
                            ],
                        },
                        layout: {
                            fillColor: (rowIndex: number) => {
                                if (rowIndex === 0) {
                                    return '#174a5a';
                                }

                                return rowIndex % 2 === 0 ? '#f7fafc' : '#ffffff';
                            },
                            hLineWidth: (index: number) => index === 0 ? 0 : 1,
                            vLineWidth: () => 0,
                            hLineColor: (index: number) => index === 1 ? '#174a5a' : '#dce7ef',
                            paddingLeft: (index: number) => index === 0 ? 8 : 10,
                            paddingRight: (index: number, node: any) => index === node.table.widths.length - 1 ? 8 : 10,
                            paddingTop: (index: number) => index === 0 ? 9 : 8,
                            paddingBottom: (index: number) => index === 0 ? 9 : 8,
                        },
                    },
                    {
                        margin: [0, 12, 0, 0],
                        columns: [
                            { text: `Total de registros impressos: ${registros.length}`, style: 'summaryNote' },
                            { text: 'Documento gerado automaticamente pelo modulo de parametros', style: 'summaryNote', alignment: 'right' },
                        ],
                    },
                ],
                defaultStyle: {
                    font: 'Roboto',
                    fontSize: 9,
                    color: '#1f2937',
                },
                styles: {
                    eyebrow: {
                        fontSize: 8,
                        bold: true,
                        color: '#0f766e',
                    },
                    reportTitle: {
                        bold: true,
                        fontSize: 18,
                        color: '#0f172a',
                    },
                    reportSubtitle: {
                        fontSize: 9,
                        color: '#64748b',
                    },
                    headerBadge: {
                        fontSize: 8,
                        bold: true,
                        color: '#174a5a',
                        fillColor: '#e6f4f1',
                        alignment: 'right',
                    },
                    headerMeta: {
                        fontSize: 9,
                        color: '#475569',
                    },
                    sectionLabel: {
                        fontSize: 8,
                        bold: true,
                        color: '#0f766e',
                    },
                    sectionTitle: {
                        fontSize: 13,
                        bold: true,
                        color: '#0f172a',
                    },
                    bodyMuted: {
                        fontSize: 9,
                        color: '#64748b',
                    },
                    metaLabel: {
                        fontSize: 8,
                        bold: true,
                        color: '#64748b',
                    },
                    metaValue: {
                        fontSize: 10,
                        bold: true,
                        color: '#0f172a',
                    },
                    metricLabel: {
                        fontSize: 8,
                        bold: true,
                        color: '#64748b',
                    },
                    metricValue: {
                        fontSize: 16,
                        bold: true,
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 8,
                        alignment: 'center',
                        margin: [0, 1, 0, 0],
                        color: '#ffffff',
                    },
                    tableCell: {
                        fontSize: 8.5,
                        color: '#1f2937',
                    },
                    tableCellStrong: {
                        fontSize: 8.5,
                        bold: true,
                        color: '#0f172a',
                    },
                    tableCellCenter: {
                        fontSize: 8.5,
                        color: '#334155',
                        alignment: 'center',
                    },
                    statusActive: {
                        fontSize: 8,
                        bold: true,
                        color: '#0f766e',
                    },
                    statusInactive: {
                        fontSize: 8,
                        bold: true,
                        color: '#b45309',
                    },
                    summaryNote: {
                        fontSize: 8,
                        color: '#64748b',
                    },
                    footerMeta: {
                        fontSize: 8,
                        color: '#64748b',
                    },
                    footer: {
                        bold: true,
                        color: '#334155',
                    },
                },
            };

            const pdfBuffer = await Controller_Boname.buildPdfBuffer(docDefinition);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=\"bonames.pdf\"');
            res.status(200).send(pdfBuffer);

        } catch (error :any) {
            const resdata : iresdata = {
                err: 0,
                msg: '',
                status: 200,
                data: {}
            };

            applyControllerError(resdata, error, 'Controller Boname');
            res.status(resdata.status).json(resdata);
        }

        void await db.Disconnect();
    }

    static async Salvar(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            // Abre a conexao e inicia a transacao do salvamento.
            void await db.Connect();
            void await db.Begin();

            // Normaliza a carga util recebida do frontend.
            const bona_id : number = Number(req.body.bona_id || 0);
            const bona_codigo : string = String(req.body.bona_codigo || '').toLocaleUpperCase();
            const bona_descr : string = String(req.body.bona_descr || '').toLocaleUpperCase();
            const bona_qt_ui : number = Number(req.body.bona_qt_ui || 0);
            const bona_diag_id : number = Number(req.body.bona_diag_id || 0);
            const bona_ativo : 0 | 1 = req.body.bona_ativo || 0;

            if (!bona_codigo) {
                const error = new Error('Código do Boname não informado');
                error.statusCode = 400;
                throw error;
            }

            if (!bona_descr) {
                const error = new Error('Descrição do Boname não informada');
                error.statusCode = 400;
                throw error;
            }

            if (bona_diag_id === 0) {
                const error = new Error('ID do diagnóstico não informado');
                error.statusCode = 400;
                throw error;
            }

            if (bona_qt_ui === 0) {
                const error = new Error('Quantidade por unidade não informada');
                error.statusCode = 400;
                throw error;
            }

            if (req.body.bona_ativo === undefined) {
                const error = new Error('Ativo não informado');
                error.statusCode = 400;
                throw error;
            }

            // Valida duplicidade e persiste o cadastro.
            const boname = new Boname(db.connection);
            void await boname.BuscarPorCodigo(bona_codigo);

            if (boname.found && bona_id === 0) {
                const error = new Error('Boname com este código já existe');
                error.statusCode = 400;
                throw error;
            }

            void await boname.BuscarPorId(bona_id);

            boname.bona_id = bona_id;
            boname.bona_codigo = bona_codigo;
            boname.bona_descr = bona_descr;
            boname.bona_qt_ui = bona_qt_ui;
            boname.bona_diag_id = bona_diag_id;
            boname.bona_ativo = bona_ativo;

            void await boname.Salvar();

            void await db.Commit();

            resdata.msg = "Boname salvo com sucesso";   
            
        } catch (error :any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Boname');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Excluir(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            // Abre a conexao e inicia a transacao da exclusao.
            void await db.Connect();
            void await db.Begin();

            // Valida o identificador e garante que o registro exista antes de excluir.
            const bona_id : number = Number(req.params.bona_id || 0);

            if(bona_id === undefined || bona_id === 0) {
                const error = new Error('ID do boname não informado');
                error.statusCode = 400;
                throw error;
            }

            const boname = new Boname(db.connection);

            void await boname.BuscarPorId(bona_id);

            if (!boname.found) {
                const error = new Error('Boname não encontrado');
                error.statusCode = 404;
                throw error;
            }

            await boname.Excluir();

            void await db.Commit();

            resdata.msg = "Boname excluído com sucesso";

        } catch (error :any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Boname');
        }
        
        void await db.Disconnect();

        res.status(resdata.status).json(resdata);   
    }

}
