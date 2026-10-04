import {
  BookOpen,
  Coffee,
  Dice5,
  Dumbbell,
  Footprints,
  GraduationCap,
  HeartHandshake,
  Languages,
  Mic,
  Palette,
  Repeat,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  Wrench,
  Sprout,
} from 'lucide-react'
import type { ActivityCategory, SkillCategory } from '../../types'
import { cn } from '../../utils/helpers'

const activityIcons: Record<ActivityCategory, typeof Coffee> = {
  'Chai & Chat': Coffee,
  'Skill Swap': Repeat,
  'Recipe Exchange': UtensilsCrossed,
  'Community Walk': Footprints,
  'Board Games': Dice5,
  'Digital Help Hour': Smartphone,
  'Language Exchange': Languages,
  'Study Together': BookOpen,
  'Sports & Fitness': Dumbbell,
  'Cultural Storytelling': Mic,
  'Neighbourhood Volunteering': HeartHandshake,
  'Fix One Local Problem': Wrench,
}

const skillIcons: Record<SkillCategory, typeof Coffee> = {
  'Food & Cooking': UtensilsCrossed,
  'Tech & Digital': Smartphone,
  'Home & Repair': Wrench,
  'Wellness & Fitness': Dumbbell,
  'Arts & Crafts': Palette,
  'Music & Performance': Mic,
  'Language & Literacy': Languages,
  'Study & Career': GraduationCap,
  'Gardening & Nature': Sprout,
  'Life & Everyday': Sparkles,
}

export function ActivityIcon({ category, className }: { category: ActivityCategory; className?: string }) {
  const Icon = activityIcons[category] ?? Sparkles
  return <Icon className={cn('h-4 w-4', className)} aria-hidden />
}

export function SkillIcon({ category, className }: { category: SkillCategory; className?: string }) {
  const Icon = skillIcons[category] ?? Sparkles
  return <Icon className={cn('h-4 w-4', className)} aria-hidden />
}

/** Soft, friendly inline illustration used on the home hero + empty states. */
export function MilaapMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={cn('h-10 w-10', className)} role="img" aria-label="Milaap mark">
      <rect width="120" height="120" rx="30" fill="var(--sage)" />
      <path
        d="M34 80V42l26 20 26-20v38"
        fill="none"
        stroke="#F7F8F3"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Three abstract figures holding a shared circle — "familiar faces" motif. */
export function CommunityIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 140" className={cn('h-full w-full', className)} role="img" aria-label="Neighbours meeting around a table">
      <defs>
        <linearGradient id="mlg-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9BAF5F" />
          <stop offset="100%" stopColor="#7B8F42" />
        </linearGradient>
        <linearGradient id="mlg-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E9EFCF" />
          <stop offset="100%" stopColor="#CBD79B" />
        </linearGradient>
      </defs>

      <circle cx="130" cy="34" r="34" fill="url(#mlg-b)" opacity="0.5" />
      <circle cx="99" cy="92" r="14" fill="url(#mlg-a)" />
      <circle cx="130" cy="80" r="16" fill="#5F7031" />
      <circle cx="162" cy="96" r="13" fill="url(#mlg-a)" opacity="0.85" />
      <circle cx="52" cy="104" r="11" fill="url(#mlg-a)" opacity="0.6" />
      <circle cx="212" cy="106" r="10" fill="url(#mlg-a)" opacity="0.55" />

      <path d="M46 132c0-12 12-20 26-20s26 8 26 20" fill="none" stroke="#7B8F42" strokeWidth="6" strokeLinecap="round" opacity="0.35" />
      <path d="M162 132c0-12 12-20 26-20s26 8 26 20" fill="none" stroke="#7B8F42" strokeWidth="6" strokeLinecap="round" opacity="0.35" />

      <rect x="88" y="112" width="84" height="8" rx="4" fill="#7B8F42" opacity="0.25" />
      <circle cx="106" cy="116" r="6" fill="#E9EFCF" />
      <circle cx="130" cy="116" r="6" fill="#E9EFCF" />
      <circle cx="154" cy="116" r="6" fill="#E9EFCF" />

      <path d="M238 62c6-6 6-16 0-22-6 6-6 16 0 22Z" fill="#9BAF5F" opacity="0.8" />
      <path d="M22 66c6-6 6-16 0-22-6 6-6 16 0 22Z" fill="#9BAF5F" opacity="0.6" />
    </svg>
  )
}
