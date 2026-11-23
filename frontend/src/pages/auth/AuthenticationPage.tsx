import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Input, Message, SelectPicker } from 'rsuite'
import { apiRequest } from '../../lib/api'
import { LOGIN_SECTION } from '../../lib/auth-helpers'
import { saveSession } from '../../lib/storage-session'
import { PageSection } from '../../components/ui/PageSection'
import './AuthenticationPage.css'

const DEFAULT_DOMAIN_ID = 4

type Domain = { id_dom: number; nm_dom: string }
type Credentials = { usuario: string; senha: string; id_dom: number }
type AuthenticationResult = {
  user_data: { user: string; nome_completo: string; setor: string }
}

function AuthenticationPage() {
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')
  const domains = useQuery({
    queryKey: ['auth', 'dominios'],
    queryFn: async ({ signal }) => {
      const data = await apiRequest<Domain[]>('/auth/listar_dominios', { signal })

      if (!Array.isArray(data) || data.some((domain) => (
        !Number.isInteger(domain?.id_dom) || typeof domain?.nm_dom !== 'string' || !domain.nm_dom.trim()
      ))) {
        throw new Error('A API retornou uma lista de domínios inválida.')
      }

      return data
    },
  })
  const domainOptions = domains.data ?? []
  const domainId = domainOptions.find((domain) => domain.id_dom === (selectedDomainId ?? DEFAULT_DOMAIN_ID))?.id_dom ?? null

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || domains.isError || domainId === null) return

    const fields = new FormData(event.currentTarget)
    const usuario = String(fields.get('usuario') ?? '').trim()
    const senha = String(fields.get('senha') ?? '')

    if (!usuario) {
      setLoginError('Informe seu usuário.')
      return
    }

    setLoginError('')
    setIsSubmitting(true)

    try {
      const credentials: Credentials = { usuario, senha, id_dom: domainId }
      const result = await apiRequest<AuthenticationResult>('/auth/autentica', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })

      if (!result.user_data?.user) {
        throw new Error('Resposta de autenticação inválida.')
      }

      saveSession('_upf', result.user_data)
      const destination = new URL(window.location.href)
      if (destination.searchParams.get('section') === LOGIN_SECTION) {
        destination.searchParams.delete('section')
      }
      window.location.replace(destination)
    } catch {
      setLoginError('Não foi possível entrar. Confira suas credenciais e tente novamente.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="authentication-page" aria-labelledby="authentication-title">
      <PageSection className="authentication-page__panel">
        <header className="authentication-page__brand">
          <img
            className="authentication-page__brand-mark"
            src={`${import.meta.env.BASE_URL}logo-sisstock-login.png`}
            alt="SisStock"
            width={233}
            height={79}
          />
          <div>
            <h1 id="authentication-title">Farmácia Ambulatorial</h1>
            <p>HEMOSE · Hemocentro de Sergipe</p>
          </div>
        </header>

        <section className="authentication-page__access" aria-labelledby="authentication-access-title">
          <header className="authentication-page__header">
            <h2 id="authentication-access-title">Acesso institucional</h2>
            <p>Entre com seu usuário e senha da rede.</p>
          </header>

          <form className="authentication-page__form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
            <div className="authentication-page__field">
              <label htmlFor="authentication-user">Usuário</label>
              <Input id="authentication-user" name="usuario" size="lg" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
            </div>

            <div className="authentication-page__field">
              <label htmlFor="authentication-password">Senha</label>
              <Input id="authentication-password" name="senha" size="lg" type="password" autoComplete="current-password" required />
            </div>

            <div className="authentication-page__field">
              <span id="authentication-domain-label">Domínio</span>
              <SelectPicker<number>
                id="authentication-domain"
                aria-labelledby="authentication-domain-label"
                aria-required="true"
                size="lg"
                block
                cleanable={false}
                searchable={false}
                data={domainOptions}
                labelKey="nm_dom"
                valueKey="id_dom"
                value={domainId}
                onChange={setSelectedDomainId}
                loading={domains.isPending}
                disabled={domains.isError || domainOptions.length === 0 || isSubmitting}
                placeholder={domains.isPending ? 'Carregando domínios…' : 'Selecione o domínio'}
              />
            </div>

            {domains.isError || (domains.isSuccess && domainOptions.length === 0) ? (
              <Message type="warning" showIcon>
                {domains.isError ? 'Não foi possível carregar os domínios.' : 'Nenhum domínio disponível.'}
                <Button appearance="link" size="sm" onClick={() => void domains.refetch()} disabled={domains.isFetching}>
                  Tentar novamente
                </Button>
              </Message>
            ) : null}

            {new URLSearchParams(window.location.search).get('reason') === 'idle' ? (
              <Message type="warning" showIcon>A sessão expirou após 15 minutos sem atividade.</Message>
            ) : null}
            {loginError ? <Message type="error" showIcon>{loginError}</Message> : null}

            <Button appearance="primary" size="lg" type="submit" block loading={isSubmitting} disabled={domainId === null || domains.isError || isSubmitting}>
              Entrar
            </Button>
          </form>
        </section>
      </PageSection>
    </main>
  )
}

export default AuthenticationPage
