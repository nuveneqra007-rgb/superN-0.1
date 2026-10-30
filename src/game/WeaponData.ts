// =============================================================
// WeaponData.ts — Definición declarativa del Arsenal Completo
// Ground Truth: Weapons.as (AS3 original Superfighters & BotExtended)
// =============================================================

import { GameConstants } from './GameConstants';

export enum WeaponType {
  // Melee
  Fists = 'Fists',
  Knife = 'Knife',
  Machete = 'Machete',
  Axe = 'Axe',
  Sword = 'Sword',
  Katana = 'Katana',
  Bat = 'Bat',
  Baton = 'Baton',
  ShockBaton = 'ShockBaton',
  LeadPipe = 'LeadPipe',
  Pipe = 'Pipe',
  Chainsaw = 'Chainsaw',
  Hammer = 'Hammer',
  Chair = 'Chair',
  Bottle = 'Bottle',
  Chain = 'Chain',
  Whip = 'Whip',
  CueStick = 'CueStick',
  Teapot = 'Teapot',
  Pillow = 'Pillow',
  Flagpole = 'Flagpole',

  // Firearms
  Pistol = 'Pistol',
  Pistol45 = 'Pistol45',
  SilencedPistol = 'SilencedPistol',
  Magnum = 'Magnum',
  Revolver = 'Revolver',
  MachinePistol = 'MachinePistol',
  Uzi = 'Uzi',
  SilencedUzi = 'SilencedUzi',
  TommyGun = 'TommyGun',
  SMG = 'SMG',
  MP50 = 'MP50',
  Rifle = 'Rifle',
  Assault = 'Assault',
  Carbine = 'Carbine',
  M60 = 'M60',
  Shotgun = 'Shotgun',
  SawedOff = 'SawedOff',
  DarkShotgun = 'DarkShotgun',
  Sniper = 'Sniper',
  Bazooka = 'Bazooka',
  GLauncher = 'GLauncher',
  Flamethrower = 'Flamethrower',
  FlareGun = 'FlareGun',
  Lazer = 'Lazer',
  Bow = 'Bow',

  // Throwables & Deployables
  Grenade = 'Grenade',
  Molotov = 'Molotov',
  C4 = 'C4',
  Mine = 'Mine',
  Baseball = 'Baseball',

  // Powerups / Stimulants
  StrengthBoost = 'StrengthBoost',
  SloMo10 = 'SloMo10',
}

export type WeaponCategory = 'Melee' | 'Firearm' | 'Throwable' | 'Powerup';

export interface WeaponData {
  type: WeaponType;
  name: string;
  category: WeaponCategory;
  damage: number;
  magSize: number; // -1 = infinito (melee/powerup)
  cooldownTicks: number;
  projectileSpeed: number;
  accuracyDeg: number;
  pelletCount?: number;
  explosionRadius?: number;
  hasLaserSight?: boolean;
  onFireDuration?: number;
  color: string;
  iconUrl?: string;
  description: string;
  tacticalTip: string;
  features: string[];
  range: 'Cuerpo a cuerpo' | 'Corto' | 'Medio' | 'Largo' | 'Extremo';
  soundType?: 'punch' | 'pistol' | 'shotgun' | 'magnum' | 'sniper' | 'explosion';
}

