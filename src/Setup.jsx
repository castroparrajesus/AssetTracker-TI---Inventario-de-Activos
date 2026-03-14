import { useState } from "react";
import { supabase } from "./supabase";

export default function Setup({ onComplete }) {
  const [paso, setPaso]       = useState(1); // 1=elegir tipo, 2=org setup
  const [tipo, setTipo]       = useState("");
  const [modo, setModo]       = useState("crear"); // "crear" | "unirse"
  const [nombre, setNombre]   = useState("");
  const [codigo, setCodigo]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handlePersonal = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('perfiles').insert([{ id: user.id, tipo: 'personal' }]);
    onComplete({ tipo: 'personal', org: null });
    setLoading(false);
  };

  const handleOrg = async () => {
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();

    if (modo === "crear") {
      if (!nombre) { setError("Escribe el nombre de tu organización."); setLoading(false); return; }
      const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: org, error: orgError } = await supabase
        .from('organizaciones').insert([{ nombre, codigo }]).select().single();
      if (orgError) { setError("Error al crear organización."); setLoading(false); return; }
      await supabase.from('miembros').insert([{ user_id: user.id, org_id: org.id, rol: 'admin' }]);
      await supabase.from('perfiles').insert([{ id: user.id, tipo: 'org', org_id: org.id }]);
      alert(`✅ Organización creada!\n\nCódigo para invitar a tu equipo:\n\n${org.codigo}\n\nGuárdalo bien.`);
      onComplete({ tipo: 'org', org });
    } else {
      if (!codigo) { setError("Escribe el código de la organización."); setLoading(false); return; }
      const { data: org, error: orgError } = await supabase
        .from('organizaciones').select('*').eq('codigo', codigo.toUpperCase()).single();
      if (orgError || !org) { setError("Código incorrecto."); setLoading(false); return; }
      await supabase.from('miembros').insert([{ user_id: user.id, org_id: org.id, rol: 'miembro' }]);
      await supabase.from('perfiles').insert([{ id: user.id, tipo: 'org', org_id: org.id }]);
      onComplete({ tipo: 'org', org });
    }
    setLoading(false);
  };

  const inputStyle = { width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:10, padding:"12px 14px", color:"#e2e8f0", fontSize:14, outline:"none", fontFamily:"inherit" };
  const labelStyle = { display:"block", color:"#64748b", fontSize:11, fontFamily:"'Space Mono',monospace", marginBottom:6, textTransform:"uppercase", letterSpacing:1 };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060d1a; }
      `}</style>

      <div style={{minHeight:"100vh",background:"#060d1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:20}}>
        <div style={{width:"100%",maxWidth:480}}>

          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:16,boxShadow:"0 8px 24px rgba(14,165,233,0.3)"}}>🗄️</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>AssetTracker TI</div>
            <div style={{color:"#475569",fontSize:13}}>¿Cómo quieres usar la plataforma?</div>
          </div>

          {paso === 1 && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {/* Personal */}
              <div onClick={()=>{setTipo("personal"); handlePersonal();}}
                style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,padding:28,cursor:"pointer",textAlign:"center",transition:"all .2s",':hover':{borderColor:"#0ea5e9"}}}>
                <div style={{fontSize:40,marginBottom:12}}>👤</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:8}}>Uso Personal</div>
                <div style={{color:"#64748b",fontSize:12,lineHeight:1.5}}>Solo tú puedes ver y gestionar tus activos</div>
                <div style={{marginTop:16,padding:"8px 16px",background:"rgba(14,165,233,0.1)",border:"1px solid rgba(14,165,233,0.2)",borderRadius:8,color:"#0ea5e9",fontSize:11,fontFamily:"'Space Mono',monospace"}}>
                  {loading && tipo==="personal" ? "Cargando..." : "Seleccionar →"}
                </div>
              </div>

              {/* Organización */}
              <div onClick={()=>setPaso(2)}
                style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,padding:28,cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
                <div style={{fontSize:40,marginBottom:12}}>🏢</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:8}}>Organización</div>
                <div style={{color:"#64748b",fontSize:12,lineHeight:1.5}}>Comparte el inventario con tu equipo de trabajo</div>
                <div style={{marginTop:16,padding:"8px 16px",background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,color:"#818cf8",fontSize:11,fontFamily:"'Space Mono',monospace"}}>
                  Seleccionar →
                </div>
              </div>
            </div>
          )}

          {paso === 2 && (
            <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:20,padding:32,boxShadow:"0 25px 60px rgba(0,0,0,0.5)"}}>
              <button onClick={()=>setPaso(1)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:12,marginBottom:20}}>← Volver</button>

              <div style={{display:"flex",gap:4,marginBottom:24,background:"#1e293b",borderRadius:10,padding:4}}>
                {[["crear","Crear organización"],["unirse","Unirse a una"]].map(([m,label])=>(
                  <button key={m} onClick={()=>{setModo(m);setError("");}} style={{flex:1,padding:"8px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:11,fontWeight:700,background:modo===m?"linear-gradient(135deg,#0ea5e9,#6366f1)":"transparent",color:modo===m?"#fff":"#475569",transition:"all .2s"}}>
                    {label}
                  </button>
                ))}
              </div>

              {modo === "crear" ? (
                <div>
                  <label style={labelStyle}>Nombre de la organización</label>
                  <input placeholder="Ej: Aguas de Cartagena" value={nombre} onChange={e=>setNombre(e.target.value)} style={inputStyle}/>
                  <div style={{marginTop:12,background:"rgba(14,165,233,0.08)",border:"1px solid rgba(14,165,233,0.15)",borderRadius:8,padding:"10px 12px",color:"#475569",fontSize:12,fontFamily:"'Space Mono',monospace"}}>
                    💡 Se generará un código para que otros se unan
                  </div>
                </div>
              ) : (
                <div>
                  <label style={labelStyle}>Código de organización</label>
                  <input placeholder="Ej: ABC123" value={codigo} onChange={e=>setCodigo(e.target.value)} style={{...inputStyle,textTransform:"uppercase",letterSpacing:4,fontFamily:"'Space Mono',monospace"}}/>
                  <div style={{marginTop:12,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:8,padding:"10px 12px",color:"#475569",fontSize:12,fontFamily:"'Space Mono',monospace"}}>
                    💡 Pide el código al administrador de tu org
                  </div>
                </div>
              )}

              {error && (
                <div style={{marginTop:12,padding:"10px 14px",borderRadius:8,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#f87171",fontSize:13,fontFamily:"'Space Mono',monospace"}}>
                  {error}
                </div>
              )}

              <button onClick={handleOrg} disabled={loading}
                style={{width:"100%",marginTop:20,padding:"13px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:14,fontWeight:700,opacity:loading?0.7:1}}>
                {loading ? "Cargando..." : modo==="crear" ? "Crear organización" : "Unirse"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
