# Permissões a Perfil de Usuarios

## Perfil

1 - ADMINISTRADOR
	
	- Todas as telas e ações

2 - OPERADOR APROVADOR

	- Menu Cadastro: Deny
	
	- Menu Operacao: Allow
		- Pacientes : Allow
			- Ambulatorio: Allow
			- Demandas Especificas: Allow; na pagina ação: Editar: Deny

		- Movimentacao de Estoque: Allow
			- Estoque: Allow
				- Listar Saldo Disponivel: Allow; na pagina ações: Bloquear: Deny e Desbloquear: Deny
		        - Listar Movimentacoes: Allow
		        - Alerta de Validade: Allow
		    - Transferencias: Allow
		    	- Nova Solicitacao: Allow
		    	- Solicitacoes Abertas: Allow
		    	- Solicitacoes Encerradas: Allow
		    - Entrada Medicamentos: Allow
		    	- Nova Entrada: Allow
		    	- Listar Entradas: Allow
		    	- Entrada Demanda Espec: Allow
		    	- Aprovacao Entrada: Allow

		- Inventarios: Allow
			- Listar: Allow; na pagina ações: Fechar Inventario: Deny
			- Novo: Deny

		- Requisicoes Medicamentos: Allow
			- Por Paciente: Allow
			- Por Setor: Allow
			- Aprovar Requisicao: Allow
			- Listar por Periodo: Allow
			- Devolucao de Medicamento: Allow
			- Controle Dose Domiciliar: Allow; na pagina ações: Button Excluir (no modal) Deny
			- Rastreamento de Lotes: Allow 

3 - OPERADOR

	- Menu Cadastro: Deny
	
	- Menu Operacao: Allow
		- Pacientes : Allow
			- Ambulatorio: Allow
			- Demandas Especificas: Allow; na pagina ação: Editar: Deny

		- Movimentacao de Estoque: Allow
			- Estoque: Allow
				- Listar Saldo Disponivel: Allow; na pagina ações: Bloquear: Deny e Desbloquear: Deny
		        - Listar Movimentacoes: Allow
		        - Alerta de Validade: Allow
		    - Transferencias: Allow
		    	- Nova Solicitacao: Allow
		    	- Solicitacoes Abertas: Allow
		    	- Solicitacoes Encerradas: Allow
		    - Entrada Medicamentos: Allow
		    	- Nova Entrada: Allow
		    	- Listar Entradas: Allow
		    	- Entrada Demanda Espec: Allow
		    	- Aprovacao Entrada: Deny

		- Inventarios: Allow
			- Listar: Allow; na pagina ações: Fechar Inventario: Deny
			- Novo: Deny

		- Requisicoes Medicamentos: Allow
			- Por Paciente: Allow
			- Por Setor: Allow
			- Aprovar Requisicao: Deny
			- Listar por Periodo: Allow
			- Devolucao de Medicamento: Allow
			- Controle Dose Domiciliar: Allow, na pagina ações: Button Excluir (no modal) Deny
			- Rastreamento de Lotes: Allow 

