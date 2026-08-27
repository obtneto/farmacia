import Database, { iDatabase } from "../connections/dbconn.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";
import { iresdata } from "./interface_controllers.js";
import Requisicoes, { eStatus } from "../model/dao_requisicoes.js";
import Depositos from "../model/dao_depositos.js";
import Locais from "../model/dao_locais.js";
import Setores from "../model/doa_setores.js";
import ItensRequisicao from "../model/dao_itens_requisicoes.js"
import Medicamentos from "../model/dao_medicamentos.js";
import DemandasEspecificas from "../model/dao_demanda_especificas.js";
import ItensDemandasEspecificas from "../model/dao_itens_demandas_especificas.js";
import Estoque from "../model/dao_estoque.js";
import GeraNumeroReq from "../utils/GeraNumero.js";
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import ItensDDU from "../model/dao_itens_ddu.js";
import ControleDDU from "../model/dao_controle_ddu.js";
import settings from "../utils/settings.js";
import Movimentacoes from "../model/dao_movimentacoes.js";
import { RowDataPacket } from "mysql2";

pdfMake.addVirtualFileSystem(pdfFonts);

// Coordena requisicoes e o fluxo de aprovacao com impacto em estoque.
export default class Controller_Requisicoes {

    private static readonly PAGE_CONTENT_WIDTH = 547;

    private static async buildPdfBuffer(docDefinition: object): Promise<Buffer> {
        const pdfDocument = pdfMake.createPdf(docDefinition);
        const pdfBlob = await pdfDocument.getBlob();
        const pdfArrayBuffer = await pdfBlob.arrayBuffer();

        return Buffer.from(pdfArrayBuffer);
    }

    // Formata data para dd/mm/yyyy
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

