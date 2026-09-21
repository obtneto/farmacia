import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  Avatar,
  Badge,
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
  type WhisperInstance,
  useMediaQuery,
} from 'rsuite'
import {
  RiArrowLeftSLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiMenuLine,
  RiNotification3Line,
  RiCheckDoubleLine,
  RiInformationLine,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiArrowRightLine,
  RiInboxLine,
  RiDeleteBin6Line,
} from 'react-icons/ri'
import { NAVIGATION_GROUPS, type NavigationItem, type SectionKey } from '../config/navigation'
import { getApiBaseUrl } from '../lib/api-base-url'
import './MainLayout.css'

const SIDEBAR_EXPANDED = 322
const SIDEBAR_COLLAPSED = 88
const USER_PROFILE_EXPANDED_DURATION_MS = 10000
const PUBLIC_BASE_URL = import.meta.env.BASE_URL
const getPublicAssetUrl = (assetName: string) => `${PUBLIC_BASE_URL}${assetName}`
const HEADER_LOGO = {
  src: getPublicAssetUrl('logo_simple.png'),
  width: 358,
  height: 459,
}
const SIDEBAR_EXPANDED_LOGO = {
  src: getPublicAssetUrl('logo.png'),
  width: 1353,
  height: 409,
}
const SIDEBAR_COLLAPSED_LOGO = {
  src: getPublicAssetUrl('logo-icon.png'),
  width: 512,
  height: 512,
}
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
const API_BASE_URL = getApiBaseUrl()

type HeaderNotification = {
  id: string
  title: string
  description: string
  actionLabel?: string
  actionSectionKey?: SectionKey
  tone?: 'info' | 'warning' | 'success' | 'danger'
  read?: boolean
  createdAt?: string
  critical?: boolean
}

type NotificationsPayload = {
  notifications?: HeaderNotification[]
}

type NotificationRemovePayload = {
  id?: string
}

const isNavigationItemWithChildren = (item: NavigationItem): item is Extract<NavigationItem, { children: NavigationItem[] }> =>
  'children' in item

const normalizeMenuSegment = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const getMenuEventKey = (...segments: string[]) => `menu-${segments.map(normalizeMenuSegment).join('-')}`
const getNestedMenuEventKey = (parentMenuKey: string, itemLabel: string) =>
  `${parentMenuKey}-submenu-${normalizeMenuSegment(itemLabel)}`

const collectLeafSectionKeys = (items: NavigationItem[]): SectionKey[] =>
  items.flatMap((item) => (isNavigationItemWithChildren(item) ? collectLeafSectionKeys(item.children) : [item.eventKey]))

const SIDEBAR_SECTION_KEY_LIST = NAVIGATION_GROUPS.flatMap((group) => collectLeafSectionKeys(group.items))
const SIDEBAR_SECTION_KEYS = new Set<SectionKey>(SIDEBAR_SECTION_KEY_LIST)

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

function parseServerEventData(event: Event): unknown {
  if (!(event instanceof MessageEvent) || typeof event.data !== 'string') {
    return null
  }

  try {
    return JSON.parse(event.data)
  } catch {
    return null
  }
}

function normalizeSectionKey(value: unknown): SectionKey | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  return SIDEBAR_SECTION_KEY_LIST.find((sectionKey) => sectionKey === value)
}

function normalizeNotificationTone(value: unknown): HeaderNotification['tone'] {
  if (value === 'info' || value === 'warning' || value === 'success' || value === 'danger') {
    return value
  }

  return undefined
}

