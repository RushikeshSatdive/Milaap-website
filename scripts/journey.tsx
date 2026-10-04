/**
 * End-to-end journey test for Milaap (jsdom).
 * Walks the demo user through: invitation creation (with validation), activity
 * joins, skill listing creation, challenge tasks, notifications, search,
 * export, and finally restore/clear of local data.
 *
 *   npm run journey
 */
/* eslint-disable no-console */
import { window } from './env'

const errors: string[] = []
const originalError = console.error
console.error = (...args: unknown[]) => {
  const text = args.map((a) => (a instanceof Error ? a.stack : String(a))).join(' ')
  if (!text.includes('not wrapped in act')) {
    errors.push(text)
    originalError(...args)
  }
}

/* jsdom does not implement object URLs — record calls so we can assert the export path ran. */
const downloads: string[] = []
;(window.URL as unknown as { createObjectURL: (b: Blob) => string }).createObjectURL = (blob: Blob) => {
  downloads.push(blob.type)
  return 'blob:mock'
}
;(window.URL as unknown as { revokeObjectURL: (u: string) => void }).revokeObjectURL = () => {}
window.HTMLAnchorElement.prototype.click = function click(this: HTMLAnchorElement) {
  downloads.push(this.download || 'anchor-click')
}

const React = (await import('react')).default
const { createRoot } = await import('react-dom/client')
const { BrowserRouter } = await import('react-router-dom')
const { MilaapProvider } = await import('../src/context/AppContext')
const App = (await import('../src/App')).default

const flush = () => new Promise((resolve) => setTimeout(resolve, 70))
const store = () => JSON.parse(window.localStorage.getItem('milaap:data:v1') ?? '{}')
const setStore = (value: unknown) => window.localStorage.setItem('milaap:data:v1', JSON.stringify(value))

let failures = 0
const check = (ok: boolean, label: string, detail = '') => {
  if (ok) {
    console.log(`  v ${label}`)
  } else {
    failures += 1
    console.log(`  x ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

interface Screen {
  container: HTMLElement
  root: ReturnType<typeof createRoot>
  destroy: () => void
}

const open = async (route: string): Promise<Screen> => {
  window.history.pushState({}, '', route)
  const container = window.document.createElement('div')
  window.document.body.appendChild(container)
  const root = createRoot(container)
  root.render(
    React.createElement(BrowserRouter, null, React.createElement(MilaapProvider, null, React.createElement(App, null))),
  )
  await flush()
  await flush()
  const destroy = () => {
    root.unmount()
    container.remove()
  }
  return { container, root, destroy }
}

const text = (screen: Screen) => screen.container.textContent ?? ''

const buttons = (screen: Screen) =>
  Array.from(screen.container.querySelectorAll<HTMLButtonElement>('button'))

const findButton = (screen: Screen, label: string, index = 0) => {
  const matches = buttons(screen).filter((b) => (b.textContent ?? '').toLowerCase().includes(label.toLowerCase()))
  return matches[index]
}

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

/** Finds an input by the visible text of its <label>. */
const field = (screen: Screen, labelText: string) => {
  const label = Array.from(screen.container.querySelectorAll('label')).find((l) =>
    (l.textContent ?? '').trim().toLowerCase().startsWith(labelText.toLowerCase()),
  )
  if (!label) return undefined
  const id = label.getAttribute('for')
  return id ? screen.container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${CSS_ESCAPE(id)}`) : undefined
}

/** CSS.escape is not available in jsdom for all ids, so keep it simple. */
const CSS_ESCAPE = (value: string) => value.replace(/([^a-zA-Z0-9_-])/g, '\\$1')

const type = async (input: HTMLInputElement | HTMLTextAreaElement | undefined, value: string, label: string) => {
  if (!input) {
    failures += 1
    console.log(`  x could not find field: ${label}`)
    return
  }
  const proto = input instanceof window.HTMLTextAreaElement
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new window.Event('input', { bubbles: true }))
  await flush()
}

