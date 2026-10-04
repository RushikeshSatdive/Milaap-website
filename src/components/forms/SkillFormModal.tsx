import { useEffect, useState } from 'react'
import { Save, Repeat2 } from 'lucide-react'
import type { SkillListing, SkillCategory } from '../../types'
import { AVAILABILITY_SLOTS, SKILL_CATEGORIES } from '../../types'
import { useMilaap } from '../../hooks'
import { Modal } from '../ui/Modal'
import { Button, Notice } from '../ui/primitives'
import { ChipSelect, RadioCards, SelectField, TextArea, TextField } from '../ui/Form'
import { validateSkillListing } from '../../utils/validation'

interface FormValues {
  type: 'offer' | 'request'
  skill: string
  category: SkillCategory
  description: string
  availability: string[]
  format: 'In person' | 'Online' | 'Either'
  note: string
}

const initial = (type: 'offer' | 'request'): FormValues => ({
  type,
  skill: '',
  category: 'Life & Everyday',
  description: '',
  availability: [],
  format: 'In person',
  note: '',
})

export function SkillFormModal({
  open,
  onClose,
  editing,
  defaultType = 'offer',
}: {
  open: boolean
  onClose: () => void
  editing?: SkillListing | null
  defaultType?: 'offer' | 'request'
}) {
  const { createSkillListing, updateSkillListing, profile } = useMilaap()
  const [values, setValues] = useState<FormValues>(initial(defaultType))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setValues({
        type: editing.type,
        skill: editing.skill,
        category: editing.category,
        description: editing.description,
        availability: editing.availability,
        format: editing.format,
        note: editing.note ?? '',
      })
    } else {
      setValues({ ...initial(defaultType), availability: profile.availability.slice(0, 2) })
    }
    setErrors({})
    setSubmitted(false)
  }, [open, editing, defaultType, profile.availability])

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value }
      if (submitted) setErrors(validateSkillListing(next))
      return next
    })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const validation = validateSkillListing({
      skill: values.skill,
      description: values.description,
      category: values.category,
      availability: values.availability,
    })
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    const payload = {
      type: values.type,
      skill: values.skill.trim(),
      category: values.category,
      description: values.description.trim(),
      memberId: 'me' as const,
      availability: values.availability as SkillListing['availability'],
      format: values.format,
      note: values.note.trim(),
    }

    if (editing) {
      updateSkillListing(editing.id, payload)
    } else {
      createSkillListing(payload)
    }
    onClose()
  }

  const suggestionChips = values.type === 'offer' ? profile.teachSkills : profile.learnSkills

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit your listing' : values.type === 'offer' ? 'Offer a skill' : 'Ask to learn a skill'}
      description="No payments, no bookings, no fees — just two neighbours swapping twenty minutes of something."
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="skill-form" icon={editing ? <Save className="h-4 w-4" /> : <Repeat2 className="h-4 w-4" />}>
            {editing ? 'Save changes' : values.type === 'offer' ? 'Publish skill offer' : 'Publish learning request'}
          </Button>
        </div>
      }
    >
      <form id="skill-form" onSubmit={submit} className="space-y-4" noValidate>
        <RadioCards
          label="What kind of listing is this?"
          value={values.type}
          onChange={(v) => update('type', v)}
          columns={2}
          options={[
            { value: 'offer', label: 'I can teach this', description: 'Something you can explain in 20 minutes.' },
            { value: 'request', label: 'I want to learn this', description: 'Something a neighbour could show you.' },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <TextField
              label={values.type === 'offer' ? 'Skill you can teach' : 'Skill you want to learn'}
              required
              value={values.skill}
              onChange={(v) => update('skill', v)}
              placeholder={values.type === 'offer' ? 'E.g. Basic bicycle repair' : 'E.g. Spoken English'}
              error={errors.skill}
            />
            {suggestionChips.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggestionChips.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update('skill', s)}
                    className="rounded-full border border-line bg-surface2 px-2.5 py-1 text-[11.5px] font-medium text-muted transition hover:border-accent/60 hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <SelectField
            label="Category"
            required
            value={values.category}
            onChange={(v) => update('category', v as SkillCategory)}
            options={SKILL_CATEGORIES.map((c) => ({ value: c, label: c }))}
            error={errors.category}
          />
        </div>

        <TextArea
          label="What would someone get out of it?"
          required
          value={values.description}
          onChange={(v) => update('description', v)}
          maxLength={260}
          rows={3}
          placeholder="Be concrete: what you will cover, what to bring, how you like to teach."
          error={errors.description}
        />

        <RadioCards
          label="Format"
          value={values.format}
          onChange={(v) => update('format', v)}
          columns={3}
          options={[
            { value: 'In person', label: 'In person', description: 'Meet somewhere public nearby.' },
            { value: 'Online', label: 'Online', description: 'Video call or phone.' },
            { value: 'Either', label: 'Either', description: 'Whatever suits the other person.' },
          ]}
        />

        <ChipSelect
          label="When are you usually free?"
          options={AVAILABILITY_SLOTS}
          selected={values.availability}
          onChange={(next) => update('availability', next)}
          error={errors.availability}
        />

        <TextArea
          label="Optional note"
          value={values.note}
          onChange={(v) => update('note', v)}
          maxLength={200}
          rows={2}
          placeholder="Anything else a neighbour should know."
        />

        <Notice tone="info">
          Your listing is saved in this browser only. Milaap will look for complementary listings — someone who wants to learn
          what you teach, or can teach what you want to learn — and suggest a 20-minute swap.
        </Notice>
      </form>
    </Modal>
  )
}