function normalizeHeaderNotification(value: unknown): HeaderNotification | null {
  if (
    value
    && typeof value === 'object'
    && 'id' in value
    && 'title' in value
    && 'description' in value
    && typeof value.id === 'string'
    && typeof value.title === 'string'
    && typeof value.description === 'string'
  ) {
    return {
      id: value.id,
      title: value.title,
      description: value.description,
      actionLabel: 'actionLabel' in value && typeof value.actionLabel === 'string' ? value.actionLabel : undefined,
      actionSectionKey: 'actionSectionKey' in value ? normalizeSectionKey(value.actionSectionKey) : undefined,
      createdAt: 'createdAt' in value && typeof value.createdAt === 'string' ? value.createdAt : undefined,
      read: 'read' in value && typeof value.read === 'boolean' ? value.read : false,
      tone: 'tone' in value ? normalizeNotificationTone(value.tone) : undefined,
      critical: 'critical' in value && typeof value.critical === 'boolean' ? value.critical : undefined,
    }
  }

  return null
}

function normalizeNotificationsPayload(payload: unknown): HeaderNotification[] {
  if (!payload || typeof payload !== 'object' || !('notifications' in payload)) {
    return []
  }

  const notificationsValue = payload.notifications

  if (!Array.isArray(notificationsValue)) {
    return []
  }

  return notificationsValue.flatMap((item) => {
    const notification = normalizeHeaderNotification(item)
    return notification ? [notification] : []
  })
}

function normalizeNotificationPayload(payload: unknown): HeaderNotification | null {
  return normalizeHeaderNotification(payload)
}

function normalizeNotificationRemovePayload(payload: unknown): NotificationRemovePayload {
  if (payload && typeof payload === 'object' && 'id' in payload && typeof payload.id === 'string') {
    return { id: payload.id }
  }

  return {}
}

function markNotificationRead(notifications: HeaderNotification[], notificationId: string): HeaderNotification[] {
  return notifications.map((notification) =>
    notification.id === notificationId
      ? { ...notification, read: true }
      : notification
  )
}

function getNotificationToneIcon(tone?: HeaderNotification['tone']) {
  switch (tone) {
    case 'warning':
      return <RiAlertLine className="main-layout__notification-tone-icon main-layout__notification-tone-icon--warning" />
    case 'success':
      return <RiCheckboxCircleLine className="main-layout__notification-tone-icon main-layout__notification-tone-icon--success" />
    case 'danger':
      return <RiErrorWarningLine className="main-layout__notification-tone-icon main-layout__notification-tone-icon--danger" />
    case 'info':
    default:
      return <RiInformationLine className="main-layout__notification-tone-icon main-layout__notification-tone-icon--info" />
  }
}

