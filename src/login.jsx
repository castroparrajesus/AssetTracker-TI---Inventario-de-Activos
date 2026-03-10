import { useState } from "react";
import { supabase } from "./supabase";

export default function Login() {
  const [mode, setMode]       = useState("login"); // "login" | "register"
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060d1a; }
        input:focus { border-color: #0ea5e9 !important; }
      `}</style>

      <div style={{minHeight:"100vh",background:"#060d1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:20}}>

        {/* Fondo decorativo */}
        <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none"}}>
          <div style={{position:"absolute",top:"20%",left:"10%",width:400,height:400,borderRadius:"50%",background:"rgba(14,165,233,0.05)",filter:"blur(80px)"}}></div>
          <div style={{position:"absolute",bottom:"20%",right:"10%",width:300,height:300,borderRadius:"50%",background:"rgba(99,102,241,0.05)",filter:"blur(80px)"}}></div>
        </div>

        <div style={{width:"100%",maxWidth:420,position:"relative"}}>

          {/* Logo */}
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:16,boxShadow:"0 8px 24px rgba(14,165,233,0.3)"}}>🗄️</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:20,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>AssetTracker TI</div>
            <div style={{color:"#475569",fontSize:13,fontFamily:"'Space Mono',monospace"}}>Gestión de Activos Tecnológicos</div>
          </div>

          {/* Card */}
          <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:20,padding:32,boxShadow:"0 25px 60px rgba(0,0,0,0.5)"}}>

            {/* Tabs */}
            <div style={{display:"flex",gap:4,marginBottom:28,background:"#1e293b",borderRadius:10,padding:4}}>
              {[["login","Iniciar Sesión"],["register","Registrarse"]].map(([m,label])=>(
                <button key={m} onClick={()=>{setMode(m);setError("");}} style={{flex:1,padding:"8px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:12,fontWeight:700,background:mode===m?"linear-gradient(135deg,#0ea5e9,#6366f1)":"transparent",color:mode===m?"#fff":"#475569",transition:"all .2s"}}>
                  {label}
                </button>
              ))}
            </div>

            {/* Campos */}
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <label style={{display:"block",color:"#64748b",fontSize:11,fontFamily:"'Space Mono',monospace",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Correo electrónico</label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                  style={{width:"100%",background:"#1e293b",border:"1px solid #334155",borderRadius:10,padding:"12px 14px",color:"#e2e8f0",fontSize:14,outline:"none",fontFamily:"inherit",transition:"border .2s"}}
                />
              </div>
              <div>
                <label style={{display:"block",color:"#64748b",fontSize:11,fontFamily:"'Space Mono',monospace",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                  style={{width:"100%",background:"#1e293b",border:"1px solid #334155",borderRadius:10,padding:"12px 14px",color:"#e2e8f0",fontSize:14,outline:"none",fontFamily:"inherit",transition:"border .2s"}}
                />
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
