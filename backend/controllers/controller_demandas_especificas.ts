import Database, { iDatabase } from '../connections/dbconn.js';
import DemandasEspecificas from '../model/dao_demanda_especificas.js';
import Entradas from "../model/dao_entradas.js";
import Estoque from "../model/dao_estoque.js";
import ItensEntradas from "../model/dao_itens_entradas.js";
import Medicamentos from "../model/dao_medicamentos.js";
import Movimentacoes from "../model/dao_movimentacoes.js";
import ItensDemandasEspecificas from '../model/dao_itens_demandas_especificas.js';
import { Request, Response } from 'express';
import { iresdata } from './interface_controllers.js';
import { applyControllerError } from "../utils/controllerError.js";
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import { RowDataPacket } from 'mysql2';

pdfMake.addVirtualFileSystem(pdfFonts);

export default class Controller_DemandasEspecificas {

    private static readonly PDF_PAGE_MARGIN_HORIZONTAL = 24;
    private static readonly PDF_PAGE_CONTENT_WIDTH = 595.28 - Controller_DemandasEspecificas.PDF_PAGE_MARGIN_HORIZONTAL * 2;

    private static async buildPdfBuffer(docDefinition: object): Promise<Buffer> {
        const pdfDocument = pdfMake.createPdf(docDefinition);
        const pdfBlob = await pdfDocument.getBlob();
        const pdfArrayBuffer = await pdfBlob.arrayBuffer();

        return Buffer.from(pdfArrayBuffer);
    }

    private static formatDate(value: Date | string | null): string {
        if (!value) {
            return '';
        }

        const date = value instanceof Date ? value : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleDateString('pt-BR', { timeZone: 'America/Maceio' });
    }

