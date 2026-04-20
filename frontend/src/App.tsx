import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { useLenis } from '@/lib/lenis'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import AreaPessoalPage from './pages/AreaPessoalPage'
import AlbumListPage from './pages/gallery/AlbumListPage'
import AlbumDetailPage from './pages/gallery/AlbumDetailPage'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient()

function AppContent() {
  useLenis()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/area-pessoal"
        element={
          <ProtectedRoute>
            <AreaPessoalPage />
          </ProtectedRoute>
        }
      >
        <Route path="albuns" element={<AlbumListPage />} />
        <Route path="albuns/:id" element={<AlbumDetailPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}
