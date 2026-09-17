import Database, { iDatabase } from "../connections/dbconn.js";
import { iresdata } from "./interface_controllers.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";
import settings from "../utils/settings.js";

// Controla o CRUD de Dashboard mantendo o contrato padrao das respostas HTTP.
export default class Controller_Dashboard {


    static async Listar(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            await db.Connect();

            const ano: number = Number(req.params.ano) || 0;
            const mes: number = Number(req.params.mes) || 0;

            if (!ano || ano === 0) {
                const error = new Error('Ano não fornecido.');
                error.statusCode = 400;
                throw error;
            }

            if (!mes || mes === 0) {
                const error = new Error('Mes não fornecido.');
                error.statusCode = 400;
                throw error;
            }

            if (ano < 2000) {
                const error = new Error('Ano inválido.');
                error.statusCode = 400;
                throw error;
            }

            if (mes < 1 || mes > 12) {
                const error = new Error('Mes inválido.');
                error.statusCode = 400;
                throw error;
            }

            const local_id_ddu: number = settings.local_id || 0;

            /***************************************************
             * Atendimentos por Hemoderivados
            ****************************************************/
            const query_devivados: string = "SELECT * FROM vw_atendimentos_hemoderivados WHERE ano = :ano AND mes = :mes";

            const [hemoderivados] = await db.connection.query(query_devivados, { ano, mes });

            /***************************************************
             * Atendimentos Gaucher
            ****************************************************/
            const query_gaucher: string = "SELECT * FROM vw_atendimentos_gaucher WHERE ano = :ano AND mes = :mes";

            const [gaucher] = await db.connection.query(query_gaucher, { ano, mes });

            /***************************************************
             * Dispensação de Fator por Frascos
            ****************************************************/
            const query_frascos: string = `SELECT
                                            YEAR(r.req_date) AS ano,
                                            MONTH(r.req_date) AS mes,
                                            (
                                                CASE
                                                    WHEN (l.local_tipo = 'INT') THEN
                                                        'Hemocentro'
                                                    WHEN ((l.local_tipo = 'EXT') AND (l.local_id <> :local_id_ddu)) THEN
                                                        'Hospitalar'
                                                    WHEN ((l.local_tipo = 'EXT') AND (l.local_id = :local_id_ddu)) THEN
                                                        'DDU'
                                                    ELSE
                                                        'Não Identificado'
                                                END
                                            ) AS Local,
                                            sum(ir.ite_qtde) AS qtde
                                        FROM
                                            (
                                                (tb_itens_requisicoes ir LEFT JOIN tb_requisicoes r ON (r.req_id = ir.ite_req_id))
                                                LEFT JOIN tb_locais l ON (l.local_id = r.req_local_id)
                                            )
                                        WHERE 
                                            YEAR(r.req_date) = :ano 
                                            AND MONTH(r.req_date) = :mes
                                        GROUP BY
                                            YEAR(r.req_date),
                                            MONTH(r.req_date),
                                            Local`;

            const [frascos] = await db.connection.query(query_frascos, { ano, mes, local_id_ddu });

            /***************************************************
             * Atendimentos a Hemofilicos
            ****************************************************/
            const query_hemofilicos: string = `SELECT
                                                YEAR(r.req_date) AS ano,
                                                MONTH(r.req_date) AS mes,
                                                (
                                                    CASE
                                                        WHEN (l.local_tipo = 'INT') THEN
                                                            'Hemocentro'
                                                        WHEN ((l.local_tipo = 'EXT') AND (l.local_id = :local_id_ddu)) THEN
                                                            'DDU'
                                                        WHEN ((l.local_tipo = 'EXT') AND (l.local_id <> :local_id_ddu)) THEN
                                                            'Hospitalar'
                                                    END
                                                ) AS local,
                                                count(r.req_id) AS atendimentos
                                            FROM
                                                (tb_requisicoes r LEFT JOIN tb_locais l ON ((l.local_id = r.req_local_id)))
                                            WHERE 
                                                YEAR(r.req_date) = :ano 
                                                AND MONTH(r.req_date) = :mes
                                            GROUP BY
                                                YEAR(r.req_date),
                                                MONTH(r.req_date),
                                                local`;

            const [hemnofilicos] = await db.connection.query(query_hemofilicos, { ano, mes, local_id_ddu });

            /**************************************************
            * Relatorio Boname
            ***************************************************/
            const query_boname = `SELECT b.bona_codigo,b.bona_descr, 
                                    (SELECT COALESCE(SUM(i.ite_ent_qtde),0) 
                                     FROM tb_itens_entradas i 
                                     LEFT JOIN tb_medicamentos m ON m.med_id = i.ite_ent_med_id
                                     LEFT JOIN tb_entradas en ON en.ent_id = i.ite_ent_id
                                     WHERE m.med_bona_codigo = b.bona_codigo AND YEAR(en.ent_date) = :ano AND MONTH(en.ent_date) = :mes) as entrada,
                                     
                                    (SELECT SUM(iv.iti_qtde_invent) FROM tb_itens_inventario iv
                                      LEFT JOIN tb_inventarios v ON v.inv_num = iv.iti_inv_num
                                      LEFT JOIN tb_medicamentos m ON m.med_id = iv.iti_med_id
                                      WHERE m.med_bona_codigo = b.bona_codigo AND YEAR(v.inv_date) = :ano AND MONTH(v.inv_date) = :mes ) as estoque,
                                     
                                    (SELECT COALESCE(SUM(ir.ite_qtde),0) FROM tb_itens_requisicoes ir 
                                       LEFT JOIN tb_medicamentos m ON m.med_id = ir.ite_med_id
                                       LEFT JOIN tb_requisicoes r ON r.req_id = ir.ite_req_id
                                       WHERE m.med_bona_codigo = b.bona_codigo AND YEAR(r.req_date) = :ano AND MONTH(req_date) = :mes ) as saida
                                   FROM tb_boname b`

            const [boname] = await db.connection.query(query_boname, { ano, mes });

            resdata.data.atendimentos_hemofilicos = hemnofilicos;
            resdata.data.atendimentos_gaucer = gaucher;
            resdata.data.dispensa_fatores_frascos = frascos;
            resdata.data.atendimentos_hemoderivados = hemoderivados;
            resdata.data.relatorio_boname = boname;


        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Dashboard');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

}
