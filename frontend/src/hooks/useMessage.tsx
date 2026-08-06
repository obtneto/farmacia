import type { ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import Swal from 'sweetalert2'
import type { SweetAlertIcon, SweetAlertOptions, SweetAlertResult } from 'sweetalert2'

type MessageType = 'error' | 'info' | 'success' | 'warning'

type MessageOptions = {
  icon?: MessageType
  text?: ReactNode
  title: string
}

type NotifyOptions = {
  icon?: MessageType
  persistent?: boolean
  text?: ReactNode
  title: string
}

export interface ConfirmDestructiveOptions {
  cancelText?: string
  confirmText?: string
  description: string
  highlightedDescription?: string
  highlightedLabel?: string
  inputLabel?: string
  inputMaxLength?: number
  inputPlaceholder?: string
  inputRequiredMessage?: string
  intentLabel?: string
  onConfirm: (inputValue?: string) => Promise<void>
  subtitle?: string
  title: string
}

export interface ConfirmActionOptions {
  cancelText?: string
  confirmText?: string
  description: string
  highlightedDescription?: string
  highlightedLabel?: string
  intentLabel?: string
  onConfirm: () => Promise<void>
  subtitle?: string
  title: string
}

const DEFAULT_ERROR_MESSAGE = 'Falha ao processar solicitacao.'
const CONFIRM_TEXTAREA_ID = 'app-confirm-dialog-input'
const CONFIRM_COUNTER_ID = 'app-confirm-dialog-input-counter'

function getErrorText(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return DEFAULT_ERROR_MESSAGE
}

export function getErrorMessage(error: unknown, fallbackMessage = DEFAULT_ERROR_MESSAGE): string {
  const message = getErrorText(error)
  return message === DEFAULT_ERROR_MESSAGE ? fallbackMessage : message
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function getContentText(text?: ReactNode): string | undefined {
  return typeof text === 'string' ? text : undefined
}

function getReactContent(text?: ReactNode): { element?: HTMLElement; root?: Root } {
  if (!text || typeof text === 'string' || typeof text === 'number') {
    return {}
  }

  const element = document.createElement('div')
  const root = createRoot(element)
  root.render(<div className="app-notification__content">{text}</div>)

  return { element, root }
}

function getSweetAlertTarget(): HTMLElement {
  const modalWrappers = Array.from(document.querySelectorAll<HTMLElement>('.rs-modal-wrapper'))
  return modalWrappers.at(-1) ?? document.body
}

function getToast(type: MessageType, title: string, text?: ReactNode, persistent = false): Promise<SweetAlertResult> {
  const content = getReactContent(text)
  const Toast = Swal.mixin({
    customClass: {
      popup: 'app-message-toast',
    },
    didDestroy: () => content.root?.unmount(),
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
    position: 'top-end',
    showConfirmButton: false,
    timer: persistent ? undefined : 3600,
    timerProgressBar: !persistent,
    toast: true,
  })

  const options: SweetAlertOptions = {
    icon: type,
    title,
  }

  if (content.element) {
    options.html = content.element
  } else {
    options.text = getContentText(text)
  }

  return Toast.fire(options)
}

function renderHighlightedDescription(description?: string, label?: string): string {
  if (!description?.trim()) {
    return ''
  }

  return `
    <div class="app-confirm-dialog__highlight app-notification__reference">
      <span class="app-confirm-dialog__highlight-label app-notification__reference-label">${escapeHtml(label ?? 'Descricao do item')}</span>
      <strong class="app-confirm-dialog__highlight-value app-notification__reference-id">${escapeHtml(description)}</strong>
    </div>
  `
}

function renderConfirmInput(options: ConfirmDestructiveOptions): string {
  if (!options.inputRequiredMessage) {
    return ''
  }

  const maxLength = options.inputMaxLength ?? 255

  return `
    <div class="app-confirm-dialog__field">
      <div class="app-confirm-dialog__field-header">
        <label class="app-confirm-dialog__field-label" for="${CONFIRM_TEXTAREA_ID}">${escapeHtml(options.inputLabel ?? 'Justificativa')}</label>
        <span class="app-confirm-dialog__field-counter" id="${CONFIRM_COUNTER_ID}">0/${maxLength}</span>
      </div>
      <textarea
        aria-required="true"
        class="app-confirm-dialog__textarea"
        id="${CONFIRM_TEXTAREA_ID}"
        maxlength="${maxLength}"
        placeholder="${escapeHtml(options.inputPlaceholder ?? '')}"
        required
        rows="4"
      ></textarea>
    </div>
  `
}

function buildConfirmHtml(options: ConfirmDestructiveOptions): string {
  return `
    <div class="app-confirm-dialog">
      <div class="app-confirm-dialog__header">
        <div class="app-confirm-dialog__copy">
          <h2 class="app-confirm-dialog__title">${escapeHtml(options.title)}</h2>
          ${options.subtitle ? `<p class="app-confirm-dialog__subtitle">${escapeHtml(options.subtitle)}</p>` : ''}
        </div>
        <span class="app-confirm-dialog__intent">${escapeHtml(options.intentLabel ?? 'Exclusao')}</span>
      </div>
      <div class="app-confirm-dialog__body">
        ${renderHighlightedDescription(options.highlightedDescription, options.highlightedLabel)}
        <p class="app-confirm-dialog__description">${escapeHtml(options.description)}</p>
        ${renderConfirmInput(options)}
      </div>
    </div>
  `
}

async function confirmDestructive(options: ConfirmDestructiveOptions): Promise<boolean> {
  const result = await Swal.fire({
    allowEscapeKey: () => !Swal.isLoading(),
    allowOutsideClick: () => !Swal.isLoading(),
    buttonsStyling: false,
    cancelButtonText: options.cancelText ?? 'Cancelar',
    confirmButtonText: options.confirmText ?? 'Excluir registro',
    customClass: {
      actions: 'app-confirm-dialog__actions',
      cancelButton: 'app-confirm-dialog__button app-confirm-dialog__button--cancel',
      confirmButton: 'app-confirm-dialog__button app-confirm-dialog__button--confirm',
      loader: 'app-confirm-dialog__loader',
      popup: 'app-confirm-dialog__popup',
      validationMessage: 'app-confirm-dialog__validation',
    },
    focusCancel: !options.inputRequiredMessage,
    focusConfirm: false,
    html: buildConfirmHtml(options),
    icon: undefined,
    padding: 0,
    target: getSweetAlertTarget(),
    didOpen: () => {
      const textareaElement = document.getElementById(CONFIRM_TEXTAREA_ID)
      const counterElement = document.getElementById(CONFIRM_COUNTER_ID)

      if (!(textareaElement instanceof HTMLTextAreaElement) || !counterElement) {
        return
      }

      const maxLength = options.inputMaxLength ?? 255
      textareaElement.disabled = false
      textareaElement.readOnly = false
      const updateCounter = () => {
        counterElement.textContent = `${textareaElement.value.length}/${maxLength}`
      }

      updateCounter()
      textareaElement.addEventListener('input', updateCounter)
      window.setTimeout(() => textareaElement.focus(), 0)
    },
    preConfirm: async () => {
      const textareaElement = document.getElementById(CONFIRM_TEXTAREA_ID)
      const inputValue = options.inputRequiredMessage && textareaElement instanceof HTMLTextAreaElement
        ? textareaElement.value.trim()
        : undefined
      const maxLength = options.inputMaxLength ?? 255

      if (options.inputRequiredMessage && !inputValue) {
        Swal.showValidationMessage(options.inputRequiredMessage)
        return false
      }

      if (inputValue && inputValue.length > maxLength) {
        Swal.showValidationMessage(`Informe no maximo ${maxLength} caracteres.`)
        return false
      }

      try {
        await options.onConfirm(inputValue)
      } catch (error) {
        Swal.showValidationMessage(getErrorText(error))
        return false
      }

      return true
    },
    reverseButtons: false,
    showCancelButton: true,
    showCloseButton: true,
    showConfirmButton: true,
    showLoaderOnConfirm: true,
  })

  return result.isConfirmed
}

async function confirmAction(options: ConfirmActionOptions): Promise<boolean> {
  const result = await Swal.fire({
    allowEscapeKey: () => !Swal.isLoading(),
    allowOutsideClick: () => !Swal.isLoading(),
    buttonsStyling: false,
    cancelButtonText: options.cancelText ?? 'Cancelar',
    confirmButtonText: options.confirmText ?? 'Confirmar',
    customClass: {
      actions: 'app-confirm-dialog__actions',
      cancelButton: 'app-confirm-dialog__button app-confirm-dialog__button--cancel',
      confirmButton: 'app-confirm-dialog__button app-confirm-dialog__button--confirm',
      loader: 'app-confirm-dialog__loader',
      popup: 'app-confirm-dialog__popup',
      validationMessage: 'app-confirm-dialog__validation',
    },
    focusCancel: true,
    html: buildConfirmHtml({
      ...options,
      intentLabel: options.intentLabel ?? 'Confirmacao',
    }),
    icon: undefined,
    padding: 0,
    preConfirm: async () => {
      try {
        await options.onConfirm()
      } catch (error) {
        Swal.showValidationMessage(getErrorText(error))
        return false
      }

      return true
    },
    reverseButtons: false,
    showCancelButton: true,
    showCloseButton: true,
    showConfirmButton: true,
    showLoaderOnConfirm: true,
  })

  return result.isConfirmed
}

function showDialog(icon: SweetAlertIcon, title: string, text?: ReactNode): Promise<SweetAlertResult> {
  const content = getReactContent(text)
  const options: SweetAlertOptions = {
    confirmButtonText: 'Ok',
    customClass: {
      popup: 'app-message-dialog',
    },
    didDestroy: () => content.root?.unmount(),
    icon,
    title,
  }

  if (content.element) {
    options.html = content.element
  } else {
    options.text = getContentText(text)
  }

  return Swal.fire(options)
}

export function useMessage() {
  return {
    confirmAction,
    confirmDestructive,
    error: (title: string, text?: ReactNode) => getToast('error', title, text),
    info: (title: string, text?: ReactNode) => getToast('info', title, text),
    message: ({ icon = 'info', text, title }: MessageOptions) => showDialog(icon, title, text),
    notify: ({ icon = 'info', persistent = false, text, title }: NotifyOptions) =>
      getToast(icon, title, text, persistent),
    success: (title: string, text?: ReactNode) => getToast('success', title, text),
    warning: (title: string, text?: ReactNode) => getToast('warning', title, text),
  }
}

export default useMessage
