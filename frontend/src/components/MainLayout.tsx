import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Container,
  Content,
  Header,
  HStack,
  IconButton,
  Nav,
  Panel,
  Popover,
  Sidebar,
  Sidenav,
  VStack,
  Whisper,
  useMediaQuery,
} from 'rsuite'
import {
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiMenuLine,
  RiNotification3Line,
  RiShieldCrossLine,
} from 'react-icons/ri'
import logoSidebarCollapsed from '../assets/img/logo-farmacia-ambulatorial-sider-colapsado.svg'
import logoSidebarExpanded from '../assets/img/logo-farmacia-ambulatorial-sider-expandido.svg'
import { NAVIGATION_GROUPS, type NavigationItem, type SectionKey } from '../config/navigation'
import './MainLayout.css'

const SIDEBAR_EXPANDED = 322
const SIDEBAR_COLLAPSED = 88
const OVERVIEW_GROUP = 'Visao geral'
const AUTH_TOKEN_STORAGE_KEYS = ['authToken', 'access_token', 'accessToken', 'token', 'jwt', 'jwtToken']
const USER_PROFILE_STORAGE_KEYS = [
  'user',
  'currentUser',
  'authUser',
  'sessionUser',
  'profile',
  'me',
  'usuario',
  'usuarioLogado',
]
const USER_NAME_FIELDS = [
  'name',
  'nome',
  'displayName',
  'display_name',
  'fullName',
  'full_name',
  'preferred_username',
  'user_name',
  'username',
  'login',
]
const USER_ROLE_FIELDS = ['role', 'roles', 'perfil', 'cargo', 'occupation', 'jobTitle', 'job_title']
const DEFAULT_LOGGED_IN_USER = {
  displayName: 'Usuario autenticado',
  initials: 'UA',
  roleLabel: 'Sessao ativa',
}

const isNavigationItemWithChildren = (item: NavigationItem): item is Extract<NavigationItem, { children: NavigationItem[] }> =>
  'children' in item

const normalizeMenuSegment = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const getMenuEventKey = (...segments: string[]) => `menu-${segments.map(normalizeMenuSegment).join('-')}`
const getNestedMenuEventKey = (parentMenuKey: string, itemLabel: string) =>
  `${parentMenuKey}-submenu-${normalizeMenuSegment(itemLabel)}`

const collectLeafSectionKeys = (items: NavigationItem[]): SectionKey[] =>
  items.flatMap((item) => (isNavigationItemWithChildren(item) ? collectLeafSectionKeys(item.children) : [item.eventKey]))

const SIDEBAR_SECTION_KEYS = new Set<SectionKey>(NAVIGATION_GROUPS.flatMap((group) => collectLeafSectionKeys(group.items)))

type StoredRecord = Record<string, unknown>

interface LoggedInUserProfile {
  displayName: string
  initials: string
  roleLabel: string
}

function normalizeTextValue(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalizedValue = value.trim()
  return normalizedValue.length > 0 ? normalizedValue : null
}

function extractTextField(source: StoredRecord | null, candidateFields: string[]): string | null {
  if (!source) {
    return null
  }

  for (const field of candidateFields) {
    const value = normalizeTextValue(source[field])

    if (value) {
      return value
    }
  }

  return null
}

function extractRoleField(source: StoredRecord | null): string | null {
  if (!source) {
    return null
  }

  for (const field of USER_ROLE_FIELDS) {
    const value = source[field]

    if (Array.isArray(value)) {
      const firstRole = value.map((item) => normalizeTextValue(item)).find(Boolean)

      if (firstRole) {
        return firstRole
      }

      continue
    }

    const normalizedValue = normalizeTextValue(value)

    if (normalizedValue) {
      return normalizedValue
    }
  }

  return null
}

function buildInitials(displayName: string): string {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return initials || DEFAULT_LOGGED_IN_USER.initials
}

function readStoredAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  for (const key of AUTH_TOKEN_STORAGE_KEYS) {
    const value = window.localStorage.getItem(key)?.trim()

    if (value) {
      return value
    }
  }

  return null
}

function readStoredUserProfile(): StoredRecord | null {
  if (typeof window === 'undefined') {
    return null
  }

  for (const key of USER_PROFILE_STORAGE_KEYS) {
    const rawValue = window.localStorage.getItem(key)

    if (!rawValue) {
      continue
    }

    try {
      const parsedValue = JSON.parse(rawValue) as unknown

      if (parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)) {
        return parsedValue as StoredRecord
      }
    } catch {
      continue
    }
  }

  return null
}

function decodeJwtPayload(token: string | null): StoredRecord | null {
  if (!token) {
    return null
  }

  const [, payload] = token.split('.')

  if (!payload) {
    return null
  }

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=')
    const binaryPayload = window.atob(paddedPayload)
    const bytes = Uint8Array.from(binaryPayload, (character) => character.charCodeAt(0))
    const decodedPayload = new TextDecoder().decode(bytes)
    const parsedPayload = JSON.parse(decodedPayload) as unknown

    if (parsedPayload && typeof parsedPayload === 'object' && !Array.isArray(parsedPayload)) {
      return parsedPayload as StoredRecord
    }
  } catch {
    return null
  }

  return null
}

function getLoggedInUserProfile(): LoggedInUserProfile {
  const storedProfile = readStoredUserProfile()
  const tokenPayload = decodeJwtPayload(readStoredAuthToken())

  const displayName =
    extractTextField(storedProfile, USER_NAME_FIELDS)
    || extractTextField(tokenPayload, USER_NAME_FIELDS)
    || DEFAULT_LOGGED_IN_USER.displayName
  const roleLabel =
    extractRoleField(storedProfile)
    || extractRoleField(tokenPayload)
    || DEFAULT_LOGGED_IN_USER.roleLabel

  return {
    displayName,
    initials: buildInitials(displayName),
    roleLabel,
  }
}

const SECTION_MENU_MAP: Partial<Record<SectionKey, string[]>> = {}
const SECTION_NESTED_MENU_MAP: Partial<Record<SectionKey, string[]>> = {}

const collectNavigationOpenState = (items: NavigationItem[], topMenuKey: string, submenuPath: string[] = []): void => {
  items.forEach((item) => {
    if (isNavigationItemWithChildren(item)) {
      const submenuKey = getNestedMenuEventKey(submenuPath.at(-1) ?? topMenuKey, item.label)

      collectNavigationOpenState(item.children, topMenuKey, [...submenuPath, submenuKey])
      return
    }

    SECTION_MENU_MAP[item.eventKey] = [topMenuKey]
    SECTION_NESTED_MENU_MAP[item.eventKey] = submenuPath
  })
}

NAVIGATION_GROUPS.forEach((group) => {
  if (group.title === OVERVIEW_GROUP) {
    return
  }

  collectNavigationOpenState(group.items, getMenuEventKey(group.title))
})

export interface MainLayoutProps {
  activeSidebarKey: SectionKey
  breadcrumbItems?: string[]
  children: ReactNode
  onQuickActionSelect?: (eventKey: SectionKey) => void
  onSidebarSelect?: (eventKey: SectionKey) => void
  pageBannerCompact?: boolean
  pageDescription?: string
  pageMetaVisible?: boolean
  pageStatus?: string
  pageTitle?: string
  quickActions?: Array<{ eventKey: SectionKey; label: string }>
}

const NOTIFICATIONS = [
  {
    title: 'Aprovacoes pendentes',
    description: 'Existem requisicoes aguardando priorizacao no modulo operacional.',
  },
  {
    title: 'Padrao visual atualizado',
    description: 'Shell corporativo aplicado e pronto para os proximos modulos.',
  },
  {
    title: 'Integracao de Boname',
    description: 'CRUD principal preparado com estados de carregamento, vazio e erro.',
  },
]

