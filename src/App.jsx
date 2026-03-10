import { useState, useMemo, useEffect } from "react";
import { supabase } from "./supabase";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const TIPOS   = ["Laptop","Desktop","Servidor","Switch","Router","Impresora","Monitor","UPS","Teléfono IP","Otro"];
const ESTADOS = ["Activo","En mantenimiento","Dado de baja","En bodega"];
const AREAS   = ["TI","Gerencia","RRHH","Contabilidad","Operaciones","Seguridad","Infraestructura"];

const PIE_COLORS = ["#22c55e","#fbbf24","#ef4444","#94a3b8"];
const BAR_COLORS = ["#0ea5e9","#6366f1","#f59e0b","#10b981","#f43f5e","#a78bfa","#34d399","#fb923c","#38bdf8","#e879f9"];

const estadoColor = {
  "Activo":           { bg:"rgba(34,197,94,0.15)",  text:"#22c55e", dot:"#22c55e" },
  "En mantenimiento": { bg:"rgba(251,191,36,0.15)",  text:"#fbbf24", dot:"#fbbf24" },
  "Dado de baja":     { bg:"rgba(239,68,68,0.15)",   text:"#ef4444", dot:"#ef4444" },
  "En bodega":        { bg:"rgba(148,163,184,0.15)", text:"#94a3b8", dot:"#94a3b8" },
};

const tipoIcon = {
  Laptop:"💻", Desktop:"🖥️", Servidor:"🗄️", Switch:"🔀",
  Router:"📡", Impresora:"🖨️", Monitor:"🖵", UPS:"🔋",
  "Teléfono IP":"☎️", Otro:"📦"
};

function diasDesdeMantenimiento(fecha) {
  return Math.floor((new Date() - new Date(fecha)) / 86400000);
}

