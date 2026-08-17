import Database, { iDatabase } from '../connections/dbconn.js';
import Solicitacoes from '../model/dao_solicitacoes.js';
import ItensSolicitacoes from '../model/dao_itens_solicitacoes.js';
import Movimentacoes from '../model/dao_movimentacoes.js';
import Estoque from '../model/dao_estoque.js';
import Depositos from '../model/dao_depositos.js';
import { Request, Response } from 'express';
import { iresdata } from './interface_controllers.js';
import { applyControllerError } from "../utils/controllerError.js";
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";

pdfMake.addVirtualFileSystem(pdfFonts);

export default class Controller_Solicitacoes {

      private static readonly PAGE_CONTENT_WIDTH = 547;

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

      private static formatText(value: unknown, fallback = '-'): string {
            if (value === null || value === undefined) {
                  return fallback;
            }

            const text = String(value).trim();

            return text ? text : fallback;
      }

      private static formatQuantity(value: unknown, fallback = '-'): string {
            if (value === null || value === undefined || value === '') {
                  return fallback;
            }

            const quantity = Number(value);

            if (Number.isNaN(quantity)) {
                  return fallback;
            }

            return quantity.toLocaleString('pt-BR');
      }

      static async Buscar(req: Request, res: Response) {

            const db: iDatabase = new Database('fsph_farmacia');

            const resdata: iresdata = {
                  err: 0,
                  msg: '',
                  status: 200,
                  data: []
            };

            try {

                  void await db.Connect();

                  const sol_id: number = Number(req.params.sol_id || 0);

                  if (sol_id === 0) {
                        const error = new Error('ID da solicitação não informado');
                        error.statusCode = 400;
                        throw error;
                  }

                  const solicitacao = new Solicitacoes(db.connection);
                  const itens = new ItensSolicitacoes(db.connection);

                  const solicitacaoData = await solicitacao.BuscarPorId(sol_id);
                  const itensData = await itens.ListarItens(sol_id);

                  resdata.data = { solicitacao: solicitacaoData, itens: itensData };

                  res.status(resdata.status).json(resdata);

            } catch (error: any) {
                  applyControllerError(error, resdata, 'Controller Solicitacoes - Buscar');

            } finally {
                  await db.Disconnect();
                  res.status(resdata.status).json(resdata);
            }

      }

      static async ListarAbertas(req: Request, res: Response) {

            const db: iDatabase = new Database('fsph_farmacia');

            const resdata: iresdata = {
                  err: 0,
                  msg: '',
                  status: 200,
                  data: []
            };

            try {

                  void await db.Connect();

                  const solicitacoes = new Solicitacoes(db.connection);

                  const rows = await solicitacoes.ListarAbertas();

                  resdata.data = rows;

            } catch (error: any) {
                  applyControllerError(error, resdata, 'Controller Solicitacoes - ListarAbertas');

            } finally {
                  await db.Disconnect();
                  res.status(resdata.status).json(resdata);
            }

      }

      static async ListarEncerradas(req: Request, res: Response) {

            const db: iDatabase = new Database('fsph_farmacia');

            const resdata: iresdata = {
                  err: 0,
                  msg: '',
                  status: 200,
                  data: []
            };

            try {

                  void await db.Connect();

                  const data_ini: string = req.query.data_ini as string || '';
                  const data_fim: string = req.query.data_fim as string || '';

                  if (!data_ini || !data_fim) {
                        const error = new Error('Data inicial e final devem ser informadas');
                        error.statusCode = 400;
                        throw error;
                  }

                  if (Number.isNaN(new Date(String(data_ini)).getTime())) {
                        const error = new Error('Data de início inválida') as any;
                        error.statusCode = 400;
                        throw error;
                  }

                  if (Number.isNaN(new Date(String(data_fim)).getTime())) {
                        const error = new Error('Data de fim inválida') as any;
                        error.statusCode = 400;
                        throw error
                  }

                  if (new Date(String(data_ini)) > new Date(String(data_fim))) {
                        const error = new Error('Data de início deve ser menor que a data de fim')
                        error.statusCode = 400;
                        throw error;
                  }

                  const solicitacoes = new Solicitacoes(db.connection);

                  const rows = await solicitacoes.ListarEncerradas(data_ini, data_fim);

                  resdata.data = rows;

            } catch (error: any) {
                  applyControllerError(error, resdata, 'Controller Solicitacoes - ListarEncerradas');

            } finally {
                  await db.Disconnect();
                  res.status(resdata.status).json(resdata);
            }

      }

