import { Request, Response } from "express";
import Database, { iDatabase } from "../connections/dbconn.js";
import Entradas from "../model/dao_entradas.js";
import Estoque from "../model/dao_estoque.js";
import ItensEntradas from "../model/dao_itens_entradas.js";
import Medicamentos from "../model/dao_medicamentos.js";
import Movimentacoes from "../model/dao_movimentacoes.js";
import DemandasEspecificas from "../model/dao_demanda_especificas.js";
import ItensDemandasEspecificas from "../model/dao_itens_demandas_especificas.js";
import Depositos from "../model/dao_depositos.js";
import { iresdata } from "./interface_controllers.js";
import { applyControllerError } from "../utils/controllerError.js";
import GeraNumeroReq from "../utils/GeraNumero.js";

export default class Controller_Entradas {

    static async ListarTodos(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            await db.Connect();

            const pesq = String(req.params.pesq || '*');
            const data_inicio = String(req.params.data_inicio);
            const data_fim = String(req.params.data_fim);

            if (Number.isNaN(new Date(data_inicio).getTime())) {
                const error = new Error('Data de início inválida') as any;
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(new Date(data_fim).getTime())) {
                const error = new Error('Data de fim inválida') as any;
                error.statusCode = 400;
                throw error
            }

            if (data_inicio > data_fim) {
                const error = new Error('Data de início deve ser menor que a data de fim')
                error.statusCode = 400;
                throw error;
            }

            const entradas = new Entradas(db.connection);

            const result = await entradas.ListarPeriodo(pesq, data_inicio, data_fim);

            resdata.data = result;

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);
    }

    static async BuscarPorId(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            await db.Connect();

            const ent_id = Number(req.params.ent_id || 0);

            if (ent_id <= 0) {
                const error = new Error('ID da entrada inválido');
                error.statusCode = 400;
                throw error;
            }

            const entradas = new Entradas(db.connection);
            const itensEntradas = new ItensEntradas(db.connection);

            const entrada = await entradas.BuscarPorId(ent_id);

            if (!entradas.found) {
                const error = new Error('Entrada não encontrada.');
                error.statusCode = 404;
                throw error;
            }

            const itens = await itensEntradas.ListarItens(ent_id);
            const quantidade_total = itens.reduce((total, item) => total + Number(item.quantidade || 0), 0);

            resdata.data = {
                ...entrada,
                itens,
                total_itens: itens.length,
                quantidade_total
            };

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();
        return res.status(resdata.status).json(resdata);
    }

    static async Salvar(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            await db.Connect();
            await db.Begin();

            //recebe os dados do body
            const ent_id = Number(req.body.ent_id || 0);
            const ent_date = new Date(req.body.ent_date);
            let ent_doc = String(req.body.ent_doc || '');
            const ent_doc_informado = ent_doc.trim().length > 0;
            const ent_for_id = Number(req.body.ent_for_id || 0);
            const ent_dep_id = Number(req.body.ent_dep_id || 0);
            const ent_user_digit = String(req.body.ent_user_digit || null);
            const itens = Array.isArray(req.body.itens) ? req.body.itens : null

            //validação dos dados recebidos
            if (Number.isNaN(ent_date.getTime())) {
                const error = new Error('Data da entrada é obrigatória.');
                error.statusCode = 400;
                throw error;
            }

            if (ent_for_id === 0) {
                const error = new Error('Fornecedor não Informado.');
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

            //gerar número da entrada se não for informado
            if (!ent_doc) {
                const geraNumero = new GeraNumeroReq();
                ent_doc = `ENT${geraNumero.proximoId()}`;
            }

            // instanciação dos models
            const entradas = new Entradas(db.connection);
            const itensEntradas = new ItensEntradas(db.connection);
            const medicamentos = new Medicamentos(db.connection);

            // busca a entrada
            void await entradas.BuscarPorId(ent_id);

            // atribui os valores à entrada
            entradas.ent_date = ent_date;
            entradas.ent_doc = ent_doc;
            entradas.ent_dep_id = ent_dep_id;
            entradas.ent_for_id = ent_for_id;
            entradas.ent_status = 0;
            entradas.ent_user_digit = ent_user_digit;
            entradas.ent_dt_digit = new Date();

            //salvar a entrada
            await entradas.Salvar();

            //salvar os itens da entrada
            for (const item of itens) {

                //recebe os dados do item
                const itemMedId = Number(item.ent_med_id || 0);
                const itemLote = String(item.ent_lote || '');
                const itemLoteValidade = item.ent_lote_validade;
                const itemQtde = Number(item.ent_qtde || 0);

                // busca o medicamento
                await medicamentos.BuscarPorId(itemMedId);

                if (!medicamentos.found) {
                    const error = new Error(`Medicamento ${itemMedId} não encontrado.`);
                    error.statusCode = 404;
                    throw error;
                }

                // busca o item de entrada
                await itensEntradas.BuscarPorId(0)

                // atribui os valores ao item
                itensEntradas.ite_ent_id = entradas.ent_id;
                itensEntradas.ite_ent_med_id = itemMedId;
                itensEntradas.ite_ent_lote = itemLote;
                itensEntradas.ite_ent_lote_validade = itemLoteValidade;
                itensEntradas.ite_ent_qtde = itemQtde;

                //salvar o item de entrada
                await itensEntradas.Salvar();

            }

            //commita as alterações
            await db.Commit();

            //retorna os dados da entrada
            resdata.msg = 'Entrada salva com sucesso';
            resdata.data = {
                ent_id: entradas.ent_id,
                ent_doc: entradas.ent_doc,
                ent_doc_auto_generated: !ent_doc_informado,
                total_itens: itens.length
            };
        } catch (error: any) {
            await db.Rollback();
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();
        return res.status(resdata.status).json(resdata);
    }

    static async ListarItens(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        }

        try {

            await db.Connect();

            const ent_id = Number(req.params.ent_id || 0);

            if (ent_id <= 0) {
                const error = new Error('ID da entrada inválido');
                error.statusCode = 400;
                throw error;
            }

            const itensEntradas = new ItensEntradas(db.connection);

            const result = await itensEntradas.ListarItens(ent_id);

            resdata.data = result;

        } catch (error) {
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();
        return res.status(resdata.status).json(resdata);

    }

    static async AtualizarItem(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        }

        try {

            await db.Connect();
            await db.Begin();

            //recebe os dados do body
            const ite_id = Number(req.params.ite_id || 0);
            const ent_lote = String(req.body.ent_lote || '').trim().toLocaleUpperCase('pt-BR');
            const ent_lote_validade = new Date(req.body.ent_lote_validade);
            const ent_qtde = Number(req.body.ent_qtde || 0);

            //validação dos dados recebidos
            if (ite_id <= 0) {
                const error = new Error('ID do item inválido');
                error.statusCode = 400;
                throw error;
            }

            if (!ent_lote) {
                const error = new Error('Lote do item é obrigatório.');
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(ent_lote_validade.getTime())) {
                const error = new Error('Validade do item é obrigatória.');
                error.statusCode = 400;
                throw error;
            }

            if (!Number.isFinite(ent_qtde) || ent_qtde <= 0) {
                const error = new Error('Quantidade do item deve ser maior que zero.');
                error.statusCode = 400;
                throw error;
            }

            //instanciação dos models
            const itensEntradas = new ItensEntradas(db.connection);
            const entradas = new Entradas(db.connection);

            // busca o item de entrada
            await itensEntradas.BuscarPorId(ite_id);

            if (!itensEntradas.found || !itensEntradas.ite_ent_id) {
                const error = new Error('Item da entrada não encontrado.');
                error.statusCode = 404;
                throw error;
            }

            //busca a entrada
            await entradas.BuscarPorId(Number(itensEntradas.ite_ent_id));

            if (!entradas.found) {
                const error = new Error('Entrada vinculada ao item não encontrada.');
                error.statusCode = 404;
                throw error;
            }

            if (Number(entradas.ent_status || 0) === 1) {
                const error = new Error('Não é permitido editar item de entrada aprovada.');
                error.statusCode = 400;
                throw error;
            }

            //atribui os valores ao item de entrada
            itensEntradas.ite_ent_lote = ent_lote;
            itensEntradas.ite_ent_lote_validade = ent_lote_validade;
            itensEntradas.ite_ent_qtde = ent_qtde;

            //salva o item de entrada
            await itensEntradas.Salvar();

            //commita as alterações
            await db.Commit();

            //retorna os dados do item
            resdata.msg = 'Item da entrada atualizado com sucesso';
            resdata.data = {
                ite_id: itensEntradas.ite_id,
                ite_ent_id: itensEntradas.ite_ent_id,
                ite_ent_lote: itensEntradas.ite_ent_lote,
                ite_ent_lote_validade: itensEntradas.ite_ent_lote_validade,
                ite_ent_qtde: itensEntradas.ite_ent_qtde,
            };

        } catch (error) {
            await db.Rollback();
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();
        return res.status(resdata.status).json(resdata);

    }

    static async ListarEntradasNaoAprovados(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        }

        try {

            await db.Connect();

            const pesq = String(req.params.pesq || '*');
            const dep_id = Number(req.params.dep_id || 0)
            const data_inicio = req.params.data_inicio;
            const data_fim = req.params.data_fim;

            if (dep_id === 0) {
                const error = new Error('Deposito inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(new Date(String(data_inicio)).getTime())) {
                const error = new Error('Data de início inválida') as any;
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(new Date(String(data_fim)).getTime())) {
                const error = new Error('Data de fim inválida') as any;
                error.statusCode = 400;
                throw error
            }

            if (new Date(String(data_inicio)) > new Date(String(data_fim))) {
                const error = new Error('Data de início deve ser menor que a data de fim')
                error.statusCode = 400;
                throw error;
            }

            const entradas = new Entradas(db.connection);

            const result = await entradas.ListarEntradasNaoAprovados(pesq, String(data_inicio), String(data_fim), dep_id);

            resdata.data = result;

        } catch (error) {
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);
    }

    static async AprovarEntradas(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        }

        try {

            await db.Connect();
            await db.Begin();

            const ent_id = Number(req.body.ent_id || 0);
            const user_aprov = String(req.body.user_aprov || null);

            if (user_aprov === null || user_aprov.trim().length === 0) {
                const error = new Error('Usuário aprovador é obrigatório.');
                error.statusCode = 400;
                throw error;
            }

            if (ent_id <= 0) {
                const error = new Error('ID da entrada inválido');
                error.statusCode = 400;
                throw error;
            }

            const entradas = new Entradas(db.connection);
            const estoque = new Estoque(db.connection);
            const itensEntradas = new ItensEntradas(db.connection);
            const movimentacoes = new Movimentacoes(db.connection);
            const depositos = new Depositos(db.connection);

            // Verificar se a entrada existe e está pendente e salvar dados de aprovação
            await entradas.BuscarPorId(ent_id);

            if (!entradas.found) {
                const error = new Error('Entrada não encontrada.');
                error.statusCode = 404;
                throw error;
            }

            if (entradas.ent_status === 1) {
                const error = new Error('Entrada já aprovada.');
                error.statusCode = 400;
                throw error;
            }

            // Atualizar estoque para cada item da entrada
            const itens = await itensEntradas.ListarItens(ent_id);

            for (const item of itens) {

                const est_dep_id = entradas.ent_dep_id || 0;
                const est_med_id = item.id_medicacao || 0;
                const est_lote = item.lote || '';
                const est_validade = item.validade || null;
                const est_qtde = item.quantidade || 0;

                await depositos.BuscarPorId(est_dep_id);

                if (!depositos.found) {
                    const error = new Error(`Depósito ${est_dep_id} não encontrado.`);
                    error.statusCode = 404;
                    throw error;
                }

                // Buscar o item de estoque correspondente para atualizar ou criar
                await estoque.BuscarPorItemEstoque(est_dep_id, est_med_id, est_lote);

                if (estoque.found) {

                    estoque.est_saldo_disponivel += est_qtde;
                    estoque.est_validade = est_validade;

                } else {

                    estoque.est_dep_id = est_dep_id;
                    estoque.est_med_id = est_med_id;
                    estoque.est_lote = est_lote;
                    estoque.est_validade = est_validade;
                    estoque.est_saldo_disponivel = est_qtde;
                    estoque.est_saldo_bloqueado = 0;

                }

                await estoque.Salvar();

                // Registrar movimentação de entrada
                await movimentacoes.BuscarPorId(0);

                movimentacoes.mov_date = new Date();
                movimentacoes.mov_tipo = 'ENT';
                movimentacoes.mov_descr = `Entrada medicamento para o depósito: ${depositos.dep_descr}`;
                movimentacoes.mov_qtde = est_qtde;
                movimentacoes.mov_med_id = est_med_id;
                movimentacoes.mov_med_lote = est_lote;
                movimentacoes.mov_documento = entradas.ent_doc;
                movimentacoes.mov_user = user_aprov;

                await movimentacoes.Salvar();

            }

            // Atualizar status da entrada para aprovada e salvar dados de aprovação
            entradas.ent_status = 1;
            entradas.ent_user_aprov = user_aprov;
            entradas.ent_dt_aprov = new Date();

            await entradas.Salvar();

            await db.Commit();

            resdata.msg = 'Entrada aprovada com sucesso';


        } catch (error) {
            await db.Rollback();
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();
        return res.status(resdata.status).json(resdata);
    }

    static async ExcluirEntradas(req: Request, res: Response) {

        const db: iDatabase = new Database('fsph_farmacia');
        const resdata: iresdata = { err: 0, msg: '', status: 200, data: [] };

        try {

            await db.Connect();
            await db.Begin();

            const ent_id = Number(req.params.ent_id || 0);

            if (ent_id <= 0) {
                const error = new Error('ID da entrada inválido');
                error.statusCode = 400;
                throw error;
            }

            const entradas = new Entradas(db.connection);
            const itensEntradas = new ItensEntradas(db.connection);
            const demandasEspecificas = new DemandasEspecificas(db.connection);
            const itensDemandasEspecificas = new ItensDemandasEspecificas(db.connection);

            await entradas.BuscarPorId(ent_id);

            if (!entradas.found) {
                const error = new Error('Entrada não encontrada.');
                error.statusCode = 404;
                throw error;
            }

            if (entradas.ent_status === 1) {
                const error = new Error('Nao e permitido excluir uma entrada aprovada.');
                error.statusCode = 400;
                throw error;
            }

            await demandasEspecificas.BuscarPorPaciente(entradas.ent_pac_id || 0);

            if (demandasEspecificas.found) {
                await db.connection.execute(
                    `DELETE FROM tb_itens_demandas_especificas WHERE ite_ent_id = :ent_id`,
                    { ent_id: entradas.ent_id }
                );
            }

            await itensEntradas.ExcluirPorEntrada(ent_id);
            await entradas.Excluir(ent_id);

            await db.Commit();

            resdata.msg = 'Entrada excluida com sucesso';

        } catch (error) {
            await db.Rollback();
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();
        return res.status(resdata.status).json(resdata);
    }
}