const selectOption = async (screen: Screen, labelText: string, value: string) => {
  const label = Array.from(screen.container.querySelectorAll('label')).find((l) =>
    (l.textContent ?? '').trim().toLowerCase().startsWith(labelText.toLowerCase()),
  )
  const id = label?.getAttribute('for')
  const select = id ? screen.container.querySelector<HTMLSelectElement>(`#${CSS_ESCAPE(id)}`) : undefined
  if (!select) {
    failures += 1
    console.log(`  x could not find select: ${labelText}`)
    return
  }
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set
  setter?.call(select, value)
  select.dispatchEvent(new window.Event('change', { bubbles: true }))
  await flush()
}

/* ------------------------------------------------------------------ *
 * 1. Seed state on a clean slate
 * ------------------------------------------------------------------ */
window.localStorage.clear()

/* ------------------------------------------------------------------ *
 * 2. Create a demo invitation from My Schedule
 * ------------------------------------------------------------------ */
console.log('\n1. Demo invitation flow (My Schedule)')
let screen = await open('/schedule')
await click(findButton(screen, 'New invitation'), 'New invitation')
check(text(screen).includes('Plan a 20-minute activity'), 'plan dialog opened')

const invitationCountBefore = (store().invitations ?? []).length
await type(field(screen, 'Title'), 'Chai and a walk with Meera', 'Title')
await click(findButton(screen, 'Create demo invitation'), 'Create demo invitation')
const afterInvite = store()
check(
  (afterInvite.invitations ?? []).length === invitationCountBefore + 1,
  'invitation created and persisted',
  `count ${invitationCountBefore} -> ${(afterInvite.invitations ?? []).length}`,
)
check(
  (afterInvite.notifications ?? []).some((n: { kind: string }) => n.kind === 'invitation'),
  'invitation generated a local notification',
)
check(text(screen).includes('Demo invitation created locally'), 'schedule shows the local-only notice')
screen.destroy()

/* --- past-date validation --- */
console.log('\n2. Rejects an invitation in the past')
screen = await open('/schedule')
await click(findButton(screen, 'New invitation'), 'New invitation')
const dateField = field(screen, 'Date') as HTMLInputElement | undefined
await type(dateField, '2020-01-01', 'Date')
const before = (store().invitations ?? []).length
await click(findButton(screen, 'Create demo invitation'), 'Create demo invitation')
check((store().invitations ?? []).length === before, 'past-dated invitation was rejected')
check(text(screen).includes('past'), 'a validation message about the past is shown')
await click(findButton(screen, 'Cancel'), 'Cancel')
screen.destroy()

/* --- mark a joined activity as completed from the schedule --- */
console.log('\n2b. Marking an activity as completed')
screen = await open('/schedule')
const completedBefore = (store().completedActivityIds ?? []).length
// Target the activity row specifically (the first row may be an invitation).
const activityRows = Array.from(screen.container.querySelectorAll<HTMLElement>('div')).filter(
  (d) => (d.textContent ?? '').includes('Digital help hour') && (d.textContent ?? '').includes('Mark completed'),
)
const activityRow = activityRows[activityRows.length - 1]
const markButton = activityRow
  ? Array.from(activityRow.querySelectorAll('button')).find((b) => (b.textContent ?? '').includes('Mark completed'))
  : undefined
await click(markButton, 'Mark completed (activity row)')
const completedAfter = (store().completedActivityIds ?? []).length
check(completedAfter === completedBefore + 1, 'activity completion persisted', `${completedBefore} -> ${completedAfter}`)
check(text(screen).includes('Completed'), 'completed status is shown in the schedule')
screen.destroy()

/* ------------------------------------------------------------------ *
 * 3. Join / save an activity
 * ------------------------------------------------------------------ */
console.log('\n3. Activities: join, save and leave')
screen = await open('/activities')
const joinBefore = (store().joinedActivityIds ?? []).length
await click(findButton(screen, 'Join activity'), 'Join activity')
const joined = store().joinedActivityIds ?? []
check(joined.length === joinBefore + 1, 'joining an activity persisted', `now ${joined.length}`)
check(text(screen).includes('Joined'), 'joined badge appears in the list')

await click(buttons(screen).find((b) => (b.getAttribute('aria-label') ?? '').includes('Save ')), 'Save activity')
check((store().savedActivityIds ?? []).length >= 1, 'saving an activity persisted')

