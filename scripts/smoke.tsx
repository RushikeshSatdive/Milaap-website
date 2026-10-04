/* eslint-disable no-console */
import { window } from './env'

const ROUTES = [
  '/',
  '/discover',
  '/discover?focus=m-sana',
  '/activities',
  '/activities?focus=a-1',
  '/skills',
  '/skills?tab=matches',
  '/skills?tab=mine',
  '/community',
  '/community?challenge=c-1',
  '/community?tab=calendar',
  '/community?tab=volunteering',
  '/community?tab=board',
  '/connections',
  '/connections?focus=m-meera',
  '/schedule',
  '/schedule?focus=inv-seed-1',
  '/notifications',
  '/profile',
  '/profile/edit',
  '/settings',
  '/definitely-not-a-route',
]

const errors: string[] = []
const originalError = console.error
console.error = (...args: unknown[]) => {
  const text = args.map((a) => (a instanceof Error ? a.stack : String(a))).join(' ')
  if (!text.includes('not wrapped in act') && !text.includes('Warning: ReactDOM.render')) {
    errors.push(text)
    originalError(...args)
  }
}
window.addEventListener('error', (e) => errors.push(`window error: ${(e as ErrorEvent).message}`))
window.addEventListener('unhandledrejection', (e) =>
  errors.push(`unhandled rejection: ${String((e as PromiseRejectionEvent).reason)}`),
)

const React = (await import('react')).default
const { createRoot } = await import('react-dom/client')
const { BrowserRouter } = await import('react-router-dom')
const { MilaapProvider } = await import('../src/context/AppContext')
const App = (await import('../src/App')).default

const flush = () => new Promise((resolve) => setTimeout(resolve, 60))

const mount = (container: HTMLElement) => {
  const root = createRoot(container)
  root.render(
    React.createElement(BrowserRouter, null, React.createElement(MilaapProvider, null, React.createElement(App, null))),
  )
  return root
}

let failures = 0
console.log('Route rendering:')

for (const route of ROUTES) {
  window.history.pushState({}, '', route)
  const container = window.document.createElement('div')
  window.document.body.appendChild(container)
  const root = mount(container)
  try {
    await flush()
    await flush()
    const text = container.textContent ?? ''
    if (text.trim().length < 120) {
      failures += 1
      console.log(`  x ${route} — rendered almost nothing (${text.trim().length} chars)`)
    } else {
      console.log(`  v ${route} — ${text.trim().length} chars`)
    }
  } catch (error) {
    failures += 1
    console.log(`  x ${route} — threw: ${(error as Error)?.message ?? error}`)
    errors.push(`${route}: ${(error as Error)?.stack}`)
  } finally {
    root.unmount()
    container.remove()
  }
}

/* --------------------------- interactions --------------------------- */
console.log('\nInteraction checks:')
const container = window.document.createElement('div')
window.document.body.appendChild(container)
window.history.pushState({}, '', '/discover')
let root = mount(container)
await flush()
await flush()

const query = (scope: HTMLElement, selector: string) => Array.from(scope.querySelectorAll<HTMLElement>(selector))
const findAll = (selector: string) => query(container, selector)
const findButton = (label: string) =>
  findAll('button').find((b) => (b.textContent ?? '').toLowerCase().includes(label.toLowerCase()))

const click = async (element: HTMLElement | undefined, label: string) => {
  if (!element) {
    failures += 1
    console.log(`  x could not find control: ${label}`)
    return false
  }
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
  await flush()
  await flush()
  return true
}

const readStore = () => JSON.parse(window.localStorage.getItem('milaap:data:v1') ?? '{}')

await click(findButton('Add connection'), 'Add connection')
const afterAdd = readStore()
if ((afterAdd.connections ?? []).length >= 3) {
  console.log(`  v add connection persisted (${afterAdd.connections.length} stored)`)
} else {
  failures += 1
  console.log('  x add connection did not persist')
}

await click(findButton('Filters'), 'Filters panel')
console.log(
  container.textContent?.includes('Sort: Best match first') ? '  v filter panel opened' : '  x filter panel did not open',
)

const sharedToggle = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
await click(sharedToggle as unknown as HTMLElement, 'shared-only toggle')
console.log('  v shared-only toggle handled without error')

