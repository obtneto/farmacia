import Database, { iDatabase } from "../connections/dbconn.js";
import ItensDemandasEspecificas from "../model/dao_itens_demandas_especificas.js";
import Medicamentos from "../model/dao_medicamentos.js";
import { iresdata } from "./interface_controllers.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";

export default class Controller_Itens_Demandas {

      static async BuscarPorId(req: Request, res: Response) {

            const db: iDatabase = new Database('fsph_farmacia');

            const resdata: iresdata = {err: 0, msg: '', status: 200, data: []}

            try {
                  
                  await db.Connect();

                  const ite_id: number = Number(req.params.ite_id || 0);

                  if (ite_id === 0) {
                        const error = new Error('ID invalido.');
                        error.statusCode = 400;
                        throw error;
                  }

                  const itens = new ItensDemandasEspecificas(db.connection);
                  const medicamentos = new Medicamentos(db.connection);

                  const result = await itens.BuscarPorId(ite_id);

                  if (!itens.found) {
                        const error = new Error('Itens não encontrado.');
                        error.statusCode = 404;
                        throw error;
                  }

                  await medicamentos.BuscarPorId(Number(itens.ite_dem_med_id))

                  if (!medicamentos.found) {
                        const error = new Error('Medicamento não encontrado.');
                        error.statusCode = 404;
                        throw error;
                  }

                  result.medicamento = medicamentos.med_descr;
                  result.descr_coml = medicamentos.med_descr_coml;

                  resdata.data = result;

            } catch (error) {
                 applyControllerError(resdata,error,'Controller_itens_demandas')    
            }

            await db.Disconnect();

            res.status(resdata.status).json(resdata);
      }

      static async ListarAtivos(req: Request, res: Response) {

            const db: iDatabase = new Database('fsph_farmacia');

            const resdata: iresdata = {err: 0, msg: '', status: 200, data: []};

            try {
                  
                  await db.Connect();

                  const dem_id: number = Number(req.params.dem_id || 0);

                  if (dem_id === 0) {
                        const error = new Error('ID invalido.');
                        error.statusCode = 400;
                        throw error;
                  }

                  const itens = new ItensDemandasEspecificas(db.connection);

                  resdata.data = itens.ListarAtivos(dem_id);

            } catch (error) {
                  applyControllerError(resdata,error,'Controller_Itens_Demandas');
            }

            await db.Disconnect();

            res.status(resdata.status).json(resdata);

      }

      static async Salvar(req: Request, res: Response) {

            const db: iDatabase = new Database('fsph_farmacia');

            const resdata: iresdata = {err: 0, msg: '', status: 200, data: []};

            try {

                  await db.Connect();

                  const ite_id: number = Number(req.body?.id || 0);
                  const ite_dem_id: number = Number(req.body.dem_id || 0);
                  const ite_dem_med_id: number = Number(req.body.dem_med_id || 0);
                  const ite_dem_med_qtde: number = Number(req.body.dem_med_qtde || 0);
                  const ite_dem_med_ativo: number = Number(req.body.dem_med_ativo || 1);

                  if (ite_dem_id === 0) {
                        const error = new Error('ID da Demanda invalido.');
                        error.statusCode = 400;
                        throw error;
                  }

                  if (ite_dem_med_id === 0) {
                        const error = new Error('ID do Medicamento invalido.');
                        error.statusCode = 400;
                        throw error;
                  }

                  if (ite_dem_med_qtde === 0) {
                        const error = new Error('Quantidade de Medicamento não pode ser ZERO.');
                        error.statusCode = 400;
                        throw error;
                  }

                  const itens = new ItensDemandasEspecificas(db.connection);
                  const medicamentos = new Medicamentos(db.connection);

                  await medicamentos.BuscarPorId(ite_dem_med_id);

                  if (!medicamentos.found) {
                        const error = new Error("Medicamento não encontrado.");
                        error.statusCode = 404;
                        throw error;
                  }

                  await itens.BuscarPorId(ite_id);

                  itens.ite_dem_id = ite_dem_id;
                  itens.ite_dem_med_id = ite_dem_med_id;
                  itens.ite_dem_med_qtde = ite_dem_med_qtde;
                  itens.ite_dem_med_ativo = itens.found ? itens.ite_dem_med_ativo : ite_dem_med_ativo;

                  await itens.Salvar();

                  resdata.msg = "Dados Salvo com Sucesso!";

                  
            } catch (error) {
                  applyControllerError(resdata,error,"Controller_Itens_Demandas");
            }

            await db.Disconnect();

            res.status(resdata.status).json(resdata);
      }

      static async Excluir(req: Request, res: Response) {

            const db: iDatabase = new Database('fsph_farmacia');

            const resdata: iresdata = {err: 0, msg: '', status: 200, data: []};

            try {
                  
                  await db.Connect();

                  const ite_id: number = Number(req.params.ite_id || 0);

                  if (ite_id === 0) {
                        const error = new Error('ID Invalido.');
                        error.statusCode = 400;
                        throw error;
                  }

                  const itens = new ItensDemandasEspecificas(db.connection);

                  await itens.BuscarPorId(ite_id);

                  if (itens.found) {
                        await itens.Excluir();
                        resdata.msg = "Item Excluido com Sucesso.!"
                  } else {
                        const error = new Error('Item não Encontrado');
                        error.statusCode = 404;
                        throw error;
                  }

            } catch (error) {
                  applyControllerError(resdata,error,"Controller_Itens_Demandas")
            }

            await db.Disconnect();

            res.status(resdata.status).json(resdata);

      }

      static async AtivarDesativar(req: Request, res: Response) {

            const db: iDatabase = new Database('fsph_farmacia');

            const resdata: iresdata = {err: 0, msg: '', status: 200, data:[]};

            try {

                  await db.Connect();

                  const ite_id: number = Number(req.params.ite_id || 0);

                  if (ite_id === 0) {
                        const error = new Error('ID do Item de Demanda não pode ser ZERO.');
                        error.statusCode = 400;
                        throw error;
                  }

                  const itens = new ItensDemandasEspecificas(db.connection);

                  await itens.BuscarPorId(ite_id);

                  if (!itens.found) {
                        const error = new Error('ID do item de Demanda não encontrado.');
                        error.statusCode = 404;
                        throw error;
                  }

                  itens.ite_dem_med_ativo = itens.ite_dem_med_ativo === 1 ? 0 : 1; 
                  await itens.Salvar();
                  resdata.msg = 'Status do item atualizado com sucesso.';
                  
            } catch (error) {
                  applyControllerError(resdata,error,'Controller_Itens_Damandas.AtivarDesativar');
            }

            await db.Disconnect();

            res.status(resdata.status).json(resdata);
      }
}
