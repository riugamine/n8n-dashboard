import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Funciones de autenticación
export const auth = {
  async signIn(email: string, password: string) {
    const supabase = createClient()
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  },

  async signOut() {
    const supabase = createClient()
    return await supabase.auth.signOut()
  },

  async getUser() {
    const supabase = createClient()
    return await supabase.auth.getUser()
  },

  async getSession() {
    const supabase = createClient()
    return await supabase.auth.getSession()
  }
} 