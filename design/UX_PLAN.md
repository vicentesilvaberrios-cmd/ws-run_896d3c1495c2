# Plan de UX — Flappy Bird (Next.js + TS)

Una sola ruta. Toda la experiencia es **una pantalla de juego** que cambia de estado
(`START` → `PLAYING` → `GAME_OVER`) y se renderiza en un canvas. Los overlays (START /
GAME_OVER) y el marcador viven sobre el canvas. **Mobile-first**, sin navegación,
sin formularios, sin tablas. El idioma visible es español.

---

## Convenciones globales (aplican a todo)

- Layout raíz: `app/page.tsx` ocupa toda la ventana. Fondo con `var(--bg)`. El área de
  juego centrada, relación vertical fija (p. ej. 9:16 en móvil, máx ~480×854 en escritorio).
- Tipografía del juego: `var(--font-sans)` con tamaños `var(--fs-2xl/3xl)` para títulos y
  marcador; `var(--fs-sm)` para textos secundarios.
- Marca/acentos: el "color del cielo" se ajusta vía `--brand` en `:root` (no colores sueltos).
- Botones: siempre `.btn .btn-primary` (mín. 40px de alto) — un solo estilo primario.
- Estados obligatorios por pantalla:
  - **Cargando** → el canvas muestra texto "Cargando partida…" centrado (mientras se lee
    `localStorage`). Desaparece en <300 ms.
  - **Vacío / Error** → no aplican al juego en sí, pero sí si `localStorage` falla: mostrar
    `.alert-error` pequeño bajo el canvas ("No pudimos guardar tu récord, pero puedes jugar").
- Sin navbar ni breadcrumbs (es un juego de una sola pantalla).
- Accesibilidad:
  - Contenedor del juego con `role="application"`, `aria-label="Juego Flappy Bird"`.
  - Canvas con `aria-label` dinámico: "Toca o pulsa espacio para empezar" / "Puntuación X"
    / "Has perdido. Puntuación X. Pulsa para reiniciar".
  - Toda interacción principal también responde a **teclado** (`Espacio` / `↑`) y a
    **clic/toque** sobre el canvas o los botones.
  - Foco visible (heredado del `globals.css`); al cambiar de estado, mover foco al botón
    primario del overlay (`Empezar` / `Volver a jugar`).

---

## 1. Página principal del juego — `app/page.tsx`

- **Ruta:** `/` (única ruta de la spec).
- **Objetivo del usuario:** jugar una partida de Flappy Bird desde el primer toque, en menos
  de 3 segundos tras cargar.
- **Layout (mobile-first):**
  - `main` con `display: grid; place-items: center; min-height: 100dvh; padding: var(--sp-4)`.
  - Contenedor del juego: `<div class="card" style="padding:0; overflow:hidden;">` envolviendo
    el canvas. Sombra `--shadow`, bordes redondeados `--radius`.
  - Apilados sobre el canvas, condicionalmente:
    - `StartScreen` cuando `state === 'START'`.
    - `ScoreDisplay` cuando `state === 'PLAYING'`.
    - `GameOverScreen` cuando `state === 'GAME_OVER'`.
- **Componentes a montar:** `<GameCanvas>` (siempre), `<ScoreDisplay>`, `<StartScreen>`,
  `<GameOverScreen>`. Lógica en `useFlappyGame` (estado + handlers `onFlap`, `onStart`,
  `onRestart`).
- **Responsive:**
  - Móvil (<640px): canvas a 100% del ancho disponible, alto proporcional 9:16.
  - Escritorio (≥640px): canvas a 480px de ancho, centrado; el resto de la ventana usa
    `var(--bg)`.
- **Copy breve en pantalla (solo carga):**
  - "Cargando partida…" — `class="muted text-sm"`, centrado en el canvas.

---

## 2. Pantalla de inicio — `app/components/StartScreen.tsx`

- **Objetivo:** el jugador entiende qué hacer y arranca en 1 toque.
- **Layout:** overlay absoluto sobre el canvas, centrado. `class="card"` semitransparente
  (`background: color-mix(in srgb, var(--surface) 92%, transparent)`), `padding: var(--sp-6)`,
  `max-width: 360px`, `text-align: center`.
- **Estructura:**
  - `h1` "Flappy Bird" — `var(--fs-3xl)`.
  - `p.muted` — "Salta entre las tuberías sin chocar." (instrucción clara del dominio).
  - `p.text-sm muted` — "Toca la pantalla, haz clic o pulsa **Espacio** para volar." (pista
    de controles, **negrita** solo en la tecla).
  - Botón `.btn .btn-primary .btn-block` "Empezar a jugar".
  - Si hay récord guardado: pequeño `.badge .badge-info` arriba: "Récord: N".
- **Estados:**
  - Cargando (leyendo récord): botón deshabilitado (`disabled`) con texto "Cargando…".
  - Normal: botón activo.
- **Accesibilidad:**
  - El botón recibe el foco automáticamente al montar.
  - `aria-label` redundante en el botón no necesario (el texto ya lo describe).

---

## 3. Marcador durante el juego — `app/components/ScoreDisplay.tsx`

