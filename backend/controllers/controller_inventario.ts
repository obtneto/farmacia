import Database, { iDatabase } from "../connections/dbconn.js";
import Depositos from "../model/dao_depositos.js";
import Inventarios, { eStatus } from "../model/dao_inventarios.js";
import ItensInventario, { iItensInventarioFields } from "../model/dao_itens_inventario.js";
import Medicamentos from "../model/dao_medicamentos.js";
import { iresdata } from "./interface_controllers.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";
import GeraNumeroReq from "../utils/GeraNumero.js";
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import Estoque from "../model/dao_estoque.js";

pdfMake.addVirtualFileSystem(pdfFonts);

// Controla o CRUD de inventários com validacao e persistencia transacional.
export default class Controller_Inventarios {

    private static readonly PAGE_MARGIN_HORIZONTAL = 24;
    private static readonly PAGE_CONTENT_WIDTH = 595 - Controller_Inventarios.PAGE_MARGIN_HORIZONTAL * 2;

    private static async buildPdfBuffer(docDefinition: object): Promise<Buffer> {
        const pdfDocument = pdfMake.createPdf(docDefinition);
        const pdfBlob = await pdfDocument.getBlob();
        const pdfArrayBuffer = await pdfBlob.arrayBuffer();

        return Buffer.from(pdfArrayBuffer);
    }

    private static formatText(value: unknown, fallback = '-'): string {
        const text = String(value ?? '').trim();

        return text || fallback;
    }

    private static formatDate(value: Date | string | null): string {
        if (!value) {
            return '-';
        }

        const date = value instanceof Date ? value : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        return date.toLocaleDateString('pt-BR', { timeZone: 'America/Maceio' });
    }

    private static formatQuantity(value: unknown): string {
        if (value === null || value === undefined || value === '') {
            return '';
        }

        const numberValue = Number(value);

        if (Number.isNaN(numberValue) || numberValue === 0) {
            return '';
        }

        return numberValue.toLocaleString('pt-BR');
    }

    private static formatInventarioNumero(value: unknown): string {
        const text = String(value ?? '').replace(/[^A-Za-z0-9]/g, '').toLocaleUpperCase();

        if (text.length <= 3) {
            return text;
        }

        return [
            text.slice(0, 3),
            text.slice(3, 7),
            text.slice(7, 11),
        ].filter(Boolean).join('-');
    }

