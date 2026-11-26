# Plan Maestro del Arsenal Completo (53 Armas) + Mecánica de Sprint/Porte

## 1. Correcciones Prioritarias Detectadas

### 1.1. Lanzagranadas M79 (`GLauncher`)
- **Fallo actual:** Aunque ya se corrigió el icono en vuelo (`isLauncherRound`), la granada de 40mm sigue entrando en la rama genérica `pr.isGrenade`, por lo que **rebota por el mapa durante 85 ticks sin explotar al impactar** contra un enemigo, pared o suelo.
- **Solución:**
  - Las granadas de `GLauncher` deben usar **detonación por impacto directo** (`detonateOnImpact: true`): en cuanto tocan a cualquier combatiente, caja, barril, suelo o pared sólida, detonan inmediatamente con `createExplosion(...)` (radio `95 px`, daño explosivo `65`, onda expansiva + fuego/escombros).
  - Visualmente mantienen la cápsula cilíndrica 40mm verde/dorada orientada en dirección de la trayectoria parabólica con estela fina de humo gris.
  - Sonido único: *thunk* hueco de tubo M79 al disparar + explosión profunda al impactar.

### 1.2. Mecánica "Correr Libre / Empuñar al Parar o Disparar"
- **Regla de porte dinámico:**
  - **Al correr (`isRunning === true`):** si el protagonista está esprintando y no está atacando ni disparando, **el arma desaparece de la mano** (se enfunda/oculta) para que la animación de carrera (`run`) luzca ágil y con los brazos libres.
  - **Al detenerse (`vx ≈ 0` / `Idle`), caminar lento, agacharse, saltar o disparar/atacar:** el arma **vuelve a aparecer inmediatamente en la mano** con su puño envolvente propio (`Ninja`, `Gymrat`, `Santa`) y un micro-snap suave de 3 ticks.
  - Excepción opcional coherente: durante la animación de disparo/ataque (`isPistolShooting`, `isRifleShooting`, `isOneHandAttacking`, `isTwoHandAttacking`), el arma siempre permanece visible aunque el personaje conserve inercia.

---

## 2. Matriz Completa de las 53 Armas (Disparo, Efecto y Sonido Único)

### A. Combate Cuerpo a Cuerpo — 21 Armas

| # | `WeaponType` | Tipo / Porte | Lógica de Combate y Efecto Único | Sonido Único (Aire / Impacto) |
|---|---|---|---|---|
| 1 | `Fists` | Desarmado | Combo de 3 golpes (puñetazo → patada → remate con derribo). | *Whoosh* ligero/medio/pesado / golpe seco o remate grave |
| 2 | `Knife` | 1 mano (filo) | Corte ultrarrápido de corto alcance y bajo cooldown; alta cadencia. | *Swish* agudo corto / corte fino |
| 3 | `Machete` | 1 mano (filo) | Tajo medio con buen sangrado/chispas y daño sólido. | Corte medio metálico / tajo profundo |
| 4 | `Katana` | 1 mano (filo) | Tajo largo veloz con estela cian y gran alcance horizontal. | *Slash* resonante de acero / corte limpio |
| 5 | `Sword` | 1 mano (filo) | Tajo equilibrado con empuje medio y arco brillante. | *Slash* de hoja ancha / impacto acero |
| 6 | `Axe` | 2 manos (pesada) | Golpe pesado lento con alto daño y quiebre rápido de cajas/cobertura. | *Whoosh* grave pesado / golpe tajante contundente |
| 7 | `Bat` | 1 mano (contund.) | Bateo con alto knockback horizontal para alejar rivales. | *Swish* de madera / *crack* seco de bate |
| 8 | `Baton` | 1 mano (contund.) | Golpe policial rápido con buen stun inicial. | *Whoosh* corto / golpe seco rígido |
| 9 | `ShockBaton` | 1 mano (eléctrica) | Aplica **aturdimiento eléctrico prolongado (`Hitstun` extra)** y chispas azules. | Zumbido corto / descarga eléctrica chisporroteante |
| 10 | `LeadPipe` | 1 mano (metal) | Golpe pesado metálico con alto daño y stun medio. | *Whoosh* denso / *clang* metálico hueco |
| 11 | `Pipe` | 1 mano (metal) | Tubería estándar con buen equilibrio alcance/empuje. | *Whoosh* medio / *clank* metálico |
| 12 | `Chainsaw` | 2 manos (sierra) | Ataque continuo/multi-tick con daño alto y lluvia de chispas/sangre. | Motor de sierra acelerado / desgarre continuo |
| 13 | `Hammer` | 2 manos (pesada) | Martillazo lento capaz de **derribar (`KnockedDown`)** y romper cobertura. | *Whoosh* pesado / impacto sísmico grave |
| 14 | `Chair` | 2 manos (pesada) | Golpe amplio de área que empuja y se astilla al impactar fuerte. | *Whoosh* ancho / crujido de madera |
| 15 | `Bottle` | 1 mano (vidrio) | Golpe rápido con corte/rotura de cristal (alto impacto inicial). | *Swish* ligero / estallido de vidrio |
| 16 | `Chain` | 1 mano (látigo) | Alcance medio-largo con chasquido metálico. | Silbido de cadena / choque de eslabones |
| 17 | `Whip` | 1 mano (látigo) | Largo alcance horizontal con poco daño pero gran interrupción. | Chasquido agudo de látigo / latigazo seco |
| 18 | `CueStick` | 1 mano (larga) | Alcance largo recto ideal para mantener distancia. | *Swish* fino / golpe seco de madera |
| 19 | `Teapot` | 1 mano (objeto) | Objeto cómico ligero de impacto rápido y empuje corto. | *Whoosh* suave / golpe cerámico hueco |
| 20 | `Pillow` | 1 mano (objeto) | Daño mínimo con empuje suave y efecto cómico. | *Poof* amortiguado / golpe blando |
| 21 | `Flagpole` | 2 manos (larga) | Asta de máximo alcance melee que empuja a distancia. | *Whoosh* largo / *clank* de mástil |

