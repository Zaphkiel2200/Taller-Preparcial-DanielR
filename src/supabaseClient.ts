import { createClient } from '@supabase/supabase-js'

// Tipos para los datos
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

// Verificar si Supabase está configurado
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Crear cliente de Supabase solo si está configurado
// Si no está configurado, creamos un cliente dummy que no hará nada
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({
      from: () => ({
        select: () => Promise.resolve({ data: null, error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    } as any)

