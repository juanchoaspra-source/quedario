# Quedario v1

Aplicación móvil-first en español: un enlace por grupo, calendario de quedadas, categorías con iconos (cena, comida, café, concierto, ruta y otros), aforo, participantes, lista de espera y compartir el grupo por WhatsApp.

## Desplegar desde la pantalla de Cloudflare

1. Selecciona el repositorio privado `juanchoaspra-source/quedario`.
2. Nombre del Worker: **quedario**. Rama de producción: **main**. Directorio raíz: `/` (raíz del repositorio).
3. Comando de compilación: **npm run build**. Cloudflare instala las dependencias con el lockfile.
4. Comando de implementación: **npx wrangler deploy**.
5. Desactiva las compilaciones de ramas no destinadas a producción en este primer despliegue. Para futuras pruebas, usa otro Worker y otro almacenamiento; no compartas los datos de producción con previews.
6. No necesitas variables, secretos, identificadores de base de datos ni directorio de salida. Wrangler crea la vinculación de Durable Objects con almacenamiento SQLite.
7. Pulsa **Implementar**. Abre la URL `https://quedario.<subdominio-de-tu-cuenta>.workers.dev` que muestre Cloudflare. No se conoce el subdominio de la cuenta de antemano.
8. Crea un grupo y una quedada de una plaza. Copia el enlace del grupo y ábrelo en otro navegador o móvil. Apunta dos personas desde navegadores distintos; la segunda debe quedar en espera. Al salir la primera, actualiza el segundo navegador y comprueba que tiene plaza.

Si aparece un error de permisos de Durable Objects, revisa que la cuenta permita crear Workers y sus vinculaciones. El proyecto utiliza almacenamiento SQLite; no necesita una base D1 creada a mano.

Después de validar la URL temporal: Workers & Pages → quedario → Settings → Domains & Routes → Add → Custom Domain → `quedario.com`. Añade `www.quedario.com` si lo necesitas. Esto se realiza en Cloudflare, no está aplicado por este repositorio.

## Desarrollo y comprobaciones

Node.js 22 o posterior.

```sh
npm ci
npm test
npm run build
npm run dev
```

Abre la dirección local que muestre Wrangler (normalmente `http://localhost:8787`). Los datos locales quedan en `.wrangler/`, separados de producción.

```sh
npx wrangler deploy --dry-run
# Despliegue manual alternativo, con sesión propia de Cloudflare:
npx wrangler login
npm run deploy
```

## Funcionamiento y límites de esta primera versión

- Los datos se guardan en Cloudflare, compartidos entre dispositivos. Cada grupo tiene un Durable Object que serializa las inscripciones y conserva su orden. Las bajas promocionan automáticamente a la primera persona en espera.
- El enlace `/#g=<identificador-aleatorio>` es una invitación al grupo completo. Cualquiera que lo tenga puede ver nombres, lugares y fechas y apuntarse. No hay directorio público de grupos.
- La identidad es una clave aleatoria guardada en el navegador. Solo el creador puede crear/cancelar planes y cada participante puede retirar su propia inscripción. No hay cuentas, recuperación, traslado de permisos ni verificación del nombre. Borrar datos del navegador implica perder esa identidad; otro navegador constituye otra persona. Esta beta está pensada para grupos de confianza.
- WhatsApp abre un mensaje preparado para que el usuario elija el destinatario y lo envíe; no usa la API de WhatsApp ni envía automáticamente.
- La fecha se introduce y muestra en la zona horaria del dispositivo, y se conserva en UTC. Los planes pasados se ocultan por defecto. Las categorías tienen filtros reales.
- Pulsa **Actualizar participantes** para ver los cambios de otros dispositivos. No hay notificaciones ni sincronización en tiempo real.
- Máximos iniciales: 200 quedadas por grupo, 500 plazas y 1000 inscripciones por quedada. No hay controles antispam ni recuperación de identidad: antes de abrir el servicio al público conviene incorporar cuentas, recuperación, límites por origen y herramientas de administración.
- No se incluyen datos ficticios ni analítica. El coste depende de las cuotas y el uso de la cuenta de Cloudflare.

## Arquitectura

`public/`: interfaz sin dependencias de cliente. `src/worker.js`: API y Durable Object. `src/domain.js`: validación y reglas de aforo. `wrangler.jsonc`: recursos y archivos estáticos. `test/`: pruebas de las reglas de inscripción.

Referencias: [archivos estáticos](https://developers.cloudflare.com/workers/static-assets/binding/), [configuración Wrangler](https://developers.cloudflare.com/workers/wrangler/configuration/), [Durable Objects](https://developers.cloudflare.com/durable-objects/).
