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
is('tarjetas con canto propio', d.querySelectorAll('[data-prog-edge]').length, 6);
is('canto del bloque 1', q('[data-prog-edge]').textContent.trim(), '20 mm');
is('Abrahangs fuera', /Abrahangs/.test(d.body.textContent), false);

console.log('\n== semana 1: volumen de entrada ==');
is('fuerza máxima', spec('fmax'), '4 × 7-8 s');
is('arqueo', spec('arqueo'), '3 × 5 s');
is('recruitment pull', spec('recruit'), '2 × 2 de 5 s por brazo');
is('recruitment sin porcentaje', card('recruit').querySelector('.spec.load'), null);
is('lift pull: dos series, la segunda más corta', spec('liftpull'), '2 × 6 y 2 × 4');
is('lift pull en el bloque 1 a 20 mm', card('liftpull').querySelector('[data-prog-edge]').textContent.trim(), '20 mm');
is('isométrico: las repes BAJAN, 3 la primera semana', spec('liso'), '2 × 3 de 10 s');
is('bloque 1 del isométrico en pinza', card('liso').querySelector('[data-prog-edge]').textContent.trim(), 'pinzas');
is('posición de pinza a dos manos', card('liso').querySelector('[data-prog-grip]').textContent.trim(), 'pinza · dos manos');
is('en pinza no hay porcentaje', card('liso').querySelector('.spec.load').hidden, true);
is('block and hold', spec('bhold'), '2 × 2 por brazo');
is('block and swing', spec('bswing'), '2 × 2 por brazo');
is('feet forward como ejercicio propio', spec('feetfwd'), '2 bloques');
is('freeze it como ejercicio propio', spec('freeze'), '2 bloques');
is('tres veces seguidas está en el Día C', card('tresveces').closest('section').id, 'tab-c');
is('tres veces seguidas', spec('tresveces'), '4 bloques × 3');
is('ya no hay tarjeta de drills', card('drills'), null);
is('ya no hay tarjeta de campus a secas', card('campus'), null);
is('bloque límite', spec('limite'), 'techo 12 intentos');
is('bloques feos', spec('feos'), '4 × 3 intentos');
is('dominadas', spec('pullups'), '4 × 2');
is('lock off a una repetición', spec('lockoff'), '1 × 1 · dos brazos');
is('presupuesto de intentos', 12 + 12, 24);

console.log('\n== el bloque 2 todavía no está ==');
is('dead hang fuera', off('deadhang'), true);
is('aviso del dead hang', note('deadhang').textContent.trim(), 'Bloque 2, semanas 5 a 7. Hasta entonces el bloqueo lo cubre el lock off.');
is('circuito fuera', off('circuito'), true);
is('las secuencias de campus fuera', off('campus2'), true);
is('aviso de las secuencias', note('campus2').textContent.trim(), 'Entra en el bloque 2, a partir de la semana 5.');
is('aviso del circuito', note('circuito').textContent.trim(), 'Entra en el bloque 2, a partir de la semana 5.');

console.log('\n== cargas desde el retest (pico 60, media 53, peso 68) ==');
is('fuerza máxima al 85-90 % de la media', load('fmax'), '45-47.5 kg · 85-90 % media');
is('dominadas al 25-27 % del peso', load('pullups'), '17-18.5 kg · 25-27 % peso');
is('botón de fuerza máxima', btn('fmax').textContent.trim(), 'Iniciar 4 × 8 s / 3 min');
is('timer de fuerza máxima', btn('fmax').getAttribute('data-timer'), '{"name":"Fuerza máxima","reps":4,"work":8,"rest":180}');

console.log('\n== semana 3: la más dura del bloque ==');
clickWeek(3);
is('recruitment sube repes', spec('recruit'), '2 × 4 de 5 s por brazo');
is('lift pull en la semana dura', spec('liftpull'), '3 × 3 y 3 × 2');
is('isométrico a una repe y más carga', spec('liso'), '2 × 1 de 10 s');
is('block and hold sube', spec('bhold'), '3 × 3 por brazo');
is('lock off a un brazo', spec('lockoff'), '1 × 1 · un brazo con goma');
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
is('feet forward fuera en la descarga', off('feetfwd'), true);
is('aviso del feet forward', note('feetfwd').textContent.trim(), 'Solo en las tres primeras semanas del bloque 1, como en la hoja.');
is('freeze it fuera en la descarga', off('freeze'), true);
is('block and hold recortado, no 3 × 4', spec('bhold'), '2 × 2 por brazo');

