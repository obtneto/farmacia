# AGENTS.override.md — Squad Codex Farmácia Ambulatorial

Projeto:
Sistema de Farmácia Ambulatorial Hospitalar.

Este arquivo define regras obrigatórias e prioritárias para frontend, backend, banco de dados e fluxo de desenvolvimento.

---

## 1. Ordem de prioridade das instruções

Em caso de conflito entre regras, seguir esta ordem:

1. Pedido explícito do Ovidio na conversa atual.
2. Regras de segurança, privacidade e proteção de dados.
3. Este arquivo `AGENTS.override.md`.
4. Arquivo `AGENTS.md`.
5. Arquivos `agents/*.toml`.
6. Skills instaladas no projeto.
7. Sugestões internas dos agentes.

---

## 2. Regra obrigatória — Output minimalista

Todos os agentes e subagentes devem minimizar o tamanho do contexto de saída em todas as respostas e execuções.

### 2.1. Princípio geral

Menos tokens de saída = menor custo, menor latência e menor risco de truncamento de contexto.

Todo output deve conter **apenas o que é necessário** para a tarefa. Nada além disso.

### 2.2. Regras obrigatórias de output

- **Sem introduções ou conclusões genéricas.** Nada de "Claro!", "Ótimo!", "Com prazer!", "Espero ter ajudado." ou qualquer variação. Ir direto ao ponto.
- **Sem repetição do enunciado.** Não reescrever a tarefa recebida antes de executá-la.
- **Sem explicações desnecessárias.** Se o agente executou uma ação, reportar o resultado — não o raciocínio completo.
- **Sem comentários óbvios no código.** Comentários apenas onde a lógica não é auto-evidente.
- **Sem formatação decorativa.** Evitar separadores, emojis, ASCII art, blocos desnecessários ou estrutura visual que não agrega informação.
- **Planos de execução curtos.** Quando necessário, usar lista mínima de passos — sem descrições extensas de cada um.
- **Logs e relatórios enxutos.** Reportar apenas erros, mudanças relevantes e próximos passos. Omitir o que não mudou.
- **Resumos ao invés de transcrições.** Nunca reproduzir conteúdo longo já existente; referenciar o caminho ou identificador.
- **Perguntas diretas.** Quando precisar de esclarecimento, uma única pergunta objetiva — sem contexto introdutório.

### 2.3. Exceções permitidas

O output pode ser mais extenso **somente quando**:

- O Ovidio solicitar explicitamente uma explicação detalhada.

### 2.4. Regras absolutas

- Esta regra vale para todos os agentes: Gustavo, Douglas, Ana Carolina, Marcos, Rafael e qualquer outro definido em `.codex/agents/` ou `agents/*.toml`.
- Em caso de conflito entre output minimalista e outro arquivo de instrução, esta regra prevalece (exceto pedido explícito do Ovidio).
- O agente não deve justificar por que está sendo conciso. Simplesmente ser.

### 2.5. Procedimento obrigatório

Antes de executar a tarefa, o Codex/agente deve:

1. identificar se a tarefa se enquadra em algum dos gatilhos acima;
2. ler o `SKILL.md` correspondente;
3. aplicar o workflow descrito pela skill;
4. respeitar a hierarquia de instruções do projeto;
5. mencionar no plano de execução qual skill foi aplicada;
6. informar brevemente quais pontos da skill foram relevantes para a tarefa.

Se houver conflito entre uma skill e este `AGENTS.override.md`, prevalece este `AGENTS.override.md`.