---

### B. Armas de Fuego y Especiales — 25 Armas

| # | `WeaponType` | Balística (`ballisticType`) | Lógica de Disparo y Efecto Único | Sonido Único |
|---|---|---|---|---|
| 22 | `Pistol` | `bullet` | Tiro semiautomático preciso de 1 mano, bajo retroceso. | Detonación corta seca |
| 23 | `Pistol45` | `bullet` | Calibre .45 con mayor daño y empuje que la pistola estándar. | Disparo seco más grave |
| 24 | `SilencedPistol` | `silenced_bullet` | Tiro discreto sin fogonazo brillante, trazador gris tenue. | *Pffft* amortiguado + clic |
| 25 | `Magnum` | `bullet` | Alto calibre de 1 mano, gran daño, knockback y retroceso marcado. | Estampido grave con eco |
| 26 | `Revolver` | `bullet` | 6 tiros precisos con golpe contundente y buena cadencia. | Estampido metálico seco |
| 27 | `MachinePistol` | `bullet` | Ráfaga rápida de 1 mano con dispersión moderada. | Ráfaga ágil aguda |
| 28 | `Uzi` | `bullet` | Subfusil de alta cadencia a 1 mano, ideal de cerca/medio. | Ráfaga ligera rápida |
| 29 | `SilencedUzi` | `silenced_bullet` | Subfusil rápido silenciado sin destello llamativo. | Ráfaga amortiguada rápida |
| 30 | `TommyGun` | `bullet` | Subfusil clásico de 2 manos con cargador amplio y fuego sostenido. | Ráfaga clásica densa |
| 31 | `SMG` | `bullet` | Subfusil táctico equilibrado con buena precisión en movimiento. | Ráfaga táctica media |
| 32 | `MP50` | `bullet` | Subfusil pesado con mayor daño por bala y control estable. | Ráfaga contundente |
| 33 | `Rifle` | `bullet` | Rifle semiautomático/ráfaga precisa de largo alcance. | Detonación militar media |
| 34 | `Assault` | `bullet` | Rifle de asalto automático continuo al mantener disparo. | Ráfaga militar continua |
| 35 | `Carbine` | `bullet` | Carabina precisa con menor dispersión y recuperación veloz. | Disparo seco nítido |
| 36 | `M60` | `bullet` | Ametralladora pesada de 100 balas, fuego continuo supresivo. | Estampido pesado en cadena |
| 37 | `Shotgun` | `pellet_spread` | Cartucho de 4-5 perdigones en abanico de `16°`, corto alcance con caída de daño. | *Boom* ancho + bombeo |
| 38 | `SawedOff` | `pellet_spread` | Doble cañón: 6 perdigones en abanico masivo de `24°`, letal a quemarropa. | Doble descarga grave |
| 39 | `DarkShotgun` | `pellet_spread` | Escopeta antidisturbios: 5 perdigones en `18°`, cargador de 6. | Disparo policial pesado |
| 40 | `Sniper` | `sniper_pierce` | Proyectil ultrarrápido de mira láser, alto daño y gran knockback. | Grieta supersónica + eco largo |
| 41 | **`Bazooka`** | **`rocket`** | **Misil/cohete recto propulsado** con estela de humo/fuego y **explosión letal al impactar**. | Ignición presurizada + explosión profunda |
| 42 | **`GLauncher` (M79)** | **`grenade_launcher`** | **Granada 40mm parabólica que detona inmediatamente al impactar** enemigo, suelo o pared. | *Thunk* hueco M79 + explosión |
| 43 | `Flamethrower` | `flame_stream` | Cono continuo de llamas a corto alcance que incendian (`isOnFire`) al objetivo. | Siseo continuo de gas y fuego |
| 44 | `FlareGun` | `flare` (a mejorar) | Dispara una **bengala luminosa roja** en arco suave que **incendia** al impactar. | Silbido brillante de bengala |
| 45 | `Lazer` | `laser_beam` | Haz energético instantáneo cian con chispas y quemadura breve. | Pulso sintético *zap* |
| 46 | `Bow` | `arrow` | Flecha silenciosa parabólica sin fogonazo ni chispas de pólvora. | Liberación seca de cuerda (*twang*) |

