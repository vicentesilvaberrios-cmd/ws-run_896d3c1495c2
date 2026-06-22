# Especificación: Juego Flappy Bird en Next.js + TypeScript

## 1. Objetivo y Alcance
**Objetivo:** Implementar un clon del juego Flappy Bird donde los jugadores controlan un pájaro que debe navegar entre tuberías.
**En Alcance:**
- Mecánica principal de salto
- Generación procedural de tuberías
- Sistema de puntuación
- Detección de colisiones
- Estados del juego (inicio, jugando, game over)
- Interfaz responsive

**Fuera de Alcance:**
- Sistema multijugador
- Tienda de skins
- Integración con redes sociales
- Leaderboards persistentes

## 2. Épicas

### EP1: Mecánica Básica
- Saltar al hacer clic/tocar/presionar espacio
- Gravedad y movimiento del pájaro
- Animación básica del pájaro

### EP2: Generación de Obstáculos
- Tuberías que aparecen a intervalos regulares
- Huecos aleatorios entre tuberías
- Movimiento continuo de izquierda a derecha

### EP3: Sistema de Puntuación
- +1 punto por tubería superada
- Registro de puntuación máxima (localStorage)
- Display de puntuación actual/máxima

### EP4: Estados del Juego
- Pantalla inicial (botón Start)
- Pantalla de juego activo
- Pantalla Game Over (puntuación final + restart)

## 3. Modelo de Datos
```typescript
type GameState = 'START' | 'PLAYING' | 'GAME_OVER';

interface Bird {
  positionY: number;
  velocity: number;
  rotation: number; // Para efecto visual
}

interface Pipe {
  id: string;
  positionX: number;
  gapPositionY: number; // Posición vertical del hueco
  passed: boolean; // Si el pájaro ya pasó
}

interface GameData {
  state: GameState;
  bird: Bird;
  pipes: Pipe[];
  score: number;
  highScore: number;
}
```

## 4. Rutas/Páginas
- `app/page.tsx`: Página principal del juego (única ruta)

## 5. Endpoints API
*No aplica* - Todo el estado se maneja en cliente

## 6. Criterios de Aceptación

**EP1:**
- [ ] Al hacer clic, el pájaro sube instantáneamente
- [ ] El pájaro cae constantemente cuando no hay input
- [ ] Movimiento fluido sin saltos de posición

**EP2:**
- [ ] Nuevas tuberías cada 1.5 segundos
- [ ] Huecos en posición Y aleatoria (rango seguro)
- [ ] Tuberías se mueven a velocidad constante

**EP3:**
- [ ] Puntuación aumenta al pasar tuberías
- [ ] Máxima puntuación persiste tras recargar
- [ ] Marcadores visibles durante juego y Game Over

**EP4:**
- [ ] Estado inicial: START con botón visible
- [ ] Al colisionar: estado GAME_OVER con puntuación
- [ ] Reinicio rápido al tocar en Game Over

## 7. Flujos Críticos

**Jugador:**
1. Abre app → Ve pantalla inicial
2. Toca "Start" → Comienza juego
3. Toca repetidamente para mantener pájaro volando
4. Pasa tuberías → Aumenta puntuación
5. Si colisión → Pantalla Game Over
6. Toca pantalla → Reinicia juego

**Flujo de creación:** El jugador DEBE poder iniciar jugar en <3 segundos desde la carga inicial.