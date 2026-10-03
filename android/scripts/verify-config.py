#!/usr/bin/env python3
from pathlib import Path
import json
import re
import sys
import xml.etree.ElementTree as ET

REPO = Path(__file__).resolve().parents[2]
ANDROID = REPO / "android"
APP_ID = "com.mexicosinhambre.app"
HOST = "mexico-sin-hambre-el-tico-bretea.vercel.app"
EXPECTED = {
    "APP_ID": "com.mexicosinhambre.app",
    "VERSION_CODE_VALUE": "1",
    "VERSION_NAME_VALUE": "1.0.0",
    "MIN_SDK_VALUE": "23",
    "TARGET_SDK_VALUE": "36",
    "COMPILE_SDK_VALUE": "36",
}

build = (ANDROID / "app/build.gradle").read_text()
for name, expected in EXPECTED.items():
    if name == "APP_ID":
        pattern = rf"final String {name} = ['\"]([^'\"]+)['\"]"
    elif "NAME" in name:
        pattern = rf"final String {name} = ['\"]([^'\"]+)['\"]"
    else:
        pattern = rf"final int {name} = (\d+)"
    m = re.search(pattern, build)
    if not m or m.group(1) != expected:
        raise SystemExit(f"FAIL: {name} expected {expected!r}")

manifest_path = ANDROID / "app/src/main/AndroidManifest.xml"
root = ET.parse(manifest_path).getroot()
android_ns = "{http://schemas.android.com/apk/res/android}"
permissions = sorted(x.attrib[android_ns + "name"] for x in root.findall("uses-permission"))
expected_permissions = sorted([
    "android.permission.INTERNET",
    "android.permission.POST_NOTIFICATIONS",
])
if permissions != expected_permissions:
    raise SystemExit(f"FAIL: permissions={permissions!r}")

launcher = None
for activity in root.findall("./application/activity"):
    if activity.attrib.get(android_ns + "name") == "com.google.androidbrowserhelper.trusted.LauncherActivity":
        launcher = activity
        break
if launcher is None or launcher.attrib.get(android_ns + "exported") != "true":
    raise SystemExit("FAIL: LauncherActivity/exported")

hosts = [d.attrib.get(android_ns + "host") for d in launcher.findall("./intent-filter/data")]
if HOST not in hosts:
    raise SystemExit(f"FAIL: app-link host {HOST!r} missing")

assetlinks = json.loads((REPO / "public/.well-known/assetlinks.json").read_text())
if len(assetlinks) != 1 or assetlinks[0]["target"]["package_name"] != APP_ID:
    raise SystemExit("FAIL: assetlinks package")
fps = assetlinks[0]["target"].get("sha256_cert_fingerprints", [])
if not fps or not all(re.fullmatch(r"(?:[0-9A-F]{2}:){31}[0-9A-F]{2}", fp) for fp in fps):
    raise SystemExit("FAIL: assetlinks fingerprint format")

required = [
    ANDROID / "app/src/main/res/drawable-nodpi/splash.png",
    ANDROID / "app/src/main/res/drawable-nodpi/ic_launcher_foreground.png",
    ANDROID / "app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml",
    ANDROID / "app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml",
]
missing = [str(p.relative_to(REPO)) for p in required if not p.is_file()]
if missing:
    raise SystemExit(f"FAIL: missing resources {missing}")

print("STATIC_CONFIG_OK")
print("APPLICATION_ID=com.mexicosinhambre.app")
print("VERSION_CODE=1")
print("VERSION_NAME=1.0.0")
print("MIN_SDK=23")
print("TARGET_SDK=36")
print("COMPILE_SDK=36")
print("ANDROID_PERMISSIONS=" + ",".join(permissions))
print("TWA_HOST=" + HOST)
print("ASSETLINKS_FINGERPRINTS=" + ",".join(fps))
