const { useState,useMemo,useEffect,useRef } = React
function upperAccentsSpaces(v){ return (v||'').toUpperCase().replace(/[^A-ZÀ-Ÿ\s]/g,'').replace(/\s+/g,' ') }
function sanitizeNomeLive(v){ return upperAccentsSpaces(v) }
function sanitizeNomeFinal(v){ return upperAccentsSpaces(v).trim() }
function sanitizePrefixLive(v){ let val=(v||'').toUpperCase(); if(!val.startsWith('MONT.')) val='MONT. '+val.replace(/^MONT\.?\s*/,''); else val=val.replace(/^MONT\.?\s*/,'MONT. '); const s=val.slice(6); const clean=s.replace(/[^A-ZÀ-Ÿ\s\.]/g,'').replace(/\s+/g,' '); return 'MONT. '+clean }
function sanitizePrefixFinal(v){ let val=sanitizePrefixLive(v); return val.trim() }
function sanitizeAfLive(v){ return sanitizePrefixLive(v) }
function sanitizeAfFinal(v){ return sanitizePrefixFinal(v) }
function sanitizePrefixLiveFlex(v){ let val=(v||'').toUpperCase(); if(!val.startsWith('MONT.')) val='MONT. '+val.replace(/^MONT\.\?\s*/,''); else val=val.replace(/^MONT\.\?\s*/,'MONT. '); const s=val.slice(6); const clean=s.replace(/[^A-ZÀ-Ÿ\s\.,-]/g,'').replace(/\s+/g,' '); return 'MONT. '+clean }
function sanitizePrefixFinalFlex(v){ let val=sanitizePrefixLiveFlex(v); return val.trim() }
function sanitizePosto(v){ return (v||'').replace(/[^0-9]/g,'').slice(0,3) }
const optionsAreas=['MOCOM 1','MOCOM 2','MOCOM 3','MOCOM 4','LM 1','LM 2','LM 3','LM 4','FILTRO DE AR']
const optionsTurnos=['1º','2º']
function makeFakeOperators(){
  const statuses=['EFETIVO','TEMPORÁRIO','RL']
  return Array.from({length:48},(_,i)=>{
    const status = statuses[i%statuses.length]
    const area = optionsAreas[i%optionsAreas.length]
    return { id:i+1, nome:`OPERADOR ${i+1}`, know:`MONT. ${area}`, af:`MONT. ${area}`, areas:area, status, posto:String(i+1).padStart(2,'0'), turno:optionsTurnos[i%optionsTurnos.length], times:[], updatedAt:Date.now() }
  })
}
function formatTime(ms){ const m=Math.floor(ms/60000); const s=Math.floor((ms%60000)/1000); const msr=Math.floor(ms%1000); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(msr).padStart(3,'0')}` }
function Operadores({rows:rowsProp,setRows:setRowsProp,selectedModel,setSelectedModel,modelConfigs}){
  const localState = useState(()=> makeFakeOperators())
  const rows = rowsProp ?? localState[0]
  const setRows = setRowsProp ?? localState[1]
  const [open,setOpen] = useState(false)
  const [editing,setEditing] = useState(null)
  const [form,setForm] = useState({ nome:'', know:'', af:'MONT. ', areas:'', status:'EFETIVO', posto:'', turno:'1º' })
  const [page,setPage] = useState(1)
  const [pageSize,setPageSize] = useState(5)
  const [view,setView] = useState(null)
  const [query,setQuery] = useState('')
  const [turnoFilter,setTurnoFilter] = useState('')
  const [conflict,setConflict] = useState(null)
  const [isMobile,setIsMobile] = useState(false)
  
  useEffect(()=>{ if(!open) setForm({ nome:'', know:'', af:'MONT. ', areas:'', status:'EFETIVO', posto:'', turno:'1º' }) },[open])
  useEffect(()=>{ const mq=window.matchMedia('(max-width: 640px)'); const apply=()=> setIsMobile(mq.matches); apply(); mq.addEventListener('change',apply); return ()=> mq.removeEventListener('change',apply) },[])
  function nextId(){ return (rows.length? Math.max(...rows.map(r=> Number(r.id)||0)) : 0) + 1 }
  function onSubmit(e){
    e.preventDefault();
    const nome=sanitizeNomeFinal(form.nome);
    const know=sanitizePrefixFinalFlex(form.know);
    const af=sanitizePrefixFinalFlex(form.af);
    const areas=form.areas;
    const status=form.status;
    const posto=sanitizePosto(form.posto);
    const turno=form.turno;
    const base = editing!=null ? (rows[editing]||{}) : {};
    const allModels = Object.keys(modelConfigs||{});
    const timesByModelBase = base.timesByModel && typeof base.timesByModel==='object' ? base.timesByModel : {};
    const timesByModel = Object.fromEntries(allModels.map(k=>{
      const cfg = (modelConfigs||{})[k]||{};
      const existing = timesByModelBase[k];
      if(existing) return [k, existing];
      return [k, (cfg.max!=null ? { '1':[], '2':[], '3':[] } : [])];
    }));
    const row={ ...base, id: base.id ?? nextId(), nome, know, af, areas, status, posto, turno, timesByModel, updatedAt:Date.now() };
    const dupIdx = posto ? rows.findIndex((r,idx)=> String(r.posto||'')===String(posto) && idx!==editing ) : -1
    if(dupIdx>=0){ setConflict({ idx: dupIdx, newRow: row }); return }
    if(editing!=null){ const next=[...rows]; next[editing]=row; setRows(next) } else { setRows(prev=>[...prev,row]) }
    setOpen(false);
    setEditing(null)
  }
  function onEdit(i){ setEditing(i); const r=rows[i]; setForm({ nome:r.nome, know:r.know, af:r.af, areas:r.areas, status:r.status, posto:r.posto, turno:r.turno||'1º' }); setOpen(true) }
  function onDelete(i){ setRows(rows.filter((_,idx)=>idx!==i)) }
  const filtered = (Array.isArray(rows)? rows : []).filter(r=>{
    const q=(query||'').trim().toLowerCase()
    const byQuery = q ? ((r.nome||'').toLowerCase().includes(q) || String(r.posto||'').includes(q)) : true
    const byTurno = turnoFilter ? (String(r.turno||'')===turnoFilter) : true
    return byQuery && byTurno
  })
  const total = filtered.length
  const startIdx = (page-1)*pageSize
  const pageRows = filtered.slice(startIdx, startIdx+pageSize)
  useEffect(()=>{ const pages=Math.max(1,Math.ceil(total/pageSize)); if(page>pages) setPage(pages) },[total,pageSize])
  return React.createElement('div',{className:'space-y-4'},[
    React.createElement('div',{className:'flex items-center justify-between'},[
      React.createElement('div',{className:'text-xl font-bold'},'Operadores'),
      React.createElement('button',{onClick:()=>{ setEditing(null); setOpen(true) },className:'px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-500'},'+ Novo Operador')
    ]),
    React.createElement('div',{className:'grid grid-cols-2 sm:grid-cols-4 gap-3'},[
      React.createElement('div',{className:'bg-white rounded-xl p-3 flex items-center gap-3 shadow-lg'},[
        React.createElement('span',{className:'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600'},
          React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,className:'w-5 h-5 text-white'},[
            React.createElement('circle',{cx:12,cy:8,r:3,key:'c'}),
            React.createElement('path',{d:'M5 20a7 7 0 0114 0',key:'p'})
          ])
        ),
        React.createElement('div',null,[
          React.createElement('div',{className:'text-sm text-gray-600'},'TOTAL DE OPERADORES'),
          React.createElement('div',{className:'text-2xl font-bold'},rows.length)
        ])
      ]),
      React.createElement('div',{className:'bg-white rounded-xl p-3 flex items-center gap-3 shadow-lg'},[
        React.createElement('span',{className:'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-600'},
          React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,className:'w-5 h-5 text-white'},[
            React.createElement('circle',{cx:12,cy:8,r:3,key:'c'}),
            React.createElement('path',{d:'M5 20a7 7 0 0114 0',key:'p'})
          ])
        ),
        React.createElement('div',null,[
          React.createElement('div',{className:'text-sm text-gray-600'},'EFETIVOS'),
          React.createElement('div',{className:'text-2xl font-bold'},rows.filter(r=>r.status==='EFETIVO').length)
        ])
      ]),
      React.createElement('div',{className:'bg-white rounded-xl p-3 flex items-center gap-3 shadow-lg'},[
        React.createElement('span',{className:'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-600'},
          React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,className:'w-5 h-5 text-white'},[
            React.createElement('circle',{cx:12,cy:8,r:3,key:'c'}),
            React.createElement('path',{d:'M5 20a7 7 0 0114 0',key:'p'})
          ])
        ),
        React.createElement('div',null,[
          React.createElement('div',{className:'text-sm text-gray-600'},'TEMPORÁRIOS'),
          React.createElement('div',{className:'text-2xl font-bold'},rows.filter(r=>r.status==='TEMPORÁRIO').length)
        ])
      ]),
      React.createElement('div',{className:'bg-white rounded-xl p-3 flex items-center gap-3 shadow-lg'},[
        React.createElement('span',{className:'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500'},
          React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,className:'w-5 h-5 text-white'},[
            React.createElement('circle',{cx:12,cy:8,r:3,key:'c'}),
            React.createElement('path',{d:'M5 20a7 7 0 0114 0',key:'p'})
          ])
        ),
        React.createElement('div',null,[
          React.createElement('div',{className:'text-sm text-gray-600'},'RL'),
          React.createElement('div',{className:'text-2xl font-bold'},rows.filter(r=>r.status==='RL').length)
        ])
      ])
    ]),
    React.createElement('div',{className:'flex items-center gap-3'},[
      React.createElement('input',{value:query,onChange:e=>setQuery(e.target.value),placeholder:'Buscar por nome ou posto...',className:'flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'}),
      React.createElement('select',{value:turnoFilter,onChange:e=>{ setTurnoFilter(e.target.value); setPage(1) },className:'w-40 border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900'},[
        React.createElement('option',{value:''},'Todos Turnos'),
        optionsTurnos.map(t=> React.createElement('option',{key:t,value:t},t))
      ])
    ]),
    
    isMobile ? React.createElement('div',{className:'space-y-2'},[
      pageRows.map((r,i)=> React.createElement('div',{key:startIdx+i,className:'bg-white rounded-xl p-3 shadow-lg flex items-center justify-between'},[
        React.createElement('div',{className:'flex items-center gap-3'},[
          React.createElement('div',{className:'inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 font-bold'},String(r.posto||'').padStart(2,'0')),
          React.createElement('div',null,[
            React.createElement('div',{className:'font-semibold'},r.nome),
            React.createElement('div',{className:'text-xs text-gray-600'},(r.areas||'-')+' • '+(r.turno||'-'))
          ])
        ]),
        React.createElement('div',{className:'flex items-center gap-2'},[
          React.createElement('div',null,React.createElement(StatusPill,{status:r.status})),
          React.createElement('button',{title:'Ver',className:'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white hover:bg-blue-500',onClick:()=>setView(r)},'👁️'),
          React.createElement('button',{title:'Editar',className:'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500 text-white hover:bg-orange-400',onClick:()=>onEdit(startIdx+i)},'✎'),
          React.createElement('button',{title:'Excluir',className:'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 text-white hover:bg-red-400',onClick:()=>onDelete(startIdx+i)},'🗑️')
        ])
      ]))
    ]) : React.createElement('div',{className:'bg-white rounded-xl p-3 shadow-lg'},[
      React.createElement('table',{className:'w-full text-sm table-fixed'},[
        React.createElement('thead',null,React.createElement('tr',null,[
          React.createElement('th',{className:'text-left py-2 px-2 text-gray-600'},'POSTO'),
          React.createElement('th',{className:'text-left py-2 px-2 text-gray-600'},'NOME COMPLETO'),
          React.createElement('th',{className:'text-left py-2 px-2 text-gray-600'},'KNOW ROW'),
          React.createElement('th',{className:'text-left py-2 px-2 text-gray-600'},'ÁREAS'),
          React.createElement('th',{className:'text-left py-2 px-2 text-gray-600'},'AF'),
          React.createElement('th',{className:'text-left py-2 px-2 text-gray-600'},'STATUS'),
          React.createElement('th',{className:'text-left py-2 px-2 text-gray-600'},'TURNO'),
          React.createElement('th',{className:'text-left py-2 px-2 text-gray-600'},'TEMPO'),
          React.createElement('th',{className:'text-right py-2 px-2 text-gray-600'},'AÇÕES')
        ])),
        React.createElement('tbody',null,pageRows.map((r,i)=>React.createElement('tr',{key:startIdx+i,className:'border-none align-middle'},[
          React.createElement('td',{className:'py-2 px-2 text-left'},String(r.posto||'').padStart(2,'0')),
          React.createElement('td',{className:'py-2 px-2 text-left'},r.nome),
          React.createElement('td',{className:'py-2 px-2 text-left'},r.know||'-'),
          React.createElement('td',{className:'py-2 px-2 text-left'},r.areas||'-'),
          React.createElement('td',{className:'py-2 px-2 text-left'},r.af||'-'),
          React.createElement('td',{className:'py-2 px-2 text-left'},React.createElement(StatusPill,{status:r.status})),
          React.createElement('td',{className:'py-2 px-2 text-left'},r.turno||'-'),
          React.createElement('td',{className:'py-2 px-2 text-left'},(()=>{ const v=(r.timesByModel&&r.timesByModel[selectedModel]); if(Array.isArray(v)){ return v.length? formatTime(v[v.length-1].dur) : '-' } if(v&&typeof v==='object'){ const vals=['1','2','3'].map(k=>{ const a=v[k]; const last=(Array.isArray(a)&&a.length)? a[a.length-1].dur : 0; return last }).filter(x=>x>0); const avgMs = vals.length? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0; return avgMs>0? formatTime(avgMs) : '-' } return '-' })()),
          React.createElement('td',{className:'py-2 px-2 text-right'},[
            React.createElement('button',{title:'Visualizar',className:'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white hover:bg-blue-500 mr-2',onClick:()=>setView(r)},
              React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,className:'w-5 h-5'},[
                React.createElement('path',{d:'M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7'}),
                React.createElement('circle',{cx:12,cy:12,r:3})
              ])
            ),
            React.createElement('button',{title:'Editar',className:'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500 text-white hover:bg-orange-400 mr-2',onClick:()=>onEdit(startIdx+i)},
              React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,className:'w-5 h-5'},[
                React.createElement('path',{d:'M12 20h9'}),
                React.createElement('path',{d:'M16.5 3.5l4 4-11 11H5.5v-4z'})
              ])
            ),
            React.createElement('button',{title:'Excluir',className:'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 text-white hover:bg-red-400',onClick:()=>onDelete(startIdx+i)},
              React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,className:'w-5 h-5'},[
                React.createElement('path',{d:'M3 6h18'}),
                React.createElement('path',{d:'M8 6V4h8v2'}),
                React.createElement('path',{d:'M19 6l-1 14H6L5 6'})
              ])
            )
          ])
        ])))
      ])
    ]),
    React.createElement(Pagination,{ total, page, pageSize, onPageChange:setPage, onPageSizeChange:setPageSize }),
    React.createElement(Modal,{open,onClose:()=>setOpen(false)},[
      React.createElement('div',{className:'text-black'},[
        React.createElement('div',{className:'text-lg font-bold mb-3'},'Novo Operador'),
        React.createElement('form',{onSubmit:onSubmit,className:'space-y-3'},[
          React.createElement('div',null,[
            React.createElement('label',{className:'text-sm text-gray-600'},'Nome Completo'),
            React.createElement('input',{value:form.nome,onChange:e=>setForm({...form,nome:sanitizeNomeLive(e.target.value)}),placeholder:'Digite o nome completo',className:'w-full border rounded px-3 py-2'})
          ]),
          React.createElement('div',{className:'grid grid-cols-2 gap-3'},[
            React.createElement('div',null,[
              React.createElement('label',{className:'text-sm text-gray-600'},'Know Row'),
              React.createElement('input',{value:form.know,onChange:e=>setForm({...form,know:sanitizePrefixLiveFlex(e.target.value)}),className:'w-full border rounded px-3 py-2'})
            ]),
            React.createElement('div',null,[
              React.createElement('label',{className:'text-sm text-gray-600'},'AF'),
              React.createElement('input',{value:form.af,onChange:e=>setForm({...form,af:sanitizePrefixLiveFlex(e.target.value)}),className:'w-full border rounded px-3 py-2'})
            ])
          ]),
          React.createElement('div',null,[
            React.createElement('label',{className:'text-sm text-gray-600'},'Áreas Anteriores'),
            React.createElement('select',{value:form.areas,onChange:e=>setForm({...form,areas:e.target.value}),className:'w-full border rounded px-3 py-2'},[
              React.createElement('option',{value:''},'Selecione...'),
              optionsAreas.map(a=>React.createElement('option',{key:a,value:a},a))
            ])
          ]),
          React.createElement('div',null,[
            React.createElement('label',{className:'text-sm text-gray-600'},'Nº Posto'),
            React.createElement('input',{value:form.posto,onChange:e=>setForm({...form,posto:sanitizePosto(e.target.value)}),placeholder:'123',className:'w-full border rounded px-3 py-2'})
          ]),
          React.createElement('div',null,[
            React.createElement('label',{className:'text-sm text-gray-600'},'Turno'),
            React.createElement('select',{value:form.turno,onChange:e=>setForm({...form,turno:e.target.value}),className:'w-full border rounded px-3 py-2'},[
              optionsTurnos.map(t=> React.createElement('option',{key:t,value:t},t))
            ])
          ]),
          React.createElement('div',null,[
            React.createElement('label',{className:'text-sm text-gray-600'},'Status'),
            React.createElement('select',{value:form.status,onChange:e=>setForm({...form,status:e.target.value}),className:'w-full border rounded px-3 py-2'},[
              React.createElement('option',null,'EFETIVO'),
              React.createElement('option',null,'TEMPORÁRIO'),
              React.createElement('option',null,'RL')
            ])
          ]),
          React.createElement('div',{className:'flex justify-end gap-2'},[
            React.createElement('button',{type:'button',onClick:()=>setOpen(false),className:'px-3 py-2 rounded bg-gray-200'},'Cancelar'),
            React.createElement('button',{type:'submit',className:'px-3 py-2 rounded bg-blue-600 text-white'},'Cadastrar')
          ])
        ])
      ])
    ])
    ,
    React.createElement(Modal,{open:!!view,onClose:()=>setView(null)},[
      view? React.createElement('div',null,[
        React.createElement('div',{className:'bg-[#0a0f1c] text-white rounded-xl px-4 py-3 mb-3'},`Operador: ${view.nome||''}`),
        React.createElement('div',{className:'bg-white rounded-xl p-4 border border-gray-200 shadow-sm'},[
          React.createElement('div',{className:'text-sm font-semibold text-gray-700 mb-2'},'Dados do Operador'),
          React.createElement('div',{className:'grid grid-cols-2 gap-3'},[
            React.createElement('div',null,[React.createElement('div',{className:'text-xs text-gray-600'},'Nome'),React.createElement('div',null,view.nome||'-')]),
            React.createElement('div',null,[React.createElement('div',{className:'text-xs text-gray-600'},'Status'),React.createElement('div',null,view.status||'-')]),
            React.createElement('div',null,[React.createElement('div',{className:'text-xs text-gray-600'},'Know Row'),React.createElement('div',null,view.know||'-')]),
            React.createElement('div',null,[React.createElement('div',{className:'text-xs text-gray-600'},'AF'),React.createElement('div',null,view.af||'-')]),
            React.createElement('div',null,[React.createElement('div',{className:'text-xs text-gray-600'},'Área'),React.createElement('div',null,view.areas||'-')]),
            React.createElement('div',null,[React.createElement('div',{className:'text-xs text-gray-600'},'Posto'),React.createElement('div',null,view.posto? String(view.posto) : '-')]),
            React.createElement('div',null,[React.createElement('div',{className:'text-xs text-gray-600'},'Turno'),React.createElement('div',null,view.turno||'-')])
          ])
        ]),
        
        React.createElement('div',{className:'flex justify-end mt-3'},[
          React.createElement('button',{onClick:()=>setView(null),className:'px-3 py-2 rounded bg-gray-200 hover:bg-gray-300'},'Fechar')
        ])
      ]) : null
    ])
    ,
    React.createElement(Modal,{open:!!conflict,onClose:()=>setConflict(null)},[
      conflict? React.createElement('div',null,[
        React.createElement('div',{className:'text-lg font-bold mb-2'},'Posto já cadastrado'),
        React.createElement('div',{className:'text-sm text-gray-700 mb-3'},`O Nº Posto ${rows[conflict.idx]?.posto||''} já está associado a ${(rows[conflict.idx]?.nome||'')}. Deseja substituir?`),
        React.createElement('div',{className:'flex justify-end gap-2'},[
          React.createElement('button',{onClick:()=>{ setConflict(null) },className:'px-3 py-2 rounded bg-gray-200'},'Mudar Nº do posto'),
          React.createElement('button',{onClick:()=>{ const i=conflict.idx; const existing=rows[i]||{}; const merged={ ...existing, ...conflict.newRow, id: existing.id, timesByModel: existing.timesByModel || conflict.newRow.timesByModel, updatedAt:Date.now() }; const next=[...rows]; next[i]=merged; setRows(next); setConflict(null); setOpen(false); setEditing(null) },className:'px-3 py-2 rounded bg-blue-600 text-white'},'Substituir')
        ])
      ]) : null
    ])
  ])
}
