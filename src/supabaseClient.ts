import { createClient } from '@supabase/supabase-js'

// Interfaces para los tipos de datos
export interface Autor {
  id: string
  nombre: string
  nacionalidad: string
}

export interface Libro {
  id: string
  titulo: string
  anio_publicacion: number
  autor_id: string
  autores?: {
    nombre: string
  }
}

// Configuración de Supabase
// Nota: Reemplaza estas variables con tus credenciales de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

