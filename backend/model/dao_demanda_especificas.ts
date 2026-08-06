import { Connection, RowDataPacket } from "mysql2/promise";
import BaseModel,{iBaseModel} from "./BaseModel.js";

export interface iDemandasEspecificasFields {
    dem_id: number,
    dem_pac_id: number | null,
    dem_medico_assis: string | null,
    dem_medico_crm: string | null,
    dem_responsavel: string | null,
    dem_diag_id: number | null,
}

export default class DemandasEspecificas extends BaseModel implements iBaseModel,iDemandasEspecificasFields {
    
    private connection: Connection;
    
    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initialFields: iDemandasEspecificasFields = {
            dem_id: 0,
            dem_pac_id: null,
            dem_medico_assis: null,
            dem_medico_crm: null,
            dem_responsavel: null,
            dem_diag_id: null,
        }
        
        super(connection, 'tb_demandas_especificas', initialFields, 'dem_id');

        this.connection = connection;
    }

    get found() {return this._found;}

    set dem_id(id: number) {this._fields.dem_id = id;}
    get dem_id():number {return this._fields.dem_id;}
    
    set dem_pac_id(pac_id: number | null) {this._fields.dem_pac_id = pac_id;}
    get dem_pac_id(): number | null {return this._fields.dem_pac_id;}
    
    set dem_medico_assis(medico_assis: string | null) {this._fields.dem_medico_assis = medico_assis;}
    get dem_medico_assis() :string | null {return this._fields.dem_medico_assis;}
    
    set dem_medico_crm(medico_crm: string | null) {this._fields.dem_medico_crm = medico_crm;}
    get dem_medico_crm(): string | null {return this._fields.dem_medico_crm;}

    set dem_responsavel(resposavel: string | null) {this._fields.dem_responsavel = resposavel}
    get dem_responsavel() {return this._fields.dem_responsavel}

    set dem_diag_id(diag_id: number | null) {this._fields.dem_diag_id = diag_id}
    get dem_diag_id() {return this._fields.dem_diag_id}
    
    async ListarDemandas() {

        const query = `SELECT d.*, p.nom_paciente as nome_paciente, p.dt_nascimento as data_nascimento,dg.diag_descr as diagnostico
                       FROM tb_demandas_especificas d 
                       LEFT JOIN fsph_ambulatorio.tb_pacientes p ON d.dem_pac_id = p.num_paciente
                       LEFT JOIN tb_diagnosticos dg ON dg.diag_id = d.dem_diag_id`;
        
        const [rows] = await this.connection.query(query) as RowDataPacket[];
        
        return rows;
    }

    async BuscarPorPaciente(pac_id: number) {

        const query = `SELECT d.*, p.nom_paciente as nome_paciente, p.dt_nascimento as data_nascimento,dg.diag_descr as diagnostico
                       FROM tb_demandas_especificas d 
                       LEFT JOIN fsph_ambulatorio.tb_pacientes p ON d.dem_pac_id = p.num_paciente
                       LEFT JOIN tb_diagnosticos dg ON dg.diag_id = d.dem_diag_id
                       WHERE dem_pac_id = :pac_id`;
        
        const [rows] = await this.connection.query(query, { pac_id })  as RowDataPacket[];

        if (rows[0] && rows.length > 0) {

            this.populateFromRow(rows[0]);

            this._found = true;
            
        } else {
            
            this._found = false;
            
            this.populateFromInitial({
                dem_id: 0,
                dem_pac_id: null,
                dem_medico_assis: null,
                dem_medico_crm: null,
                dem_responsavel: null,
                dem_diag_id: null,
            });
        }

        return this._fields as RowDataPacket

    }

    async ListarItensDemandas(dem_pac_id: number): Promise<RowDataPacket[]>  {

        const query = `SELECT ite_id,ite_dem_med_id,med_descr,med_descr_coml,ite_dem_med_qtde,ite_dem_med_ativo
                       FROM tb_itens_demandas_especificas
                       LEFT JOIN tb_demandas_especificas ON dem_id = ite_dem_id
                       LEFT JOIN tb_medicamentos ON med_id = ite_dem_med_id
                       WHERE dem_pac_id = :dem_pac_id`;
        
        const [rows] = await this.connection.query<RowDataPacket[]>(query,{dem_pac_id});

        return rows;
    }

    async ListarPacientes(): Promise<RowDataPacket[]>  {

        const query = `SELECT d.dem_pac_id as num_paciente, p.nom_paciente FROM tb_demandas_especificas d 
                       LEFT JOIN fsph_ambulatorio.tb_pacientes p ON d.dem_pac_id = p.num_paciente`;
        
        const [rows] = await this.connection.query<RowDataPacket[]>(query);

        return rows;
    }
}
