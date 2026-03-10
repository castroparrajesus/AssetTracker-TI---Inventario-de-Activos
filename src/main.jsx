import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './supabase'
import App from './App.jsx'
import Login from './Login.jsx'
import OrgSetup from './OrgSetup.jsx'

function Root() {
  const [session, setSession] = useState(null)
  const [org, setOrg]         = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) cargarOrg(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) cargarOrg(session.user.id)
      else { setOrg(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function cargarOrg(userId) {
  setLoading(true)
  const { data } = await supabase
    .from('miembros')
    .select('org_id, organizaciones(id, nombre, codigo)')
    .eq('user_id', userId)
    .maybeSingle()
  if (data?.organizaciones) setOrg(data.organizaciones)
  setLoading(false)
}

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#060d1a",display:"flex",alignItems:"center",justifyContent:"center",color:"#334155",fontFamily:"'Space Mono',monospace",fontSize:14}}>
      Cargando...
    </div>
  )

  if (!session) return <Login />
  if (!org) return <OrgSetup onComplete={(newOrg) => setOrg(newOrg)} />
  return <App session={session} org={org} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
