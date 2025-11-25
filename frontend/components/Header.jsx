function Header({onToggleDrawer}){
  return React.createElement('div',{className:'flex items-center justify-between mb-4 bg-gradient-to-r from-[#0a0f1c] to-[#0e1627] text-white rounded-xl px-4 py-3 shadow'},[
    React.createElement('div',{className:'flex items-center gap-3'},[
      React.createElement('button',{onClick:onToggleDrawer,className:'px-3 py-2 rounded bg-white/10 hover:bg-white/20'},'☰'),
      React.createElement('div',{className:'text-xl font-bold'},'Painel')
    ]),
    React.createElement('div',null)
  ])
}