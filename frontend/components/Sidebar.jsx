function Sidebar({page,setPage,open,setOpen,onLogout}){
  const [upgOpen,setUpgOpen] = React.useState(true)
  const logoCandidates = [ new URL('./img/LOGO.svg', document.baseURI).toString(), new URL('../img/LOGO.svg', document.baseURI).toString() ]
  const logoSrc = logoCandidates[0]
  const fallbackSvg = 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#ffffff"/><text x="50" y="110" font-size="44" fill="#0b1220" font-family="Arial, Helvetica, sans-serif">LMFUN</text></svg>')
  return React.createElement('aside',{className:(open?'translate-x-0 ':'-translate-x-full ')+'fixed inset-y-0 left-0 w-64 z-50 bg-[#0a0f1c] text-white border-r border-white/10 p-4 transform transition-transform'},[
    React.createElement('div',{className:'flex items-center justify-between mb-6'},[
      React.createElement('div',{className:'flex items-center gap-4'},[
        React.createElement('div',{className:'w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10 bg-transparent shadow-sm transition'},
          React.createElement('img',{src:logoSrc,alt:'LMFUN',"data-try":"0",onError:(e)=>{ try{ const i=Number(e.target.dataset.try||'0'); const next = logoCandidates[i+1]; if(next){ e.target.dataset.try=String(i+1); e.target.src=next } else { e.target.onerror=null; e.target.src=fallbackSvg } }catch(_){} },className:'w-full h-full object-cover'})
        ),
        React.createElement('div',{className:'font-bold tracking-wide'},[
          React.createElement('span',{className:'text-red-500'},'LM'),
          React.createElement('span',null,'FUN')
        ])
      ]),
      React.createElement('button',{onClick:()=>setOpen(false),className:'px-3 py-2 rounded bg-white/10 hover:bg-white/20'},'✕')
    ]),
    React.createElement('div',{className:'space-y-2'},[
      React.createElement('button',{onClick:()=>{ setPage('dashboard'); setOpen(false) },className:(page==='dashboard'?'bg-white/10 ':'')+'w-full flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-white/10 group'},[
        React.createElement('span',{className:'inline-flex items-center justify-center w-7 h-7 rounded-lg text-white transition-transform group-hover:scale-105'},'▦'),
        React.createElement('span',{className:'leading-none'},'Dashboard')
      ]),
      React.createElement('button',{onClick:()=>{ setPage('operadores'); setOpen(false) },className:(page==='operadores'?'bg-white/10 ':'')+'w-full flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-white/10 group'},[
        React.createElement('span',{className:'inline-flex items-center justify-center w-7 h-7 rounded-lg transition-transform group-hover:scale-105'},'👤'),
        React.createElement('span',{className:'leading-none'},'Operadores')
      ]),
      React.createElement('button',{onClick:()=>{ setPage('modelos'); setOpen(false) },className:(page==='modelos'?'bg-white/10 ':'')+'w-full flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-white/10 group'},[
        React.createElement('span',{className:'inline-flex items-center justify-center w-7 h-7 rounded-lg transition-transform group-hover:scale-105'},'🏍️'),
        React.createElement('span',{className:'leading-none'},'Modelos')
      ])
      ,
      React.createElement('div',{className:'border-t border-white/10 my-3'}),
      React.createElement('button',{onClick:()=>setUpgOpen(v=>!v),className:'w-full flex items-center justify-between text-left px-3 py-2 rounded hover:bg-white/5'},[
        React.createElement('span',{className:'text-xs font-bold uppercase tracking-wide text-white/80'},'UPGRADE FUTURO'),
        React.createElement('span',{className:'text-white/70'}, upgOpen ? '▾' : '▸')
      ]),
      upgOpen ? React.createElement('div',{className:'space-y-2 px-2'},[
        [['📄','KOTEI HYO'],['🛠️','PADRÃO DE SERVIÇO'],['🕶️','PROCESSO EM VR']].map(([icon,label],i)=> React.createElement('button',{key:i,type:'button',disabled:true,className:'w-full flex items-center justify-between px-2 py-2 rounded hover:bg-white/5 cursor-not-allowed'},[
          React.createElement('div',{className:'flex items-center gap-2'},[
            React.createElement('span',{className:'inline-flex items-center justify-center w-6 h-6 rounded-lg bg-white/10'},icon),
            React.createElement('span',{className:'text-white/80 font-semibold uppercase text-xs'},label)
          ]),
          React.createElement('span',{className:'inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] bg-white/10 text-white/70 border border-white/10'},'EM BREVE')
        ]))
      ]) : null,
      React.createElement('div',{className:'border-t border-white/10 my-3'}),
      React.createElement('button',{onClick:onLogout,className:'w-full flex items-center gap-3 text-left px-3 py-2 rounded bg-red-600 text-white hover:bg-red-500'},[
        React.createElement('span',{className:'inline-flex items-center justify-center w-7 h-7 rounded-lg'},'⎋'),
        React.createElement('span',{className:'leading-none'},'Sair')
      ])
    ])
  ])
}