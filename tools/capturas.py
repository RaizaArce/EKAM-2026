# Capturas de todas las paginas (escritorio 1366 px y celular 375 px) para comparar antes/despues de un cambio.
# Requisitos: servidor local en el puerto 5500 (python -m http.server 5500), Google Chrome y Pillow/numpy.
# Uso:
#   python tools/capturas.py antes      (antes del cambio)
#   python tools/capturas.py despues    (despues del cambio)
#   python tools/comparar.py antes despues
# Las fuentes de Google se bloquean durante la captura para que el resultado sea estable.
# Ruido conocido: el logo del header y el fotograma del video pueden variar unos pixeles.
import subprocess, sys, os
from concurrent.futures import ThreadPoolExecutor

OUT = os.path.abspath(sys.argv[1])
os.makedirs(OUT, exist_ok=True)
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
PAGES = ['index.html', 'soluciones.html', 'sectores.html', 'privacidad.html', 'sectores/grifos/',
         'soluciones/navamovil/', 'recursos/', 'recursos/como-elegir-un-erp/']
SIZES = [(1366, 11800), (375, 15500)]


def shot(job):
    page, (w, h) = job
    name = page.replace('/', '_').replace('.', '_') + f'-{w}.png'
    path = os.path.join(OUT, name)
    # window must be >= 500px wide; the iframe inside sets the real viewport width
    for attempt in range(3):
        if os.path.exists(path):
            break
        try:
            _run(w, h, page, path)
        except subprocess.TimeoutExpired:
            pass
    return name, os.path.exists(path)


def _run(w, h, page, path):
    subprocess.run([CHROME, '--headless=new', '--hide-scrollbars', '--host-resolver-rules=MAP fonts.googleapis.com 127.0.0.1:9,MAP fonts.gstatic.com 127.0.0.1:9', f'--user-data-dir={OUT}\\profile-{w}-{abs(hash(page))}',
                    f'--window-size={max(w, 500)},{h}', '--virtual-time-budget=8000', f'--screenshot={path}',
                    f'http://localhost:5500/tools/shot.html?u={page}&w={w}&h={h}'],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=90)


jobs = [(p, s) for p in PAGES for s in SIZES]
with ThreadPoolExecutor(1) as ex:
    for name, ok in ex.map(shot, jobs):
        print(name, 'OK' if ok else 'MISSING')
