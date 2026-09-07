# Ajustes, contraseñas y miembros

## Actualización: grupos abiertos, enlaces y borrado

La contraseña ahora es opcional. Al crear un grupo, dejarla vacía lo hace accesible a quien tenga el enlace. En Ajustes, guardar ambos campos de contraseña vacíos elimina la contraseña existente, con confirmación explícita. Esta regla sustituye las indicaciones anteriores de conservar la contraseña al dejar el campo vacío.

Al crear una quedada, un administrador puede guardar opcionalmente su ubicación exacta. Quedario solicita el permiso de ubicación del navegador solo al pulsar **Usar mi ubicación exacta**; almacena las coordenadas junto con la quedada y las muestra mediante un enlace a Google Maps. Cualquier persona que pueda ver la quedada puede abrir ese punto, por lo que no conviene compartir ubicaciones privadas con grupos abiertos.

Los comentarios opcionales escritos al crear una quedada o al apuntarse se guardan con esa actividad y pueden ser leídos por todas las personas que tengan acceso al grupo. No deben contener contraseñas, datos personales delicados ni instrucciones de acceso a domicilios privados.

Los grupos nuevos reciben una dirección basada en su nombre, por ejemplo `/los-del-viernes`. Si está ocupada se ofrecen alternativas seleccionables. Cambiar el nombre no cambia la dirección. Los enlaces anteriores con identificador siguen funcionando.

**Borrar grupo por completo** requiere ser administrador y escribir el nombre exacto del grupo. Elimina sus miembros, credenciales, quedadas, inscripciones y ajustes del almacenamiento activo; conserva únicamente una marca sin contenido que impide recrear el identificador antiguo. Libera la dirección con nombre para que pueda reutilizarse. Por ello, una invitación antigua con esa dirección podría apuntar a un grupo nuevo si alguien vuelve a usarla. Cerrar y reabrir siguen siendo acciones separadas que conservan los datos.

Desde el navegador y el dominio donde creaste el grupo, abre el grupo y pulsa **Ajustes del grupo**. Puedes cambiar el nombre o establecer una contraseña de 8 a 128 caracteres. Si dejas ambos campos de contraseña vacíos y guardas, se elimina la contraseña actual. Las quedadas y sus inscripciones se conservan.

Los grupos anteriores no reciben una contraseña inventada: su creador debe establecerla. Los nuevos grupos requieren contraseña desde su creación. Una vez protegido, la API no revela el nombre, los planes ni los miembros sin acceso. La contraseña se guarda derivada con PBKDF2, sal aleatoria y 100000 iteraciones, nunca en texto plano. Hay un límite de 30 intentos por grupo y minuto.

Cada miembro entra con su nombre y contraseña. La sección **Miembros del grupo** es visible para todos los miembros autorizados. Incluye a quienes han entrado en Quedario; no importa automáticamente integrantes de WhatsApp. En grupos antiguos se incorporan el creador y las personas inscritas en quedadas.

Los administradores pueden cambiar ajustes, crear y cancelar planes y nombrar o retirar administradores desde la lista de miembros. Nunca se puede retirar al último administrador. Los identificadores de miembro que muestra la API no son credenciales.

Cambiar la contraseña invalida los accesos de los miembros normales en su siguiente petición; los administradores conservan acceso. No borra información que alguien ya haya visto. Retirar un administrador de un grupo protegido obliga a introducir la contraseña nuevamente.

La identidad sigue vinculada al almacenamiento de este navegador y al dominio usado. Si creaste el grupo en workers.dev, vuelve a esa misma dirección para administrarlo; entrar en quedario.com no traslada la identidad automáticamente. No borres los datos del navegador. Todavía no hay cuentas ni recuperación automática de identidad.

Compartir una contraseña no verifica pertenencia a WhatsApp: cualquiera que reciba la invitación y contraseña puede entrar. No existe un buscador público de grupos.