    private static formatDateTime(value: Date | string | null): string {

        if (!value) {
            return '';
        }

        const date = value instanceof Date ? value : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleString('pt-BR', { timeZone: 'America/Maceio' });
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

    static async Listar(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            void await db.Connect();

            const dat_ini = String(req.params.dat_ini);
            const dat_fim = String(req.params.dat_fim);
            const dep_id = Number(req.params.dep_id || 0);

            if (!dat_ini || !dat_fim) {
                const error = new Error('Datas não informadas') as any;
                error.statusCode = 400;
                throw error;
            }

            const depostos = new Depositos(db.connection);
            const requisicoes = new Requisicoes(db.connection);

            await depostos.BuscarPorId(dep_id);

            if (!depostos.found) {
                const error = new Error('Depósito não encontrado') as any;
                error.statusCode = 404;
                throw error;
            }

            const result = await requisicoes.ListarPorPeriodo(dat_ini, dat_fim, dep_id);

            resdata.data = result;

        } catch (error: any) {

            applyControllerError(resdata, error, 'Controller Requisicoes');

        }

        void await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

    static async Buscar(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            void await db.Connect();

            const req_id = Number(req.params.req_id || 0);

            if (!req_id || req_id <= 0) {
                const error = new Error('ID não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            const requisicoes = new Requisicoes(db.connection);
            const depostos = new Depositos(db.connection);
            const locais = new Locais(db.connection);
            const setores = new Setores(db.connection);
            const itens_requisicao = new ItensRequisicao(db.connection);

            let result = await requisicoes.BuscarPorId(req_id);

            if (!requisicoes.found) {
                const error = new Error('Requisição não encontrada') as any;
                error.statusCode = 404;
                throw error;
            }

            await depostos.BuscarPorId(Number(requisicoes.req_dep_id));

            if (!depostos.found) {
                const error = new Error('Depósito não encontrado') as any;
                error.statusCode = 404;
                throw error;
            }

            await locais.BuscarPorId(Number(requisicoes.req_local_id));

            if (!locais.found) {
                const error = new Error('Local não encontrado') as any;
                error.statusCode = 404;
                throw error;
            }

            if (requisicoes.req_set_id) {
                await setores.BuscarPorId(Number(requisicoes.req_set_id));

                if (!setores.found) {
                    const error = new Error('Setor não encontrado') as any;
                    error.statusCode = 404;
                    throw error;
                }
            }

            const itens = await itens_requisicao.ListarItensRequisicoes(req_id);

            result.deposito = depostos.dep_descr;
            result.local = locais.local_descr;
            result.setor = setores.found ? setores.set_descr : null;
            result.itens = itens;

            resdata.data = result;

        } catch (error: any) {

            applyControllerError(resdata, error, 'Controller Requisicoes');

        }

        void await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

    static async ListarRequisicoesNaoAprovadas(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} };

        try {

            void await db.Connect();

            const requisicoes = new Requisicoes(db.connection);

            const result = await requisicoes.ListarRequisicoesNaoAprovadas();

            resdata.data = result;

        } catch (error: any) {

            applyControllerError(resdata, error, 'Controller Requisicoes');

        }

        void await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

    static async Salvar(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} };

        try {

            void await db.Connect();
            void await db.Begin();

            const req_id = Number(req.body.req_id || 0);
            const tipo_req_id = Number(req.body.tipo_req_id || 0);
            const pac_id = Number(req.body?.pac_id || null);
            const set_id = Number(req.body?.set_id || null);
            const dep_id = Number(req.body.dep_id || 0);
            const local_id = Number(req.body.local_id || 0);
            const req_date = String(req.body.data || '');
            const solicitado_por = String(req.body.solicitado_por || '');
            const observacao = String(req.body.observacao ?? '').trim() || null;

            const itens = req.body.itens || [];

            if (!tipo_req_id || tipo_req_id == 0) {
                const error = new Error('Tipo de requisição não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!pac_id && !set_id) {
                const error = new Error('Paciente ou setor não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            if (pac_id < 0) {
                const error = new Error('Paciente não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            if (set_id < 0) {
                const error = new Error('Setor não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!dep_id || dep_id <= 0) {
                const error = new Error('Depósito não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!local_id || local_id <= 0) {
                const error = new Error('Local não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(new Date(req_date).getTime())) {
                const error = new Error('Data de requisição inválida') as any;
                error.statusCode = 400;
                throw error
            }

            if (!solicitado_por) {
                const error = new Error('Solicitante não informado') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!Array.isArray(itens) || itens.length <= 0) {
                const error = new Error('Itens não informados') as any;
                error.statusCode = 400;
                throw error;
            }

            const requisicoes = new Requisicoes(db.connection);
            const itensRequisicao = new ItensRequisicao(db.connection);
            const setores = new Setores(db.connection);
            const locais = new Locais(db.connection);
            const depositos = new Depositos(db.connection);
            const medicamentos = new Medicamentos(db.connection);
            const estoques = new Estoque(db.connection);
            const demandas = new DemandasEspecificas(db.connection);
            const itens_demandas = new ItensDemandasEspecificas(db.connection);
            const geraNumeroReq = new GeraNumeroReq();

            await locais.BuscarPorId(local_id);
            if (!locais.found) {
                const error = new Error('Local não encontrado') as any;
                error.statusCode = 404;
                throw error;
            }

            await depositos.BuscarPorId(dep_id);

            if (!depositos.found) {
                const error = new Error('Depósito não encontrado') as any;
                error.statusCode = 404;
                throw error;
            }

            if (set_id > 0) {
                await setores.BuscarPorId(set_id);

                if (!setores.found) {
                    const error = new Error('Setor não encontrado') as any;
                    error.statusCode = 404;
                    throw error;
                }
            }

            await requisicoes.BuscarPorId(req_id);

            if (req_id > 0 && !requisicoes.found) {
                const error = new Error('Requisição não encontrada') as any;
                error.statusCode = 404;
                throw error;
            }

            if (requisicoes.found && Number(requisicoes.req_status) !== 0) {
                const error = new Error('Somente requisições pendentes podem ser alteradas') as any;
                error.statusCode = 400;
                throw error;
            }

            const req_num = `REQ${geraNumeroReq.proximoId()}`;

            requisicoes.req_num = req_num;
            requisicoes.req_date = new Date(req_date);
            requisicoes.req_local_id = local_id;
            requisicoes.req_dep_id = dep_id;
            requisicoes.req_pac_id = pac_id > 0 ? pac_id : null;
            requisicoes.req_set_id = set_id > 0 ? set_id : null;
            requisicoes.req_solicitado_por = solicitado_por;
            requisicoes.req_dt_solicitacao = new Date();
            requisicoes.req_status = 0;
            requisicoes.req_tip_id = tipo_req_id;
            requisicoes.req_observacao = observacao;

            await requisicoes.Salvar();

            if (pac_id > 0) {
                await demandas.BuscarPorPaciente(pac_id);
            }

            for (const item of itens) {

                const validade = new Date(item.validade);

                if (Number.isNaN(validade.getTime())) {
                    const error = new Error('Validade do item inválida') as any;
                    error.statusCode = 400;
                    throw error;
                }

                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                validade.setHours(0, 0, 0, 0);

                if (validade < hoje) {
                    const error = new Error('Item com validade expirada') as any;
                    error.statusCode = 400;
                    throw error;
                }

                await medicamentos.BuscarPorId(Number(item.med_id || 0));

                if (!medicamentos.found) {
                    const error = new Error('Medicamento não encontrado') as any;
                    error.statusCode = 404;
                    throw error;
                }

                if (!item.lote || item.lote == '' || item.lote == null) {
                    const error = new Error(`Lote do item ${medicamentos.med_descr} não informado`) as any;
                    error.statusCode = 400;
                    throw error;
                }

                const quantidadeItem = Number(item.qtde || 0);

                if (!Number.isFinite(quantidadeItem) || quantidadeItem <= 0) {
                    const error = new Error(`Quantidade do item ${medicamentos.med_descr} inválida`) as any;
                    error.statusCode = 400;
                    throw error;
                }

                await estoques.BuscarPorItemEstoque(dep_id, Number(item.med_id || 0), item.lote);

                if (!estoques.found) {
                    const error = new Error(`Item ${medicamentos.med_descr} com lote ${item.lote},\n 
                        não encontrado no estoque do depósito ${depositos.dep_descr} `) as any;
                    error.statusCode = 404;
                    throw error;
                }

                if ((estoques.est_saldo_disponivel || 0) < quantidadeItem) {
                    const error = new Error(`Quantidade solicitada maior que a quantidade disponível \n 
                        Medicamento: ${medicamentos.med_descr} \n Lote: ${item.lote} \n Quantidade solicitada: ${item.qtde} \n 
                        Quantidade disponível: ${estoques.est_saldo_disponivel}`) as any;
                    error.statusCode = 400;
                    throw error;
                }

                if (pac_id > 0 && demandas.found) {

                    const item_demanda = await itens_demandas.BuscaItemDemanda(Number(demandas.dem_id), Number(item.med_id))

                    if (Number(item_demanda.qtde) < quantidadeItem) {
                        const error = new Error(`A quantidade solicitada ${item.qtde} é maior que a quantidade disponível ${item_demanda.qtde}`) as any;
                        error.statusCode = 400;
                        throw error;
                    }

                }

                await itensRequisicao.BuscarPorId(0)

                itensRequisicao.ite_med_id = Number(item.med_id || 0);
                itensRequisicao.ite_lote = item.lote;
                itensRequisicao.ite_qtde = quantidadeItem;
                itensRequisicao.ite_req_id = requisicoes.req_id;
                itensRequisicao.ite_validade = item.validade;

                await itensRequisicao.Salvar();

            }

            await db.Commit();

            resdata.msg = 'Requisição salva com sucesso';
            resdata.data = { req_id: requisicoes.req_id, req_num: req_num };

        } catch (error: any) {

            await db.Rollback();

            applyControllerError(resdata, error, 'Controller Requisicoes');

        }

        void await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

    static async SalvarDevolucao(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} };

        try {

            void await db.Connect();
            void await db.Begin();

            //validações para gerar uma nova requisição
            const req_id = Number(req.body?.req_id || 0);
            const tipo_req_id = Number(settings.tipo_req_id_devolucao || 0);
            const req_date = String(req.body.data || '');
            const solicitado_por = String(req.body.solicitado_por || '');
            const observacao = String(req.body.observacao ?? '').trim() || null;
            const req_num_dispesa = String(req.body.req_num_dispesa || req.body.req_num_dispensacao || '');

            const itens = req.body.itens || [];

            if (!tipo_req_id || tipo_req_id == 0) {
                const error = new Error('Tipo de requisição não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(new Date(req_date).getTime())) {
                const error = new Error('Data de requisição inválida') as any;
                error.statusCode = 400;
                throw error
            }

            if (!solicitado_por) {
                const error = new Error('Solicitante não informado') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!Array.isArray(itens) || itens.length <= 0) {
                const error = new Error('Itens não informados') as any;
                error.statusCode = 400;
                throw error;
            }

            //inicializando classes 
            const requisicao_dispensacao = new Requisicoes(db.connection);
            const requisicao_devolucao = new Requisicoes(db.connection);
            const itensRequisicao = new ItensRequisicao(db.connection);
            const setores = new Setores(db.connection);
            const locais = new Locais(db.connection);
            const depositos = new Depositos(db.connection);
            const medicamentos = new Medicamentos(db.connection);
            const estoques = new Estoque(db.connection);
            const demandas = new DemandasEspecificas(db.connection);
            const itens_demandas = new ItensDemandasEspecificas(db.connection);
            const geraNumeroReq = new GeraNumeroReq();

            await requisicao_dispensacao.BuscarPorNum(req_num_dispesa);

            if (!requisicao_dispensacao.found) {
                const error = new Error('Requisição de dispensação não encontrada') as any;
                error.statusCode = 404;
                throw error;
            }

            if (requisicao_dispensacao.req_num_devolucao) {
                const error = new Error('Requisição de dispensação já possui devolução cadastrada') as any;
                error.statusCode = 409;
                throw error;
            }

            await locais.BuscarPorId(requisicao_dispensacao.req_local_id || 0);
            if (!locais.found) {
                const error = new Error('Local não encontrado') as any;
                error.statusCode = 404;
                throw error;
            }

            await depositos.BuscarPorId(requisicao_dispensacao.req_dep_id || 0);

            if (!depositos.found) {
                const error = new Error('Depósito não encontrado') as any;
                error.statusCode = 404;
                throw error;
            }

            if (requisicao_dispensacao.req_set_id && requisicao_dispensacao.req_set_id > 0) {
                await setores.BuscarPorId(requisicao_dispensacao.req_set_id);

                if (!setores.found) {
                    const error = new Error('Setor não encontrado') as any;
                    error.statusCode = 404;
                    throw error;
                }
            }

            const req_num = `REQ${geraNumeroReq.proximoId()}`;

            await requisicao_devolucao.BuscarPorId(req_id);

            requisicao_devolucao.req_num = req_num;
            requisicao_devolucao.req_date = new Date(req_date);
            requisicao_devolucao.req_local_id = requisicao_dispensacao.req_local_id || 0;
            requisicao_devolucao.req_dep_id = requisicao_dispensacao.req_dep_id || 0;
            requisicao_devolucao.req_pac_id = requisicao_dispensacao.req_pac_id || null;
            requisicao_devolucao.req_set_id = requisicao_dispensacao.req_set_id || null;
            requisicao_devolucao.req_solicitado_por = solicitado_por;
            requisicao_devolucao.req_dt_solicitacao = new Date();
            requisicao_devolucao.req_status = 0;
            requisicao_devolucao.req_tip_id = tipo_req_id;
            requisicao_devolucao.req_observacao = observacao && `Devolução da requisição ${requisicao_dispensacao.req_num}`;

            await requisicao_devolucao.Salvar();

            requisicao_dispensacao.req_num_devolucao = req_num;
            requisicao_dispensacao.req_status = eStatus.Devolvido;

            await requisicao_dispensacao.Salvar();

            if (requisicao_dispensacao.req_pac_id && requisicao_dispensacao.req_pac_id > 0) {
                await demandas.BuscarPorPaciente(requisicao_dispensacao.req_pac_id);
            }

            for (const item of itens) {

                const validade = new Date(item.validade);

                if (Number.isNaN(validade.getTime())) {
                    const error = new Error('Validade do item inválida') as any;
                    error.statusCode = 400;
                    throw error;
                }

                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                validade.setHours(0, 0, 0, 0);

                if (validade < hoje) {
                    const error = new Error('Item com validade expirada') as any;
                    error.statusCode = 400;
                    throw error;
                }

                await medicamentos.BuscarPorId(Number(item.med_id || 0));

                if (!medicamentos.found) {
                    const error = new Error('Medicamento não encontrado') as any;
                    error.statusCode = 404;
                    throw error;
                }

                if (!item.lote || item.lote == '' || item.lote == null) {
                    const error = new Error(`Lote do item ${medicamentos.med_descr} não informado`) as any;
                    error.statusCode = 400;
                    throw error;
                }

                await estoques.BuscarPorItemEstoque(requisicao_dispensacao.req_dep_id || 0, Number(item.med_id || 0), item.lote);

                if (!estoques.found) {
                    const error = new Error(`Item ${medicamentos.med_descr} com lote ${item.lote},\n 
                        não encontrado no estoque do depósito ${depositos.dep_descr} `) as any;
                    error.statusCode = 404;
                    throw error;
                }

                await itensRequisicao.BuscarPorId(0);

                itensRequisicao.ite_med_id = Number(item.med_id || 0);
                itensRequisicao.ite_lote = item.lote;
                itensRequisicao.ite_qtde = item.qtde;
                itensRequisicao.ite_req_id = requisicao_devolucao.req_id;
                itensRequisicao.ite_validade = item.validade;

                await itensRequisicao.Salvar();

            }

            await db.Commit();

            resdata.msg = 'Requisição Devolvida com sucesso';
            resdata.data = { req_id: requisicao_devolucao.req_id, req_num: req_num };

        } catch (error: any) {

            await db.Rollback();

            applyControllerError(resdata, error, 'Controller Requisicoes');

        }

        void await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

    static async AprovarRequisicao(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: null };

        try {

            await db.Connect();
            await db.Begin();

            const req_id = Number(req.params.req_id || 0);
            const usuario_logado = String(req.body?.user || req.body?.user_aprov || req.body?.usuario || '').trim();

            if (!req_id || req_id <= 0) {
                const error = new Error('ID da requisição não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!usuario_logado || usuario_logado == '') {
                const error = new Error('Usuário logado não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            // Instanciando as classes
            const requisicoes = new Requisicoes(db.connection);
            const itens_requisicao = new ItensRequisicao(db.connection);
            const estoque = new Estoque(db.connection);
            const demandas = new DemandasEspecificas(db.connection);
            const itens_demandas = new ItensDemandasEspecificas(db.connection);
            const controle_ddu = new ControleDDU(db.connection);
            const itens_ddu = new ItensDDU(db.connection);
            const movimentacoes = new Movimentacoes(db.connection);

            await requisicoes.BuscarPorId(req_id);

            if (!requisicoes.found) {
                const error = new Error(`Requisição não encontrada id ${req_id}`) as any;
                error.statusCode = 404;
                throw error;
            }

            if (Number(requisicoes.req_status) !== eStatus.Pendente) {
                const error = new Error('Requisição não está pendente para aprovação.') as any;
                error.statusCode = 400;
                throw error;
            }

            const itens = await itens_requisicao.ListarItensRequisicoes(req_id);

            if (!Array.isArray(itens) || itens.length === 0) {
                const error = new Error('Requisição sem itens para aprovação.') as any;
                error.statusCode = 400;
                throw error;
            }

            await demandas.BuscarPorPaciente(Number(requisicoes.req_pac_id));

            const gerarDdu = settings.local_id === Number(requisicoes.req_local_id);
            const requisicao_dispensacao = requisicoes.req_tip_id !== settings.tipo_req_id_devolucao;

            if (gerarDdu) {

                if (requisicao_dispensacao) {

                    await controle_ddu.BuscarPorReqNum(String(requisicoes.req_num));

                    controle_ddu.cdd_date = new Date();
                    controle_ddu.cdd_req_num = String(requisicoes.req_num).toLocaleUpperCase();
                    controle_ddu.cdd_pac_id = requisicoes.req_pac_id;
                    controle_ddu.cdd_status = 0;

                    await controle_ddu.Salvar();

                }
            }

            for (const item of itens) {

                const itemQtde = Number(item.ite_qtde);
                const itemMedId = Number(item.ite_med_id);
                const itemLote = String(item.ite_lote || '');

                await estoque.BuscarPorItemEstoqueForUpdate(Number(requisicoes.req_dep_id), itemMedId, itemLote);

                if (!estoque.found) {
                    const error = new Error(`Item ${item.med_descr} com lote ${itemLote}, não encontrado no estoque`) as any;
                    error.statusCode = 404;
                    throw error;
                }

                if (estoque.est_saldo_disponivel < itemQtde && requisicao_dispensacao) {
                    const error = new Error('Saldo indisponível para esse medicamento ou material hospitalar') as any;
                    error.statusCode = 409;
                    throw error;
                }

                requisicao_dispensacao ? estoque.est_saldo_disponivel += itemQtde : estoque.est_saldo_disponivel -= itemQtde;

                await estoque.Salvar();

                await movimentacoes.BuscarPorId(0);

                movimentacoes.mov_date = new Date();
                movimentacoes.mov_tipo = requisicao_dispensacao ? "REQ" : "DEV";
                movimentacoes.mov_descr = requisicao_dispensacao ? `Saída por requisição: ${requisicoes.req_num}` : `Devolução por requisição: ${requisicoes.req_num}`;
                movimentacoes.mov_qtde = itemQtde;
                movimentacoes.mov_med_id = itemMedId;
                movimentacoes.mov_med_lote = itemLote;
                movimentacoes.mov_documento = requisicoes.req_num;
                movimentacoes.mov_user = usuario_logado;

                await movimentacoes.Salvar();

                if (demandas.found) {

                    await itens_demandas.BuscaItemDemanda(demandas.dem_id, itemMedId);

                    if (itens_demandas.found) {

                        if (itens_demandas.ite_dem_med_qtde < itemQtde && requisicao_dispensacao) {
                            const error = new Error('Saldo indisponivel em Demanda Especifica.');
                            error.statusCode = 404;
                            throw error;
                        }

                        requisicao_dispensacao ? itens_demandas.ite_dem_med_qtde -= itemQtde : itens_demandas.ite_dem_med_qtde += itemQtde;

                        await itens_demandas.Salvar();

                    }

                }

                if (gerarDdu) {

                    if (requisicao_dispensacao) {

                        await itens_ddu.BuscarPorId(0);

                        itens_ddu.ite_dd_med_id = itemMedId;
                        itens_ddu.ite_dd_lote = itemLote;
                        itens_ddu.ite_dd_qtde = itemQtde;
                        itens_ddu.ite_dd_qtde_retorno = 0;
                        itens_ddu.ite_dd_req_num = requisicoes.req_num;

                        await itens_ddu.Salvar();

                    } else {

                        await controle_ddu.BuscarPorReqNum(String(requisicoes.req_num));

                        if (controle_ddu.found) {

                            await itens_ddu.BuscarPorRequisicao(String(requisicoes.req_num), Number(item.med_id), itemLote);

                            if (itens_ddu.found) {

                                itens_ddu.ite_dd_qtde -= itemQtde;

                                await itens_ddu.Salvar();

                                if (itens_ddu.ite_dd_qtde <= 0) {
                                    await itens_ddu.Excluir();
                                }

                            }

                        }

                    }

                }
            }

            requisicoes.req_dt_aprovacao = new Date();
            requisicoes.req_aprovado_por = usuario_logado;
            requisicoes.req_status = 1;

            await requisicoes.Salvar();

            await db.Commit();

            resdata.msg = 'Requisição aprovada com sucesso';
            resdata.data = { req_id: requisicoes.req_id };

        } catch (error: any) {

            await db.Rollback();

            applyControllerError(resdata, error, 'Controller Requisicoes');

        }

        void await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

    static async AtualizarItem(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} };

        try {
            await db.Connect();
            await db.Begin();

            const ite_id = Number(req.params.ite_id || 0);
            const ite_qtde = Number(req.body.ite_qtde || 0);

            if (!ite_id || ite_id <= 0) {
                const error = new Error('ID do item inválido.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!Number.isFinite(ite_qtde) || ite_qtde <= 0) {
                const error = new Error('Quantidade do item deve ser maior que zero.') as any;
                error.statusCode = 400;
                throw error;
            }

            const itensRequisicao = new ItensRequisicao(db.connection);
            const requisicoes = new Requisicoes(db.connection);

            await itensRequisicao.BuscarPorId(ite_id);

            if (!itensRequisicao.found || !itensRequisicao.ite_req_id) {
                const error = new Error('Item da requisição não encontrado.') as any;
                error.statusCode = 404;
                throw error;
            }

            await requisicoes.BuscarPorId(Number(itensRequisicao.ite_req_id));

            if (!requisicoes.found) {
                const error = new Error('Requisição não encontrada.') as any;
                error.statusCode = 404;
                throw error;
            }

            if (Number(requisicoes.req_status) !== 0) {
                const error = new Error('Somente itens de requisições pendentes podem ser alterados.') as any;
                error.statusCode = 400;
                throw error;
            }

            itensRequisicao.ite_qtde = ite_qtde;

            await itensRequisicao.Salvar();
            await db.Commit();

            resdata.msg = 'Item da requisição atualizado com sucesso.';
            resdata.data = { ite_id, ite_qtde };

        } catch (error: any) {
            await db.Rollback();
            applyControllerError(resdata, error, 'Controller_Requisicoes.AtualizarItem');
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

    static async ExcluirItem(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} };

        try {
            await db.Connect();
            await db.Begin();

            const ite_id = Number(req.params.ite_id || 0);

            if (!ite_id || ite_id <= 0) {
                const error = new Error('ID do item inválido.') as any;
                error.statusCode = 400;
                throw error;
            }

            const itensRequisicao = new ItensRequisicao(db.connection);
            const requisicoes = new Requisicoes(db.connection);

            await itensRequisicao.BuscarPorId(ite_id);

            if (!itensRequisicao.found || !itensRequisicao.ite_req_id) {
                const error = new Error('Item da requisição não encontrado.') as any;
                error.statusCode = 404;
                throw error;
            }

            const req_id = Number(itensRequisicao.ite_req_id);

            await requisicoes.BuscarPorId(req_id);

            if (!requisicoes.found) {
                const error = new Error('Requisição não encontrada.') as any;
                error.statusCode = 404;
                throw error;
            }

            if (Number(requisicoes.req_status) !== 0) {
                const error = new Error('Somente itens de requisições pendentes podem ser excluídos.') as any;
                error.statusCode = 400;
                throw error;
            }

            const totalItens = await itensRequisicao.ContarPorRequisicao(req_id);

            if (totalItens <= 1) {
                const error = new Error('A requisição deve manter pelo menos um item.') as any;
                error.statusCode = 400;
                throw error;
            }

            await itensRequisicao.Excluir(ite_id);
            await db.Commit();

            resdata.msg = 'Item da requisição excluído com sucesso.';
            resdata.data = { ite_id };

        } catch (error: any) {
            await db.Rollback();
            applyControllerError(resdata, error, 'Controller_Requisicoes.ExcluirItem');
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

    static async Imprimir(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');

        try {

            await db.Connect();

            const req_id = Number(req.params.req_id || 0);

            if (!req_id || req_id <= 0) {
                const error = new Error('ID da requisição não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            const requisicoes = new Requisicoes(db.connection);
            const itensRequisicao = new ItensRequisicao(db.connection);

            const requisicao = await requisicoes.BuscarDadosImpressao(req_id);

            if (!requisicao) {
                const error = new Error('Requisição não encontrada') as any;
                error.statusCode = 404;
                throw error;
            }

            const itens = await itensRequisicao.ListarItensParaImpressao(req_id);
            const numeroDocumento = Controller_Requisicoes.formatText(requisicao.req_num, String(req_id));
            const paciente = Controller_Requisicoes.formatText(requisicao.nom_paciente);
            const nomeUsual = Controller_Requisicoes.formatText(requisicao.nom_social, '');
            const observacao = Controller_Requisicoes.formatText(requisicao.req_observacao, '');
            const itemRows = itens.map((item) => [
                { text: Controller_Requisicoes.formatText(item.ite_med_id, ''), style: 'tableCellCenter' },
                { text: Controller_Requisicoes.formatText(item.med_descr, ''), style: 'tableCell' },
                { text: Controller_Requisicoes.formatText(item.med_und, ''), style: 'tableCellCenter' },
                { text: Controller_Requisicoes.formatText(item.ite_lote, ''), style: 'tableCellCenter' },
                { text: Controller_Requisicoes.formatDate(item.ite_validade), style: 'tableCellCenter' },
                { text: Controller_Requisicoes.formatQuantity(item.ite_qtde, ''), style: 'tableCellCenter' },
            ]);

            const minimumPrintableRows = 12;

            while (itemRows.length < minimumPrintableRows) {
                itemRows.push([
                    { text: '', style: 'tableCellCenter' },
                    { text: '', style: 'tableCell' },
                    { text: '', style: 'tableCellCenter' },
                    { text: '', style: 'tableCellCenter' },
                    { text: '', style: 'tableCellCenter' },
                    { text: '', style: 'tableCellCenter' },
                ]);
            }

            const tableBody = [
                [
                    { text: 'CODIGO', style: 'tableHeader' },
                    { text: 'MEDICAMENTO', style: 'tableHeader' },
                    { text: 'UND', style: 'tableHeader' },
                    { text: 'LOTE', style: 'tableHeader' },
                    { text: 'VALIDADE', style: 'tableHeader' },
                    { text: 'QTDE', style: 'tableHeader' },
                ],
                ...itemRows,
            ];

            const signatureBlock = {
                margin: [0, 8, 0, 0],
                table: {
                    widths: ['*', '*'],
                    body: [
                        [
                            { text: 'RECEBIDO POR:', style: 'signatureHeader' },
                            { text: 'FARMACIA', style: 'signatureHeader' },
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
                    title: `Comprovante da Requisicao ${numeroDocumento}`,
                    author: 'Farmacia Ambulatorial',
                    subject: 'Comprovante da requisicao',
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
                                        { text: 'Comprovante da Requisicao', style: 'reportTitle', margin: [0, 3, 0, 0] },
                                        { text: 'Documento operacional de dispensacao nominal', style: 'reportSubtitle', margin: [0, 2, 0, 0] },
                                    ],
                                },
                                {
                                    width: 170,
                                    alignment: 'right',
                                    stack: [
                                        { text: numeroDocumento, style: 'headerBadge' },
                                        { text: `Pagina ${currentPage} de ${pageCount}`, style: 'headerMeta', margin: [0, 8, 0, 0] },
                                    ],
                                },
                            ],
                        },
                        {
                            canvas: [
                                { type: 'line', x1: 0, y1: 12, x2: Controller_Requisicoes.PAGE_CONTENT_WIDTH, y2: 12, lineWidth: 1, lineColor: '#d7e0ea' },
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
                                                { text: 'Paciente', style: 'headerFlowLabel' },
                                                { text: paciente, style: 'headerFlowValue', margin: [0, 4, 0, 0] },
                                                nomeUsual ? { text: `Nome usual: ${nomeUsual}`, style: 'headerFlowMuted', margin: [0, 3, 0, 0] } : { text: '', style: 'headerFlowMuted' },
                                            ],
                                        },
                                        {
                                            stack: [
                                                { text: 'Origem', style: 'headerFlowLabel' },
                                                { text: Controller_Requisicoes.formatText(requisicao.local), style: 'headerFlowValue', margin: [0, 4, 0, 0] },
                                                { text: `Deposito: ${Controller_Requisicoes.formatText(requisicao.deposito)}`, style: 'headerFlowMuted', margin: [0, 3, 0, 0] },
                                            ],
                                        },
                                        {
                                            stack: [
                                                { text: 'Requisicao', style: 'headerFlowLabel' },
                                                { text: Controller_Requisicoes.formatDate(requisicao.req_date), style: 'headerFlowValue', margin: [0, 4, 0, 0] },
                                                { text: `Tipo: ${Controller_Requisicoes.formatText(requisicao.tipo)}`, style: 'headerFlowMuted', margin: [0, 3, 0, 0] },
                                            ],
                                        },
                                    ],
                                ],
                            },
                            layout: {
                                fillColor: () => '#f8fbfc',
                                hLineWidth: () => 1,
                                vLineWidth: () => 1,
                                hLineColor: () => '#dce7ef',
                                vLineColor: () => '#dce7ef',
                                paddingLeft: (index: number) => index === 0 ? 14 : 12,
                                paddingRight: (index: number, node: any) => index === node.table.widths.length - 1 ? 14 : 12,
                                paddingTop: () => 10,
                                paddingBottom: () => 10,
                            },
                        },
                    ],
                }),
                footer: (currentPage: number, pageCount: number) => ({
                    margin: [24, 0, 24, 14],
                    columns: [
                        { text: 'Sistema de Farmacia Ambulatorial', style: 'footerMeta' },
                        { text: `Comprovante ${numeroDocumento}`, style: 'footerMeta', alignment: 'center' },
                        { text: `Pagina ${currentPage}/${pageCount}`, style: 'footerMeta', alignment: 'right' },
                    ],
                }),
                content: [
                    {
                        margin: [0, 0, 0, 12],
                        table: {
                            widths: ['*', '*', '*'],
                            body: [[
                                {
                                    stack: [
                                        { text: 'Solicitado por', style: 'sectionLabel' },
                                        { text: Controller_Requisicoes.formatText(requisicao.req_solicitado_por), style: 'metaValue', margin: [0, 5, 0, 0] },
                                    ],
                                },
                                {
                                    stack: [
                                        { text: 'Solicitado em', style: 'sectionLabel' },
                                        { text: Controller_Requisicoes.formatDateTime(requisicao.req_dt_solicitacao), style: 'metaValue', margin: [0, 5, 0, 0] },
                                    ],
                                },
                                {
                                    stack: [
                                        { text: 'Status', style: 'sectionLabel' },
                                        { text: Number(requisicao.req_status) === 1 ? 'Aprovada' : 'Pendente', style: 'metaValue', margin: [0, 5, 0, 0] },
                                    ],
                                },
                            ]],
                        },
                        layout: {
                            fillColor: () => '#ffffff',
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                            hLineColor: () => '#dce7ef',
                            vLineColor: () => '#dce7ef',
                            paddingLeft: () => 12,
                            paddingRight: () => 12,
                            paddingTop: () => 14,
                            paddingBottom: () => 28,
                        },
                    },
                    {
                        table: {
                            headerRows: 1,
                            dontBreakRows: true,
                            keepWithHeaderRows: 1,
                            widths: [42, '*', 34, 66, 58, 48],
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
                        margin: [0, 10, 0, 0],
                        table: {
                            widths: ['*'],
                            heights: () => 100,
                            body: [[
                                {
                                    stack: [
                                        { text: 'Observacao', style: 'sectionLabel' },
                                        { text: Controller_Requisicoes.formatText(observacao, '-'), style: 'bodyText', margin: [0, 6, 0, 0] },
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
                            paddingTop: () => 10,
                            paddingBottom: () => 10,
                        },
                    },
                    signatureBlock,
                ],
                styles: {
                    eyebrow: { fontSize: 8, bold: true, color: '#0f766e' },
                    reportTitle: { fontSize: 18, bold: true, color: '#0f172a' },
                    reportSubtitle: { fontSize: 9, color: '#64748b' },
                    headerBadge: { fontSize: 8, bold: true, color: '#174a5a', fillColor: '#e6f4f1', alignment: 'right' },
                    headerMeta: { fontSize: 9, color: '#475569' },
                    headerFlowLabel: { fontSize: 7, bold: true, color: '#64748b' },
                    headerFlowValue: { fontSize: 8, color: '#0f172a' },
                    headerFlowMuted: { fontSize: 7.5, color: '#64748b' },
                    sectionLabel: { fontSize: 8, bold: true, color: '#0f766e' },
                    bodyText: { fontSize: 9, color: '#1f2937', lineHeight: 1.25 },
                    metaValue: { fontSize: 10, bold: true, color: '#0f172a' },
                    tableHeader: { fontSize: 8, bold: true, color: '#ffffff', alignment: 'center', margin: [0, 1, 0, 0] },
                    tableCell: { fontSize: 8.5, color: '#1f2937' },
                    tableCellCenter: { fontSize: 8.5, color: '#334155', alignment: 'center' },
                    signatureHeader: { fontSize: 9, bold: true, color: '#174a5a', alignment: 'center' },
                    signatureLabel: { fontSize: 8, bold: true, color: '#64748b' },
                    signatureLine: { fontSize: 8.5, color: '#0f172a' },
                    footerMeta: { fontSize: 8, color: '#64748b' },
                },
                defaultStyle: {
                    font: 'Roboto',
                    fontSize: 9,
                    color: '#1f2937',
                },
            };

            const pdfBuffer = await Controller_Requisicoes.buildPdfBuffer(docDefinition);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename=\"comprovante-requisicao-${numeroDocumento}.pdf\"`,
            });
            res.status(200).send(pdfBuffer);

        } catch (error: any) {
            const resdata: iresdata = { err: 0, msg: '', status: 200, data: {} };

            applyControllerError(resdata, error, 'Controller Requisicoes - Imprimir');
            res.status(resdata.status).json(resdata);

        } finally {
            await db.Disconnect();
        }

    }

    static async ReprovarRequisicao(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: [] };

        try {

            await db.Connect();

            const req_id = Number(req.body.req_id || 0);
            const user_logado = String(req.body.user || '').trim();
            const justificativa = String(req.body.justificativa || '').trim();

            if (!req_id) {
                const error = new Error('ID da requisição invalido.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!user_logado) {
                const error = new Error('Usuário invalido.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!justificativa) {
                const error = new Error('Justificativa invalida.') as any;
                error.statusCode = 400;
                throw error;
            }

            const requisicoes = new Requisicoes(db.connection);

            await requisicoes.BuscarPorId(req_id);

            if (!requisicoes.found) {
                const error = new Error('ID da Requisição não encontrada.') as any;
                error.statusCode = 404;
                throw error;
            }

            requisicoes.req_status = 2
            requisicoes.req_jus_reprovacao = justificativa.toLocaleUpperCase();
            requisicoes.req_dt_reprovacao = new Date();
            requisicoes.req_reprovado_por = user_logado;

            await requisicoes.Salvar();

            resdata.msg = `ID ${requisicoes.req_num} da Requisição Reprovada.`;
            resdata.data = requisicoes.req_num;

        } catch (error) {
            applyControllerError(resdata, error, 'Controller_Requisicoes.ReprovarRequisicao');
        }

        await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async BuscarRequisicaoParaDevolucao(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');

        const resdata: iresdata = { err: 0, msg: '', status: 200, data: [] };

        try {

            await db.Connect();

            const req_num = String(req.params.req_num || '').trim();

            if (!req_num) {
                const error = new Error('Numero da requisição invalido.') as any;
                error.statusCode = 400;
                throw error;
            }

            const requisicoes = new Requisicoes(db.connection);
            const setores = new Setores(db.connection);
            const itens_requisicao = new ItensRequisicao(db.connection);

            let dados_req = await requisicoes.BuscarPorNum(req_num);

            if (!requisicoes.found) {
                const error = new Error('Requisição não encontrada.') as any;
                error.statusCode = 404;
                throw error;
            }

            if (requisicoes.req_status !== eStatus.Aprovada) {
                const error = new Error('Requisição não pode ser devolvida, somente requisições aprovadas podem ser devolvidas.') as any;
                error.statusCode = 400;
                throw error;
            }

            const itens = await itens_requisicao.ListarItensRequisicoes(requisicoes.req_id);

            if (!itens || itens.length === 0) {
                const error = new Error('Não foi possível encontrar os itens da requisição.') as any;
                error.statusCode = 404;
                throw error;
            }

            if (requisicoes.req_pac_id) {

                const sql = "SELECT num_paciente,nom_paciente FROM fsph_ambulatorio.tb_pacientes WHERE num_paciente = :num_pac";

                const [dados_paciente] = await db.connection.query(sql, { num_pac: requisicoes.req_pac_id }) as RowDataPacket[];

                dados_req.nome_paciente = dados_paciente[0].nom_paciente ?? '';
                dados_req.num_paciente = dados_paciente[0].num_paciente ?? '';

            } else {

                const dados_setor = await setores.BuscarPorId(requisicoes.req_set_id || 0);

                dados_req.nome_setor = dados_setor.set_nome ?? '';
                dados_req.id_setor = dados_setor.set_id ?? 0;

            }

            resdata.data = { requisicoes: dados_req, itens: itens };

        } catch (error) {
            applyControllerError(resdata, error, 'Controller_Requisicoes.BuscarRequisicaoParaDevolucao');
        }

        await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

}
