import type { Controls, Customization, PlayerState, BossType } from './types';

export const BASE_GAME_WIDTH = 600;
export const BASE_GAME_HEIGHT = 400;

export const initialControls: Controls = {
  up: 'w',
  down: 's',
  left: 'a',
  right: 'd',
  run: 'Shift',
  attack: ' ',
  shield: 'r',
  magic: 'q',
  switchMagic: 't',
  fireBow: 'f',
};

export const defaultCustomization: Customization = {
  color: '#4f91e8',
  shape: 'circle',
};

export const initialPlayerState: PlayerState = {
  x: BASE_GAME_WIDTH / 2 - 15,
  y: BASE_GAME_HEIGHT / 2 - 15,
  lives: 5,
  maxLives: 5,
  stamina: 100,
  maxStamina: 100,
  speed: 2,
  runBoost: 5,
  boosting: false,
  lastRunTime: 0,
  damageMultiplier: 1,
  weaponHits: 4,
  attackAngle: 0,
  invulnerable: false,
  regen: 0,
  knowledge: 0,
  magic: 0,
  mana: 0,
  maxMana: 0,
  renegade: 0,
  resistant: false,
  availableSpells: [],
  selectedSpell: null,
  hasBow: false,
  arrows: 0,
  maxArrows: 50,
  lastBowShot: 0,
  luck: false,
  piercingArrows: false,
  manaCostReduction: 0,
  necromancerLevel: 0,
  resistance: 0,
  damageUpTimestamp: 0,
  damageUpValue: 0,
  blessingState: 'inactive',
  lastBlessingTime: 0,
  blessingRegenEndTime: 0,
};

export const YUBOKUMIN_DATA: { type: BossType, name: string, maxHp: number, color: string, damage: number, speed: number, preferredDistance?: number }[] = [
    {
      type: 'melee',
      name: 'Yubokumin Senshi',
      maxHp: 20,
      color: 'crimson',
      damage: 1.5,
      speed: 1.2,
    },
    {
      type: 'slowed',
      name: 'Hogo Yubokumin',
      maxHp: 30,
      color: 'darkolivegreen',
      damage: 3,
      speed: 0.8,
    },
    {
      type: 'ranged',
      name: 'Tōi Yubokumin',
      maxHp: 18,
      color: 'magenta',
      damage: 3, // This is projectile damage
      speed: 1.0,
      preferredDistance: 160
    }
];