// search actually filters
await type(
  screen.container.querySelector<HTMLInputElement>('#activity-search'),
  'zzzz-no-such-activity',
  'activity search',
)
check(text(screen).includes('No activities match these filters'), 'activity search filters the list')
screen.destroy()

/* ------------------------------------------------------------------ *
 * 4. Skill listing creation + complementary matches
 * ------------------------------------------------------------------ */
console.log('\n4. Skill Exchange')
screen = await open('/skills?tab=matches')
check(text(screen).includes('skill fit'), 'complementary skill matches are explained')

screen.destroy()
screen = await open('/skills')
await click(findButton(screen, 'Offer a skill'), 'Offer a skill')
check(text(screen).includes('Offer a skill'), 'skill offer dialog opened')
const listingCount = (store().skillListings ?? []).length
await type(field(screen, 'Skill you can teach'), 'Warli painting basics', 'Skill field')
await type(
  field(screen, 'What would someone get out of it?'),
  'A twenty-minute introduction to Warli wall art with a brush and white paint.',
  'Skill description',
)
await click(buttons(screen).find((b) => (b.textContent ?? '').includes('Weekday evenings')), 'availability chip')
await click(findButton(screen, 'Publish skill offer'), 'Publish skill offer')
check((store().skillListings ?? []).length === listingCount + 1, 'skill offer saved locally')
check(
  (store().skillListings ?? []).some((l: { skill: string; createdBy: string }) => l.skill === 'Warli painting basics' && l.createdBy === 'you'),
  'the new listing is marked as created by you',
)
screen.destroy()

/* ------------------------------------------------------------------ *
 * 5. Community challenge tasks
 * ------------------------------------------------------------------ */
console.log('\n5. Community challenges')
screen = await open('/community?challenge=c-1')
const taskCheckbox = screen.container.querySelector<HTMLInputElement>('input[type="checkbox"]')
await click(taskCheckbox as unknown as HTMLElement, 'first challenge task')
const completed = store().completedTaskIds ?? []
check(completed.length >= 1, 'task completion recorded in completedTaskIds', `ids: ${completed.length}`)
check(text(screen).includes('Challenge progress'), 'board shows a progress indicator')

await click(findButton(screen, 'Leave challenge'), 'Leave challenge')
check(
  (store().challenges ?? []).find((c: { id: string }) => c.id === 'c-1')?.joined === false,
  'leaving a challenge persisted',
)
await click(findButton(screen, 'Join challenge'), 'Join challenge')
check(
  (store().challenges ?? []).find((c: { id: string }) => c.id === 'c-1')?.joined === true,
  're-joining a challenge persisted',
)
screen.destroy()

/* ------------------------------------------------------------------ *
 * 6. Notifications
 * ------------------------------------------------------------------ */
console.log('\n6. Notifications')
screen = await open('/notifications')
const unreadBefore = (store().notifications ?? []).filter((n: { read: boolean }) => !n.read).length
check(unreadBefore > 0, 'seeded notifications start unread', `${unreadBefore} unread`)
await click(findButton(screen, 'Mark all as read'), 'Mark all as read')
check(
  (store().notifications ?? []).every((n: { read: boolean }) => n.read),
  'mark all as read persisted',
)
await click(findButton(screen, 'Clear all'), 'Clear all')
await click(findButton(screen, 'Clear notifications'), 'confirm clear')
check((store().notifications ?? []).length === 0, 'clearing notifications persisted')
screen.destroy()

/* ------------------------------------------------------------------ *
 * 7. Global search + discover filters
 * ------------------------------------------------------------------ */
console.log('\n7. Search, filters and connections')
screen = await open('/')
check(text(screen).includes('Your weekly Milaap'), 'home shows the weekly Milaap card')
check(text(screen).includes('Discover 3 people you might not normally meet.'), 'home shows the weekly prompt')
await click(findButton(screen, 'Discover People'), 'Discover People quick action')
check(window.location.pathname === '/discover', 'quick action routed to Discover People')
screen.destroy()

