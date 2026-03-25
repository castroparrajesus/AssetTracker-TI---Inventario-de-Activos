import { useState } from "react";
import { supabase } from "./supabase";

export default function Login() {
  const [mode, setMode]         = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async () => {
    if (!email || !password) return setError("Completa todos los campos.");
    setLoading(true);
    setError("");
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("Correo o contraseña incorrectos.");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError("Error al registrarse: " + error.message);
      else setError("✅ Cuenta creada. Ya puedes iniciar sesión.");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
  setLoadingGoogle(true);
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { 
      redirectTo: 'https://assettracker-ti.vercel.app'
    }
  });
  setLoadingGoogle(false);
};

  const usarDemo = () => {
    setEmail("demo@assettracker.com");
    setPassword("demo1234");
    setMode("login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060d1a; }
        input:focus { border-color: #0ea5e9 !important; }
        .google-btn:hover { background: rgba(255,255,255,0.08) !important; }
      `}</style>

      <div style={{minHeight:"100vh",background:"#060d1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:20}}>

        <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none"}}>
          <div style={{position:"absolute",top:"20%",left:"10%",width:400,height:400,borderRadius:"50%",background:"rgba(14,165,233,0.05)",filter:"blur(80px)"}}></div>
          <div style={{position:"absolute",bottom:"20%",right:"10%",width:300,height:300,borderRadius:"50%",background:"rgba(99,102,241,0.05)",filter:"blur(80px)"}}></div>
        </div>

        <div style={{width:"100%",maxWidth:420,position:"relative"}}>

          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:16,boxShadow:"0 8px 24px rgba(14,165,233,0.3)"}}>🗄️</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:20,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>AssetTracker TI</div>
            <div style={{color:"#475569",fontSize:13,fontFamily:"'Space Mono',monospace"}}>Gestión de Activos Tecnológicos</div>
          </div>

          {/* Demo banner */}
          <div style={{background:"rgba(14,165,233,0.08)",border:"1px solid rgba(14,165,233,0.2)",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
            <div style={{color:"#0ea5e9",fontSize:11,fontFamily:"'Space Mono',monospace",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>🎯 Cuenta Demo</div>
            <div style={{color:"#64748b",fontSize:12,fontFamily:"'Space Mono',monospace",lineHeight:2}}>
              Email: demo@assettracker.com<br/>
              Contraseña: demo1234
            </div>
            <button onClick={usarDemo} style={{marginTop:10,padding:"7px 12px",background:"rgba(14,165,233,0.15)",border:"1px solid rgba(14,165,233,0.3)",borderRadius:7,color:"#0ea5e9",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:11,width:"100%",fontWeight:700}}>
              Usar cuenta demo →
            </button>
          </div>

          <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:20,padding:32,boxShadow:"0 25px 60px rgba(0,0,0,0.5)"}}>

            {/* Google Button */}
            <button className="google-btn" onClick={handleGoogle} disabled={loadingGoogle}
              style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.05)",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:20,transition:"background .2s",opacity:loadingGoogle?0.7:1}}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loadingGoogle ? "Conectando..." : "Continuar con Google"}
            </button>

            {/* Separador */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <div style={{flex:1,height:1,background:"#1e293b"}}></div>
              <span style={{color:"#334155",fontSize:12,fontFamily:"'Space Mono',monospace"}}>o</span>
              <div style={{flex:1,height:1,background:"#1e293b"}}></div>
            </div>

            {/* Tabs */}
            <div style={{display:"flex",gap:4,marginBottom:20,background:"#1e293b",borderRadius:10,padding:4}}>
              {[["login","Iniciar Sesión"],["register","Registrarse"]].map(([m,label])=>(
                <button key={m} onClick={()=>{setMode(m);setError("");}} style={{flex:1,padding:"8px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:12,fontWeight:700,background:mode===m?"linear-gradient(135deg,#0ea5e9,#6366f1)":"transparent",color:mode===m?"#fff":"#475569",transition:"all .2s"}}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <label style={{display:"block",color:"#64748b",fontSize:11,fontFamily:"'Space Mono',monospace",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Correo electrónico</label>
                <input type="email" placeholder="tu@correo.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                  style={{width:"100%",background:"#1e293b",border:"1px solid #334155",borderRadius:10,padding:"12px 14px",color:"#e2e8f0",fontSize:14,outline:"none",fontFamily:"inherit",transition:"border .2s"}}/>
              </div>
              <div>
                <label style={{display:"block",color:"#64748b",fontSize:11,fontFamily:"'Space Mono',monospace",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Contraseña</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                  style={{width:"100%",background:"#1e293b",border:"1px solid #334155",borderRadius:10,padding:"12px 14px",color:"#e2e8f0",fontSize:14,outline:"none",fontFamily:"inherit",transition:"border .2s"}}/>
              </div>

              {error && (
                <div style={{padding:"10px 14px",borderRadius:8,background:error.startsWith("✅")?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",border:`1px solid ${error.startsWith("✅")?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`,color:error.startsWith("✅")?"#22c55e":"#f87171",fontSize:13,fontFamily:"'Space Mono',monospace"}}>
                  {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:14,fontWeight:700,boxShadow:"0 4px 15px rgba(14,165,233,0.3)",opacity:loading?0.7:1,marginTop:4}}>
                {loading ? "Cargando..." : mode==="login" ? "Iniciar Sesión" : "Crear Cuenta"}
              </button>
            </div>
          </div>

          <div style={{textAlign:"center",marginTop:16,color:"#334155",fontSize:11,fontFamily:"'Space Mono',monospace"}}>
            AssetTracker TI v3.0 — Jesús Castro
          </div>
        </div>
      </div>
    </>
  );
}