export const WeaponDatabase: Record<WeaponType, WeaponData> = {
  // ────────────────── ARMAS BLANCAS & MELEE ──────────────────
  [WeaponType.Fists]: {
    type: WeaponType.Fists,
    name: 'Puños Desnudos',
    category: 'Melee',
    damage: 6,
    magSize: -1,
    cooldownTicks: GameConstants.FistsCooldownTicks,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#e2e8f0',
    iconUrl: '/assets/weapons/Fist.png',
    description: 'Técnica de combate cuerpo a cuerpo callejera con cadena de 3 puñetazos.',
    tacticalTip: 'El tercer golpe consecutivo conecta con empuje demoledor que derriba al oponente.',
    features: ['Combo de 3 Golpes', 'Desarme Ocasional', 'Sin Desgaste'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Knife]: {
    type: WeaponType.Knife,
    name: 'Cuchillo de Combate',
    category: 'Melee',
    damage: 8,
    magSize: -1,
    cooldownTicks: 10,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#cbd5e1',
    iconUrl: '/assets/weapons/Knife.png',
    description: 'Arma blanca militar de hoja rápida para estocadas continuas y letales.',
    tacticalTip: 'Excelente velocidad de ataque para interrumpir ataques pesados del rival.',
    features: ['Ataque Ultrarrápido', 'Bajo Knockback', 'Filo Quirúrgico'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Machete]: {
    type: WeaponType.Machete,
    name: 'Machete de Selva',
    category: 'Melee',
    damage: 10,
    magSize: -1,
    cooldownTicks: 12,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#94a3b8',
    iconUrl: '/assets/weapons/Machete.png',
    description: 'Hoja ancha y pesada que inflige tajos contundentes de alto impacto.',
    tacticalTip: 'Arma favorita de los Punks y Matones para controlar el espacio cuerpo a cuerpo.',
    features: ['Buen Rango Melee', 'Daño Medio-Alto', 'Tajo Horizontal'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Axe]: {
    type: WeaponType.Axe,
    name: 'Hacha de Bombero',
    category: 'Melee',
    damage: 14,
    magSize: -1,
    cooldownTicks: 13,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#b45309',
    iconUrl: '/assets/weapons/Axe.png',
    description: 'Hacha de acero templado capaz de quebrar defensas y noquear en pocos golpes.',
    tacticalTip: 'Úsala para rematar enemigos acorralados o combinada con el jefe Berserker.',
    features: ['Gran Knockback', 'Destrucción de Bloqueo', 'Filo Pesado'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Sword]: {
    type: WeaponType.Sword,
    name: 'Espada de Acero',
    category: 'Melee',
    damage: 13,
    magSize: -1,
    cooldownTicks: 13,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#38bdf8',
    iconUrl: '/assets/weapons/Katana.png',
    description: 'Hoja larga forjada tradicionalmente para tajos equilibrados y limpios.',
    tacticalTip: 'Su amplio arco frontal permite golpear incluso si el oponente salta.',
    features: ['Arco de Ataque Amplio', 'Corte Preciso', 'Recuperación Rápida'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Katana]: {
    type: WeaponType.Katana,
    name: 'Katana Tradicional',
    category: 'Melee',
    damage: 15,
    magSize: -1,
    cooldownTicks: 12,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#06b6d4',
    iconUrl: '/assets/weapons/Katana.png',
    description: 'Espada samurái legendaria. Corta al oponente a gran velocidad y desestabiliza.',
    tacticalTip: 'El arma predilecta del Asesino Ninja para ejecutar combos relámpago.',
    features: ['Corte Crítico', 'Gran Velocidad', 'Penetración Melee'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Bat]: {
    type: WeaponType.Bat,
    name: 'Bate de Béisbol',
    category: 'Melee',
    damage: 11,
    magSize: -1,
    cooldownTicks: 13,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#d97706',
    iconUrl: '/assets/weapons/Bat.png',
    description: 'Bate de madera dura barnizada clásico para batear proyectiles y enemigos.',
    tacticalTip: 'Empuja a los enemigos fuera de las plataformas hacia caídas o trampas.',
    features: ['Home Run Knockback', 'Aturdimiento Breve', 'Fácil Manejo'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Baton]: {
    type: WeaponType.Baton,
    name: 'Porra Policial Antidisturbios',
    category: 'Melee',
    damage: 8,
    magSize: -1,
    cooldownTicks: 11,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#475569',
    iconUrl: '/assets/weapons/Baton.png',
    description: 'Bastón táctico antidisturbios reforzado diseñado para someter al infractor.',
    tacticalTip: 'Ideal para desorientar opositores y preparar un disparo a quemarropa.',
    features: ['Golpe Rápido', 'Cadencia Alta', 'Control Policial'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.ShockBaton]: {
    type: WeaponType.ShockBaton,
    name: 'Porra Eléctrica Taser',
    category: 'Melee',
    damage: 12,
    magSize: -1,
    cooldownTicks: 12,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#06b6d4',
    iconUrl: '/assets/weapons/ShockBaton.png',
    description: 'Bastón de choque de alto voltaje que electrocuta y frena en seco al rival.',
    tacticalTip: 'Interrumpe al instante cualquier animación o ataque en curso del contrincante.',
    features: ['Descarga Eléctrica', 'Stun Garantizado', 'Chispas de Alto Voltaje'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.LeadPipe]: {
    type: WeaponType.LeadPipe,
    name: 'Tubo de Plomo Pesado',
    category: 'Melee',
    damage: 12,
    magSize: -1,
    cooldownTicks: 14,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#64748b',
    iconUrl: '/assets/weapons/LeadPipe.png',
    description: 'Tubería maciza de fontanería pesada con fuerza de impacto demoledora.',
    tacticalTip: 'Su masa genera un impacto seco que derriba fácilmente si el rival está en el aire.',
    features: ['Impacto Macizo', 'Gran Inercia', 'Rotura Contundente'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Pipe]: {
    type: WeaponType.Pipe,
    name: 'Tubería Metálica',
    category: 'Melee',
    damage: 9,
    magSize: -1,
    cooldownTicks: 12,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#71717a',
    iconUrl: '/assets/weapons/Pipe.png',
    description: 'Conducto de metal común encontrado en almacenes industriales.',
    tacticalTip: 'Fácil de empuñar y con buen balance para mantener a raya al contrincante.',
    features: ['Versátil', 'Arma Improvisada', 'Golpe Metálico'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Chainsaw]: {
    type: WeaponType.Chainsaw,
    name: 'Motosierra a Gasolina',
    category: 'Melee',
    damage: 18,
    magSize: -1,
    cooldownTicks: 7,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#ef4444',
    iconUrl: '/assets/weapons/Chainsaw.png',
    description: 'Sierra motorizada que inflige desgarros continuos a altísima velocidad.',
    tacticalTip: 'Pega al rival contra la pared y tritura su barra de salud en segundos.',
    features: ['Daño Continuo por Ticks', 'Terror Psicológico', 'Mutilación Masiva'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Hammer]: {
    type: WeaponType.Hammer,
    name: 'Martillo de Construcción',
    category: 'Melee',
    damage: 13,
    magSize: -1,
    cooldownTicks: 14,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#f59e0b',
    iconUrl: '/assets/weapons/Hammer.png',
    description: 'Herramienta pesada de demolición capaz de quebrar armaduras y huesos.',
    tacticalTip: 'Combina el golpe hacia abajo desde un salto para aplastar al rival contra el suelo.',
    features: ['Golpe Aplastante', 'Alto Knockdown', 'Impacto Sísmico'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Chair]: {
    type: WeaponType.Chair,
    name: 'Silla Plegable de Acero',
    category: 'Melee',
    damage: 10,
    magSize: -1,
    cooldownTicks: 13,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#94a3b8',
    iconUrl: '/assets/weapons/Chair.png',
    description: 'Clásica silla de lucha libre para repartir sillazos estilo WWE.',
    tacticalTip: 'Produce un sonido metálico ensordecedor y derriba al enemigo con estilo.',
    features: ['Sillazo Callejero', 'Humillación Total', 'Gran Área de Choque'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Bottle]: {
    type: WeaponType.Bottle,
    name: 'Botella Rota de Vidrio',
    category: 'Melee',
    damage: 9,
    magSize: -1,
    cooldownTicks: 10,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#10b981',
    iconUrl: '/assets/weapons/Bottle.png',
    description: 'Botella de taberna quebrada con bordes afilados y punzantes.',
    tacticalTip: 'Ataque muy veloz para combates desesperados en rincones estrechos.',
    features: ['Estocada Rápida', 'Filo de Cristal', 'Arma de Bar'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Chain]: {
    type: WeaponType.Chain,
    name: 'Cadena de Acero Gruesa',
    category: 'Melee',
    damage: 10,
    magSize: -1,
    cooldownTicks: 12,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#64748b',
    iconUrl: '/assets/weapons/Chain.png',
    description: 'Cadena eslabonada metálica que azota con amplio alcance y fuerza.',
    tacticalTip: 'Permite azotar al oponente fuera del alcance de sus puños o cuchillos.',
    features: ['Alcance Extendido', 'Azote Eslabonado', 'Desestabilizador'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Whip]: {
    type: WeaponType.Whip,
    name: 'Látigo de Cuero Trenzado',
    category: 'Melee',
    damage: 9,
    magSize: -1,
    cooldownTicks: 11,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#78350f',
    iconUrl: '/assets/weapons/Whip.png',
    description: 'Látigo de combate con chasquido sónico y excelente longitud.',
    tacticalTip: 'Desarma armas de fuego del contrincante si impactas con la punta.',
    features: ['Chasquido Sónico', 'Largo Alcance Melee', 'Desarme'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.CueStick]: {
    type: WeaponType.CueStick,
    name: 'Taco de Billar',
    category: 'Melee',
    damage: 8,
    magSize: -1,
    cooldownTicks: 11,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#d97706',
    iconUrl: '/assets/weapons/CueStick.png',
    description: 'Taco de madera pulida ideal para estocadas frontales a media distancia.',
    tacticalTip: 'Mantén la distancia y pincha al enemigo mientras intenta aproximarse.',
    features: ['Estocada Lineal', 'Ligereza', 'Manejo Ágil'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Teapot]: {
    type: WeaponType.Teapot,
    name: 'Tetera de Hierro Fundido',
    category: 'Melee',
    damage: 8,
    magSize: -1,
    cooldownTicks: 12,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#475569',
    iconUrl: '/assets/weapons/Teapot.png',
    description: 'Utensilio de cocina macizo que propina un coscorrón inolvidable.',
    tacticalTip: 'Objeto cómico pero sorprendentemente eficaz para finalizar un combo.',
    features: ['Golpe Cómico', 'Sonido Campana', 'Inercia Sólida'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Pillow]: {
    type: WeaponType.Pillow,
    name: 'Almohada Cósmica',
    category: 'Melee',
    damage: 5,
    magSize: -1,
    cooldownTicks: 8,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#ec4899',
    iconUrl: '/assets/weapons/Pillow.png',
    description: 'Almohada de plumas hipersuave para una guerra de almohadas mortífera.',
    tacticalTip: 'Ataque ultrarrápido sin apenas penalización de movimiento.',
    features: ['Guerra de Almohadas', 'Suave pero Veloz', 'Plumas al Impacto'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.Flagpole]: {
    type: WeaponType.Flagpole,
    name: 'Asta de Bandera',
    category: 'Melee',
    damage: 11,
    magSize: -1,
    cooldownTicks: 13,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#3b82f6',
    iconUrl: '/assets/weapons/Flagpole.png',
    description: 'Poste metálico largo con tela flameante para barrer el escenario.',
    tacticalTip: 'Cubre grandes distancias y derriba a varios oponentes simultáneamente.',
    features: ['Gran Envergadura', 'Barrido de Plataforma', 'Estandarte de Batalla'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },

  // ────────────────── ARMAS DE FUEGO ──────────────────
  [WeaponType.Pistol]: {
    type: WeaponType.Pistol,
    name: 'Pistola Semiautomática 9mm',
    category: 'Firearm',
    damage: GameConstants.PistolDamage,
    magSize: GameConstants.PistolMag,
    cooldownTicks: GameConstants.PistolCooldown,
    projectileSpeed: GameConstants.PistolSpeed,
    accuracyDeg: GameConstants.PistolAccuracy,
    color: '#cbd5e1',
    iconUrl: '/assets/weapons/Pistol.png',
    description: 'Pistola estándar de servicio policial y civil con 12 cartuchos de 9mm.',
    tacticalTip: 'Dispara con ritmo constante; no te muevas para conservar la puntería.',
    features: ['Equilibrada', 'Recarga Confiable', 'Proyectil Rápido'],
    range: 'Medio',
    soundType: 'pistol',
  },
  [WeaponType.Pistol45]: {
    type: WeaponType.Pistol45,
    name: 'Pistola Calibre .45',
    category: 'Firearm',
    damage: 17,
    magSize: 8,
    cooldownTicks: 15,
    projectileSpeed: 980,
    accuracyDeg: 1.8,
    color: '#94a3b8',
    iconUrl: '/assets/weapons/Pistol45.png',
    description: 'Arma de gran calibre con tremendo poder de parada y retroceso moderado.',
    tacticalTip: 'Pocos disparos pero con alto impacto capaz de desestabilizar al enemigo.',
    features: ['Gran Calibre .45', 'Alto Knockback', 'Poder de Parada'],
    range: 'Medio',
    soundType: 'pistol',
  },
  [WeaponType.SilencedPistol]: {
    type: WeaponType.SilencedPistol,
    name: 'Pistola 9mm con Silenciador',
    category: 'Firearm',
    damage: 13,
    magSize: 12,
    cooldownTicks: 11,
    projectileSpeed: 940,
    accuracyDeg: 1.2,
    color: '#64748b',
    iconUrl: '/assets/weapons/SilencedPistol.png',
    description: 'Pistola táctica de infiltración con supresor de sonido de alta precisión.',
    tacticalTip: 'Ideal para emboscar sin llamar la atención de otros bots en la arena.',
    features: ['Disparo Silencioso', 'Mayor Precisión', 'Retroceso Nulo'],
    range: 'Medio',
    soundType: 'pistol',
  },
  [WeaponType.Magnum]: {
    type: WeaponType.Magnum,
    name: 'Revólver Magnum .44',
    category: 'Firearm',
    damage: GameConstants.MagnumDamage,
    magSize: GameConstants.MagnumMag,
    cooldownTicks: GameConstants.MagnumCooldown,
    projectileSpeed: GameConstants.MagnumSpeed,
    accuracyDeg: GameConstants.MagnumAccuracy,
    color: '#f59e0b',
    iconUrl: '/assets/weapons/Magnum.png',
    description: 'El cañón de mano más poderoso del mundo. Munición perforante .44.',
    tacticalTip: '2 impactos certeros son suficientes para abatir a la mayoría de los bots.',
    features: ['Daño Devastador', 'Tiro Perforante', 'Golpe Sónico'],
    range: 'Largo',
    soundType: 'magnum',
  },
  [WeaponType.Revolver]: {
    type: WeaponType.Revolver,
    name: 'Revólver del Viejo Oeste',
    category: 'Firearm',
    damage: 18,
    magSize: 6,
    cooldownTicks: 16,
    projectileSpeed: 950,
    accuracyDeg: 1.5,
    color: '#d97706',
    iconUrl: '/assets/weapons/Revolver.png',
    description: 'Seis tiros de tambor giratorio con la elegancia y letalidad de un pistolero.',
    tacticalTip: 'Arma inicial del Cowboy, con probabilidad adicional de desarmar al objetivo.',
    features: ['6 Tiros Letales', 'Desarme Pasivo', 'Estilo Clásico'],
    range: 'Medio',
    soundType: 'magnum',
  },
  [WeaponType.MachinePistol]: {
    type: WeaponType.MachinePistol,
    name: 'Pistola Automática Micro',
    category: 'Firearm',
    damage: 9,
    magSize: 20,
    cooldownTicks: 6,
    projectileSpeed: 910,
    accuracyDeg: 3.5,
    color: '#10b981',
    iconUrl: '/assets/weapons/MachinePistol.png',
    description: 'Pistola ametralladora compacta capaz de vaciar su cargador en un suspiro.',
    tacticalTip: 'Úsala a bocajarro tras un salto o esquiva para encajar ráfagas completas.',
    features: ['Ráfaga Ultrarrápida', 'Bolsillo Compacto', 'Cadencia Asombrosa'],
    range: 'Corto',
    soundType: 'pistol',
  },
  [WeaponType.Uzi]: {
    type: WeaponType.Uzi,
    name: 'Subfusil Micro Uzi',
    category: 'Firearm',
    damage: GameConstants.UziDamage,
    magSize: GameConstants.UziMag,
    cooldownTicks: GameConstants.UziCooldown,
    projectileSpeed: GameConstants.UziSpeed,
    accuracyDeg: GameConstants.UziAccuracy,
    color: '#10b981',
    iconUrl: '/assets/weapons/Uzi.png',
    description: 'Subfusil israelí legendario de altísima cadencia de fuego (30 proyectiles).',
    tacticalTip: 'Excelente arma de rociado para mantener al rival en hitstun continuo.',
    features: ['Cadencia Brutal', '30 Balas', 'Rociado Continuo'],
    range: 'Corto',
    soundType: 'pistol',
  },
  [WeaponType.SilencedUzi]: {
    type: WeaponType.SilencedUzi,
    name: 'Uzi con Supresor Táctico',
    category: 'Firearm',
    damage: 9,
    magSize: 30,
    cooldownTicks: 5,
    projectileSpeed: 930,
    accuracyDeg: 2.8,
    color: '#059669',
    iconUrl: '/assets/weapons/SilencedUzi.png',
    description: 'Variante sigilosa del subfusil Uzi con estabilizador de retroceso.',
    tacticalTip: 'Dispersión reducida en comparación con la versión estándar.',
    features: ['Silenciador Táctico', 'Baja Dispersión', 'Cadencia Extrema'],
    range: 'Corto',
    soundType: 'pistol',
  },
  [WeaponType.TommyGun]: {
    type: WeaponType.TommyGun,
    name: 'Subfusil Thompson "Tommy Gun"',
    category: 'Firearm',
    damage: 12,
    magSize: 30,
    cooldownTicks: 7,
    projectileSpeed: 920,
    accuracyDeg: 3.0,
    color: '#84cc16',
    iconUrl: '/assets/weapons/TommyGun.png',
    description: 'Arma de los gánsteres de Chicago con tambor de 30 cartuchos calibre .45.',
    tacticalTip: 'Combina daño de calibre pesado con la velocidad de un subfusil.',
    features: ['Calibre .45 ACP', 'Estilo Gánster', 'Fuerza de Supresión'],
    range: 'Medio',
    soundType: 'pistol',
  },
  [WeaponType.SMG]: {
    type: WeaponType.SMG,
    name: 'Subfusil SMG Táctico',
    category: 'Firearm',
    damage: 11,
    magSize: 25,
    cooldownTicks: 6,
    projectileSpeed: 960,
    accuracyDeg: 2.6,
    color: '#14b8a6',
    iconUrl: '/assets/weapons/SMG.png',
    description: 'Subfusil militar ergonómico con rieles tácticos y control de disparo superior.',
    tacticalTip: 'Dispara en ráfagas de 3 o 4 tiros para conservar absoluta precisión.',
    features: ['Equilibrio Perfecto', '25 Disparos', 'Manejo Táctico'],
    range: 'Medio',
    soundType: 'pistol',
  },
  [WeaponType.MP50]: {
    type: WeaponType.MP50,
    name: 'Subfusil Táctico MP50',
    category: 'Firearm',
    damage: 12,
    magSize: 30,
    cooldownTicks: 6,
    projectileSpeed: 980,
    accuracyDeg: 2.2,
    color: '#0284c7',
    iconUrl: '/assets/weapons/MP50.png',
    description: 'Evolución moderna del MP5 con cerrojo cerrado y gran estabilidad al correr.',
    tacticalTip: 'Puedes disparar mientras corres con una pérdida mínima de puntería.',
    features: ['Estabilidad en Movimiento', 'Precisión de Ráfaga', 'Cargador Curvo'],
    range: 'Medio',
    soundType: 'pistol',
  },
  [WeaponType.Rifle]: {
    type: WeaponType.Rifle,
    name: 'Rifle de Asalto Militar',
    category: 'Firearm',
    damage: GameConstants.RifleDamage,
    magSize: GameConstants.RifleMag,
    cooldownTicks: GameConstants.RifleCooldown,
    projectileSpeed: GameConstants.RifleSpeed,
    accuracyDeg: GameConstants.RifleAccuracy,
    color: '#3b82f6',
    iconUrl: '/assets/weapons/Assault.png',
    description: 'Fusil de asalto calibre 5.56 OTAN. El arma estándar de los soldados de élite.',
    tacticalTip: 'Penetra defensas y castiga severamente a enemigos a media y larga distancia.',
    features: ['Penetración Balística', 'Daño Constante', '30 Tiros Fusil'],
    range: 'Largo',
    soundType: 'pistol',
  },
  [WeaponType.Assault]: {
    type: WeaponType.Assault,
    name: 'Rifle de Asalto Militar',
    category: 'Firearm',
    damage: GameConstants.RifleDamage,
    magSize: GameConstants.RifleMag,
    cooldownTicks: GameConstants.RifleCooldown,
    projectileSpeed: GameConstants.RifleSpeed,
    accuracyDeg: GameConstants.RifleAccuracy,
    color: '#3b82f6',
    iconUrl: '/assets/weapons/Assault.png',
    description: 'Fusil de asalto calibre 5.56 OTAN. El arma estándar de los soldados de élite.',
    tacticalTip: 'Penetra defensas y castiga severamente a enemigos a media y larga distancia.',
    features: ['Penetración Balística', 'Daño Constante', '30 Tiros Fusil'],
    range: 'Largo',
    soundType: 'pistol',
  },
  [WeaponType.Carbine]: {
    type: WeaponType.Carbine,
    name: 'Carabina Táctica M4',
    category: 'Firearm',
    damage: 13,
    magSize: 25,
    cooldownTicks: 8,
    projectileSpeed: 1040,
    accuracyDeg: 1.5,
    color: '#2563eb',
    iconUrl: '/assets/weapons/Carbine.png',
    description: 'Carabina compacta de infantería con cañón recortado para mayor maniobrabilidad.',
    tacticalTip: 'Dispara proyectiles ultra rápidos difíciles de esquivar con saltos.',
    features: ['Alta Velocidad de Bala', 'Gran Alcance', 'Rifling Táctico'],
    range: 'Largo',
    soundType: 'pistol',
  },
  [WeaponType.M60]: {
    type: WeaponType.M60,
    name: 'Ametralladora Pesada M60',
    category: 'Firearm',
    damage: 15,
    magSize: 50,
    cooldownTicks: 7,
    projectileSpeed: 980,
    accuracyDeg: 4.5,
    color: '#e11d48',
    iconUrl: '/assets/weapons/M60.png',
    description: 'Ametralladora de cinta 7.62 con cargador de 50 balas. Devastación pura.',
    tacticalTip: 'Mantén presionado el gatillo para suprimir por completo una plataforma entera.',
    features: ['50 Balas de Cinta', 'Fuego de Supresión', 'Gran Peso de Fuego'],
    range: 'Largo',
    soundType: 'pistol',
  },
  [WeaponType.Shotgun]: {
    type: WeaponType.Shotgun,
    name: 'Escopeta Calibre 12',
    category: 'Firearm',
    damage: GameConstants.ShotgunDamagePerPellet,
    magSize: GameConstants.ShotgunShotsInMag,
    cooldownTicks: GameConstants.ShotgunCooldown,
    projectileSpeed: GameConstants.ShotgunSpeed,
    accuracyDeg: GameConstants.ShotgunSpread,
    pelletCount: GameConstants.ShotgunPellets,
    color: '#ef4444',
    iconUrl: '/assets/weapons/Shotgun.png',
    description: 'Dispara 4 perdigones pesados simultáneos. Letal a corta distancia.',
    tacticalTip: 'A quemarropa impactan los 4 perdigones causando hasta 40 de daño de un tiro.',
    features: ['4 Perdigones Simultáneos', 'Daño Letal a Corta Distancia', 'Retroceso Enérgico'],
    range: 'Corto',
    soundType: 'shotgun',
  },
  [WeaponType.SawedOff]: {
    type: WeaponType.SawedOff,
    name: 'Escopeta Recortada Doble Cañón',
    category: 'Firearm',
    damage: 12,
    magSize: 2,
    cooldownTicks: 24,
    projectileSpeed: 780,
    accuracyDeg: 8.5,
    pelletCount: 6,
    color: '#b91c1c',
    iconUrl: '/assets/weapons/SawedOff.png',
    description: 'Cañones gemelos aserrados para una dispersión masiva de 6 perdigones.',
    tacticalTip: 'Solo 2 disparos pero cada tiro descarga una nube de metralla imposible de esquivar.',
    features: ['6 Perdigones en Abanico', 'Dispersión Enorme', 'Daño de Ruptura'],
    range: 'Corto',
    soundType: 'shotgun',
  },
  [WeaponType.DarkShotgun]: {
    type: WeaponType.DarkShotgun,
    name: 'Escopeta Oscura Policial',
    category: 'Firearm',
    damage: 9,
    magSize: 6,
    cooldownTicks: 28,
    projectileSpeed: 820,
    accuracyDeg: 7.0,
    pelletCount: 5,
    color: '#6366f1',
    iconUrl: '/assets/weapons/DarkShotgun.png',
    description: 'Escopeta militar de acción de bombeo con 5 perdigones de alta dispersión.',
    tacticalTip: 'Arma reglamentaria del MetroCop para controlar multitudes y dispersar oponentes.',
    features: ['5 Perdigones', 'Cargador de 6 Cartuchos', 'Fuerza Antidisturbios'],
    range: 'Corto',
    soundType: 'shotgun',
  },
  [WeaponType.Sniper]: {
    type: WeaponType.Sniper,
    name: 'Rifle Francotirador de Cerrojo',
    category: 'Firearm',
    damage: GameConstants.SniperDamage,
    magSize: GameConstants.SniperMag,
    cooldownTicks: GameConstants.SniperCooldown,
    projectileSpeed: GameConstants.SniperSpeed,
    accuracyDeg: GameConstants.SniperAccuracy,
    hasLaserSight: true,
    color: '#a855f7',
    iconUrl: '/assets/weapons/Sniper.png',
    description: 'Arma de precisión extrema equipada con mira láser roja y bala hipersónica.',
    tacticalTip: 'Impacto directo inflige 45 de daño crítico y derriba instantáneamente al enemigo.',
    features: ['Mira Láser Visible', 'Bala Hipersónica (1500px/s)', 'Daño Crítico 45 HP'],
    range: 'Extremo',
    soundType: 'sniper',
  },
  [WeaponType.Bazooka]: {
    type: WeaponType.Bazooka,
    name: 'Bazuca / Lanzacohetes RPG',
    category: 'Firearm',
    damage: GameConstants.BazookaDamage,
    magSize: GameConstants.BazookaMag,
    cooldownTicks: GameConstants.BazookaCooldown,
    projectileSpeed: GameConstants.BazookaSpeed,
    accuracyDeg: 2.0,
    explosionRadius: GameConstants.BazookaExplosionRadius,
    color: '#f97316',
    iconUrl: '/assets/weapons/Bazooka.png',
    description: 'Lanza un misil explosivo propulsado por cohete con estela de humo y onda expansiva.',
    tacticalTip: 'Dispara a las paredes o suelo cercanos al enemigo si está esquivando tus tiros directos.',
    features: ['Misil Guiado', 'Radio de Explosión 65px', 'Onda Expansiva Sísmica'],
    range: 'Largo',
    soundType: 'explosion',
  },
  [WeaponType.GLauncher]: {
    type: WeaponType.GLauncher,
    name: 'Lanzagranadas M79',
    category: 'Firearm',
    damage: 40,
    magSize: 4,
    cooldownTicks: 35,
    projectileSpeed: 600,
    accuracyDeg: 2.5,
    explosionRadius: 55,
    color: '#f59e0b',
    iconUrl: '/assets/weapons/GLauncher.png',
    description: 'Dispara proyectiles explosivos de 40mm con trayectoria arqueada.',
    tacticalTip: 'Aprovecha la parábola para atacar enemigos posicionados sobre o bajo plataformas.',
    features: ['Trayectoria Parabólica', 'Explosión de 40mm', 'Impacto en Área'],
    range: 'Medio',
    soundType: 'explosion',
  },
  [WeaponType.Flamethrower]: {
    type: WeaponType.Flamethrower,
    name: 'Lanzallamas Napalm',
    category: 'Firearm',
    damage: GameConstants.FlameDmgPerTick,
    magSize: GameConstants.FlameMag,
    cooldownTicks: 2,
    projectileSpeed: GameConstants.FlameRange,
    accuracyDeg: GameConstants.FlameSpread,
    onFireDuration: GameConstants.OnFireDuration,
    color: '#f43f5e',
    iconUrl: '/assets/weapons/Flamethrower.png',
    description: 'Chorro de combustible incendiario continuo que prende en llamas a los objetivos.',
    tacticalTip: 'El fuego drena vida cada tick; obliga al rival a rodar por el suelo para apagarse.',
    features: ['Fuego Continuo (60 Balas)', 'Estado "En Llamas"', 'Bloqueo Visual'],
    range: 'Corto',
    soundType: 'pistol',
  },
  [WeaponType.FlareGun]: {
    type: WeaponType.FlareGun,
    name: 'Pistola de Bengalas Incendiaria',
    category: 'Firearm',
    damage: 20,
    magSize: 3,
    cooldownTicks: 30,
    projectileSpeed: 700,
    accuracyDeg: 2.0,
    onFireDuration: 180,
    color: '#fb923c',
    iconUrl: '/assets/weapons/FlareGun.png',
    description: 'Dispara una bengala de magnesio ardiendo que se adhiere y quema al rival.',
    tacticalTip: 'Prende fuego al rival a larga distancia sin exponerse a combate cuerpo a cuerpo.',
    features: ['Proyectil de Magnesio', 'Ignición a Distancia', 'Luz Brillante'],
    range: 'Medio',
    soundType: 'pistol',
  },
  [WeaponType.Lazer]: {
    type: WeaponType.Lazer,
    name: 'Rifle Láser Experimental',
    category: 'Firearm',
    damage: 28,
    magSize: 10,
    cooldownTicks: 20,
    projectileSpeed: 1800,
    accuracyDeg: 0.5,
    hasLaserSight: true,
    color: '#38bdf8',
    iconUrl: '/assets/weapons/Lazer.png',
    description: 'Tecnología experimental que dispara rayos coherentes de energía concentrada.',
    tacticalTip: 'Velocidad de bala prácticamente instantánea; apunta con la mira y es acierto seguro.',
    features: ['Rayo de Energía', 'Velocidad 1800px/s', 'Precisión Quirúrgica'],
    range: 'Extremo',
    soundType: 'sniper',
  },
  [WeaponType.Bow]: {
    type: WeaponType.Bow,
    name: 'Arco Táctico y Flechas',
    category: 'Firearm',
    damage: 22,
    magSize: 15,
    cooldownTicks: 25,
    projectileSpeed: 850,
    accuracyDeg: 1.2,
    color: '#15803d',
    iconUrl: '/assets/weapons/Bow.png',
    description: 'Arco compuesto silencioso que dispara flechas de punta perforante.',
    tacticalTip: 'Daño limpio y certero a media distancia sin activar el sensor sonoro de los bots.',
    features: ['Silencioso', 'Punta Perforante', 'Tensión de Cuerda'],
    range: 'Largo',
    soundType: 'pistol',
  },

  // ────────────────── ARROJADIZAS & EXPLOSIVOS ──────────────────
  [WeaponType.Grenade]: {
    type: WeaponType.Grenade,
    name: 'Granada de Fragmentación Mk2',
    category: 'Throwable',
    damage: GameConstants.GrenadeDamage,
    magSize: GameConstants.GrenadeMag,
    cooldownTicks: 20,
    projectileSpeed: 400,
    accuracyDeg: 0,
    explosionRadius: GameConstants.GrenadeExplosionRadius,
    color: '#84cc16',
    iconUrl: '/assets/weapons/Grenade.png',
    description: 'Granada de mano militar con espoleta de retardo de 2 segundos y metralla.',
    tacticalTip: 'Rebótala contra paredes y techos para que caiga justo sobre la posición enemiga.',
    features: ['Temporizador de Retardo', 'Rebote Físico', 'Explosión de 70px'],
    range: 'Medio',
    soundType: 'explosion',
  },
  [WeaponType.Molotov]: {
    type: WeaponType.Molotov,
    name: 'Cóctel Molotov Incendiario',
    category: 'Throwable',
    damage: GameConstants.MolotovDamage,
    magSize: GameConstants.MolotovMag,
    cooldownTicks: 20,
    projectileSpeed: 350,
    accuracyDeg: 0,
    onFireDuration: GameConstants.OnFireDuration,
    color: '#ea580c',
    iconUrl: '/assets/weapons/Molotov.png',
    description: 'Botella de combustible con mecha que estalla en un charco de fuego persistente.',
    tacticalTip: 'Crea una zona de fuego de 4 segundos que bloquea el paso o castiga campers.',
    features: ['Charco de Fuego Activo (4s)', 'Control de Terreno', 'Ignición Inmediata'],
    range: 'Medio',
    soundType: 'explosion',
  },
  [WeaponType.C4]: {
    type: WeaponType.C4,
    name: 'Explosivo Plástico C4',
    category: 'Throwable',
    damage: 60,
    magSize: 2,
    cooldownTicks: 30,
    projectileSpeed: 300,
    accuracyDeg: 0,
    explosionRadius: 85,
    color: '#ef4444',
    iconUrl: '/assets/weapons/C4.png',
    description: 'Bloque de explosivo militar de demolición de extrema potencia destructiva.',
    tacticalTip: 'El explosivo con mayor radio de deflagración del juego (85px). Letal.',
    features: ['Daño Crítico Masivo (60 HP)', 'Deflagración Gigante (85px)', 'Demolición'],
    range: 'Corto',
    soundType: 'explosion',
  },
  [WeaponType.Mine]: {
    type: WeaponType.Mine,
    name: 'Mina Terrestre de Proximidad',
    category: 'Throwable',
    damage: 45,
    magSize: 3,
    cooldownTicks: 25,
    projectileSpeed: 250,
    accuracyDeg: 0,
    explosionRadius: 60,
    color: '#f59e0b',
    iconUrl: '/assets/weapons/Mine.png',
    description: 'Artefacto explosivo con sensor de presión que estalla cuando alguien lo pisa.',
    tacticalTip: 'Colócala sobre las plataformas elevadas cerca de donde aparecen las armas.',
    features: ['Sensor de Presión', 'Trampa Oculta', 'Defensa de Área'],
    range: 'Corto',
    soundType: 'explosion',
  },
  [WeaponType.Baseball]: {
    type: WeaponType.Baseball,
    name: 'Pelota de Béisbol Profesional',
    category: 'Throwable',
    damage: 14,
    magSize: 3,
    cooldownTicks: 15,
    projectileSpeed: 600,
    accuracyDeg: 0,
    color: '#f8fafc',
    iconUrl: '/assets/weapons/Baseball.png',
    description: 'Pelota dura de lanzamiento rápido capaz de golpear y noquear a distancia.',
    tacticalTip: 'Lánzala para interrumpir el fuego de un enemigo antes de cerrar la distancia.',
    features: ['Lanzamiento Veloz', 'Aturdimiento al Impacto', 'Interrupción'],
    range: 'Medio',
    soundType: 'punch',
  },

  // ────────────────── POTENCIADORES & ESPECIALES ──────────────────
  [WeaponType.StrengthBoost]: {
    type: WeaponType.StrengthBoost,
    name: 'Suero de Super Fuerza',
    category: 'Powerup',
    damage: 25,
    magSize: 1,
    cooldownTicks: 10,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#a855f7',
    iconUrl: '/assets/weapons/StrengthBoost.png',
    description: 'Inyección experimental de adrenalina que multiplica el daño melee por 2.5x.',
    tacticalTip: 'Permite derribar de un solo puñetazo cargado al oponente.',
    features: ['Buff de Daño Melee +150%', 'Efecto Visual Púrpura', 'Duración Temporal'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
  [WeaponType.SloMo10]: {
    type: WeaponType.SloMo10,
    name: 'Estimulante Neuro-Reflejos Slo-Mo',
    category: 'Powerup',
    damage: 0,
    magSize: 1,
    cooldownTicks: 10,
    projectileSpeed: 0,
    accuracyDeg: 0,
    color: '#06b6d4',
    iconUrl: '/assets/weapons/SloMo10.png',
    description: 'Acelerador neuronal que ralentiza la percepción temporal permitiendo esquivar balas.',
    tacticalTip: 'Actívalo ante lluvias de balas o ráfagas de escopeta para esquivarlas con rolls.',
    features: ['Percepción Temporal Aumentada', 'Reflejos Matriciales', 'Evasión Extrema'],
    range: 'Cuerpo a cuerpo',
    soundType: 'punch',
  },
};

export const SpawnableWeaponsList: WeaponType[] = [
  WeaponType.Knife,
  WeaponType.Machete,
  WeaponType.Axe,
  WeaponType.Sword,
  WeaponType.Katana,
  WeaponType.Bat,
  WeaponType.Baton,
  WeaponType.ShockBaton,
  WeaponType.LeadPipe,
  WeaponType.Pipe,
  WeaponType.Chainsaw,
  WeaponType.Hammer,
  WeaponType.Pistol,
  WeaponType.Pistol45,
  WeaponType.SilencedPistol,
  WeaponType.Magnum,
  WeaponType.Revolver,
  WeaponType.MachinePistol,
  WeaponType.Uzi,
  WeaponType.SilencedUzi,
  WeaponType.TommyGun,
  WeaponType.SMG,
  WeaponType.MP50,
  WeaponType.Rifle,
  WeaponType.Carbine,
  WeaponType.Shotgun,
  WeaponType.SawedOff,
  WeaponType.DarkShotgun,
  WeaponType.Sniper,
  WeaponType.Bazooka,
  WeaponType.GLauncher,
  WeaponType.Flamethrower,
  WeaponType.FlareGun,
  WeaponType.Grenade,
  WeaponType.Molotov,
];

export function getWeapon(type: WeaponType): WeaponData {
  return WeaponDatabase[type] || WeaponDatabase[WeaponType.Fists];
}

export function isBladeWeapon(type: WeaponType): boolean {
  return (
    type === WeaponType.Knife ||
    type === WeaponType.Machete ||
    type === WeaponType.Axe ||
    type === WeaponType.Sword ||
    type === WeaponType.Katana
  );
}

/**
 * Espadas exclusivas del Ninja (Katana, Espada, Machete).
 * Tienen máxima prioridad de combate, activando el estilo único y fluido
 * de combate con espada del Ninja (combo de 3 tajos mortales).
 */
export function isSwordWeapon(type: WeaponType): boolean {
  return (
    type === WeaponType.Katana ||
    type === WeaponType.Sword ||
    type === WeaponType.Machete
  );
}

/**
 * Armas de la categoría "Agarre a una mano (Corte/Impacto rápido)" (one_hand_attack):
 * Katana, Machete, Cuchillo, Baton, ShockBaton, Whip, CueStick.
 * Utilizan exclusivamente el set oficial de animación 'one_hand_attack' (5 frames).
 * Esta animación es la base y prioridad oficial para este tipo de armas.
 */
export const ONE_HAND_WEAPONS: ReadonlySet<WeaponType> = new Set([
  WeaponType.Katana,
  WeaponType.Machete,
  WeaponType.Knife,
  WeaponType.Baton,
  WeaponType.ShockBaton,
  WeaponType.Whip,
  WeaponType.CueStick,
]);

export function isOneHandWeapon(type: WeaponType): boolean {
  return ONE_HAND_WEAPONS.has(type);
}

/**
 * Armas de la categoría "Ataque a dos manos (Golpe pesado)" (two_hand_attack):
 * Hacha (Axe), Bat, LeadPipe, Hammer, Chair, Pipe, Bottle, Teapot y Pillow.
 * Utilizan el set oficial de animación 'two_hand_attack' (6 frames) y
 * cambian el estado del personaje a 'arma_dos_manos'.
 */
export const TWO_HAND_WEAPONS: ReadonlySet<WeaponType> = new Set([
  WeaponType.Axe,
  WeaponType.Bat,
  WeaponType.LeadPipe,
  WeaponType.Hammer,
  WeaponType.Chair,
  WeaponType.Pipe,
  WeaponType.Bottle,
  WeaponType.Teapot,
  WeaponType.Pillow,
]);

export function isTwoHandWeapon(type: WeaponType): boolean {
  return TWO_HAND_WEAPONS.has(type);
}

/**
 * Armas de la categoría "Ataque a una mano (Pistolas)" (pistol_shoot):
 * Pistol, Pistol45, Revolver, Magnum, SilencedPistol, MachinePistol, Uzi, SilencedUzi, FlareGun.
 * Utilizan el set oficial de animación 'pistol_shoot' (4 frames) y la lógica de
 * apuntado y disparo en movimiento de Superfighters.
 */
export const PISTOL_WEAPONS: ReadonlySet<WeaponType> = new Set([
  WeaponType.Pistol,
  WeaponType.Pistol45,
  WeaponType.Revolver,
  WeaponType.Magnum,
  WeaponType.SilencedPistol,
  WeaponType.MachinePistol,
  WeaponType.Uzi,
  WeaponType.SilencedUzi,
  WeaponType.FlareGun,
]);

export function isPistolWeapon(type: WeaponType): boolean {
  return PISTOL_WEAPONS.has(type);
}

/**
 * Armas de la categoría "Ataque a dos manos (Rifles/Escopetas)" (rifle_shoot):
 * Assault, Carbine, M60, Sniper, Shotgun, SawedOff, DarkShotgun, SMG, MP50, TommyGun, Lazer, Flamethrower, Bow.
 * Utilizan el set oficial de animación 'rifle_shoot' (4 frames), con fuerte retroceso en frame 3,
 * sensación de peso mayor (velocidad reducida) y disparo en movimiento de Superfighters (sin correr).
 */
export const RIFLE_WEAPONS: ReadonlySet<string> = new Set([
  'Assault',
  'Rifle',
  WeaponType.Rifle,
  WeaponType.Assault,
  WeaponType.Carbine,
  WeaponType.M60,
  WeaponType.Sniper,
  WeaponType.Shotgun,
  WeaponType.SawedOff,
  WeaponType.DarkShotgun,
  WeaponType.SMG,
  WeaponType.MP50,
  WeaponType.TommyGun,
  WeaponType.Lazer,
  WeaponType.Flamethrower,
  WeaponType.Bow,
]);

export function isRifleWeapon(type: string | WeaponType): boolean {
  return RIFLE_WEAPONS.has(type as string);
}

/**
 * Armas de la categoría "Arrojadizas / Lanzamiento hacia arriba" (throw_up):
 * Grenade, Molotov, C4, Baseball, Mine.
 * Utilizan el set oficial de animación 'throw_up' (5 frames, One Shot),
 * soltando el proyectil exactamente en el Frame 3 (cuando el brazo se extiende hacia adelante).
 */
export const THROWABLE_WEAPONS: ReadonlySet<WeaponType> = new Set([
  WeaponType.Grenade,
  WeaponType.Molotov,
  WeaponType.C4,
  WeaponType.Baseball,
  WeaponType.Mine,
]);

export function isThrowableWeapon(type: string | WeaponType): boolean {
  return THROWABLE_WEAPONS.has(type as WeaponType);
}

export interface WeaponStunData {
  stunLight: number;
  stunMedium: number;
  stunHeavy: number;
  hitStopLight: number;
  hitStopHeavy: number;
}

export const WEAPON_STUN_DEFAULTS: Record<string, WeaponStunData> = {
  default: { stunLight: 16, stunMedium: 20, stunHeavy: 24, hitStopLight: 3, hitStopHeavy: 6 },
  blade: { stunLight: 16, stunMedium: 20, stunHeavy: 28, hitStopLight: 4, hitStopHeavy: 6 },
  heavy: { stunLight: 20, stunMedium: 24, stunHeavy: 32, hitStopLight: 5, hitStopHeavy: 7 },
  projectile: { stunLight: 12, stunMedium: 16, stunHeavy: 22, hitStopLight: 2, hitStopHeavy: 5 },
};

export function getWeaponStunData(type?: WeaponType): WeaponStunData {
  if (!type) return WEAPON_STUN_DEFAULTS.default;
  const w = WeaponDatabase[type];
  if (!w) return WEAPON_STUN_DEFAULTS.default;
  if (w.category === 'Melee') {
    if (type === WeaponType.Sword || type === WeaponType.Katana || type === WeaponType.Machete || type === WeaponType.Axe) {
      return WEAPON_STUN_DEFAULTS.blade;
    }
    if (type === WeaponType.Hammer || type === WeaponType.Chainsaw || type === WeaponType.LeadPipe) {
      return WEAPON_STUN_DEFAULTS.heavy;
    }
    return WEAPON_STUN_DEFAULTS.default;
  }
  return WEAPON_STUN_DEFAULTS.projectile;
}

export type WeaponSlot = 'melee' | 'handgun' | 'primary' | 'throwable';

/**
 * Determina a qué ranura de inventario pertenece un arma:
 * - 'melee': Armas cuerpo a cuerpo (puños, katana, cuchillo, bate, hacha, etc.)
 * - 'handgun': Pistolas y armas de fuego de una mano
 * - 'primary': Rifles, escopetas, bazooka y armas de fuego a dos manos
 * - 'throwable': Granadas, cócteles molotov y arrojadizas
 * - 'powerup': Estimulantes y mejoras temporales (no ocupan ranura fija)
 */
export function slotForWeapon(type: WeaponType): WeaponSlot | 'powerup' | null {
  const w = WeaponDatabase[type];
  if (!w) return null;
  if (w.category === 'Powerup') return 'powerup';
  if (w.category === 'Throwable' || isThrowableWeapon(type)) return 'throwable';
  if (w.category === 'Melee') return 'melee';
  if (isPistolWeapon(type)) return 'handgun';
  if (isRifleWeapon(type)) return 'primary';
  if (w.category === 'Firearm') {
    if (isOneHandWeapon(type)) return 'handgun';
    return 'primary';
  }
  return null;
}


