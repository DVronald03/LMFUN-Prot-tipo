function LoginPage({ onSuccess }){
  const [user,setUser] = React.useState('')
  const [pass,setPass] = React.useState('')
  const [error,setError] = React.useState('')
  function submit(e){ e.preventDefault(); const u=user.trim(); const p=pass.trim(); if(u==='HDA2' && p==='Manaus@01'){ setError(''); onSuccess?.() } else { setError('Credenciais inválidas') } }
  const logoCandidates = [ new URL('./img/LOGO.svg', document.baseURI).toString(), new URL('../img/LOGO.svg', document.baseURI).toString() ]
  const logoSrc = logoCandidates[0]
  const fallbackSvg = 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#ffffff"/><text x="50" y="110" font-size="48" fill="#0b1220" font-family="Arial, Helvetica, sans-serif">LMFUN</text></svg>')
  return React.createElement('div',{className:'min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1c] to-[#0e1627] p-4 sm:p-6 lg:p-8'},[
    React.createElement('div',{className:'bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl overflow-hidden grid grid-cols-1 lg:grid-cols-2'},[
      React.createElement('div',{className:'order-2 lg:order-1 p-5 sm:p-6 md:p-8 lg:p-10'},[
        React.createElement('div',{className:'text-xl sm:text-2xl font-bold mb-4'},'Acesso'),
        error? React.createElement('div',{className:'mb-3 text-red-600 text-sm'},error) : null,
        React.createElement('form',{onSubmit:submit,className:'space-y-3'},[
          React.createElement('div',null,[React.createElement('label',{className:'text-sm text-gray-600'},'Login'),React.createElement('input',{type:'text',autoComplete:'off',value:user,onChange:e=>setUser(e.target.value),className:'w-full border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-3'})]),
          React.createElement('div',null,[React.createElement('label',{className:'text-sm text-gray-600'},'Senha'),React.createElement('input',{type:'password',autoComplete:'off',value:pass,onChange:e=>setPass(e.target.value),className:'w-full border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-3'})]),
          React.createElement('button',{type:'submit',className:'w-full px-3 py-2 md:py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-sm md:text-base'},'Entrar')
        ])
      ]),
      React.createElement('div',{className:'order-1 lg:order-2 relative bg-[#0a0f1c] text-white p-6 sm:p-8 lg:p-10 flex flex-col items-center justify-center gap-3 mb-4 lg:mb-0'},[
        React.createElement('div',{className:'text-lg sm:text-xl md:text-2xl font-bold tracking-wide'},[
          React.createElement('span',{className:'text-red-600'},'BEM'),
          React.createElement('span',null,' VINDO!')
        ]),
        React.createElement('div',{className:'w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden ring-2 ring-white/10 bg-transparent shadow-sm'},
          React.createElement('img',{src:logoSrc,alt:'LMFUN',"data-try":"0",onError:(e)=>{ try{ const i=Number(e.target.dataset.try||'0'); const next = logoCandidates[i+1]; if(next){ e.target.dataset.try=String(i+1); e.target.src=next } else { e.target.onerror=null; e.target.src=fallbackSvg } }catch(_){} },className:'w-full h-full object-cover'})
        )
      ])
    ])
  ])
}