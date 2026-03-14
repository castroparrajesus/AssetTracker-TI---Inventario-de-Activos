import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './supabase'
import App from './App.jsx'
import Login from './Login.jsx'
import Setup from './Setup.jsx'

function Root() {
  const [session, setSession]   = useState(null)
  const [perfil, setPerfil]     = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) cargarPerfil(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) cargarPerfil(session.user.id)
      else { setPerfil(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function cargarPerfil(userId) {
    setLoading(true)
    const { data } = await supabase
      .from('perfiles')
      .select('*, organizaciones(id, nombre, codigo)')
      .eq('id', userId)
      .maybeSingle()
    if (data) setPerfil(data)
    setLoading(false)
  }

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#060d1a",display:"flex",alignItems:"center",justifyContent:"center",color:"#334155",fontFamily:"'Space Mono',monospace",fontSize:14}}>
      Cargando...
    </div>
  )

  if (!session) return <Login />
  if (!perfil) return <Setup onComplete={(data) => setPerfil(data)} />
  return <App session={session} perfil={perfil} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
