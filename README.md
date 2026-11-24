# Código Ictus 112/061

Prototipo PWA en español para registro estructurado de una asistencia extrahospitalaria por sospecha de ictus.

## Contenido
- Activación manual y cronómetro desde la activación.
- Registro de cronología: LKW, inicio, aviso, llegada, salida, hospital y transferencia.
- Valoración clínica, síntomas, constantes, glucemia, Glasgow, NIHSS y mRS.
- Pestaña específica de escalas con checklist FAST y Cincinnati, cálculo de RACE y registro NIHSS.
- Antecedentes, anticoagulantes/antiagregantes, alergias y reevaluación.
- Checklist asistencial configurable en `app.js`.
- Registro de eventos, preaviso, resumen imprimible/PDF y exportación JSON.
- PWA con caché offline básica e iconos.

## Publicar en GitHub Pages
1. Crea un repositorio en GitHub, por ejemplo `codigo-ictus-112-061`.
2. Sube **todos** los archivos de esta carpeta a la raíz del repositorio.
3. En GitHub: **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`, y guarda.
6. Espera a que GitHub Pages publique la URL. Abre esa URL en Safari en el iPhone.
7. En Safari: botón **Compartir → Añadir a pantalla de inicio**.

## Personalización del protocolo
- Edita el texto orientativo de checklist en el array `checklist` de `app.js`.
- El contenido aprobado del protocolo puede pegarse desde la propia pestaña **Protocolo** durante la sesión; para distribuirlo preconfigurado, modifica el texto inicial o amplía los campos de la aplicación.
- Ajusta las escalas y circuitos únicamente conforme a la versión vigente aprobada por el servicio.

## Limitaciones y seguridad
**Este proyecto es un prototipo y no está validado para uso asistencial.** No ofrece diagnóstico, estratificación automática, recomendación terapéutica, selección de hospital ni comunicación real con 112/061 o con el hospital.
- No introduzcas datos identificativos o sanitarios reales en esta versión.
- Los datos del formulario se mantienen en la memoria de la pestaña; no hay base de datos ni sincronización. Recargar o cerrar puede perderlos.
- La exportación JSON y la impresión pueden generar archivos con datos sensibles: no se deben usar con pacientes reales sin evaluación y autorización institucional.
- GitHub Pages es alojamiento web estático y no debe utilizarse como repositorio de datos de pacientes.
- Antes de cualquier uso real se requiere validación clínica por dirección médica, evaluación de seguridad, control de acceso, protección de datos (RGPD/LOPDGDD), auditoría, continuidad y gestión de versiones.

## Estructura
- `index.html`: estructura e interfaz.
- `styles.css`: diseño adaptable a iPhone/tablet/desktop.
- `app.js`: cronómetro, checklist, eventos y exportación.
- `manifest.webmanifest`: instalación PWA.
- `sw.js`: caché offline.


## Actualización de caché
La caché de la PWA está versionada como `codigo-ictus-v2` para invalidar los recursos de la versión anterior al actualizar el service worker.


## Solución si no aparece la pestaña «Escalas»

Esta versión incluye la pestaña **Escalas** en `index.html` y renueva la caché a `codigo-ictus-v3`.

Al actualizar GitHub Pages:
1. Sustituye **todos** los archivos del repositorio por los de este ZIP.
2. Comprueba que `index.html`, `app.js`, `styles.css` y `sw.js` estén en la raíz publicada (junto a `manifest.webmanifest`), no dentro de una subcarpeta.
3. Espera a que GitHub Pages termine el despliegue.
4. En iPhone, abre la URL del sitio en Safari y recarga. Si sigue apareciendo la versión anterior, elimina el acceso directo instalado de la pantalla de inicio y abre la URL en Safari para comprobarla antes de volver a instalarla.

La pestaña «Escalas» debe aparecer en la barra superior, junto a «Valoración» y «Checklist».
