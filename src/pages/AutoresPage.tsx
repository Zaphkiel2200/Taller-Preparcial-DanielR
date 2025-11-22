import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import type { Autor } from '../supabaseClient'
import Toast from '../components/Toast'

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
}

// Datos de ejemplo para modo demo
const getDemoAutores = (): Autor[] => {
  const stored = localStorage.getItem('demo_autores')
  if (stored) {
    return JSON.parse(stored)
  }
  // Datos iniciales de ejemplo
  return [
    { id: '1', nombre: 'Gabriel García Márquez', nacionalidad: 'Colombiano' },
    { id: '2', nombre: 'Mario Vargas Llosa', nacionalidad: 'Peruano' },
    { id: '3', nombre: 'Isabel Allende', nacionalidad: 'Chilena' },
  ]
}

export default function AutoresPage() {
  const [autores, setAutores] = useState<Autor[]>([])
  const [nombre, setNombre] = useState('')
  const [nacionalidad, setNacionalidad] = useState('')
  const [editingAutor, setEditingAutor] = useState<Autor | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type })
  }

  // Función para obtener todos los autores
  const fetchAutores = async () => {
    setLoading(true)
    try {
      if (isSupabaseConfigured && supabase) {
        // Modo con Supabase
        const { data, error } = await supabase
          .from('autores')
          .select('*')
          .order('nombre', { ascending: true })

        if (error) throw error
        if (data) setAutores(data)
      } else {
        // Modo demo - usar datos locales
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simular carga
        const demoAutores = getDemoAutores()
        setAutores(demoAutores)
      }
    } catch (error) {
      console.error('Error al obtener autores:', error)
      // Si falla Supabase, usar datos demo
      const demoAutores = getDemoAutores()
      setAutores(demoAutores)
      if (isSupabaseConfigured) {
        showToast('Error al conectar con Supabase. Usando modo demo.', 'info')
      }
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar el submit (INSERT o UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim() || !nacionalidad.trim()) {
      showToast('Por favor completa todos los campos', 'error')
      return
    }

    setSubmitting(true)
    try {
      if (isSupabaseConfigured && supabase) {
        // Modo con Supabase
        if (editingAutor) {
          // UPDATE
          const { error } = await supabase
            .from('autores')
            .update({ nombre, nacionalidad })
            .eq('id', editingAutor.id)

          if (error) throw error
          showToast('Autor actualizado correctamente', 'success')
        } else {
          // INSERT
          const { error } = await supabase
            .from('autores')
            .insert([{ nombre, nacionalidad }])

          if (error) throw error
          showToast('Autor creado correctamente', 'success')
        }
      } else {
        // Modo demo - guardar en localStorage
        await new Promise((resolve) => setTimeout(resolve, 300)) // Simular guardado
        const currentAutores = getDemoAutores()
        
        if (editingAutor) {
          // UPDATE
          const updated = currentAutores.map((a) =>
            a.id === editingAutor.id ? { ...a, nombre, nacionalidad } : a
          )
          localStorage.setItem('demo_autores', JSON.stringify(updated))
          showToast('Autor actualizado correctamente (modo demo)', 'success')
        } else {
          // INSERT
          const newAutor: Autor = {
            id: Date.now().toString(),
            nombre,
            nacionalidad,
          }
          const updated = [...currentAutores, newAutor].sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
          )
          localStorage.setItem('demo_autores', JSON.stringify(updated))
          showToast('Autor creado correctamente (modo demo)', 'success')
        }
      }

      // Limpiar formulario y recargar datos
      setNombre('')
      setNacionalidad('')
      setEditingAutor(null)
      fetchAutores()
    } catch (error) {
      console.error('Error al guardar autor:', error)
      showToast('Error al guardar autor', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Función para manejar la edición
  const handleEdit = (autor: Autor) => {
    setNombre(autor.nombre)
    setNacionalidad(autor.nacionalidad)
    setEditingAutor(autor)
    // Scroll suave al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Función para manejar la eliminación
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este autor?')) {
      return
    }

    try {
      if (isSupabaseConfigured && supabase) {
        // Modo con Supabase
        const { error } = await supabase
          .from('autores')
          .delete()
          .eq('id', id)

        if (error) throw error
        showToast('Autor eliminado correctamente', 'success')
      } else {
        // Modo demo - eliminar de localStorage
        await new Promise((resolve) => setTimeout(resolve, 300))
        const currentAutores = getDemoAutores()
        const updated = currentAutores.filter((a) => a.id !== id)
        localStorage.setItem('demo_autores', JSON.stringify(updated))
        showToast('Autor eliminado correctamente (modo demo)', 'success')
      }
      fetchAutores()
    } catch (error) {
      console.error('Error al eliminar autor:', error)
      showToast('Error al eliminar autor. Verifica que no tenga libros asociados.', 'error')
    }
  }

  const handleCancel = () => {
    setNombre('')
    setNacionalidad('')
    setEditingAutor(null)
  }

  // Cargar autores al montar el componente
  useEffect(() => {
    fetchAutores()
  }, [])

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <span className="text-5xl">👤</span>
          Gestión de Autores
        </h1>
        <p className="text-gray-600">Administra los autores de tu biblioteca</p>
        {!isSupabaseConfigured && (
          <div className="mt-4 inline-block px-4 py-2 bg-amber-100 border border-amber-300 rounded-lg">
            <p className="text-amber-800 text-sm font-medium">
              ⚠️ Modo Demo: Los datos se guardan localmente. Configura Supabase para usar la base de datos.
            </p>
          </div>
        )}
      </div>

      {/* Formulario de Creación/Edición */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">
            {editingAutor ? '✏️' : '➕'}
          </span>
          <h2 className="text-2xl font-bold text-gray-800">
            {editingAutor ? 'Editar Autor' : 'Nuevo Autor'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Nombre del Autor
              </label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Ej: Gabriel García Márquez"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label
                htmlFor="nacionalidad"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Nacionalidad
              </label>
              <input
                type="text"
                id="nacionalidad"
                value={nacionalidad}
                onChange={(e) => setNacionalidad(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Ej: Colombiano"
                required
                disabled={submitting}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {editingAutor ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <span>{editingAutor ? '💾' : '✨'}</span>
                  {editingAutor ? 'Actualizar Autor' : 'Crear Autor'}
                </>
              )}
            </button>
            {editingAutor && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla de Lectura */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>📋</span>
              Lista de Autores
            </h2>
            <span className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {autores.length} {autores.length === 1 ? 'autor' : 'autores'}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-600 font-medium">Cargando autores...</p>
            </div>
          ) : autores.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 font-medium text-lg">
                No hay autores registrados
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Crea tu primer autor usando el formulario de arriba
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Nacionalidad
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {autores.map((autor, index) => (
                  <tr
                    key={autor.id}
                    className="hover:bg-blue-50 transition-colors duration-150"
                    style={{
                      animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">👤</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {autor.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        {autor.nacionalidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(autor)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium text-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(autor.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 font-medium text-sm"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
