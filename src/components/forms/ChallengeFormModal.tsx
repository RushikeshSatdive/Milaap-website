import { useEffect, useState } from 'react'
import { Plus, Save, Trash2, UsersRound } from 'lucide-react'
import type { CommunityChallenge } from '../../types'
import { useMilaap } from '../../hooks'
import { COMMUNITIES } from '../../data/seed'
import { Modal } from '../ui/Modal'
import { Button, Notice } from '../ui/primitives'
import { SelectField, TextArea, TextField } from '../ui/Form'
import { validateChallenge } from '../../utils/validation'
import { uid } from '../../utils/helpers'

const CATEGORIES: CommunityChallenge['category'][] = [
  'Environment',
  'Digital Inclusion',
  'Learning',
  'Culture',
  'Wellbeing',
  'Local Fix',
]

interface FormValues {
  title: string
  goal: string
  description: string
  community: string
  category: CommunityChallenge['category']
  tasks: Array<{ id: string; label: string; done: boolean }>
}

export function ChallengeFormModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing?: CommunityChallenge | null
}) {
  const { createChallenge, updateChallenge, activeCommunity } = useMilaap()
  const [values, setValues] = useState<FormValues>({
    title: '',
    goal: '',
    description: '',
    community: activeCommunity,
    category: 'Environment',
    tasks: [
      { id: uid('t'), label: '', done: false },
      { id: uid('t'), label: '', done: false },
    ],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setValues({
        title: editing.title,
        goal: editing.goal,
        description: editing.description,
        community: editing.community,
        category: editing.category,
        tasks: editing.tasks.length ? editing.tasks : [{ id: uid('t'), label: '', done: false }],
      })
    } else {
      setValues({
        title: '',
        goal: '',
        description: '',
        community: activeCommunity,
        category: 'Environment',
        tasks: [
          { id: uid('t'), label: '', done: false },
          { id: uid('t'), label: '', done: false },
        ],
      })
    }
    setErrors({})
    setSubmitted(false)
  }, [open, editing, activeCommunity])

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value }
      if (submitted) setErrors(buildErrors(next))
      return next
    })
  }

  const buildErrors = (v: FormValues) =>
    validateChallenge({
      title: v.title,
      goal: v.goal,
      description: v.description,
      tasks: v.tasks.map((t) => t.label),
    })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const validation = buildErrors(values)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    const tasks = values.tasks
      .filter((t) => t.label.trim())
      .map((t) => ({ ...t, label: t.label.trim() }))

    if (editing) {
      updateChallenge(editing.id, {
        title: values.title.trim(),
        goal: values.goal.trim(),
        description: values.description.trim(),
        community: values.community,
        category: values.category,
        tasks,
      })
    } else {
      createChallenge({
        title: values.title.trim(),
        goal: values.goal.trim(),
        description: values.description.trim(),
        community: values.community,
        category: values.category,
        tasks,
        sampleParticipants: 0,
        joined: true,
      })
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit your challenge' : 'Create a community challenge'}
      description="A small, finishable local project with a task list people can tick off."
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="challenge-form" icon={editing ? <Save className="h-4 w-4" /> : <UsersRound className="h-4 w-4" />}>
            {editing ? 'Save changes' : 'Create challenge'}
          </Button>
        </div>
      }
    >
      <form id="challenge-form" onSubmit={submit} className="space-y-4" noValidate>
        <TextField
          label="Challenge title"
          required
          value={values.title}
          onChange={(v) => update('title', v)}
          placeholder="E.g. Paint the school boundary wall together"
          error={errors.title}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Community"
            required
            value={values.community}
            onChange={(v) => update('community', v)}
            options={COMMUNITIES.map((c) => ({ value: c.name, label: c.name }))}
          />
          <SelectField
            label="Category"
            required
            value={values.category}
            onChange={(v) => update('category', v as CommunityChallenge['category'])}
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
        </div>

        <TextField
          label="One measurable goal"
          required
          value={values.goal}
          onChange={(v) => update('goal', v)}
          placeholder="E.g. Twenty neighbours confident with digital payments"
          error={errors.goal}
          hint="If you cannot count it, it is hard to finish it."
        />

        <TextArea
          label="How will it work?"
          required
          value={values.description}
          onChange={(v) => update('description', v)}
          maxLength={400}
          rows={4}
          error={errors.description}
        />

        <fieldset className="rounded-xl border border-line p-3.5">
          <legend className="px-1 text-[13px] font-semibold text-ink">Task list (at least two)</legend>
          <div className="space-y-2">
            {values.tasks.map((task, index) => (
              <div key={task.id} className="flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface2 text-[12px] font-bold text-muted">
                  {index + 1}
                </span>
                <input
                  value={task.label}
                  onChange={(e) =>
                    update(
                      'tasks',
                      values.tasks.map((t) => (t.id === task.id ? { ...t, label: e.target.value } : t)),
                    )
                  }
                  placeholder="Something one person can do in an hour"
                  aria-label={`Task ${index + 1}`}
                  className="ml-input"
                />
                <button
                  type="button"
                  onClick={() => update('tasks', values.tasks.filter((t) => t.id !== task.id))}
                  aria-label={`Remove task ${index + 1}`}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-muted transition hover:text-[#B4443A]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <Button
            className="mt-2.5"
            size="sm"
            variant="secondary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => update('tasks', [...values.tasks, { id: uid('t'), label: '', done: false }])}
          >
            Add another task
          </Button>
          {errors.tasks ? <p className="mt-2 text-[12.5px] font-medium text-[#B4443A] dark:text-[#E4A79E]">{errors.tasks}</p> : null}
        </fieldset>

        <Notice tone="warning">
          Challenges you create stay in this browser. There are no real participants — any participant number shown is
          demonstration data, and ticking a task only updates your own local copy.
        </Notice>
      </form>
    </Modal>
  )
}
