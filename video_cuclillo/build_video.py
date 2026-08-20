#!/usr/bin/env python3
"""
Genera cuclillo_episodio1.mp4 (9:16, 1080x1920) para el canal
"Depredadores Emocionales" - Episodio 1: El Cuclillo.

Uso:
    python3 build_video.py

Estructura esperada (relativa a este archivo):
    imagenes/01_*.{jpg,jpeg,png}   Escena 1 - nido en niebla al amanecer
    imagenes/02_*.{jpg,jpeg,png}   Escena 2 - cuclillo posado, contraluz
    imagenes/03_*.{jpg,jpeg,png}   Escena 3 - huevo en nido ajeno
    imagenes/04_*.{jpg,jpeg,png}   Escena 4 - pichon en el nido
    imagenes/05_*.{jpg,jpeg,png}   Escena 5 - madre alimentando pichon
    imagenes/06_*.{jpg,jpeg,png}   Escena 6 - opcional (fondo/logo CTA)
    audio/narracion.mp3            Narracion completa (obligatorio)
    audio/musica.mp3               Musica de fondo tensa (opcional)
"""
import glob
import json
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(ROOT, "imagenes")
AUD_DIR = os.path.join(ROOT, "audio")
TMP_DIR = os.path.join(ROOT, "build_tmp")
FONT = os.path.join(ROOT, "fonts", "BigShoulders-Bold.ttf")
OUT_PATH = os.path.join(ROOT, "cuclillo_episodio1.mp4")

W, H = 1080, 1920
FPS = 30
TEXT_COLOR = "0x8B0000"
NARR_PATH = os.path.join(AUD_DIR, "narracion.mp3")
MUSIC_PATH = os.path.join(AUD_DIR, "musica.mp3")

# zoom/pan factors are unitless multipliers on the base 2x-scaled crop
SCENES = [
    dict(n=1, prefix="01", dur=3.0, effect="zoom_in", zoom_to=1.15,
         text="Hay un ave que entra\nen tu casa...", fontsize=52),
    dict(n=2, prefix="02", dur=12.0, effect="pan", zoom=1.2,
         text="Parece un ave común.", fontsize=52),
    dict(n=3, prefix="03", dur=15.0, effect="zoom_in", zoom_to=1.25,
         text="Pone su huevo en el nido\nde otra especie...\nimitando el color exacto.",
         fontsize=50),
    dict(n=4, prefix="04", dur=15.0, effect="static", flash_before=True,
         text="El primero en nacer...\nempuja a los demás fuera.", fontsize=50),
    dict(n=5, prefix="05", dur=10.0, effect="zoom_out", zoom_from=1.25,
         text="Y ella nunca\nlo va a saber.", fontsize=54),
]
CTA = dict(n=6, prefix="06", dur=5.0, title="DEPREDADORES EMOCIONALES",
           question="¿Conocés a alguien así?")

FLASH_DUR = 3 / FPS  # 3 frames of black before scene 4


def run(cmd):
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print("FFmpeg command failed:\n" + " ".join(cmd))
        print(proc.stderr[-4000:])
        sys.exit(1)
    return proc


def ffprobe_duration(path):
    proc = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "json", path],
        capture_output=True, text=True, check=True,
    )
    return float(json.loads(proc.stdout)["format"]["duration"])


def find_image(prefix):
    for ext in ("jpg", "jpeg", "png", "JPG", "JPEG", "PNG"):
        matches = sorted(glob.glob(os.path.join(IMG_DIR, f"{prefix}_*.{ext}")))
        matches += sorted(glob.glob(os.path.join(IMG_DIR, f"{prefix}*.{ext}")))
        if matches:
            return matches[0]
    return None


def check_required_inputs():
    missing = []
    for sc in SCENES:
        if not find_image(sc["prefix"]):
            missing.append(
                f"  - imagenes/{sc['prefix']}_*.jpg (o .png) -> Escena {sc['n']}"
            )
    if not os.path.isfile(NARR_PATH):
        missing.append("  - audio/narracion.mp3 (narracion completa, ~60s)")
    return missing


