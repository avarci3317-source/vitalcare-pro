import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig), auth = getAuth(app), db = getFirestore(app), provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });
let syncTimer, stateRef, loginMode = sessionStorage.getItem('vitalcare-login-mode') || (location.hash === '#portal' ? 'client' : 'admin'), demoMode = sessionStorage.getItem('vitalcare-demo-mode') === 'true';
const emailKey = email => (email || '').trim().toLowerCase();
const clientId = client => emailKey(client.email) || client.initials || client.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();

const overlay = document.createElement('div');
overlay.id = 'authOverlay';
overlay.innerHTML = `<section class="auth-card"><div class="auth-symbol">✦</div><p>VITALCARE PRO</p><h1>Tu centro, conectado.</h1><span>Ingresa a tu clínica, crea tu cuenta con Google o consulta tu perfil de cliente.</span><button id="googleLogin">Ingresar como administrador</button><button id="registerLogin" class="register-login">Crear mi cuenta con Google</button><button id="clientLogin" class="client-login">Acceder como cliente</button><button id="demoLogin" class="demo-login">Ver demostración</button><small>La demostración no guarda datos en la nube. Los clientes deben usar el correo registrado por la clínica.</small></section>`;
document.body.append(overlay);
const userMenu = document.createElement('div');
userMenu.className = 'user-menu'; userMenu.innerHTML = `<span class="user-avatar"></span><div><b></b><small>Administrador</small></div><button title="Cerrar sesión">↪</button>`;
const clientView = document.createElement('div'); clientView.id = 'secureClientView'; document.body.append(clientView);

