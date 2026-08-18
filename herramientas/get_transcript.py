#!/usr/bin/env python3
"""Extrae el transcript automático (o manual) de una charla de YouTube.

Uso:
    python herramientas/get_transcript.py vhPba8QZeLI

Salida (en materiales/):
    <id>_transcript.json  — segmentos [{start, dur, text}]
    <id>_texto.txt        — texto plano completo
"""
import io
import json
import os
import sys

from youtube_transcript_api import YouTubeTranscriptApi

OUT_DIR = r"C:\Users\Roman\Desktop\Проекты\Скауты Парагвая\materiales"


def ensure_out_dir() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)


def main(video_id: str) -> None:
    ensure_out_dir()
    api = YouTubeTranscriptApi()
    seek = api.list(video_id)
    langs = [t.language_code for t in seek]
    print("idiomas disponibles:", langs)

    try:
        transcript = seek.find_transcript(["es"])
    except Exception:
        transcript = seek.find_generated_transcript(["es"])

    segments = [
        {"start": round(s.start, 2), "dur": round(s.duration, 2), "text": s.text}
        for s in transcript.fetch()
    ]

    base = f"{OUT_DIR}\\{video_id}_transcript.json"
    with io.open(base, "w", encoding="utf-8") as f:
        json.dump(segments, f, ensure_ascii=False, indent=1)

    full = " ".join(s["text"] for s in segments)
    txt = f"{OUT_DIR}\\{video_id}_texto.txt"
    with io.open(txt, "w", encoding="utf-8") as f:
        f.write(full)

    print("SEGMENTOS:", len(segments))
    print("CARACTERES:", len(full))
    print("JSON:", base)
    print("TXT:", txt)


if __name__ == "__main__":
    main(sys.argv[1])