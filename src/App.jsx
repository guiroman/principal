import { useState, useEffect } from "react";

const DAYS = ['D','S','T','Q','Q','S','S'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const styles = {
  app: { background: '#111', minHeight: '100vh', fontFamily: 'sans-serif', color: '#f0f0f0', paddingBottom: 60 },
  header: { background: '#1c1c1c', borderBottom: '2px solid #c8f135', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  h1: { fontFamily: 'monospace', fontSize: '1.5rem', color: '#c8f135', letterSpacing: 2 },
  body: { padding: 16, maxWidth: 600, margin: '0 auto' },
  addBox: { background: '#1c1c1c', border: '1px solid #2d2d2d', borderRadius: 10, padding: 14, marginBottom: 18 },
  addRow: { display: 'flex', gap: 8 },
  input: { flex: 1, background: '#0f0f0f', border: '1.5px solid #2d2d2d', borderRadius: 7, padding: '12px 13px', color: '#f0f0f0', fontSize: 16, outline: 'none', minHeight: 44 },
  btn: { background: '#c8f135', color: '#111', border: 'none', borderRadius: 7, padding: '10px 16px', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', minHeight: 44, whiteSpace: 'nowrap' },
  btnSm: { background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: 6, padding: '6px 12px', fontSize: '.75rem', cursor: 'pointer' },
  btnGhost: { background: 'transparent', border: '1px solid #2d2d2d', color: '#666', borderRadius: 7, padding: '8px 14px', fontSize: '.8rem', cursor: 'pointer' },
  btnPdf: { background: '#1c1c1c', border: '1.5px solid #c8f135', color: '#c8f135', borderRadius: 7, padding: '10px 16px', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', minHeight: 44, whiteSpace: 'nowrap' },
  card: { background: '#1c1c1c', border: '1px solid #2d2d2d', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', cursor: 'pointer' },
  avatar: { width: 38, height: 38, borderRadius: '50%', background: '#c8f135', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: '#111', flexShrink: 0 },
  badge: { background: '#c8f135', color: '#111', fontWeight: 700, fontSize: '.72rem', padding: '3px 9px', borderRadius: 20 },
  cardBody: { padding: '0 16px 16px', borderTop: '1px solid #2d2d2d' },
  monthNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 8px' },
  nbtn: { background: '#252525', border: '1px solid #2d2d2d', borderRadius: 5, color: '#f0f0f0', padding: '4px 11px', cursor: 'pointer', fontSize: '1rem' },
  cal: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 },
  dlbl: { textAlign: 'center', fontSize: '.6rem', color: '#666', fontWeight: 600, paddingBottom: 3, textTransform: 'uppercase' },
  emptyState: { textAlign: 'center', padding: '40px 16px', color: '#666' },
  label: { fontSize: '.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 },
  secTitle: { fontFamily: 'monospace', fontSize: '1rem', letterSpacing: 3, color: '#666', marginBottom: 12 },
  sel: { background: '#111', border: '1.5px solid #2d2d2d', borderRadius: 7, padding: '10px 12px', color: '#f0f0f0', fontSize: '1rem', outline: 'none', cursor: 'pointer', width: '100%' },
  filterLabel: { fontSize: '.68rem', color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
};

function getDay(s, key) { return !!(s.sessions && s.sessions[key]); }
function totalSessions(s) { return Object.keys(s.sessions || {}).length; }
function monthCount(s, y, m) {
  return Object.keys(s.sessions || {}).filter(k => k.startsWith(`${y}-${String(m+1).padStart(2,'0')}`)).length;
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [newName, setNewName] = useState('');
  const [openCard, setOpenCard] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [nav, setNav] = useState(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() }; });
  const [toast, setToast] = useState('');
  const [report, setReport] = useState(false);
  const [repMonthStart, setRepMonthStart] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${n.getMonth()}`; });
  const [repMonthEnd, setRepMonthEnd] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${n.getMonth()}`; });
  const [repStudent, setRepStudent] = useState('todos');
  const [repData, setRepData] = useState(null);
  const [logo, setLogo] = useState(() => localStorage.getItem('ptcontrol_logo') || null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ptcontrol_v3');
      if (saved) setStudents(JSON.parse(saved));
    } catch(e) {}
  }, []);

  function save(s) {
    setStudents(s);
    try { localStorage.setItem('ptcontrol_v3', JSON.stringify(s)); } catch(e) {}
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }

  function addStudent() {
    const name = newName.trim();
    if (!name) return;
    const updated = [...students, { id: Date.now(), name, sessions: {} }];
    save(updated);
    setNewName('');
    showToast('Aluno adicionado!');
  }

  function renameStudent(id) {
    const name = editingName.trim();
    if (!name) return;
    const updated = students.map(s => s.id === id ? { ...s, name } : s);
    save(updated);
    setEditingId(null);
    showToast('Nome atualizado!');
  }

  function removeStudent(id) {
    if (!window.confirm('Remover aluno?')) return;
    const updated = students.filter(s => s.id !== id);
    save(updated);
    if (openCard === id) setOpenCard(null);
    showToast('Removido.');
  }

  function toggleDay(id, key) {
    const updated = students.map(s => {
      if (s.id !== id) return s;
      const sessions = { ...s.sessions };
      if (sessions[key]) delete sessions[key];
      else sessions[key] = true;
      return { ...s, sessions };
    });
    save(updated);
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setLogo(base64);
      try { localStorage.setItem('ptcontrol_logo', base64); } catch(e) {}
      showToast('Logo salva!');
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setLogo(null);
    try { localStorage.removeItem('ptcontrol_logo'); } catch(e) {}
    showToast('Logo removida.');
  }

  function DayCell({ sid, d, year, month }) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const s = students.find(s => s.id === sid);
    const marked = getDay(s, key);
    const today = new Date();
    const isToday = today.getFullYear()===year && today.getMonth()===month && today.getDate()===d;
    return (
      <div onClick={() => toggleDay(sid, key)} style={{
        aspectRatio: '1', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '.78rem', fontWeight: marked ? 700 : 500, cursor: 'pointer',
        border: `1.5px solid ${marked ? '#c8f135' : isToday ? '#c8f135' : 'transparent'}`,
        background: marked ? '#c8f135' : '#252525',
        color: marked ? '#111' : isToday ? '#c8f135' : '#f0f0f0',
      }}>{d}</div>
    );
  }

  function Calendar({ s }) {
    const { year, month } = nav;
    const first = new Date(year, month, 1).getDay();
    const dim = new Date(year, month+1, 0).getDate();
    const mc = monthCount(s, year, month);
    return (
      <div style={styles.cardBody}>
        <div style={styles.monthNav}>
          <button style={styles.nbtn} onClick={e => { e.stopPropagation(); setNav(n => { let m=n.month-1,y=n.year; if(m<0){m=11;y--;} return{year:y,month:m}; }); }}>‹</button>
          <span style={{ fontFamily:'monospace', fontSize:'1rem', letterSpacing:2, color:'#c8f135' }}>{MONTHS[month]} {year}</span>
          <button style={styles.nbtn} onClick={e => { e.stopPropagation(); setNav(n => { let m=n.month+1,y=n.year; if(m>11){m=0;y++;} return{year:y,month:m}; }); }}>›</button>
        </div>
        <div style={styles.cal}>
          {DAYS.map((d,i) => <div key={i} style={styles.dlbl}>{d}</div>)}
          {Array(first).fill(null).map((_,i) => <div key={`e${i}`} />)}
          {Array.from({length:dim},(_,i)=>i+1).map(d => <DayCell key={d} sid={s.id} d={d} year={year} month={month} />)}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12, paddingTop:12, borderTop:'1px solid #2d2d2d', flexWrap:'wrap', gap:8 }}>
          <span style={{ fontSize:'.78rem', color:'#666' }}>{mc} aula{mc!==1?'s':''} em {MONTHS_SHORT[month]}</span>
          <button style={styles.btnSm} onClick={e => { e.stopPropagation(); removeStudent(s.id); }}>Remover aluno</button>
        </div>
      </div>
    );
  }

  function buildReport() {
    const [ys, ms] = repMonthStart.split('-').map(Number);
    const [ye, me] = repMonthEnd.split('-').map(Number);
    const months = [];
    let cy = ys, cm = ms;
    while (cy < ye || (cy === ye && cm <= me)) {
      months.push({ y: cy, m: cm });
      cm++; if (cm > 11) { cm = 0; cy++; }
      if (months.length > 24) break;
    }
    const filtered = repStudent === 'todos' ? students : students.filter(s => String(s.id) === repStudent);
    const rows = filtered.map(s => {
      const byMonth = months.map(({ y, m }) => {
        const prefix = `${y}-${String(m+1).padStart(2,'0')}`;
        const days = Object.keys(s.sessions||{}).filter(k => k.startsWith(prefix)).sort().map(k => parseInt(k.split('-')[2]));
        return { label: `${MONTHS_SHORT[m]}/${y}`, days };
      }).filter(r => r.days.length > 0);
      const total = byMonth.reduce((a, r) => a + r.days.length, 0);
      const daysStr = months.length === 1
        ? (byMonth[0]?.days.join(', ') || '')
        : byMonth.map(r => `${r.label}: ${r.days.join(', ')}`).join(' | ');
      return { name: s.name, count: total, days: daysStr };
    }).filter(r => r.count > 0);
    const studentName = repStudent !== 'todos' ? students.find(s => String(s.id) === repStudent)?.name : null;
    const monthLabel = months.length === 1
      ? `${MONTHS[ms]} ${ys}`
      : `${MONTHS[ms]} ${ys} – ${MONTHS[me]} ${ye}`;
    setRepData({ rows, monthLabel, total: rows.reduce((a,r) => a+r.count, 0), studentName });
  }

  function copyReport() {
    if (!repData || !repData.rows.length) return;
    const { rows, monthLabel, total, studentName } = repData;
    const titulo = studentName
      ? `RELATÓRIO — ${studentName.toUpperCase()} — ${monthLabel.toUpperCase()}`
      : `RELATÓRIO — ${monthLabel.toUpperCase()}`;
    let txt = `${titulo}\n${'─'.repeat(titulo.length)}\n`;
    rows.forEach(r => txt += `${r.name}: ${r.count} aula${r.count!==1?'s':''} (dias: ${r.days})\n`);
    txt += `${'─'.repeat(titulo.length)}\nTOTAL: ${total} aula${total!==1?'s':''}`;
    navigator.clipboard.writeText(txt).then(() => showToast('Copiado!')).catch(() => showToast('Erro ao copiar.'));
  }

  const [printData, setPrintData] = useState(null);

  function handlePrint() {
    if (!repData || !repData.rows.length) return;
    setPrintData(repData);
    window.addEventListener('afterprint', () => setPrintData(null), { once: true });
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }

  const now = new Date();
  const monthOptions = Array.from({length: 12}, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    return { value: `${d.getFullYear()}-${d.getMonth()}`, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` };
  });

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <div style={styles.h1}>💪 PT Control</div>
          <div style={{ fontSize:'.7rem', color:'#666', textTransform:'uppercase', letterSpacing:1 }}>Controle de Aulas</div>
        </div>
        <button style={styles.btn} onClick={() => { setReport(true); setRepData(null); setRepStudent('todos'); }}>📄 Relatório</button>
      </header>

      <div style={styles.body}>
        <div style={styles.addBox}>
          <label style={styles.label}>Novo Aluno</label>
          <div style={styles.addRow}>
            <input style={styles.input} type="text" placeholder="Nome do aluno..." value={newName}
              onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key==='Enter' && addStudent()} maxLength={50} />
            <button style={styles.btn} onClick={addStudent}>+ Adicionar</button>
          </div>
        </div>

        {students.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize:'2.5rem', marginBottom:10 }}>🏋️</div>
            <p style={{ fontSize:'.9rem', lineHeight:1.6 }}>Nenhum aluno cadastrado ainda.<br />Adicione seu primeiro aluno acima!</p>
          </div>
        ) : (
          <>
            <div style={styles.secTitle}>ALUNOS ({students.length})</div>
            {students.map(s => {
              const isOpen = openCard === s.id;
              const tot = totalSessions(s);
              return (
                <div key={s.id} style={styles.card}>
                  <div style={styles.cardHead} onClick={() => editingId !== s.id && setOpenCard(isOpen ? null : s.id)}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
                      <div style={styles.avatar}>{s.name.charAt(0).toUpperCase()}</div>
                      {editingId === s.id ? (
                        <div onClick={e => e.stopPropagation()} style={{ display:'flex', gap:6, alignItems:'center', flex:1 }}>
                          <input
                            style={{ ...styles.input, padding:'6px 10px', fontSize:'.9rem', minHeight:'unset', flex:1 }}
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            onKeyDown={e => { if(e.key==='Enter') renameStudent(s.id); if(e.key==='Escape') setEditingId(null); }}
                            autoFocus
                          />
                          <button style={{ ...styles.btn, padding:'6px 12px', minHeight:'unset' }} onClick={e => { e.stopPropagation(); renameStudent(s.id); }}>✓</button>
                          <button style={{ ...styles.btnGhost, padding:'6px 10px', minHeight:'unset' }} onClick={e => { e.stopPropagation(); setEditingId(null); }}>✕</button>
                        </div>
                      ) : (
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:'.95rem' }}>{s.name}</div>
                          <div style={{ fontSize:'.72rem', color:'#666', marginTop:1 }}>{tot} aula{tot!==1?'s':''} no total</div>
                        </div>
                      )}
                    </div>
                    {editingId !== s.id && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                        <button style={{ background:'transparent', border:'1px solid #333', color:'#666', borderRadius:6, padding:'4px 8px', fontSize:'.8rem', cursor:'pointer' }}
                          onClick={e => { e.stopPropagation(); setEditingId(s.id); setEditingName(s.name); }}>✏️</button>
                        <span style={styles.badge}>{tot}</span>
                        <span style={{ color:'#666', display:'inline-block', transform: isOpen?'rotate(180deg)':'none', transition:'transform .25s' }}>▾</span>
                      </div>
                    )}
                  </div>
                  {isOpen && <Calendar s={s} />}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Modal Relatório */}
      {report && (
        <div onClick={() => setReport(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#1c1c1c', border:'1px solid #2d2d2d', borderRadius:14, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto', padding:22 }}>
            <div style={{ fontFamily:'monospace', fontSize:'1.3rem', letterSpacing:2, color:'#c8f135', marginBottom:4 }}>RELATÓRIO</div>
            <div style={{ color:'#666', fontSize:'.75rem', marginBottom:16 }}>Filtre por mês e aluno</div>

            {/* Filtros */}
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
              <div style={{ display:'flex', gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={styles.filterLabel}>De</div>
                  <select value={repMonthStart} onChange={e => { setRepMonthStart(e.target.value); setRepData(null); }} style={styles.sel}>
                    {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div style={{ flex:1 }}>
                  <div style={styles.filterLabel}>Até</div>
                  <select value={repMonthEnd} onChange={e => { setRepMonthEnd(e.target.value); setRepData(null); }} style={styles.sel}>
                    {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div style={styles.filterLabel}>Aluno</div>
                <select value={repStudent} onChange={e => { setRepStudent(e.target.value); setRepData(null); }} style={styles.sel}>
                  <option value="todos">Todos os alunos</option>
                  {students.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                </select>
              </div>
              <button style={{ ...styles.btn, width:'100%', marginTop:4 }} onClick={buildReport}>Gerar relatório</button>
            </div>

            {/* Logo para o PDF */}
            <div style={{ borderTop:'1px solid #2d2d2d', borderBottom:'1px solid #2d2d2d', padding:'12px 0', marginBottom:16 }}>
              <div style={styles.filterLabel}>Logo para o PDF (marca d'água)</div>
              {logo ? (
                <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:6 }}>
                  <img src={logo} alt="logo" style={{ height:36, objectFit:'contain', borderRadius:4, background:'#fff', padding:'2px 6px' }} />
                  <span style={{ fontSize:'.75rem', color:'#aaa', flex:1 }}>Logo salva ✓</span>
                  <button style={styles.btnSm} onClick={removeLogo}>Remover</button>
                </div>
              ) : (
                <label style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:6, cursor:'pointer', background:'#252525', border:'1px dashed #444', borderRadius:7, padding:'8px 14px' }}>
                  <span style={{ fontSize:'1rem' }}>🖼️</span>
                  <span style={{ fontSize:'.78rem', color:'#aaa' }}>Clique para fazer upload da logo</span>
                  <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleLogoUpload} />
                </label>
              )}
            </div>

            {/* Resultado */}
            {repData && (
              <div>
                {repData.rows.length === 0 ? (
                  <p style={{ color:'#666', fontSize:'.85rem', textAlign:'center', padding:'16px 0', borderTop:'1px solid #2d2d2d' }}>
                    Nenhuma aula encontrada para este filtro.
                  </p>
                ) : (
                  <>
                    <div style={{ marginBottom:12, paddingBottom:12, borderBottom:'1px solid #2d2d2d', borderTop:'1px solid #2d2d2d', paddingTop:12 }}>
                      <div style={styles.filterLabel}>Resultado</div>
                      <div style={{ fontWeight:600, marginTop:2 }}>
                        {repData.monthLabel}{repData.studentName ? ` · ${repData.studentName}` : ' · Todos os alunos'}
                      </div>
                    </div>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.82rem' }}>
                      <thead><tr>
                        <th style={{ textAlign:'left', padding:'8px 10px', background:'#252525', color:'#666', fontSize:'.68rem', textTransform:'uppercase' }}>Aluno</th>
                        <th style={{ textAlign:'center', padding:'8px 10px', background:'#252525', color:'#666', fontSize:'.68rem', textTransform:'uppercase' }}>Aulas</th>
                        <th style={{ textAlign:'left', padding:'8px 10px', background:'#252525', color:'#666', fontSize:'.68rem', textTransform:'uppercase' }}>Dias</th>
                      </tr></thead>
                      <tbody>
                        {repData.rows.map((r,i) => (
                          <tr key={i}>
                            <td style={{ padding:'8px 10px', borderBottom:'1px solid #2d2d2d', fontWeight:500 }}>{r.name}</td>
                            <td style={{ padding:'8px 10px', borderBottom:'1px solid #2d2d2d', textAlign:'center' }}><span style={styles.badge}>{r.count}</span></td>
                            <td style={{ padding:'8px 10px', borderBottom:'1px solid #2d2d2d', color:'#666', fontSize:'.75rem' }}>{r.days}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid #2d2d2d', display:'flex', justifyContent:'space-between', fontSize:'.82rem' }}>
                      <span style={{ color:'#666' }}>Total</span>
                      <span style={{ fontWeight:700, color:'#c8f135' }}>{repData.total} aula{repData.total!==1?'s':''}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={{ display:'flex', gap:8, marginTop:16, flexWrap:'wrap' }}>
              {repData && repData.rows.length > 0 && (<>
                <button style={styles.btn} onClick={handlePrint}>🖨️ Salvar PDF</button>
                <button style={styles.btnGhost} onClick={copyReport}>📋 Copiar texto</button>
              </>)}
              <button style={styles.btnGhost} onClick={() => setReport(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)', background:'#c8f135', color:'#111', fontWeight:700, fontSize:'.82rem', padding:'9px 20px', borderRadius:8, zIndex:999, whiteSpace:'nowrap' }}>
          {toast}
        </div>
      )}

      {/* Print view — invisible on screen, visible only when printing */}
      {printData && (
        <div id="ptc-print">
          {logo && <img src={logo} className="ptc-wm" alt="" />}
          <div className="ptc-hdr">
            <h1>{printData.studentName ? printData.studentName.toUpperCase() : 'GUILHERME ROMAN - TREINADOR'}</h1>
            <p>{printData.monthLabel.toUpperCase()} · RELATÓRIO DE AULAS · PT CONTROL</p>
          </div>
          <div className="ptc-body">
            <table className="ptc-tbl">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Aulas</th>
                  <th>Dias</th>
                </tr>
              </thead>
              <tbody>
                {printData.rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td>{r.count}</td>
                    <td>{r.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ptc-total">
              <span>TOTAL</span>
              <span>{printData.total} aula{printData.total !== 1 ? 's' : ''}</span>
            </div>
            <div className="ptc-foot">
              Gerado em {new Date().toLocaleDateString('pt-BR')} · PT Control
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