      static async Imprimir(req: Request, res: Response) {

            const db: iDatabase = new Database('fsph_farmacia');

            try {

                  await db.Connect();

                  const sol_id: number = Number(req.params.sol_id || 0);

                  if (sol_id === 0) {
                        const error = new Error('ID da solicitação não informado') as any;
                        error.statusCode = 400;
                        throw error;
                  }

                  const solicitacoes = new Solicitacoes(db.connection);
                  const itensSolicitacoes = new ItensSolicitacoes(db.connection);

                  const solicitacao = await solicitacoes.BuscarPorId(sol_id);

                  if (!solicitacoes.found) {
                        const error = new Error('Solicitação não encontrada') as any;
                        error.statusCode = 404;
                        throw error;
                  }

                  const itens = await itensSolicitacoes.ListarItensParaImpressao(sol_id);
                  const depositos = new Depositos(db.connection);
                  const depositoOrigem = solicitacao.sol_dep_ori_id ? await depositos.BuscarPorId(Number(solicitacao.sol_dep_ori_id)) : null;
                  const depositoDestino = solicitacao.sol_dep_des_id ? await depositos.BuscarPorId(Number(solicitacao.sol_dep_des_id)) : null;

                  const itemRows: Array<Array<Record<string, unknown>>> = itens.map((item) => {
                        return [
                              { text: Controller_Solicitacoes.formatText(item.med_bona_codigo ?? item.med_id, ''), style: 'tableCellCenter' },
                              { text: Controller_Solicitacoes.formatText(item.med_descr, ''), style: 'tableCell' },
                              { text: Controller_Solicitacoes.formatText(item.med_descr_coml, ''), style: 'tableCell' },
                              { text: Controller_Solicitacoes.formatText(item.med_und, ''), style: 'tableCellCenter' },
                              { text: Controller_Solicitacoes.formatText(item.iso_med_lote, ''), style: 'tableCellCenter' },
                              { text: Controller_Solicitacoes.formatQuantity(item.iso_med_qtde, ''), style: 'tableCellCenter' },
                              { text: '', style: 'tableCellCenter' },
                        ];
                  });

                  const minimumPrintableRows = 16;
                  const dataSolicitacaoFormatada = Controller_Solicitacoes.formatText(
                        Controller_Solicitacoes.formatDate(solicitacao.sol_date),
                        '',
                  );
                  const depositoOrigemDescricao = Controller_Solicitacoes.formatText(depositoOrigem?.dep_descr, 'Nao informado');
                  const depositoDestinoDescricao = Controller_Solicitacoes.formatText(depositoDestino?.dep_descr, 'Nao informado');

                  while (itemRows.length < minimumPrintableRows) {
                        itemRows.push([
                              { text: '', style: 'tableCellCenter' },
                              { text: '', style: 'tableCell' },
                              { text: '', style: 'tableCell' },
                              { text: '', style: 'tableCellCenter' },
                              { text: '', style: 'tableCellCenter' },
                              { text: '', style: 'tableCellCenter' },
                              { text: '', style: 'tableCellCenter' },
                        ]);
                  }

                  const tableBody: Array<Array<Record<string, unknown>>> = [
                        [
                              { text: 'CODIGO', style: 'tableHeader' },
                              { text: 'MEDICAMENTO', style: 'tableHeader' },
                              { text: 'MARCA', style: 'tableHeader' },
                              { text: 'UND', style: 'tableHeader' },
                              { text: 'LOTE', style: 'tableHeader' },
                              { text: 'QTDE SOL', style: 'tableHeader' },
                              { text: 'QTDE ATEND', style: 'tableHeader' },
                        ],
                        ...itemRows,
                  ];

                  const signatureBlock = {
                        margin: [0, 8, 0, 0],
                        table: {
                              widths: ['*', '*'],
                              body: [
                                    [
                                          { text: 'FARMACIA', style: 'signatureHeader' },
                                          { text: 'ALMOXARIFADO', style: 'signatureHeader' },
                                    ],
                                    [
                                          {
                                                stack: [
                                                      {
                                                            columns: [
                                                                  { text: 'Data:', style: 'signatureLabel' },
                                                                  { text: '____/____/________', style: 'signatureLine', alignment: 'right' },
                                                            ],
                                                      },
                                                      {
                                                            margin: [0, 22, 0, 0],
                                                            columns: [
                                                                  { text: 'Assinatura:', style: 'signatureLabel' },
                                                                  { text: '________________________________', style: 'signatureLine', alignment: 'right' },
                                                            ],
                                                      },
                                                ],
                                          },
                                          {
                                                stack: [
                                                      {
                                                            columns: [
                                                                  { text: 'Data:', style: 'signatureLabel' },
                                                                  { text: '____/____/________', style: 'signatureLine', alignment: 'right' },
                                                            ],
                                                      },
                                                      {
                                                            margin: [0, 22, 0, 0],
                                                            columns: [
                                                                  { text: 'Assinatura:', style: 'signatureLabel' },
                                                                  { text: '________________________________', style: 'signatureLine', alignment: 'right' },
                                                            ],
                                                      },
                                                ],
                                          },
                                    ],
                              ],
                        },
                        layout: {
                              fillColor: (rowIndex: number) => rowIndex === 0 ? '#f8fbfc' : '#ffffff',
                              hLineWidth: () => 1,
                              vLineWidth: () => 1,
                              hLineColor: () => '#dce7ef',
                              vLineColor: () => '#dce7ef',
                              paddingLeft: () => 14,
                              paddingRight: () => 14,
                              paddingTop: (rowIndex: number) => rowIndex === 0 ? 10 : 12,
                              paddingBottom: (rowIndex: number) => rowIndex === 0 ? 10 : 14,
                        },
                  };

                  const docDefinition = {
                        info: {
                              title: `Solicitacao ${sol_id}`,
                              author: 'Farmacia Ambulatorial',
                              subject: 'Impressao de solicitacao',
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
                                                            { text: 'Solicitacao de Transferencia', style: 'reportTitle', margin: [0, 3, 0, 0] },
                                                            { text: 'Documento operacional de movimentacao entre depositos', style: 'reportSubtitle', margin: [0, 2, 0, 0] },
                                                      ],
                                                },
                                                {
                                                      width: 170,
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
                                                { type: 'line', x1: 0, y1: 12, x2: Controller_Solicitacoes.PAGE_CONTENT_WIDTH, y2: 12, lineWidth: 1, lineColor: '#d7e0ea' },
                                          ],
                                    },
                                    {
                                          margin: [0, 10, 0, 0],
                                          table: {
                                                widths: ['*', '*', '*'],
                                                body: [
                                                      [
                                                            {
                                                                  stack: [
                                                                        { text: 'Numero da solicitacao', style: 'headerFlowLabel' },
                                                                        { text: String(sol_id), style: 'headerFlowValue', margin: [0, 4, 0, 0] },
                                                                  ],
                                                            },
                                                            {
                                                                  stack: [
                                                                        { text: 'Deposito', style: 'headerFlowLabel' },
                                                                        { text: depositoOrigemDescricao, style: 'headerFlowValue', margin: [0, 4, 0, 0] },
                                                                  ],
                                                            },
                                                            {
                                                                  stack: [
                                                                        { text: 'Data da solicitacao', style: 'headerFlowLabel' },
                                                                        { text: dataSolicitacaoFormatada, style: 'headerFlowValue', margin: [0, 4, 0, 0] },
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
                                                hLineColor: () => '#dce7ef',
                                                vLineColor: () => '#dce7ef',
                                                paddingLeft: (index: number) => index === 0 ? 14 : 12,
                                                paddingRight: (index: number, node: any) => index === node.table.widths.length - 1 ? 14 : 12,
                                                paddingTop: (rowIndex: number) => rowIndex === 0 ? 10 : 12,
                                                paddingBottom: () => 12,
                                          },
                                    },
                              ],
                        }),
                        footer: (currentPage: number, pageCount: number) => ({
                              margin: [24, 0, 24, 14],
                              columns: [
                                    { text: 'Sistema de Farmacia Ambulatorial', style: 'footerMeta' },
                                    { text: `Solicitacao ${sol_id}`, style: 'footerMeta', alignment: 'center' },
                                    { text: `Pagina ${currentPage}/${pageCount}`, style: 'footerMeta', alignment: 'right' },
                              ],
                        }),
                        content: [
                              {
                                    table: {
                                          headerRows: 1,
                                          dontBreakRows: true,
                                          keepWithHeaderRows: 1,
                                          widths: [42, '*', 92, 34, 66, 52, 58],
                                          body: tableBody,
                                          heights: (rowIndex: number) => rowIndex === 0 ? 16 : 19,
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
                                          paddingTop: (index: number) => index === 0 ? 4 : 3,
                                          paddingBottom: (index: number) => index === 0 ? 4 : 3,
                                    },
                              },
                              {
                                    margin: [0, 12, 0, 0],
                                    table: {
                                          widths: ['*'],
                                          heights: () => 70,
                                          body: [[
                                                {
                                                      stack: [
                                                            { text: 'Observacao', style: 'sectionLabel' },
                                                            { text: Controller_Solicitacoes.formatText(solicitacao.sol_obs, '-'), style: 'bodyText', margin: [0, 6, 0, 0] },
                                                      ],
                                                },
                                          ]],
                                    },
                                    layout: {
                                          fillColor: () => '#f8fbfc',
                                          hLineWidth: () => 1,
                                          vLineWidth: () => 1,
                                          hLineColor: () => '#dce7ef',
                                          vLineColor: () => '#dce7ef',
                                          paddingLeft: () => 14,
                                          paddingRight: () => 14,
                                          paddingTop: () => 12,
                                          paddingBottom: () => 12,
                                    },
                              },
                              signatureBlock,
                        ].filter(Boolean),
                        styles: {
                              eyebrow: {
                                    fontSize: 8,
                                    bold: true,
                                    color: '#0f766e',
                              },
                              reportTitle: {
                                    fontSize: 18,
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
                              headerSectionTitle: {
                                    fontSize: 12,
                                    bold: true,
                                    color: '#0f172a',
                              },
                              bodyMuted: {
                                    fontSize: 9,
                                    color: '#64748b',
                              },
                              bodyText: {
                                    fontSize: 9,
                                    color: '#1f2937',
                                    lineHeight: 1.25,
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
                                    fontSize: 15,
                                    bold: true,
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
                              signatureHeader: {
                                    fontSize: 9,
                                    bold: true,
                                    color: '#174a5a',
                                    alignment: 'center',
                              },
                              signatureLabel: {
                                    fontSize: 8,
                                    bold: true,
                                    color: '#64748b',
                              },
                              signatureLine: {
                                    fontSize: 8.5,
                                    color: '#0f172a',
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

                  const pdfBuffer = await Controller_Solicitacoes.buildPdfBuffer(docDefinition);

                  res.set({
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `inline; filename=\"solicitacao-${sol_id}.pdf\"`,
                  });
                  res.status(200).send(pdfBuffer);

            } catch (error: any) {
                  const resdata: iresdata = {
                        err: 0,
                        msg: '',
                        status: 200,
                        data: []
                  };

                  applyControllerError(resdata, error, 'Controller Solicitacoes - Imprimir');
                  res.status(resdata.status).json(resdata);

            } finally {
                  await db.Disconnect();
            }

      }

      static async Excluir(req: Request, res: Response) {

            const db: iDatabase = new Database('fsph_farmacia');

            const resdata: iresdata = {
                  err: 0,
                  msg: '',
                  status: 200,
                  data: []
            };

            try {

                  void await db.Connect();

                  await db.Begin();

                  const sol_id: number = Number(req.params.sol_id || 0);

                  if (sol_id === 0) {
                        const error = new Error('ID da solicitação não informado');
                        error.statusCode = 400;
                        throw error;
                  }

                  await db.connection.query("DELETE FROM tb_itens_solicitacoes WHERE iso_sol_id = ?", [sol_id]);
                  await db.connection.query("DELETE FROM tb_solicitacoes WHERE sol_id = ?", [sol_id]);

                  await db.Commit();

                  resdata.msg = 'Solicitação excluída com sucesso';

            } catch (error: any) {
                  applyControllerError(error, resdata, 'Controller Solicitacoes - Excluir');

            } finally {
                  await db.Disconnect();
                  res.status(resdata.status).json(resdata);
            }

      }

      static async Encerrar(req: Request, res: Response) {

            const db: iDatabase = new Database('fsph_farmacia');

            const resdata: iresdata = {
                  err: 0,
                  msg: '',
                  status: 200,
                  data: []
            };

            try {

                  await db.Connect();

                  await db.Begin();

                  // Extrai os dados do corpo da requisição
                  const sol_id: number = Number(req.body.sol_id || 0);
                  const user_aprov = String(req.body.user_aprov || null);
                  const itens = Array.isArray(req.body.itens) ? req.body.itens : [];

                  // Valida os dados recebidos
                  if (sol_id === 0) {
                        const error = new Error("ID da solicitação não informado") as any;
                        error.statusCode = 400;
                        throw error;
                  }

                  if (!user_aprov || user_aprov.trim() === '') {
                        const error = new Error("Usuario não informado.") as any;
                        error.statusCode = 400;
                        throw error;
                  }

                  if (!Array.isArray(itens) || itens.length === 0) {
                        const error = new Error("Itens não informados.") as any;
                        error.statusCode = 400;
                        throw error;
                  }

                  // Instancia os DAOs necessários
                  const solicitacoes = new Solicitacoes(db.connection);
                  const itensSolicitacoes = new ItensSolicitacoes(db.connection);
                  const estoqueOrigem = new Estoque(db.connection);
                  const estoqueDestino = new Estoque(db.connection);
                  const movimentacoes = new Movimentacoes(db.connection);
                  const depositos = new Depositos(db.connection);

                  // Busca a solicitação pelo ID
                  await solicitacoes.BuscarPorId(sol_id);

                  if (!solicitacoes.found) {
                        const error = new Error(`Solicitação ID ${sol_id} não encontrada.`) as any;
                        error.statusCode = 404;
                        throw error;
                  }

                  solicitacoes.sol_status = 1; // Encerrada
                  solicitacoes.sol_user_aprov = user_aprov;
                  solicitacoes.sol_date_aprov = new Date();

                  await solicitacoes.Salvar();

                  // Processa cada item da solicitação
                  for (const item of itens) {

                        // Extrai os dados do item da solicitação  
                        const dep_ori_id = Number(solicitacoes.sol_dep_ori_id || 0);
                        const dep_des_id = Number(solicitacoes.sol_dep_des_id || 0);
                        const iso_id = Number(item.iso_id || 0);
                        const med_id = Number(item.iso_med_id || 0);
                        const qtde_digitada = Number(item.qtde_digitada || 0);
                        const qtde_solicitada = Number(item.iso_med_qtde || 0);
                        const lote = String(item.iso_med_lote || '');
                        const validade = String(item.iso_med_validade || '');

                        // Valida os dados do item da solicitação
                        if (dep_ori_id === 0) {
                              const error = new Error("Deposito de origem não informado") as any;
                              error.statusCode = 400;
                              throw error;
                        }

                        if (dep_des_id === 0) {
                              const error = new Error("Deposito de destino não informado") as any;
                              error.statusCode = 400;
                              throw error;
                        }

                        if (med_id === 0) {
                              const error = new Error("ID do medicamento não informado") as any;
                              error.statusCode = 400;
                              throw error;
                        }

                        if (iso_id === 0) {
                              const error = new Error("ID do item da solicitação não informado") as any;
                              error.statusCode = 400;
                              throw error;
                        }

                        // Se o item já tiver sido digitado, atualiza a quantidade
                        await itensSolicitacoes.BuscarPorId(iso_id);

                        if (!itensSolicitacoes.found) {
                              const error = new Error(`Item da solicitação ID ${iso_id} não encontrado.`) as any;
                              error.statusCode = 404;
                              throw error;
                        }

                        itensSolicitacoes.iso_qtde_digitada = qtde_digitada;

                        await itensSolicitacoes.Salvar();

                        // Busca os depósitos de origem e destino
                        await depositos.BuscarPorId(dep_ori_id);

                        if (!depositos.found) {
                              const error = new Error(`Deposito origem não encontrado.`) as any;
                              error.statusCode = 404;
                              throw error;
                        }

                        const deposito_origem = depositos.dep_descr;

                        // Atualiza o estoque de origem
                        await estoqueOrigem.BuscarPorItemEstoque(dep_ori_id, med_id, lote);

                        if (!estoqueOrigem.found) {
                              const error = new Error(`Estoque de origem não encontrado para o medicamento ID ${med_id} no depósito ID ${dep_ori_id} e lote ${lote}`) as any;
                              error.statusCode = 404;
                              throw error;
                        }

                        estoqueOrigem.est_saldo_disponivel -= qtde_digitada;

                        await estoqueOrigem.Salvar();

                        // Atualiza o estoque de destino
                        await estoqueDestino.BuscarPorItemEstoque(dep_des_id, med_id, lote);

                        if (!estoqueDestino.found) {
                              // Se não existir, cria um novo registro de estoque
                              estoqueDestino.est_dep_id = dep_des_id;
                              estoqueDestino.est_med_id = med_id;
                              estoqueDestino.est_lote = lote;
                              estoqueDestino.est_saldo_disponivel = qtde_digitada;
                              estoqueDestino.est_saldo_bloqueado = 0;
                              estoqueDestino.est_validade = validade;
                        } else {
                              // Se existir, atualiza o saldo disponível
                              estoqueDestino.est_saldo_disponivel += qtde_digitada;
                        }
                        await estoqueDestino.Salvar();

                        // Busca o depósito de destino para obter a descrição
                        await depositos.BuscarPorId(dep_des_id);

                        if (!depositos.found) {
                              const error = new Error(`Deposito Destino não encontrado.`) as any;
                              error.statusCode = 404;
                              throw error;
                        }

                        const deposito_destino = depositos.dep_descr;

                        // Gera o número do documento de movimentação
                        const anoAtual = new Date().getFullYear();
                        const mesAtual = (new Date().getMonth() + 1).toString().padStart(2, '0');
                        const numeroAleatorio = Math.floor(Math.random() * 11333).toString().padStart(4, '0');

                        const mov_doc: string = `${anoAtual}${mesAtual}${numeroAleatorio}`;

                        // Registra a movimentação de saída do depósito de origem
                        await movimentacoes.BuscarPorId(0)

                        movimentacoes.mov_date = new Date();
                        movimentacoes.mov_descr = `Transferencia entre Deposito : ${deposito_origem} para ${deposito_destino}`
                        movimentacoes.mov_documento = mov_doc;
                        movimentacoes.mov_med_id = med_id;
                        movimentacoes.mov_med_lote = lote;
                        movimentacoes.mov_qtde = qtde_digitada;
                        movimentacoes.mov_tipo = 'TRA'
                        movimentacoes.mov_user = user_aprov;

                        await movimentacoes.Salvar();

                  }

                  await db.Commit();

                  resdata.msg = 'Solicitação encerrada com sucesso';

            } catch (error: any) {
                  applyControllerError(error, resdata, 'Controller Solicitacoes - Encerrar');

            } finally {
                  await db.Disconnect();
                  res.status(resdata.status).json(resdata);
            }

      }

      static async Salvar(req: Request, res: Response) {

            const db: iDatabase = new Database('fsph_farmacia');

            const resdata: iresdata = { err: 0, msg: '', status: 200, data: [] };

            try {

                  await db.Connect();
                  await db.Begin();

                  const sol_id = Number(req.body.sol_id);
                  const sol_date = req.body.sol_date as string;
                  const sol_dep_ori_id = Number(req.body.sol_dep_ori_id);
                  const sol_dep_des_id = Number(req.body.sol_dep_des_id);
                  const sol_user_create = String(req.body.sol_user_create);
                  const sol_status = Number(req.body.sol_status);
                  const sol_obs = req.body.sol_obs as string;
                  const itens = req.body.itens as Array<any>;

                  if (isNaN(sol_id)) {
                        const error = new Error("Parâmetro 'sol_id' inválido.");
                        error.statusCode = 400;
                        throw error;
                  }

                  if (!sol_date || isNaN(Date.parse(sol_date))) {
                        const error = new Error("Parâmetro Data Solicitação inválida ou ausente.");
                        error.statusCode = 400;
                        throw error;
                  }

                  if (isNaN(sol_dep_ori_id)) {
                        const error = new Error("Parâmetro Depósito de Origem inválido.");
                        error.statusCode = 400;
                        throw error;
                  }

                  if (isNaN(sol_dep_des_id)) {
                        const error = new Error("Parâmetro Depósito de Destino inválido.");
                        error.statusCode = 400;
                        throw error;
                  }

                  if (!sol_user_create || typeof sol_user_create !== 'string') {
                        const error = new Error("Parâmetro Usuário inválido ou ausente.");
                        error.statusCode = 400;
                        throw error;
                  }

                  if (itens && !Array.isArray(itens)) {
                        const error = new Error("Parâmetro Itens inválido. Deve ser um array.");
                        error.statusCode = 400;
                        throw error;
                  }

                  const solicitacoes = new Solicitacoes(db.connection);
                  const itensSolicitacoes = new ItensSolicitacoes(db.connection);

                  await solicitacoes.BuscarPorId(sol_id);

                  if (!solicitacoes.found && sol_id !== 0) {
                        const error = new Error(`Solicitação com ID ${String(sol_id).padStart(6, '0')} não encontrada.`);
                        error.statusCode = 404;
                        throw error;
                  }

                  solicitacoes.sol_id = sol_id;
                  solicitacoes.sol_date = sol_date;
                  solicitacoes.sol_dep_ori_id = sol_dep_ori_id;
                  solicitacoes.sol_dep_des_id = sol_dep_des_id;
                  solicitacoes.sol_user_create = sol_user_create;
                  solicitacoes.sol_status = solicitacoes.found ? sol_status : 0; // Se for novo registro, define status inicial
                  solicitacoes.sol_obs = sol_obs;

                  await solicitacoes.Salvar();

                  for (const item of itens) {

                        const iso_id = Number(item.iso_id || 0);
                        const iso_med_id = Number(item.iso_med_id || 0);
                        const iso_med_qtde = Number(item.iso_med_qtde || 0);
                        const iso_med_lote = String(item.iso_med_lote || '');
                        const iso_med_validade = String(item.iso_med_validade || '');

                        if (iso_med_id === 0) {
                              const error = new Error("ID do medicamento não informado para um dos itens.");
                              error.statusCode = 400;
                              throw error;
                        }

                        if (iso_med_qtde <= 0) {
                              const error = new Error("Quantidade do medicamento deve ser maior que zero para um dos itens.");
                              error.statusCode = 400;
                              throw error;
                        }

                        await itensSolicitacoes.BuscarPorId(iso_id);

                        if (!itensSolicitacoes.found && iso_id !== 0) {
                              const error = new Error(`Item da solicitação com ID ${iso_id} não encontrado.`);
                              error.statusCode = 404;
                              throw error;
                        }

                        itensSolicitacoes.iso_id = iso_id;
                        itensSolicitacoes.iso_sol_id = solicitacoes.sol_id;
                        itensSolicitacoes.iso_med_id = iso_med_id;
                        itensSolicitacoes.iso_med_qtde = iso_med_qtde;
                        itensSolicitacoes.iso_med_lote = iso_med_lote;
                        itensSolicitacoes.iso_med_validade = iso_med_validade;

                        await itensSolicitacoes.Salvar();
                  }

                  await db.Commit();

                  resdata.msg = solicitacoes.found ? `Solicitação com ID ${String(solicitacoes.sol_id).padStart(6, '0')} atualizada com sucesso.` : `Nova solicitação criada com ID ${String(solicitacoes.sol_id).padStart(6, '0')}.`;
                  resdata.data = { sol_id: solicitacoes.sol_id };

            } catch (error: any) {
                  await db.Rollback();
                  applyControllerError(error, resdata, 'Controller_Solicitacoes.Salvar');
            }

            await db.Disconnect();

            res.status(resdata.status).json(resdata);

      }
}