def ffexpr(expr):
    """Escape commas so the expression survives being embedded in a
    comma-separated ffmpeg filtergraph."""
    return expr.replace(",", "\\,")


def write_textfile(name, text):
    path = os.path.join(TMP_DIR, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    return path


def zoompan_filter(effect, dur, **kw):
    total_frames = max(1, int(round(dur * FPS)))
    if effect == "zoom_in":
        zoom_to = kw["zoom_to"]
        z = ffexpr(f"min(1+((({zoom_to})-1)/{total_frames})*on,{zoom_to})")
        x = "(iw-iw/zoom)/2"
        y = "(ih-ih/zoom)/2"
    elif effect == "zoom_out":
        zoom_from = kw["zoom_from"]
        z = ffexpr(f"max(({zoom_from})-((({zoom_from})-1)/{total_frames})*on,1)")
        x = "(iw-iw/zoom)/2"
        y = "(ih-ih/zoom)/2"
    elif effect == "pan":
        zoom = kw["zoom"]
        z = f"{zoom}"
        x = ffexpr(f"(iw-iw/zoom)*on/{max(1, total_frames - 1)}")
        y = "(ih-ih/zoom)/2"
    else:  # static
        z = "1"
        x = "(iw-iw/zoom)/2"
        y = "(ih-ih/zoom)/2"
    return f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s={W}x{H}:fps={FPS}"


def drawtext_filter(textfile, fontsize, y_expr="h*0.78"):
    alpha = ffexpr("min(t/0.6,1)")
    return (
        f"drawtext=fontfile='{FONT}':textfile='{textfile}':"
        f"fontcolor={TEXT_COLOR}:fontsize={fontsize}:line_spacing=10:"
        f"x=(w-text_w)/2:y={y_expr}:alpha='{alpha}':"
        f"box=1:boxcolor=black@0.35:boxborderw=24"
    )


def build_scene_clip(sc):
    img = find_image(sc["prefix"])
    out = os.path.join(TMP_DIR, f"scene{sc['n']}.mp4")
    txt_path = write_textfile(f"scene{sc['n']}.txt", sc["text"])

    base = (
        f"scale={2*W}:{2*H}:force_original_aspect_ratio=increase,"
        f"crop={2*W}:{2*H}"
    )
    zp = zoompan_filter(
        sc["effect"], sc["dur"],
        zoom_to=sc.get("zoom_to"), zoom_from=sc.get("zoom_from"),
        zoom=sc.get("zoom"),
    )
    dt = drawtext_filter(txt_path, sc["fontsize"])
    vf = f"{base},{zp},{dt},format=yuv420p"

    cmd = [
        "ffmpeg", "-y", "-loop", "1", "-framerate", str(FPS), "-i", img,
        "-t", str(sc["dur"]), "-vf", vf,
        "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-pix_fmt", "yuv420p", "-an", out,
    ]
    print(f"Renderizando escena {sc['n']} ({sc['effect']}, {sc['dur']}s)...")
    run(cmd)
    return out


def build_flash_clip():
    out = os.path.join(TMP_DIR, "flash.mp4")
    cmd = [
        "ffmpeg", "-y", "-f", "lavfi",
        "-i", f"color=c=black:s={W}x{H}:d={FLASH_DUR}:r={FPS}",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-pix_fmt", "yuv420p", "-an", out,
    ]
    print(f"Renderizando flash negro ({FLASH_DUR:.3f}s)...")
    run(cmd)
    return out


def build_cta_clip(cta):
    out = os.path.join(TMP_DIR, f"scene{cta['n']}.mp4")
    logo_img = find_image(cta["prefix"])
    title_path = write_textfile("scene6_title.txt", cta["title"])
    question_path = write_textfile("scene6_question.txt", cta["question"])

    title_dt = drawtext_filter(title_path, 44, y_expr="h*0.42")
    question_dt = drawtext_filter(question_path, 58, y_expr="h*0.55")

    if logo_img:
        base = (
            f"scale={W}:{H}:force_original_aspect_ratio=increase,"
            f"crop={W}:{H},eq=brightness=-0.25"
        )
        cmd = [
            "ffmpeg", "-y", "-loop", "1", "-framerate", str(FPS), "-i", logo_img,
            "-t", str(cta["dur"]),
            "-vf", f"{base},{title_dt},{question_dt},format=yuv420p",
            "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-an", out,
        ]
    else:
        cmd = [
            "ffmpeg", "-y", "-f", "lavfi",
            "-i", f"color=c=black:s={W}x{H}:d={cta['dur']}:r={FPS}",
            "-vf", f"{title_dt},{question_dt},format=yuv420p",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-an", out,
        ]
    suffix = " con imagen de fondo" if logo_img else " con fondo negro"
    print(f"Renderizando escena {cta['n']} (CTA{suffix})...")
    run(cmd)
    return out


def concat_clips(clip_paths):
    list_path = os.path.join(TMP_DIR, "filelist.txt")
    with open(list_path, "w") as f:
        for p in clip_paths:
            f.write(f"file '{p}'\n")
    out = os.path.join(TMP_DIR, "video_concat.mp4")
    cmd = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_path,
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-pix_fmt", "yuv420p", "-r", str(FPS), out,
    ]
    print("Concatenando escenas...")
    run(cmd)
    return out


