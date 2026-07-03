import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabaseCp } from '@/lib/supabase-cp'

interface AuthState {
  user: User | null
  isAdmin: boolean
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    loading: true,
  })

  async function checkAdmin(user: User) {
    const { data } = await supabaseCp
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .single()

    setState({
      user,
      isAdmin: !!data,
      loading: false,
    })
  }

  useEffect(() => {
    supabaseCp.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAdmin(session.user)
      } else {
        setState({ user: null, isAdmin: false, loading: false })
      }
    })

    const { data: { subscription } } = supabaseCp.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkAdmin(session.user)
      } else {
        setState({ user: null, isAdmin: false, loading: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabaseCp.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabaseCp.auth.signOut()
  }

  return { ...state, signIn, signOut }
}