async function ensureAdminProfile(user) {
  const userRef = doc(db, 'users', user.uid), snapshot = await getDoc(userRef);
  if (snapshot.exists()) return snapshot.data();
  const organizationId = user.uid;
  await setDoc(doc(db, 'organizations', organizationId), { name: 'VitalCare Pro', ownerId: user.uid, createdAt: serverTimestamp() });
  await setDoc(userRef, { displayName: user.displayName || 'Administrador', email: user.email || '', role: 'admin', organizationId, createdAt: serverTimestamp() });
  return { organizationId, role: 'admin' };
}
async function syncClientRecords(organizationId, data) {
  const byName = new Map(data.clients.map(c => [c.name, c]));
  await Promise.all(data.clients.filter(c => c.email).map(async client => {
    const id = clientId(client), email = emailKey(client.email);
    await setDoc(doc(db, 'clientDirectory', email), { organizationId, clientId: id, updatedAt: serverTimestamp() });
    await setDoc(doc(db, 'organizations', organizationId, 'clients', id), { ...client, id, email, updatedAt: serverTimestamp() }, { merge: true });
  }));
  await Promise.all(data.appointments.map(async (appointment, index) => {
    const client = byName.get(appointment.name); if (!client?.email) return;
    await setDoc(doc(db, 'organizations', organizationId, 'clientAppointments', `${clientId(client)}-${index}`), { ...appointment, email: emailKey(client.email), updatedAt: serverTimestamp() });
  }));
  await Promise.all(data.services.map((s, i) => setDoc(doc(db, 'organizations', organizationId, 'services', `service-${i}`), { name: s[0], duration: s[1], price: s[2], icon: s[3] }, { merge: true })));
}
async function hydrateAdmin(profile) {
  stateRef = doc(db, 'organizations', profile.organizationId, 'settings', 'appState');
  const saved = await getDoc(stateRef);
  if (saved.exists() && saved.data().data) window.vitalCareSetState(saved.data().data);
  else await setDoc(stateRef, { data: window.vitalCareGetState(), updatedAt: serverTimestamp() });
  await syncClientRecords(profile.organizationId, window.vitalCareGetState());
  window.vitalCareSync = data => { clearTimeout(syncTimer); syncTimer = setTimeout(async () => { await setDoc(stateRef, { data, updatedAt: serverTimestamp() }, { merge: true }); await syncClientRecords(profile.organizationId, data); }, 550); };
  installClientAccessButtons();
}
function installClientAccessButtons() {
  const table = document.querySelector('#clientTable'); if (!table || table.dataset.accessReady) return;
  table.dataset.accessReady = 'true'; new MutationObserver(() => table.querySelectorAll('tr').forEach(row => {
    const cell = row.lastElementChild; if (!cell || cell.querySelector('button')) return;
    const name = row.querySelector('td')?.innerText.trim(); cell.innerHTML = `<button class="grant-client-access">Acceso</button>`;
    cell.querySelector('button').onclick = () => { const client = window.vitalCareGetState().clients.find(c => c.name === name); const email = prompt(`Correo de Google para ${name}:`, client?.email || ''); if (!email || !client) return; client.email = emailKey(email); window.vitalCareSync?.(window.vitalCareGetState()); window.vitalCareSetState(window.vitalCareGetState()); alert('Acceso asignado. El cliente debe entrar con este mismo correo.'); };
  })).observe(table, { childList: true, subtree: true }); window.vitalCareSetState(window.vitalCareGetState());
}
async function loadClientPortal(user) {
  const directory = await getDoc(doc(db, 'clientDirectory', emailKey(user.email))); if (!directory.exists()) throw new Error('CLIENT_NOT_REGISTERED');
  const access = directory.data(), client = await getDoc(doc(db, 'organizations', access.organizationId, 'clients', access.clientId));
  const appointments = await getDocs(query(collection(db, 'organizations', access.organizationId, 'clientAppointments'), where('email', '==', emailKey(user.email))));
  const services = await getDocs(collection(db, 'organizations', access.organizationId, 'services'));
  document.querySelector('main').style.display = 'none'; document.querySelector('.sidebar').style.display = 'none';
  clientView.innerHTML = `<main class="secure-portal"><header><div class="secure-brand">✦ <b>VitalCare Pro</b></div><button id="clientSignOut">Cerrar sesión</button></header><section class="secure-hero"><p>MI PERFIL</p><h1>Hola, ${client.data().name}</h1><span>Consulta tus citas y explora los tratamientos disponibles.</span></section><section><h2>Mis próximas citas</h2><div class="secure-list">${appointments.empty ? '<p>No tienes citas activas.</p>' : appointments.docs.map(x => `<article><b>${x.data().service}</b><span>Hoy · ${x.data().time} · ${x.data().provider}</span><i>${x.data().status}</i></article>`).join('')}</div></section><section><h2>Tratamientos y precios</h2><div class="secure-services">${services.docs.map(x => `<article><b>${x.data().name}</b><span>◷ ${x.data().duration}</span><strong>${x.data().price}</strong></article>`).join('')}</div></section></main>`;
  clientView.classList.add('visible'); document.querySelector('#clientSignOut').onclick = () => signOut(auth);
}
async function googleLogin(mode) { loginMode = mode; demoMode = false; sessionStorage.setItem('vitalcare-login-mode', mode); sessionStorage.removeItem('vitalcare-demo-mode'); try { if (window.matchMedia('(max-width: 700px)').matches) await signInWithRedirect(auth, provider); else await signInWithPopup(auth, provider); } catch (error) { console.error(error); alert('No fue posible iniciar sesión. Verifica el dominio autorizado y vuelve a intentar.'); } }
function openDemo() { demoMode = true; sessionStorage.setItem('vitalcare-demo-mode', 'true'); overlay.classList.add('hidden'); }
document.querySelector('#googleLogin').onclick = () => googleLogin('admin'); document.querySelector('#registerLogin').onclick = () => googleLogin('register'); document.querySelector('#clientLogin').onclick = () => googleLogin('client'); document.querySelector('#demoLogin').onclick = openDemo; userMenu.querySelector('button').onclick = () => signOut(auth);
onAuthStateChanged(auth, async user => {
  if (!user) { window.vitalCareSync = null; if (demoMode) overlay.classList.add('hidden'); else overlay.classList.remove('hidden'); userMenu.remove(); clientView.classList.remove('visible'); document.querySelector('main').style.display = ''; document.querySelector('.sidebar').style.display = ''; return; }
  try {
    const profile = await getDoc(doc(db, 'users', user.uid));
    const isNewAccount = !profile.exists();
    if (loginMode === 'client') { await loadClientPortal(user); overlay.classList.add('hidden'); return; }
    await hydrateAdmin(profile.exists() ? profile.data() : await ensureAdminProfile(user)); overlay.classList.add('hidden'); userMenu.querySelector('.user-avatar').textContent = (user.displayName || 'U').split(' ').slice(0, 2).map(x => x[0]).join(''); userMenu.querySelector('b').textContent = user.displayName || user.email; document.querySelector('.header-actions')?.prepend(userMenu);
    if (loginMode === 'register' && isNewAccount) alert('¡Cuenta creada! Ya puedes configurar tu clínica, servicios y clientes.');
    loginMode = 'admin'; sessionStorage.setItem('vitalcare-login-mode', 'admin');
  } catch (error) { console.error(error); overlay.classList.remove('hidden'); alert(error.message === 'CLIENT_NOT_REGISTERED' ? 'Este correo no tiene un perfil asignado. Solicita a la clínica que registre tu correo.' : 'No fue posible cargar tu acceso. Vuelve a intentarlo en un minuto.'); }
});
