/* ------------------------------------------------------------------
   Milaap — seeded demonstration data
   Everything here is fictional sample content created for a frontend
   prototype. No real people, organisations or events are represented.
   ------------------------------------------------------------------ */
import type {
  Activity,
  AppNotification,
  CommunityChallenge,
  CommunityMember,
  Invitation,
  SkillListing,
  UserProfile,
} from '../types'
import { ACTIVITY_CATEGORIES, AVAILABILITY_SLOTS } from '../types'
import { daysFromNow, daysFromNowISO } from '../utils/date'

export const COMMUNITIES = [
  {
    id: 'ahilyanagar-shivaji-nagar',
    name: 'Shivaji Nagar, Ahilyanagar',
    shortName: 'Shivaji Nagar',
    blurb: 'Mixed-age neighbourhood around the old market, with a strong seniors’ circle and a growing student population.',
    sampleMembers: 7,
  },
  {
    id: 'ahilyanagar-savedi',
    name: 'Savedi, Ahilyanagar',
    shortName: 'Savedi',
    blurb: 'Quiet residential pocket near the college road — lots of families and weekend walkers.',
    sampleMembers: 2,
  },
  {
    id: 'pune-kothrud',
    name: 'Kothrud, Pune',
    shortName: 'Kothrud',
    blurb: 'Dense, busy and full of people who want to know their neighbours but never get the chance.',
    sampleMembers: 1,
  },
  {
    id: 'mumbai-andheri-west',
    name: 'Andheri West, Mumbai',
    shortName: 'Andheri West',
    blurb: 'Tower-block community where almost everyone is new to the city.',
    sampleMembers: 1,
  },
  {
    id: 'bengaluru-indiranagar',
    name: 'Indiranagar, Bengaluru',
    shortName: 'Indiranagar',
    blurb: 'Young professional neighbourhood with a lively weekend café-and-park culture.',
    sampleMembers: 1,
  },
]

export const DEFAULT_COMMUNITY = COMMUNITIES[0].name

export const INTEREST_OPTIONS = [
  'Gardening', 'Cooking', 'Storytelling', 'Walking', 'Cricket', 'Yoga', 'Photography',
  'Board games', 'Music', 'Reading', 'Trekking', 'Cycling', 'Volunteering', 'Local history',
  'Languages', 'Films', 'Poetry', 'Crafts', 'Teaching', 'Fitness', 'Technology',
  'Environment', 'Festivals', 'Street food', 'Public speaking', 'Study groups', 'Chess',
]

export const HOBBIES_OPTIONS = [
  'Terrace gardening', 'Sketching', 'Cooking for friends', 'Evening walks', 'Playing guitar',
  'Birdwatching', 'Collecting recipes', 'Cycling', 'Sudoku & puzzles', 'Home repairs',
  'Photography walks', 'Reading before bed', 'Playing tabla', 'Knitting', 'Gardening',
]

export const LANGUAGE_OPTIONS = [
  'Marathi', 'Hindi', 'English', 'Urdu', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Sanskrit',
]

export const AGE_RANGES = ['18–24', '25–34', '35–44', '45–54', '55–64', '65–74', '75+']

export const ACCESSIBILITY_OPTIONS = [
  'None needed',
  'Prefer ground-floor venues',
  'Prefer seated activities',
  'Prefer quiet, low-noise spaces',
  'Wheelchair access needed',
  'Prefer shorter activities (≤ 30 min)',
  'Prefer daytime meetups',
  'Prefer to bring a companion',
]

export const MEETING_PLACES = [
  'Shivaji Nagar Garden — main gate',
  'Community hall, behind the market',
  'Sai Chai Corner, Market Road',
  'Ward library reading room',
  'Municipal garden benches',
  'Jogging track entrance, Savedi',
  'Bus stop shelter near the temple',
  'Public park gazebo',
]

export const CURRENT_DATA_VERSION = 1

/* ----------------------------- members ----------------------------- */

