import { useState } from "react";
import { supabase } from "./supabase";

export default function OrgSetup({ onComplete }) {
  const [mode, setMode]     = useState("crear"); // "crear" | "unirse"
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const generarCodigo = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCrear = async () => {
    if (!nombre) return setError("Escribe el nombre de tu organización.");
    setLoading(true);
    setError("");
    const code = generarCodigo();
    const { data: org, error: orgError } = await supabase
      .from('organizaciones')
      .insert([{ nombre, codigo: code }])
      .select()
      .single();

    if (orgError) { setError("Error al crear organización."); setLoading(false); return; }

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('miembros').insert([{ user_id: user.id, org_id: org.id, rol: 'admin' }]);
    onComplete(org);
    setLoading(false);
  };

  const handleUnirse = async () => {
    if (!codigo) return setError("Escribe el código de la organización.");
    setLoading(true);
    setError("");
    const { data: org, error: orgError } = await supabase
      .from('organizaciones')
      .select('*')
      .eq('codigo', codigo.toUpperCase())
      .single();

    if (orgError || !org) { setError("Código incorrecto. Verifica con tu administrador."); setLoading(false); return; }

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('miembros').insert([{ user_id: user.id, org_id: org.id, rol: 'miembro' }]);
    onComplete(org);
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060d1a; }
      `}</style>

      <div style={{minHeight:"100vh",background:"#060d1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:20}}>
        <div style={{width:"100%",maxWidth:440}}>

          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:16,boxShadow:"0 8px 24px rgba(14,165,233,0.3)"}}>🏢</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>Configurar Organización</div>
            <div style={{color:"#475569",fontSize:13}}>Crea tu equipo o únete a uno existente</div>
          </div>

          <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:20,padding:32,boxShadow:"0 25px 60px rgba(0,0,0,0.5)"}}>

            {/* Tabs */}
            <div style={{display:"flex",gap:4,marginBottom:28,background:"#1e293b",borderRadius:10,padding:4}}>
              {[["crear","Crear organización"],["unirse","Unirse a una"]].map(([m,label])=>(
                <button key={m} onClick={()=>{setMode(m);setError("");}} style={{flex:1,padding:"8px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:11,fontWeight:700,background:mode===m?"linear-gradient(135deg,#0ea5e9,#6366f1)":"transparent",color:mode===m?"#fff":"#475569",transition:"all .2s"}}>
                  {label}
                </button>
              ))}
            </div>

            {mode === "crear" ? (
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                <div>
                  <label style={{display:"block",color:"#64748b",fontSize:11,fontFamily:"'Space Mono',monospace",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Nombre de la organización</label>
                  <input
                    placeholder="Ej: Aguas de Cartagena"
                    value={nombre}
                    onChange={e=>setNombre(e.target.value)}
                    style={{width:"100%",background:"#1e293b",border:"1px solid #334155",borderRadius:10,padding:"12px 14px",color:"#e2e8f0",fontSize:14,outline:"none",fontFamily:"inherit"}}
                  />
                </div>
                <div style={{background:"rgba(14,165,233,0.08)",border:"1px solid rgba(14,165,233,0.2)",borderRadius:10,padding:"12px 14px",color:"#64748b",fontSize:12,fontFamily:"'Space Mono',monospace"}}>
                  💡 Se generará un código único para que otros se unan a tu organización.
                </div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                <div>
                  <label style={{display:"block",color:"#64748b",fontSize:11,fontFamily:"'Space Mono',monospace",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Código de organización</label>
                  <input
                    placeholder="Ej: ABC123"
                    value={codigo}
                    onChange={e=>setCodigo(e.target.value)}
                    style={{width:"100%",background:"#1e293b",border:"1px solid #334155",borderRadius:10,padding:"12px 14px",color:"#e2e8f0",fontSize:14,outline:"none",fontFamily:"inherit",textTransform:"uppercase",letterSpacing:4,fontFamily:"'Space Mono',monospace"}}
                  />
                </div>
                <div style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"12px 14px",color:"#64748b",fontSize:12,fontFamily:"'Space Mono',monospace"}}>
                  💡 Pide el código al administrador de tu organización.
                </div>
              </div>
            )}

            {error && (
              <div style={{marginTop:16,padding:"10px 14px",borderRadius:8,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#f87171",fontSize:13,fontFamily:"'Space Mono',monospace"}}>
                {error}
              </div>
            )}

            <button
              onClick={mode==="crear" ? handleCrear : handleUnirse}
              disabled={loading}
              style={{width:"100%",marginTop:20,padding:"13px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:14,fontWeight:700,opacity:loading?0.7:1}}>
              {loading ? "Cargando..." : mode==="crear" ? "Crear organización" : "Unirse"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
