#!/usr/bin/env python3
"""Reempaqueta una hoja de sprites en celdas uniformes con fondo transparente real.

Uso:
  python repack_sheet.py entrada.png --src COLSxFILAS --frames N --cell ANCHOxALTO --out salida.png [--layout COLSxFILAS] [--rows 1,2] [--key R,G,B] [--tol N] [--keep-checker]

  --src     como estan repartidos los fotogramas en la imagen original (ej. 6x1, 4x2)
  --frames  cuantos fotogramas tomar, en orden de lectura (por defecto, todos)
  --rows    (opcional) solo estas filas del original, empezando en 1 (ej. --rows 2)
  --cell    tamano de la celda de salida (ej. 208x296). Escala 1:1, sin remuestrear.
  --layout  disposicion de la hoja de salida (por defecto N columnas x 1 fila)
Cada fotograma se recorta a su caja, se centra en horizontal y se apoya en el borde inferior de la celda.
Fondo:
  - Con --key R,G,B (recomendado): se elimina ese color plano en toda la imagen (tolerancia --tol, por defecto 12).
    Genera los sprites sobre un fondo liso (ej. magenta 255,0,255) y no habra problemas.
  - Sin --key: se intenta quitar un tablero falso por relleno desde los bordes. NO es fiable si el personaje
    tiene zonas del mismo color que el fondo (ej. barba blanca): puede comerse partes del dibujo. Revisa SIEMPRE.
"""
import sys, argparse
from collections import deque
from PIL import Image
import numpy as np

def remove_bg(rgb):
    a = rgb.astype(int)
    mx, mn = a.max(axis=2), a.min(axis=2)
    cand = ((mx - mn) < 22) & (mn >= 85)          # grises claros y medios: tablero y manchas
    H, W = cand.shape
    seen = np.zeros_like(cand)
    q = deque()
    for x in range(W):
        for y in (0, H - 1):
            if cand[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if cand[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and cand[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    alpha = np.where(seen, 0, 255).astype(np.uint8)
    return np.dstack([rgb, alpha])

def main():
    p = argparse.ArgumentParser()
    p.add_argument('inp'); p.add_argument('--src', required=True); p.add_argument('--frames', type=int)
    p.add_argument('--cell', required=True); p.add_argument('--out', required=True)
    p.add_argument('--layout'); p.add_argument('--rows'); p.add_argument('--keep-checker', action='store_true')
    p.add_argument('--key'); p.add_argument('--tol', type=int, default=12)
    o = p.parse_args()
    sc, sr = map(int, o.src.lower().split('x'))
    cw, ch = map(int, o.cell.lower().split('x'))
    rgb = np.array(Image.open(o.inp).convert('RGB'))
    if o.keep_checker:
        rgba = np.dstack([rgb, np.full(rgb.shape[:2], 255, np.uint8)])
    elif o.key:
        k = np.array([int(v) for v in o.key.split(',')])
        dist = np.abs(rgb.astype(int) - k).max(axis=2)
        rgba = np.dstack([rgb, np.where(dist <= o.tol, 0, 255).astype(np.uint8)])
    else:
        print('AVISO: sin --key se usa el relleno desde los bordes; revisa que no se coma partes del personaje (barbas, ojos blancos).')
        rgba = remove_bg(rgb)
    H, W = rgba.shape[:2]
    rows = [int(r) - 1 for r in o.rows.split(',')] if o.rows else list(range(sr))
    frames = []
    for r in rows:
        for c in range(sc):
            x0, x1 = round(W * c / sc), round(W * (c + 1) / sc)
            y0, y1 = round(H * r / sr), round(H * (r + 1) / sr)
            sub = rgba[y0:y1, x0:x1]
            ys, xs = np.where(sub[:, :, 3] > 0)
            if len(ys) < 30: continue
            frames.append(sub[ys.min():ys.max()+1, xs.min():xs.max()+1])
    if o.frames: frames = frames[:o.frames]
    n = len(frames)
    lc, lr = map(int, o.layout.lower().split('x')) if o.layout else (n, 1)
    out = Image.new('RGBA', (cw * lc, ch * lr), (0, 0, 0, 0))
    warn = []
    for i, f in enumerate(frames):
        h, w = f.shape[:2]
        if w > cw or h > ch: warn.append(f'fotograma {i+1}: mide {w}x{h} y no cabe en {cw}x{ch}')
        im = Image.fromarray(f, 'RGBA')
        cx, cy = (i % lc) * cw, (i // lc) * ch
        out.paste(im, (cx + (cw - w) // 2, cy + ch - h), im)
    out.save(o.out)
    print(f'{n} fotogramas -> {o.out}  ({cw*lc}x{ch*lr}, celda {cw}x{ch}, disposicion {lc}x{lr})')
    for w in warn: print(' AVISO:', w)

if __name__ == '__main__':
    main()