console.log('\n== semana 5: cambia el bloque entero ==');
clickWeek(5);
is('cabecera de bloque', txt('#wkBlock'), 'Bloque 2 · semana 5');
is('canto a 15 mm', q('[data-prog-edge]').textContent.trim(), '15 mm');
is('dead hang entra', off('deadhang'), false);
is('dead hang son 3 ángulos', spec('deadhang'), '3 ángulos × 3 de 3 s');
is('timer de un ángulo', btn('deadhang').getAttribute('data-timer'), '{"name":"Dead hang · un ángulo","reps":3,"work":3,"rest":3}');
is('el lock off se retira', off('lockoff'), true);
is('el recruitment se retira', off('recruit'), true);
is('aviso del recruitment', note('recruit').textContent.trim(), 'Bloque 1 solamente. En el bloque 2 el reclutamiento lo llevan las secuencias de campus.');
is('aviso del lock off', note('lockoff').textContent.trim(), 'Bloque 2: el bloqueo pasa al dead hang a 3 ángulos.');
is('isométrico pasa a 15 mm', card('liso').querySelector('[data-prog-edge]').textContent.trim(), '15 mm');
is('y a un brazo', card('liso').querySelector('[data-prog-grip]').textContent.trim(), 'half crimp · por brazo');
is('ahora sí hay porcentaje', load('liso'), '40-42.5 kg · 75-80 % media');
is('isométrico en el bloque 2', spec('liso'), '2 × 3 de 10 s por brazo');
is('lift pull pasa a 15 mm', card('liftpull').querySelector('[data-prog-edge]').textContent.trim(), '15 mm');
is('lift pull por brazo', spec('liftpull'), '2 × 6 y 2 × 4 por brazo');
is('las secuencias entran', off('campus2'), false);
is('secuencias: volumen', spec('campus2'), '2 × 3 por brazo');
is('secuencias: la pareja de la semana', card('campus2').querySelector('[data-prog-seq]').textContent.trim(), 'Esta semana: The Ladder y Squaredance');
is('el hold sale del bloque 1', off('bhold'), true);
is('aviso del hold', note('bhold').textContent.trim(), 'Bloque 1 solamente. En el bloque 2 entra en la rotación de secuencias.');
is('el swing sale del bloque 1', off('bswing'), true);
is('tres veces seguidas sale', off('tresveces'), true);
is('aviso de tres veces', note('tresveces').textContent.trim(), 'Bloque 1. En el bloque 2 el Día C lo lleva el circuito de contacto.');
is('circuito entra', off('circuito'), false);
is('circuito', spec('circuito'), '2 × circuito de 12-15 mov.');
is('feos vuelven', off('feos'), false);

console.log('\n== semana 8: test ==');
clickWeek(8);
is('isométrico: tres series de una repe', spec('liso'), '3 × 1 de 10 s por brazo');
is('lift pull en la última', spec('liftpull'), '2 × 3 y 3 × 2 por brazo');
is('las secuencias siguen, suaves', spec('campus2'), '2 × 4 por brazo');
is('secuencia de la semana 8', card('campus2').querySelector('[data-prog-seq]').textContent.trim(), 'Esta semana: The Ladder sola, y suave');
clickWeek(6);
is('secuencia de la semana 6', card('campus2').querySelector('[data-prog-seq]').textContent.trim(), 'Esta semana: Squaredance y Block and hold');
clickWeek(7);
is('secuencia de la semana 7', card('campus2').querySelector('[data-prog-seq]').textContent.trim(), 'Esta semana: Block and hold y Block and swing');
is('secuencias: semana más dura', spec('campus2'), '3 × 4 por brazo');

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
is('la cuenta sube a 8, sin el dead hang', count('tab-a'), '0 de 8');
is('estado guardado', window.localStorage.getItem('gym:tab-a'), '1');
gymA.click();
is('se apaga otra vez', count('tab-a'), '0 de 6');

console.log('\n== la cuenta ignora lo que está fuera esta semana ==');
clickWeek(1);
is('Día B al completo menos las secuencias', count('tab-b'), '0 de 11');
clickWeek(4);
is('Día B en descarga', count('tab-b'), '0 de 8');
clickWeek(5);
is('Día B en el bloque 2', count('tab-b'), '0 de 7');
is('Día C con el circuito', count('tab-c'), '0 de 3');
clickWeek(1);
is('Día C con tres veces seguidas', count('tab-c'), '0 de 3');

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

clickWeek(1);
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
is('regla del máximo por agarre', /Un solo esfuerzo máximo por sesión y por agarre/.test(d.getElementById('tab-w').textContent), true);
is('el lift pull consta como submáximo', /lift pull es volumen cargado submáximo/.test(d.getElementById('tab-w').textContent), true);

console.log('\n' + (fails === 0 ? 'TODO OK' : fails + ' FALLOS'));
window.close();
process.exit(fails === 0 ? 0 : 1);
