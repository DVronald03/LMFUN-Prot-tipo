const { useState } = React
const optionsAreasApp=['MOCOM 1','MOCOM 2','MOCOM 3','MOCOM 4','LM 1','LM 2','LM 3','LM 4','FILTRO DE AR']
const optionsTurnosApp=['1º','2º']
const initialModelConfigs={ K3H:{ max:118, objective:106.2, ibTarget:90, quadro:44 }, K3W:{ max:118, objective:106.2, ibTarget:90, quadro:44 }, MLR:{ max:174, objective:156.2, ibTarget:90, quadro:44 }, MKY:{ max:184, objective:165.6, ibTarget:90, quadro:44 }, MKW:{ max:194, objective:174.6, ibTarget:90, quadro:44 }, MLC:{ max:226, objective:203.4, ibTarget:90, quadro:44 }, MLN:{ max:null, objective:null, ibTarget:90, quadro:44 }, MLL:{ max:null, objective:null, ibTarget:90, quadro:44 } }
const providedOperatorsData=[
  ['PEDRO','82,97'],['RUI','108,53'],['SÉRGIO','110,02'],['ADELAR','110,29'],['GABRIEL','122,25'],['BRENO','93,30'],['ROBERT','130,92'],['EDCARLOS','102,45'],['BONICK','110,56'],['MARINALDO','97,30'],['LUCAS MAIA','98,21'],['RODRIGO','90,32'],['WILLIAM','93,20'],['MARCUS VINICIUS','120,29'],['SANDALO','117,29'],['FERNANDO','108,29'],['RAUNEY','110,20'],['DIEGO LIRA','102,52'],['JANILSON','105,63'],['ELISANDRO','91,20'],['FABRICIO','89,55'],['EVANILSON','131,78'],['BRUNO','131,81'],['ANDRESSON','97,17'],['ASSUNÇÃO','80,91'],['GEDEAN','84,99'],['GILBERTO','88,19'],['AURÉLIO','101,29'],['JOZEMBERG','96,46'],['LUCAS','120,12'],['MATHEUS','130,21'],['CLÉVIS','106,72'],['NAÍLSON','94,98'],['KEYSSERSON','120,32'],['AURÉLIO','109,03'],['CAIO','102,77'],['JAILSON','105,85'],['YALC','98,48'],['ANDRÉ','96,32'],['GABRIEL','86,23'],['NICOLAS','89,63'],['CHRISTIAN','75,82'],['ADAN','83,34'],['MIKE','83,34']
]
function makeProvidedOperatorsApp(cfgs){
  const keys = Object.keys(cfgs||{})
  return providedOperatorsData.map((pair,idx)=>{
    const nome=(pair[0]||'').toUpperCase()
    const tempoStr=String(pair[1]||'').trim()
    const secs = Number(tempoStr.replace(/\./g,'').replace(/,/g,'.'))
    const timesByModel = Object.fromEntries(keys.map(k=> [k,{ '1':[], '2':[], '3':[] }]))
    const arr = Array.isArray(timesByModel['K3H']['1']) ? timesByModel['K3H']['1'] : []
    if(secs>0){ arr.push({ ts:Date.now(), dur: Math.round(secs*1000) }) }
    timesByModel['K3H']['1'] = arr
    return { id:idx+1, nome, know:'', af:'LM 3', areas:'', status:'EFETIVO', posto:String(idx+1).padStart(2,'0'), turno:'1º', timesByModel, updatedAt:Date.now() }
  })
}
function ModelsPage({modelConfigs,selectedModel,setSelectedModel,setModelConfigs}){
  const entries = Object.entries(modelConfigs||{})
  const [query,setQuery] = React.useState('')
  const [open,setOpen] = React.useState(false)
  const [form,setForm] = React.useState({ codigo:'', nome:'', tact:'', quadro:'', ib:'' })
  const [view,setView] = React.useState(null)
  const [edit,setEdit] = React.useState(null)
  const [confirm,setConfirm] = React.useState(null)
  function upAlnum(v){ return (v||'').toUpperCase().replace(/[^A-Z0-9]/g,'') }
  function digits(v){ return (v||'').replace(/[^0-9]/g,'') }
  function upAlnumSpace(v){ return (v||'').toUpperCase().replace(/[^A-Z0-9\s]/g,'') }
  function onSubmit(e){ e.preventDefault(); const codigo=upAlnum(form.codigo); const nome=upAlnumSpace(form.nome).replace(/\s+/g,' ').trim(); const tactNum=digits(form.tact); const quadroNum=digits(form.quadro); const ibNum=digits(form.ib); if(!codigo || !nome || !tactNum || !quadroNum) return; const maxV=Number(tactNum); const objV = Math.round(maxV*0.9*10)/10; const quadV = Number(quadroNum); const ibV = Math.max(0, Math.min(100, Number(ibNum || '90'))); setModelConfigs(prev=> ({ ...prev, [codigo]: { max:maxV, objective:objV, ibTarget:ibV, quadro:quadV, display:nome } })); setOpen(false); setForm({ codigo:'', nome:'', tact:'', quadro:'', ib:'' }) }
  const filtered = entries.filter(([m])=> m.toLowerCase().includes(query.toLowerCase()))
  const total = entries.length
  const ativos = entries.filter(([_,c])=> c.max!=null).length
  return React.createElement('div',{className:'space-y-4'},[
    React.createElement('div',{className:'flex items-center justify-between'},[
      React.createElement('div',{className:'text-2xl font-bold'},'Gestão de Modelos'),
      React.createElement('div',null,[
        React.createElement('button',{onClick:()=>setOpen(true),className:'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0a0f1c] text-white hover:bg-[#0b1220] shadow-md hover:shadow-lg active:scale-[.98] transition whitespace-nowrap'},[
          React.createElement('span',{className:'inline-flex items-center justify-center w-6 h-6 rounded-lg bg-white/10'},'+'),
          React.createElement('span',null,'Novo Modelo')
        ])
      ])
    ]),
    React.createElement('div',{className:'grid grid-cols-2 gap-3'},[
      React.createElement('div',{className:'bg-white rounded-xl p-3 shadow-lg flex items-center gap-3'},[
        React.createElement('div',{className:'w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center'},
          React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,className:'w-5 h-5'},[React.createElement('rect',{x:3,y:3,width:18,height:14,rx:2}),React.createElement('path',{d:'M7 7h10M7 11h10'})])
        ),
        React.createElement('div',null,[
          React.createElement('div',{className:'text-sm text-gray-600'},'Total de Modelos'),
          React.createElement('div',{className:'text-2xl font-bold'},String(total))
        ])
      ]),
      React.createElement('div',{className:'bg-white rounded-xl p-3 shadow-lg flex items-center gap-3'},[
        React.createElement('div',{className:'w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center'},
          React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,className:'w-5 h-5'},[React.createElement('circle',{cx:12,cy:12,r:9}),React.createElement('path',{d:'M12 7v5l3 3'})])
        ),
        React.createElement('div',null,[
          React.createElement('div',{className:'text-sm text-gray-600'},'Com TACT'),
          React.createElement('div',{className:'text-2xl font-bold'},String(ativos))
        ])
      ])
    ]),
    React.createElement('div',{className:'flex items-center'},[
      React.createElement('input',{value:query,onChange:e=>setQuery(e.target.value),placeholder:'Buscar por modelo...',className:'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'})
    ]),
    React.createElement('div',{className:'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'},[
      filtered.map(([m,c])=> React.createElement('div',{key:m,className:'bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition'},[
        React.createElement('div',{className:'flex items-center justify-between mb-2'},[
          React.createElement('div',null,[
            React.createElement('div',{className:'font-bold flex items-center gap-2'},[
              m,
              React.createElement('span',{className:'text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200'},`IB ${String(c.ibTarget??90)}%`)
            ]),
            React.createElement('div',{className:'text-xs text-gray-600'},c.display||'')
          ]),
          React.createElement('div',{className:'flex items-center gap-2'},[
            React.createElement('button',{onClick:()=>setView({ key:m, data:c }),title:'Ver',className:'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white hover:bg-blue-500'},
              React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,className:'w-5 h-5'},[React.createElement('path',{d:'M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7'}),React.createElement('circle',{cx:12,cy:12,r:3})])
            ),
          React.createElement('button',{onClick:()=>setEdit({ key:m, codigo:m, nome:(c.display||''), tact:String(c.max||''), quadro:String(c.quadro||''), ib:String(c.ibTarget||'') }),title:'Editar',className:'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500 text-white hover:bg-orange-400'},
              React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,className:'w-5 h-5'},[React.createElement('path',{d:'M12 20h9'}),React.createElement('path',{d:'M16.5 3.5l4 4-11 11H5.5v-4z'})])
            ),
            React.createElement('button',{onClick:()=>setConfirm({ key:m }),title:'Remover',className:'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 text-white hover:bg-red-400'},
              React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,className:'w-5 h-5'},[React.createElement('path',{d:'M3 6h18'}),React.createElement('path',{d:'M8 6V4h8v2'}),React.createElement('path',{d:'M19 6l-1 14H6L5 6'})])
            )
          ])
        ]),
        React.createElement('div',{className:'grid grid-cols-3 gap-2 mb-3'},[
          React.createElement('div',null,[React.createElement('div',{className:'text-xs text-gray-600 mb-1'},'TACT (s)'),React.createElement('div',{className:'px-3 py-2 rounded bg-gray-100'},c.max!=null? String(c.max):'-')]),
          React.createElement('div',null,[React.createElement('div',{className:'text-xs text-gray-600 mb-1'},'META (s)'),React.createElement('div',{className:'px-3 py-2 rounded bg-gray-100'},c.objective!=null? String(c.objective):'-')]),
          React.createElement('div',null,[React.createElement('div',{className:'text-xs text-gray-600 mb-1'},'QUADRO'),React.createElement('div',{className:'px-3 py-2 rounded bg-gray-100'},c.quadro!=null? String(c.quadro):'-')])
        ]),
        null
      ]))
    ]),
    React.createElement(Modal,{open,onClose:()=>setOpen(false)},[
      React.createElement('div',null,[
        React.createElement('div',{className:'text-lg font-bold mb-3'},'Novo Modelo'),
        React.createElement('form',{onSubmit:onSubmit,className:'grid grid-cols-2 gap-3'},[
          React.createElement('div',null,[
            React.createElement('label',{className:'text-sm text-gray-600'},'Código do Modelo'),
            React.createElement('input',{value:form.codigo,onChange:e=>setForm({...form,codigo:upAlnum(e.target.value)}),placeholder:'Ex.: K3H',className:'w-full border border-gray-300 rounded px-3 py-2'})
          ]),
          React.createElement('div',null,[
            React.createElement('label',{className:'text-sm text-gray-600'},'Nome do Modelo'),
            React.createElement('input',{value:form.nome,onChange:e=>setForm({...form,nome:upAlnumSpace(e.target.value)}),placeholder:'Ex.: K3H',className:'w-full border border-gray-300 rounded px-3 py-2'})
          ]),
          React.createElement('div',null,[
            React.createElement('label',{className:'text-sm text-gray-600'},'TACT (s)'),
            React.createElement('input',{value:form.tact,onChange:e=>setForm({...form,tact:digits(e.target.value)}),placeholder:'Ex.: 118',className:'w-full border border-gray-300 rounded px-3 py-2'})
          ]),
          React.createElement('div',null,[
            React.createElement('label',{className:'text-sm text-gray-600'},'Quadro (qtd. de pessoas)'),
            React.createElement('input',{value:form.quadro,onChange:e=>setForm({...form,quadro:digits(e.target.value)}),placeholder:'Ex.: 48',className:'w-full border border-gray-300 rounded px-3 py-2'})
          ]),
          React.createElement('div',null,[
            React.createElement('label',{className:'text-sm text-gray-600'},'IB (%)'),
            React.createElement('input',{value:form.ib,onChange:e=>setForm({...form,ib:digits(e.target.value)}),placeholder:'Ex.: 90',className:'w-full border border-gray-300 rounded px-3 py-2'})
          ]),
          React.createElement('div',{className:'col-span-2 flex items-center justify-end gap-2 mt-2'},[
            React.createElement('button',{type:'button',onClick:()=>{ setOpen(false); setForm({ codigo:'', nome:'', tact:'', quadro:'', ib:'' }) },className:'px-3 py-2 rounded bg-gray-200 hover:bg-gray-300'},'Cancelar'),
            React.createElement('button',{type:'submit',className:'px-3 py-2 rounded bg-blue-600 text-white'},'Cadastrar Modelo')
          ])
        ])
      ])
    ]),
        React.createElement(Modal,{open:!!view,onClose:()=>setView(null)},[
          view? React.createElement('div',null,[
            React.createElement('div',{className:'text-lg font-bold mb-3'},'Detalhes do Modelo'),
            React.createElement('div',{className:'space-y-2'},[
              React.createElement('div',null,[React.createElement('div',{className:'text-sm text-gray-600'},'Código'),React.createElement('div',null,(view.key||''))]),
              React.createElement('div',null,[React.createElement('div',{className:'text-sm text-gray-600'},'Nome'),React.createElement('div',null,(view.data?.display||''))]),
              React.createElement('div',null,[React.createElement('div',{className:'text-sm text-gray-600'},'TACT (s)'),React.createElement('div',null,String(view.data?.max??'-'))]),
              React.createElement('div',null,[React.createElement('div',{className:'text-sm text-gray-600'},'META (s)'),React.createElement('div',null,String(view.data?.objective??'-'))]),
              React.createElement('div',null,[React.createElement('div',{className:'text-sm text-gray-600'},'IB (%)'),React.createElement('div',null,String(view.data?.ibTarget??'-'))]),
              React.createElement('div',null,[React.createElement('div',{className:'text-sm text-gray-600'},'Quadro'),React.createElement('div',null,String(view.data?.quadro??'-'))])
            ]),
        React.createElement('div',{className:'flex justify-end mt-3'},[
          React.createElement('button',{onClick:()=>setView(null),className:'px-3 py-2 rounded bg-gray-200'},'Fechar')
        ])
      ]) : null
    ]),
    React.createElement(Modal,{open:!!edit,onClose:()=>setEdit(null)},[
      edit? React.createElement('div',null,[
        React.createElement('div',{className:'text-lg font-bold mb-3'},'Editar Modelo'),
        React.createElement('form',{onSubmit:(e)=>{ e.preventDefault(); const oldKey=edit.key; const codigo=upAlnum(edit.codigo||''); const newKey=codigo||oldKey; const nomeRaw=(edit.nome||''); const tactRaw=(edit.tact||''); const quadroRaw=(edit.quadro||''); const ibRaw=(edit.ib||''); const hasNome=!!nomeRaw.trim(); const hasTact=!!tactRaw.trim(); const hasQuadro=!!quadroRaw.trim(); const hasIb=!!ibRaw.trim(); const changedKey = newKey!==oldKey; if(!hasNome && !hasTact && !hasQuadro && !hasIb && !changedKey) return; const nome=hasNome? upAlnumSpace(nomeRaw).replace(/\s+/g,' ').trim() : undefined; const tact=hasTact? digits(tactRaw) : undefined; const quadro=hasQuadro? digits(quadroRaw) : undefined; const ib = hasIb? digits(ibRaw) : undefined; setModelConfigs(prev=>{ const prevCfg=prev[oldKey]||{}; const nextMax = (tact!=null && tact!=='') ? Number(tact) : prevCfg.max; const nextObj = (nextMax!=null) ? Math.round(nextMax*0.9*10)/10 : prevCfg.objective; const nextDisplay = hasNome? nome : prevCfg.display; const nextQuadro = (quadro!=null && quadro!=='') ? Number(quadro) : prevCfg.quadro; const nextIb = (ib!=null && ib!=='') ? Math.max(0, Math.min(100, Number(ib))) : (prevCfg.ibTarget ?? 90); let next = { ...prev }; if(changedKey){ delete next[oldKey] } next[newKey] = { ...prevCfg, display: nextDisplay, max: nextMax, objective: nextObj, ibTarget: nextIb, quadro: nextQuadro }; return next }); if(changedKey && typeof setSelectedModel==='function'){ if(selectedModel===oldKey) setSelectedModel(newKey) } setEdit(null) },className:'grid grid-cols-2 gap-3'},[
          React.createElement('div',null,[React.createElement('label',{className:'text-sm text-gray-600'},'Código do Modelo'),React.createElement('input',{value:edit.codigo||edit.key,onChange:e=>setEdit({...edit,codigo:upAlnum(e.target.value)}),className:'w-full border rounded px-3 py-2'})]),
          React.createElement('div',null,[React.createElement('label',{className:'text-sm text-gray-600'},'Nome'),React.createElement('input',{value:edit.nome,onChange:e=>setEdit({...edit,nome:upAlnumSpace(e.target.value)}),className:'w-full border rounded px-3 py-2'})]),
          React.createElement('div',null,[React.createElement('label',{className:'text-sm text-gray-600'},'TACT (s)'),React.createElement('input',{value:edit.tact,onChange:e=>setEdit({...edit,tact:digits(e.target.value)}),className:'w-full border rounded px-3 py-2'})]),
          React.createElement('div',null,[React.createElement('label',{className:'text-sm text-gray-600'},'Quadro (qtd. de pessoas)'),React.createElement('input',{value:edit.quadro,onChange:e=>setEdit({...edit,quadro:digits(e.target.value)}),className:'w-full border rounded px-3 py-2'})]),
          React.createElement('div',null,[React.createElement('label',{className:'text-sm text-gray-600'},'IB (%)'),React.createElement('input',{value:edit.ib,onChange:e=>setEdit({...edit,ib:digits(e.target.value)}),className:'w-full border rounded px-3 py-2'})]),
          React.createElement('div',{className:'col-span-2 flex items-center justify-end gap-2 mt-2'},[
            React.createElement('button',{type:'button',onClick:()=>setEdit(null),className:'px-3 py-2 rounded bg-gray-200'},'Cancelar'),
            React.createElement('button',{type:'submit',className:'px-3 py-2 rounded bg-blue-600 text-white'},'Salvar')
          ])
        ])
      ]) : null
    ]),
    React.createElement(Modal,{open:!!confirm,onClose:()=>setConfirm(null)},[
      confirm? React.createElement('div',null,[
        React.createElement('div',{className:'text-lg font-bold mb-3'},'Remover Modelo'),
        React.createElement('div',null,'Tem certeza que deseja remover este modelo?'),
        React.createElement('div',{className:'flex justify-end gap-2 mt-3'},[
          React.createElement('button',{onClick:()=>setConfirm(null),className:'px-3 py-2 rounded bg-gray-200'},'Cancelar'),
          React.createElement('button',{onClick:()=>{ const k=confirm.key; setModelConfigs(prev=>{ const next={ ...prev }; delete next[k]; return next }); if(selectedModel===k) setSelectedModel(''); setConfirm(null) },className:'px-3 py-2 rounded bg-red-600 text-white'},'Remover')
        ])
      ]) : null
    ])
  ])
}
function App(){
  const [page,setPage] = useState('dashboard')
  const [modelConfigs,setModelConfigs] = useState(initialModelConfigs)
  const [rows,setRows] = useState(()=> makeProvidedOperatorsApp(initialModelConfigs))
  const [selectedModel,setSelectedModel] = useState('')
  const [drawerOpen,setDrawerOpen] = useState(false)
  const [logged,setLogged] = useState(true)
  if(!logged){
    return React.createElement(LoginPage,{onSuccess:()=>{ setLogged(true); setPage('dashboard') }})
  }
  return React.createElement('div',{className:'min-h-screen overflow-x-hidden'},[
    React.createElement(Sidebar,{page,setPage,open:drawerOpen,setOpen:setDrawerOpen,key:'sidebar'}),
    drawerOpen ? React.createElement('div',{onClick:()=>setDrawerOpen(false),className:'fixed inset-0 bg-black/40 z-40'}) : null,
    React.createElement('div',{className:'p-4'},[
      React.createElement(Header,{onToggleDrawer:()=>setDrawerOpen(v=>!v),page:page,key:'header'}),
      page==='dashboard' ? React.createElement(Dashboard,{key:'dash',rows,setRows,selectedModel,setSelectedModel,modelConfigs}) : (page==='operadores' ? React.createElement(Operadores,{key:'ops',rows,setRows,selectedModel,setSelectedModel,modelConfigs}) : React.createElement(ModelsPage,{key:'mods',modelConfigs,selectedModel,setSelectedModel,setModelConfigs}))
    ])
  ])
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App))