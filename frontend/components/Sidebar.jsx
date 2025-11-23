function Sidebar({page,setPage,open,setOpen}){
  const [upgOpen,setUpgOpen] = React.useState(true)
  return React.createElement('aside',{className:(open?'translate-x-0 ':'-translate-x-full ')+'fixed inset-y-0 left-0 w-64 z-50 bg-[#0a0f1c] text-white border-r border-white/10 p-4 transform transition-transform'},[
    React.createElement('div',{className:'flex items-center justify-between mb-6'},[
      React.createElement('div',{className:'flex items-center gap-4'},[
        React.createElement('div',{className:'w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10 bg-transparent shadow-sm transition'},
          React.createElement('img',{src:'./img/LOGO.svg',alt:'LMFUN',className:'w-full h-full object-cover'})
        ),
        React.createElement('div',{className:'font-bold tracking-wide'},[
          React.createElement('span',{className:'text-red-500'},'LM'),
          React.createElement('span',null,'FUN')
        ])
      ]),
      React.createElement('button',{onClick:()=>setOpen(false),className:'px-3 py-2 rounded bg-white/10 hover:bg-white/20'},'✕')
    ]),
    React.createElement('div',{className:'space-y-2'},[
      React.createElement('button',{onClick:()=>{ setPage('dashboard'); setOpen(false) },className:(page==='dashboard'?'bg-white/10 ':'')+'w-full flex items-center gap-2 text-left px-3 py-2 rounded hover:bg-white/10'},[
        React.createElement('span',null,'▦'),
        React.createElement('span',null,'Dashboard')
      ]),
      React.createElement('button',{onClick:()=>{ setPage('operadores'); setOpen(false) },className:(page==='operadores'?'bg-white/10 ':'')+'w-full flex items-center gap-2 text-left px-3 py-2 rounded hover:bg-white/10'},[
        React.createElement('span',null,'👤'),
        React.createElement('span',null,'Operadores')
      ]),
      React.createElement('button',{onClick:()=>{ setPage('modelos'); setOpen(false) },className:(page==='modelos'?'bg-white/10 ':'')+'w-full flex items-center gap-2 text-left px-3 py-2 rounded hover:bg-white/10'},[
        React.createElement('span',null,'🏍️'),
        React.createElement('span',null,'Modelos')
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
      ]) : null
    ])
  ])
}