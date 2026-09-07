# Ajustes, contraseñas y miembros

Desde el navegador y el dominio donde creaste el grupo, abre el grupo y pulsa **Ajustes del grupo**. Puedes cambiar el nombre o establecer una contraseña de 8 a 128 caracteres. Dejar la contraseña vacía conserva la actual. Las quedadas y sus inscripciones se conservan.

Los grupos anteriores no reciben una contraseña inventada: su creador debe establecerla. Los nuevos grupos requieren contraseña desde su creación. Una vez protegido, la API no revela el nombre, los planes ni los miembros sin acceso. La contraseña se guarda derivada con PBKDF2, sal aleatoria y 100000 iteraciones, nunca en texto plano. Hay un límite de 30 intentos por grupo y minuto.

Cada miembro entra con su nombre y contraseña. La sección **Miembros del grupo** es visible para todos los miembros autorizados. Incluye a quienes han entrado en Quedario; no importa automáticamente integrantes de WhatsApp. En grupos antiguos se incorporan el creador y las personas inscritas en quedadas.

Los administradores pueden cambiar ajustes, crear y cancelar planes y nombrar o retirar administradores desde la lista de miembros. Nunca se puede retirar al último administrador. Los identificadores de miembro que muestra la API no son credenciales.

Cambiar la contraseña invalida los accesos de los miembros normales en su siguiente petición; los administradores conservan acceso. No borra información que alguien ya haya visto. Retirar un administrador de un grupo protegido obliga a introducir la contraseña nuevamente.

La identidad sigue vinculada al almacenamiento de este navegador y al dominio usado. Si creaste el grupo en workers.dev, vuelve a esa misma dirección para administrarlo; entrar en quedario.com no traslada la identidad automáticamente. No borres los datos del navegador. Todavía no hay cuentas ni recuperación automática de identidad.

Compartir una contraseña no verifica pertenencia a WhatsApp: cualquiera que reciba la invitación y contraseña puede entrar. No existe un buscador público de grupos.
