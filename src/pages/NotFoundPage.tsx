import { Link } from 'react-router-dom'
import { Compass, Home, LayoutGrid, Repeat2 } from 'lucide-react'
import { useDocumentTitle } from '../hooks'
import { Button, Card } from '../components/ui/primitives'
import { CommunityIllustration } from '../components/ui/CategoryIcon'

export function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="overflow-hidden p-6 text-center">
        <div className="mx-auto h-32 w-full max-w-sm">
          <CommunityIllustration />
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">That page is not here</h1>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted">
          The link may be out of date, or the page may have moved. Nothing is broken — pick a section below and carry on.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Link to="/">
            <Button icon={<Home className="h-4 w-4" />}>Home dashboard</Button>
          </Link>
          <Link to="/discover">
            <Button variant="secondary" icon={<Compass className="h-4 w-4" />}>
              Discover People
            </Button>
          </Link>
          <Link to="/activities">
            <Button variant="secondary" icon={<LayoutGrid className="h-4 w-4" />}>
              Activities
            </Button>
          </Link>
          <Link to="/skills">
            <Button variant="ghost" icon={<Repeat2 className="h-4 w-4" />}>
              Skill Exchange
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
