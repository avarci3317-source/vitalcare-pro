(() => {
  const brand='VitalCare Pro';
  document.title=brand+' — Gestión de citas';
  document.querySelector('.brand span:last-child').textContent=brand;
  const workspace=document.querySelector('.workspace');workspace.querySelector('.avatar').textContent='TC';workspace.querySelector('b').textContent=brand;
  const businessInput=document.querySelector('.settings input');if(businessInput)businessInput.value=brand;
  const updateDynamicBrand=()=>{const mobile=document.querySelector('.mobile-status span');if(mobile)mobile.textContent=brand;const club=document.querySelector('.rewards-banner span');if(club)club.textContent='CLUB VITALCARE';const code=document.querySelector('#referCode');if(code)code.textContent=(document.querySelector('#portalClient')?.value.split(' ')[0]||'CLIENTE').toUpperCase()+'-VITALCARE'};
  document.querySelector('#openPortal')?.addEventListener('click',()=>setTimeout(updateDynamicBrand,5));
  updateDynamicBrand();
})();
