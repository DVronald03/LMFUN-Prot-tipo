function Header({onToggleDrawer,page}){
  return React.createElement('div',{className:'flex items-center justify-between mb-4 bg-gradient-to-r from-[#0a0f1c] to-[#0e1627] text-white rounded-xl px-4 py-3 shadow'},[
    React.createElement('div',{className:'flex items-center gap-3'},[
      React.createElement('button',{onClick:onToggleDrawer,className:'px-3 py-2 rounded bg-white/10 hover:bg-white/20'},'☰'),
      React.createElement('div',{className:'text-xl font-bold'},'Painel')
    ]),
    page==='dashboard' ? React.createElement('div',null,[
      React.createElement('button',{onClick:()=>{ try{ window.open('','_self') }catch(e){}; try{ window.close() }catch(e){}; try{ window.top.close() }catch(e){}; try{ window.location.href='about:blank' }catch(e){} },className:'hidden sm:inline-flex px-3 py-2 rounded bg-blue-600 hover:bg-blue-500'},'Sair')
    ]) : null
  ])
}