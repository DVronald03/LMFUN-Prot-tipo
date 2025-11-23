const { useEffect } = React
function Modal({open,onClose,children}){
  useEffect(()=>{
    function onKey(e){ if(e.key==='Escape') onClose?.() }
    if(open) document.addEventListener('keydown',onKey)
    return ()=> document.removeEventListener('keydown',onKey)
  },[open])
  return React.createElement('div',{className:(open?'flex':'hidden')+' fixed inset-0 items-center justify-center bg-black/50 p-4 z-50'},[
    React.createElement('div',{className:'bg-white text-black rounded-xl p-4 w-full max-w-2xl'},children)
  ])
}