function formatNotificationTime(createdAt?: string): string | null {
  if (!createdAt) return null
  try {
    const date = new Date(createdAt)
    if (isNaN(date.getTime())) return createdAt
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diffSeconds < 60) return 'Agora'
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min`
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return createdAt
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
  onSidebarSelect?: (eventKey: SectionKey) => void
  pageBannerCompact?: boolean
  pageDescription?: string
  pageMetaVisible?: boolean
  pageStatus?: string
  pageTitle?: string
}

export function MainLayout({
  activeSidebarKey,
  children,
  onSidebarSelect,
  pageBannerCompact = false,
  pageDescription,
  pageMetaVisible = true,
  pageStatus = 'Operacao ativa',
  pageTitle = 'Dashboard corporativo',
}: MainLayoutProps) {
  const [isMobile] = useMediaQuery('(max-width: 991px)')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isUserProfileExpanded, setIsUserProfileExpanded] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUserProfile>(() => getLoggedInUserProfile())
  const [notifications, setNotifications] = useState<HeaderNotification[]>([])
  const notificationsWhisperRef = useRef<WhisperInstance>(null)
  const userProfileCollapseTimeoutRef = useRef<number | undefined>(undefined)

  const sidebarWidth = isMobile
    ? SIDEBAR_EXPANDED
    : isSidebarExpanded
      ? SIDEBAR_EXPANDED
      : SIDEBAR_COLLAPSED

  const isSidebarVisible = !isMobile || isMobileSidebarOpen
  const showSidebarLabels = isSidebarExpanded || isMobile
  const sidebarLogo = showSidebarLabels ? SIDEBAR_EXPANDED_LOGO : SIDEBAR_COLLAPSED_LOGO
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
  const sidebarToggleLabel = isMobile
    ? isSidebarVisible
      ? 'Fechar menu lateral'
      : 'Abrir menu lateral'
    : showSidebarLabels
      ? 'Recolher menu lateral'
      : 'Expandir menu lateral'
  const userProfileToggleLabel = isUserProfileExpanded ? 'Recolher dados do usuario' : 'Expandir dados do usuario por 10 segundos'

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

  useEffect(() => {
    return () => {
      if (userProfileCollapseTimeoutRef.current !== undefined) {
        window.clearTimeout(userProfileCollapseTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let isActive = true
    const authToken = readStoredAuthToken()
    const streamUrl = new URL(`${API_BASE_URL}/notificacoes/stream`)

    if (authToken) {
      streamUrl.searchParams.set('token', authToken)
    }

    void fetch(`${API_BASE_URL}/notificacoes/listar`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    })
      .then((response) => response.json())
      .then((payload: { data?: NotificationsPayload }) => {
        if (isActive) {
          setNotifications(normalizeNotificationsPayload(payload.data))
        }
      })
      .catch(() => undefined)

    const eventSource = new EventSource(streamUrl.toString(), { withCredentials: true })

    eventSource.addEventListener('snapshot', (event) => {
      setNotifications(normalizeNotificationsPayload(parseServerEventData(event)))
    })

    eventSource.addEventListener('notification', (event) => {
      const notification = normalizeNotificationPayload(parseServerEventData(event))

      if (!notification) {
        return
      }

      setNotifications((current) => [notification, ...current.filter((item) => item.id !== notification.id)])

      if (notification.critical) {
        notificationsWhisperRef.current?.open()
      }
    })

    eventSource.addEventListener('clear', () => {
      setNotifications([])
    })

    eventSource.addEventListener('remove', (event) => {
      const payload = normalizeNotificationRemovePayload(parseServerEventData(event))

      if (payload.id) {
        setNotifications((current) => current.filter((notification) => notification.id !== payload.id))
      }
    })

    eventSource.addEventListener('read', (event) => {
      const notification = normalizeNotificationPayload(parseServerEventData(event))

      if (!notification) {
        return
      }

      setNotifications((current) => current.map((item) => (item.id === notification.id ? notification : item)))
    })

    eventSource.onerror = () => {
      eventSource.close()
    }

    return () => {
      isActive = false
      eventSource.close()
    }
  }, [])

  const handleUserProfileToggle = () => {
    if (userProfileCollapseTimeoutRef.current !== undefined) {
      window.clearTimeout(userProfileCollapseTimeoutRef.current)
      userProfileCollapseTimeoutRef.current = undefined
    }

    if (isUserProfileExpanded) {
      setIsUserProfileExpanded(false)
      return
    }

    setIsUserProfileExpanded(true)
    userProfileCollapseTimeoutRef.current = window.setTimeout(() => {
      setIsUserProfileExpanded(false)
      userProfileCollapseTimeoutRef.current = undefined
    }, USER_PROFILE_EXPANDED_DURATION_MS)
  }

  const markNotificationAsRead = (notification: HeaderNotification) => {
    setNotifications((current) => markNotificationRead(current, notification.id))

    const authToken = readStoredAuthToken()

    void fetch(`${API_BASE_URL}/notificacoes/read/${encodeURIComponent(notification.id)}`, {
      method: 'PATCH',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    }).catch(() => undefined)
  }

  const handleOpenNotification = (notification: HeaderNotification) => {
    markNotificationAsRead(notification)

    if (notification.actionSectionKey) {
      onSidebarSelect?.(notification.actionSectionKey)
    }
  }

  const handleMarkAllNotificationsRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))

    const authToken = readStoredAuthToken()
    void fetch(`${API_BASE_URL}/notificacoes/mark-all-read`, {
      method: 'PATCH',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    }).catch(() => undefined)
  }

  const handleRemoveNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    e.preventDefault()

    setNotifications((current) => current.filter((notification) => notification.id !== notificationId))

    const authToken = readStoredAuthToken()
    void fetch(`${API_BASE_URL}/notificacoes/${encodeURIComponent(notificationId)}`, {
      method: 'DELETE',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    }).catch(() => undefined)
  }

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

  const unreadNotificationsCount = notifications.filter((notification) => !notification.read).length

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
                <img
                  src={HEADER_LOGO.src}
                  alt=""
                  aria-hidden
                  width={HEADER_LOGO.width}
                  height={HEADER_LOGO.height}
                  className="main-layout__brand-logo"
                />
              </div>
              <VStack spacing={2} alignItems="flex-start">
                <strong>Fundação de Saude Parreira Horta</strong>
                <span>HEMOSE - Hemocentro de Sergipe</span>
              </VStack>
            </div>
          </HStack>

          <HStack spacing={12} alignItems="center" className="main-layout__header-actions">
            <Whisper
              ref={notificationsWhisperRef}
              placement="bottomEnd"
              trigger="click"
              speaker={
                <Popover className="main-layout__notifications-popover">
                  <div className="main-layout__notifications-header">
                    <div className="main-layout__notifications-title-group">
                      <h4 className="main-layout__notifications-title">Notificações</h4>
                      {unreadNotificationsCount > 0 ? (
                        <span className="main-layout__notifications-badge">
                          {unreadNotificationsCount} {unreadNotificationsCount === 1 ? 'nova' : 'novas'}
                        </span>
                      ) : (
                        <span className="main-layout__notifications-badge main-layout__notifications-badge--all-read">
                          Lidas
                        </span>
                      )}
                    </div>
                    {unreadNotificationsCount > 0 ? (
                      <Button
                        appearance="subtle"
                        size="xs"
                        className="main-layout__notifications-mark-all"
                        onClick={handleMarkAllNotificationsRead}
                        title="Marcar todas como lidas"
                      >
                        <RiCheckDoubleLine size={15} />
                        <span>Marcar lidas</span>
                      </Button>
                    ) : null}
                  </div>

                  <div className="main-layout__notifications-body">
                    {notifications.length > 0 ? (
                      <div className="main-layout__notifications-list">
                        {notifications.map((notification) => {
                          const formattedTime = formatNotificationTime(notification.createdAt)
                          const isUnread = !notification.read

                          if (notification.actionSectionKey) {
                            return (
                              <Button
                                appearance="subtle"
                                className={`main-layout__notification main-layout__notification--interactive ${
                                  isUnread ? 'main-layout__notification--unread' : 'main-layout__notification--read'
                                } ${notification.tone ? `main-layout__notification--tone-${notification.tone}` : ''}`.trim()}
                                key={notification.id}
                                onClick={() => handleOpenNotification(notification)}
                              >
                                <div className="main-layout__notification-icon-wrapper">
                                  {getNotificationToneIcon(notification.tone)}
                                </div>
                                <div className="main-layout__notification-content">
                                  <div className="main-layout__notification-top">
                                    <strong className="main-layout__notification-title">{notification.title}</strong>
                                    <div className="main-layout__notification-meta">
                                      {formattedTime ? (
                                        <span className="main-layout__notification-time">{formattedTime}</span>
                                      ) : null}
                                      <Button
                                        appearance="subtle"
                                        size="xs"
                                        className="main-layout__notification-delete-btn"
                                        aria-label="Excluir notificação"
                                        title="Excluir notificação"
                                        onClick={(e) => handleRemoveNotification(e, notification.id)}
                                      >
                                        <RiDeleteBin6Line size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="main-layout__notification-desc">{notification.description}</p>
                                  <div className="main-layout__notification-footer">
                                    <span className="main-layout__notification-action">
                                      {notification.actionLabel || 'Abrir'}
                                      <RiArrowRightLine size={14} className="main-layout__notification-action-icon" />
                                    </span>
                                    {isUnread ? <span className="main-layout__notification-dot" aria-label="Não lida" /> : null}
                                  </div>
                                </div>
                              </Button>
                            )
                          }

                          return (
                            <div
                              className={`main-layout__notification ${
                                isUnread ? 'main-layout__notification--unread' : 'main-layout__notification--read'
                              } ${notification.tone ? `main-layout__notification--tone-${notification.tone}` : ''}`.trim()}
                              key={notification.id}
                              onClick={() => handleOpenNotification(notification)}
                            >
                              <div className="main-layout__notification-icon-wrapper">
                                {getNotificationToneIcon(notification.tone)}
                              </div>
                              <div className="main-layout__notification-content">
                                <div className="main-layout__notification-top">
                                  <strong className="main-layout__notification-title">{notification.title}</strong>
                                  <div className="main-layout__notification-meta">
                                    {formattedTime ? (
                                      <span className="main-layout__notification-time">{formattedTime}</span>
                                    ) : null}
                                    <Button
                                      appearance="subtle"
                                      size="xs"
                                      className="main-layout__notification-delete-btn"
                                      aria-label="Excluir notificação"
                                      title="Excluir notificação"
                                      onClick={(e) => handleRemoveNotification(e, notification.id)}
                                    >
                                      <RiDeleteBin6Line size={14} />
                                    </Button>
                                  </div>
                                </div>
                                <p className="main-layout__notification-desc">{notification.description}</p>
                                {isUnread ? (
                                  <div className="main-layout__notification-footer">
                                    <span className="main-layout__notification-dot" aria-label="Não lida" />
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="main-layout__notification-empty-state">
                        <div className="main-layout__notification-empty-icon">
                          <RiInboxLine size={30} />
                        </div>
                        <strong>Nenhuma notificação</strong>
                        <p>Você está em dia! Novos alertas e atualizações aparecerão aqui.</p>
                      </div>
                    )}
                  </div>
                </Popover>
              }
            >
              <Badge content={unreadNotificationsCount}>
                <IconButton
                  appearance="subtle"
                  circle
                  aria-label={`${unreadNotificationsCount} notificacoes nao lidas`}
                  icon={<RiNotification3Line size={18} />}
                />
              </Badge>
            </Whisper>

            <Button
              appearance="subtle"
              aria-expanded={isUserProfileExpanded}
              aria-label={userProfileToggleLabel}
              className={`main-layout__user-chip ${isUserProfileExpanded ? 'main-layout__user-chip--expanded' : 'main-layout__user-chip--collapsed'}`.trim()}
              onClick={handleUserProfileToggle}
              title={`${userProfileToggleLabel}: ${loggedInUser.displayName} • ${loggedInUser.roleLabel}`}
            >
              <Avatar circle size="sm" style={{ background: '#1d4ed8' }}>
                {loggedInUser.initials}
              </Avatar>
              {isUserProfileExpanded ? (
                <VStack
                  spacing={2}
                  alignItems="flex-start"
                  className="main-layout__user-copy"
                >
                  <strong>{loggedInUser.displayName}</strong>
                  <span>{loggedInUser.roleLabel}</span>
                </VStack>
              ) : null}
            </Button>
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
                      src={sidebarLogo.src}
                      alt=""
                      aria-hidden
                      width={sidebarLogo.width}
                      height={sidebarLogo.height}
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
                className={`main-layout__page-shell ${pageBannerCompact ? 'main-layout__page-shell--compact' : ''}`.trim()}
              >
                {activeSidebarKey !== 'inicio' ? (
                  <div className="main-layout__page-header">
                    <div className="main-layout__page-copy">
                      <h3>{pageTitle}</h3>
                      {pageDescription ? <p>{pageDescription}</p> : null}
                    </div>

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
                ) : null}

                <div className="main-layout__page-body">{children}</div>
              </Panel>
            </div>
          </Content>
        </Container>
      </Container>
    </Container>
  )
}

export default MainLayout
