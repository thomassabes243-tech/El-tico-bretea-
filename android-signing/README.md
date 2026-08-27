# TWA / Google Play — El Mexa Chamba (mexico-sin-hambre)

Estado del empaquetado Android (Trusted Web Activity) para publicar en Google
Play Store. Última actualización: ver historial de git de este archivo.

## Resumen del estado

| Paso | Estado |
|---|---|
| 1. `manifest.json` cumple los requisitos de PWABuilder (íconos 192/512/maskable, name/short_name, start_url, display, theme_color/background_color) | ✅ Hecho |
| 2. Generar el paquete Android (APK/AAB firmado) | ⛔ Bloqueado en este entorno — ver abajo |
| 3. `assetlinks.json` con el SHA-256 del keystore, publicado en `/.well-known/assetlinks.json` | ✅ Hecho (con el keystore generado en el paso siguiente) |
| 4. Elegir package name independiente del dominio final | ✅ Hecho: `com.mexicosinhambre.app` |
| 5. Guardar el keystore en un lugar seguro | ⚠️ Generado, pendiente que lo descargues y guardes vos (ver abajo) |
| 6. Aviso para el siguiente paso (Google Play Console) | Pendiente hasta tener el AAB real |

## Por qué el paso 2 no se pudo completar acá

Bubblewrap (la herramienta que usa PWABuilder por debajo para generar el
proyecto Android) necesita descargar el **Android SDK** (build-tools,
platform-tools, plataforma) desde `dl.google.com`. Ese dominio está bloqueado
por la política de red de este entorno (sandbox), a diferencia de otros
dominios como el registro de npm o Maven Central, que sí están permitidos.

Se intentó de verdad, no es una suposición: `bubblewrap init` llegó a
descargar el JDK 17 sin problema, pero se traba en el paso siguiente
(descarga del SDK de Android) por ese bloqueo.

## Package name elegido

```
com.mexicosinhambre.app
```

Se eligió con el prefijo `mexicosinhambre` (no `elmexachamba` ni ningún otro
nombre de marca) precisamente porque el nombre de marca visible en la app
puede cambiar (como ya pasó una vez esta misma sesión) sin que haga falta
volver a publicar la app con un package name distinto — **el package name no
se puede cambiar nunca después de publicar en Play Store**, así que quedó
atado al dominio (que si cambia, es un evento raro y ya requeriría de todos
modos actualizar `assetlinks.json` y volver a firmar).

## El keystore de firma

Se generó un keystore real en este mismo directorio:

```
android-signing/mexicosinhambre-release.keystore
```

- Alias: `mexicosinhambre`
- Algoritmo: RSA 2048
- Validez: 10.000 días (~27 años) — cumple de sobra el mínimo que exige Google
  Play (la clave tiene que seguir siendo válida más allá del 22 de octubre de
  2033).
- SHA-256 del certificado (el que ya está cargado en
  `/.well-known/assetlinks.json`):
  ```
  E0:3C:71:83:1D:E1:D5:6A:27:13:04:D3:01:05:0A:63:1E:97:97:0B:69:03:41:C2:DD:FC:C7:18:96:9B:CA:1A
  ```

**La contraseña del keystore (store password y key password, son la misma)
se le pasó al usuario por chat, no está en este archivo ni se commiteó en
ningún lado.** Sin esa contraseña el keystore generado no sirve para nada —
guardala en un gestor de contraseñas real, no en una nota.

⚠️ **Este archivo `.keystore` vive en el filesystem de este entorno de
trabajo, que es efímero.** Hay que descargarlo y guardarlo en un lugar
seguro y persistente (gestor de contraseñas, backup cifrado, etc.) antes de
que termine la sesión, o se pierde para siempre — y sin él nunca más se
van a poder firmar actualizaciones de esta misma app en Play Store.

## Próximo paso real (para el usuario, vía pwabuilder.com)

Como el empaquetado en sí está bloqueado acá, hay que terminarlo en
[pwabuilder.com](https://www.pwabuilder.com), que sí corre en un servidor con
acceso completo a internet:

1. Entrar a pwabuilder.com y pegar la URL:
   `https://mexico-sin-hambre-el-tico-bretea.vercel.app`
2. Elegir la plataforma **Android**.
3. En las opciones de firma ("Signing key"), elegir **"Use mine"** / "I have
   an existing key" y subir el archivo `mexicosinhambre-release.keystore` de
   este directorio, con:
   - Alias: `mexicosinhambre`
   - Key password / Store password: la que se pasó por chat
4. Como **Package ID / Application ID**, poner exactamente:
   `com.mexicosinhambre.app`
   (así el SHA-256 que ya está en `assetlinks.json` coincide y la app abre en
   pantalla completa, sin la barra del navegador).
5. Descargar el AAB (o APK para pruebas) que genera PWABuilder.
6. Avisar cuando esté listo para seguir con Google Play Console.

Si en vez de esto PWABuilder genera su propio keystore nuevo (por ejemplo si
se elige "Generate new" en vez de "Use mine"), el SHA-256 va a ser distinto
al que ya está en `assetlinks.json` — en ese caso hay que decírmelo para
actualizar el archivo con el fingerprint correcto.

## Pendiente cuando se compre el dominio `mexicosinhambre.com`

Cuando el dominio esté comprado y conectado (ver pasos de Cloudflare/Vercel
ya documentados aparte):

- Actualizar `start_url`/host implícito de `manifest.json` si cambia el
  origen servido.
- Actualizar `/.well-known/assetlinks.json` si se genera un nuevo keystore.
- Probablemente haya que volver a generar el paquete Android apuntando al
  dominio nuevo en vez de la URL de Vercel.

Esto no bloquea nada de lo hecho hasta ahora — la app ya se puede probar con
la URL de Vercel mientras tanto.
