import { useState, useEffect } from 'react'
import { supabase, Libro, Autor } from '../supabaseClient'
import Toast from '../components/Toast'

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
}

export default function LibrosPage() {
  const [libros, setLibros] = useState<Libro[]>([])
  const [autores, setAutores] = useState<Autor[]>([])
  const [titulo, setTitulo] = useState('')
  const [anioPublicacion, setAnioPublicacion] = useState<number>(new Date().getFullYear())
  const [autorId, setAutorId] = useState('')
  const [editingLibro, setEditingLibro] = useState<Libro | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type })
  }

  // Función para obtener todos los autores
  const fetchAutores = async () => {
    try {
      const { data, error } = await supabase
        .from('autores')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error
      if (data) setAutores(data)
    } catch (error) {
      console.error('Error al obtener autores:', error)
      showToast('Error al obtener autores', 'error')
    }
  }

  // Función para obtener todos los libros con el nombre del autor
  const fetchLibros = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('libros')
        .select('*, autores(nombre)')
        .order('titulo', { ascending: true })

      if (error) throw error
      if (data) setLibros(data)
    } catch (error) {
      console.error('Error al obtener libros:', error)
      showToast('Error al obtener libros', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar el submit (INSERT o UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!titulo.trim() || !autorId || !anioPublicacion) {
      showToast('Por favor completa todos los campos', 'error')
      return
    }

    if (anioPublicacion < 1000 || anioPublicacion > new Date().getFullYear() + 1) {
      showToast('Por favor ingresa un año válido', 'error')
      return
    }

    setSubmitting(true)
    try {
      if (editingLibro) {
        // UPDATE
        const { error } = await supabase
          .from('libros')
          .update({
            titulo,
            anio_publicacion: anioPublicacion,
            autor_id: autorId,
          })
          .eq('id', editingLibro.id)

        if (error) throw error
        showToast('Libro actualizado correctamente', 'success')
      } else {
        // INSERT
        const { error } = await supabase
          .from('libros')
          .insert([
            {
              titulo,
              anio_publicacion: anioPublicacion,
              autor_id: autorId,
            },
          ])

        if (error) throw error
        showToast('Libro creado correctamente', 'success')
      }

      // Limpiar formulario y recargar datos
      setTitulo('')
      setAnioPublicacion(new Date().getFullYear())
      setAutorId('')
      setEditingLibro(null)
      fetchLibros()
    } catch (error) {
      console.error('Error al guardar libro:', error)
      showToast('Error al guardar libro', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Función para manejar la edición
  const handleEdit = (libro: Libro) => {
    setTitulo(libro.titulo)
    setAnioPublicacion(libro.anio_publicacion)
    setAutorId(libro.autor_id)
    setEditingLibro(libro)
    // Scroll suave al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Función para manejar la eliminación
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este libro?')) {
      return
    }

    try {
      const { error } = await supabase.from('libros').delete().eq('id', id)

      if (error) throw error
      showToast('Libro eliminado correctamente', 'success')
      fetchLibros()
    } catch (error) {
      console.error('Error al eliminar libro:', error)
      showToast('Error al eliminar libro', 'error')
    }
  }

  const handleCancel = () => {
    setTitulo('')
    setAnioPublicacion(new Date().getFullYear())
    setAutorId('')
    setEditingLibro(null)
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchAutores()
    fetchLibros()
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
          <span className="text-5xl">📖</span>
          Gestión de Libros
        </h1>
        <p className="text-gray-600">Administra los libros de tu biblioteca</p>
      </div>

      {/* Formulario de Creación/Edición */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">
            {editingLibro ? '✏️' : '➕'}
          </span>
          <h2 className="text-2xl font-bold text-gray-800">
            {editingLibro ? 'Editar Libro' : 'Nuevo Libro'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="titulo"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Título del Libro
            </label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Ej: Cien años de soledad"
              required
              disabled={submitting}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="anioPublicacion"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Año de Publicación
              </label>
              <input
                type="number"
                id="anioPublicacion"
                value={anioPublicacion}
                onChange={(e) => setAnioPublicacion(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Año de publicación"
                min="1000"
                max={new Date().getFullYear() + 1}
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label
                htmlFor="autorId"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Autor
              </label>
              <select
                id="autorId"
                value={autorId}
                onChange={(e) => setAutorId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                required
                disabled={submitting || autores.length === 0}
              >
                <option value="">
                  {autores.length === 0
                    ? 'No hay autores disponibles'
                    : 'Selecciona un autor'}
                </option>
                {autores.map((autor) => (
                  <option key={autor.id} value={autor.id}>
                    {autor.nombre}
                  </option>
                ))}
              </select>
              {autores.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  ⚠️ Primero debes crear al menos un autor
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || autores.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {editingLibro ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <span>{editingLibro ? '💾' : '✨'}</span>
                  {editingLibro ? 'Actualizar Libro' : 'Crear Libro'}
                </>
              )}
            </button>
            {editingLibro && (
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
              Lista de Libros
            </h2>
            <span className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {libros.length} {libros.length === 1 ? 'libro' : 'libros'}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-600 font-medium">Cargando libros...</p>
            </div>
          ) : libros.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 font-medium text-lg">
                No hay libros registrados
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Crea tu primer libro usando el formulario de arriba
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Año de Publicación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {libros.map((libro, index) => (
                  <tr
                    key={libro.id}
                    className="hover:bg-blue-50 transition-colors duration-150"
                    style={{
                      animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📚</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {libro.titulo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {libro.anio_publicacion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👤</span>
                        <span className="text-sm text-gray-700 font-medium">
                          {(libro.autores as { nombre: string })?.nombre || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(libro)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium text-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(libro.id)}
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