---

### C. Arrojadizas y Desplegables — 5 Armas

| # | `WeaponType` | Comportamiento | Sonido Único |
|---|---|---|---|
| 47 | `Grenade` | Granada de fragmentación con rebote y mecha temporizada, explosión radial. | Lanzamiento + rebote metálico + explosión |
| 48 | `Molotov` | Botella incendiaria que estalla al contacto creando **zona de fuego persistente**. | Lanzamiento + rotura de vidrio + llamas |
| 49 | `C4` | Carga adhesiva que **se pega a suelo, pared o techo** con LED parpadeante y detona por tiempo. | Lanzamiento + adhesión + pitido + explosión |
| 50 | `Mine` | Mina adhesiva de proximidad que **detona al acercarse un combatiente**. | Colocación + activación + explosión |
| 51 | `Baseball` | Pelota rápida lanzada en línea tensa que aturde y rebota sin explotar. | Lanzamiento rápido + golpe seco |

---

### D. Estimulantes / Powerups — 2 Ítems

| # | `WeaponType` | Efecto Único | Sonido Único |
|---|---|---|---|
| 52 | `StrengthBoost` | Aumenta temporalmente daño cuerpo a cuerpo y fuerza de empuje. | Efecto de activación energética |
| 53 | `SloMo10` | Activa cámara lenta táctica temporal (`slow-mo`) para esquivar y apuntar. | Pulso grave de ralentización |

---

## 3. Fases de Implementación Propuestas

1. **Fase 1 — M79 (`GLauncher`) Real + "Correr Libre / Empuñar al Parar o Disparar":**
   - Hacer que los proyectiles de `GLauncher` (`isLauncherRound`) **exploten inmediatamente al tocar enemigo, suelo, pared, caja o barril** (sin rebotar eternamente ni mostrar el arma).
   - En `WeaponRenderer.ts`, ocultar el arma en mano mientras el protagonista está corriendo (`isRunning`), reapareciendo al instante cuando frena, camina lento, salta, se agacha o dispara/ataca.
2. **Fase 2 — Especialización de `FlareGun`, `ShockBaton`, `Bottle` y `Chainsaw`:**
   - Añadir `flare` en `WeaponFireSystem.ts` para `FlareGun` (bengala roja luminosa incendiaria).
   - Reforzar el stun eléctrico de `ShockBaton`, astillado de `Bottle` y daño multi-tick de `Chainsaw`.
3. **Fase 3 — Pulido de Sonidos Únicos por Sub-familia:**
   - Afinar en `SoundEffects.ts` las firmas sonoras faltantes (`playFlareLaunch()`, `playGlassBreak()`, `playWhipCrack()`, `playLaserZap()` distinto, etc.) para que ninguna de las 53 armas suene genérica.
4. **Fase 4 — Verificación Final:**
   - Probar en El Gimnasio y combate real + `npm run lint` y `npm run build`.
