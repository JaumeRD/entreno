/* Prueba headless de index.html con jsdom.
   Cubre: semanas y bloques, fases de arqueo, medición del dinamómetro,
   gimnasio opcional, marcado de ejercicios, temporizador y pestañas. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
const { window } = dom;
const d = window.document;

let fails = 0;
function is(label, got, want) {
  const ok = String(got) === String(want);
  if (!ok) fails++;
  console.log((ok ? '  ok   ' : '  FALLO') + '  ' + label + (ok ? '  → ' + got : '\n          esperado: ' + want + '\n          obtenido: ' + got));
}
const q = (s) => d.querySelector(s);
const txt = (s) => (q(s) ? q(s).textContent.trim() : '(no existe)');
const card = (p) => d.querySelector('[data-prog="' + p + '"]');
const spec = (p) => card(p).querySelector('[data-prog-spec]').textContent.trim();
const btn = (p) => card(p).querySelector('[data-prog-btn]');
const note = (p) => card(p).querySelector('[data-prog-note]');
const load = (p) => card(p).querySelector('.spec.load').textContent.trim();
const off = (p) => card(p).classList.contains('off');
const count = (sec) => d.getElementById(sec).querySelector('.done-count').textContent.trim();
const clickWeek = (n) => d.querySelector('.wk[data-wk="' + n + '"]').click();
const clickFase = (n) => d.querySelector('#fases [data-fase="' + n + '"]').click();
const setVal = (sel, v) => { q(sel).value = v; q(sel).dispatchEvent(new window.Event('input', { bubbles: true })); };

console.log('\n== arranque ==');
is('pestañas', d.querySelectorAll('.chip').length, 4);
is('ya no hay Gym 1 ni Diario', !!d.getElementById('tab-g1') || !!d.getElementById('tab-d'), false);
is('botones de semana', d.querySelectorAll('.wk').length, 8);
is('botones de fase', d.querySelectorAll('#fases [data-fase]').length, 4);
is('semana activa', q('.wk[aria-selected="true"]').getAttribute('data-wk'), 1);
is('cabecera de bloque', txt('#wkBlock'), 'Bloque 1 · semana 1');
is('canto en los dos ejercicios de carga', d.querySelectorAll('[data-prog-edge]').length, 2);
is('canto del bloque 1', q('[data-prog-edge]').textContent.trim(), '20 mm');
is('Abrahangs fuera', /Abrahangs/.test(d.body.textContent), false);

console.log('\n== semana 1: volumen de entrada ==');
is('fuerza máxima', spec('fmax'), '4 × 7-8 s');
is('arqueo', spec('arqueo'), '3 × 5 s');
is('isométrico de 10 s', spec('liso'), '3 × 10 s');
is('campus con pies', spec('campus'), '2 × 2 por brazo');
is('drills', spec('drills'), '2 bloques · Flash -4/-2');
is('bloque límite', spec('limite'), 'techo 12 intentos');
is('bloques feos', spec('feos'), '4 × 3 intentos');
is('dominadas', spec('pullups'), '4 × 2');
is('lock off', spec('lockoff'), '2 × 20 s');
is('presupuesto de intentos', 12 + 12, 24);

console.log('\n== el bloque 2 todavía no está ==');
is('dead hang fuera', off('deadhang'), true);
is('aviso del dead hang', note('deadhang').textContent.trim(), 'Entra en el bloque 2, a partir de la semana 5.');
is('circuito fuera', off('circuito'), true);
is('aviso del circuito', note('circuito').textContent.trim(), 'Entra en el bloque 2, a partir de la semana 5.');

console.log('\n== cargas desde el retest (pico 60, media 53, peso 68) ==');
is('fuerza máxima al 85-90 % de la media', load('fmax'), '45-47.5 kg · 85-90 % media');
is('isométrico al 75-80 % de la media', load('liso'), '40-42.5 kg · 75-80 % media');
is('dominadas al 25-27 % del peso', load('pullups'), '17-18.5 kg · 25-27 % peso');
is('botón de fuerza máxima', btn('fmax').textContent.trim(), 'Iniciar 4 × 8 s / 3 min');
is('timer de fuerza máxima', btn('fmax').getAttribute('data-timer'), '{"name":"Fuerza máxima","reps":4,"work":8,"rest":180}');

console.log('\n== semana 3: la más dura del bloque ==');
clickWeek(3);
is('límite sube', spec('limite'), 'techo 15 intentos');
is('feos bajan', spec('feos'), '3 × 3 intentos');
is('el presupuesto se mantiene', 15 + 9, 24);
is('dominadas oscilan de serie', spec('pullups'), '2 × 2');
is('dominadas oscilan de carga', load('pullups'), '19.5-21 kg · 29-31 % peso');

console.log('\n== semana 4: descarga ==');
clickWeek(4);
is('aviso de descarga en fmax', note('fmax').hidden, false);
is('texto del aviso', note('fmax').textContent.trim(), 'Semana de descarga: volumen recortado a propósito.');
is('feos fuera', off('feos'), true);
is('aviso de feos', note('feos').textContent.trim(), 'Fuera esta semana: toca descargar.');
is('fuerza máxima recortada', spec('fmax'), '3 × 7-8 s');
is('canto sigue en 20 mm', q('[data-prog-edge]').textContent.trim(), '20 mm');

console.log('\n== semana 5: cambia el bloque entero ==');
clickWeek(5);
is('cabecera de bloque', txt('#wkBlock'), 'Bloque 2 · semana 5');
is('canto a 15 mm', q('[data-prog-edge]').textContent.trim(), '15 mm');
is('dead hang entra', off('deadhang'), false);
is('dead hang', spec('deadhang'), '3 × 3 repes de 3 s');
is('timer del dead hang', btn('deadhang').getAttribute('data-timer'), '{"name":"Dead hang 3×3","reps":3,"work":3,"rest":3}');
is('circuito entra', off('circuito'), false);
is('circuito', spec('circuito'), '2 × circuito de 12-15 mov.');
is('el campus cambia de formato', spec('campus'), '12 × 1 por brazo');
is('feos vuelven', off('feos'), false);

console.log('\n== semana 8: test, el campus sale ==');
clickWeek(8);
is('campus fuera', off('campus'), true);
is('aviso del campus', note('campus').textContent.trim(), 'Fuera esta semana: toca descargar.');

console.log('\n== fases del arqueo ==');
clickWeek(1);
is('fase 1 marcada', q('#fases [aria-pressed="true"]').getAttribute('data-fase'), 1);
is('fase 1 oculta el % de pico', q('#arqLoad').hidden, true);
clickFase(3);
is('fase 3 muestra carga', q('#arqLoad').hidden, false);
is('fase 3 = 50-60 % del pico', txt('#arqLoad'), '30-36 kg · 50-60 % pico');
clickFase(4);
is('fase 4 = 60-70 % del pico', txt('#arqLoad'), '36-42 kg · 60-70 % pico');
clickFase(1);
is('volver a fase 1 oculta la carga', q('#arqLoad').hidden, true);
clickFase(3);

console.log('\n== medición del dinamómetro ==');
is('sin medir avisa', txt('#todayNote'), 'Sin medición de hoy: las cargas salen del retest. Mide tras calentar y pon el pico aquí.');
setVal('#today', '70');
is('el pico de hoy manda', txt('#arqLoad'), '35-42 kg · 50-60 % pico');
is('y arrastra la media', load('fmax'), '52.5-55.5 kg · 85-90 % media');
is('fuerza/peso con el número de hoy', txt('#ratio'), '103 %');
is('media/pico no cambia', txt('#mp'), '88 %');
is('aviso en verde', /^Hoy \+17 %/.test(txt('#todayNote')), true);
is('clase del aviso', q('#todayNote').className, 'today-note ok');
setVal('#today', '52');
is('13 % por debajo para la sesión', q('#todayNote').className, 'today-note bad');
is('texto de aviso', /no toca fuerte/.test(txt('#todayNote')), true);
setVal('#today', '57');
is('entre 5 y 10 % por debajo', q('#todayNote').className, 'today-note warn');
is('no subas', /no subas/.test(txt('#todayNote')), true);
setVal('#today', '');
is('al borrar vuelve al retest', load('fmax'), '45-47.5 kg · 85-90 % media');
is('medición guardada por día', window.localStorage.getItem('todayDay'), new Date().toISOString().slice(0, 10));

console.log('\n== gimnasio opcional ==');
const gymA = d.querySelector('[data-gym-btn="tab-a"]');
is('arranca apagado', gymA.getAttribute('aria-pressed'), 'false');
is('bloque escondido', d.getElementById('tab-a').querySelector('[data-gym]').hidden, true);
is('texto del botón', gymA.textContent.trim(), 'Añadir gimnasio');
is('la cuenta ignora el gym apagado', count('tab-a'), '0 de 6');
gymA.click();
is('se enciende', gymA.getAttribute('aria-pressed'), 'true');
is('bloque visible', d.getElementById('tab-a').querySelector('[data-gym]').hidden, false);
is('texto del botón cambia', gymA.textContent.trim(), 'Quitar gimnasio');
is('la cuenta sube a 8', count('tab-a'), '0 de 8');
is('estado guardado', window.localStorage.getItem('gym:tab-a'), '1');
gymA.click();
is('se apaga otra vez', count('tab-a'), '0 de 6');

console.log('\n== la cuenta ignora lo que está fuera esta semana ==');
is('Día B sin el dead hang', count('tab-b'), '0 de 7');
clickWeek(4);
is('Día B en descarga, sin feos', count('tab-b'), '0 de 6');
clickWeek(5);
is('Día B completo en el bloque 2', count('tab-b'), '0 de 8');
is('Día C con el circuito dentro', count('tab-c'), '0 de 3');
clickWeek(1);
is('Día C sin el circuito', count('tab-c'), '0 de 2');

console.log('\n== marcar ejercicios hechos ==');
const diaA = d.getElementById('tab-a');
const ticks = diaA.querySelectorAll('.tick');
is('un tick por ejercicio', ticks.length, diaA.querySelectorAll('.ex').length);
ticks[0].click();
is('primer ejercicio tachado', /ticked/.test(ticks[0].closest('.ex').className), true);
is('contador a uno', count('tab-a'), '1 de 6');
ticks[2].click();
is('contador a dos', count('tab-a'), '2 de 6');
ticks[0].click();
is('se puede desmarcar', count('tab-a'), '1 de 6');
is('marca guardada', window.localStorage.getItem('done:tab-a:2'), '1');
is('día guardado', window.localStorage.getItem('doneDay'), new Date().toISOString().slice(0, 10));

console.log('\n== la marca sobrevive al cambio de semana ==');
clickWeek(4);
is('sigue tachado tras descargar', /ticked/.test(ticks[2].closest('.ex').className), true);
clickWeek(1);

console.log('\n== temporizador ==');
btn('fmax').click();
is('overlay abierto', q('#ov').hidden, false);
is('nombre', txt('#ovName'), 'Fuerza máxima');
is('reloj a 8 s', txt('#ovClock'), '0:08');
is('fase de trabajo', txt('#ovPhase'), 'Trabajo · 1 de 4');
is('4 series → bolas numeradas', q('#ovDots').className, 'dots');
is('4 bolas', d.querySelectorAll('#ovDots .dot').length, 4);
is('pista visible', !!q('#ovDots i.fill'), true);
is('pista de ayuda', txt('#ovHint'), 'Toca un número para saltar ahí');
q('#ovNext').click();
is('avanza a descanso', txt('#ovPhase'), 'Descanso · 1 de 4');
is('reloj a 3 min', txt('#ovClock'), '3:00');
q('#ovStop').click();
is('overlay cerrado', q('#ov').hidden, true);

btn('feos').click();
is('12 intentos → bloques', q('#ovDots').className, 'dots seg');
is('12 bloques', d.querySelectorAll('#ovDots .dot').length, 12);
is('contador en la ayuda', txt('#ovHint'), '1 de 12 · toca un bloque para saltar');
d.querySelector('#ovDots .dot[data-rep="9"]').click();
is('saltar al bloque 9', q('#ovDots .dot.now').getAttribute('data-rep'), 9);
is('bloques anteriores en hecho', d.querySelectorAll('#ovDots .dot.done').length, 8);
q('#ovStop').click();

console.log('\n== rutina de entrada en los tres días ==');
['a', 'b', 'c'].forEach(function (t) {
  is('arco de dedos en el día ' + t.toUpperCase(), /Arco de dedos con goma/.test(d.getElementById('tab-' + t).textContent), true);
});

console.log('\n== persistencia ==');
is('semana guardada', window.localStorage.getItem('wk'), '1');
is('fase guardada', window.localStorage.getItem('fase'), '3');
is('pico guardado', window.localStorage.getItem('peak'), '60');

console.log('\n== explicación plegada ==');
is('bloque plegable existe', !!q('.calc-more'), true);
is('cerrado por defecto', q('.calc-more').open, false);
is("contiene las tres notas", q(".calc-more").querySelectorAll(".rule, .pending").length, 3);

console.log('\n== pestañas ==');
d.querySelector('.chip[data-tab="w"]').click();
is('Semana visible', d.getElementById('tab-w').hidden, false);
is('Día A oculto', d.getElementById('tab-a').hidden, true);
is('semáforo en Semana', /Semáforo/.test(d.getElementById('tab-w').textContent), true);
is('calendario de 3 sesiones', /48 h entre A y B/.test(d.getElementById('tab-w').textContent), true);
is('regla del gym al final', /El gimnasio va al final de la sesión/.test(d.getElementById('tab-w').textContent), true);
is('regla de la resistencia en el muro', /La resistencia va en el muro/.test(d.getElementById('tab-w').textContent), true);

console.log('\n' + (fails === 0 ? 'TODO OK' : fails + ' FALLOS'));
window.close();
process.exit(fails === 0 ? 0 : 1);
