# El Mexa Chamba — Android TWA

Proyecto Android reproducible para empaquetar la PWA existente como Trusted Web Activity (TWA).
No contiene Google Play Billing ni modifica la lógica web.

## Configuración fijada

- Host: `https://mexico-sin-hambre-el-tico-bretea.vercel.app/`
- Application ID: `com.mexicosinhambre.app`
- versionCode: `1`
- versionName: `1.0.0`
- minSdk: `23`
- targetSdk: `36`
- compileSdk: `36`
- Android Gradle Plugin: `8.13.2`
- Gradle: `8.13` (wrapper bootstrap con SHA-256 oficial verificado)
- Android Browser Helper: `2.7.3`

`minSdk 23` se conserva porque cubre Android 6+ y está por encima del mínimo técnico de
Android Browser Helper; no se necesita subirlo para esta TWA.

El repositorio no necesita almacenar un keystore ni secretos. Si `gradle-wrapper.jar` no
existe, `./gradlew` descarga el wrapper oficial de Gradle 8.13 y verifica su SHA-256 antes
de ejecutarlo. La distribución `gradle-8.13-bin.zip` también tiene su SHA-256 fijado en
`gradle/wrapper/gradle-wrapper.properties`.

## Firma release

Nunca guardar secretos ni keystores en Git. `app/build.gradle` acepta:

- `ANDROID_KEYSTORE_PATH`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Como alternativa local, se puede crear `android/keystore.properties` con:

```properties
storeFile=/ruta/segura/mexachamba-upload.jks
storePassword=...
keyAlias=mexachamba_upload
keyPassword=...
```

El archivo y los keystores están ignorados por Git. `bundleRelease` falla si no existe
configuración de firma para evitar producir accidentalmente un bundle release sin firmar.

## Build

Con Android SDK Platform 36 y Build Tools instalados:

```bash
cd android
./gradlew clean
./gradlew lintRelease
./gradlew bundleRelease
```

Salida esperada:

`app/build/outputs/bundle/release/app-release.aab`

## Digital Asset Links

`public/.well-known/assetlinks.json` debe incluir el SHA-256 del certificado que firma la
instalación que se está probando. El certificado de upload key NO es necesariamente el
mismo certificado con el que Google Play entrega la aplicación. Tras activar Play App
Signing, agregar también el SHA-256 de **App signing key certificate** mostrado por Play
Console y volver a validar el archivo publicado.

## Validación estática sin Android SDK

```bash
python3 android/scripts/verify-config.py
```

Comprueba identidad/versiones SDK, permisos explícitos, `LauncherActivity`, host del App
Link, formato de `assetlinks.json` y presencia de los recursos principales. Esto no sustituye
`lintRelease` ni un build real.

## Permisos Android explícitos

- `android.permission.INTERNET`: acceso de red necesario para el contenedor TWA/web.
- `android.permission.POST_NOTIFICATIONS`: se conserva porque MexaChamba ya ofrece Web Push.

No se agregaron permisos de ubicación, cámara, micrófono, contactos, almacenamiento, teléfono
ni otros permisos sensibles. La solicitud nativa de notificaciones queda declarada mediante
`NotificationPermissionRequestActivity` de Android Browser Helper y debe confirmarse en dispositivo.
