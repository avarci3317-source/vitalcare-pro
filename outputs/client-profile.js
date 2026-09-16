(() => {
  const $=s=>document.querySelector(s);
  const history={
    'María Fernanda Rojas':[{service:'Limpieza dental',date:'12 jun, 2026',professional:'Dra. Laura Méndez',note:'Control preventivo recomendado en 6 meses.'},{service:'Consulta general',date:'10 dic, 2025',professional:'Dra. Laura Méndez',note:'Sin observaciones.'}],
    'Carlos Jiménez':[{service:'Consulta general',date:'02 sep, 2026',professional:'Dr. Miguel Vargas',note:'Seguimiento según indicación médica.'}],
    'Sofía Calderón':[{service:'Blanqueamiento dental',date:'28 ago, 2026',professional:'Dra. Laura Méndez',note:'Se entregaron recomendaciones de cuidado.'}]
  };
  const portal=$('#portalModal'); if(!portal)return;
  const note=portal.querySelector('.portal-note');
  const profile=document.createElement('div'); profile.id='clientProfile'; profile.className='client-profile'; note.before(profile);
  function status(a){if(a.status==='Cancelada')return '<span class="profile-status canceled">Cancelada</span>';if(a.status==='Confirmada')return '<span class="profile-status confirmed">Confirmada</span>';return '<span class="profile-status pending">Pendiente de confirmar</span>'}
  function renderProfile(){const name=$('#portalClient').value;const appointments=state.appointments.filter(a=>a.name===name);const treatments=history[name]||[];profile.innerHTML=`<section class="profile-section"><div class="profile-heading"><h3>Mis citas</h3><span>${appointments.filter(a=>a.status!=='Cancelada').length} activa${appointments.filter(a=>a.status!=='Cancelada').length===1?'':'s'}</span></div>${appointments.length?appointments.map(a=>`<article class="profile-row"><i>□</i><div><b>${a.service}</b><small>Hoy · ${a.time} · ${a.provider}</small></div>${status(a)}</article>`).join(''):'<p class="empty-profile">No hay citas registradas.</p>'}</section><section class="profile-section"><div class="profile-heading"><h3>Historial de tratamientos</h3><span>${treatments.length} registro${treatments.length===1?'':'s'}</span></div>${treatments.length?treatments.map(t=>`<article class="treatment-row"><div><b>${t.service}</b><small>${t.date} · ${t.professional}</small><p>${t.note}</p></div></article>`).join(''):'<p class="empty-profile">Tu historial aparecerá aquí después de tu primera atención.</p>'}</section>`}
  $('#openPortal').addEventListener('click',()=>setTimeout(renderProfile,0));
  $('#portalClient').addEventListener('change',()=>setTimeout(renderProfile,0));
  $('#portalConfirm').addEventListener('click',()=>setTimeout(renderProfile,0));
  $('#portalCancel').addEventListener('click',()=>setTimeout(renderProfile,0));
  if(location.hash==='#portal')renderProfile();
})();