- **Objetivo:** el jugador ve su puntuación actual y su récord en todo momento.
- **Layout:** posicionado absoluto dentro del contenedor del canvas.
  - Puntuación actual: centrada arriba, grande (`var(--fs-3xl)`, peso 700, color blanco con
    sombra de texto para contraste sobre el cielo). `role="status"`, `aria-live="polite"` para
    anunciar cada nuevo punto (con `aria-atomic="true"`).
  - Récord: esquina superior izquierda, pequeño, `.badge .badge-info`:
    "Récord: N" (oculto si es 0).
- **Visibilidad:** solo se monta cuando `state === 'PLAYING'` (así no interfiere con los
  overlays de inicio/fin).
- **Responsive:** escala con el canvas; usar unidades relativas al contenedor, no `px`.

---

## 4. Pantalla de fin de partida — `app/components/GameOverScreen.tsx`

- **Objetivo:** el jugador ve su resultado, celebra si hay récord y reinicia sin fricción.
- **Layout:** overlay absoluto centrado, `class="card"` semitransparente (mismo patrón que
  `StartScreen`), `max-width: 360px`, `text-align: center`.
- **Estructura:**
  - `h2` "¡Fin de la partida!" — `var(--fs-2xl)`.
  - Bloque `.kpi` grande con la puntuación final (`value` = número, `label = "Puntuación"`).
  - Récord: `.kpi` secundario con `value` = récord y `label = "Mejor puntuación"`. Si la
    partida actual lo supera: `.badge .badge-ok` "¡Nuevo récord!" entre los dos KPIs.
  - Botón `.btn .btn-primary .btn-block` "Volver a jugar".
  - `p.text-sm muted` — "Pulsa **Espacio** o toca la pantalla para reiniciar." (atajo visible
    para no obligar a apuntar al botón).
- **Estados:**
  - Normal: botón activo.
  - Sin cambios especiales (no hay carga/error aquí).
- **Accesibilidad:**
  - Foco se mueve al botón "Volver a jugar" al entrar al estado.
  - `aria-live="polite"` en el contenedor para que lectores de pantalla anuncien el resultado.
- **Nota:** reinicio **no** pide confirmación (acción no destructiva, y el flujo del juego
  espera respuesta inmediata). El récord nuevo se persiste en `localStorage` sin molestar.

---

## 5. Canvas del juego — `app/components/GameCanvas.tsx`

- **Objetivo:** dibujar pájaro, tuberías, fondo y suelo con animación fluida; ser el área
  interactiva principal (tap/clic/tecla = saltar).
- **Layout:** `<canvas>` que ocupa todo el `<div class="card">` padre. `width/height` ajustados
  por `ResizeObserver` para mantener proporción y nitidez (`devicePixelRatio`).
- **Comportamiento:**
  - Captura `keydown` (Espacio, ↑) y `pointerdown` sobre sí mismo → llama `onFlap()`.
  - En `START` el primer tap hace de "Empezar" además de saltar (atajo para <3s al juego).
  - En `GAME_OVER` el primer tap hace de "Reiniciar".
- **Accesibilidad:**
  - `tabIndex={0}` para poder recibir foco y eventos de teclado.
  - `aria-label` dinámico según estado (ver sección global).
  - Foco visible (heredado).
- **Responsive:** el canvas se redimensiona con la ventana; el mundo del juego escala, no se
  recorta. En pantallas muy anchas, se limita el ancho del contenedor a 480px y se centra.

---

## 6. Lógica del juego — `app/hooks/useFlappyGame.ts`

No es una pantalla, pero define el **contrato de UX** que las anteriores consumen:

- **Estado expuesto:** `{ state: 'START' | 'PLAYING' | 'GAME_OVER', score, highScore,
  flap, start, restart }`.
- **Reglas de interacción (mapeadas a copy de UI):**
  - `flap()` → solo tiene efecto visual durante `PLAYING`; en `START` equivale a `start()`;
    en `GAME_OVER` equivale a `restart()`. Esto sustenta los atajos de teclado/tap.
  - `start()` y `restart()` → transiciones de estado instantáneas, sin spinners.
  - Récord: se lee al montar, se escribe al terminar la partida si `score > highScore`.
- **Manejo de errores:** si `localStorage` lanza (modo privado, cuota llena), se ignora
  silenciosamente y la UI muestra el `.alert-error` descrito en la sección global.

---

## Resumen de consistencia entre pantallas

| Elemento            | Patrón único                                                                 |
|---------------------|------------------------------------------------------------------------------|
| Botón primario      | `.btn .btn-primary` (Empezar / Volver a jugar)                              |
| Overlay sobre canvas| `.card` semitransparente, `max-width: 360px`, `text-align: center`          |
| Tipografía títulos  | `var(--fs-3xl)` inicio, `var(--fs-2xl)` game over                            |
| Récord              | `.badge .badge-info` en inicio; `.kpi` en game over                          |
| Nuevo récord        | `.badge .badge-ok` "¡Nuevo récord!"                                          |
| Idioma              | Español de usuario final, sin términos técnicos                              |
| Controles           | Toque / clic / Espacio / ↑ — anunciados en copy cuando aplica               |
| Sin jerga visible   | Nada de "start game", "restart", "high score", "score: 0" → todo en español  |
