# VitalCare Pro

Aplicación web para administrar citas, clientes, servicios, tratamientos, automatizaciones y experiencia de pacientes o clientes. Está diseñada para clínicas dentales, consultorios, centros de bienestar y salones.

## Incluye

- Panel administrativo adaptable a computadora y móvil.
- Agenda, clientes, servicios, equipo y reportes.
- Recordatorios, confirmaciones, cancelaciones y lista de espera simuladas.
- Portal de clientes con citas, historial de tratamientos, catálogo, precios y referidos.
- Información almacenada localmente en el navegador para esta versión demostrativa.

## Ejecutar localmente

Abre `outputs/index.html` en tu navegador.

## Publicar en GitHub

1. Crea un repositorio nuevo en GitHub, por ejemplo `vitalcare-pro`.
2. En la carpeta del proyecto ejecuta:

```bash
git add .
git commit -m "Publicar VitalCare Pro"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/vitalcare-pro.git
git push -u origin main
```

## Publicar en Netlify

1. Entra a Netlify y elige **Add new site** → **Import an existing project**.
2. Conecta el repositorio de GitHub de VitalCare Pro.
3. Netlify leerá automáticamente `netlify.toml`:
   - Base directory: `outputs`
   - Publish directory: `.`
   - Build command: vacío
4. Pulsa **Deploy site**.
5. Personaliza el subdominio que te genere Netlify y, si quieres, conecta un dominio propio.

Cada vez que subas cambios a la rama `main`, Netlify volverá a publicar el sitio automáticamente.

## Antes de usarla con clientes reales

Esta edición usa almacenamiento local y simulaciones de notificaciones. Para operar con datos reales se debe incorporar autenticación, base de datos protegida, permisos por rol, proveedor de correo/SMS/WhatsApp, pagos y políticas de privacidad aplicables.
