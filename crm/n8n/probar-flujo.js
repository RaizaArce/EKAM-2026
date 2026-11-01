// Ejecuta los dos nodos de código del flujo con datos de ejemplo, sin llamar a ninguna API.
// Uso: node crm/n8n/probar-flujo.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'asistente-web.workflow.json'), 'utf8'));
const nodo = (n) => d.nodes.find((x) => x.name === n);
const correr = (n, $json) => new Function('$json', nodo(n).parameters.jsCode)($json)[0].json;

// Conexiones: cada destino existe y se llega de Webhook a Responder.
const nombres = d.nodes.map((n) => n.name);
for (const [o, v] of Object.entries(d.connections)) { assert(nombres.includes(o), o); assert(nombres.includes(v.main[0][0].node)); }
let actual = 'Webhook'; const ruta = [actual];
while (d.connections[actual]) { actual = d.connections[actual].main[0][0].node; ruta.push(actual); }
assert.strictEqual(ruta.join('>'), 'Webhook>Preparar consulta>Claude>Extraer respuesta>Responder a la web');

// Sin rastros de Gemini ni claves dentro del archivo.
const crudo = JSON.stringify(d);
assert(!/gemini|googleapis/i.test(crudo));
assert(!/sk-ant/.test(crudo));

// Preparar consulta
let r = correr('Preparar consulta', { body: { mensaje: '  ¿Qué es NAVASOFT?  ', historial: [
  { rol: 'asistente', texto: 'Hola' }, { rol: 'usuario', texto: 'Hola' }, { rol: 'asistente', texto: 'Dime' }, { rol: 'usuario', texto: '' },
] } }).claude;
assert.strictEqual(r.model, 'claude-haiku-5-5');
assert.strictEqual(r.messages[0].role, 'user');
assert.deepStrictEqual(r.messages.map((m) => m.role), ['user', 'assistant', 'user']);
assert.strictEqual(r.messages.at(-1).content, '¿Qué es NAVASOFT?');
assert(r.system.includes('asistente virtual de la web de EKAM'));
assert(!('temperature' in r), 'temperature no se admite');
const largo = correr('Preparar consulta', { body: { mensaje: 'x'.repeat(900) } }).claude.messages[0].content;
assert.strictEqual(largo.length, 400);
assert.strictEqual(correr('Preparar consulta', {}).claude.messages[0].content, 'Hola');

// Extraer respuesta
const AVISO = /WhatsApp/;
assert.strictEqual(correr('Extraer respuesta', { stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: ' NAVASOFT es un ERP. ' }] }).respuesta, 'NAVASOFT es un ERP.');
assert(AVISO.test(correr('Extraer respuesta', { stop_reason: 'refusal', content: [] }).respuesta));
assert(AVISO.test(correr('Extraer respuesta', { error: { message: '401' } }).respuesta));
assert(AVISO.test(correr('Extraer respuesta', { stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: '' }] }).respuesta));
console.log('Todas las pruebas pasaron:', ruta.join(' > '));