// Open the first profile detail modal
await click(findButton('Details'), 'Details button')
const dialog = container.querySelector('[role="dialog"]')
if (dialog) {
  console.log('  v profile detail dialog opened')
  const hasWhy = (dialog.textContent ?? '').includes('Why this match?')
  console.log(hasWhy ? '  v dialog explains the match' : '  x dialog is missing the match explanation')
} else {
  failures += 1
  console.log('  x profile detail dialog did not open')
}

root.unmount()
container.remove()

/* ------------------- deep-link modal + schedule flow ------------------- */
console.log('\nDeep links:')
for (const [route, expectation] of [
  ['/discover?focus=m-sana', 'Why this match?'],
  ['/activities?focus=a-1', 'Sample participants'],
  ['/community?challenge=c-1', 'Task list'],
  ['/schedule?focus=inv-seed-1', 'Demo invitation created locally'],
] as const) {
  window.history.pushState({}, '', route)
  const deepContainer = window.document.createElement('div')
  window.document.body.appendChild(deepContainer)
  const deepRoot = mount(deepContainer)
  await flush()
  await flush()
  const text = deepContainer.textContent ?? ''
  if (text.includes(expectation)) {
    console.log(`  v ${route} shows “${expectation}”`)
  } else {
    failures += 1
    console.log(`  x ${route} does not show “${expectation}”`)
  }
  deepRoot.unmount()
  deepContainer.remove()
}

/* ------------------------- persistence + theme ------------------------- */
console.log('\nPersistence:')
window.history.pushState({}, '', '/settings')
const settingsContainer = window.document.createElement('div')
window.document.body.appendChild(settingsContainer)
root = mount(settingsContainer)
await flush()
await flush()

const darkOption = Array.from(settingsContainer.querySelectorAll('button')).find((b) =>
  (b.textContent ?? '').startsWith('Dark'),
)
await click(darkOption as HTMLElement, 'Dark theme card')
const themed = readStore()
if (themed.settings?.theme === 'dark') {
  console.log('  v theme change persisted (dark)')
} else {
  failures += 1
  console.log('  x theme change did not persist')
}
console.log(
  window.document.documentElement.classList.contains('dark')
    ? '  v <html> received the dark class'
    : '  x dark class missing on <html>',
)

const reduceSwitch = query(settingsContainer, '[role="switch"]')[0]
await click(reduceSwitch, 'Reduce motion switch')
console.log(
  window.document.documentElement.classList.contains('reduce-motion')
    ? '  v reduce-motion class applied'
    : '  x reduce-motion class not applied',
)

root.unmount()
settingsContainer.remove()

/* --------------------------- profile editing --------------------------- */
console.log('\nProfile editing:')
window.history.pushState({}, '', '/profile/edit')
const editContainer = window.document.createElement('div')
window.document.body.appendChild(editContainer)
root = mount(editContainer)
await flush()
await flush()

const nameInput = editContainer.querySelector<HTMLInputElement>('#profile-field-name input')
if (nameInput) {
  // Use the native setter so React's value tracker registers the change.
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
  setter?.call(nameInput, 'Aarav Test')
  nameInput.dispatchEvent(new window.Event('input', { bubbles: true }))
  await flush()
  const saveButton = Array.from(editContainer.querySelectorAll('button')).find((b) =>
    (b.textContent ?? '').toLowerCase().includes('save profile'),
  )
  await click(saveButton as HTMLElement, 'Save profile')
  const saved = readStore()
  if (saved.profile?.name === 'Aarav Test') {
    console.log('  v profile edit saved to localStorage')
  } else {
    failures += 1
    console.log(`  x profile edit not saved (found “${saved.profile?.name}”)`)
  }
} else {
  failures += 1
  console.log('  x could not find the name field')
}

root.unmount()
editContainer.remove()

console.log('\nConsole errors captured:', errors.length)
for (const error of errors.slice(0, 12)) console.log('  •', String(error).slice(0, 300))

if (failures > 0 || errors.length > 0) {
  console.log(`\nSMOKE TEST FAILED — ${failures} failures, ${errors.length} console errors`)
  process.exit(1)
}
console.log('\nSMOKE TEST PASSED — routes render, key flows persist, no console errors')
