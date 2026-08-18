#!/usr/bin/env python3
"""Convierte el transcript de YouTube (JSON con segmentos) en un .md con timestamps.

Uso:
    python herramientas/split_segments.py vhPba8QZeLI
"""
import io
import json
import sys

MATERIALES = r"C:\Users\Roman\Desktop\Проекты\Скауты Парагвая\materiales"


def main(video_id: str) -> None:
    p = MATERIALES + rf"\{video_id}_transcript.json"
    segs = json.load(io.open(p, encoding="utf-8"))
    out = []
    for s in segs:
        m = int(s["start"] // 60)
        sec = int(s["start"] % 60)
        t = "%02d:%02d" % (m, sec)
        out.append("[%s] %s" % (t, s["text"]))
    txt = "\n".join(out)
    dest = MATERIALES + rf"\{video_id}_segmentos.md"
    io.open(dest, "w", encoding="utf-8").write(txt)
    print("segmentos:", len(out), "chars:", len(txt))
    print("salida:", dest)


if __name__ == "__main__":
    main(sys.argv[1])