    static async Buscar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []

        };

        try {

            void await db.Connect();

            const demanda_id : number = Number(req.params.id_demanda || 0);

            if (demanda_id === 0) {
                const error = new Error('ID Demanda Específica não informado');
                error.statusCode = 400;
                throw error;
            }

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            
            const dados = await demandasEspecificas.BuscarPorId(demanda_id) as RowDataPacket;

            if (!demandasEspecificas.found) {
                const error = new Error('Demanda Específica não encontrada');
                error.statusCode = 404;
                throw error;
            }

            const result = await demandasEspecificas.BuscarPorPaciente(dados.dem_pac_id) as RowDataPacket

            dados.nome_paciente = result.nome_paciente;
            dados.data_nascimento = result.data_nascimento;
            
            resdata.data = dados;
            

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }
    
    static async Listar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            const dados = await demandasEspecificas.ListarDemandas();

            resdata.data = dados;

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }

    static async BuscarPorPaciente(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            const pac_id : number = Number(req.params.pac_id || 0);

            if (pac_id === 0) {
                const error = new Error('ID Paciente não informado');
                error.statusCode = 400;
                throw error;
            }

            const demandasEspecificas = new DemandasEspecificas(db.connection);

            resdata.data = await demandasEspecificas.BuscarPorPaciente(pac_id) as RowDataPacket[];

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }
    
    static async Salvar(req: Request, res: Response) {  // repensar esse controller

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();
            void await db.Begin();

            const dem_id: number = Number(req.body?.id || 0);
            const dem_pac_id: number = Number(req.body.dem_pac_id || 0 );
            const dem_medico_assis_raw = req.body.dem_medico_assis ?? req.body.dem_medico_assit ?? '';
            const dem_medico_assis: string = String(dem_medico_assis_raw || '').trim();
            const dem_medico_crm: string = String(req.body.dem_medico_crm || '').trim();
            const dem_responsavel: string = String(req.body.dem_responsavel || '').trim();
            const dem_diag_id: number = Number(req.body.dem_diag_id || 0);

            if (dem_pac_id === 0) {
                const error = new Error('ID do paciente não informado');
                error.statusCode = 400;
                throw error;
            }

            if (!dem_medico_assis) {
                const error = new Error('Nome do médico assistente não informado');
                error.statusCode = 400;
                throw error;
            }

            if (!dem_medico_crm) {
                const error = new Error('CRM do médico assistente não informado');
                error.statusCode = 400;
                throw error;
            }

            if (dem_diag_id === 0) {
                const error = new Error('ID do Diagnostico obrigatorio.');
                error.statusCode = 400;
                throw error;
            }

            const demandasEspecificas = new DemandasEspecificas(db.connection);

            await demandasEspecificas.BuscarPorId(dem_id);

            demandasEspecificas.dem_pac_id = dem_pac_id;
            demandasEspecificas.dem_medico_assis = dem_medico_assis.toUpperCase();
            demandasEspecificas.dem_medico_crm = dem_medico_crm;
            demandasEspecificas.dem_responsavel = dem_responsavel.toUpperCase();
            demandasEspecificas.dem_diag_id = dem_diag_id;

            await demandasEspecificas.Salvar();

            // const savedDemandaId = Number(demandasEspecificas.dem_id || 0);

            // for (const item of itens) {

            //     const dem_med_id = Number(item.dem_med_id || 0);
            //     const dem_med_qtde = Number(item.dem_med_qtde || 0);

            //     if (dem_med_id === 0) {
            //         const error = new Error('ID do medicamento obrigatorio.');
            //         error.statusCode = 400;
            //         throw error;
            //     }

            //     if (dem_med_qtde <= 0) {
            //          const error = new Error('quantidade do medicamento deve ser maior que ZERO.');
            //         error.statusCode = 400;
            //         throw error;
            //     } 

            //     await itens_demandas.BuscarPorId(item.ite_id);

            //     itens_demandas.ite_dem_id = savedDemandaId;
            //     itens_demandas.ite_dem_med_id = dem_med_id;
            //     itens_demandas.ite_dem_med_qtde = dem_med_qtde
            //     itens_demandas.ite_dem_med_ativo = itens_demandas.found ? itens_demandas.ite_dem_med_ativo : 1;

            //     await itens_demandas.Salvar()

            // }

            await db.Commit();

            resdata.msg = "Dados Salvo com Sucesso."
            resdata.data = {dem_id}
           

        } catch (error :any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }
    
    static async Excluir(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            const demanda_id : number = Number(req.params.id_demanda || 0);

            if (demanda_id === 0) {
                const error = new Error('ID Demanda Específica não informado');
                error.statusCode = 400;
                throw error;
            }

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            await demandasEspecificas.Excluir(demanda_id);

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    } 
    
    static async ListarItensDemandas(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            const dem_pac_id: number = Number(req.params.dem_pac_id || 0);

            if (dem_pac_id === 0) {
                const error = new Error('ID Paciente invalido.');
                error.statusCode = 400;
                throw error;
            }

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            const dados = await demandasEspecificas.ListarItensDemandas(dem_pac_id)

            resdata.data = dados;

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }

    static async SalvarEntradas(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();
            void await db.Begin();

            // Validar os dados recebidos do corpo da requisição
            const ent_id = Number(req.body.ent_id || 0);
            let ent_doc = String(req.body.ent_doc || '');
            const ent_doc_informado = ent_doc.trim().length > 0;
            const ent_pac_id = Number(req.body.ent_pac_id || 0);
            const ent_for_id: number = Number(req.body.ent_for_id || 0);
            const ent_dep_id = Number(req.body.ent_dep_id || 0);
            const ent_user_digit = String(req.body.ent_user_digit || null);
            const itens = Array.isArray(req.body.itens) ? req.body.itens : null

            // Validar os dados recebidos do corpo da requisição
            if (ent_pac_id === 0) {
                const error = new Error('Paciente não Informado.');
                error.statusCode = 400;
                throw error;
            }

            if(ent_for_id <= 0) {
                const error = new Error('Fornecedor não informado.');
                error.statusCode = 400;
                throw error;
            }

            if (ent_dep_id <= 0) {
                const error = new Error('Depósito de destino é obrigatório.');
                error.statusCode = 400;
                throw error;
            }

            if (ent_user_digit === null || ent_user_digit.trim().length === 0) {
                const error = new Error('Usuário digitador é obrigatório.');
                error.statusCode = 400;
                throw error;
            }

            if (!itens || itens.length === 0) {
                const error = new Error('Adicione pelo menos um item à entrada.');
                error.statusCode = 400;
                throw error;
            }

            // Gerar um número de documento automático se não for fornecido
            if (!ent_doc) {

                const anoAtual = new Date().getFullYear();
                const mesAtual = (new Date().getMonth() + 1).toString().padStart(2,'0');
                const numeroAleatorio = Math.floor(Math.random() * 11333).toString().padStart(4, '0');
                
                ent_doc = `${anoAtual}-${mesAtual}-${numeroAleatorio}`;
            }

            // Instanciar os DAOs necessários para salvar a entrada e os itens
            const entradas = new Entradas(db.connection);
            const itensEntradas = new ItensEntradas(db.connection);
            const medicamentos = new Medicamentos(db.connection);
            const demandas = new DemandasEspecificas(db.connection);
            const itensDemandas = new ItensDemandasEspecificas(db.connection);
        
            // Buscar a entrada existente ou criar uma nova
            void await entradas.BuscarPorId(ent_id);

            entradas.ent_date = new Date();
            entradas.ent_doc = ent_doc;
            entradas.ent_dep_id = ent_dep_id;
            entradas.ent_pac_id = ent_pac_id;
            entradas.ent_for_id = ent_for_id;
            entradas.ent_status = 0;
            entradas.ent_user_digit = ent_user_digit;
            entradas.ent_dt_digit = new Date();

            await entradas.Salvar();

            // Salvar os itens da entrada e atualizar os itens das demandas específicas
            for (const item of itens) {

                // Validar os dados do item
                const itemMedId = Number(item.ent_med_id || 0);
                const itemLote = String(item.ent_lote || '');
                const itemLoteValidade = item.ent_lote_validade;
                const itemQtde = Number(item.ent_qtde || 0);

                if (itemMedId === 0) {
                    const error = new Error('ID do medicamento obrigatorio.');
                    error.statusCode = 400;
                    throw error;
                }

                if (itemQtde <= 0) {
                    const error = new Error('quantidade do medicamento deve ser maior que ZERO.');
                    error.statusCode = 400;
                    throw error;
                }

                if (!itemLote) {
                    const error = new Error('Lote do medicamento é obrigatório.');
                    error.statusCode = 400;
                    throw error;
                }

                if (!itemLoteValidade || Number.isNaN(new Date(itemLoteValidade).getTime())) {
                    const error = new Error('Validade do lote do medicamento é obrigatória e deve ser uma data válida.');
                    error.statusCode = 400;
                    throw error;
                }

                // Validar a validade do lote
                const validadeDate = new Date(itemLoteValidade);
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0); // Zerar horas, minutos, segundos e milissegundos para comparação apenas de datas

                if (validadeDate < hoje) {
                    const error = new Error(`Validade do lote do medicamento ${itemMedId} expirou.`);
                    error.statusCode = 400;
                    throw error;
                }

                // Validar os dados do item
                await medicamentos.BuscarPorId(itemMedId);

                if (!medicamentos.found) {
                    const error = new Error(`Medicamento ${itemMedId} não encontrado.`);
                    error.statusCode = 404;
                    throw error;
                }

                await itensEntradas.BuscarPorId(0)

                itensEntradas.ite_ent_id = entradas.ent_id;
                itensEntradas.ite_ent_med_id = itemMedId;
                itensEntradas.ite_ent_lote = itemLote;
                itensEntradas.ite_ent_lote_validade = itemLoteValidade;
                itensEntradas.ite_ent_qtde = itemQtde;
            
                await itensEntradas.Salvar();

                await demandas.BuscarPorPaciente(ent_pac_id);

                if (!demandas.found) {
                    const error = new Error(`Demanda específica para o paciente ${ent_pac_id} não encontrada.`);
                    error.statusCode = 404;
                    throw error;
                }

                await itensDemandas.BuscarPorId(0);

                itensDemandas.ite_dem_med_ativo = 1;
                itensDemandas.ite_dem_med_qtde = itemQtde;
                itensDemandas.ite_dem_id = demandas.dem_id;
                itensDemandas.ite_dem_med_id = itemMedId;
                itensDemandas.ite_ent_id = entradas.ent_id;
                
                await itensDemandas.Salvar();
                
            }

            await db.Commit();

            resdata.msg = "Entradas salvas com sucesso.";

            resdata.data = {
                ent_id: entradas.ent_id,
                ent_doc: entradas.ent_doc,
                ent_doc_auto_generated: !ent_doc_informado,
                total_itens: itens.length
            };
           
        } catch (error :any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }
        
        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async ListarPacientes(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            const dados = await demandasEspecificas.ListarPacientes();

            resdata.data = dados;
            
        } catch (error) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas.ListarPacientes');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }

    static async ImprimirRecibo(req: Request, res: Response) {

        const db : iDatabase = new Database();

        try {

            const ent_id = Number(req.params.ent_id || 0);

            if (ent_id === 0) {
                const error = new Error('ID da entrada não informado');
                error.statusCode = 400;
                throw error;
            }

            void await db.Connect();

            const itensEntradas = new ItensEntradas(db.connection);
            const cabecalho = await itensEntradas.BuscarCabecalhoRecibo(ent_id);

            if (!cabecalho) {
                const error = new Error('Entrada não encontrada');
                error.statusCode = 404;
                throw error;
            }

            const itens = await itensEntradas.ListarItensRecibo(ent_id);

            if (itens.length === 0) {
                const error = new Error('Nenhum item encontrado para a entrada informada');
                error.statusCode = 404;
                throw error;
            }

            const dataFormatada = Controller_DemandasEspecificas.formatDate(cabecalho.ent_date) || '-';
            const numeroDocumento = String(cabecalho.ent_doc || '-');
            const paciente = String(cabecalho.paciente || '').trim() || 'NAO INFORMADO';
            const emitidoEm = new Date().toLocaleString('pt-BR', { timeZone: 'America/Maceio' });
            const linhasItens = [
                [
                    { text: 'Codigo', style: 'tableHeader' },
                    { text: 'Medicamento', style: 'tableHeader' },
                    { text: 'Und', style: 'tableHeader' },
                    { text: 'Lote', style: 'tableHeader' },
                    { text: 'Qtde', style: 'tableHeader' },
                    { text: 'Validade', style: 'tableHeader' },
                ],
                ...itens.map((item) => ([
                    { text: String(item.codigo ?? ''), style: 'tableCellCenter' },
                    { text: String(item.medicamento || ''), style: 'tableCell' },
                    { text: String(item.und ?? ''), style: 'tableCellCenter' },
                    { text: String(item.lote || ''), style: 'tableCellCenter' },
                    { text: String(item.qtde ?? ''), style: 'tableCellCenter' },
                    { text: Controller_DemandasEspecificas.formatDate(item.validade), style: 'tableCellCenter' },
                ])),
            ];

            const docDefinition = {
                info: {
                    title: 'Recibo Entrada Medicamentos',
                    author: 'Farmacia Ambulatorial',
                    subject: `Recibo da entrada ${ent_id}`,
                },
                pageSize: 'A4',
                pageMargins: [24, 72, 24, 42],
                header: (currentPage: number, pageCount: number) => ({
                    margin: [28, 18, 28, 0],
                    stack: [
                        {
                            columns: [
                                {
                                    width: '*',
                                    stack: [
                                        { text: 'FARMACIA AMBULATORIAL HOSPITALAR', style: 'eyebrow' },
                                        { text: 'Recibo de Entrada Medicamentos', style: 'reportTitle', margin: [0, 3, 0, 0] },
                                    ],
                                },
                                {
                                    width: 176,
                                    alignment: 'right',
                                    stack: [
                                        { text: `Pagina ${currentPage} de ${pageCount}`, style: 'headerMeta', margin: [0, 8, 0, 0] },
                                    ],
                                },
                            ],
                        },
                        {
                            canvas: [
                                { type: 'line', x1: 0, y1: 12, x2: Controller_DemandasEspecificas.PDF_PAGE_CONTENT_WIDTH, y2: 12, lineWidth: 1, lineColor: '#d7e0ea' },
                            ],
                        },
                    ],
                }),
                footer: (currentPage: number, pageCount: number) => ({
                    margin: [24, 0, 24, 14],
                    columns: [
                        { text: 'Sistema de Farmacia Ambulatorial', style: 'footerMeta' },
                        { text: `Recibo ${numeroDocumento}`, style: 'footerMeta', alignment: 'center' },
                        { text: `Pagina ${currentPage}/${pageCount}`, style: 'footerMeta', alignment: 'right' },
                    ],
                }),
                content: [
                    {
                        margin: [0, 0, 0, 14],
                        table: {
                            widths: ['*', 176],
                            body: [
                                [
                                    {
                                        stack: [
                                            { text: 'Dados do recibo', style: 'sectionLabel', margin: [0, 0, 0, 6] },
                                            {
                                                columns: [
                                                    { width: '*', text: [{ text: 'Data: ', bold: true }, dataFormatada], style: 'metaValue' },
                                                    { width: 160, text: [{ text: 'Numero: ', bold: true }, numeroDocumento], style: 'metaValue', alignment: 'right' },
                                                ],
                                            },
                                            { text: [{ text: 'Paciente: ', bold: true }, paciente], style: 'metaValue', margin: [0, 8, 0, 0] },
                                        ],
                                    },
                                    {
                                        stack: [
                                            { text: 'Emitido em', style: 'metaLabel', alignment: 'right', margin: [0, 0, 0, 6] },
                                            { text: emitidoEm, style: 'metaValue', alignment: 'right' },
                                        ],
                                    },
                                ],
                            ],
                        },
                        layout: {
                            fillColor: () => '#f8fbfc',
                            hLineWidth: (index: number, node: any) => (index === 0 || index === node.table.body.length ? 1 : 0),
                            vLineWidth: (index: number, node: any) => (index === 0 || index === node.table.widths.length ? 1 : 0),
                            hLineColor: () => '#dce7ef',
                            vLineColor: () => '#dce7ef',
                            paddingLeft: (index: number) => index === 0 ? 14 : 12,
                            paddingRight: (index: number, node: any) => index === node.table.widths.length - 1 ? 14 : 12,
                            paddingTop: () => 14,
                            paddingBottom: () => 14,
                        },
                    },
                    {
                        margin: [0, 0, 0, 8],
                        columns: [
                            { text: 'Declaracao de recebimento', style: 'sectionTitle' },
                        ],
                    },
                    {
                        margin: [0, 0, 0, 14],
                        text: 'Informamos o recebimento do medicamento abaixo desriminado, do referente paciente para armazenamento no HEMOSE, até o uso total dos frascos na terapia medicamentosa.',
                        style: 'bodyText',
                        alignment: 'justify',
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: [52, '*', 44, 72, 52, 64],
                            body: linhasItens,
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
                        table: {
                            widths: ['*', '*'],
                            body: [
                                [
                                    {
                                        stack: [
                                            { text: 'Assinatura Farmacia', style: 'signatureLabel', margin: [0, 0, 0, 42] },
                                            {
                                                canvas: [
                                                    { type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1, lineColor: '#94a3b8' },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        stack: [
                                            { text: 'Assinatura Paciente', style: 'signatureLabel', margin: [0, 0, 0, 42] },
                                            {
                                                canvas: [
                                                    { type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1, lineColor: '#94a3b8' },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            ],
                        },
                        layout: {
                            hLineWidth: (index: number, node: any) => (index === 0 || index === node.table.body.length ? 1 : 0),
                            vLineWidth: (index: number, node: any) => (index === 0 || index === node.table.widths.length ? 1 : 0),
                            hLineColor: () => '#dce7ef',
                            vLineColor: () => '#dce7ef',
                            paddingLeft: () => 12,
                            paddingRight: () => 12,
                            paddingTop: () => 10,
                            paddingBottom: () => 10,
                            fillColor: () => '#ffffff',
                        },
                    },
                ],
                styles: {
                    eyebrow: {
                        fontSize: 8,
                        bold: true,
                        color: '#0f766e',
                    },
                    reportTitle: {
                        bold: true,
                        fontSize: 16,
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
                        fontSize: 12,
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
                    bodyText: {
                        fontSize: 9,
                        color: '#1f2937',
                        lineHeight: 1.25,
                    },
                    tableHeader: {
                        fontSize: 8,
                        bold: true,
                        color: '#ffffff',
                        alignment: 'center',
                        margin: [0, 1, 0, 0],
                    },
                    tableCell: {
                        fontSize: 8.5,
                        color: '#1f2937',
                    },
                    tableCellCenter: {
                        fontSize: 8.5,
                        color: '#334155',
                        alignment: 'center',
                    },
                    signatureLabel: {
                        fontSize: 8,
                        bold: true,
                        color: '#64748b',
                    },
                    summaryNote: {
                        fontSize: 8,
                        color: '#64748b',
                    },
                    footerMeta: {
                        fontSize: 8,
                        color: '#64748b',
                    },
                },
                defaultStyle: {
                    font: 'Roboto',
                    fontSize: 9,
                    color: '#1f2937',
                },
            };

            const pdfBuffer = await Controller_DemandasEspecificas.buildPdfBuffer(docDefinition);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=\"recibo-entrada-demanda-${ent_id}.pdf\"`);
            res.status(200).send(pdfBuffer);

        } catch (error :any) {
            const resdata : iresdata = {
                err: 0,
                msg: '',
                status: 200,
                data: {}
            };

            applyControllerError(resdata, error, 'Controller Demandas Específicas');
            res.status(resdata.status).json(resdata);
        }

        void await db.Disconnect();
    }
        
}
