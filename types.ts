
export enum GameScreen {
  Menu,
  Playing,
  Paused,
  Controls,
  Credits,
  Customize,
  GameOver,
  HowToPlay,
  WaveModeMenu,
  WaveModeLobby,
  WaveModePlaying,
  WaveModeGameOver,
  WaveModeBotSelection,
  Changelog,
}

export enum GameMode {
  Classic,
  Wave
}

export interface Controls {
  up: string;
  down:string;
  left: string;
  right: string;
  run: string;
  attack: string;
  shield: string;
  magic: string;
  switchMagic: string;
  fireBow: string;
  switchWeapon: string;
}

export type PlayerShape = 'circle' | 'square' | 'pentagon';

export interface Customization {
  color: string;
  shape: PlayerShape;
}

export type BossType = 'melee' | 'ranged' | 'slowed' | null;
export type PrimaryWeapon = 'sword' | 'axe';

export interface EnemyState {
  id: string;
  x: number;
  y: number;
  hp: number;
  damage: number;
  type: 'normal' | 'shooter' | 'boss' | 'knight' | 'knight_shooter' | 'angel' | 'angel_shooter' | 'angel_shield';
  bossType: BossType;
  lastShot?: number;
  shieldHits?: number;
  attackState?: {
    isAttacking: boolean;
    angle: number;
    timestamp: number;
  };
  targetId?: string | null;
  statIncreaseText?: { text: string; creationTime: number };
  shieldHp?: number;
  angleToTarget?: number;
  pointValue: number;
  maxHp?: number;
  frozenUntil?: number;
  lastHitTimestamp?: number;
  hitCount?: number;
}

export type SpellType = 'fire' | 'ice' | 'arrow' | 'necromancer' | 'blessing' | 'explosion' | 'magic_shield';

export interface ProjectileState {
  id:string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  damage: number;
  reflected: boolean;
  spawnTime: number;
  source: 'player' | 'enemy';
  spellType: SpellType | null;
  hitEnemyIds?: Set<string>;
  ownerId?: string;
}

export interface AllyState {
  id: string;
  x: number;
  y: number;
  hp: number;
  targetId: string | null;
  lastAttackTime: number;
  attackCooldown: number;
  attackState?: {
    isAttacking: boolean;
    timestamp: number;
  };
  ownerId: string;
}

export type RedChestUpgradeType = 'knowledge' | 'magic' | 'renegade' | 'resistant' | 'corredor' | 'luck' | 'piercingArrows' | 'economy' | 'necromancerUpgrade' | 'doublePoints' | 'pinguinRico';

// Common Player Attack State
export interface PlayerAttackState {
    type: PrimaryWeapon;
    startTime: number;
    startAngle: number;
    hitEnemies: Set<string>;
}

// Classic Mode Player State
export interface PlayerState {
  x: number;
  y: number;
  lives: number;
  maxLives: number;
  stamina: number;
  maxStamina: number;
  speed: number;
  runBoost: number;
  boosting: boolean;
  lastRunTime: number;
  damageMultiplier: number;
  weaponHits: number;
  aimAngle: number;
  invulnerable: boolean;
  regen: number;
  knowledge: number;
  magic: number;
  mana: number;
  maxMana: number;
  renegade: number;
  resistant: boolean;
  availableSpells: ('fire' | 'ice' | 'necromancer' | 'blessing' | 'explosion' | 'magic_shield')[];
  selectedSpell: 'fire' | 'ice' | 'necromancer' | 'blessing' | 'explosion' | 'magic_shield' | null;
  hasBow: boolean;
  arrows: number;
  maxArrows: number;
  lastBowShot: number;
  luck: boolean;
  piercingArrows: boolean;
  manaCostReduction: number;
  necromancerLevel: number;
  resistance: number;
  damageUpTimestamp: number;
  damageUpValue: number;
  blessingState: 'inactive' | 'maxHealthSet';
  lastBlessingTime: number;
  blessingRegenEndTime: number;
  hasAxe: boolean;
  equippedWeapon: PrimaryWeapon;
  attackState?: PlayerAttackState;
  pinguinRicoLevel: number;
  staminaRechargeRate: number;
  manaRechargeRate: number;
}

// Classic Mode Game State
export interface GameState {
  player: PlayerState;
  room: number;
  kills: number;
  enemies: EnemyState[];
  allies: AllyState[];
  projectiles: ProjectileState[];
  chest: 'normal' | 'blue' | null;
  blueChestPosition: { x: number, y: number } | null,
  bowChestPosition: { x: number, y: number } | null,
  redChestPosition: { x: number, y: number } | null,
  doorOpen: boolean;
  lastDmg: number;
  dmgCD: number;
  shield: {
    available: boolean;
    active: boolean;
    cooldown: boolean;
    angle: number;
  };
  gameDimensions: { width: number; height: number };
  bossEncounterCount: { melee: number; ranged: number; slowed: number; };
  resistanceUpTimestamp: number;
}


// --- WAVE MODE ---
export type BotGoal = 'FIGHTING' | 'SHOPPING' | 'COLLECTING_CHEST' | 'IDLE' | 'DODGING';

export interface BotAIState {
    goal: BotGoal;
    targetId: string | null; // Can be enemy id, chest id, etc.
    lastDecisionTime: number; // To avoid changing goals too rapidly
    moveTarget: { x: number; y: number } | null;
    wantsToAttack: boolean;
    dodgeUntil?: number;
    wasDodging?: boolean;
}

export interface WavePlayerState extends PlayerState {
    id: string; // For multiplayer
    name: string;
    points: number;
    isDead: boolean;
    isBot: boolean;
    aiState?: BotAIState;
    shield: {
        available: boolean;
        active: boolean;
        cooldown: boolean;
        angle: number;
        shieldHp?: number;
        maxShieldHp?: number;
        activeUntil?: number;
        cooldownUntil?: number;
    };
    lastDmg: number;
    dmgCD: number;
    pickupText?: { text: string; creationTime: number };
    shieldHitTimestamp?: number;
    resistanceUpTimestamp: number;
    doublePointsLevel: number;
    waveBonusText?: { text: string; creationTime: number };
    waveResistanceBonusText?: { text: string; creationTime: number };
    isMagicShieldActive: boolean;
}

export type WaveState = 'intermission' | 'fighting';

export interface ShopItem {
    id: string; // e.g. 'upgrade_chest', 'power_chest', 'axe', 'bow', 'shield'
    name: string;
    cost: number;
    type: 'chest' | 'weapon' | 'ability';
}

export interface SpawnedChest {
    id: string;
    x: number;
    y: number;
    type: 'upgrade' | 'power';
}

export interface AreaEffectState {
    id: string;
    x: number;
    y: number;
    radius: number;
    damagePerSecond: number;
    duration: number;
    startTime: number;
    lastTickTime: number;
    ownerId: string;
    type: 'explosion';
    hitEnemyIdsThisTick: Set<string>;
}

export interface WaveGameState {
    players: WavePlayerState[];
    enemies: EnemyState[];
    allies: AllyState[];
    projectiles: ProjectileState[];
    wave: number;
    waveState: WaveState;
    waveTimer: number; // seconds
    gameDimensions: { width: number; height: number };
    shop: {
        x: number;
        y: number;
        radius: number;
    };
    spawnedChests: SpawnedChest[];
    areaEffects: AreaEffectState[];
}
