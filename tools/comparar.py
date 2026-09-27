# Compara dos carpetas de capturas (ver tools/capturas.py) y reporta las zonas con pixeles distintos.
import sys, os
import numpy as np
from PIL import Image

a_dir, b_dir = sys.argv[1], sys.argv[2]
total = 0
for name in sorted(os.listdir(a_dir)):
    if not name.endswith('.png'):
        continue
    pb = os.path.join(b_dir, name)
    if not os.path.exists(pb):
        print(f'{name}: falta en {b_dir}')
        continue
    a = np.asarray(Image.open(os.path.join(a_dir, name)).convert('RGB'), dtype=np.int16)
    b = np.asarray(Image.open(pb).convert('RGB'), dtype=np.int16)
    if a.shape != b.shape:
        print(f'{name}: tamaño distinto {a.shape} vs {b.shape}')
        total += 1
        continue
    diff = np.abs(a - b).max(axis=2) > 8
    n = int(diff.sum())
    if n:
        ys, xs = np.where(diff)
        print(f'{name}: {n} px distintos, zona y={ys.min()}-{ys.max()} x={xs.min()}-{xs.max()}')
        total += 1
    else:
        print(f'{name}: idéntica')
print('CON DIFERENCIAS:', total)
