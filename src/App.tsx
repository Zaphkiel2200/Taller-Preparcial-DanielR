import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import AutoresPage from './pages/AutoresPage'
import LibrosPage from './pages/LibrosPage'
import './App.css'

function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <h1 className="text-2xl font-bold text-white">Gestión de Libros y Autores</h1>
          </Link>
          <div className="flex gap-2">
            <Link
              to="/autores"
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                isActive('/autores') || isActive('/')
                  ? 'bg-white text-blue-600 shadow-lg scale-105'
                  : 'text-white hover:bg-white/20 hover:scale-105'
              }`}
            >
              👤 Autores
            </Link>
            <Link
              to="/libros"
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                isActive('/libros')
                  ? 'bg-white text-blue-600 shadow-lg scale-105'
                  : 'text-white hover:bg-white/20 hover:scale-105'
              }`}
            >
              📖 Libros
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/autores" element={<AutoresPage />} />
            <Route path="/libros" element={<LibrosPage />} />
            <Route path="/" element={<AutoresPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
