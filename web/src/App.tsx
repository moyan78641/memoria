import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from './layouts/AppLayout'
import { AuthGuard } from './components/AuthGuard'
import { Dashboard } from './pages/Dashboard'
import { Memorials } from './pages/Memorials'
import { Calendar } from './pages/Calendar'
import { Notifications } from './pages/Notifications'
import { Statistics } from './pages/Statistics'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/memorials" element={<Memorials />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  )
}
