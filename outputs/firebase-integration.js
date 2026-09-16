import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });
let syncTimer;
let stateRef;

const overlay = document.createElement('div');
overlay.id = 'authOverlay';
overlay.innerHTML = `<section class="auth-card"><div class="auth-symbol">✦</div><p>VITALCARE PRO</p><h1>Tu centro, conectado.</h1><span>Ingresa para administrar citas, clientes y tratamientos de forma segura.</span><button id="googleLogin">Continuar con Google</button><small>Acceso seguro para administración y clientes.</small></section>`;
document.body.append(overlay);

const userMenu = document.createElement('div');
userMenu.className = 'user-menu';
userMenu.innerHTML = `<span class="user-avatar"></span><div><b></b><small>Administrador</small></div><button title="Cerrar sesión">↪</button>`;

async function ensureProfile(user) {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) {
    const organizationId = user.uid;
    await setDoc(doc(db, 'organizations', organizationId), {
      name: 'VitalCare Pro', ownerId: user.uid, createdAt: serverTimestamp()
    });
    await setDoc(userRef, {
      displayName: user.displayName || 'Administrador', email: user.email || '', role: 'admin',
      organizationId, createdAt: serverTimestamp()
    });
    return { organizationId, role: 'admin' };
  }
  return snapshot.data();
}

async function hydrateApp(profile) {
  stateRef = doc(db, 'organizations', profile.organizationId, 'settings', 'appState');
  const saved = await getDoc(stateRef);
  if (saved.exists() && saved.data().data) window.vitalCareSetState(saved.data().data);
  else await setDoc(stateRef, { data: window.vitalCareGetState(), updatedAt: serverTimestamp() });
  window.vitalCareSync = (data) => {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => setDoc(stateRef, { data, updatedAt: serverTimestamp() }, { merge: true }), 450);
  };
}

async function googleLogin() {
  try {
    if (window.matchMedia('(max-width: 700px)').matches) await signInWithRedirect(auth, provider);
    else await signInWithPopup(auth, provider);
  } catch (error) {
    alert('No fue posible iniciar sesión. Verifica que estés usando un dominio autorizado y vuelve a intentarlo.');
    console.error(error);
  }
}

document.querySelector('#googleLogin').addEventListener('click', googleLogin);
userMenu.querySelector('button').addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.vitalCareSync = null;
    overlay.classList.remove('hidden');
    userMenu.remove();
    return;
  }
  try {
    const profile = await ensureProfile(user);
    await hydrateApp(profile);
    overlay.classList.add('hidden');
    userMenu.querySelector('.user-avatar').textContent = (user.displayName || 'U').split(' ').slice(0, 2).map(x => x[0]).join('');
    userMenu.querySelector('b').textContent = user.displayName || user.email;
    document.querySelector('.header-actions')?.prepend(userMenu);
  } catch (error) {
    console.error(error);
    alert('Tu acceso fue reconocido, pero faltan las reglas de seguridad de Firestore. Finaliza la configuración y vuelve a intentar.');
  }
});
