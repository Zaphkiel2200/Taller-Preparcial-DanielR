import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import AutoresPage from './pages/AutoresPage'
import LibrosPage from './pages/LibrosPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        {/* Barra de navegación */}
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Libros y Autores</h1>
              <div className="flex gap-4">
                <Link
                  to="/autores"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors font-medium"
                >
                  Autores
                </Link>
                <Link
                  to="/libros"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors font-medium"
                >
                  Libros
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Contenido de las rutas */}
        <Routes>
          <Route path="/autores" element={<AutoresPage />} />
          <Route path="/libros" element={<LibrosPage />} />
          <Route path="/" element={<AutoresPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
