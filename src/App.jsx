import { Routes, Route } from 'react-router-dom'
import BuilderPage from './pages/BuilderPage'
import DashboardPage from './pages/DashboardPage'
import { Footer } from './components/Footer'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<BuilderPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
