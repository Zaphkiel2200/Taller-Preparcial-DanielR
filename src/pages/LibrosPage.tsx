import { useState, useEffect } from 'react'
import { supabase, Libro, Autor } from '../supabaseClient'

export default function LibrosPage() {
  const [libros, setLibros] = useState<Libro[]>([])
  const [autores, setAutores] = useState<Autor[]>([])
  const [titulo, setTitulo] = useState('')
  const [anioPublicacion, setAnioPublicacion] = useState<number>(new Date().getFullYear())
  const [autorId, setAutorId] = useState('')
  const [editingLibro, setEditingLibro] = useState<Libro | null>(null)

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
      alert('Error al obtener autores')
    }
  }

  // Función para obtener todos los libros con el nombre del autor
  const fetchLibros = async () => {
    try {
      const { data, error } = await supabase
        .from('libros')
        .select('*, autores(nombre)')
        .order('titulo', { ascending: true })

      if (error) throw error
      if (data) setLibros(data)
    } catch (error) {
      console.error('Error al obtener libros:', error)
      alert('Error al obtener libros')
    }
  }

  // Función para manejar el submit (INSERT o UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!titulo.trim() || !autorId || !anioPublicacion) {
      alert('Por favor completa todos los campos')
      return
    }

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
        alert('Libro actualizado correctamente')
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
        alert('Libro creado correctamente')
      }

      // Limpiar formulario y recargar datos
      setTitulo('')
      setAnioPublicacion(new Date().getFullYear())
      setAutorId('')
      setEditingLibro(null)
      fetchLibros()
    } catch (error) {
      console.error('Error al guardar libro:', error)
      alert('Error al guardar libro')
    }
  }

  // Función para manejar la edición
  const handleEdit = (libro: Libro) => {
    setTitulo(libro.titulo)
    setAnioPublicacion(libro.anio_publicacion)
    setAutorId(libro.autor_id)
    setEditingLibro(libro)
  }

  // Función para manejar la eliminación
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este libro?')) {
      return
    }

    try {
      const { error } = await supabase.from('libros').delete().eq('id', id)

      if (error) throw error
      alert('Libro eliminado correctamente')
      fetchLibros()
    } catch (error) {
      console.error('Error al eliminar libro:', error)
      alert('Error al eliminar libro')
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchAutores()
    fetchLibros()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Libros</h1>

      {/* Formulario de Creación/Edición */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {editingLibro ? 'Editar Libro' : 'Nuevo Libro'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Título del libro"
              required
            />
          </div>
          <div>
            <label
              htmlFor="anioPublicacion"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Año de Publicación
            </label>
            <input
              type="number"
              id="anioPublicacion"
              value={anioPublicacion}
              onChange={(e) => setAnioPublicacion(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Año de publicación"
              min="1000"
              max={new Date().getFullYear() + 1}
              required
            />
          </div>
          <div>
            <label htmlFor="autorId" className="block text-sm font-medium text-gray-700 mb-1">
              Autor
            </label>
            <select
              id="autorId"
              value={autorId}
              onChange={(e) => setAutorId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecciona un autor</option>
              {autores.map((autor) => (
                <option key={autor.id} value={autor.id}>
                  {autor.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {editingLibro ? 'Actualizar' : 'Crear'}
            </button>
            {editingLibro && (
              <button
                type="button"
                onClick={() => {
                  setTitulo('')
                  setAnioPublicacion(new Date().getFullYear())
                  setAutorId('')
                  setEditingLibro(null)
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla de Lectura */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 text-gray-700 border-b border-gray-200">
          Lista de Libros
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Año de Publicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {libros.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No hay libros registrados
                  </td>
                </tr>
              ) : (
                libros.map((libro) => (
                  <tr key={libro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {libro.titulo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {libro.anio_publicacion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(libro.autores as { nombre: string })?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(libro)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(libro.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

