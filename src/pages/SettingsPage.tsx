import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  BellOff,
  Download,
  ExternalLink,
  Eye,
  FileJson,
  Info,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UserCircle2,
  Zap,
} from 'lucide-react'
import { useMilaap, useDocumentTitle } from '../hooks'
import { Badge, Button, Card, CardHeader, Notice, SectionHeading } from '../components/ui/primitives'
import { RadioCards, Switch } from '../components/ui/Form'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { buildExportPayload, downloadJSON, exportFilename } from '../utils/exportData'
import { STORAGE_KEY } from '../utils/storage'
import { relativeTime } from '../utils/date'

export function SettingsPage() {
  useDocumentTitle('Settings')
  const navigate = useNavigate()
  const {
    settings,
    updateSettings,
    updateNotificationPrefs,
    data,
    exportPayload,
    resetAllData,
    restoreSampleData,
    storageOk,
    toast,
    stats,
  } = useMilaap()

  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(false)

  const handleExport = () => {
    const payload = buildExportPayload(exportPayload())
    downloadJSON(payload, exportFilename())
    toast({
      tone: 'success',
      title: 'Demo data exported',
      description: 'A JSON file was downloaded from this browser. Nothing was uploaded.',
    })
  }

  const approximateSize = (() => {
    try {
      return `${(new Blob([JSON.stringify(data)]).size / 1024).toFixed(1)} KB`
    } catch {
      return '—'
    }
  })()

  return (
    <div className="space-y-5">
      <header>
        <Badge tone="sage" icon={<ShieldCheck className="h-3 w-3" />}>
          Settings & privacy
        </Badge>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">Settings</h1>
        <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted">
          Appearance, in-app notification preferences and full control over the demonstration data stored in this browser.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ------------------- appearance ------------------- */}
        <Card>
          <CardHeader title="Appearance" subtitle="Applies instantly across the whole app." icon={<Eye className="h-4 w-4" />} />
          <div className="space-y-4 px-5 pb-5">
            <RadioCards
              label="Theme"
              value={settings.theme}
              onChange={(v) => updateSettings({ theme: v })}
              columns={2}
              options={[
                { value: 'light', label: 'Light', description: 'Warm off-white with sage accents.' },
                { value: 'dark', label: 'Dark', description: 'Low-light charcoal, same brand colours.' },
              ]}
            />

            <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface2/50 p-3.5">
              <div>
                <p className="text-[13.5px] font-semibold text-ink">Quick toggle</p>
                <p className="mt-0.5 text-[12.5px] text-muted">Switch themes without opening this page — the button is in the header.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={settings.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              >
                {settings.theme === 'dark' ? 'Go light' : 'Go dark'}
              </Button>
            </div>

            <div className="border-t border-line pt-1">
              <Switch
                label="Reduce motion"
                description="Turns off animations and smooth scrolling. Your system-level reduced-motion preference is also respected automatically."
                checked={settings.reducedMotion}
                onChange={(v) => updateSettings({ reducedMotion: v })}
              />
            </div>

            {data.settings.reducedMotion ? (
              <Notice tone="info" icon={<Zap className="h-4 w-4" />}>
                Motion is currently reduced. Fades, slides and scroll animations are disabled app-wide.
              </Notice>
            ) : null}
          </div>
        </Card>

        {/* ------------------- notification prefs ------------------- */}
        <Card>
          <CardHeader
            title="Notification preferences"
            subtitle="These control this app's own notifications list — there is no push or email service."
            icon={<Bell className="h-4 w-4" />}
          />
          <div className="divide-y divide-line px-5 pb-5">
            <Switch
              label="Suggested matches"
              description="When a new local match stands out, or you add someone to My Connections."
              checked={settings.notify.matches}
              onChange={(v) => updateNotificationPrefs({ matches: v })}
            />
            <Switch
              label="Activities & reminders"
              description="When you join an activity or a saved activity is coming up."
              checked={settings.notify.activities}
              onChange={(v) => updateNotificationPrefs({ activities: v })}
            />
            <Switch
              label="Demo invitations"
              description="When you create a local invitation in My Schedule."
              checked={settings.notify.invitations}
              onChange={(v) => updateNotificationPrefs({ invitations: v })}
            />
            <Switch
              label="Skill matches"
              description="When a complementary skill swap becomes available or you publish a listing."
              checked={settings.notify.skills}
              onChange={(v) => updateNotificationPrefs({ skills: v })}
            />
            <Switch
              label="Community"
              description="Challenge joins, created challenges and local board activity."
              checked={settings.notify.community}
              onChange={(v) => updateNotificationPrefs({ community: v })}
            />
            <Switch
              label="Profile tips"
              description="Occasional suggestions to complete your profile."
              checked={settings.notify.profile}
              onChange={(v) => updateNotificationPrefs({ profile: v })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-4">
            <Button size="sm" variant="secondary" icon={<BellOff className="h-4 w-4" />} onClick={() => navigate('/notifications')}>
              Open the notifications page
            </Button>
            <span className="text-[12.5px] text-muted">
              {stats.activeNotifications} unread right now · {data.notifications.length} total
            </span>
          </div>
        </Card>

        {/* ------------------- profile shortcut ------------------- */}
        <Card>
          <CardHeader title="Your profile" subtitle="Edit everything you entered, without any login." icon={<UserCircle2 className="h-4 w-4" />} />
          <div className="space-y-3 px-5 pb-5">
            <dl className="grid gap-2 text-[13px]">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <dt className="text-muted">Name</dt>
                <dd className="font-semibold text-ink">{data.profile.name || '—'}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-line pb-2">
                <dt className="text-muted">Community</dt>
                <dd className="max-w-[60%] text-right font-semibold text-ink">{data.profile.community}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-line pb-2">
                <dt className="text-muted">Interests</dt>
                <dd className="font-semibold text-ink">{data.profile.interests.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Skills shared / learning</dt>
                <dd className="font-semibold text-ink">
                  {data.profile.teachSkills.length} / {data.profile.learnSkills.length}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigate('/profile/edit')}>
                Edit profile
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigate('/profile')}>
                View profile
              </Button>
            </div>
          </div>
        </Card>

        {/* ------------------- data export ------------------- */}
        <Card>
          <CardHeader title="Your demo data" subtitle="Export, reset or restore everything stored locally." icon={<FileJson className="h-4 w-4" />} />
          <div className="space-y-3 px-5 pb-5">
            <ul className="space-y-1.5 text-[13px] text-muted">
              <li>· Storage key: <code className="rounded bg-surface2 px-1.5 py-0.5">{STORAGE_KEY}</code></li>
              <li>· Approximate size: {approximateSize}</li>
              <li>· Last local change: {relativeTime(data.lastUpdated)}</li>
              <li>
                · Local storage available:{' '}
                <strong className={storageOk ? 'text-ink' : 'text-[#B4443A] dark:text-[#E4A79E]'}>
                  {storageOk ? 'yes' : 'no — changes are session-only'}
                </strong>
              </li>
            </ul>

            <div className="flex flex-wrap gap-2">
              <Button icon={<Download className="h-4 w-4" />} onClick={handleExport}>
                Export as JSON
              </Button>
              <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirmRestore(true)}>
                Restore sample data
              </Button>
              <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmClear(true)}>
                Clear local data
              </Button>
            </div>

            <p className="text-[12px] leading-relaxed text-muted">
              Export downloads a JSON file straight from your browser. “Restore sample data” puts the original demonstration
              content back. “Clear local data” empties your profile, connections, joins, saves and notifications while keeping
              the sample members, activities and skills so the app still works.
            </p>
          </div>
        </Card>
      </div>

      {/* ------------------- privacy ------------------- */}
      <section>
        <SectionHeading
          title="Privacy & how this prototype works"
          subtitle="Read this before showing Milaap to anyone or reusing it as a template."
        />
        <Card className="p-5">
          <div className="flex gap-3">
            <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-[14px] leading-relaxed text-ink">
              “Milaap is a frontend demonstration. Profile information and activity changes are stored locally in this
              browser. No backend account is created and no information is transmitted to a Milaap server.”
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                title: 'Nothing leaves this device',
                body: 'There is no API, no database and no analytics. Every network request the app makes is for its own files.',
              },
              {
                title: 'Everyone you see is fictional',
                body: 'Members, activities, challenges, participant counts and events are seeded demonstration data written for this prototype.',
              },
              {
                title: 'No account, no recovery',
                body: 'Milaap never asks for a password, email address or phone number, so there is nothing to log in to and nothing to recover.',
              },
              {
                title: 'No sensitive information, please',
                body: 'Browser localStorage is plain text and is not encrypted. Do not enter addresses, health details or anything confidential.',
              },
              {
                title: 'No real invitations',
                body: 'Creating an invitation writes a record to this browser only. No message is sent and nobody can accept it.',
              },
              {
                title: 'You are in control',
                body: 'Export everything as JSON, reset individual sections, or clear local data completely at any time.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-line bg-surface2/50 p-3.5">
                <p className="text-[13.5px] font-bold text-ink">{item.title}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>

          <Notice tone="warning" className="mt-4" icon={<Info className="h-4 w-4" />} title="Positioning">
            Milaap is not a dating app and not a social network. There are no follower counts, no likes and no endless feed.
            Its only purpose is to give you a reason to meet the people who already live near you.
          </Notice>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/discover"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-surface2"
            >
              <Sparkles className="h-4 w-4" aria-hidden /> Back to Discover People
            </Link>
            <Link
              to="/"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent-hover dark:text-[#171a13]"
            >
              <ExternalLink className="h-4 w-4" aria-hidden /> Go to the home dashboard
            </Link>
          </div>
        </Card>
      </section>

      <ConfirmDialog
        open={confirmClear}
        destructive
        title="Clear all local demo data?"
        message={
          <>
            This removes your profile details, connections, invites, joins, saves, completed tasks and notifications from this
            browser. The sample members, activities, skills and challenges stay so Milaap still works. This cannot be undone.
          </>
        }
        confirmLabel="Yes, clear my data"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          resetAllData()
          setConfirmClear(false)
        }}
      />

      <ConfirmDialog
        open={confirmRestore}
        title="Restore the original sample data?"
        message="Everything currently stored in this browser is replaced by the original demonstration dataset: sample profile, two sample connections, sample invitations, joins and notifications."
        confirmLabel="Restore sample data"
        onCancel={() => setConfirmRestore(false)}
        onConfirm={() => {
          restoreSampleData()
          setConfirmRestore(false)
        }}
      />
    </div>
  )
}