export const SAMPLE_MEMBERS: CommunityMember[] = [
  {
    id: 'm-meera',
    name: 'Meera Joshi',
    avatarId: 'meera-joshi',
    ageRange: '65–74',
    community: 'Shivaji Nagar, Ahilyanagar',
    bio: 'Retired school teacher. I have 40 years of stories from this neighbourhood and I would happily trade them for help with my phone.',
    interests: ['Storytelling', 'Local history', 'Gardening', 'Reading', 'Poetry'],
    hobbies: ['Terrace gardening', 'Reading before bed', 'Collecting recipes'],
    languages: ['Marathi', 'Hindi', 'English'],
    teachSkills: ['Hindi conversation', 'Knitting basics', 'Storytelling for children'],
    learnSkills: ['Basic smartphone use', 'Smartphone photography', 'Digital payments'],
    preferredActivities: ['Chai & Chat', 'Cultural Storytelling', 'Digital Help Hour'],
    availability: ['Weekday mornings', 'Weekend mornings'],
    accessibility: 'Prefer ground-floor venues',
  },
  {
    id: 'm-rajesh',
    name: 'Rajesh Patil',
    avatarId: 'rajesh-patil',
    ageRange: '45–54',
    community: 'Shivaji Nagar, Ahilyanagar',
    bio: 'I run a small two-wheeler and car workshop near the market. Tools I can teach, photos I want to learn.',
    interests: ['Technology', 'Cycling', 'Cricket', 'Street food'],
    hobbies: ['Home repairs', 'Cycling', 'Evening walks'],
    languages: ['Marathi', 'Hindi'],
    teachSkills: ['Basic car maintenance', 'Bicycle repair', 'Two-wheeler servicing'],
    learnSkills: ['Smartphone photography', 'Excel basics', 'Spoken English'],
    preferredActivities: ['Skill Swap', 'Fix One Local Problem', 'Chai & Chat'],
    availability: ['Weekday evenings', 'Weekend afternoons'],
  },
  {
    id: 'm-sana',
    name: 'Sana Sheikh',
    avatarId: 'sana-sheikh',
    ageRange: '18–24',
    community: 'Shivaji Nagar, Ahilyanagar',
    bio: 'Design student. New to the area and mostly studying — I would love a reason to leave my desk on Sundays.',
    interests: ['Photography', 'Crafts', 'Cooking', 'Films', 'Walking'],
    hobbies: ['Sketching', 'Photography walks', 'Cycling'],
    languages: ['Hindi', 'English', 'Urdu', 'Marathi'],
    teachSkills: ['Smartphone photography', 'Sketching basics', 'Canva for beginners'],
    learnSkills: ['Cooking', 'Gardening', 'Marathi conversation'],
    preferredActivities: ['Community Walk', 'Board Games', 'Study Together'],
    availability: ['Weekday evenings', 'Weekend afternoons', 'Weekend evenings'],
  },
  {
    id: 'm-vikram',
    name: 'Vikram Rane',
    avatarId: 'vikram-rane',
    ageRange: '35–44',
    community: 'Shivaji Nagar, Ahilyanagar',
    bio: 'Software engineer in a shared office downtown. I know spreadsheets far too well and kitchens not nearly enough.',
    interests: ['Technology', 'Fitness', 'Cricket', 'Public speaking', 'Chess'],
    hobbies: ['Reading before bed', 'Cycling', 'Sudoku & puzzles'],
    languages: ['Marathi', 'English', 'Hindi'],
    teachSkills: ['Excel for work', 'Public speaking', 'Interview practice'],
    learnSkills: ['Cooking', 'Gardening basics', 'Smartphone photography'],
    preferredActivities: ['Skill Swap', 'Sports & Fitness', 'Board Games'],
    availability: ['Weekday evenings', 'Weekend mornings'],
  },
  {
    id: 'm-aarti',
    name: 'Aarti Deshmukh',
    avatarId: 'aarti-deshmukh',
    ageRange: '25–34',
    community: 'Shivaji Nagar, Ahilyanagar',
    bio: 'Home baker. My kitchen is always warm and there is always one extra plate. Teach me a spreadsheet and I will teach you my cake.',
    interests: ['Cooking', 'Festivals', 'Street food', 'Crafts', 'Volunteering'],
    hobbies: ['Cooking for friends', 'Collecting recipes', 'Gardening'],
    languages: ['Marathi', 'Hindi', 'English'],
    teachSkills: ['Home baking', 'Recipe writing', 'Pickle & papad making'],
    learnSkills: ['Excel basics', 'Digital payments', 'Photography for food'],
    preferredActivities: ['Recipe Exchange', 'Chai & Chat', 'Neighbourhood Volunteering'],
    availability: ['Weekday mornings', 'Weekday afternoons'],
  },
  {
    id: 'm-dadaji',
    name: 'Dadaji Pawar',
    avatarId: 'dadaji-pawar',
    ageRange: '75+',
    community: 'Shivaji Nagar, Ahilyanagar',
    bio: 'Retired postmaster. I walked this market road for thirty years and I still know which lane floods first.',
    interests: ['Local history', 'Walking', 'Storytelling', 'Poetry', 'Festivals'],
    hobbies: ['Evening walks', 'Birdwatching', 'Reading before bed'],
    languages: ['Marathi', 'Hindi'],
    teachSkills: ['Local history walks', 'Handwriting & letters', 'Old Marathi songs'],
    learnSkills: ['Video calling', 'Digital payments', 'Smartphone basics'],
    preferredActivities: ['Cultural Storytelling', 'Community Walk', 'Digital Help Hour'],
    availability: ['Weekday mornings', 'Weekend mornings'],
    accessibility: 'Prefer seated activities',
  },
  {
    id: 'm-nikhil',
    name: 'Nikhil Kamble',
    avatarId: 'nikhil-kamble',
    ageRange: '18–24',
    community: 'Savedi, Ahilyanagar',
    bio: 'First-year engineering student. Good with video edits and cricket, terrible at speaking in front of a room.',
    interests: ['Cricket', 'Films', 'Technology', 'Music', 'Fitness'],
    hobbies: ['Playing tabla', 'Cycling', 'Photography walks'],
    languages: ['Marathi', 'Hindi', 'English'],
    teachSkills: ['Video editing on phone', 'Cricket basics', 'Instagram for beginners'],
    learnSkills: ['Public speaking', 'Spoken English', 'Study planning'],
    preferredActivities: ['Study Together', 'Sports & Fitness', 'Board Games'],
    availability: ['Weekday evenings', 'Weekend mornings', 'Weekend evenings'],
  },
  {
    id: 'm-fatima',
    name: 'Fatima Ansari',
    avatarId: 'fatima-ansari',
    ageRange: '45–54',
    community: 'Savedi, Ahilyanagar',
    bio: 'Staff nurse. I spend my week caring for people and my Sundays looking for something useful to do close to home.',
    interests: ['Fitness', 'Yoga', 'Volunteering', 'Environment', 'Cooking'],
    hobbies: ['Evening walks', 'Gardening', 'Cooking for friends'],
    languages: ['Urdu', 'Hindi', 'Marathi', 'English'],
    teachSkills: ['First aid basics', 'Yoga for seniors', 'Healthy cooking on a budget'],
    learnSkills: ['Gardening', 'Smartphone photography'],
    preferredActivities: ['Neighbourhood Volunteering', 'Community Walk', 'Sports & Fitness'],
    availability: ['Weekend mornings', 'Weekend afternoons'],
    accessibility: 'Prefer daytime meetups',
  },
  {
    id: 'm-ketan',
    name: 'Ketan Shah',
    avatarId: 'ketan-shah',
    ageRange: '25–34',
    community: 'Shivaji Nagar, Ahilyanagar',
    bio: 'Accountant, moved here eight months ago for work. I know nobody in this city and I would like that to change.',
    interests: ['Board games', 'Chess', 'Technology', 'Trekking', 'Languages'],
    hobbies: ['Sudoku & puzzles', 'Cycling', 'Reading before bed'],
    languages: ['Gujarati', 'Hindi', 'English'],
    teachSkills: ['Personal budgeting', 'Excel basics', 'Book-keeping for small shops'],
    learnSkills: ['Marathi conversation', 'Cooking', 'Cricket'],
    preferredActivities: ['Chai & Chat', 'Board Games', 'Digital Help Hour'],
    availability: ['Weekday evenings', 'Weekend afternoons'],
  },
  {
    id: 'm-sunita',
    name: 'Sunita Bhosale',
    avatarId: 'sunita-bhosale',
    ageRange: '55–64',
    community: 'Shivaji Nagar, Ahilyanagar',
    bio: 'Part of a women’s self-help group that makes pickles and papads. We would love help reaching customers online.',
    interests: ['Cooking', 'Crafts', 'Festivals', 'Volunteering', 'Street food'],
    hobbies: ['Knitting', 'Collecting recipes', 'Gardening'],
    languages: ['Marathi', 'Hindi'],
    teachSkills: ['Pickle & papad making', 'Hand sewing & mending', 'Folk songs'],
    learnSkills: ['Digital payments', 'Selling online', 'Smartphone photography'],
    preferredActivities: ['Recipe Exchange', 'Neighbourhood Volunteering', 'Chai & Chat'],
    availability: ['Weekday afternoons', 'Weekend mornings'],
  },
  {
    id: 'm-arjun',
    name: 'Arjun Nair',
    avatarId: 'arjun-nair',
    ageRange: '25–34',
    community: 'Shivaji Nagar, Ahilyanagar',
    bio: 'Gym trainer and part-time runner. I can fix your running form; I cannot play a single instrument.',
    interests: ['Fitness', 'Cycling', 'Trekking', 'Music', 'Cooking'],
    hobbies: ['Cycling', 'Evening walks', 'Playing guitar'],
    languages: ['English', 'Hindi', 'Tamil', 'Marathi'],
    teachSkills: ['Fitness basics', 'Running form', 'Stretching for desk workers'],
    learnSkills: ['Playing guitar', 'Cooking', 'Storytelling'],
    preferredActivities: ['Sports & Fitness', 'Community Walk', 'Skill Swap'],
    availability: ['Weekday mornings', 'Weekend mornings'],
  },
  {
    id: 'm-priya',
    name: 'Priya Kulkarni',
    avatarId: 'priya-kulkarni',
    ageRange: '35–44',
    community: 'Shivaji Nagar, Ahilyanagar',
    bio: 'School teacher and mother of two. I coach spoken English and I am quietly trying to learn yoga.',
    interests: ['Teaching', 'Languages', 'Reading', 'Yoga', 'Public speaking'],
    hobbies: ['Reading before bed', 'Sketching', 'Terrace gardening'],
    languages: ['Marathi', 'English', 'Hindi', 'Sanskrit'],
    teachSkills: ['Spoken English', 'Public speaking', 'Exam study planning'],
    learnSkills: ['Yoga', 'Smartphone photography', 'Cooking'],
    preferredActivities: ['Study Together', 'Language Exchange', 'Board Games'],
    availability: ['Weekday afternoons', 'Weekend evenings'],
    accessibility: 'Prefer shorter activities (≤ 30 min)',
  },
]

