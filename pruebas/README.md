# Pruebas

Comprobación headless de `index.html` con jsdom: carga el HTML, ejecuta el script de
verdad y afirma sobre el DOM resultante. **133 comprobaciones.**

## Cómo se pasan

jsdom no está en el repo (el repo es público y la app no tiene dependencias). Se instala
aparte, en cualquier carpeta temporal:

```
mkdir -p /tmp/domtest && cd /tmp/domtest && npm install jsdom@24.1.0
```

```
NODE_PATH=/tmp/domtest/node_modules node pruebas/test-dom.js
```

(el segundo comando, desde la raíz del repo)

Sale `TODO OK` y código 0, o la lista de fallos con lo esperado y lo obtenido.

## Qué cubre

- **Arranque**: 4 pestañas, 8 semanas, 4 fases, que ya no existen Gym 1, Gym 2 ni Diario,
  y que los Abrahangs no aparecen en ningún sitio.
- **Volumen por semana** de los 11 ejercicios con progresión: fuerza máxima, arqueo,
  isométrico de 10 s, campus, dead hang, drills, bloque límite, bloques feos, circuito
  de contacto, dominadas y lock off.
- **El presupuesto de 24 intentos duros** se mantiene en todas las semanas de carga:
  12+12 en las semanas 1, 2, 5 y 6 y 15+9 en las semanas 3 y 7.
- **Bloques**: el canto salta de 20 a 15 mm en la semana 5 en los dos ejercicios de carga,
  el dead hang y el circuito entran ahí, y el campus cambia de formato a 12 × 1.
- **Descargas**: semanas 4 y 8 recortan volumen, los feos salen con su aviso, el campus
  sale en la semana de test.
- **Cargas**: 85-90 % de la media para 7-8 s, 75-80 % para 10 s, 50-70 % del pico para el
  arqueo según fase, 25-35 % del peso corporal para las dominadas, y que esas oscilan en
  vez de subir rectas.
- **Medición del dinamómetro**: que el pico de hoy manda sobre el retest y arrastra la
  media en proporción, y los cuatro avisos (normal, por encima, 5-10 % por debajo y más
  de un 10 % por debajo) con su color.
- **Gimnasio opcional**: se enciende y apaga, se guarda, y la cuenta del día lo refleja.
- **La cuenta del día** ignora lo que no está en juego: el gym apagado y lo que está fuera
  esta semana.
- **Marcado de ejercicios**: suma, resta, se guarda, y sobrevive al cambio de semana.
- **Temporizador**: bolas numeradas hasta 10 series, bloques en fila por encima, saltar a
  una serie concreta marca las anteriores como hechas.
- **Reglas** nuevas presentes en la pestaña Semana.

## Lo que NO cubre

El aspecto. jsdom no aplica CSS ni mide nada, así que todo lo visual —que las semanas
quepan, que los bloques se lean desde el muro, el contraste en modo oscuro— hay que
mirarlo en un navegador de verdad.

`Not implemented: window.scrollTo` en la sección de pestañas es una limitación de jsdom,
no un fallo de la página: el `scrollTo` al cambiar de pestaña sí funciona en el navegador.
