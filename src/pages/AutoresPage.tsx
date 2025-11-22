import { useState, useEffect } from 'react'
import { supabase, Autor } from '../supabaseClient'

export default function AutoresPage() {
  const [autores, setAutores] = useState<Autor[]>([])
  const [nombre, setNombre] = useState('')
  const [nacionalidad, setNacionalidad] = useState('')
  const [editingAutor, setEditingAutor] = useState<Autor | null>(null)

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

  // Función para manejar el submit (INSERT o UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim() || !nacionalidad.trim()) {
      alert('Por favor completa todos los campos')
      return
    }

    try {
      if (editingAutor) {
        // UPDATE
        const { error } = await supabase
          .from('autores')
          .update({ nombre, nacionalidad })
          .eq('id', editingAutor.id)

        if (error) throw error
        alert('Autor actualizado correctamente')
      } else {
        // INSERT
        const { error } = await supabase
          .from('autores')
          .insert([{ nombre, nacionalidad }])

        if (error) throw error
        alert('Autor creado correctamente')
      }

      // Limpiar formulario y recargar datos
      setNombre('')
      setNacionalidad('')
      setEditingAutor(null)
      fetchAutores()
    } catch (error) {
      console.error('Error al guardar autor:', error)
      alert('Error al guardar autor')
    }
  }

  // Función para manejar la edición
  const handleEdit = (autor: Autor) => {
    setNombre(autor.nombre)
    setNacionalidad(autor.nacionalidad)
    setEditingAutor(autor)
  }

  // Función para manejar la eliminación
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este autor?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('autores')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Autor eliminado correctamente')
      fetchAutores()
    } catch (error) {
      console.error('Error al eliminar autor:', error)
      alert('Error al eliminar autor. Verifica que no tenga libros asociados.')
    }
  }

  // Cargar autores al montar el componente
  useEffect(() => {
    fetchAutores()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Autores</h1>

      {/* Formulario de Creación/Edición */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {editingAutor ? 'Editar Autor' : 'Nuevo Autor'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre del autor"
              required
            />
          </div>
          <div>
            <label htmlFor="nacionalidad" className="block text-sm font-medium text-gray-700 mb-1">
              Nacionalidad
            </label>
            <input
              type="text"
              id="nacionalidad"
              value={nacionalidad}
              onChange={(e) => setNacionalidad(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nacionalidad del autor"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {editingAutor ? 'Actualizar' : 'Crear'}
            </button>
            {editingAutor && (
              <button
                type="button"
                onClick={() => {
                  setNombre('')
                  setNacionalidad('')
                  setEditingAutor(null)
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
          Lista de Autores
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nacionalidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {autores.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    No hay autores registrados
                  </td>
                </tr>
              ) : (
                autores.map((autor) => (
                  <tr key={autor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {autor.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {autor.nacionalidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(autor)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(autor.id)}
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