/* ---------------------------- profile ------------------------------ */

export function buildSampleProfile(): UserProfile {
  return {
    id: 'me',
    name: 'Aarav',
    avatarId: 'aarav-me',
    ageRange: '25–34',
    community: DEFAULT_COMMUNITY,
    bio: 'I moved here two years ago for work. I know the roads well and the people hardly at all — trying to fix that one chai at a time.',
    interests: ['Photography', 'Technology', 'Walking', 'Cricket', 'Street food'],
    hobbies: ['Photography walks', 'Cycling', 'Cooking for friends'],
    languages: ['Marathi', 'Hindi', 'English'],
    teachSkills: ['Smartphone photography', 'Video editing on phone', 'Basic website building'],
    learnSkills: ['Basic car maintenance', 'Cooking', 'Marathi conversation'],
    preferredActivities: ['Chai & Chat', 'Community Walk', 'Skill Swap', 'Fix One Local Problem'],
    availability: ['Weekday evenings', 'Weekend mornings'],
    accessibility: 'None needed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/* --------------------------- activities ---------------------------- */

export function buildSampleActivities(): Activity[] {
  const base: Array<Omit<Activity, 'id' | 'createdAt' | 'isSample' | 'createdBy'>> = [
    {
      title: 'Sunday morning chai at the market corner',
      category: 'Chai & Chat',
      description:
        'A slow start to Sunday. Bring nothing, order one cup, and talk to whoever is at the next table. We keep phones face-down.',
      durationMins: 60,
      groupSize: 8,
      community: 'Shivaji Nagar, Ahilyanagar',
      scheduledAt: daysFromNow(3, '08:30'),
      interestTags: ['Street food', 'Storytelling'],
      skillTags: ['Listening'],
      sampleParticipants: 5,
      popularity: 42,
      place: 'Sai Chai Corner, Market Road',
      hostName: 'Aarti Deshmukh',
    },
    {
      title: 'Digital help hour: phones & payments',
      category: 'Digital Help Hour',
      description:
        'Bring your phone and one question. Volunteers help with UPI payments, video calls, photo backups and scam-safety basics.',
      durationMins: 60,
      groupSize: 10,
      community: 'Shivaji Nagar, Ahilyanagar',
      scheduledAt: daysFromNow(2, '17:30'),
      interestTags: ['Technology', 'Teaching'],
      skillTags: ['Basic smartphone use', 'Digital payments'],
      sampleParticipants: 7,
      popularity: 86,
      place: 'Community hall, behind the market',
      hostName: 'Meera Joshi',
    },
    {
      title: 'Photography walk along the river road',
      category: 'Community Walk',
      description:
        'Twenty-minute walk, twenty photos. We shoot one theme per walk and share the best three at the end.',
      durationMins: 90,
      groupSize: 6,
      community: 'Shivaji Nagar, Ahilyanagar',
      scheduledAt: daysFromNow(5, '07:00'),
      interestTags: ['Photography', 'Walking'],
      skillTags: ['Smartphone photography'],
      sampleParticipants: 4,
      popularity: 61,
      place: 'Jogging track entrance, Savedi',
      hostName: 'Sana Sheikh',
    },
    {
      title: 'Board games afternoon (carrom + ludo)',
      category: 'Board Games',
      description:
        'Open tables, mixed ages, no prizes. Grandparents are especially welcome — the ludo table is undefeated.',
      durationMins: 120,
      groupSize: 12,
      community: 'Shivaji Nagar, Ahilyanagar',
      scheduledAt: daysFromNow(6, '16:00'),
      interestTags: ['Board games', 'Chess', 'Festivals'],
      skillTags: [],
      sampleParticipants: 8,
      popularity: 73,
      place: 'Ward library reading room',
      hostName: 'Ketan Shah',
    },
    {
      title: 'Skill swap: cooking for spreadsheets',
      category: 'Skill Swap',
      description:
        'Two 20-minute swaps in one evening — cook one dish, learn one formula. Bring a notebook and an appetite.',
      durationMins: 90,
      groupSize: 6,
      community: 'Shivaji Nagar, Ahilyanagar',
      scheduledAt: daysFromNow(4, '19:00'),
      interestTags: ['Cooking', 'Technology', 'Teaching'],
      skillTags: ['Excel basics', 'Cooking', 'Recipe writing'],
      sampleParticipants: 3,
      popularity: 55,
      place: 'Community hall, behind the market',
      hostName: 'Vikram Rane',
    },
    {
      title: 'Spoken English practice circle',
      category: 'Language Exchange',
      description:
        'Friendly, slow-paced conversation practice. Ten minutes English, ten minutes Marathi, so nobody is the guest.',
      durationMins: 60,
      groupSize: 8,
      community: 'Shivaji Nagar, Ahilyanagar',
      scheduledAt: daysFromNow(7, '18:00'),
      interestTags: ['Languages', 'Public speaking'],
      skillTags: ['Spoken English', 'Marathi conversation'],
      sampleParticipants: 6,
      popularity: 68,
      place: 'Public park gazebo',
      hostName: 'Priya Kulkarni',
    },
    {
      title: 'Car & cycle check-up clinic',
      category: 'Fix One Local Problem',
      description:
        'Free basic checks: tyre pressure, chain oiling, brake pads, headlight wiring. Learn to do it yourself next time.',
      durationMins: 120,
      groupSize: 10,
      community: 'Shivaji Nagar, Ahilyanagar',
      scheduledAt: daysFromNow(9, '09:00'),
      interestTags: ['Technology', 'Cycling'],
      skillTags: ['Basic car maintenance', 'Bicycle repair'],
      sampleParticipants: 5,
      popularity: 47,
      place: 'Shivaji Nagar Garden — main gate',
      hostName: 'Rajesh Patil',
    },
    {
      title: 'Recipe exchange: one dish from your mother',
      category: 'Recipe Exchange',
      description:
        'Bring one written recipe and, if you can, a small taste. We photocopy everything into a shared booklet.',
      durationMins: 90,
      groupSize: 10,
      community: 'Savedi, Ahilyanagar',
      scheduledAt: daysFromNow(8, '11:00'),
      interestTags: ['Cooking', 'Street food', 'Festivals'],
      skillTags: ['Recipe writing', 'Pickle & papad making'],
      sampleParticipants: 9,
      popularity: 79,
      place: 'Sai Chai Corner, Market Road',
      hostName: 'Sunita Bhosale',
    },
    {
      title: 'Morning stretch for desk workers',
      category: 'Sports & Fitness',
      description:
        'Thirty minutes of shoulder, neck and lower-back mobility. Zero equipment, all levels, no mirror required.',
      durationMins: 30,
      groupSize: 15,
      community: 'Shivaji Nagar, Ahilyanagar',
      scheduledAt: daysFromNow(1, '07:15'),
      interestTags: ['Fitness', 'Yoga'],
      skillTags: ['Stretching for desk workers', 'Yoga for seniors'],
      sampleParticipants: 11,
      popularity: 91,
      place: 'Municipal garden benches',
      hostName: 'Arjun Nair',
    },
    {
      title: 'Reading room: study together, quietly',
      category: 'Study Together',
      description:
        'Two hours of silent study in the same room. Phones in a box at the door. Chai break at the halfway mark.',
      durationMins: 120,
      groupSize: 12,
      community: 'Shivaji Nagar, Ahilyanagar',
      scheduledAt: daysFromNow(2, '18:30'),
      interestTags: ['Study groups', 'Reading', 'Teaching'],
      skillTags: ['Exam study planning'],
      sampleParticipants: 6,
      popularity: 64,
      place: 'Ward library reading room',
      hostName: 'Nikhil Kamble',
    },
    {
      title: 'Neighbourhood clean-up: lane 4 to the temple',
      category: 'Neighbourhood Volunteering',
      description:
        'Gloves and bags provided by the ward office. Ninety minutes, one lane, then chai for everyone who came.',
      durationMins: 90,
      groupSize: 20,
      community: 'Shivaji Nagar, Ahilyanagar',
      scheduledAt: daysFromNow(10, '07:30'),
      interestTags: ['Environment', 'Volunteering'],
      skillTags: [],
      sampleParticipants: 14,
      popularity: 88,
      place: 'Shivaji Nagar Garden — main gate',
      hostName: 'Fatima Ansari',
    },
    {
      title: 'Grandparents’ stories: the tank that never filled',
      category: 'Cultural Storytelling',
      description:
        'Three seniors, three ten-minute stories about this area, one open mic for anyone else who remembers something.',
      durationMins: 75,
      groupSize: 25,
      community: 'Shivaji Nagar, Ahilyanagar',
      scheduledAt: daysFromNow(12, '17:00'),
      interestTags: ['Local history', 'Storytelling', 'Poetry'],
      skillTags: ['Storytelling for children', 'Local history walks'],
      sampleParticipants: 17,
      popularity: 82,
      place: 'Community hall, behind the market',
      hostName: 'Dadaji Pawar',
    },
    {
      title: 'Unscheduled idea: community book exchange shelf',
      category: 'Fix One Local Problem',
      description:
        'An idea looking for a host. One shelf, one cupboard, take a book leave a book. Needs someone to talk to the shop owner.',
      durationMins: 60,
      groupSize: 5,
      community: 'Shivaji Nagar, Ahilyanagar',
      scheduledAt: null,
      interestTags: ['Reading', 'Volunteering'],
      skillTags: ['Basic carpentry'],
      sampleParticipants: 2,
      popularity: 35,
      place: 'Ward library reading room',
      hostName: 'Ketan Shah',
    },
    {
      title: 'Weekend cricket, mixed teams, soft ball',
      category: 'Sports & Fitness',
      description:
        'Six-a-side, soft ball, anyone above 14 welcome. Whoever arrives last umpires the first over.',
      durationMins: 120,
      groupSize: 18,
      community: 'Savedi, Ahilyanagar',
      scheduledAt: daysFromNow(4, '07:30'),
      interestTags: ['Cricket', 'Fitness'],
      skillTags: ['Cricket basics'],
      sampleParticipants: 12,
      popularity: 76,
      place: 'Municipal garden benches',
      hostName: 'Nikhil Kamble',
    },
  ]

  return base.map((a, i) => ({
    ...a,
    id: `a-${i + 1}`,
    createdBy: 'community' as const,
    isSample: true,
    createdAt: new Date(Date.now() - (i + 1) * 36e5 * 6).toISOString(),
  }))
}

/* --------------------------- invitations --------------------------- */

export function buildSampleInvitations(): Invitation[] {
  return [
    {
      id: 'inv-seed-1',
      memberId: 'm-sana',
      activityType: 'Community Walk',
      title: 'Photography walk & filter-free chai',
      date: daysFromNowISO(5),
      time: '07:00',
      durationMins: 90,
      place: 'Jogging track entrance, Savedi',
      note: 'Demo note: I will bring the extra lens clip. Nothing has actually been sent to anyone.',
      status: 'planned',
      createdAt: new Date(Date.now() - 3 * 36e5).toISOString(),
      isSample: true,
    },
    {
      id: 'inv-seed-2',
      memberId: 'm-meera',
      activityType: 'Digital Help Hour',
      title: 'Phone basics: video calling and photos',
      date: daysFromNowISO(-4),
      time: '17:30',
      durationMins: 60,
      place: 'Community hall, behind the market',
      note: 'Demo note: a practice invitation already in the past so the schedule has history.',
      status: 'completed',
      createdAt: new Date(Date.now() - 8 * 36e5 * 24).toISOString(),
      isSample: true,
    },
  ]
}

/* -------------------------- skill listings ------------------------- */

export function buildSampleSkillListings(): SkillListing[] {
  const rows: Array<{
    type: 'offer' | 'request'
    skill: string
    category: SkillListing['category']
    description: string
    memberId: string
    availability: SkillListing['availability']
    format: SkillListing['format']
  }> = [
    {
      type: 'offer',
      skill: 'Basic car maintenance',
      category: 'Home & Repair',
      description: 'Tyre pressure, oil checks, jump-starting, reading a warning light. Half an hour and you never panic again.',
      memberId: 'm-rajesh',
      availability: ['Weekday evenings', 'Weekend afternoons'],
      format: 'In person',
    },
    {
      type: 'request',
      skill: 'Smartphone photography',
      category: 'Arts & Crafts',
      description: 'I want to photograph the parts I repair for my shop listing. Totally lost with framing and light.',
      memberId: 'm-rajesh',
      availability: ['Weekday evenings'],
      format: 'In person',
    },
    {
      type: 'offer',
      skill: 'Hindi conversation',
      category: 'Language & Literacy',
      description: 'Patient conversation practice for anyone who reads Hindi but freezes while speaking it.',
      memberId: 'm-meera',
      availability: ['Weekday mornings', 'Weekend mornings'],
      format: 'Either',
    },
    {
      type: 'offer',
      skill: 'Home baking',
      category: 'Food & Cooking',
      description: 'Eggless sponges, banana bread and one reliable chocolate cake. Bring a tin, leave with a cake.',
      memberId: 'm-aarti',
      availability: ['Weekday afternoons'],
      format: 'In person',
    },
    {
      type: 'request',
      skill: 'Excel basics',
      category: 'Tech & Digital',
      description: 'I want to track my baking orders without a paper diary. Formulas still feel like a foreign language.',
      memberId: 'm-aarti',
      availability: ['Weekday mornings', 'Weekday afternoons'],
      format: 'Either',
    },
    {
      type: 'offer',
      skill: 'Excel for work',
      category: 'Tech & Digital',
      description: 'VLOOKUP, pivot tables and cleaning up messy sheets. Useful for shop accounts or college projects.',
      memberId: 'm-vikram',
      availability: ['Weekday evenings'],
      format: 'Online',
    },
    {
      type: 'offer',
      skill: 'Public speaking',
      category: 'Study & Career',
      description: 'Practice in a hall with three friendly listeners. We work on breathing, pace and looking up.',
      memberId: 'm-vikram',
      availability: ['Weekend mornings'],
      format: 'In person',
    },
    {
      type: 'request',
      skill: 'Cooking',
      category: 'Food & Cooking',
      description: 'I can make four things and two of them are instant noodles. Would love to learn everyday Marathi cooking.',
      memberId: 'm-ketan',
      availability: ['Weekend afternoons', 'Weekday evenings'],
      format: 'In person',
    },
    {
      type: 'request',
      skill: 'Video calling',
      category: 'Tech & Digital',
      description: 'I want to see my grandchildren without asking someone else to set it up every single time.',
      memberId: 'm-dadaji',
      availability: ['Weekday mornings'],
      format: 'In person',
    },
    {
      type: 'offer',
      skill: 'Video editing on phone',
      category: 'Tech & Digital',
      description: 'Cutting, captions and music on a free app. Twenty minutes is genuinely enough to learn the basics.',
      memberId: 'm-nikhil',
      availability: ['Weekday evenings', 'Weekend afternoons'],
      format: 'Either',
    },
    {
      type: 'offer',
      skill: 'First aid basics',
      category: 'Wellness & Fitness',
      description: 'Burns, cuts, sprains, choking and when to actually go to hospital. For households with children or elders.',
      memberId: 'm-fatima',
      availability: ['Weekend mornings'],
      format: 'In person',
    },
    {
      type: 'offer',
      skill: 'Pickle & papad making',
      category: 'Food & Cooking',
      description: 'Seasonal pickle, sun-dried papad and the storage tricks that stop it going soft.',
      memberId: 'm-sunita',
      availability: ['Weekday afternoons'],
      format: 'In person',
    },
    {
      type: 'request',
      skill: 'Digital payments',
      category: 'Tech & Digital',
      description: 'Our self-help group wants to accept UPI safely. Need someone to explain limits, refunds and scam calls.',
      memberId: 'm-sunita',
      availability: ['Weekday afternoons'],
      format: 'In person',
    },
    {
      type: 'offer',
      skill: 'Yoga for seniors',
      category: 'Wellness & Fitness',
      description: 'Chair-based and balance yoga, adapted for stiff knees. Slow, seated and always optional.',
      memberId: 'm-fatima',
      availability: ['Weekend mornings'],
      format: 'In person',
    },
    {
      type: 'offer',
      skill: 'Sketching basics',
      category: 'Arts & Crafts',
      description: 'Line, proportion and shading with just a pen and any paper. Good for absolute beginners.',
      memberId: 'm-sana',
      availability: ['Weekend afternoons', 'Weekend evenings'],
      format: 'Either',
    },
    {
      type: 'offer',
      skill: 'Local history walks',
      category: 'Study & Career',
      description: 'Forty-five minutes around the old market with the stories nobody writes down any more.',
      memberId: 'm-dadaji',
      availability: ['Weekday mornings', 'Weekend mornings'],
      format: 'In person',
    },
    {
      type: 'offer',
      skill: 'Spoken English',
      category: 'Language & Literacy',
      description: 'Confidence first, grammar later. We practise real situations: interviews, phone calls, introductions.',
      memberId: 'm-priya',
      availability: ['Weekday afternoons'],
      format: 'Either',
    },
    {
      type: 'request',
      skill: 'Smartphone photography',
      category: 'Arts & Crafts',
      description: 'Want better photos of my students’ work for the school noticeboard.',
      memberId: 'm-priya',
      availability: ['Weekend evenings'],
      format: 'In person',
    },
    {
      type: 'offer',
      skill: 'Personal budgeting',
      category: 'Life & Everyday',
      description: 'A simple monthly system on paper or in a sheet. Made for salaried folks new to a city.',
      memberId: 'm-ketan',
      availability: ['Weekday evenings'],
      format: 'Either',
    },
    {
      type: 'offer',
      skill: 'Running form',
      category: 'Wellness & Fitness',
      description: 'Cadence, breathing and shoe advice to stop knee pain on the morning jog.',
      memberId: 'm-arjun',
      availability: ['Weekday mornings', 'Weekend mornings'],
      format: 'In person',
    },
    {
      type: 'request',
      skill: 'Playing guitar',
      category: 'Music & Performance',
      description: 'I can train your body but not my own fingers. Absolute beginner wanting three chords.',
      memberId: 'm-arjun',
      availability: ['Weekend mornings'],
      format: 'In person',
    },
    {
      type: 'request',
      skill: 'Basic smartphone use',
      category: 'Tech & Digital',
      description: 'Photos, WhatsApp, and how to stop accidentally deleting my own contacts.',
      memberId: 'm-meera',
      availability: ['Weekday mornings'],
      format: 'In person',
    },
  ]

  return rows.map((r, i) => ({
    ...r,
    id: `s-${i + 1}`,
    createdBy: 'community' as const,
    isSample: true,
    note: '',
    createdAt: new Date(Date.now() - (i + 1) * 36e5 * 4).toISOString(),
  }))
}

/* --------------------------- challenges ---------------------------- */

export function buildSampleChallenges(): CommunityChallenge[] {
  const rows: Array<Omit<CommunityChallenge, 'id' | 'createdAt' | 'isSample' | 'createdBy' | 'joined'>> = [
    {
      title: 'Organise a neighbourhood clean-up',
      goal: 'Clean the market lane and set up three waste-separation bins that stay.',
      description:
        'One lane, one Saturday morning, gloves and bags from the ward office. The second half is about keeping it clean — we ask two shops to host bins.',
      community: 'Shivaji Nagar, Ahilyanagar',
      category: 'Environment',
      sampleParticipants: 14,
      tasks: [
        { id: 't1', label: 'Confirm the lane and get ward office permission', done: false },
        { id: 't2', label: 'Arrange gloves, sacks and two pickup vehicles', done: false },
        { id: 't3', label: 'Ask three shopkeepers to host dustbins', done: false },
        { id: 't4', label: 'Put up one poster at each end of the lane', done: false },
      ],
    },
    {
      title: 'Help senior citizens learn smartphone basics',
      goal: 'Ten seniors confident with video calls, payments and spotting scam messages.',
      description:
        'A four-session digital help hour with the same volunteer paired to the same person each time. Repetition is the whole point.',
      community: 'Shivaji Nagar, Ahilyanagar',
      category: 'Digital Inclusion',
      sampleParticipants: 9,
      tasks: [
        { id: 't1', label: 'Book the community hall for four Saturdays', done: false },
        { id: 't2', label: 'Print a one-page cheat sheet in Marathi', done: false },
        { id: 't3', label: 'Pair six volunteers with ten learners', done: false },
        { id: 't4', label: 'Set up a phone-in helpline for the week after', done: false },
      ],
    },
    {
      title: 'Start a community book exchange',
      goal: 'A working take-one-leave-one shelf with 50 books in circulation.',
      description:
        'Find one shopkeeper willing to host a shelf, paint a small sign, and let the shelf run itself with a simple register.',
      community: 'Shivaji Nagar, Ahilyanagar',
      category: 'Learning',
      sampleParticipants: 6,
      tasks: [
        { id: 't1', label: 'Ask the tea stall and the library for shelf space', done: false },
        { id: 't2', label: 'Collect the first 25 donated books', done: false },
        { id: 't3', label: 'Paint and fix the signboard', done: false },
        { id: 't4', label: 'Print a simple take-one-leave-one register', done: false },
      ],
    },
    {
      title: 'Collect useful local stories and recipes',
      goal: 'Twenty recorded stories and fifteen recipes in one shared booklet.',
      description:
        'Grandparents and home cooks get recorded; students do the recording. Everyone gets a copy of the booklet at the end.',
      community: 'Shivaji Nagar, Ahilyanagar',
      category: 'Culture',
      sampleParticipants: 11,
      tasks: [
        { id: 't1', label: 'Interview five seniors about the old market', done: false },
        { id: 't2', label: 'Record four recipes with quantities, not guesses', done: false },
        { id: 't3', label: 'Transcribe and translate everything', done: false },
        { id: 't4', label: 'Print 40 copies of the booklet', done: false },
      ],
    },
    {
      title: 'Organise an intergenerational games afternoon',
      goal: 'One afternoon where under-25s and over-60s are on the same teams.',
      description:
        'Carrom, ludo, chess and one new game taught by the students. Mixed-age teams are mandatory, not optional.',
      community: 'Savedi, Ahilyanagar',
      category: 'Wellbeing',
      sampleParticipants: 18,
      tasks: [
        { id: 't1', label: 'Book the reading room for a Sunday', done: false },
        { id: 't2', label: 'Borrow four carrom boards and two chess sets', done: false },
        { id: 't3', label: 'Mix the teams so no age group plays alone', done: false },
        { id: 't4', label: 'Arrange tea and something to eat', done: false },
      ],
    },
    {
      title: 'Fix one local problem: the unlit stretch near the temple',
      goal: 'Three working streetlights reported, followed up and fixed.',
      description:
        'A small, finishable local fix. Photograph the poles, file one complaint together, and follow it up until it is done.',
      community: 'Shivaji Nagar, Ahilyanagar',
      category: 'Local Fix',
      sampleParticipants: 8,
      tasks: [
        { id: 't1', label: 'Photograph the three dark poles with house numbers', done: false },
        { id: 't2', label: 'File one complaint at the ward office together', done: false },
        { id: 't3', label: 'Follow up after one week', done: false },
        { id: 't4', label: 'Confirm the lights work at night', done: false },
      ],
    },
  ]

  return rows.map((r, i) => ({
    ...r,
    id: `c-${i + 1}`,
    joined: i < 2,
    createdBy: 'community' as const,
    isSample: true,
    createdAt: new Date(Date.now() - (i + 2) * 36e5 * 12).toISOString(),
  }))
}

/* -------------------------- notifications -------------------------- */

export function buildSampleNotifications(): AppNotification[] {
  return [
    {
      id: 'n-1',
      kind: 'match',
      title: '3 new suggested matches this week',
      message: 'People in Shivaji Nagar who share your interests — including one complementary skill swap.',
      createdAt: new Date(Date.now() - 26 * 60 * 1000).toISOString(),
      read: false,
      href: '/discover',
      seeded: true,
    },
    {
      id: 'n-2',
      kind: 'activity',
      title: 'Saved activity tomorrow morning',
      message: 'Morning stretch for desk workers — 7:15 AM at the municipal garden benches.',
      createdAt: new Date(Date.now() - 3 * 36e5).toISOString(),
      read: false,
      href: '/schedule',
      seeded: true,
    },
    {
      id: 'n-3',
      kind: 'skill',
      title: 'A complementary skill swap is waiting',
      message: 'Rajesh Patil teaches basic car maintenance and wants to learn smartphone photography.',
      createdAt: new Date(Date.now() - 9 * 36e5).toISOString(),
      read: false,
      href: '/skills?tab=matches',
      seeded: true,
    },
    {
      id: 'n-4',
      kind: 'community',
      title: 'Neighbourhood clean-up needs two more organisers',
      message: 'The lane clean-up challenge has 14 sample participants and four open tasks.',
      createdAt: new Date(Date.now() - 30 * 36e5).toISOString(),
      read: true,
      href: '/community',
      seeded: true,
    },
    {
      id: 'n-5',
      kind: 'profile',
      title: 'Add your accessibility preferences',
      message: 'It helps Milaap suggest meetups that actually suit you.',
      createdAt: new Date(Date.now() - 52 * 36e5).toISOString(),
      read: true,
      href: '/profile',
      seeded: true,
    },
  ]
}

/* ------------------------ aggregate builder ------------------------ */

export function buildSeedState() {
  return {
    version: CURRENT_DATA_VERSION,
    profile: buildSampleProfile(),
    connections: [
      { memberId: 'm-meera', addedAt: new Date(Date.now() - 6 * 864e5).toISOString(), source: 'discover' as const },
      { memberId: 'm-aarti', addedAt: new Date(Date.now() - 3 * 864e5).toISOString(), source: 'community' as const },
    ],
    invitations: buildSampleInvitations(),
    activities: buildSampleActivities(),
    joinedActivityIds: ['a-2', 'a-9'],
    savedActivityIds: ['a-3'],
    completedActivityIds: ['a-9'],
    skillListings: buildSampleSkillListings(),
    savedSkillIds: ['s-18'],
    challenges: buildSampleChallenges(),
    completedTaskIds: [] as string[],
    savedChallengeIds: ['c-1'],
    members: SAMPLE_MEMBERS,
    notifications: buildSampleNotifications(),
    savedMemberIds: ['m-sana'],
    dismissedMemberIds: [] as string[],
    settings: {
      theme: 'light' as const,
      reducedMotion: false,
      notify: { matches: true, activities: true, invitations: true, skills: true, community: true, profile: true },
      activeCommunity: DEFAULT_COMMUNITY,
    },
    lastUpdated: new Date().toISOString(),
    flags: {} as Record<string, boolean>,
  }
}

export const AVATAR_IDS = [
  'aarav-me', 'meera-joshi', 'rajesh-patil', 'sana-sheikh', 'vikram-rane', 'aarti-deshmukh',
  'dadaji-pawar', 'nikhil-kamble', 'fatima-ansari', 'ketan-shah', 'sunita-bhosale', 'arjun-nair', 'priya-kulkarni',
]

export const ACTIVITY_ICON_KEY: Record<string, string> = Object.fromEntries(
  ACTIVITY_CATEGORIES.map((c) => [c, c]),
)

export const ALL_AVAILABILITY = AVAILABILITY_SLOTS
