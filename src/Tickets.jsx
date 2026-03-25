import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const ESTADOS_TICKET  = ["Abierto", "En progreso", "Resuelto", "Cerrado"];
const PRIORIDADES     = ["Baja", "Media", "Alta", "Crítica"];

const prioColor = {
  "Baja":    { bg:"rgba(148,163,184,0.15)", text:"#94a3b8" },
  "Media":   { bg:"rgba(251,191,36,0.15)",  text:"#fbbf24" },
  "Alta":    { bg:"rgba(249,115,22,0.15)",  text:"#f97316" },
  "Crítica": { bg:"rgba(239,68,68,0.15)",   text:"#ef4444" },
};

const estadoColor = {
  "Abierto":     { bg:"rgba(14,165,233,0.15)",  text:"#0ea5e9"  },
  "En progreso": { bg:"rgba(99,102,241,0.15)",  text:"#818cf8"  },
  "Resuelto":    { bg:"rgba(34,197,94,0.15)",   text:"#22c55e"  },
  "Cerrado":     { bg:"rgba(148,163,184,0.15)", text:"#94a3b8"  },
};

const S = {
  label: { display:"block", color:"#64748b", fontSize:11, fontFamily:"'Space Mono',monospace", marginBottom:6, textTransform:"uppercase", letterSpacing:1 },
  input: { width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:8, padding:"10px 12px", color:"#e2e8f0", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
  select: { width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:8, padding:"10px 12px", color:"#e2e8f0", fontSize:14, outline:"none", cursor:"pointer" },
};

// ── MODAL CREAR/EDITAR TICKET ──────────────────────────────
function TicketModal({ ticket, activos, session, perfil, onClose, onSave }) {
  const [form, setForm] = useState(ticket || {
    titulo:"", descripcion:"", estado:"Abierto", prioridad:"Media", activo_id:""
  });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleSave = async () => {
    if (!form.titulo) return;
    setLoading(true);
    await onSave(form);
    setLoading(false);
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#0f172a",border:"1px solid #1e3a5f",borderRadius:16,padding:32,width:"min(580px,95vw)",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 25px 60px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{color:"#e2e8f0",fontFamily:"'Space Mono',monospace",fontSize:17,margin:0}}>{ticket?"✏️ Editar Ticket":"🎫 Nuevo Ticket"}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={S.label}>Título *</label>
            <input value={form.titulo} onChange={e=>set("titulo",e.target.value)} placeholder="Descripción breve del problema" style={S.input}/>
          </div>
          <div>
            <label style={S.label}>Descripción</label>
            <textarea value={form.descripcion} onChange={e=>set("descripcion",e.target.value)} rows={4} placeholder="Detalla el problema..." style={{...S.input,resize:"vertical"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <label style={S.label}>Prioridad</label>
              <select value={form.prioridad} onChange={e=>set("prioridad",e.target.value)} style={S.select}>
                {PRIORIDADES.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Estado</label>
              <select value={form.estado} onChange={e=>set("estado",e.target.value)} style={S.select}>
                {ESTADOS_TICKET.map(e=><option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={S.label}>Activo relacionado (opcional)</label>
            <select value={form.activo_id} onChange={e=>set("activo_id",e.target.value)} style={S.select}>
              <option value="">Sin activo relacionado</option>
              {activos.map(a=><option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:"flex",gap:12,marginTop:24,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"10px 20px",background:"transparent",border:"1px solid #334155",borderRadius:8,color:"#94a3b8",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:13}}>Cancelar</button>
          <button onClick={handleSave} disabled={loading} style={{padding:"10px 24px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,opacity:loading?0.7:1}}>
            {loading?"Guardando...":ticket?"Guardar":"Crear ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MODAL DETALLE TICKET + COMENTARIOS ────────────────────
function TicketDetail({ ticket, activos, session, onClose, onUpdate }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const activoRelacionado = activos.find(a => a.id === ticket.activo_id);

  useEffect(() => { cargarComentarios(); }, []);

  async function cargarComentarios() {
    const { data } = await supabase.from('comentarios_ticket').select('*').eq('ticket_id', ticket.id).order('created_at');
    setComentarios(data || []);
  }

  const enviarComentario = async () => {
    if (!nuevoComentario.trim()) return;
    setLoading(true);
    await supabase.from('comentarios_ticket').insert([{
      ticket_id: ticket.id,
      user_id: session.user.id,
      contenido: nuevoComentario
    }]);
    setNuevoComentario("");
    await cargarComentarios();
    setLoading(false);
  };

  const cambiarEstado = async (nuevoEstado) => {
    await supabase.from('tickets').update({ estado: nuevoEstado, updated_at: new Date().toISOString() }).eq('id', ticket.id);
    onUpdate();
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#0f172a",border:"1px solid #1e3a5f",borderRadius:16,padding:32,width:"min(620px,95vw)",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 25px 60px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
              <span style={{padding:"3px 10px",borderRadius:20,background:estadoColor[ticket.estado]?.bg,color:estadoColor[ticket.estado]?.text,fontSize:11,fontFamily:"'Space Mono',monospace"}}>{ticket.estado}</span>
              <span style={{padding:"3px 10px",borderRadius:20,background:prioColor[ticket.prioridad]?.bg,color:prioColor[ticket.prioridad]?.text,fontSize:11,fontFamily:"'Space Mono',monospace"}}>⚡ {ticket.prioridad}</span>
            </div>
            <div style={{color:"#e2e8f0",fontFamily:"'Space Mono',monospace",fontSize:16,fontWeight:700}}>{ticket.titulo}</div>
            <div style={{color:"#475569",fontSize:12,marginTop:4}}>{new Date(ticket.created_at).toLocaleDateString('es-CO')}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:20,marginLeft:12}}>✕</button>
        </div>

        {ticket.descripcion && (
          <div style={{background:"#1e293b",borderRadius:10,padding:"12px 14px",marginBottom:16,color:"#94a3b8",fontSize:14,lineHeight:1.6}}>
            {ticket.descripcion}
          </div>
        )}

        {activoRelacionado && (
          <div style={{background:"rgba(14,165,233,0.08)",border:"1px solid rgba(14,165,233,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,color:"#0ea5e9",fontSize:13,fontFamily:"'Space Mono',monospace"}}>
            🖥️ Activo: {activoRelacionado.nombre}
          </div>
        )}

        {/* Cambiar estado */}
        <div style={{marginBottom:20}}>
          <div style={{color:"#475569",fontSize:11,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Cambiar estado</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {ESTADOS_TICKET.map(e=>(
              <button key={e} onClick={()=>cambiarEstado(e)}
                style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${ticket.estado===e?"rgba(14,165,233,0.5)":"#334155"}`,background:ticket.estado===e?"rgba(14,165,233,0.1)":"transparent",color:ticket.estado===e?"#0ea5e9":"#64748b",cursor:"pointer",fontSize:12,fontFamily:"'Space Mono',monospace"}}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Comentarios */}
        <div>
          <div style={{color:"#475569",fontSize:11,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>
            Comentarios ({comentarios.length})
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16,maxHeight:200,overflowY:"auto"}}>
            {comentarios.length === 0 && (
              <div style={{color:"#334155",fontSize:13,fontFamily:"'Space Mono',monospace",textAlign:"center",padding:"16px 0"}}>Sin comentarios aún</div>
            )}
            {comentarios.map(c=>(
              <div key={c.id} style={{background:"#1e293b",borderRadius:8,padding:"10px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{color:"#475569",fontSize:11,fontFamily:"'Space Mono',monospace"}}>{c.user_id.substring(0,8)}...</span>
                  <span style={{color:"#334155",fontSize:11,fontFamily:"'Space Mono',monospace"}}>{new Date(c.created_at).toLocaleDateString('es-CO')}</span>
                </div>
                <div style={{color:"#cbd5e1",fontSize:13}}>{c.contenido}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <input value={nuevoComentario} onChange={e=>setNuevoComentario(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&enviarComentario()}
              placeholder="Escribe un comentario..." style={{...S.input,flex:1}}/>
            <button onClick={enviarComentario} disabled={loading}
              style={{padding:"10px 16px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,whiteSpace:"nowrap",opacity:loading?0.7:1}}>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PANEL PRINCIPAL DE TICKETS ─────────────────────────────
export default function Tickets({ session, perfil, activos }) {
  const [tickets, setTickets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [detail, setDetail]       = useState(null);
  const [filtroEstado, setFiltro] = useState("Todos");

  useEffect(() => { cargarTickets(); }, []);

  async function cargarTickets() {
    setLoading(true);
    const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  }

  const handleSave = async (form) => {
    if (form.id) {
      await supabase.from('tickets').update({ ...form, updated_at: new Date().toISOString() }).eq('id', form.id);
    } else {
      await supabase.from('tickets').insert([{
        ...form,
        activo_id: form.activo_id || null,
        user_id: perfil?.tipo === 'personal' ? session.user.id : null,
        org_id:  perfil?.tipo === 'org' ? perfil?.org_id : null,
      }]);
    }
    await cargarTickets();
  };

  const handleDelete = async (id) => {
    await supabase.from('tickets').delete().eq('id', id);
    await cargarTickets();
  };

  const filtrados = filtroEstado === "Todos" ? tickets : tickets.filter(t => t.estado === filtroEstado);

  const stats = {
    total:      tickets.length,
    abiertos:   tickets.filter(t=>t.estado==="Abierto").length,
    enProgreso: tickets.filter(t=>t.estado==="En progreso").length,
    resueltos:  tickets.filter(t=>t.estado==="Resuelto").length,
    criticos:   tickets.filter(t=>t.prioridad==="Crítica").length,
  };

  return (
    <div style={{width:"100%",padding:"28px 32px",boxSizing:"border-box"}}>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:26}}>
        {[
          {label:"Total",      value:stats.total,      color:"#0ea5e9", icon:"🎫"},
          {label:"Abiertos",   value:stats.abiertos,   color:"#0ea5e9", icon:"📬"},
          {label:"En progreso",value:stats.enProgreso, color:"#818cf8", icon:"⚙️"},
          {label:"Resueltos",  value:stats.resueltos,  color:"#22c55e", icon:"✅"},
          {label:"Críticos",   value:stats.criticos,   color:"#ef4444", icon:"🚨"},
        ].map(({label,value,color,icon})=>(
          <div key={label} style={{background:"#0f172a",border:`1px solid ${color}25`,borderRadius:13,padding:"18px 20px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-8,right:-8,fontSize:44,opacity:0.08}}>{icon}</div>
            <div style={{fontSize:10,color:"#475569",fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{label}</div>
            <div style={{fontSize:32,fontWeight:700,color,fontFamily:"'Space Mono',monospace"}}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filtros + botón nuevo */}
      <div style={{display:"flex",gap:10,marginBottom:18,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:4,background:"#0f172a",borderRadius:10,padding:4,border:"1px solid #1e293b"}}>
          {["Todos",...ESTADOS_TICKET].map(e=>(
            <button key={e} onClick={()=>setFiltro(e)} style={{padding:"6px 14px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:11,fontWeight:700,background:filtroEstado===e?"linear-gradient(135deg,#0ea5e9,#6366f1)":"transparent",color:filtroEstado===e?"#fff":"#475569"}}>
              {e}
            </button>
          ))}
        </div>
        <div style={{flex:1}}></div>
        <button onClick={()=>setModal("create")} style={{padding:"9px 18px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,boxShadow:"0 4px 15px rgba(14,165,233,0.3)"}}>
          + Nuevo Ticket
        </button>
      </div>

      {/* Lista de tickets */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {loading && (
          <div style={{textAlign:"center",padding:"40px",color:"#334155",fontFamily:"'Space Mono',monospace",fontSize:13}}>⏳ Cargando tickets...</div>
        )}
        {!loading && filtrados.length === 0 && (
          <div style={{textAlign:"center",padding:"48px",color:"#334155"}}>
            <div style={{fontSize:40,marginBottom:10}}>🎫</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:13}}>No hay tickets — ¡todo en orden!</div>
          </div>
        )}
        {filtrados.map(t => {
          const activo = activos.find(a => a.id === t.activo_id);
          return (
            <div key={t.id} onClick={()=>setDetail(t)}
              style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:"16px 20px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,transition:"border .15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#1e3a5f"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#1e293b"}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{padding:"2px 8px",borderRadius:20,background:estadoColor[t.estado]?.bg,color:estadoColor[t.estado]?.text,fontSize:10,fontFamily:"'Space Mono',monospace"}}>{t.estado}</span>
                  <span style={{padding:"2px 8px",borderRadius:20,background:prioColor[t.prioridad]?.bg,color:prioColor[t.prioridad]?.text,fontSize:10,fontFamily:"'Space Mono',monospace"}}>⚡ {t.prioridad}</span>
                  {activo && <span style={{color:"#475569",fontSize:11,fontFamily:"'Space Mono',monospace"}}>🖥️ {activo.nombre}</span>}
                </div>
                <div style={{color:"#e2e8f0",fontSize:14,fontWeight:500,marginBottom:4}}>{t.titulo}</div>
                {t.descripcion && <div style={{color:"#475569",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:400}}>{t.descripcion}</div>}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{color:"#334155",fontSize:11,fontFamily:"'Space Mono',monospace",whiteSpace:"nowrap"}}>{new Date(t.created_at).toLocaleDateString('es-CO')}</span>
                <button onClick={e=>{e.stopPropagation();setModal(t);}} style={{padding:"4px 8px",background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:6,color:"#818cf8",cursor:"pointer",fontSize:12}}>✏️</button>
                <button onClick={e=>{e.stopPropagation();handleDelete(t.id);}} style={{padding:"4px 8px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:6,color:"#f87171",cursor:"pointer",fontSize:12}}>🗑️</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {(modal==="create"||(modal&&modal.id)) && (
        <TicketModal ticket={modal==="create"?null:modal} activos={activos} session={session} perfil={perfil} onClose={()=>setModal(null)} onSave={handleSave}/>
      )}
      {detail && (
        <TicketDetail ticket={detail} activos={activos} session={session} onClose={()=>setDetail(null)} onUpdate={cargarTickets}/>
      )}
    </div>
  );
}
