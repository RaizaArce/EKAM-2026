# Verifica la integridad del sitio sin abrir el navegador. No necesita dependencias.
# Uso (desde la raiz del proyecto):
#   python tools/verificar_sitio.py
# Falla (codigo de salida 1) si encuentra:
#   - enlaces, imagenes, estilos o scripts locales que no existen
#   - anclas (#seccion) que apuntan a un id inexistente
#   - paginas que faltan en sitemap.xml, o entradas del sitemap sin pagina
#   - un mismo .css/.js enlazado con versiones ?v= distintas segun la pagina
#   - JSON-LD invalido
# Solo avisa (no falla) de los archivos de assets/ que ninguna pagina usa.
import json
import os
import re
import sys
from urllib.parse import unquote

DOMINIO = 'https://www.ekamperu.com/'
EXCLUIR = {'.git', '.github', '.claude', 'tmp', 'tools', 'crm', 'node_modules'}
EXTERNO = re.compile(r'^(https?:|mailto:|tel:|data:|javascript:|//)')


def leer(ruta):
    with open(ruta, encoding='utf-8') as archivo:
        return archivo.read()


def paginas_html():
    encontradas = []
    for carpeta, subcarpetas, archivos in os.walk('.'):
        subcarpetas[:] = [s for s in subcarpetas if s not in EXCLUIR]
        for nombre in archivos:
            if nombre.endswith('.html'):
                encontradas.append(os.path.normpath(os.path.join(carpeta, nombre)))
    return sorted(encontradas)


def referencias(html):
    refs = re.findall(r'(?:href|src|poster|data-src|data-poster)="([^"]+)"', html)
    for srcset in re.findall(r'srcset="([^"]+)"', html):
        refs += [parte.strip().split(' ')[0] for parte in srcset.split(',')]
    return refs


def main():
    paginas = paginas_html()
    contenido = {p: leer(p) for p in paginas}
    ids = {p: set(re.findall(r'\bid="([^"]+)"', html)) for p, html in contenido.items()}
    errores, usados, versiones = [], set(), {}

    for pagina, html in contenido.items():
        for ref in referencias(html):
            if EXTERNO.match(ref) or ref == '#':
                continue
            ruta, _, ancla = ref.partition('#')
            ruta, _, consulta = ruta.partition('?')
            destino = os.path.normpath(os.path.join(os.path.dirname(pagina), unquote(ruta))) if ruta else pagina
            if os.path.isdir(destino):
                destino = os.path.join(destino, 'index.html')
            if not os.path.exists(destino):
                errores.append(f'{pagina}: no existe "{ref}"')
                continue
            usados.add(destino)
            if ancla and destino in ids and ancla not in ids[destino]:
                errores.append(f'{pagina}: el ancla "{ref}" no existe en {destino}')
            if destino.endswith(('.css', '.js')):
                versiones.setdefault(destino, {}).setdefault(consulta, []).append(pagina)

        for bloque in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
            try:
                json.loads(bloque)
            except ValueError as error:
                errores.append(f'{pagina}: JSON-LD invalido ({error})')

    for archivo, por_version in sorted(versiones.items()):
        if len(por_version) > 1:
            detalle = ', '.join(f'"?{v}" en {len(p)} pag.' for v, p in sorted(por_version.items()))
            errores.append(f'{archivo}: versiones de cache distintas ({detalle})')

    en_sitemap = set()
    for loc in re.findall(r'<loc>([^<]+)</loc>', leer('sitemap.xml')):
        ruta = loc.replace(DOMINIO, '', 1) or 'index.html'
        if ruta.endswith('/'):
            ruta += 'index.html'
        en_sitemap.add(os.path.normpath(ruta))
    for pagina in sorted(set(paginas) - en_sitemap):
        errores.append(f'{pagina}: falta en sitemap.xml')
    for ruta in sorted(en_sitemap - set(paginas)):
        errores.append(f'sitemap.xml: "{ruta}" no existe')

    estilos_y_scripts = ''.join(
        leer(os.path.join(carpeta, nombre))
        for carpeta in ('css', 'js') for nombre in sorted(os.listdir(carpeta))
    )
    todo_el_html = ''.join(contenido.values())
    sin_uso = []
    for carpeta, _, archivos in os.walk('assets'):
        for nombre in archivos:
            ruta = os.path.normpath(os.path.join(carpeta, nombre))
            if ruta not in usados and nombre not in estilos_y_scripts and nombre not in todo_el_html:
                sin_uso.append(ruta)

    print(f'Paginas revisadas: {len(paginas)}')
    for ruta in sorted(sin_uso):
        print(f'AVISO  asset sin uso: {ruta}')
    for error in errores:
        print(f'ERROR  {error}')
    if errores:
        print(f'\n{len(errores)} error(es).')
        return 1
    print('Sin errores.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
