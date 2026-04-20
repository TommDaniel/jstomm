import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-verde-floresta flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-dourado-vintage border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-script text-madeira-clara">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
