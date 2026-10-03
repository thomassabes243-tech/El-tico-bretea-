# Firma Android / Google Play — El Mexa Chamba

El proyecto Android/TWA vive en `android/` y usa el package
`com.mexicosinhambre.app`.

## Upload key de esta fase

Se generó una nueva **upload key** porque el keystore descrito en una sesión anterior no
está disponible en el filesystem actual y no se puede verificar/reutilizar de forma segura.
El keystore nuevo **no está en el repositorio**.

- Alias: `mexachamba_upload`
- Formato: JKS
- Algoritmo: RSA 2048
- Validez: 10.000 días
- UPLOAD_CERT_SHA256:

`B4:A2:E0:44:BA:CF:91:B9:7F:DB:DC:16:D1:68:5A:A0:02:12:91:8A:F3:DE:5F:17:62:5E:B9:BF:06:24:18:E1`

Las credenciales se leen únicamente desde variables de entorno o desde
`android/keystore.properties`, archivo ignorado por Git.

## Importante sobre Play App Signing

El valor anterior es el certificado de la **upload key**. No se inventa ni se asume el
certificado de Play App Signing. Cuando Play Console cree/gestione la App signing key,
hay que copiar su SHA-256 y agregarlo a `public/.well-known/assetlinks.json` además del
certificado que se necesite para instalaciones de prueba.

## Host TWA actual

`https://mexico-sin-hambre-el-tico-bretea.vercel.app/`

Ese host ya estaba documentado por MexaChamba como la URL usada para el empaquetado TWA;
no se introdujo un dominio nuevo en esta fase.
