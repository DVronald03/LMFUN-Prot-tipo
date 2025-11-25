const { useRef,useEffect,useState } = React
function Dashboard({rows,setRows,selectedModel,setSelectedModel,modelConfigs}){
  const canvasRef = useRef(null)
  const chartBoxRef = useRef(null)
  const [chartObj,setChartObj] = useState(null)
  const [ibMedio,setIbMedio] = useState('0%')
  const [selIdx,setSelIdx] = useState(-1)
  const [tempSel,setTempSel] = useState('')
  const [turnoSel,setTurnoSel] = useState('1')
  const [running,setRunning] = useState(false)
  const [elapsed,setElapsed] = useState(0)
  const [exportOpen,setExportOpen] = useState(false)
  const [isMobile,setIsMobile] = useState(false)
  const timerRef = useRef(null)
  const startAtRef = useRef(0)
  function statusColor(r){ const s=String(r.status||'').toUpperCase(); if(s==='EFETIVO') return { bg:'#dcfce7', border:'#16a34a', text:'#166534' }; if(s==='TEMPORÁRIO') return { bg:'#fee2e2', border:'#dc2626', text:'#991b1b' }; if(s==='RL') return { bg:'#ffedd5', border:'#f97316', text:'#9a3412' }; return { bg:'#f3f4f6', border:'#9ca3af', text:'#374151' } }
  function fmt(ms){ const m=Math.floor(ms/60000); const s=Math.floor((ms%60000)/1000); const t=Math.floor((ms%1000)/100); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${t}` }
  function colorForSeconds(sec,max){
    if(!max || sec===0) return '#60a5fa'
    const ib = (sec/max)*100
    if(ib > 90) return '#ef4444'
    if(ib >= 85) return '#22c55e'
    return '#f59e0b'
  }
  function darkenColor(hex){
    const h=String(hex||'').trim();
    if(!/^#([0-9a-fA-F]{6})$/.test(h)) return hex;
    const r=parseInt(h.slice(1,3),16);
    const g=parseInt(h.slice(3,5),16);
    const b=parseInt(h.slice(5,7),16);
    const f=0.75;
    const toHex=v=> v.toString(16).padStart(2,'0');
    return '#'+toHex(Math.max(0,Math.min(255,Math.round(r*f))))+toHex(Math.max(0,Math.min(255,Math.round(g*f))))+toHex(Math.max(0,Math.min(255,Math.round(b*f))));
  }
  function start(fromZero){ if(running) return; if(!tempSel) setTempSel('1'); const base = fromZero? 0 : elapsed; startAtRef.current = Date.now()-base; setRunning(true); timerRef.current = setInterval(()=> setElapsed(Date.now()-startAtRef.current), 50) }
  function pause(){ if(!running) return; setRunning(false); clearInterval(timerRef.current) }
  function reset(){
    pause()
    if(!(selectedModel && selIdx>=0)) { setElapsed(0); return }
    const activeBucket = tempSel || '1'
    setRows(prev=>{
      const next=[...prev]
      const item=next[selIdx]||{}
      const tbm = (item.timesByModel&&typeof item.timesByModel==='object')? {...item.timesByModel} : {}
      const modelBuckets = tbm[selectedModel] || { '1':[], '2':[], '3':[] }
      modelBuckets[activeBucket] = []
      tbm[selectedModel] = modelBuckets
      next[selIdx] = { ...item, timesByModel:tbm, updatedAt:Date.now() }
      return next
    })
    setTempSel(activeBucket)
    setElapsed(0)
  }
  function clearMedia(){
    if(!(selectedModel && selIdx>=0)) { setElapsed(0); return }
    setRows(prev=>{
      const next=[...prev]
      const item=next[selIdx]||{}
      const tbm = (item.timesByModel&&typeof item.timesByModel==='object')? {...item.timesByModel} : {}
      const cur = tbm[selectedModel]||{ '1':[], '2':[], '3':[] }
      tbm[selectedModel] = { '1':[], '2':[], '3':[] }
      next[selIdx] = { ...item, timesByModel:tbm, updatedAt:Date.now() }
      return next
    })
    setElapsed(0)
  }
  function registrar(durOverride, advance=true, bucketOverride=null){
    if(!(selectedModel && selIdx>=0)) return
    const durNow = typeof durOverride==='number' ? durOverride : (running ? Date.now()-startAtRef.current : elapsed)
    pause()
    const dur = durNow
    if(dur<=0) return
    const usedBucket = bucketOverride || tempSel || '1'
    setRows(prev=>{
      const next=[...prev]
      const item=next[selIdx]||{}
      const allModels=Object.keys(modelConfigs||{})
      const baseTbm = item.timesByModel && typeof item.timesByModel==='object' ? item.timesByModel : Object.fromEntries(allModels.map(k=>[k,{ '1':[], '2':[], '3':[] }]))
      const arr = Array.isArray(baseTbm[selectedModel]?.[usedBucket]) ? baseTbm[selectedModel][usedBucket] : []
      arr.push({ ts:Date.now(), dur })
      baseTbm[selectedModel] = { ...(baseTbm[selectedModel]||{}), [usedBucket]:arr }
      next[selIdx] = { ...item, timesByModel:baseTbm, updatedAt:Date.now() }
      return next
    })
    setElapsed(0)
    if(advance){
      const nextBucket = usedBucket==='1' ? '2' : usedBucket==='2' ? '3' : null
      if(nextBucket){ setTempSel(nextBucket) }
    }
  }
  function registrarBucket(bucket){ if(!(selectedModel && selIdx>=0)) return; const b=bucket||'1'; registrar(undefined,true,b) }
  function ensureModelBuckets(){
    if(!selectedModel) return
    setRows(prev=>{
      const src = Array.isArray(prev)? prev : []
      const next = src.map(r=>{
        const tbm = r.timesByModel && typeof r.timesByModel==='object' ? { ...r.timesByModel } : {}
        if(!(selectedModel in tbm)) tbm[selectedModel] = { '1':[], '2':[], '3':[] }
        return { ...r, timesByModel: tbm }
      })
      return next
    })
  }
  function mediaBuckets(){
    if(!(selectedModel && selIdx>=0)) return
    const v=rows[selIdx]?.timesByModel?.[selectedModel]
    const activeBucket = tempSel || '1'
    if(v&&typeof v==='object'){
      const current = running ? Date.now()-startAtRef.current : elapsed
      const vals=['1','2','3'].map(k=>{
        const a=v[k]
        const last=(Array.isArray(a)&&a.length)? a[a.length-1].dur : 0
        return (k===activeBucket && current>0) ? current : last
      })
      const valid=vals.filter(x=>x>0)
      const avg=valid.length? (valid.reduce((a,b)=>a+b,0)/valid.length) : 0
      pause()
      registrar(avg,false, activeBucket)
      const nextBucket = activeBucket==='1' ? '2' : activeBucket==='2' ? '3' : null
      if(nextBucket){ setTempSel(nextBucket) }
    } else {
      pause(); setElapsed(0)
    }
  }
  useEffect(()=>()=>{ clearInterval(timerRef.current) },[])
  useEffect(()=>{
    const ctx = canvasRef.current.getContext('2d')
    const valueLabelPlugin={ id:'valueLabels', afterDatasetsDraw(chart){ const {ctx} = chart; const meta = chart.getDatasetMeta(0); const ibData = Array.isArray(chart._ib)? chart._ib : []; const ibTarget = chart._ibTarget ?? 90; const baseY = chart.scales.y.getPixelForValue(0); const exporting = chart._exporting===true; const isMob = chart._mobile===true; meta.data.forEach((bar, i)=>{ const x=bar.x; const y=bar.y; const base = (bar.base!=null ? bar.base : baseY); const top = Math.min(y, base); const bottom = Math.max(y, base); const height = bottom - top; const ib=Number(ibData[i]||0); const timeVal = chart.data.datasets[0].data[i]; const hasData = typeof timeVal==='number' && isFinite(timeVal) && timeVal>0; if(!hasData) return; const timeStr = timeVal.toFixed(2).replace('.',','); const ibColor = ib>ibTarget ? '#ef4444' : '#22c55e'; if(ib>0 && !exporting && !isMob){ ctx.save(); ctx.font='bold 11px helvetica'; ctx.textAlign='center'; ctx.fillStyle=ibColor; ctx.fillText(String(ib)+'%', x, Math.max(chart.chartArea.top+12, y-8)); if(ib>ibTarget){ ctx.strokeStyle='#ef4444'; ctx.setLineDash([4,3]); const tw = ctx.measureText(String(ib)+'%').width + 8; ctx.strokeRect(x - tw/2, Math.max(chart.chartArea.top+12, y-8) - 12, tw, 16); ctx.setLineDash([]); } ctx.restore(); }
      if(!(isMob && !exporting)){ ctx.save(); ctx.translate(x, top + height/2); ctx.rotate(-Math.PI/2); ctx.font='bold 11px helvetica'; ctx.textAlign='center'; ctx.strokeStyle='#000000'; ctx.lineWidth=4; ctx.strokeText(timeStr, 0, 0); ctx.fillStyle='#ffffff'; ctx.fillText(timeStr, 0, 0); ctx.restore(); } }) } }
    const chart = new Chart(ctx,{ type:'bar', data:{ labels:[], datasets:[
      { label:'Tempo de Processo', data:[], backgroundColor:'#22c55e', borderRadius:4, maxBarThickness:32, barThickness:32 },
      { type:'line', label:'Limite Máximo (s)', data:[], borderColor:'#ef4444', borderDash:[6,6], borderWidth:3, pointRadius:0, tension:0.3 },
      { type:'line', label:'Limite Objetivo (s)', data:[], borderColor:'#22c55e', borderDash:[3,6], borderWidth:3, pointRadius:0, tension:0.3 },
      { type:'line', label:'IB (%)', data:[], borderColor:'#f59e0b', borderWidth:3, pointRadius:4, tension:0.3, yAxisID:'y1' }
    ] }, options:{ responsive:true, maintainAspectRatio:false, interaction:{ mode:'index', intersect:false }, animation:{ duration:1200, easing:'easeOutQuart' }, animations:{ y:{ duration:1200, easing:'easeOutQuart', from:(ctx)=>{ if(ctx.type==='data' && ctx.mode==='default'){ return ctx.chart.scales.y.getPixelForValue(0) } } } }, plugins:{ tooltip:{ displayColors:false, callbacks:{ label:(ctx)=>{ const chartObj=ctx.chart; const name = Array.isArray(chartObj._names)? chartObj._names[ctx.dataIndex] : ctx.label; const val = ctx.parsed.y; if(ctx.datasetIndex===0){ return `${name}: ${val}s` } return `${ctx.dataset.label}: ${val}` } } } }, scales:{ x:{ ticks:{ autoSkip:false, maxRotation:60, minRotation:45, color:'#6B7280', font:{ weight:'bold' } } }, y:{ beginAtZero:true, grid:{ color:'#E5E7EB' } }, y1:{ position:'right', min:0, max:120, ticks:{ callback:(v)=>v+'%' }, grid:{ drawOnChartArea:false } } } }, plugins:[valueLabelPlugin] })
    setChartObj(chart)
    return ()=> chart.destroy()
  },[])
  useEffect(()=>{ ensureModelBuckets() },[selectedModel])
  useEffect(()=>{ const mq=window.matchMedia('(max-width: 640px)'); const apply=()=> setIsMobile(mq.matches); apply(); mq.addEventListener('change',apply); return ()=> mq.removeEventListener('change',apply) },[])
  useEffect(()=>{
    if(!chartObj) return
    const cfg = (modelConfigs||{})[selectedModel]||{}
    const max = cfg.max
    const obj = cfg.objective
    const src = Array.isArray(rows)? rows : []
    const turnoVal = turnoSel==='2' ? '2º' : '1º'
    const srcByTurno = turnoSel ? src.filter(r=> String(r.turno||'')===turnoVal) : src
    const quota = (typeof cfg.quadro==='number' && cfg.quadro>0) ? Math.min(cfg.quadro, srcByTurno.length) : srcByTurno.length
    const viewRows = srcByTurno.slice(0,quota)
    const names = viewRows.map(r=> (r.nome||'').split(' ')[0])
    const labels = isMobile ? viewRows.map(()=> '') : names.map(n=> String(n).toUpperCase())
    const tempos = viewRows.map(r=> {
      const v = r.timesByModel && r.timesByModel[selectedModel]
      if(Array.isArray(v)){
        const last = (v[v.length-1]?.dur) || 0
        return Number((last/1000).toFixed(2))
      }
      if(v && typeof v==='object'){
        const vals = ['1','2','3']
          .map(k=>{ const a=v[k]; const last=(Array.isArray(a)&&a.length)? a[a.length-1].dur : 0; return last })
          .filter(x=> x>0)
        const avgMs = vals.length? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0
        return Number((avgMs/1000).toFixed(2))
      }
      return 0
    })
    const maxLine = labels.map(()=> (max!=null? max : null))
    const objLine = labels.map(()=> (obj!=null? obj : null))
    const colors = tempos.map(t=>{
      if(!max || t===0) return '#60a5fa'
      const ib = (t/max)*100
      if(ib > 90) return '#ef4444'
      if(ib >= 85) return '#22c55e'
      return '#f59e0b'
    })
    const selectedRow = (selIdx>=0 ? src[selIdx] : null)
    const selectedIdxInView = selectedRow ? viewRows.indexOf(selectedRow) : -1
    const bgColors = colors.map((c,i)=> i===selectedIdxInView ? darkenColor(c) : c)
    const borderColors = colors.map((c,i)=> i===selectedIdxInView ? '#2563eb' : c)
    const borderWidths = colors.map((_,i)=> i===selectedIdxInView ? 3 : 0)
    if(selectedIdxInView>=0){ chartObj.setActiveElements([{ datasetIndex:0, index:selectedIdxInView }]) } else { chartObj.setActiveElements([]) }
    const ib = tempos.map(t=> (max? Math.round(t/max*100) : 0))
    chartObj.data.labels = labels
    chartObj._names = names
    chartObj._ib = ib
    chartObj._ibTarget = (modelConfigs?.[selectedModel]?.ibTarget ?? 90)
    chartObj.data.datasets[0].data = tempos
    chartObj.data.datasets[0].backgroundColor = bgColors
    chartObj.data.datasets[0].borderColor = borderColors
    chartObj.data.datasets[0].borderWidth = borderWidths
    chartObj.data.datasets[1].data = maxLine
    chartObj.data.datasets[2].data = objLine
    chartObj.data.datasets[3].data = ib
    try{
      const ds0 = chartObj.data?.datasets?.[0]||{}
      const d3 = chartObj.data?.datasets?.[3]||{}
      if(chartObj.options?.scales?.x?.ticks){ chartObj.options.scales.x.ticks.maxRotation = 40; chartObj.options.scales.x.ticks.minRotation = 0; chartObj.options.scales.x.ticks.autoSkip = false; chartObj.options.scales.x.ticks.display = !isMobile }
      if(ds0){ if(isMobile){ ds0.barThickness=undefined; ds0.maxBarThickness=24; ds0.barPercentage=0.5; ds0.categoryPercentage=0.6 } else { ds0.barThickness=undefined; ds0.maxBarThickness=18; ds0.barPercentage=0.6; ds0.categoryPercentage=0.7 } }
      if(d3){ d3.pointRadius=0; d3.borderWidth=2 }
      const labelsLen = Array.isArray(labels)? labels.length : 0
      const perBar = isMobile ? 44 : 68
      const minW = labelsLen*perBar + 80
      const boxW = chartBoxRef.current ? chartBoxRef.current.clientWidth : chartObj.width
      const boxH = chartBoxRef.current ? chartBoxRef.current.clientHeight : chartObj.height
      const targetW = Math.max(boxW, minW)
      chartObj._mobile = isMobile
      if(typeof chartObj.resize==='function'){ chartObj.resize(targetW, boxH) }
    }catch(_){}
    chartObj.update()
    const valid = ib.filter(v=> v>0)
    const media = valid.length? Math.round(valid.reduce((a,b)=>a+b,0)/valid.length) : 0
    setIbMedio(media+'%')
  },[chartObj,rows,selectedModel,modelConfigs,selIdx,turnoSel,isMobile])
  useEffect(()=>{
    function onOrient(){
      try{
        if(!chartObj) return
        const labelsLen = Array.isArray(chartObj.data?.labels)? chartObj.data.labels.length : 0
        const perBar = (chartObj._mobile===true) ? 44 : 68
        const minW = labelsLen*perBar + 80
        const boxW = chartBoxRef.current ? chartBoxRef.current.clientWidth : chartObj.width
        const boxH = chartBoxRef.current ? chartBoxRef.current.clientHeight : chartObj.height
        const targetW = Math.max(boxW, minW)
        if(typeof chartObj.resize==='function'){ chartObj.resize(targetW, boxH); chartObj.update() }
        const src = Array.isArray(rows)? rows : []
        const turnoVal = turnoSel==='2' ? '2º' : '1º'
        const srcByTurno = turnoSel ? src.filter(r=> String(r.turno||'')===turnoVal) : src
        const cfg = (modelConfigs||{})[selectedModel]||{}
        const quota = (typeof cfg.quadro==='number' && cfg.quadro>0) ? Math.min(cfg.quadro, srcByTurno.length) : srcByTurno.length
        const viewRows = srcByTurno.slice(0,quota)
        const selectedRow = (selIdx>=0 ? src[selIdx] : null)
        const idxInView = selectedRow ? viewRows.indexOf(selectedRow) : -1
        if(idxInView<0) return
        const meta = chartObj.getDatasetMeta(0)
        const el = meta && meta.data ? meta.data[idxInView] : null
        if(!el) return
        const x = el.x
        const box = chartBoxRef.current
        if(!box) return
        const target = Math.max(0, Math.floor(x - box.clientWidth/2))
        box.scrollTo({ left: target, behavior:'smooth' })
      }catch(_){ }
    }
    window.addEventListener('orientationchange', onOrient)
    return ()=> window.removeEventListener('orientationchange', onOrient)
  },[chartObj,rows,selectedModel,modelConfigs,selIdx,turnoSel])
  useEffect(()=>{
    try{
      if(!chartObj || !isMobile) return
      const src = Array.isArray(rows)? rows : []
      const turnoVal = turnoSel==='2' ? '2º' : '1º'
      const srcByTurno = turnoSel ? src.filter(r=> String(r.turno||'')===turnoVal) : src
      const cfg = (modelConfigs||{})[selectedModel]||{}
      const quota = (typeof cfg.quadro==='number' && cfg.quadro>0) ? Math.min(cfg.quadro, srcByTurno.length) : srcByTurno.length
      const viewRows = srcByTurno.slice(0,quota)
      const selectedRow = (selIdx>=0 ? src[selIdx] : null)
      const idxInView = selectedRow ? viewRows.indexOf(selectedRow) : -1
      if(idxInView<0) return
      const meta = chartObj.getDatasetMeta(0)
      const el = meta && meta.data ? meta.data[idxInView] : null
      if(!el) return
      const x = el.x
      const box = chartBoxRef.current
      if(!box) return
      const target = Math.max(0, Math.floor(x - box.clientWidth/2))
      box.scrollTo({ left: target, behavior:'smooth' })
    }catch(_){ }
  },[chartObj,selIdx,turnoSel,selectedModel,isMobile,rows])
  useEffect(()=>{
    function onResize(){ try{ if(!chartObj) return; const labelsLen = Array.isArray(chartObj.data?.labels)? chartObj.data.labels.length : 0; const perBar = (chartObj._mobile===true) ? 44 : 68; const minW = labelsLen*perBar + 80; const boxW = chartBoxRef.current ? chartBoxRef.current.clientWidth : chartObj.width; const boxH = chartBoxRef.current ? chartBoxRef.current.clientHeight : chartObj.height; const targetW = Math.max(boxW, minW); if(typeof chartObj.resize==='function'){ chartObj.resize(targetW, boxH); chartObj.update() } }catch(_){ } }
    window.addEventListener('resize', onResize)
    return ()=> window.removeEventListener('resize', onResize)
  },[chartObj])
  function exportPdf(){
    try{
      const { jsPDF } = window.jspdf
      const doc = new jsPDF({ orientation:'landscape', unit:'pt', format:'a4' })
      const canvas = canvasRef.current
      
      const pageW = doc.internal.pageSize.getWidth()
      const pageH = doc.internal.pageSize.getHeight()
      const margin = 24
      const cfg = (modelConfigs||{})[selectedModel]||{}
      const tact = cfg.max!=null ? String(cfg.max)+'"' : '-'
      const headerLeft = margin
      const headerTop = 28
      doc.setFont('helvetica','bolditalic')
      doc.setFontSize(18)
      doc.setTextColor(0,0,0)
      const turnoLabel = (typeof turnoSel==='string' && turnoSel==='2') ? '2º TURNOS' : '1º TURNOS'
      const headerMsg = `BALANCEAMENTO DO MODELO: ${String(selectedModel||'').toUpperCase()} (LM FUN) ${turnoLabel} • IB ALVO ${String(cfg.ibTarget??90)}%`
      doc.text(headerMsg, headerLeft, headerTop)
      const imgY = headerTop + 24
      const availW = Math.floor(pageW - margin*2)
      const availH = Math.floor(pageH - imgY - margin)
      const prevW = chartObj.width
      const prevH = chartObj.height
      const ds0 = chartObj.data?.datasets?.[0]||{}
      const prevBT = ds0.barThickness
      const prevMBT = ds0.maxBarThickness
      const prevBP = ds0.barPercentage
      const prevCP = ds0.categoryPercentage
      const prevLabels = Array.isArray(chartObj.data.labels) ? [...chartObj.data.labels] : []
      const prevTickMax = chartObj.options?.scales?.x?.ticks?.maxRotation
      const prevTickMin = chartObj.options?.scales?.x?.ticks?.minRotation
      const prevAutoSkip = chartObj.options?.scales?.x?.ticks?.autoSkip
      const d3 = chartObj.data?.datasets?.[3]||{}
      const prevPR = d3.pointRadius
      const prevBW = d3.borderWidth
      const prevTooltipEnabled = chartObj.options?.plugins?.tooltip?.enabled
      chartObj._exporting = true
      try{
        const src = Array.isArray(rows)? rows : []
        const turnoValExp = turnoSel==='2' ? '2º' : '1º'
        const srcByTurnoExp = turnoSel ? src.filter(r=> String(r.turno||'')===turnoValExp) : src
        const cfgExp = (modelConfigs||{})[selectedModel]||{}
        const quotaExp = (typeof cfgExp.quadro==='number' && cfgExp.quadro>0) ? Math.min(cfgExp.quadro, srcByTurnoExp.length) : srcByTurnoExp.length
        const viewRowsExp = srcByTurnoExp.slice(0,quotaExp)
        const namesExp = viewRowsExp.map(r=> (r.nome||'').split(' ')[0])
        const labelsExp = namesExp.map(n=> String(n).toUpperCase())
        const temposExp = viewRowsExp.map(r=> { const v=r.timesByModel && r.timesByModel[selectedModel]; if(Array.isArray(v)){ const last=(v[v.length-1]?.dur)||0; return Number((last/1000).toFixed(2)) } if(v&&typeof v==='object'){ const vals=['1','2','3'].map(k=>{ const a=v[k]; const last=(Array.isArray(a)&&a.length)? a[a.length-1].dur : 0; return last }).filter(x=>x>0); const avgMs = vals.length? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0; return Number((avgMs/1000).toFixed(2)) } return 0 })
        const maxLineExp = labelsExp.map(()=> (cfgExp.max!=null? cfgExp.max : null))
        const objLineExp = labelsExp.map(()=> (cfgExp.objective!=null? cfgExp.objective : null))
        const ibExp = temposExp.map(t=> (cfgExp.max? Math.round(t/cfgExp.max*100) : 0))
        chartObj.data.labels = labelsExp
        chartObj._names = namesExp
        chartObj.data.datasets[0].data = temposExp
        chartObj.data.datasets[1].data = maxLineExp
        chartObj.data.datasets[2].data = objLineExp
        chartObj.data.datasets[3].data = ibExp
        if(chartObj.options?.scales?.x?.ticks){ chartObj.options.scales.x.ticks.maxRotation = 40; chartObj.options.scales.x.ticks.minRotation = 0; chartObj.options.scales.x.ticks.autoSkip = false }
        if(ds0){ ds0.barThickness=undefined; ds0.maxBarThickness=16; ds0.barPercentage=0.6; ds0.categoryPercentage=0.7 }
        if(d3){ d3.pointRadius=0; d3.borderWidth=2 }
        if(chartObj.options?.plugins?.tooltip){ chartObj.options.plugins.tooltip.enabled = false }
        if(chartObj.tooltip && typeof chartObj.tooltip.setActiveElements==='function'){ chartObj.tooltip.setActiveElements([]) }
        if(typeof chartObj.resize==='function'){ chartObj.resize(availW, availH) }
        chartObj.update()
      }catch(_){}
      const imgData = chartObj.toBase64Image('image/png',1)
      const imgX = margin
      const innerW = availW
      const innerH = availH
      const innerY = imgY
      doc.addImage(imgData,'PNG',imgX,innerY,innerW,innerH)
      try{
        chartObj.data.labels = prevLabels
        if(chartObj.options?.scales?.x?.ticks){ chartObj.options.scales.x.ticks.maxRotation = prevTickMax; chartObj.options.scales.x.ticks.minRotation = prevTickMin; chartObj.options.scales.x.ticks.autoSkip = prevAutoSkip }
        if(ds0){ ds0.barThickness=prevBT; ds0.maxBarThickness=prevMBT; ds0.barPercentage=prevBP; ds0.categoryPercentage=prevCP }
        if(d3){ d3.pointRadius=prevPR; d3.borderWidth=prevBW }
        if(chartObj.options?.plugins?.tooltip){ chartObj.options.plugins.tooltip.enabled = prevTooltipEnabled }
        chartObj._exporting = false
        if(typeof chartObj.resize==='function'){ chartObj.resize(prevW, prevH) }
        chartObj.update()
      }catch(_){}
      doc.setFont('helvetica','normal')
      doc.setFontSize(12)
      doc.text('IB Médio: '+ibMedio,margin,pageH - margin)
      doc.save('dashboard.pdf')
    }catch(e){
      const a=document.createElement('a'); a.href=chartObj.toBase64Image(); a.download='dashboard.png'; a.click()
    }
  }
  async function exportPng(){
    try{
      const canvas = canvasRef.current
      if(!chartObj || !canvas) return
      const prevW = chartObj.width
      const prevH = chartObj.height
      const targetW = 1920
      const targetH = Math.round(targetW/4)
      const ds0 = chartObj.data?.datasets?.[0]||{}
      const prevBT = ds0.barThickness
      const prevMBT = ds0.maxBarThickness
      const prevBP = ds0.barPercentage
      const prevCP = ds0.categoryPercentage
      const prevBordColor = ds0.borderColor
      const prevBordWidth = ds0.borderWidth
      const src = Array.isArray(rows)? rows : []
      const turnoVal = turnoSel==='2' ? '2º' : '1º'
      const srcByTurno = turnoSel ? src.filter(r=> String(r.turno||'')===turnoVal) : src
      const cfgTmp = (modelConfigs||{})[selectedModel]||{}
      const quotaTmp = (typeof cfgTmp.quadro==='number' && cfgTmp.quadro>0) ? Math.min(cfgTmp.quadro, srcByTurno.length) : srcByTurno.length
      const viewRowsTmp = srcByTurno.slice(0,quotaTmp)
      const selectedRowTmp = (selIdx>=0 ? src[selIdx] : null)
      const selectedIdxInViewTmp = selectedRowTmp ? viewRowsTmp.indexOf(selectedRowTmp) : -1
      const prevLabels = Array.isArray(chartObj.data.labels) ? [...chartObj.data.labels] : []
      const prevTickMax = chartObj.options?.scales?.x?.ticks?.maxRotation
      const prevTickMin = chartObj.options?.scales?.x?.ticks?.minRotation
      const prevAutoSkip = chartObj.options?.scales?.x?.ticks?.autoSkip
      const prevTooltipEnabled = chartObj.options?.plugins?.tooltip?.enabled
      chartObj._exporting = true
      try{ const cfgExp = (modelConfigs||{})[selectedModel]||{}; const namesExp = viewRowsTmp.map(r=> (r.nome||'').split(' ')[0]); const labelsExp = namesExp.map(n=> String(n).toUpperCase()); const temposExp = viewRowsTmp.map(r=> { const v=r.timesByModel && r.timesByModel[selectedModel]; if(Array.isArray(v)){ const last=(v[v.length-1]?.dur)||0; return Number((last/1000).toFixed(2)) } if(v&&typeof v==='object'){ const vals=['1','2','3'].map(k=>{ const a=v[k]; const last=(Array.isArray(a)&&a.length)? a[a.length-1].dur : 0; return last }).filter(x=> x>0); const avgMs = vals.length? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0; return Number((avgMs/1000).toFixed(2)) } return 0 }); const maxLineExp = labelsExp.map(()=> (cfgExp.max!=null? cfgExp.max : null)); const objLineExp = labelsExp.map(()=> (cfgExp.objective!=null? cfgExp.objective : null)); const ibExp = temposExp.map(t=> (cfgExp.max? Math.round(t/cfgExp.max*100) : 0)); chartObj.data.labels = labelsExp; chartObj._names = namesExp; chartObj.data.datasets[0].data = temposExp; chartObj.data.datasets[1].data = maxLineExp; chartObj.data.datasets[2].data = objLineExp; chartObj.data.datasets[3].data = ibExp; if(chartObj.options?.scales?.x?.ticks){ chartObj.options.scales.x.ticks.maxRotation = 40; chartObj.options.scales.x.ticks.minRotation = 0; chartObj.options.scales.x.ticks.autoSkip = false } if(ds0){ ds0.barThickness=undefined; ds0.maxBarThickness=18; ds0.barPercentage=0.6; ds0.categoryPercentage=0.7; const len = Array.isArray(chartObj.data.labels)? chartObj.data.labels.length : 0; ds0.borderColor = len? Array(len).fill('transparent') : 'transparent'; ds0.borderWidth = len? Array(len).fill(0) : 0 } chartObj.setActiveElements([]); if(typeof chartObj.resize==='function'){ chartObj.resize(targetW,targetH) } }catch(_){}
      try{ if(chartObj.options?.plugins?.tooltip){ chartObj.options.plugins.tooltip.enabled = false } if(chartObj.tooltip && typeof chartObj.tooltip.setActiveElements==='function'){ chartObj.tooltip.setActiveElements([]) } }catch(_){}
      chartObj.update('none')
      await new Promise(r=> requestAnimationFrame(r))
      const headerH = 110
      const out = document.createElement('canvas')
      out.width = targetW
      out.height = targetH + headerH
      const octx = out.getContext('2d')
      octx.fillStyle = '#ffffff'
      octx.fillRect(0,0,out.width,out.height)
      octx.fillStyle = '#000000'
      octx.font = 'bold 24px Helvetica'
      const turnoLabel2 = (typeof turnoSel==='string' && turnoSel==='2') ? '2º TURNOS' : '1º TURNOS'
      const cfg2 = (modelConfigs||{})[selectedModel]||{}
      const headerMsg2 = `BALANCEAMENTO DO MODELO: ${String(selectedModel||'').toUpperCase()} (LM FUN) ${turnoLabel2} • IB ALVO ${String(cfg2.ibTarget??90)}%`
      octx.fillText(headerMsg2, 20, 40)
      const ibn = Number(String(ibMedio||'0').replace(/[^0-9]/g,''))
      const t = (cfg2.ibTarget??90)
      const isGood = ibn<=t && ibn>0
      const badgeBg = isGood? '#dcfce7' : '#fee2e2'
      const badgeStroke = isGood? '#86efac' : '#fecaca'
      const badgeText = isGood? '#166534' : '#991b1b'
      const badgeTextStr = `IB Atual ${String(ibMedio||'0%')}`
      octx.font = 'bold 22px Helvetica'
      const tw = Math.ceil(octx.measureText(badgeTextStr).width)
      const bw = tw + 28
      const bh = 40
      const bx = out.width - bw - 20
      const by = 20
      octx.fillStyle = badgeBg
      octx.strokeStyle = badgeStroke
      octx.lineWidth = 2
      ;(function roundedRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); ctx.fill(); ctx.stroke(); })(octx,bx,by,bw,bh,20)
      octx.fillStyle = badgeText
      octx.textAlign = 'center'
      octx.textBaseline = 'middle'
      octx.fillText(badgeTextStr, bx + bw/2, by + bh/2)
      octx.drawImage(canvas, 0, headerH, targetW, targetH)
      const data = out.toDataURL('image/png')
      try{ const a=document.createElement('a'); a.href=data; a.download=`dashboard_${String(selectedModel||'modelo')}.png`; a.rel='noopener'; a.target='_blank'; document.body.appendChild(a); a.click(); setTimeout(()=>{ try{ document.body.removeChild(a) }catch(_){ } },0) }catch(_){ try{ window.open(data,'_blank') }catch(__){} }
      try{ chartObj.data.labels = prevLabels; if(chartObj.options?.scales?.x?.ticks){ chartObj.options.scales.x.ticks.maxRotation = prevTickMax; chartObj.options.scales.x.ticks.minRotation = prevTickMin; chartObj.options.scales.x.ticks.autoSkip = prevAutoSkip } if(ds0){ ds0.barThickness=prevBT; ds0.maxBarThickness=prevMBT; ds0.barPercentage=prevBP; ds0.categoryPercentage=prevCP; ds0.borderColor = prevBordColor; ds0.borderWidth = prevBordWidth } chartObj._exporting = false; if(selectedIdxInViewTmp>=0){ chartObj.setActiveElements([{ datasetIndex:0, index:selectedIdxInViewTmp }]) } if(typeof chartObj.resize==='function'){ chartObj.resize(prevW,prevH) } }catch(_){}
      try{ if(chartObj.options?.plugins?.tooltip){ chartObj.options.plugins.tooltip.enabled = prevTooltipEnabled } }catch(_){}
      chartObj.update('none')
    }catch(e){ const a=document.createElement('a'); a.href=chartObj.toBase64Image(); a.download='dashboard.png'; a.click() }
  }
  return React.createElement('div',{className:'grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-3 lg:gap-4'},[
    React.createElement('div',{className:'space-y-6'},[
      React.createElement('div',{className:'bg-white rounded-xl p-4 overflow-hidden shadow-lg'},[
        React.createElement('div',{className:'text-xl font-bold mb-2 text-gray-900'},'Matriz de Dados'),
        React.createElement('div',{className:'grid grid-cols-1 gap-3 mb-3'},[
          React.createElement('div',null,[
            React.createElement('div',{className:'text-[10px] uppercase tracking-wide text-gray-600 mb-1 font-semibold'},'Nome do Operador'),
            React.createElement('input',{value:((rows[selIdx]?.nome||'').split(' ')[0]),readOnly:true,placeholder:'Selecione...',className:'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'})
          ]),
          (()=>{ const cfg=(modelConfigs||{})[selectedModel]||{}; const src=Array.isArray(rows)? rows : []; const turnoVal = turnoSel==='2' ? '2º' : '1º'; const srcByTurno = turnoSel ? src.filter(r=> String(r.turno||'')===turnoVal) : src; const quota=(typeof cfg.quadro==='number' && cfg.quadro>0)? Math.min(cfg.quadro, srcByTurno.length) : srcByTurno.length; const viewRows = srcByTurno.slice(0,quota); const options = viewRows.map(r=>({ idx:src.indexOf(r), posto:String(r.posto||'').padStart(2,'0'), nome:(r.nome||'') })); const currentIdxInView = selIdx>=0 ? options.find(o=> o.idx===selIdx)?.idx ?? -1 : -1; return React.createElement('div',null,[
            React.createElement('div',{className:'text-[10px] uppercase tracking-wide text-gray-600 mb-1 font-semibold'},'Posto'),
            isMobile ? React.createElement('select',{value:(currentIdxInView>=0? String(currentIdxInView) : ''),onChange:e=>{ const v=e.target.value; setSelIdx(v? Number(v) : -1) },className:'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none'},[
              React.createElement('option',{value:''},'Selecione o posto...'),
              options.map(o=> React.createElement('option',{key:o.idx,value:String(o.idx)},`${o.posto} — ${(o.nome.split(' ')[0]||'').toUpperCase()}`))
            ]) : React.createElement('input',{value:String((rows[selIdx]?.posto||'')).padStart(2,'0'),readOnly:true,placeholder:'--',className:'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'})
          ]) })(),
          React.createElement('div',null,[
            React.createElement('div',{className:'text-[10px] uppercase tracking-wide text-gray-600 mb-1 font-semibold'},'Modelo'),
            React.createElement('select',{value:(selectedModel||''),onChange:e=>setSelectedModel(e.target.value),className:'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none'},[
              React.createElement('option',{value:'',disabled:true},'Selecione o modelo'),
              Object.keys(modelConfigs||{}).map(m=> React.createElement('option',{key:m,value:m},m))
            ])
          ]),
          (()=>{ const cfg=(modelConfigs||{})[selectedModel]||{}; const max=cfg.max||0; const v=rows[selIdx]?.timesByModel?.[selectedModel]; const vals=['1','2','3'].map(k=>{ const a=v?.[k]; const last=(Array.isArray(a)&&a.length)? a[a.length-1].dur : 0; return last }).filter(x=>x>0); const avgMs = vals.length? (vals.reduce((a,b)=>a+b,0)/vals.length) : 0; const avgSec = avgMs? (avgMs/1000).toFixed(1) : '0.0'; return React.createElement('div',{className:'grid grid-cols-2 gap-2'},[
            React.createElement('div',null,[React.createElement('div',{className:'text-[10px] uppercase tracking-wide text-gray-600 mb-1 font-semibold'},'TACT (s)'),React.createElement('input',{value:String(max||0),readOnly:true,className:'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'})]),
            React.createElement('div',null,[React.createElement('div',{className:'text-[10px] uppercase tracking-wide text-gray-600 mb-1 font-semibold'},'Tempo realizado (s)'),React.createElement('input',{value:String(avgSec),readOnly:true,className:'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'})])
          ]) })()
        ]),
        React.createElement('div',{className:'flex items-center gap-2'},[
          React.createElement('button',{onClick:()=>{ if(elapsed>0) registrar(); else mediaBuckets() },disabled:!(selectedModel && selIdx>=0),className:'px-3 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed'},'Registrar'),
          React.createElement('button',{onClick:clearMedia,className:'px-3 py-2 rounded bg-gray-200 hover:bg-gray-300'},'Limpar')
        ])
      ]),
      React.createElement('div',{className:'bg-white rounded-xl p-4 overflow-hidden shadow-lg'},[
        React.createElement('div',{className:'text-xl font-bold mb-2 text-gray-900'},'Tempo de Processo'),
        React.createElement('div',{className:'flex items-center gap-2 mb-2'},[
          React.createElement('div',{className:'rounded-lg bg-gray-100 px-4 py-2 font-mono text-lg'},fmt(elapsed)),
          React.createElement('button',{onClick:()=>start(true),disabled:!(selectedModel && selIdx>=0),className:'px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'},'Iniciar'),
          React.createElement('button',{onClick:mediaBuckets,disabled:!(selectedModel && selIdx>=0),className:'px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'},'Média'),
          React.createElement('button',{onClick:reset,className:'px-3 py-2 rounded bg-gray-200 hover:bg-gray-300'},'Zerar')
        ]),
        React.createElement('div',{className:'text-xs text-gray-600 mb-2'},'MÉDIA SELECIONADA: '+String(tempSel||'1')),
        React.createElement('div',{className:'grid grid-cols-3 gap-4'},[
          ['1','2','3'].map((k,idx)=> React.createElement('div',{key:k,className:'bg-gray-100 rounded-xl p-3 text-center'},[
            React.createElement('div',{className:'text-xs text-gray-600 mb-1'},`MED. ${idx+1}`),
            (()=>{ const cfg=(modelConfigs||{})[selectedModel]||{}; const max=cfg.max; const v=rows[selIdx]?.timesByModel?.[selectedModel]; const isRunningActive = running && tempSel===k; const highlight = tempSel===k; const lastMs = (v && typeof v==='object' && Array.isArray(v[k]) && v[k].length)? v[k][v[k].length-1].dur : 0; const msVal = isRunningActive ? elapsed : lastMs; const sec = Math.floor(msVal/1000); const col = colorForSeconds(sec, max); const txt = sec>0 ? String(sec) : '-'; const style={borderColor:col, backgroundColor:col+'26'}; if(highlight){ style.boxShadow='0 0 0 3px rgba(59,130,246,0.5)'; } return React.createElement('div',{onClick:()=>{ if(selectedModel && selIdx>=0) setTempSel(k) },className:'cursor-pointer w-14 h-14 rounded-full mx-auto border-2 flex items-center justify-center',style},
               React.createElement('span',{onClick:(e)=>{ e.stopPropagation(); registrarBucket(k) },style:{color:col, fontWeight:'600'}},txt)
             ) })()
          ]))
        ])
      ])
    ]),
    React.createElement('div',{className:'space-y-4 h-full overflow-hidden flex flex-col'},[
      React.createElement('div',{className:'bg-white rounded-xl p-4 shadow-lg'},[
      React.createElement('div',{className:'flex flex-wrap items-center justify-between gap-2 mb-2'},[
        React.createElement('div',{className:'flex items-center flex-wrap gap-2'},[
          React.createElement('div',{className:'font-bold'},'DASHBOARD'),
          React.createElement('span',{className:'border border-gray-300 rounded px-3 py-1.5 bg-gray-100 text-gray-900 font-mono text-sm whitespace-nowrap'},String(selectedModel||'--')),
          React.createElement('select',{value:turnoSel,onChange:e=>setTurnoSel(e.target.value),className:'border border-gray-300 rounded px-3 py-1.5 bg-white text-gray-900 w-40 text-sm'},[
            React.createElement('option',{value:'1'},'1º turno'),
            React.createElement('option',{value:'2'},'2º turno')
          ]),
          (()=>{ const t=(modelConfigs?.[selectedModel]?.ibTarget ?? 90); return React.createElement('span',{className:'text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap'},`IB Alvo ${String(t)}%`) })(),
          (()=>{ const ibn=Number(String(ibMedio||'0').replace(/[^0-9]/g,'')); const t=(modelConfigs?.[selectedModel]?.ibTarget ?? 90); const cls = (ibn<=t) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'; return React.createElement('span',{className:'text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap '+cls},`IB Atual ${String(ibMedio||'0%')}`) })()
        ]),
        React.createElement('div',{className:'flex items-center gap-2'},[
          React.createElement('div',{className:'relative hidden sm:block'},[
            React.createElement('button',{onClick:()=>setExportOpen(v=>!v),className:'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm shadow-sm transition whitespace-nowrap'},'Exportar'),
            exportOpen ? React.createElement('div',{className:'absolute right-0 mt-1 w-40 rounded-lg border border-gray-200 bg-white shadow-lg z-10'},[
              React.createElement('button',{onClick:()=>{ setExportOpen(false); exportPng() },className:'block w-full text-left px-3 py-2 hover:bg-gray-50'},'PNG')
            ]) : null
          ]),
          React.createElement('button',{onClick:()=>exportPng(),className:'sm:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm shadow-sm transition whitespace-nowrap'},'Exportar')
        ])
      ]),
      React.createElement('div',{ref:chartBoxRef,className:'h-64 sm:h-72 md:h-80 lg:h-[42vh] overflow-x-auto'},[
        React.createElement('canvas',{ref:canvasRef})
      ])
      , isMobile ? (()=>{ const cfg=(modelConfigs||{})[selectedModel]||{}; const src=Array.isArray(rows)? rows : []; const turnoVal = turnoSel==='2' ? '2º' : '1º'; const srcByTurno = turnoSel ? src.filter(r=> String(r.turno||'')===turnoVal) : src; const quota=(typeof cfg.quadro==='number' && cfg.quadro>0)? Math.min(cfg.quadro, srcByTurno.length) : srcByTurno.length; const viewRows = srcByTurno.slice(0,quota); return React.createElement('div',{className:'mt-2 overflow-x-auto'},[
        React.createElement('div',{className:'flex items-center gap-2 w-max'},[
          viewRows.map(r=>{ const idx=src.indexOf(r); const selected = selIdx===idx; const cls = 'inline-flex items-center justify-center px-3 py-2 rounded-lg border text-base '+(selected? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-800'); return React.createElement('button',{key:idx,onClick:()=>setSelIdx(idx),className:cls},String((r.posto||'')).padStart(2,'0')) })
        ])
      ]) })() : null
      ]),
      (()=>{ const cfg=(modelConfigs||{})[selectedModel]||{}; const src=Array.isArray(rows)? rows : []; const turnoVal = turnoSel==='2' ? '2º' : '1º'; const srcByTurno = turnoSel ? src.filter(r=> String(r.turno||'')===turnoVal) : src; const quota=(typeof cfg.quadro==='number' && cfg.quadro>0)? Math.min(cfg.quadro, srcByTurno.length) : srcByTurno.length; const viewRows = srcByTurno.slice(0,quota); if(isMobile){ return null } return React.createElement('div',{className:'bg-white rounded-xl p-3 shadow-lg flex-1'},[
        React.createElement('div',{className:'text-xl font-bold mb-1 text-gray-900'},'Posto'),
        React.createElement('div',{className:'grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-x-2 gap-y-2'},[
          viewRows.map(r=>{ const c=statusColor(r); const idx=src.indexOf(r); const selected = selIdx===idx; const style={ borderColor:c.border, backgroundColor:c.bg, color:c.text, boxShadow: selected? '0 0 0 3px rgba(59,130,246,0.5)' : 'none' }; return React.createElement('button',{key:idx,onClick:()=>{ if(selIdx===idx) setSelIdx(-1); else setSelIdx(idx) },onDoubleClick:()=>setSelIdx(-1),className:'h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 rounded-lg border font-semibold flex items-center justify-center hover:opacity-90 transition text-[10px] sm:text-[11px]',style},String((r.posto||'')).padStart(2,'0')) })
        ])
      ]) })()
    ])
    
  ])
}