    static async Listar(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            void await db.Connect();

            const date_ini: string = String(req.params.date_ini ?? '');
            const date_fin: string = String(req.params.date_fin ?? '');
            const dep_id: number = Number(req.params.dep_id ?? 0);

            if (Number.isNaN(Date.parse(date_ini))) {
                const error = new Error('Data inicial inválida.');
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(Date.parse(date_fin))) {
                const error = new Error('Data final inválida.');
                error.statusCode = 400;
                throw error;
            }

            if (dep_id === 0) {
                const error = new Error('Depósito deve ser informado.');
                error.statusCode = 400;
                throw error;
            }

            const depositos = new Depositos(db.connection);

            await depositos.BuscarPorId(dep_id);

            if (!depositos.found) {
                const error = new Error('Depósito não encontrado');
                error.statusCode = 404;
                throw error;
            }

            const inventarios = new Inventarios(db.connection);

            const data = await inventarios.ListarPorPeriodo(date_ini, date_fin, dep_id);

            resdata.data = data;

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Inventarios');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Novo(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            void await db.Connect();
            void await db.Begin();

            //valida os campos de inventario
            const inv_date: string = String(req.body.inv_date ?? '');
            const dep_id: number = Number(req.body.dep_id ?? 0);
            const med_tipo_codigo: string = String(req.body.med_tipo_codigo ?? '');
            const inv_tipo: string = String(req.body.inv_tipo || 'Parcial' || 'Total');

            //valida os campos de itens de inventario
            const itens: iItensInventarioFields[] = req.body.itens ?? [];

            //valida os campos de inventario
            if (inv_date === '') {
                const error = new Error('Data deve ser informada.');
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(Date.parse(inv_date))) {
                const error = new Error('Data inválida.');
                error.statusCode = 400;
                throw error;
            }

            if (dep_id === 0) {
                const error = new Error('Depósito deve ser informado.');
                error.statusCode = 400;
                throw error;
            }

            if (!med_tipo_codigo) {
                const error = new Error('Tipo de medicamento deve ser informado.');
                error.statusCode = 400;
                throw error;
            }

            if (inv_tipo !== 'Parcial' && inv_tipo !== 'Total') {
                const error = new Error('Tipo de inventário inválido.');
                error.statusCode = 400;
                throw error;
            }

            const inventarios = new Inventarios(db.connection);
            const medicamentos = new Medicamentos(db.connection);
            const itens_inventarios = new ItensInventario(db.connection);
            const depositos = new Depositos(db.connection);

            //busca o depósito
            await depositos.BuscarPorId(dep_id);

            if (!depositos.found) {
                const error = new Error('Depósito não encontrado');
                error.statusCode = 404;
                throw error;
            }

            if (depositos.dep_bloqueado === 1) {
                const error = new Error('Depósito bloqueado');
                error.statusCode = 409;
                throw error;
            }

            //gerar número do inventário
            const geraNumero = new GeraNumeroReq();
            const inv_num = `INV${geraNumero.proximoId()}`;

            //Buscar por id 0 para adicionar um novo registro
            await inventarios.BuscarPorId(0);

            inventarios.inv_date = new Date(inv_date);
            inventarios.inv_dep_id = dep_id;
            inventarios.inv_med_tipo_codigo = med_tipo_codigo;
            inventarios.inv_tipo = inv_tipo;
            inventarios.inv_num = inv_num;
            inventarios.inv_status = eStatus.Aberto;

            await inventarios.Salvar();

            //bloqueia o depósito para não permitir novas movimentações e salva
            depositos.dep_bloqueado = 1;

            await depositos.Salvar();

            for (const item of itens) { //percorre os itens do inventário e processa cada um

                //busca o medicamento pelo id
                await medicamentos.BuscarPorId(Number(item.iti_med_id ?? 0));

                //verifica se o medicamento foi encontrado
                if (!medicamentos.found) {
                    const error = new Error(`Medicamento ${item.iti_med_id} não encontrado`);
                    error.statusCode = 404;
                    throw error;
                }

                //busca o item do inventário pelo número do inventário, id do medicamento e lote
                await itens_inventarios.BuscarPorItem(inv_num, Number(item.iti_med_id), String(item.iti_lote));

                //verifica se o item foi encontrado
                if (itens_inventarios.found) {
                    const error = new Error(`Item ${item.iti_med_id} já cadastrado no inventário`);
                    error.statusCode = 409;
                    throw error;
                }

                //atribui os valores ao item do inventário e salva
                itens_inventarios.iti_inv_num = inv_num;
                itens_inventarios.iti_med_id = Number(item.iti_med_id);
                itens_inventarios.iti_lote = String(item.iti_lote);
                itens_inventarios.iti_validade = new Date(String(item.iti_validade));
                itens_inventarios.iti_qtde_estoque = Number(item.iti_qtde_estoque);

                await itens_inventarios.Salvar();

            }

            //confirma as alterações no banco de dados
            void await db.Commit();

            resdata.msg = `Inventário ${inv_num} aberto com sucesso`;
            resdata.data = {
                inv_id: inventarios.inv_id,
                inv_num,
            };

        } catch (error: any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Inventarios.Novo');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Detalhar(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            void await db.Connect();

            const inv_num: string = String(req.params.inv_num ?? '');

            const inventarios = new Inventarios(db.connection);
            const itens_inventarios = new ItensInventario(db.connection);

            const dados_inventario = await inventarios.BuscarPorNum(inv_num);

            if (!inventarios.found) {
                const error = new Error('Inventário não encontrado');
                error.statusCode = 404;
                throw error;
            }

            const itens = await itens_inventarios.ListarPorInventario(inv_num);

            resdata.data = {
                inventario: dados_inventario,
                itens: itens
            };

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Inventarios.Detalhar');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Imprimir(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            void await db.Connect();

            const inv_num: string = String(req.params.inv_num ?? '').trim();

            if (!inv_num) {
                const error = new Error('Número do inventário deve ser informado.');
                error.statusCode = 400;
                throw error;
            }

            const inventarios = new Inventarios(db.connection);
            const itens_inventarios = new ItensInventario(db.connection);

            const inventario = await inventarios.BuscarPorNum(inv_num);

            if (!inventarios.found) {
                const error = new Error('Inventário não encontrado');
                error.statusCode = 404;
                throw error;
            }

            const itens = await itens_inventarios.ListarPorInventario(inv_num);
            const emitidoEm = new Date().toLocaleString('pt-BR', { timeZone: 'America/Maceio' });
            const tipoMedicamento = Controller_Inventarios.formatText(
                inventario.tipo_descr || inventario.inv_med_tipo_codigo,
            );
            const inventarioNumeroFormatado = Controller_Inventarios.formatInventarioNumero(inventario.inv_num);
            const inventarioDataFormatada = Controller_Inventarios.formatDate(inventario.inv_date);

            const tableBody = [
                [
                    { text: 'ID', style: 'tableHeader' },
                    { text: 'Descrição', style: 'tableHeader' },
                    { text: 'Unidade', style: 'tableHeader' },
                    { text: 'Lote', style: 'tableHeader' },
                    { text: 'Qtde Inv', style: 'tableHeader' },
                ],
                ...itens.map((item) => [
                    { text: Controller_Inventarios.formatText(item.iti_med_id), style: 'tableCellCenter' },
                    { text: Controller_Inventarios.formatText(item.med_descr), style: 'tableCell' },
                    { text: Controller_Inventarios.formatText(item.med_und), style: 'tableCellCenter' },
                    { text: Controller_Inventarios.formatText(item.iti_lote), style: 'tableCellCenter' },
                    { text: Controller_Inventarios.formatQuantity(item.iti_qtde_invent), style: 'tableCellCenter' },
                ]),
            ];

            const docDefinition = {
                info: {
                    title: 'Ficha de Inventario',
                    author: 'Farmacia Ambulatorial',
                    subject: `Inventario ${inv_num}`,
                },
                pageSize: 'A4',
                pageMargins: [24, 132, 24, 28],
                header: (currentPage: number, pageCount: number) => ({
                    margin: [24, 18, 24, 0],
                    stack: [
                        {
                            columns: [
                                {
                                    width: '*',
                                    stack: [
                                        { text: 'FARMACIA AMBULATORIAL HOSPITALAR', style: 'eyebrow' },
                                        { text: 'Ficha de Inventario', style: 'reportTitle', margin: [0, 3, 0, 0] },
                                        { text: 'Documento operacional de contagem de estoque', style: 'reportSubtitle', margin: [0, 2, 0, 0] },
                                    ],
                                },
                                {
                                    width: 170,
                                    alignment: 'right',
                                    stack: [
                                        { text: inventarioNumeroFormatado, style: 'headerBadge' },
                                        { text: `Pagina ${currentPage} de ${pageCount}`, style: 'headerMeta', margin: [0, 8, 0, 0] },
                                    ],
                                },
                            ],
                        },
                        {
                            canvas: [
                                { type: 'line', x1: 0, y1: 12, x2: Controller_Inventarios.PAGE_CONTENT_WIDTH, y2: 12, lineWidth: 1.1, lineColor: '#b7c4d1' },
                            ],
                        },
                        {
                            margin: [0, 10, 0, 0],
                            table: {
                                widths: ['*', '*', '*', '*'],
                                body: [
                                    [
                                        {
                                            stack: [
                                                { text: 'Data do Inventario', style: 'headerFlowLabel' },
                                                { text: inventarioDataFormatada, style: 'headerFlowValue', margin: [0, 4, 0, 0] },
                                            ],
                                        },
                                        {
                                            stack: [
                                                { text: 'Numero do Inventario', style: 'headerFlowLabel' },
                                                { text: inventarioNumeroFormatado, style: 'headerFlowValue', margin: [0, 4, 0, 0] },
                                            ],
                                        },
                                        {
                                            stack: [
                                                { text: 'Deposito', style: 'headerFlowLabel' },
                                                { text: Controller_Inventarios.formatText(inventario.dep_descr), style: 'headerFlowValue', margin: [0, 4, 0, 0] },
                                            ],
                                        },
                                        {
                                            stack: [
                                                { text: 'Tipo Medicamento', style: 'headerFlowLabel' },
                                                { text: tipoMedicamento, style: 'headerFlowValue', margin: [0, 4, 0, 0] },
                                            ],
                                        },
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
                                vLineWidth: () => 1,
                                hLineColor: () => '#b7c4d1',
                                vLineColor: () => '#b7c4d1',
                                paddingLeft: (index: number) => index === 0 ? 14 : 12,
                                paddingRight: (index: number, node: any) => index === node.table.widths.length - 1 ? 14 : 12,
                                paddingTop: () => 10,
                                paddingBottom: () => 12,
                            },
                        },
                    ],
                }),
                footer: (currentPage: number, pageCount: number) => ({
                    margin: [24, 0, 24, 14],
                    columns: [
                        { text: 'Sistema de Farmacia Ambulatorial', style: 'footerMeta' },
                        { text: `Inventario ${inventarioNumeroFormatado}`, style: 'footerMeta', alignment: 'center' },
                        { text: `Pagina ${currentPage}/${pageCount}`, style: 'footerMeta', alignment: 'right' },
                    ],
                }),
                content: [
                    {
                        table: {
                            headerRows: 1,
                            dontBreakRows: true,
                            keepWithHeaderRows: 1,
                            widths: [48, '*', 44, 78, 112],
                            body: tableBody,
                        },
                        layout: {
                            fillColor: (rowIndex: number) => {
                                if (rowIndex === 0) {
                                    return '#174a5a';
                                }

                                return rowIndex % 2 === 0 ? '#f7fafc' : '#ffffff';
                            },
                            hLineWidth: (index: number, node: any) => index === 1 || index === node.table.body.length ? 0.9 : 0,
                            vLineWidth: () => 0.5,
                            hLineColor: (index: number) => index === 1 ? '#174a5a' : '#b7c4d1',
                            vLineColor: () => '#b7c4d1',
                            paddingLeft: (index: number) => index === 0 ? 8 : 10,
                            paddingRight: (index: number, node: any) => index === node.table.widths.length - 1 ? 8 : 10,
                            paddingTop: (index: number) => index === 0 ? 7 : 6,
                            paddingBottom: (index: number) => index === 0 ? 7 : 6,
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
                        fontSize: 16,
                        bold: true,
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
                    headerFlowLabel: {
                        fontSize: 7,
                        bold: true,
                        color: '#64748b',
                    },
                    headerFlowValue: {
                        fontSize: 8,
                        color: '#0f172a',
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

            const pdfBuffer = await Controller_Inventarios.buildPdfBuffer(docDefinition);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=\"ficha-inventario-${inv_num}.pdf\"`);
            res.status(200).send(pdfBuffer);

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Inventarios.Imprimir');
            res.status(resdata.status).json(resdata);
        }

        void await db.Disconnect();

    }

    static async SalvarDigitacao(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            void await db.Connect();
            void await db.Begin();

            const inv_num: string = String(req.params.inv_num ?? '');
            const itens: Array<{ med_id: number; med_lote: string; qtde_invent: number; }> = req.body.itens ?? [];

            if (inv_num === '' || inv_num === null || inv_num === undefined) {
                const error = new Error('Número do inventário inválido');
                error.statusCode = 400;
                throw error;
            }

            if (itens.length === 0) {
                const error = new Error('Itens do inventário inválidos');
                error.statusCode = 400;
                throw error;
            }

            const inventarios: Inventarios = new Inventarios(db.connection);
            const itens_inventarios: ItensInventario = new ItensInventario(db.connection);

            void await inventarios.BuscarPorNum(inv_num);

            if (!inventarios.found) {
                const error = new Error('Inventário não encontrado');
                error.statusCode = 404;
                throw error;
            }

            if (inventarios.inv_status !== eStatus.Aberto) {
                const error = new Error('Inventário não está aberto');
                error.statusCode = 400;
                throw error;
            }

            for (const item of itens) {

                void await itens_inventarios.BuscarPorItem(inv_num, Number(item.med_id), item.med_lote);

                if (!itens_inventarios.found) {
                    const error = new Error(`Item ${item.med_id} não encontrado`);
                    error.statusCode = 404;
                    throw error;
                }

                itens_inventarios.iti_qtde_invent = item.qtde_invent;

                void await itens_inventarios.Salvar();

            }

            void await db.Commit();

            resdata.msg = `Inventário ${inv_num} salvo com sucesso`;

        } catch (error: any) {

            void await db.Rollback();

            applyControllerError(resdata, error, 'Controller Inventarios.SalvarDigitacao');

        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Fechar(req: Request, res: Response) {

        const db: iDatabase = new Database();
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} }

        try {

            void await db.Connect();
            void await db.Begin();

            const inv_num: string = String(req.params.inv_num ?? '');

            const inventarios = new Inventarios(db.connection);
            const itens_inventarios = new ItensInventario(db.connection);
            const estoque = new Estoque(db.connection);

            void await inventarios.BuscarPorNum(inv_num);

            if (!inventarios.found) {
                const error = new Error('Inventário não encontrado');
                error.statusCode = 404;
                throw error;
            }

            if (inventarios.inv_status !== eStatus.Aberto) {
                const error = new Error('Inventário não está aberto');
                error.statusCode = 400;
                throw error;
            }

            const itens = await itens_inventarios.ListarPorInventario(inv_num);

            if (itens.length === 0) {
                const error = new Error('Inventário vazio');
                error.statusCode = 400;
                throw error;
            }

            inventarios.inv_num = inv_num;
            inventarios.inv_status = eStatus.Fechado;

            void await inventarios.Salvar();

            for (const item of itens) {

                void await estoque.BuscarPorItemEstoque(Number(inventarios.inv_dep_id), Number(item.iti_med_id), String(item.iti_lote));

                estoque.est_dep_id = Number(inventarios.inv_dep_id);
                estoque.est_med_id = Number(item.iti_med_id);
                estoque.est_lote = String(item.iti_lote);
                estoque.est_validade = item.iti_validade;
                estoque.est_saldo_disponivel = Number(item.iti_qtde_invent);

                void await estoque.Salvar();
            }

            void await db.Commit();

            resdata.msg = `Inventário ${inv_num} fechado com sucesso`;

        } catch (error: any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Inventarios.Fechar');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

}
