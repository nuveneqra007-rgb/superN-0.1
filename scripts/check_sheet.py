#!/usr/bin/env python3
"""Valida una hoja de sprites de superN.
Uso:  python check_sheet.py archivo.png COLUMNAS FILAS [FOTOGRAMAS_TOTALES]
Ejemplo: python check_sheet.py walk.png 6 1
Comprueba: canal alfa real, celdas iguales, caja del personaje por celda,
altura relativa y linea de los pies (deben ser parecidas en TODAS las celdas y hojas).
"""
import sys
from PIL import Image
import numpy as np

def main():
    if len(sys.argv) < 4:
        print(__doc__); sys.exit(1)
    path, cols, rows = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    total = int(sys.argv[4]) if len(sys.argv) > 4 else cols * rows
    im = Image.open(path)
    W, H = im.size
    print(f"Archivo: {path}  {W}x{H}  modo={im.mode}")
    problems = []
    if im.mode != "RGBA":
        problems.append("SIN CANAL ALFA: el fondo no es transparente (puede traer un tablero pintado)")
    a = np.array(im.convert("RGBA"))
    alpha = a[:, :, 3]
    if im.mode != "RGBA" or (alpha == 255).all():
        print("\nRESULTADO: REVISAR")
        for p in problems: print(" -", p)
        print(" - Sin transparencia real no se pueden medir los fotogramas. Exporta la hoja como PNG con alfa y vuelve a ejecutar.")
        return
    if im.mode == "RGBA":
        semi = ((alpha > 0) & (alpha < 255)).mean() * 100
        if semi > 3:
            problems.append(f"{semi:.1f}% de pixeles semitransparentes (halos o manchas): limpiar")
    if W % cols or H % rows:
        problems.append(f"El tamano {W}x{H} no se divide exacto en {cols}x{rows}: celdas desiguales")
    cw, ch = W / cols, H / rows
    print(f"Celda: {cw:.1f}x{ch:.1f}  (proporcion ancho/alto = {cw/ch:.2f}; ideal ~0.70)")
    heights, feet = [], []
    n = 0
    for r in range(rows):
        for c in range(cols):
            if n >= total: break
            x0, x1 = int(cw * c), int(cw * (c + 1))
            y0, y1 = int(ch * r), int(ch * (r + 1))
            sub = alpha[y0:y1, x0:x1] > 20
            ys, xs = np.where(sub)
            if len(ys) == 0:
                problems.append(f"Fotograma {n+1}: celda vacia"); n += 1; continue
            h = ys.max() - ys.min() + 1
            fy = (ys.max() + 1) / (y1 - y0) * 100
            heights.append(h / (y1 - y0) * 100); feet.append(fy)
            touch = xs.min() == 0 or xs.max() == (x1 - x0 - 1)
            print(f"  fotograma {n+1:2d}: alto={h/(y1-y0)*100:5.1f}% de la celda  pies a {fy:5.1f}%  {'(toca el borde lateral)' if touch else ''}")
            n += 1
    if feet:
        if max(feet) - min(feet) > 6:
            problems.append(f"Los pies cambian de altura entre fotogramas ({min(feet):.0f}%..{max(feet):.0f}%): el personaje 'salta' al animar")
        if max(feet) < 94:
            problems.append(f"Hay mucho espacio vacio bajo los pies (pies a ~{max(feet):.0f}% de la celda): dejar los pies en el borde inferior")
    print("\nRESULTADO:", "OK" if not problems else "REVISAR")
    for p in problems: print(" -", p)

if __name__ == '__main__':
    main()
