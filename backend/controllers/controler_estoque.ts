import Database, {iDatabase} from "../connections/dbconn.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";
import { iresdata } from "./interface_controllers.js";
import Movimentacoes from "../model/dao_movimentacoes.js";
import Depositos from "../model/dao_depositos.js";
import Estoque from "../model/dao_estoque.js";

// Expoe consultas e ajustes de estoque controlados por deposito, medicamento e lote.
export default class Controller_Estoque {

    static async Listar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            void await db.Connect();

            const pesq = String(req.params.pesq || '*');
            const dep_id = Number(req.params.dep_id) || 0;
            const med_tipo_codigo = String(req.params.med_tipo_codigo || '');

            if (!pesq || !dep_id || !med_tipo_codigo) {
                const error = new Error('Parâmetros não informados corretamente.') as any;
                error.statusCode = 400;
                throw error;
            }       

            const estoque = new Estoque(db.connection);

            const result = await estoque.ListarAtivos(pesq, dep_id, med_tipo_codigo);
            
            resdata.data = result;
            
        } catch (error :any) {

            applyControllerError(resdata, error, 'Controller Estoque');

        } finally {

            await db.Disconnect();

        }

        return res.status(resdata.status).json(resdata);

    }

    static async Buscar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {
            
            void await db.Connect();

            const med_id = Number(req.params.med_id) || 0;
            const dep_id = Number(req.params.dep_id) || 0;
            const lote = String(req.params.lote || '');
            
            if (!med_id || !dep_id || !lote) {
                const error = new Error('Parâmetros não informados corretamente.') as any;
                error.statusCode = 400;
                throw error;
            }
            
            const estoque = new Estoque(db.connection);

            const result = await estoque.BuscarPorItemEstoque(dep_id, med_id, lote);
            
            if (!result) {
                const error = new Error('Item não encontrado.') as any;
                error.statusCode = 404;
                throw error;
            }

            resdata.data = result;
            
        } catch (error :any) {
            
            applyControllerError(resdata, error, 'Controller Estoque');
        }
        
        return res.status(resdata.status).json(resdata);
        
    }

    static async Salvar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {
            
            void await db.Connect();

            void await db.Begin();

            const est_id = Number(req.body.est_id) || 0;
            const est_dep_id = Number(req.body.est_dep_id) || 0;
            const est_med_id = Number(req.body.est_med_id) || 0;
            const est_lote = String(req.body.est_lote || '');
            const est_saldo = Number(req.body.est_saldo) || 0;
            const est_validade = new Date(req.body.est_validade || '');

            if (est_med_id === 0) {
                const error = new Error("Medicamento não informado") as any;
                error.statusCode = 400;
                throw error;
            }

            if (est_dep_id === 0) {
                const error = new Error("Departamento não informado") as any;
                error.statusCode = 400;
                throw error;
            }
            
            if (est_lote === '') {
                const error = new Error("Lote não informado") as any;
                error.statusCode = 400;
                throw error;
            }
            
            if (est_saldo === 0) {
                const error = new Error("Saldo não informado") as any;
                error.statusCode = 400;
                throw error;
            }
            
            if (est_validade === new Date('')) {
                const error = new Error("Validade não informada") as any;
                error.statusCode = 400;
                throw error;
            }

            const estoque = new Estoque(db.connection);

            void await estoque.BuscarPorId(est_id);

            estoque.est_dep_id = est_dep_id;
            estoque.est_med_id = est_med_id;
            estoque.est_lote = est_lote;
            estoque.est_saldo_disponivel = est_saldo;
            estoque.est_validade = est_validade;
            
            await estoque.Salvar();

            void await db.Commit();

            resdata.msg = "Estoque atualizado com sucesso";
            
        } catch (error :any) {

            void await db.Rollback();
            
            applyControllerError(resdata, error, 'Controller Estoque');
        }
        
        return res.status(resdata.status).json(resdata);
        
    }

    static async Transferir(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {
            
            void await db.Connect();

            void await db.Begin();
            
            const est_dep_id_origem = Number(req.body.est_dep_id_origem) || 0;
            const est_dep_id_destino = Number(req.body.est_dep_id_destino) || 0;
            const user = String(req.body.user || null);
            const list_itens = req.body.list_itens || [];
            
            if (est_dep_id_origem === 0) {
                const error = new Error("Deposito de origem não informado") as any;
                error.statusCode = 400;
                throw error;
            }

            if (est_dep_id_destino === 0) {
                const error = new Error("Deposito de destino não informado") as any;
                error.statusCode = 400;
                throw error;
            }
            
            if (!Array.isArray(list_itens) || list_itens.length === 0) {
                const error = new Error("Lista de itens não informada ou vazia") as any;
                error.statusCode = 400;
                throw error;
            }

            if (!user) {
                const error = new Error("Usuario não informado.") as any;
                error.statusCode = 400;
                throw error;
            }

            const estoqueOrigem = new Estoque(db.connection);
            const estoqueDestino = new Estoque(db.connection);
            const movimentacoes = new Movimentacoes(db.connection);
            const depositos = new Depositos(db.connection);

            for (const item of list_itens) {

                const med_id = Number(item.med_id) || 0;
                const lote = String(item.lote || '');
                const quantidade = Number(item.quantidade) || 0;

                if (med_id === 0) {
                    const error = new Error("Medicamento não informado para um dos itens") as any;
                    error.statusCode = 400;
                    throw error;
                }

                if (lote === '') {
                    const error = new Error("Lote não informado para um dos itens") as any;
                    error.statusCode = 400;
                    throw error;
                }

                if (quantidade === 0) {
                    const error = new Error("Quantidade não informada para um dos itens") as any;
                    error.statusCode = 400;
                    throw error;
                }

               
                /* ************************************************************************ */
                await estoqueOrigem.BuscarPorItemEstoque(est_dep_id_origem, med_id, lote);
                
                await depositos.BuscarPorId(est_dep_id_origem);

                if (!depositos.found) {
                    const error = new Error(`Deposito origem não encontrado.`) as any;
                    error.statusCode = 404;
                    throw error;
                }

                const deposito_origem = depositos.dep_descr;

                if (!estoqueOrigem.found) {
                    const error = new Error(`Item não encontrado no estoque de origem para med_id ${med_id}, lote ${lote}`) as any;
                    error.statusCode = 404;
                    throw error;
                }

                if (estoqueOrigem.est_saldo_disponivel < quantidade) {
                    const error = new Error(`Saldo insuficiente no estoque de origem para med_id ${med_id}, lote ${lote}`) as any;
                    error.statusCode = 400;
                    throw error;
                }

                estoqueOrigem.est_saldo_disponivel -= quantidade;

                await estoqueOrigem.Salvar();

                // Verificar se já existe um estoque para o mesmo medicamento, lote e departamento de destino
                await estoqueDestino.BuscarPorItemEstoque(est_dep_id_destino, med_id, lote);
                await depositos.BuscarPorId(est_dep_id_destino);

                if (!depositos.found) {
                    const error = new Error(`Deposito Destino não encontrado.`) as any;
                    error.statusCode = 404;
                    throw error;
                }

                const deposito_destino = depositos.dep_descr;

                if (estoqueDestino.found) {
                    // Se existir, atualizar o saldo disponível
                    estoqueDestino.est_saldo_disponivel += quantidade;
                    
                } else {
                    // Se não existir, criar um novo registro de estoque
                    estoqueDestino.est_dep_id = est_dep_id_destino;
                    estoqueDestino.est_med_id = med_id;
                    estoqueDestino.est_lote = lote;
                    estoqueDestino.est_saldo_disponivel = quantidade;
                    estoqueDestino.est_validade = estoqueOrigem.est_validade; // Manter a mesma validade do estoque de origem
                    
                }

                await estoqueDestino.Salvar();

                const anoAtual = new Date().getFullYear();
                const mesAtual = (new Date().getMonth() + 1).toString().padStart(2,'0');
                const numeroAleatorio = Math.floor(Math.random() * 11333).toString().padStart(4, '0');
                
                const mov_doc: string = `${anoAtual}${mesAtual}${numeroAleatorio}`;
            
                await movimentacoes.BuscarPorId(0)

                movimentacoes.mov_date = new Date();
                movimentacoes.mov_descr = `Transferencia entre Deposito : ${deposito_origem} para ${deposito_destino}`
                movimentacoes.mov_documento = mov_doc;
                movimentacoes.mov_med_id = med_id;
                movimentacoes.mov_med_lote = lote;
                movimentacoes.mov_qtde = quantidade;
                movimentacoes.mov_tipo = 'TRA'
                movimentacoes.mov_user = user;

                await movimentacoes.Salvar();

            }

            void await db.Commit();

            resdata.msg = "Transferência realizada com sucesso";
            resdata.data.numero_transacao = movimentacoes.mov_documento;
            
        } catch (error :any) {

            void await db.Rollback();
            
            applyControllerError(resdata, error, 'Controller Estoque');
        }
        
        return res.status(resdata.status).json(resdata);
        
    }
}

