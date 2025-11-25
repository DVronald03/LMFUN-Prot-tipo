function Header({onToggleDrawer,onLogout}){
  const [confirm,setConfirm] = React.useState(false)
  return React.createElement('div',{className:'flex items-center justify-between mb-4 bg-gradient-to-r from-[#0a0f1c] to-[#0e1627] text-white rounded-xl px-4 py-3 shadow'},[
    React.createElement('div',{className:'flex items-center gap-3'},[
      React.createElement('button',{onClick:onToggleDrawer,className:'px-3 py-2 rounded bg-white/10 hover:bg-white/20'},'☰'),
      React.createElement('div',{className:'text-xl font-bold'},'Painel')
    ]),
    React.createElement('div',null,[
      React.createElement('button',{onClick:()=>setConfirm(true),className:'inline-flex px-3 py-2 rounded bg-blue-600 hover:bg-blue-500'},'Sair')
    ]),
    React.createElement(Modal,{open:confirm,onClose:()=>setConfirm(false)},[
      React.createElement('div',null,[
        React.createElement('div',{className:'text-lg font-bold mb-2'},'Confirmar saída'),
        React.createElement('div',{className:'text-sm text-gray-700 mb-3'},'Deseja encerrar a sessão e voltar para a tela de login?'),
        React.createElement('div',{className:'flex justify-end gap-2'},[
          React.createElement('button',{onClick:()=>setConfirm(false),className:'px-3 py-2 rounded bg-gray-200 hover:bg-gray-300'},'Cancelar'),
          React.createElement('button',{onClick:()=>{ onLogout?.(); setConfirm(false) },className:'px-3 py-2 rounded bg-red-600 text-white hover:bg-red-500'},'Sair')
        ])
      ])
    ])
  ])
}