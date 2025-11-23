function StatusPill({status}){
  const map={EFETIVO:'bg-green-100 text-green-700 border border-green-600',TEMPORÁRIO:'bg-red-100 text-red-700 border border-red-600',RL:'bg-orange-100 text-orange-700 border border-orange-500'}
  return React.createElement('span',{className:'px-2 py-1 rounded-full text-xs '+(map[status]||'')},status)
}