def mux_audio(video_path):
    has_music = os.path.isfile(MUSIC_PATH)
    cmd = ["ffmpeg", "-y", "-i", video_path, "-i", NARR_PATH]
    if has_music:
        cmd += ["-i", MUSIC_PATH]
        filter_complex = (
            "[2:a]volume=0.18[music];"
            "[1:a][music]amix=inputs=2:duration=first:dropout_transition=2[aout]"
        )
        cmd += [
            "-filter_complex", filter_complex,
            "-map", "0:v", "-map", "[aout]",
        ]
        print("Mezclando narracion + musica de fondo (amix, musica al 18%)...")
    else:
        cmd += ["-map", "0:v", "-map", "1:a"]
        print("No hay audio/musica.mp3: uso solo la narracion.")
    cmd += [
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        "-shortest", "-movflags", "+faststart", OUT_PATH,
    ]
    run(cmd)


def main():
    missing = check_required_inputs()
    if missing:
        print("Faltan estos archivos antes de poder generar el video:\n")
        print("\n".join(missing))
        print(
            "\nOpcionales (mejoran el resultado pero no son obligatorios):\n"
            "  - imagenes/06_*.jpg (o .png) -> fondo/logo para la escena CTA "
            "(si no la subis, uso fondo negro generado)\n"
            "  - audio/musica.mp3 -> musica de fondo tensa en bajo volumen "
            "(si no la subis, el video queda solo con la narracion)\n"
        )
        sys.exit(1)

    narr_dur = ffprobe_duration(NARR_PATH)
    expected = sum(s["dur"] for s in SCENES) + FLASH_DUR + CTA["dur"]
    if abs(narr_dur - expected) > 2.0:
        print(
            f"Aviso: la narracion dura {narr_dur:.1f}s pero el guion de "
            f"escenas suma {expected:.1f}s. El video final usa -shortest, "
            f"asi que puede quedar cortado o con silencio al final si no "
            f"ajustas los tiempos de las escenas."
        )

    if os.path.isdir(TMP_DIR):
        shutil.rmtree(TMP_DIR)
    os.makedirs(TMP_DIR)

    clips = []
    for sc in SCENES:
        if sc.get("flash_before"):
            clips.append(build_flash_clip())
        clips.append(build_scene_clip(sc))
    clips.append(build_cta_clip(CTA))

    video_concat = concat_clips(clips)
    mux_audio(video_concat)

    shutil.rmtree(TMP_DIR)
    print(f"\nListo: {OUT_PATH}")


if __name__ == "__main__":
    main()
