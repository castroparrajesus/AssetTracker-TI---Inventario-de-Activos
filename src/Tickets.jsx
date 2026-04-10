import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const ESTADOS_TICKET = ["Abierto", "En progreso", "Resuelto", "Cerrado"];
const PRIORIDADES = ["Baja", "Media", "Alta", "Critica"];

const prioColor = {
  "Baja":    { bg:"rgba(148,163,184,0.15)", text:"#94a3b8" },
  "Media":   { bg:"rgba(251,191,36,0.15)",  text:"#fbbf24" },
  "Alta":    { bg:"rgba(249,115,22,0.15)",  text:"#f97316" },
  "Critica": { bg:"rgba(239,68,68,0.15)",   text:"#ef4444" },
};

const estadoColor = {
  "Abierto":     { bg:"rgba(14,165,233,0.15)",  text:"#0ea5e9" },
  "En progreso": { bg:"rgba(99,102,241,0.15)",  text:"#818cf8" },
  "Resuelto":    { bg:"rgba(34,197,94,0.15)",   text:"#22c55e" },
  "Cerrado":     { bg:"rgba(148,163,184,0.15)", text:"#94a3b8" },
};

const inputStyle = {
  width:"100%",
  background:"#1e293b",
  border:"1px solid #334155",
  borderRadius:8,
  padding:"10px 12px",
  color:"#e2e8f0",
  fontSize:14,
  outline:"none",
  boxSizing:"border-box",
  fontFamily:"inherit"
};

const labelStyle = {
  display:"block",
  color:"#64748b",
  fontSize:11,
  fontFamily:"'Space Mono',monospace",
  marginBottom:6,
  textTransform:"uppercase",
  letterSpacing:1
};