export function MainLayout({
  activeSidebarKey,
  breadcrumbItems = ['Inicio', 'Workspace', 'Dashboard'],
  children,
  onQuickActionSelect,
  onSidebarSelect,
  pageBannerCompact = false,
  pageDescription,
  pageMetaVisible = true,
  pageStatus = 'Operacao ativa',
  pageTitle = 'Dashboard corporativo',
  quickActions = [],
}: MainLayoutProps) {
  const [isMobile] = useMediaQuery('(max-width: 991px)')
  const [isCompactMobile] = useMediaQuery('(max-width: 480px)')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUserProfile>(() => getLoggedInUserProfile())

  const sidebarWidth = isMobile
    ? SIDEBAR_EXPANDED
    : isSidebarExpanded
      ? SIDEBAR_EXPANDED
      : SIDEBAR_COLLAPSED

  const isSidebarVisible = !isMobile || isMobileSidebarOpen
  const showSidebarLabels = isSidebarExpanded || isMobile
  const activeMenuKeys = SECTION_MENU_MAP[activeSidebarKey] ?? []
  const activeSubmenuKeys = SECTION_NESTED_MENU_MAP[activeSidebarKey] ?? []
  const sidebarNavId = 'main-layout-primary-nav'
  const [lastSyncedSidebarKey, setLastSyncedSidebarKey] = useState(activeSidebarKey)
  const [openMenuKeys, setOpenMenuKeys] = useState<string[]>(activeMenuKeys)
  const [openSubmenuKeys, setOpenSubmenuKeys] = useState<string[]>(activeSubmenuKeys)
  const isSidebarCollapsed = !showSidebarLabels
  const headerStyle = isMobile
    ? undefined
    : {
        left: sidebarWidth,
        paddingLeft: isSidebarCollapsed ? '3.6rem' : '4rem',
      }
  const sidebarLogoSrc = showSidebarLabels ? logoSidebarExpanded : logoSidebarCollapsed
  const sidebarToggleLabel = isMobile
    ? isSidebarVisible
      ? 'Fechar menu lateral'
      : 'Abrir menu lateral'
    : showSidebarLabels
      ? 'Recolher menu lateral'
      : 'Expandir menu lateral'

  if (activeSidebarKey !== lastSyncedSidebarKey) {
    setLastSyncedSidebarKey(activeSidebarKey)
    setOpenMenuKeys(activeMenuKeys)
    setOpenSubmenuKeys(activeSubmenuKeys)
  }

  const effectiveOpenMenuKeys = openMenuKeys
  const effectiveOpenSubmenuKeys = openSubmenuKeys

  useEffect(() => {
    if (!isSidebarCollapsed || openMenuKeys.length === 0) return

    const handleDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Element)) return

      const isInsideSidebar = Boolean(target.closest('.main-layout__sidebar'))
      const isInsideSidenavDropdown = Boolean(target.closest('.rs-dropdown-menu'))

      if (!isInsideSidebar && !isInsideSidenavDropdown) {
        setOpenMenuKeys([])
        setOpenSubmenuKeys([])
      }
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown)

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
    }
  }, [isSidebarCollapsed, openMenuKeys.length])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const syncLoggedInUser = () => {
      setLoggedInUser(getLoggedInUserProfile())
    }

    syncLoggedInUser()
    window.addEventListener('storage', syncLoggedInUser)

    return () => {
      window.removeEventListener('storage', syncLoggedInUser)
    }
  }, [])

  const handleMenuOpenChange = (nextOpenKeys: string[]) => {
    const nextOpenKey = nextOpenKeys.at(-1)
    const normalizedOpenKeys = nextOpenKey ? [nextOpenKey] : []

    setOpenMenuKeys(normalizedOpenKeys)
  }

  const handleSubmenuToggle = (submenuKey: string) => {
    setOpenSubmenuKeys((currentKeys) =>
      currentKeys.includes(submenuKey)
        ? currentKeys.filter((key) => key !== submenuKey && !key.startsWith(`${submenuKey}-submenu-`))
        : [...currentKeys, submenuKey]
    )
  }

  const handleSidebarSelect = (eventKey: string | number | undefined) => {
    if (typeof eventKey !== 'string' || !SIDEBAR_SECTION_KEYS.has(eventKey as SectionKey) || !onSidebarSelect) {
      return
    }

    onSidebarSelect(eventKey as SectionKey)

    if (isSidebarCollapsed) {
      setOpenMenuKeys([])
      setOpenSubmenuKeys([])
    }

    if (isMobile) {
      setIsMobileSidebarOpen(false)
    }
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen((currentValue) => !currentValue)
      return
    }

    setIsSidebarExpanded((currentValue) => !currentValue)
  }

  const renderNavigationItems = (items: NavigationItem[], parentMenuKey: string, submenuDepth = 1): ReactNode =>
    items.map((item) => {
      if (isNavigationItemWithChildren(item)) {
        const submenuKey = getNestedMenuEventKey(parentMenuKey, item.label)
        const isOpen = effectiveOpenSubmenuKeys.includes(submenuKey)

        return (
          <div
            className={`main-layout__nav-submenu-group main-layout__nav-submenu-group--depth-${submenuDepth}`.trim()}
            key={submenuKey}
          >
            <button
              aria-expanded={isOpen}
              className="rs-dropdown-item main-layout__nav-submenu-toggle"
              data-with-icon="true"
              onClick={() => handleSubmenuToggle(submenuKey)}
              type="button"
            >
              <div className="main-layout__nav-item-shell main-layout__nav-item-shell--submenu-label" title={item.label}>
                <span className="rs-dropdown-item-menu-icon main-layout__nav-submenu-icon" aria-hidden>
                  {item.icon}
                </span>
                <div className="main-layout__nav-item-label">
                  <span>{item.label}</span>
                  {item.badge ? <small className="main-layout__nav-item-badge">{item.badge}</small> : null}
                </div>
                <RiArrowDownSLine
                  className={`main-layout__nav-submenu-caret ${isOpen ? 'main-layout__nav-submenu-caret--open' : ''}`.trim()}
                  size={16}
                />
              </div>
            </button>
            {isOpen ? (
              <div
                className={`main-layout__nav-submenu-children main-layout__nav-submenu-children--depth-${submenuDepth + 1}`.trim()}
                style={{ '--main-layout-nav-submenu-depth': submenuDepth + 1 } as CSSProperties}
              >
                {renderNavigationItems(item.children, submenuKey, submenuDepth + 1)}
              </div>
            ) : null}
          </div>
        )
      }

      return (
        <Nav.Item
          className={submenuDepth > 1 ? `main-layout__nav-item--submenu-child main-layout__nav-item--submenu-child-depth-${submenuDepth}` : ''}
          eventKey={item.eventKey}
          icon={item.icon}
          key={item.eventKey}
        >
          <div className="main-layout__nav-item-shell main-layout__nav-item-shell--submenu-child" title={item.label}>
            <div className="main-layout__nav-item-label">
              <span>{item.label}</span>
              {item.badge ? <small className="main-layout__nav-item-badge">{item.badge}</small> : null}
            </div>
          </div>
        </Nav.Item>
      )
    })

  const quickActionsSpeaker = (
    <Popover className="main-layout__notifications-popover">
      <VStack spacing={10} alignItems="stretch">
        {quickActions.map((action) => (
          <Button
            appearance="subtle"
            className="main-layout__quick-action"
            key={action.eventKey}
            onClick={() => onQuickActionSelect?.(action.eventKey)}
          >
            {action.label}
          </Button>
        ))}
      </VStack>
    </Popover>
  )

  return (
    <Container className="main-layout">
      <Header className="main-layout__header" style={headerStyle}>
        <HStack justifyContent="space-between" alignItems="center" className="main-layout__header-row">
          <HStack spacing={14} alignItems="center" className="main-layout__header-brand">
            {isMobile ? (
              <IconButton
                appearance="subtle"
                circle
                aria-label={isSidebarVisible ? 'Alternar menu lateral' : 'Abrir menu lateral'}
                icon={isSidebarVisible ? <RiCloseLine size={18} /> : <RiMenuLine size={18} />}
                onClick={toggleSidebar}
              />
            ) : null}

            <div className="main-layout__brand-lockup">
              <div className="main-layout__brand-mark">
                <RiShieldCrossLine size={18} />
              </div>
              <VStack spacing={2} alignItems="flex-start">
                <strong>Farmacia Ambulatorial</strong>
                <span>Workspace web corporativo</span>
              </VStack>
            </div>
          </HStack>

          <HStack spacing={12} alignItems="center" className="main-layout__header-actions">
            <Whisper
              placement="bottomEnd"
              trigger="click"
              speaker={
                <Popover className="main-layout__notifications-popover">
                  <VStack spacing={14} alignItems="stretch">
                    {NOTIFICATIONS.map((notification) => (
                      <div className="main-layout__notification" key={notification.title}>
                        <strong>{notification.title}</strong>
                        <p>{notification.description}</p>
                      </div>
                    ))}
                  </VStack>
                </Popover>
              }
            >
              <Badge content={NOTIFICATIONS.length}>
                <IconButton
                  appearance="subtle"
                  circle
                  aria-label="Notificacoes"
                  icon={<RiNotification3Line size={18} />}
                />
              </Badge>
            </Whisper>

            <Whisper placement="bottomEnd" trigger="click" speaker={quickActionsSpeaker}>
              <Button appearance="primary" startIcon={<RiAddLine size={16} />}>
                {isCompactMobile ? 'Acoes' : 'Acoes rapidas'}
              </Button>
            </Whisper>

            <div className="main-layout__user-chip">
              <Avatar circle size="sm" style={{ background: '#1d4ed8' }}>
                {loggedInUser.initials}
              </Avatar>
              <VStack
                spacing={2}
                alignItems="flex-start"
                className="main-layout__user-copy"
                title={`${loggedInUser.displayName} • ${loggedInUser.roleLabel}`}
              >
                <strong>{loggedInUser.displayName}</strong>
                <span>{loggedInUser.roleLabel}</span>
              </VStack>
            </div>
          </HStack>
        </HStack>
      </Header>

      <Container className="main-layout__frame">
        {isSidebarVisible ? (
          <Sidebar
            width={sidebarWidth}
            className={`main-layout__sidebar ${isMobile ? 'main-layout__sidebar--mobile' : ''} ${
              showSidebarLabels ? 'main-layout__sidebar--expanded' : 'main-layout__sidebar--collapsed'
            }`.trim()}
            style={{ top: 0 }}
          >
            <div className="main-layout__sidebar-inner">
              <div className="main-layout__sidebar-top">
                <div className="main-layout__sidebar-brand">
                  <div className="main-layout__sidebar-logo-shell">
                    <img
                      src={sidebarLogoSrc}
                      alt=""
                      aria-hidden
                      className="main-layout__sidebar-logo"
                    />
                  </div>
                  <Button
                    appearance="subtle"
                    aria-controls={sidebarNavId}
                    aria-expanded={showSidebarLabels}
                    aria-label={sidebarToggleLabel}
                    className="main-layout__sidebar-toggle"
                    onClick={toggleSidebar}
                    title={sidebarToggleLabel}
                  >
                    <span className="main-layout__sidebar-toggle-icon-shell" aria-hidden>
                      {showSidebarLabels ? (
                        <RiArrowLeftSLine className="main-layout__sidebar-toggle-icon" size={18} />
                      ) : (
                        <RiArrowRightSLine className="main-layout__sidebar-toggle-icon" size={18} />
                      )}
                    </span>
                  </Button>
                </div>
              </div>
              <div className="main-layout__sidebar-groups">
                <Sidenav
                  appearance="subtle"
                  expanded={showSidebarLabels}
                  className="main-layout__sidenav"
                  openKeys={effectiveOpenMenuKeys}
                  onOpenChange={(nextOpenKeys) => handleMenuOpenChange(nextOpenKeys as string[])}
                >
                  <Sidenav.Body>
                    <Nav
                      id={sidebarNavId}
                      appearance="subtle"
                      className="main-layout__nav"
                      activeKey={activeSidebarKey}
                      onSelect={handleSidebarSelect}
                    >
                      {NAVIGATION_GROUPS.map((group) => {
                        if (group.title === OVERVIEW_GROUP) {
                          return group.items.flatMap((item) =>
                            isNavigationItemWithChildren(item) ? [] : (
                              <Nav.Item eventKey={item.eventKey} icon={item.icon} key={item.eventKey}>
                                {showSidebarLabels ? (
                                  <div className="main-layout__nav-item-shell" title={item.label}>
                                    <div className="main-layout__nav-item-label">
                                      <span>{item.label}</span>
                                      {item.badge ? (
                                        <small className="main-layout__nav-item-badge">{item.badge}</small>
                                      ) : null}
                                    </div>
                                  </div>
                                ) : (
                                  item.label
                                )}
                              </Nav.Item>
                            )
                          )
                        }

                        return (
                          <Nav.Menu
                            eventKey={getMenuEventKey(group.title)}
                            icon={group.icon ?? group.items[0].icon}
                            key={group.title}
                            trigger={showSidebarLabels ? 'hover' : 'click'}
                            placement={showSidebarLabels ? undefined : 'rightStart'}
                            title={group.title}
                          >
                            {renderNavigationItems(group.items, getMenuEventKey(group.title))}
                          </Nav.Menu>
                        )
                      })}
                    </Nav>
                  </Sidenav.Body>
                </Sidenav>
              </div>
            </div>
          </Sidebar>
        ) : null}

        {isMobile && isMobileSidebarOpen ? (
          <button
            type="button"
            aria-label="Fechar navegacao lateral"
            className="main-layout__backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        ) : null}

        <Container className="main-layout__content-shell">
          <Content className="main-layout__content">
            <div className="main-layout__content-stack">
              <Panel
                bordered
                className={`main-layout__page-banner ${pageBannerCompact ? 'main-layout__page-banner--compact' : ''}`.trim()}
              >
                <div className="main-layout__page-banner-grid">
                  <VStack spacing={8} alignItems="flex-start" className="main-layout__page-copy">
                    <Breadcrumb>
                      {breadcrumbItems.slice(0, -1).map((item) => (
                        <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>
                      ))}
                      <Breadcrumb.Item active>{breadcrumbItems[breadcrumbItems.length - 1] ?? pageTitle}</Breadcrumb.Item>
                    </Breadcrumb>
                    <div>
                      <h3>{pageTitle}</h3>
                      {pageDescription ? <p>{pageDescription}</p> : null}
                    </div>
                  </VStack>

                  {pageMetaVisible ? (
                    <div className="main-layout__page-meta">
                      <div>
                        <span>Status</span>
                        <strong>{pageStatus}</strong>
                      </div>
                      <div>
                        <span>Padrao</span>
                        <strong>RSuite + componentes reutilizaveis</strong>
                      </div>
                    </div>
                  ) : null}
                </div>
              </Panel>

              <div className="main-layout__page-body">{children}</div>
            </div>
          </Content>
        </Container>
      </Container>
    </Container>
  )
}

export default MainLayout
