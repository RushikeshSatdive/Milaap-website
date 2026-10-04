import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { HomePage } from './pages/HomePage'
import { DiscoverPage } from './pages/DiscoverPage'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { SkillsPage } from './pages/SkillsPage'
import { CommunityPage } from './pages/CommunityPage'
import { ConnectionsPage } from './pages/ConnectionsPage'
import { SchedulePage } from './pages/SchedulePage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProfileEditPage } from './pages/ProfileEditPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="connections" element={<ConnectionsPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/edit" element={<ProfileEditPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Friendly aliases so no link ever dead-ends */}
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="people" element={<Navigate to="/discover" replace />} />
        <Route path="skills-exchange" element={<Navigate to="/skills" replace />} />
        <Route path="me" element={<Navigate to="/profile" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
