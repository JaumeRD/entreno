# Pruebas

Comprobación headless de `index.html` con jsdom: carga el HTML, ejecuta el script de
verdad y afirma sobre el DOM resultante. **176 comprobaciones.**

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
- **Apertura de la sesión**: en los Días A y B se calienta primero y la rutina de entrada
  va después, numeradas en ese orden.
- **Volumen por semana** de los 15 ejercicios con progresión: fuerza máxima, arqueo,
  recruitment pull, lift pull, isométrico de 10 s, block and hold, block and swing,
  secuencias de campus, dead hang, feet forward, freeze it, tres veces seguidas, bloque
  límite, bloques feos, circuito de contacto, dominadas y lock off.
- **Que la hoja se respeta donde la comprobamos**: el isométrico baja de repeticiones
  (3, 2, 1, 1) en vez de subir, el lift pull lleva dos series con la segunda más corta,
  y «tres veces seguidas» está en el Día C y no en el Día B.
- **El presupuesto de 24 intentos duros** se mantiene en todas las semanas de carga:
  12+12 en las semanas 1, 2, 5 y 6 y 15+9 en las semanas 3 y 7.
- **Bloques**: el canto salta de 20 a 15 mm en la semana 5 en los ejercicios de carga,
  el dead hang, el circuito y las secuencias de campus entran ahí, y el block and hold,
  el block and swing, el recruitment pull y «tres veces seguidas» se retiran con su aviso.
- **Rotación de secuencias de campus**: la pareja de cada semana del bloque 2, ordenada
  de menos a más intensidad.
- **Descargas**: semanas 4 y 8 recortan volumen, los feos salen con su aviso, el feet
  forward y el freeze it salen en la semana 4.
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
- **Reglas** presentes en la pestaña Semana, incluida la del esfuerzo máximo por agarre
  y que el lift pull consta como submáximo.
- **Que no quedan tarjetas viejas**: ya no existen `campus` ni `drills` como ejercicios
  únicos, que es donde se habían colado ejercicios distintos bajo un solo número.

## Lo que NO cubre

El aspecto. jsdom no aplica CSS ni mide nada, así que todo lo visual —que las semanas
quepan, que los bloques se lean desde el muro, el contraste en modo oscuro— hay que
mirarlo en un navegador de verdad.

`Not implemented: window.scrollTo` en la sección de pestañas es una limitación de jsdom,
no un fallo de la página: el `scrollTo` al cambiar de pestaña sí funciona en el navegador.