function TicketForm({ ticket, activos, perfil, onClose, onSave }) {
  const esViewer = perfil && perfil.rol === "viewer";
  const [titulo, setTitulo] = useState(ticket ? ticket.titulo : "");
  const [descripcion, setDescripcion] = useState(ticket ? ticket.descripcion : "");
  const [prioridad, setPrioridad] = useState(ticket ? ticket.prioridad : "Media");
  const [estado, setEstado] = useState(ticket ? ticket.estado : "Abierto");
  const [activoId, setActivoId] = useState(ticket ? ticket.activo_id : "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!titulo) return;
    setLoading(true);
    await onSave({ titulo, descripcion, prioridad, estado: esViewer ? "Abierto" : estado, activo_id: activoId, id: ticket ? ticket.id : null });
    setLoading(false);
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#0f172a",border:"1px solid #1e3a5f",borderRadius:16,padding:32,width:"min(560px,95vw)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{color:"#e2e8f0",fontFamily:"'Space Mono',monospace",fontSize:17,margin:0}}>
            {ticket ? "Editar Ticket" : esViewer ? "Reportar Problema" : "Nuevo Ticket"}
          </h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:20}}>x</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={labelStyle}>Titulo</label>
            <input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Descripcion breve del problema" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Descripcion</label>
            <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} rows={4} placeholder="Detalla el problema..." style={{...inputStyle, resize:"vertical"}} />
          </div>
          <div>
            <label style={labelStyle}>Prioridad</label>
            <select value={prioridad} onChange={e=>setPrioridad(e.target.value)} style={{...inputStyle, cursor:"pointer"}}>
              {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {!esViewer && (
            <div>
              <label style={labelStyle}>Estado</label>
              <select value={estado} onChange={e=>setEstado(e.target.value)} style={{...inputStyle, cursor:"pointer"}}>
                {ESTADOS_TICKET.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={labelStyle}>Activo relacionado</label>
            <select value={activoId} onChange={e=>setActivoId(e.target.value)} style={{...inputStyle, cursor:"pointer"}}>
              <option value="">Sin activo relacionado</option>
              {activos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:"flex",gap:12,marginTop:24,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"10px 20px",background:"transparent",border:"1px solid #334155",borderRadius:8,color:"#94a3b8",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:13}}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={loading} style={{padding:"10px 24px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,opacity:loading?0.7:1}}>
            {loading ? "Guardando..." : ticket ? "Guardar" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TicketDetalle({ ticket, activos, session, perfil, onClose, onUpdate }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [loading, setLoading] = useState(false);

  const rol = perfil && perfil.rol ? perfil.rol : "viewer";
  const esTecnico = rol === "tecnico" || rol === "admin";
  const activoRelacionado = activos.find(a => String(a.id) === String(ticket.activo_id));

  useEffect(() => {
    cargarComentarios();
  }, []);

  async function cargarComentarios() {
    const res = await supabase.from("comentarios_ticket").select("*").eq("ticket_id", ticket.id).order("created_at");
    if (res.data) setComentarios(res.data);
  }

  async function enviarComentario() {
    if (!nuevoComentario.trim()) return;
    setLoading(true);
    await supabase.from("comentarios_ticket").insert([{
      ticket_id: ticket.id,
      user_id: session.user.id,
      contenido: nuevoComentario
    }]);
    setNuevoComentario("");
    await cargarComentarios();
    setLoading(false);
  }

  async function cambiarEstado(nuevoEstado) {
    await supabase.from("tickets").update({ estado: nuevoEstado, updated_at: new Date().toISOString() }).eq("id", ticket.id);
    onUpdate();
    onClose();
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#0f172a",border:"1px solid #1e3a5f",borderRadius:16,padding:32,width:"min(600px,95vw)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
              <span style={{padding:"3px 10px",borderRadius:20,background:estadoColor[ticket.estado] ? estadoColor[ticket.estado].bg : "#1e293b",color:estadoColor[ticket.estado] ? estadoColor[ticket.estado].text : "#94a3b8",fontSize:11,fontFamily:"'Space Mono',monospace"}}>
                {ticket.estado}
              </span>
              <span style={{padding:"3px 10px",borderRadius:20,background:prioColor[ticket.prioridad] ? prioColor[ticket.prioridad].bg : "#1e293b",color:prioColor[ticket.prioridad] ? prioColor[ticket.prioridad].text : "#94a3b8",fontSize:11,fontFamily:"'Space Mono',monospace"}}>
                {ticket.prioridad}
              </span>
            </div>
            <div style={{color:"#e2e8f0",fontFamily:"'Space Mono',monospace",fontSize:16,fontWeight:700}}>{ticket.titulo}</div>
            <div style={{color:"#475569",fontSize:12,marginTop:4}}>{new Date(ticket.created_at).toLocaleDateString("es-CO")}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:20,marginLeft:12}}>x</button>
        </div>

        {ticket.descripcion && (
          <div style={{background:"#1e293b",borderRadius:10,padding:"12px 14px",marginBottom:16,color:"#94a3b8",fontSize:14,lineHeight:1.6}}>
            {ticket.descripcion}
          </div>
        )}

        {activoRelacionado && (
          <div style={{background:"rgba(14,165,233,0.08)",border:"1px solid rgba(14,165,233,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,color:"#0ea5e9",fontSize:13,fontFamily:"'Space Mono',monospace"}}>
            Activo: {activoRelacionado.nombre}
          </div>
        )}

        {esTecnico && (
          <div style={{marginBottom:20}}>
            <div style={{color:"#475569",fontSize:11,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Cambiar estado</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {ESTADOS_TICKET.map(e => (
                <button key={e} onClick={() => cambiarEstado(e)} style={{padding:"6px 12px",borderRadius:8,border:"1px solid " + (ticket.estado === e ? "rgba(14,165,233,0.5)" : "#334155"),background:ticket.estado === e ? "rgba(14,165,233,0.1)" : "transparent",color:ticket.estado === e ? "#0ea5e9" : "#64748b",cursor:"pointer",fontSize:12,fontFamily:"'Space Mono',monospace"}}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {!esTecnico && (
          <div style={{marginBottom:16,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"10px 14px",color:"#818cf8",fontSize:12,fontFamily:"'Space Mono',monospace"}}>
            Un tecnico atendara tu ticket pronto
          </div>
        )}

        <div>
          <div style={{color:"#475569",fontSize:11,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>
            Comentarios ({comentarios.length})
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16,maxHeight:180,overflowY:"auto"}}>
            {comentarios.length === 0 && (
              <div style={{color:"#334155",fontSize:13,textAlign:"center",padding:"12px 0",fontFamily:"'Space Mono',monospace"}}>Sin comentarios</div>
            )}
            {comentarios.map(c => (
              <div key={c.id} style={{background:"#1e293b",borderRadius:8,padding:"10px 14px"}}>
                <div style={{color:"#475569",fontSize:11,fontFamily:"'Space Mono',monospace",marginBottom:4}}>
                  {c.user_id === session.user.id ? "Tu" : "Usuario"} - {new Date(c.created_at).toLocaleDateString("es-CO")}
                </div>
                <div style={{color:"#cbd5e1",fontSize:13}}>{c.contenido}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <input value={nuevoComentario} onChange={e=>setNuevoComentario(e.target.value)} onKeyDown={e=>e.key==="Enter"&&enviarComentario()} placeholder="Escribe un comentario..." style={{...inputStyle,flex:1}} />
            <button onClick={enviarComentario} disabled={loading} style={{padding:"10px 16px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,opacity:loading?0.7:1}}>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tickets({ session, perfil, activos }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [filtro, setFiltro] = useState("Todos");

  const rol = perfil && perfil.rol ? perfil.rol : "viewer";
  const esViewer = rol === "viewer";
  const esTecnico = rol === "tecnico" || rol === "admin";
  const esAdmin = rol === "admin";

  useEffect(() => { cargarTickets(); }, []);

  async function cargarTickets() {
    setLoading(true);
    const res = await supabase.from("tickets").select("*").order("created_at", { ascending: false });
    if (res.data) setTickets(res.data);
    setLoading(false);
  }

  async function handleSave(form) {
    if (form.id) {
      await supabase.from("tickets").update({ titulo: form.titulo, descripcion: form.descripcion, prioridad: form.prioridad, estado: form.estado, activo_id: form.activo_id || null, updated_at: new Date().toISOString() }).eq("id", form.id);
    } else {
      await supabase.from("tickets").insert([{
        titulo: form.titulo,
        descripcion: form.descripcion,
        prioridad: form.prioridad,
        estado: "Abierto",
        activo_id: form.activo_id || null,
        user_id: perfil && perfil.tipo === "personal" ? session.user.id : null,
        org_id: perfil && perfil.tipo === "org" ? perfil.org_id : null,
      }]);
    }
    await cargarTickets();
  }

  async function handleDelete(id) {
    await supabase.from("tickets").delete().eq("id", id);
    await cargarTickets();
  }

  const filtrados = filtro === "Todos" ? tickets : tickets.filter(t => t.estado === filtro);

  const stats = {
    total: tickets.length,
    abiertos: tickets.filter(t => t.estado === "Abierto").length,
    enProgreso: tickets.filter(t => t.estado === "En progreso").length,
    resueltos: tickets.filter(t => t.estado === "Resuelto").length,
    criticos: tickets.filter(t => t.prioridad === "Critica").length,
  };

  return (
    <div style={{width:"100%",padding:"28px 32px",boxSizing:"border-box"}}>

      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:26}}>
        {[
          {label:"Total",       value:stats.total,      color:"#0ea5e9"},
          {label:"Abiertos",    value:stats.abiertos,   color:"#0ea5e9"},
          {label:"En progreso", value:stats.enProgreso, color:"#818cf8"},
          {label:"Resueltos",   value:stats.resueltos,  color:"#22c55e"},
          {label:"Criticos",    value:stats.criticos,   color:"#ef4444"},
        ].map(function(item) {
          return (
            <div key={item.label} style={{background:"#0f172a",border:"1px solid " + item.color + "25",borderRadius:13,padding:"18px 20px"}}>
              <div style={{fontSize:10,color:"#475569",fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{item.label}</div>
              <div style={{fontSize:32,fontWeight:700,color:item.color,fontFamily:"'Space Mono',monospace"}}>{item.value}</div>
            </div>
          );
        })}
      </div>

      <div style={{display:"flex",gap:10,marginBottom:18,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:4,background:"#0f172a",borderRadius:10,padding:4,border:"1px solid #1e293b"}}>
          {["Todos", "Abierto", "En progreso", "Resuelto", "Cerrado"].map(e => (
            <button key={e} onClick={() => setFiltro(e)} style={{padding:"6px 14px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:11,fontWeight:700,background:filtro===e?"linear-gradient(135deg,#0ea5e9,#6366f1)":"transparent",color:filtro===e?"#fff":"#475569"}}>
              {e}
            </button>
          ))}
        </div>
        <div style={{flex:1}}></div>
        <button onClick={() => setModal("create")} style={{padding:"9px 18px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700}}>
          + {esViewer ? "Reportar problema" : "Nuevo Ticket"}
        </button>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {loading && (
          <div style={{textAlign:"center",padding:"40px",color:"#334155",fontFamily:"'Space Mono',monospace",fontSize:13}}>Cargando tickets...</div>
        )}
        {!loading && filtrados.length === 0 && (
          <div style={{textAlign:"center",padding:"48px",color:"#334155"}}>
            <div style={{fontSize:40,marginBottom:10}}>🎫</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:13}}>No hay tickets</div>
          </div>
        )}
        {filtrados.map(t => {
          const activo = activos.find(a => String(a.id) === String(t.activo_id));
          return (
            <div key={t.id} onClick={() => setDetail(t)} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:"16px 20px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{padding:"2px 8px",borderRadius:20,background:estadoColor[t.estado] ? estadoColor[t.estado].bg : "#1e293b",color:estadoColor[t.estado] ? estadoColor[t.estado].text : "#94a3b8",fontSize:10,fontFamily:"'Space Mono',monospace"}}>
                    {t.estado}
                  </span>
                  <span style={{padding:"2px 8px",borderRadius:20,background:prioColor[t.prioridad] ? prioColor[t.prioridad].bg : "#1e293b",color:prioColor[t.prioridad] ? prioColor[t.prioridad].text : "#94a3b8",fontSize:10,fontFamily:"'Space Mono',monospace"}}>
                    {t.prioridad}
                  </span>
                  {activo && <span style={{color:"#475569",fontSize:11,fontFamily:"'Space Mono',monospace"}}>{activo.nombre}</span>}
                </div>
                <div style={{color:"#e2e8f0",fontSize:14,fontWeight:500,marginBottom:4}}>{t.titulo}</div>
                {t.descripcion && <div style={{color:"#475569",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:400}}>{t.descripcion}</div>}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}} onClick={e => e.stopPropagation()}>
                <span style={{color:"#334155",fontSize:11,fontFamily:"'Space Mono',monospace",whiteSpace:"nowrap"}}>{new Date(t.created_at).toLocaleDateString("es-CO")}</span>
                {esTecnico && (
                  <button onClick={() => setModal(t)} style={{padding:"4px 8px",background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:6,color:"#818cf8",cursor:"pointer",fontSize:12}}>Editar</button>
                )}
                {esAdmin && (
                  <button onClick={() => handleDelete(t.id)} style={{padding:"4px 8px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:6,color:"#f87171",cursor:"pointer",fontSize:12}}>Borrar</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(modal === "create" || (modal && modal.id)) && (
        <TicketForm ticket={modal === "create" ? null : modal} activos={activos} perfil={perfil} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {detail && (
        <TicketDetalle ticket={detail} activos={activos} session={session} perfil={perfil} onClose={() => setDetail(null)} onUpdate={cargarTickets} />
      )}
    </div>
  );
}