const S = {
  select: { background:"#1e293b", border:"1px solid #334155", borderRadius:8, padding:"8px 12px", color:"#94a3b8", fontSize:13, outline:"none", cursor:"pointer", fontFamily:"'Space Mono',monospace" },
  label:  { display:"block", color:"#64748b", fontSize:11, fontFamily:"'Space Mono',monospace", marginBottom:6, textTransform:"uppercase", letterSpacing:1 },
  input:  { width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:8, padding:"10px 12px", color:"#e2e8f0", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
};

function FormModal({ asset, onClose, onSave }) {
  const [form, setForm] = useState(asset || {
    nombre:"", tipo:"Laptop", serial:"", marca:"", modelo:"",
    area:"TI", responsable:"", estado:"Activo",
    fecha_ingreso: new Date().toISOString().split("T")[0],
    ultimo_mantenimiento: new Date().toISOString().split("T")[0],
    ip:"", so:"", notas:"", historial:[]
  });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleSave = async () => {
    if (!form.nombre) return;
    setLoading(true);
    await onSave(form);
    setLoading(false);
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#0f172a",border:"1px solid #1e3a5f",borderRadius:16,padding:32,width:"min(640px,95vw)",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 25px 60px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{color:"#e2e8f0",fontFamily:"'Space Mono',monospace",fontSize:17,margin:0}}>{asset?"✏️ Editar Activo":"➕ Nuevo Activo"}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {[
            {label:"Nombre *",key:"nombre",full:true},
            {label:"Serial / Código",key:"serial"},
            {label:"Marca",key:"marca"},
            {label:"Modelo",key:"modelo"},
            {label:"Responsable",key:"responsable"},
            {label:"Dirección IP",key:"ip"},
            {label:"Sistema Operativo",key:"so"},
            {label:"Fecha de Ingreso",key:"fecha_ingreso",type:"date"},
            {label:"Último Mantenimiento",key:"ultimo_mantenimiento",type:"date"},
          ].map(({label,key,full,type="text"}) => (
            <div key={key} style={{gridColumn:full?"1/-1":"auto"}}>
              <label style={S.label}>{label}</label>
              <input type={type} value={form[key]||""} onChange={e=>set(key,e.target.value)} style={S.input}/>
            </div>
          ))}
          {[{label:"Tipo",key:"tipo",opts:TIPOS},{label:"Área",key:"area",opts:AREAS},{label:"Estado",key:"estado",opts:ESTADOS}].map(({label,key,opts})=>(
            <div key={key}>
              <label style={S.label}>{label}</label>
              <select value={form[key]} onChange={e=>set(key,e.target.value)} style={{...S.select,width:"100%"}}>
                {opts.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={{gridColumn:"1/-1"}}>
            <label style={S.label}>Notas</label>
            <textarea value={form.notas} onChange={e=>set("notas",e.target.value)} rows={3} style={{...S.input,resize:"vertical"}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:12,marginTop:24,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"10px 20px",background:"transparent",border:"1px solid #334155",borderRadius:8,color:"#94a3b8",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:13}}>Cancelar</button>
          <button onClick={handleSave} disabled={loading} style={{padding:"10px 24px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,opacity:loading?0.7:1}}>
            {loading ? "Guardando..." : asset ? "Guardar cambios" : "Crear activo"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ asset, onClose }) {
  const dias = diasDesdeMantenimiento(asset.ultimo_mantenimiento);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#0f172a",border:"1px solid #1e3a5f",borderRadius:16,padding:32,width:"min(580px,95vw)",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 25px 60px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:32}}>{tipoIcon[asset.tipo]}</span>
            <div>
              <div style={{color:"#e2e8f0",fontFamily:"'Space Mono',monospace",fontSize:16,fontWeight:700}}>{asset.nombre}</div>
              <code style={{color:"#0ea5e9",fontSize:12}}>{asset.serial}</code>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        {dias > 180 && (
          <div style={{background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:16,color:"#fbbf24",fontSize:13,fontFamily:"'Space Mono',monospace"}}>
            ⚠️ Sin mantenimiento hace {dias} días
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["Tipo",asset.tipo],["Área",asset.area],["Marca",asset.marca],["Modelo",asset.modelo],
            ["Responsable",asset.responsable],["IP",asset.ip],["SO",asset.so],
            ["Ingreso",asset.fecha_ingreso],["Últ. Mantenimiento",asset.ultimo_mantenimiento]].map(([k,v])=>(
            <div key={k} style={{background:"#1e293b",borderRadius:10,padding:"10px 14px"}}>
              <div style={{color:"#475569",fontSize:10,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{k}</div>
              <div style={{color:"#cbd5e1",fontSize:13}}>{v||"—"}</div>
            </div>
          ))}
        </div>
        {asset.notas && (
          <div style={{marginTop:10,background:"#1e293b",borderRadius:10,padding:"10px 14px"}}>
            <div style={{color:"#475569",fontSize:10,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Notas</div>
            <div style={{color:"#cbd5e1",fontSize:13}}>{asset.notas}</div>
          </div>
        )}
        {asset.historial && asset.historial.length > 0 && (
          <div style={{marginTop:16}}>
            <div style={{color:"#475569",fontSize:11,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Historial de cambios</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {asset.historial.slice().reverse().map((h,i)=>(
                <div key={i} style={{background:"#1e293b",borderRadius:8,padding:"8px 12px",display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{color:"#334155",fontSize:11,fontFamily:"'Space Mono',monospace",whiteSpace:"nowrap",paddingTop:1}}>{h.fecha}</div>
                  <div style={{color:"#94a3b8",fontSize:13}}>{h.evento}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{marginTop:16,display:"flex",justifyContent:"center"}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 16px",borderRadius:20,background:estadoColor[asset.estado].bg,color:estadoColor[asset.estado].text,fontFamily:"'Space Mono',monospace",fontSize:12}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:estadoColor[asset.estado].dot}}></span>
            {asset.estado}
          </span>
        </div>
      </div>
    </div>
  );
}

function ChartsPanel({ assets }) {
  const byEstado = ESTADOS.map(e => ({ name:e, value: assets.filter(a=>a.estado===e).length })).filter(d=>d.value>0);
  const byTipo   = Object.entries(assets.reduce((acc,a)=>({...acc,[a.tipo]:(acc[a.tipo]||0)+1}),{})).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  const byArea   = Object.entries(assets.reduce((acc,a)=>({...acc,[a.area]:(acc[a.area]||0)+1}),{})).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  const cardStyle = { background:"#0f172a", border:"1px solid #1e293b", borderRadius:14, padding:"20px 16px" };
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:28}}>
      <div style={cardStyle}>
        <div style={{color:"#64748b",fontSize:11,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Por Estado</div>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={byEstado} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
              {byEstado.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
            </Pie>
            <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#e2e8f0",fontSize:12}}/>
            <Legend wrapperStyle={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"#64748b"}}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={cardStyle}>
        <div style={{color:"#64748b",fontSize:11,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Por Tipo</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={byTipo} layout="vertical" margin={{left:0,right:16}}>
            <XAxis type="number" hide/>
            <YAxis type="category" dataKey="name" tick={{fill:"#64748b",fontSize:10,fontFamily:"monospace"}} width={72}/>
            <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#e2e8f0",fontSize:12}}/>
            <Bar dataKey="value" radius={[0,4,4,0]}>
              {byTipo.map((_,i)=><Cell key={i} fill={BAR_COLORS[i%BAR_COLORS.length]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={cardStyle}>
        <div style={{color:"#64748b",fontSize:11,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Por Área</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={byArea} layout="vertical" margin={{left:0,right:16}}>
            <XAxis type="number" hide/>
            <YAxis type="category" dataKey="name" tick={{fill:"#64748b",fontSize:10,fontFamily:"monospace"}} width={90}/>
            <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#e2e8f0",fontSize:12}}/>
            <Bar dataKey="value" radius={[0,4,4,0]}>
              {byArea.map((_,i)=><Cell key={i} fill={BAR_COLORS[(i+4)%BAR_COLORS.length]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function exportExcel(assets) {
  import('xlsx').then(XLSX => {
    const ws = XLSX.utils.json_to_sheet(assets.map(a => ({
      Nombre: a.nombre, Tipo: a.tipo, Serial: a.serial,
      Marca: a.marca, Modelo: a.modelo, Area: a.area,
      Responsable: a.responsable, Estado: a.estado,
      IP: a.ip, SO: a.so, Ingreso: a.fecha_ingreso,
      "Últ. Mantenimiento": a.ultimo_mantenimiento, Notas: a.notas
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Inventario")
    XLSX.writeFile(wb, `inventario_ti_${new Date().toISOString().split('T')[0]}.xlsx`)
  })
}

function exportPDF(assets) {
  Promise.all([import('jspdf'), import('jspdf-autotable')]).then(([{ default: jsPDF }, { default: autoTable }]) => {
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(14)
    doc.text('Inventario de Activos TI', 14, 14)
    doc.setFontSize(9)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 22)
    autoTable(doc, {
      startY: 28,
      head: [['Nombre','Tipo','Serial','Área','Responsable','IP','Estado','Últ. Mant.']],
      body: assets.map(a => [a.nombre,a.tipo,a.serial,a.area,a.responsable,a.ip,a.estado,a.ultimo_mantenimiento]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [14,165,233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240,248,255] }
    })
    doc.save(`inventario_ti_${new Date().toISOString().split('T')[0]}.pdf`)
  })
}

export default function InventarioTI({ session }) {
  const [assets,  setAssets]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filterT, setFilterT] = useState("Todos");
  const [filterE, setFilterE] = useState("Todos");
  const [filterA, setFilterA] = useState("Todas");
  const [modal,   setModal]   = useState(null);
  const [detail,  setDetail]  = useState(null);
  const [delId,   setDelId]   = useState(null);
  const [tab,     setTab]     = useState("tabla");

  useEffect(() => { cargarActivos(); }, []);

  async function cargarActivos() {
    setLoading(true);
    const { data, error } = await supabase.from('activos').select('*').order('created_at', { ascending: false });
    if (!error) setAssets(data || []);
    setLoading(false);
  }

  const filtered = useMemo(() => assets.filter(a => {
    const q = search.toLowerCase();
    return (!q || [a.nombre,a.serial,a.responsable,a.ip].some(f=>(f||"").toLowerCase().includes(q)))
      && (filterT==="Todos" || a.tipo===filterT)
      && (filterE==="Todos" || a.estado===filterE)
      && (filterA==="Todas" || a.area===filterA);
  }), [assets, search, filterT, filterE, filterA]);

  const stats = useMemo(() => ({
    total:   assets.length,
    activos: assets.filter(a=>a.estado==="Activo").length,
    mant:    assets.filter(a=>a.estado==="En mantenimiento").length,
    baja:    assets.filter(a=>a.estado==="Dado de baja").length,
    alertas: assets.filter(a=>diasDesdeMantenimiento(a.ultimo_mantenimiento)>180 && a.estado==="Activo").length,
  }), [assets]);

  const handleSave = async (form) => {
    const ahora = new Date().toLocaleDateString("es-CO");
    if (form.id) {
      const historial = [...(form.historial||[]), { fecha:ahora, evento:`Editado: estado=${form.estado}, área=${form.area}` }];
      await supabase.from('activos').update({ ...form, historial }).eq('id', form.id);
    } else {
      const historial = [{ fecha:ahora, evento:"Activo creado" }];
      await supabase.from('activos').insert([{ ...form, historial }]);
    }
    await cargarActivos();
  };

  const handleDelete = async (id) => {
    await supabase.from('activos').delete().eq('id', id);
    setDelId(null);
    await cargarActivos();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;} body{margin:0;background:#060d1a;}
        ::-webkit-scrollbar{width:5px;height:5px;} ::-webkit-scrollbar-track{background:#0f172a;} ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px;}
        .row-hover{transition:background .15s;} .row-hover:hover{background:rgba(14,165,233,0.05)!important;}
        .act-btn{opacity:0;transition:opacity .15s;} .row-hover:hover .act-btn{opacity:1;}
        .stat-card{transition:transform .2s,box-shadow .2s;} .stat-card:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,0,0,0.4);}
        .tab-btn{transition:all .2s;} .exp-btn{transition:background .15s;} .exp-btn:hover{background:rgba(255,255,255,0.08)!important;}
      `}</style>

      <div style={{minHeight:"100vh",background:"#060d1a",fontFamily:"'DM Sans',sans-serif",color:"#e2e8f0"}}>

        {/* HEADER */}
        <div style={{borderBottom:"1px solid #1e293b",padding:"18px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(15,23,42,0.85)",backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:50}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🗄️</div>
            <div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:15,fontWeight:700,color:"#e2e8f0"}}>AssetTracker TI</div>
              <div style={{fontSize:11,color:"#475569",fontFamily:"'Space Mono',monospace"}}>{session?.user?.email}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <button className="exp-btn" onClick={()=>exportExcel(assets)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid #334155",borderRadius:9,color:"#94a3b8",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:12}}>📊 Excel</button>
            <button className="exp-btn" onClick={()=>exportPDF(assets)}   style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid #334155",borderRadius:9,color:"#94a3b8",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:12}}>📄 PDF</button>
            <button onClick={()=>setModal("create")} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,boxShadow:"0 4px 15px rgba(14,165,233,0.3)"}}>+ Nuevo</button>
            <button onClick={()=>supabase.auth.signOut()} style={{padding:"9px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,color:"#f87171",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:12}}>Salir</button>
          </div>
        </div>

        <div style={{width:"100%",padding:"28px 32px",boxSizing:"border-box"}}>

          {/* STATS */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:26}}>
            {[
              {label:"Total",   value:stats.total,   color:"#0ea5e9", icon:"📦"},
              {label:"Activos", value:stats.activos, color:"#22c55e", icon:"✅"},
              {label:"Mant.",   value:stats.mant,    color:"#fbbf24", icon:"🔧"},
              {label:"De baja", value:stats.baja,    color:"#ef4444", icon:"❌"},
              {label:"Alertas", value:stats.alertas, color:"#f97316", icon:"⚠️"},
            ].map(({label,value,color,icon}) => (
              <div key={label} className="stat-card" style={{background:"#0f172a",border:`1px solid ${color}25`,borderRadius:13,padding:"18px 20px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:-8,right:-8,fontSize:44,opacity:0.08}}>{icon}</div>
                <div style={{fontSize:10,color:"#475569",fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{label}</div>
                <div style={{fontSize:32,fontWeight:700,color,fontFamily:"'Space Mono',monospace"}}>{value}</div>
                <div style={{marginTop:8,height:3,borderRadius:2,background:"#1e293b"}}>
                  <div style={{height:"100%",borderRadius:2,background:color,width:`${stats.total>0?(value/stats.total)*100:0}%`,transition:"width 0.5s"}}></div>
                </div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={{display:"flex",gap:4,marginBottom:20,background:"#0f172a",borderRadius:10,padding:4,border:"1px solid #1e293b",width:"fit-content"}}>
            {[["tabla","📋 Inventario"],["graficas","📊 Gráficas"]].map(([t,label])=>(
              <button key={t} className="tab-btn" onClick={()=>setTab(t)} style={{padding:"8px 18px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:12,fontWeight:700,background:tab===t?"linear-gradient(135deg,#0ea5e9,#6366f1)":"transparent",color:tab===t?"#fff":"#475569"}}>
                {label}
              </button>
            ))}
          </div>

          {tab === "graficas" && <ChartsPanel assets={assets}/>}

          {tab === "tabla" && (
            <>
              <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{flex:1,minWidth:200,position:"relative"}}>
                  <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"#475569",fontSize:14}}>🔍</span>
                  <input placeholder="Buscar nombre, serial, IP..." value={search} onChange={e=>setSearch(e.target.value)}
                    style={{width:"100%",background:"#1e293b",border:"1px solid #334155",borderRadius:9,padding:"9px 12px 9px 34px",color:"#e2e8f0",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
                </div>
                {[{val:filterT,set:setFilterT,opts:["Todos",...TIPOS]},
                  {val:filterE,set:setFilterE,opts:["Todos",...ESTADOS]},
                  {val:filterA,set:setFilterA,opts:["Todas",...AREAS]}].map(({val,set,opts})=>(
                  <select key={opts[0]} value={val} onChange={e=>set(e.target.value)} style={S.select}>
                    {opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                ))}
                <span style={{color:"#334155",fontSize:12,fontFamily:"'Space Mono',monospace",whiteSpace:"nowrap"}}>{filtered.length} resultado{filtered.length!==1?"s":""}</span>
              </div>

              <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,overflow:"hidden"}}>
                {loading ? (
                  <div style={{textAlign:"center",padding:"48px 24px",color:"#334155"}}>
                    <div style={{fontSize:36,marginBottom:10}}>⏳</div>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:13}}>Cargando activos...</div>
                  </div>
                ) : (
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",minWidth:860}}>
                      <thead>
                        <tr style={{borderBottom:"1px solid #1e293b"}}>
                          {["Activo","Tipo","Serial","Área","Responsable","IP","Últ. Mant.","Estado",""].map(h=>(
                            <th key={h} style={{padding:"13px 14px",textAlign:"left",color:"#334155",fontSize:10,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:1,whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((a,i) => {
                          const dias = diasDesdeMantenimiento(a.ultimo_mantenimiento);
                          const alerta = dias > 180 && a.estado === "Activo";
                          return (
                            <tr key={a.id} className="row-hover"
                              style={{borderBottom:"1px solid #111d2e",background:i%2===0?"transparent":"rgba(255,255,255,0.01)",cursor:"pointer"}}
                              onClick={()=>setDetail(a)}>
                              <td style={{padding:"13px 14px"}}>
                                <div style={{display:"flex",alignItems:"center",gap:9}}>
                                  <span style={{fontSize:18}}>{tipoIcon[a.tipo]}</span>
                                  <div>
                                    <div style={{color:"#e2e8f0",fontSize:14,fontWeight:500}}>{a.nombre}</div>
                                    {alerta && <div style={{color:"#f97316",fontSize:10,fontFamily:"'Space Mono',monospace"}}>⚠️ {dias}d sin mant.</div>}
                                  </div>
                                </div>
                              </td>
                              <td style={{padding:"13px 14px",color:"#64748b",fontSize:13}}>{a.tipo}</td>
                              <td style={{padding:"13px 14px"}}><code style={{color:"#0ea5e9",fontSize:12,background:"rgba(14,165,233,0.08)",padding:"2px 7px",borderRadius:4}}>{a.serial}</code></td>
                              <td style={{padding:"13px 14px",color:"#64748b",fontSize:13}}>{a.area}</td>
                              <td style={{padding:"13px 14px",color:"#94a3b8",fontSize:13}}>{a.responsable}</td>
                              <td style={{padding:"13px 14px"}}><code style={{color:"#6366f1",fontSize:12}}>{a.ip}</code></td>
                              <td style={{padding:"13px 14px",color:"#64748b",fontSize:12,fontFamily:"'Space Mono',monospace"}}>{a.ultimo_mantenimiento}</td>
                              <td style={{padding:"13px 14px"}}>
                                <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,background:estadoColor[a.estado].bg,color:estadoColor[a.estado].text,fontSize:11,fontFamily:"'Space Mono',monospace",whiteSpace:"nowrap"}}>
                                  <span style={{width:5,height:5,borderRadius:"50%",background:estadoColor[a.estado].dot}}></span>
                                  {a.estado}
                                </span>
                              </td>
                              <td style={{padding:"13px 14px"}} onClick={e=>e.stopPropagation()}>
                                <div style={{display:"flex",gap:5}}>
                                  <button className="act-btn" onClick={()=>setModal(a)} style={{padding:"4px 9px",background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:6,color:"#818cf8",cursor:"pointer",fontSize:12}}>✏️</button>
                                  <button className="act-btn" onClick={()=>setDelId(a.id)} style={{padding:"4px 9px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:6,color:"#f87171",cursor:"pointer",fontSize:12}}>🗑️</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filtered.length===0 && !loading && (
                      <div style={{textAlign:"center",padding:"40px 24px",color:"#334155"}}>
                        <div style={{fontSize:36,marginBottom:10}}>📭</div>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:13}}>No hay activos aún — crea el primero</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div style={{marginTop:12,color:"#334155",fontSize:11,fontFamily:"'Space Mono',monospace",textAlign:"right"}}>💡 Haz clic en una fila para ver detalles e historial</div>
            </>
          )}
        </div>
      </div>

      {(modal==="create"||(modal&&modal.id)) && <FormModal asset={modal==="create"?null:modal} onClose={()=>setModal(null)} onSave={handleSave}/>}
      {detail && <DetailModal asset={detail} onClose={()=>setDetail(null)}/>}
      {delId && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{background:"#0f172a",border:"1px solid rgba(239,68,68,0.3)",borderRadius:16,padding:32,textAlign:"center",maxWidth:340}}>
            <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
            <div style={{color:"#e2e8f0",fontFamily:"'Space Mono',monospace",fontSize:15,marginBottom:8}}>¿Eliminar activo?</div>
            <div style={{color:"#64748b",fontSize:13,marginBottom:22}}>Esta acción no se puede deshacer.</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>setDelId(null)} style={{padding:"9px 18px",background:"transparent",border:"1px solid #334155",borderRadius:8,color:"#94a3b8",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:13}}>Cancelar</button>
              <button onClick={()=>handleDelete(delId)} style={{padding:"9px 18px",background:"rgba(239,68,68,0.2)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:8,color:"#f87171",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700}}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
