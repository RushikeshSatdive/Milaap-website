/* jsdom environment for the Milaap smoke test. Imported first so that the
   browser globals exist before react-dom is loaded. */
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true,
})

const { window } = dom

interface MediaQueryLike {
  matches: boolean
  media: string
  onchange: null
  addEventListener: () => void
  removeEventListener: () => void
}

window.matchMedia =
  window.matchMedia ||
  ((query: string): MediaQueryLike => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))

window.scrollTo = () => {}
window.HTMLElement.prototype.scrollIntoView = () => {}

const g = globalThis as unknown as Record<string, unknown>
g.window = window
g.document = window.document
g.navigator = window.navigator
g.location = window.location
g.history = window.history
g.localStorage = window.localStorage
g.HTMLElement = window.HTMLElement
g.Element = window.Element
g.Node = window.Node
g.Event = window.Event
g.CustomEvent = window.CustomEvent
g.MouseEvent = window.MouseEvent
g.KeyboardEvent = window.KeyboardEvent
g.getComputedStyle = window.getComputedStyle
g.requestAnimationFrame = window.requestAnimationFrame.bind(window)
g.cancelAnimationFrame = window.cancelAnimationFrame.bind(window)
g.matchMedia = window.matchMedia
g.IS_REACT_ACT_ENVIRONMENT = false

export { window, dom }
