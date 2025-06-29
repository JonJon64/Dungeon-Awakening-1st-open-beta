export enum GameScreen {
  Menu,
  Playing,
  Paused,
  Controls,
  Credits,
  Customize,
  GameOver,
  HowToPlay,
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
}

export type PlayerShape = 'circle' | 'square' | 'pentagon';

export interface Customization {
  color: string;
  shape: PlayerShape;
}

export type BossType = 'melee' | 'ranged' | 'slowed' | null;

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
}

export type SpellType = 'fire' | 'ice' | 'arrow' | 'necromancer' | 'blessing';

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
}

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
  attackAngle: number;
  invulnerable: boolean;
  regen: number;
  knowledge: number;
  magic: number;
  mana: number;
  maxMana: number;
  renegade: number;
  resistant: boolean;
  availableSpells: ('fire' | 'ice' | 'necromancer' | 'blessing')[];
  selectedSpell: 'fire' | 'ice' | 'necromancer' | 'blessing' | null;
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
}

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