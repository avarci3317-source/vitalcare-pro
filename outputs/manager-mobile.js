(() => {
  const $ = selector => document.querySelector(selector);
  const mobileNav = document.createElement('nav');
  mobileNav.className = 'mobile-nav';
  mobileNav.innerHTML = `<button class="mobile-nav-item active" data-mobile-view="dashboard"><span>▦</span><small>Inicio</small></button><button class="mobile-nav-item" data-mobile-view="calendar"><span>□</span><small>Agenda</small></button><button class="mobile-nav-item quick-add"><span>＋</span><small>Nueva</small></button><button class="mobile-nav-item" data-mobile-view="clients"><span>♙</span><small>Clientes</small></button><button class="mobile-nav-item" data-mobile-view="automations"><span>ϟ</span><small>Más</small></button>`;
  document.body.append(mobileNav);
  const drawer = document.createElement('aside');
  drawer.className = 'mobile-drawer';
  drawer.innerHTML = `<div class="mobile-drawer-panel"><div class="mobile-drawer-top"><div class="mobile-drawer-brand"><img src="vitalcare-logo.svg" alt="VitalCare Pro">VitalCare Pro</div><button class="mobile-drawer-close" aria-label="Cerrar menú">×</button></div><nav><button class="nav active" data-drawer-view="dashboard"><span>▦</span>Resumen</button><button class="nav" data-drawer-view="calendar"><span>□</span>Agenda</button><button class="nav" data-drawer-view="clients"><span>♙</span>Clientes</button><button class="nav" data-drawer-view="services"><span>◇</span>Servicios</button><button class="nav" data-drawer-view="team"><span>♧</span>Equipo</button><button class="nav" data-drawer-view="reports"><span>◔</span>Reportes</button><button class="nav" data-drawer-view="automations"><span>ϟ</span>Automatizaciones</button><button class="nav" data-drawer-view="settings"><span>⚙</span>Configuración</button></nav><div class="mobile-drawer-note">Todo tu centro, siempre a mano.</div></div>`;
  document.body.append(drawer);
  function closeDrawer() { drawer.classList.remove('open'); document.body.classList.remove('mobile-menu-open'); }
  function mobileShow(id) {
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('active-view', view.id === id));
    document.querySelectorAll('.nav').forEach(nav => nav.classList.toggle('active', nav.dataset.view === id || nav.dataset.drawerView === id));
    document.querySelectorAll('.mobile-nav-item[data-mobile-view]').forEach(nav => nav.classList.toggle('active', nav.dataset.mobileView === id));
    const titles = { dashboard: 'Resumen', calendar: 'Agenda', clients: 'Clientes', services: 'Servicios', team: 'Equipo', reports: 'Reportes', automations: 'Automatizaciones', settings: 'Configuración' };
    $('#pageTitle').textContent = titles[id] || id;
    closeDrawer(); window.scrollTo(0, 0);
  }
  mobileNav.querySelectorAll('[data-mobile-view]').forEach(button => button.onclick = () => mobileShow(button.dataset.mobileView));
  mobileNav.querySelector('.quick-add').onclick = () => $('#addAppointment').click();
  drawer.querySelectorAll('[data-drawer-view]').forEach(button => button.onclick = () => mobileShow(button.dataset.drawerView));
  drawer.querySelector('.mobile-drawer-close').onclick = closeDrawer;
  drawer.onclick = event => { if (event.target === drawer) closeDrawer(); };
  const header = document.querySelector('header');
  const status = document.createElement('div');
  status.className = 'mobile-status';
  status.innerHTML = `<button class="mobile-menu-trigger" aria-label="Abrir menú">☰</button><div class="mobile-title"><img src="vitalcare-logo.svg" alt="">VitalCare Pro</div><i>● En línea</i>`;
  header.prepend(status);
  status.querySelector('.mobile-menu-trigger').onclick = () => { drawer.classList.add('open'); document.body.classList.add('mobile-menu-open'); };
})();
