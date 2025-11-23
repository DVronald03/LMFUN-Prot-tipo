function Pagination({ total=0, page=1, pageSize=5, onPageChange=()=>{} }){
  const pages = Math.max(1, Math.ceil((total||0)/pageSize))
  let visible = [page]
  if(page < pages) visible = [page, page+1]
  else if(page > 1) visible = [page-1, page]
  return React.createElement('div',{className:'flex items-center justify-end mt-3'},[
    React.createElement('div',{className:'inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-1 py-1 shadow-sm'},[
      React.createElement('button',{onClick:()=> onPageChange(Math.max(1,page-1)),disabled:page<=1,className:'px-2 py-1 rounded-lg text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed'},'‹'),
      visible.map(n=> React.createElement('button',{key:n,onClick:()=> onPageChange(n),className:(n===page?'bg-gray-100 text-gray-900 border border-gray-300 ':'text-gray-700 hover:bg-gray-50 ')+'px-3 py-1 rounded-lg'},String(n))),
      React.createElement('button',{onClick:()=> onPageChange(Math.min(pages,page+1)),disabled:page>=pages,className:'px-2 py-1 rounded-lg text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed'},'›')
    ])
  ])
}