screen = await open('/discover')
const connectionCount = (store().connections ?? []).length
await click(findButton(screen, 'Add connection'), 'Add connection')
await click(findButton(screen, 'Add connection'), 'Add another connection')
const connections = store().connections ?? []
check(connections.length > connectionCount, 'connections added and persisted', `${connectionCount} -> ${connections.length}`)
check(
  new Set(connections.map((c: { memberId: string }) => c.memberId)).size === connections.length,
  'no duplicate connections were created',
)

await type(screen.container.querySelector<HTMLInputElement>('#discover-search'), 'photography', 'discover search')
const cards = screen.container.querySelectorAll('article')
check(cards.length > 0 && cards.length < 12, 'search narrows the profile list', `${cards.length} cards`)
await click(findButton(screen, 'Reset filters'), 'Reset filters')
check(
  screen.container.querySelectorAll('article').length === 12,
  'reset restores all sample profiles',
  `${screen.container.querySelectorAll('article').length} cards`,
)

// dismiss + restore
await click(buttons(screen).find((b) => (b.getAttribute('aria-label') ?? '').startsWith('Dismiss')), 'dismiss recommendation')
check((store().dismissedMemberIds ?? []).length === 1, 'dismissing a recommendation persisted')
screen.destroy()

/* ------------------------------------------------------------------ *
 * 8. Profile edit validation + persistence
 * ------------------------------------------------------------------ */
console.log('\n8. Profile editing')
screen = await open('/profile/edit')
await type(field(screen, 'Your name'), '', 'name field')
await click(findButton(screen, 'Save profile'), 'Save profile')
check(text(screen).includes('Please enter your name'), 'empty name is rejected with a validation message')
await type(field(screen, 'Your name'), 'Aarav Demo', 'name field')
const interestChip = buttons(screen).find((b) => (b.textContent ?? '').trim() === 'Poetry')
await click(interestChip, 'Poetry interest chip')
await click(findButton(screen, 'Save profile'), 'Save profile')
const profile = store().profile
check(profile?.name === 'Aarav Demo', 'edited name persisted')
check((profile?.interests ?? []).includes('Poetry'), 'newly added interest persisted')
check(window.location.pathname === '/profile', 'saving returns to the profile page')
screen.destroy()

/* ------------------------------------------------------------------ *
 * 9. Settings: export, restore, clear
 * ------------------------------------------------------------------ */
console.log('\n9. Settings, export and data reset')
screen = await open('/settings')
downloads.length = 0
await click(findButton(screen, 'Export as JSON'), 'Export as JSON')
check(downloads.length > 0, 'export produced a JSON download', downloads.join(', '))
check(text(screen).includes('frontend demonstration'), 'privacy statement is present verbatim')

await click(findButton(screen, 'Restore sample data'), 'Restore sample data')
await click(findButton(screen, 'Restore sample data', 1), 'confirm restore')
const restored = store()
check((restored.connections ?? []).length === 2, 'restore brought back the two sample connections')
check(restored.profile?.name === 'Aarav', 'restore brought back the sample profile')

await click(findButton(screen, 'Clear local data'), 'Clear local data')
await click(findButton(screen, 'Yes, clear my data'), 'confirm clear')
const cleared = store()
check((cleared.connections ?? []).length === 0, 'clearing removed local connections')
check((cleared.members ?? []).length === 12, 'sample members remain so the app is still usable')
check((cleared.activities ?? []).length > 0, 'sample activities remain after clearing')
screen.destroy()

/* ------------------------------------------------------------------ *
 * 10. Fresh-load behaviour after clearing
 * ------------------------------------------------------------------ */
console.log('\n10. Deep links after clearing local data')
screen = await open('/discover?focus=m-rajesh')
check(text(screen).includes('Why this match?'), 'profile deep link still opens on a cleared store')
screen.destroy()

screen = await open('/schedule')
check(text(screen).includes('Nothing scheduled'), 'empty schedule shows a real empty state')
screen.destroy()

/* ------------------------------------------------------------------ */
console.log('\nConsole errors captured:', errors.length)
for (const error of errors.slice(0, 10)) console.log('  •', String(error).slice(0, 300))

if (failures > 0 || errors.length > 0) {
  console.log(`\nJOURNEY TEST FAILED — ${failures} failures, ${errors.length} console errors`)
  process.exit(1)
}
console.log('\nJOURNEY TEST PASSED — the full demo journey works and persists')
