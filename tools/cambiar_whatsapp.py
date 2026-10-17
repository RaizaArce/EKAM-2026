# Cambia el numero de WhatsApp y telefono en todo el sitio (HTML y JS) con un solo comando.
# El sitio no tiene proceso de compilacion, asi que el numero esta escrito en cada pagina;
# este script lo reemplaza en todas a la vez y tools/verificar_sitio.py comprueba que quede uno solo.
# Uso (desde la raiz del proyecto), con codigo de pais y sin signos:
#   python tools/cambiar_whatsapp.py 51987654321
# Reemplaza las tres formas en que aparece: 51949882756, +51949882756 y +51 949 882 756.
import os
import re
import sys

EXCLUIR = {'.git', '.github', '.claude', 'tmp', 'crm', 'node_modules'}


def formato_visible(numero):
    pais, resto = numero[:2], numero[2:]
    return '+%s %s' % (pais, ' '.join(resto[i:i + 3] for i in range(0, len(resto), 3)))


def numero_actual():
    with open(os.path.join('js', 'main.js'), encoding='utf-8') as archivo:
        return re.search(r"WHATSAPP_NUMBER = '(\d+)'", archivo.read()).group(1)


def main():
    if len(sys.argv) != 2 or not re.fullmatch(r'51\d{9}', sys.argv[1]):
        print('Uso: python tools/cambiar_whatsapp.py 51XXXXXXXXX (codigo de pais 51 + 9 digitos)')
        return 1
    nuevo, viejo = sys.argv[1], numero_actual()
    if nuevo == viejo:
        print('El sitio ya usa ese numero.')
        return 0
    cambios = [(formato_visible(viejo), formato_visible(nuevo)), (viejo, nuevo)]
    archivos = total = 0
    for carpeta, subcarpetas, nombres in os.walk('.'):
        subcarpetas[:] = [s for s in subcarpetas if s not in EXCLUIR]
        for nombre in nombres:
            if not nombre.endswith(('.html', '.js')):
                continue
            ruta = os.path.join(carpeta, nombre)
            with open(ruta, encoding='utf-8', newline='') as archivo:
                texto = archivo.read()
            nuevo_texto = texto
            for antes, despues in cambios:
                nuevo_texto = nuevo_texto.replace(antes, despues)
            if nuevo_texto != texto:
                total += sum(texto.count(antes) for antes, _ in cambios)
                archivos += 1
                with open(ruta, 'w', encoding='utf-8', newline='') as archivo:
                    archivo.write(nuevo_texto)
    print('%s -> %s: %d reemplazos en %d archivos.' % (viejo, nuevo, total, archivos))
    print('Ejecuta ahora: python tools/verificar_sitio.py')
    return 0


if __name__ == '__main__':
    sys.exit(main())
