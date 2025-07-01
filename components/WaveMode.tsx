

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Controls, Customization, EnemyState, ProjectileState, AllyState, WaveGameState, WavePlayerState, BossType, SpawnedChest, ShopItem, PrimaryWeapon, SpellType, RedChestUpgradeType, BotGoal, AreaEffectState } from '../types';
import { initialWavePlayerState, YUBOKUMIN_DATA, BOT_NAMES, initialPlayerState } from '../constants';

import Player from './Player';
import Enemy from './Enemy';
import Ally from './Ally';
import Projectile from './Projectile';
import Shield from './Shield';
import Sword from './Sword';
import Bow from './Bow';
import Axe from './Axe';
import Minimap from './Minimap';
import ShopModal from './ShopModal';
import UpgradeModal, { type UpgradeType as NormalUpgradeType } from './UpgradeModal';
import RedChestUpgradeModal from './RedChestUpgradeModal';
import WaveModeGameOverScreen from './WaveModeGameOverScreen';
import AllyHud from './AllyHud';

interface WaveModeProps {
  controls: Controls;
  customization: Customization;
  onBackToMenu: () => void;
  botCount: number;
}

const WEAPON_STATS = {
  sword: { range: 100, cooldown: 300, damage: 1, angleTolerance: Math.PI / 4, animationDuration: 220, swingArc: Math.PI / 2 },
  axe: { range: 130, cooldown: 600, damage: 1.8, angleTolerance: Math.PI / 3, animationDuration: 500, swingArc: Math.PI * 1.5 }
};
const WAVE_MODE_DIMENSIONS = { width: 3000, height: 2000 };
const VIEWPORT_DIMENSIONS = { width: 1200, height: 800 };
const PLAYER_ID = 'player1'; // Hardcoded for offline mode

const CHEST_SPAWN_SLOTS = [
    { x: WAVE_MODE_DIMENSIONS.width / 2 - 60, y: WAVE_MODE_DIMENSIONS.height / 2 + 180 },
    { x: WAVE_MODE_DIMENSIONS.width / 2, y: WAVE_MODE_DIMENSIONS.height / 2 + 180 },
    { x: WAVE_MODE_DIMENSIONS.width / 2 + 60, y: WAVE_MODE_DIMENSIONS.height / 2 + 180 },
    { x: WAVE_MODE_DIMENSIONS.width / 2 - 60, y: WAVE_MODE_DIMENSIONS.height / 2 + 230 },
    { x: WAVE_MODE_DIMENSIONS.width / 2, y: WAVE_MODE_DIMENSIONS.height / 2 + 230 },
    { x: WAVE_MODE_DIMENSIONS.width / 2 + 60, y: WAVE_MODE_DIMENSIONS.height / 2 + 230 },
];

const resolveCollisions = (players: WavePlayerState[], enemies: EnemyState[], allies: AllyState[]) => {
    const PLAYER_RADIUS = 15;
    const ENEMY_RADIUS = 15;
    const BOSS_RADIUS = 25;
    const ALLY_RADIUS = 10;
    
    const allMovables: (WavePlayerState | EnemyState | AllyState)[] = [...players, ...enemies, ...allies];

    for (let i = 0; i < allMovables.length; i++) {
        for (let j = i + 1; j < allMovables.length; j++) {
            const A = allMovables[i];
            const B = allMovables[j];

            let radiusA: number, centerA: {x: number, y: number};
            if ('isBot' in A) { radiusA = PLAYER_RADIUS; centerA = { x: A.x + 15, y: A.y + 15 }; }
            else if ('ownerId' in A) { radiusA = ALLY_RADIUS; centerA = { x: A.x + 10, y: A.y + 10 }; }
            else { radiusA = A.type === 'boss' ? BOSS_RADIUS : ENEMY_RADIUS; centerA = { x: A.x + 15, y: A.y + 15 }; }

            let radiusB: number, centerB: {x: number, y: number};
            if ('isBot' in B) { radiusB = PLAYER_RADIUS; centerB = { x: B.x + 15, y: B.y + 15 }; }
            else if ('ownerId' in B) { radiusB = ALLY_RADIUS; centerB = { x: B.x + 10, y: B.y + 10 }; }
            else { radiusB = B.type === 'boss' ? BOSS_RADIUS : ENEMY_RADIUS; centerB = { x: B.x + 15, y: B.y + 15 }; }
            
            const dx = centerB.x - centerA.x;
            const dy = centerB.y - centerA.y;
            const distance = Math.hypot(dx, dy);
            const minDistance = radiusA + radiusB;

            if (distance < minDistance && distance > 0) {
                const overlap = (minDistance - distance) / 2; // Each moves by half the overlap
                const angle = Math.atan2(dy, dx);
                
                const pushX = Math.cos(angle) * overlap;
                const pushY = Math.sin(angle) * overlap;

                if (!('isDead' in A && A.isDead)) { A.x -= pushX; A.y -= pushY; }
                if (!('isDead' in B && B.isDead)) { B.x += pushX; B.y += pushY; }
            }
        }
    }
};


const WaveMode: React.FC<WaveModeProps> = ({ controls, customization, onBackToMenu, botCount }) => {
    const [gameState, setGameState] = useState<WaveGameState>(() => {
        const shopRadius = 150;
         const humanPlayer: WavePlayerState = { 
            ...initialWavePlayerState, 
            id: PLAYER_ID, 
            name: 'Player',
            x: WAVE_MODE_DIMENSIONS.width / 2, 
            y: WAVE_MODE_DIMENSIONS.height / 2 ,
            resistanceUpTimestamp: 0,
            doublePointsLevel: 0,
        };
        const bots: WavePlayerState[] = Array.from({ length: botCount }, (_, i) => ({
            ...initialWavePlayerState,
            id: `bot-${i+1}`,
            name: BOT_NAMES[i % BOT_NAMES.length],
            isBot: true,
            lives: 3,
            maxLives: 3,
            x: WAVE_MODE_DIMENSIONS.width / 2 + (Math.random() - 0.5) * 100,
            y: WAVE_MODE_DIMENSIONS.height / 2 + (Math.random() - 0.5) * 100,
            aiState: {
                goal: 'IDLE',
                targetId: null,
                lastDecisionTime: 0,
                moveTarget: null,
                wantsToAttack: false,
            },
            resistanceUpTimestamp: 0,
            doublePointsLevel: 0,
        }));

        return {
            players: [humanPlayer, ...bots],
            enemies: [],
            allies: [],
            projectiles: [],
            wave: 0,
            waveState: 'intermission',
            waveTimer: 5,
            gameDimensions: WAVE_MODE_DIMENSIONS,
            shop: {
                x: WAVE_MODE_DIMENSIONS.width / 2,
                y: WAVE_MODE_DIMENSIONS.height / 2,
                radius: shopRadius,
            },
            spawnedChests: [],
            areaEffects: [],
        };
    });

  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
  const [showShopModal, setShowShopModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showRedChestModal, setShowRedChestModal] = useState(false);
  const [isGameOver, setGameOver] = useState(false);
  const [finalStats, setFinalStats] = useState({ wave: 0, score: 0 });

  const [attackEffects, setAttackEffects] = useState<Record<string, {type: 'sword' | 'axe' | 'bow', angle: number, timestamp: number}>>({});
  const [shieldCooldownTimers, setShieldCooldownTimers] = useState<Record<string, number>>({});

  const keysPressed = useRef<Record<string, boolean>>({});
  const gameLoopId = useRef<number | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  const humanPlayer = gameState.players.find(p => !p.isBot) ?? gameState.players[0];

  useEffect(() => {
    if (humanPlayer && !humanPlayer.isDead) {
      setCameraPosition({
        x: Math.max(0, Math.min(WAVE_MODE_DIMENSIONS.width - VIEWPORT_DIMENSIONS.width, humanPlayer.x + 15 - VIEWPORT_DIMENSIONS.width / 2)),
        y: Math.max(0, Math.min(WAVE_MODE_DIMENSIONS.height - VIEWPORT_DIMENSIONS.height, humanPlayer.y + 15 - VIEWPORT_DIMENSIONS.height / 2)),
      });
    }
  }, [humanPlayer?.x, humanPlayer?.y, humanPlayer?.isDead]);

  const startNextWave = useCallback(() => {
    setGameState(prev => {
        const newWave = prev.wave + 1;
        const now = Date.now();

        let revivedPlayers = prev.players.map(p => {
            const newPlayer = {
                ...p,
                isDead: false,
                lives: p.isDead ? Math.max(1, Math.floor(p.maxLives / 2)) : p.lives,
                x: WAVE_MODE_DIMENSIONS.width / 2 + (Math.random() - 0.5) * 50,
                y: WAVE_MODE_DIMENSIONS.height / 2 + (Math.random() - 0.5) * 50,
                waveBonusText: undefined,
                waveResistanceBonusText: undefined,
            };

            const bonusChance = Math.random();
            let bonusTexts: string[] = [];

            if (bonusChance < 0.4 || (bonusChance >= 0.8 && bonusChance < 0.9)) { // Damage bonus
                 const bonusValue = 0.05 * (1 + newWave * 0.05);
                 newPlayer.damageMultiplier += bonusValue;
                 bonusTexts.push(`+Dano ${bonusValue.toFixed(2)}x`);
            }
            if (bonusChance > 0.6 || (bonusChance >= 0.8 && bonusChance < 0.9)) { // Health bonus
                const bonusValue = 1 * (1 + newWave * 0.05);
                newPlayer.maxLives += bonusValue;
                newPlayer.lives += bonusValue;
                bonusTexts.push(`+${bonusValue.toFixed(0)} Vida`);
            }
            if(bonusTexts.length > 0) {
                newPlayer.waveBonusText = { text: bonusTexts.join(', '), creationTime: now };
            }

            return newPlayer;
        });
        
        if (newWave > 0 && newWave % 2 === 0) {
            revivedPlayers = revivedPlayers.map(p => {
                if (p.isDead || p.resistance >= 1.25) return p;
                const resistanceGain = Math.random() * (0.50 - 0.12) + 0.12;
                const newResistance = Math.min(1.25, p.resistance + resistanceGain);
                return {
                    ...p,
                    resistance: newResistance,
                    waveResistanceBonusText: {
                        text: `+Resistência X${newResistance.toFixed(2)}`,
                        creationTime: now,
                    }
                };
            });
        }

        const newEnemies = spawnEnemiesForWave(newWave, revivedPlayers, prev.gameDimensions, now);

        return {
            ...prev,
            players: revivedPlayers,
            wave: newWave,
            waveState: 'fighting',
            enemies: newEnemies,
            projectiles: [],
            spawnedChests: [],
            areaEffects: [], // Clear old explosions
            allies: prev.waveState === 'intermission' ? prev.allies : [], // Clear allies only if starting a new wave from scratch, not between waves
        }
    });
  }, []);
  
  useEffect(() => {
    const allPlayersDead = gameState.players.length > 0 && gameState.players.every(p => p.isDead);

    if (allPlayersDead && !isGameOver) {
        if (gameLoopId.current) {
            clearInterval(gameLoopId.current);
            gameLoopId.current = null;
        }
        setGameOver(true);
        const latestPlayer = gameState.players.find(p => p.id === PLAYER_ID);
        setFinalStats({ wave: gameState.wave, score: latestPlayer?.points ?? 0 });
    }
  }, [gameState, isGameOver]);

  useEffect(() => {
    if (isGameOver) return;
    if (gameState.waveState === 'intermission') {
      if (gameState.waveTimer > 0) {
        const timerId = setTimeout(() => {
          setGameState(prev => ({ ...prev, waveTimer: prev.waveTimer - 1 }));
        }, 1000);
        return () => clearTimeout(timerId);
      } else if (gameState.waveTimer <= 0) {
        startNextWave();
      }
    }
  }, [gameState.waveState, gameState.waveTimer, startNextWave, isGameOver]);

    const gameLogic = useCallback(() => {
        setGameState(prev => {
            const now = Date.now();
            const targetedEnemyIds = new Set<string>();
            let newPlayers: WavePlayerState[] = prev.players.map(p => {
                // Manual deep-ish copy to preserve Set object in attackState
                const playerCopy = { ...p };
                if (playerCopy.attackState) {
                    playerCopy.attackState = {
                        ...playerCopy.attackState,
                        hitEnemies: new Set(playerCopy.attackState.hitEnemies)
                    };
                }
                if (playerCopy.shield) playerCopy.shield = { ...playerCopy.shield };
                if (playerCopy.aiState) playerCopy.aiState = { ...playerCopy.aiState };
                return playerCopy;
            });

            let newAllies = [...prev.allies];
            let newEnemies = [...prev.enemies];
            let newProjectiles = [...prev.projectiles];
            let newSpawnedChests = [...prev.spawnedChests];
            let newAreaEffects = [...prev.areaEffects];
            
            const damageToEnemies: Record<string, {damage: number, freeze?: number}> = {};
            const shieldDamageToEnemies: Record<string, number> = {};
            const damageToPlayers: Record<string, number> = {};
            const damageToAllies: Record<string, number> = {};
            const newlySpawnedProjectiles: ProjectileState[] = [];

            const SHOP_WALL_THICKNESS = 20;
            const SHOP_WALL_OFFSET = prev.shop.radius + 30;
            const SHOP_WALLS = [
                { x: prev.shop.x - SHOP_WALL_OFFSET, y: prev.shop.y - SHOP_WALL_OFFSET, width: SHOP_WALL_OFFSET * 2, height: SHOP_WALL_THICKNESS },
                { x: prev.shop.x - SHOP_WALL_OFFSET, y: prev.shop.y + SHOP_WALL_OFFSET - SHOP_WALL_THICKNESS, width: SHOP_WALL_OFFSET * 2, height: SHOP_WALL_THICKNESS },
                { x: prev.shop.x - SHOP_WALL_OFFSET, y: prev.shop.y - SHOP_WALL_OFFSET, width: SHOP_WALL_THICKNESS, height: SHOP_WALL_OFFSET * 2 },
                { x: prev.shop.x + SHOP_WALL_OFFSET - SHOP_WALL_THICKNESS, y: prev.shop.y - SHOP_WALL_OFFSET, width: SHOP_WALL_THICKNESS, height: SHOP_WALL_OFFSET * 2 },
            ];
            
            // --- PLAYER UPDATE LOOP (AI and Human) ---
            for(const player of newPlayers) {
                if(player.isDead) continue;
                
                let dx = 0, dy = 0;

                // --- BOT AI LOGIC ---
                if(player.isBot && player.aiState) {
                    const ai = player.aiState;

                    // DODGE LOGIC
                    if(ai.dodgeUntil && now < ai.dodgeUntil) {
                        ai.goal = 'DODGING';
                    } else if (ai.goal === 'DODGING') {
                        ai.goal = 'IDLE'; // Dodging finished, ready for new goal
                    }

                    if (ai.goal !== 'DODGING') {
                         const AVOID_RADIUS = 120;
                         const closeProjectiles = prev.projectiles.filter(p => p.source === 'enemy' && Math.hypot(p.x - player.x, p.y - player.y) < AVOID_RADIUS);
                         if (closeProjectiles.length > 0) {
                            let fleeVectorX = 0;
                            let fleeVectorY = 0;
                            
                            for (const proj of closeProjectiles) {
                                const projDx = player.x - proj.x;
                                const projDy = player.y - proj.y;
                                const dist = Math.hypot(projDx, projDy);
                                if (dist > 0) {
                                    // Add the vector pointing away from the projectile, weighted by inverse distance
                                    fleeVectorX += projDx / (dist * dist);
                                    fleeVectorY += projDy / (dist * dist);
                                }
                            }

                            if (fleeVectorX !== 0 || fleeVectorY !== 0) {
                                const fleeAngle = Math.atan2(fleeVectorY, fleeVectorX);
                                ai.moveTarget = {
                                    x: player.x + Math.cos(fleeAngle) * 100, // Move 100 units in the safe direction
                                    y: player.y + Math.sin(fleeAngle) * 100
                                };
                                ai.goal = 'DODGING';
                                ai.dodgeUntil = now + 400;
                                ai.wasDodging = true; // Flag that we just dodged
                            }
                         }
                    }

                    // Goal Setting
                    if(now - ai.lastDecisionTime > 1000 && ai.goal !== 'DODGING') {
                        ai.lastDecisionTime = now;
                        
                        if (ai.wasDodging) { // After dodging, hunt shooters
                            ai.wasDodging = false;
                            ai.goal = 'FIGHTING';
                            const shooters = newEnemies.filter(e => e.type.includes('shooter') && e.hp > 0);
                            if (shooters.length > 0) {
                                const nearestShooter = shooters.sort((a,b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0];
                                ai.targetId = nearestShooter.id;
                                ai.moveTarget = { x: nearestShooter.x, y: nearestShooter.y };
                            }
                            // if no shooters, will fall through to normal FIGHTING logic
                        }
                        
                        if(prev.waveState === 'intermission') {
                            const chest = prev.spawnedChests.sort((a,b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0];
                            if(chest) {
                                ai.goal = 'COLLECTING_CHEST';
                                ai.targetId = chest.id;
                                ai.moveTarget = {x: chest.x, y: chest.y};
                            } else if(player.points > 150) {
                                ai.goal = 'SHOPPING';
                                ai.moveTarget = {x: prev.shop.x, y: prev.shop.y};
                            } else {
                                ai.goal = 'IDLE';
                                ai.moveTarget = null;
                            }
                        } else { // Fighting
                           ai.goal = 'FIGHTING';
                        }
                    }

                    // Action Execution
                    ai.wantsToAttack = false;
                    switch(ai.goal) {
                        case 'FIGHTING': {
                            const aliveEnemies = newEnemies.filter(e => e.hp > 0);
                            let potentialTargets = aliveEnemies.filter(e => !targetedEnemyIds.has(e.id));
                            if (potentialTargets.length === 0) potentialTargets = aliveEnemies;
                            
                            const target = potentialTargets.reduce((closest, e) => {
                                const dist = Math.hypot(e.x - player.x, e.y - player.y);
                                if (dist < (closest?.dist ?? Infinity)) return { e, dist };
                                return closest;
                            }, null as {e: EnemyState, dist: number} | null);
                            
                            if (target) {
                                ai.targetId = target.e.id;
                                targetedEnemyIds.add(target.e.id);
                                
                                // AI weapon switching logic
                                if (player.hasAxe) {
                                    const isShooter = target.e.type.includes('shooter') || (target.e.type === 'boss' && target.e.bossType === 'ranged');
                                    player.equippedWeapon = isShooter ? 'axe' : 'sword';
                                }
        
                                ai.moveTarget = {x: target.e.x, y: target.e.y};
                                player.aimAngle = Math.atan2(target.e.y - player.y, target.e.x - player.x);
                                const weaponStats = WEAPON_STATS[player.equippedWeapon];
                                
                                const safeAttackDistance = weaponStats.range * 0.9;
                                if (target.dist > safeAttackDistance) { /* Move closer */ } 
                                else if(target.dist < weaponStats.range * 0.6) { ai.moveTarget = {x: player.x - (target.e.x - player.x), y: player.y - (target.e.y - player.y)}; }
                                else { ai.wantsToAttack = true; ai.moveTarget = null; }
                            } else { ai.targetId = null; ai.moveTarget = null; }
                            break;
                        }
                        case 'SHOPPING': {
                            if(Math.hypot(player.x - prev.shop.x, player.y - prev.shop.y) < prev.shop.radius) {
                                if(player.points >= 250 && !player.hasAxe) {player.points-=250; player.hasAxe = true; player.pickupText = { text: 'Machado!', creationTime: now };}
                                else if(player.points >= 500 && !player.shield.available) {player.points-=500; player.shield.available = true; player.pickupText = { text: 'Escudo Habil.', creationTime: now };}
                                else if(player.points >= 95) {
                                    player.points-=95;
                                    const chestType = Math.random() < 0.5 ? 'upgrade' : 'power';
                                    const occupiedSlots = new Set(newSpawnedChests.map(c => `${c.x},${c.y}`));
                                    const availableSlot = CHEST_SPAWN_SLOTS.find(slot => !occupiedSlots.has(`${slot.x},${slot.y}`));
                                    const spawnPos = availableSlot || { x: player.x, y: player.y + 40 };
                                    newSpawnedChests.push({ id: `bot-chest-${now}`, type: chestType, x: spawnPos.x, y: spawnPos.y });
                                }
                                ai.goal = 'IDLE';
                            }
                            break;
                        }
                         case 'COLLECTING_CHEST': {
                            const chest = newSpawnedChests.find(c => c.id === ai.targetId);
                            if(chest && Math.hypot(player.x - chest.x, player.y - chest.y) < 20) {
                                newSpawnedChests = newSpawnedChests.filter(c => c.id !== ai.targetId);
                                if(chest.type === 'power') {
                                    const upgrades: RedChestUpgradeType[] = ['knowledge', 'renegade', 'resistant', 'corredor', 'luck', 'piercingArrows', 'economy', 'doublePoints'];
                                    const choice = upgrades[Math.floor(Math.random() * upgrades.length)];
                                    player.pickupText = { text: 'Poder!', creationTime: now };
                                    applyRedChestUpgradeToPlayer(player, choice);
                                } else {
                                    const upgrades: NormalUpgradeType[] = ['damage', 'regen', 'speed', 'maxHealth', 'staminaRecharge', 'manaRecharge'];
                                    const choice = upgrades[Math.floor(Math.random() * upgrades.length)];
                                    player.pickupText = { text: 'Atributo!', creationTime: now };
                                    applyNormalUpgradeToPlayer(player, choice);
                                }
                                ai.goal = 'IDLE';
                            }
                            break;
                        }
                    }

                    if(ai.moveTarget) {
                        const angle = Math.atan2(ai.moveTarget.y - player.y, ai.moveTarget.x - player.x);
                        dx = Math.cos(angle);
                        dy = Math.sin(angle);
                    }
                } 
                else { // Human player
                     if (keysPressed.current[controls.up.toLowerCase()]) dy -= 1;
                     if (keysPressed.current[controls.down.toLowerCase()]) dy += 1;
                     if (keysPressed.current[controls.left.toLowerCase()]) dx -= 1;
                     if (keysPressed.current[controls.right.toLowerCase()]) dx += 1;
                }
                
                const wantsToAttack = (player.isBot && player.aiState?.wantsToAttack && !player.attackState) || (!player.isBot && keysPressed.current[controls.attack.toLowerCase()] && !player.attackState);
                if (wantsToAttack) {
                    player.attackState = {
                        type: player.equippedWeapon,
                        startTime: now,
                        startAngle: player.aimAngle,
                        hitEnemies: new Set<string>()
                    };
                    setAttackEffects(prevEff => ({...prevEff, [player.id]: {type: player.equippedWeapon, angle: player.aimAngle, timestamp: now}}));
                }

                if (player.attackState) {
                    const { type, startTime, startAngle, hitEnemies } = player.attackState;
                    const weaponStats = WEAPON_STATS[type];
                    const progress = (now - startTime) / weaponStats.animationDuration;
                    if (progress > 1) {
                        player.attackState = undefined;
                    } else {
                        const swingStartOffset = type === 'sword' ? -Math.PI / 4 : -Math.PI * (5/6);
                        const currentAngle = startAngle + swingStartOffset + (progress * weaponStats.swingArc);
                        
                        newEnemies.forEach(enemy => {
                            if (enemy.hp <= 0 || !hitEnemies || hitEnemies.has(enemy.id)) return;
                            const enemySize = enemy.type === 'boss' ? 50 : 30;
                            const ex = enemy.x + enemySize / 2;
                            const ey = enemy.y + enemySize / 2;
                            const distToPlayer = Math.hypot(ex - (player.x + 15), ey - (player.y + 15));
                            if (distToPlayer < weaponStats.range + enemySize / 2) {
                                const angleToEnemy = Math.atan2(ey - (player.y + 15), ex - (player.x + 15));
                                let angleDiff = Math.abs(currentAngle - angleToEnemy);
                                if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
                                
                                if (angleDiff < weaponStats.angleTolerance) {
                                    const dmg = weaponStats.damage * player.damageMultiplier;
                                    if (enemy.type === 'angel_shield' && (enemy.shieldHp ?? 0) > 0) shieldDamageToEnemies[enemy.id] = (shieldDamageToEnemies[enemy.id] || 0) + 1;
                                    else damageToEnemies[enemy.id] = {damage: (damageToEnemies[enemy.id]?.damage || 0) + dmg};
                                    hitEnemies.add(enemy.id);
                                }
                            }
                        });
                    }
                }
                
                const isRunning = (!player.isBot && keysPressed.current[controls.run.toLowerCase()] && player.stamina > 0) || (player.isBot && player.aiState?.goal === 'FIGHTING' && player.stamina > 0);
                player.boosting = isRunning;
                if(isRunning) { player.stamina = Math.max(0, player.stamina - 1.5); player.lastRunTime = now; }
                
                const speed = player.boosting ? player.runBoost : player.speed;
                if (dx !== 0 || dy !== 0) {
                    const len = Math.hypot(dx, dy);
                    player.x += (dx / len) * speed;
                    player.y += (dy / len) * speed;
                }
                
                if (!player.boosting && now - player.lastRunTime > 4000) player.stamina = Math.min(player.maxStamina, player.stamina + 0.5 * player.staminaRechargeRate);
                if (player.regen > 0 && player.lives < player.maxLives) player.lives = Math.min(player.maxLives, player.lives + player.regen * (16/1000));
                if (now < player.blessingRegenEndTime && player.lives < player.maxLives) player.lives = Math.min(player.maxLives, player.lives + 3.5 * (16/1000));
                if (player.maxMana > 0) player.mana = Math.min(player.maxMana, player.mana + 0.01 * player.manaRechargeRate);
            
                // Shield enemy collision
                if (player.shield.active) {
                    const shieldAngle = player.shield.angle;
                    const shieldX = player.x + 15 + Math.cos(shieldAngle) * 30;
                    const shieldY = player.y + 15 + Math.sin(shieldAngle) * 30;
                    const SHIELD_PUSH_RADIUS = 30;
                    const PUSH_FORCE = 3;

                    newEnemies.forEach(enemy => {
                        if (enemy.hp <= 0 || (enemy.frozenUntil && now < enemy.frozenUntil)) return;
                        const enemySize = enemy.type === 'boss' ? 50 : 30;
                        const enemyCenterX = enemy.x + enemySize / 2;
                        const enemyCenterY = enemy.y + enemySize / 2;

                        const dist = Math.hypot(shieldX - enemyCenterX, shieldY - enemyCenterY);
                        if (dist < SHIELD_PUSH_RADIUS + enemySize / 2) {
                            const pushAngle = Math.atan2(enemyCenterY - shieldY, enemyCenterX - shieldX);
                            enemy.x += Math.cos(pushAngle) * PUSH_FORCE;
                            enemy.y += Math.sin(pushAngle) * PUSH_FORCE;
                        }
                    });
                }

                 // Shield timer logic
                if (player.shield.active && now > (player.shield.activeUntil ?? 0)) {
                    player.shield.active = false;
                    player.invulnerable = false;
                    player.shield.cooldownUntil = now + 2000;
                    setShieldCooldownTimers(t => ({ ...t, [player.id]: 2 }));
                    const intervalId = setInterval(() => {
                        setShieldCooldownTimers(t => {
                            const newTime = (t[player.id] || 0) - 1;
                            if (newTime <= 0) clearInterval(intervalId);
                            return { ...t, [player.id]: newTime };
                        });
                    }, 1000);
                }
                if (player.shield.cooldown && now > (player.shield.cooldownUntil ?? 0)) {
                    player.shield.cooldown = false;
                }

                // Magic Shield Logic
                if (player.isMagicShieldActive) {
                    player.mana -= 7 * (16 / 1000); // 7 mana per second
                    if (player.mana <= 0) {
                        player.isMagicShieldActive = false;
                        player.mana = 0;
                    }
                }
            }
            
            // --- AI & ENEMY LOGIC ---
            newAllies = newAllies.map(ally => {
                let updatedAlly = { ...ally };
                const owner = newPlayers.find(p => p.id === ally.ownerId);
                if(!owner || owner.isDead) { // Remove ally if owner is gone
                    updatedAlly.hp = 0;
                    return updatedAlly;
                }
                
                const allySpeed = owner.speed * 0.8;
                
                let nearestEnemy: EnemyState | null = null;
                let minDistance = 120; // attack radius
                newEnemies.forEach(enemy => {
                    if (enemy.hp <= 0) return;
                    const dist = Math.hypot((enemy.x + 15) - (ally.x + 10), (enemy.y + 15) - (ally.y + 10));
                    if (dist < minDistance) {
                        minDistance = dist;
                        nearestEnemy = enemy;
                    }
                });

                if (nearestEnemy) {
                    updatedAlly.targetId = nearestEnemy.id;
                    const targetX = nearestEnemy.x + 15;
                    const targetY = nearestEnemy.y + 15;
                    
                    if (minDistance > 25) { // Move closer
                        const angle = Math.atan2(targetY - (ally.y + 10), targetX - (ally.x + 10));
                        updatedAlly.x += Math.cos(angle) * allySpeed;
                        updatedAlly.y += Math.sin(angle) * allySpeed;
                    } else if (now - updatedAlly.lastAttackTime > updatedAlly.attackCooldown) { // Attack
                        updatedAlly.lastAttackTime = now;
                        updatedAlly.attackState = { isAttacking: true, timestamp: now };
                        const allyDamage = 2 * (2 ** owner.necromancerLevel);
                        damageToEnemies[nearestEnemy.id] = { damage: (damageToEnemies[nearestEnemy.id]?.damage || 0) + allyDamage };
                    }
                } else { // Follow owner
                    updatedAlly.targetId = null;
                    const distToOwner = Math.hypot((owner.x + 15) - (ally.x + 10), (owner.y + 15) - (ally.y + 10));
                    if (distToOwner > 60) {
                        const angle = Math.atan2((owner.y + 15) - (ally.y + 10), (owner.x + 15) - (ally.x + 10));
                        updatedAlly.x += Math.cos(angle) * allySpeed;
                        updatedAlly.y += Math.sin(angle) * allySpeed;
                    }
                }
                return updatedAlly;
            }).filter(a => a.hp > 0);

            newEnemies = newEnemies.map(enemy => {
                let updatedEnemy = {...enemy};
                if(updatedEnemy.frozenUntil && now < updatedEnemy.frozenUntil) return updatedEnemy;

                const alivePlayersAndAllies = [...newPlayers.filter(p => !p.isDead), ...newAllies];
                if (alivePlayersAndAllies.length === 0) return updatedEnemy;
                
                const target = alivePlayersAndAllies.reduce((closest, t) => {
                    const dist = Math.hypot(t.x - enemy.x, t.y - enemy.y);
                    if(dist < (closest?.dist ?? Infinity)) return {t, dist};
                    return closest;
                }, null as {t: (WavePlayerState | AllyState), dist: number} | null);
                
                if(target) {
                    const oldX = updatedEnemy.x, oldY = updatedEnemy.y;
                    const angleToTarget = Math.atan2(target.t.y - enemy.y, target.t.x - enemy.x);
                    updatedEnemy.angleToTarget = angleToTarget;
                    const isShooterType = updatedEnemy.type.includes('shooter') || (updatedEnemy.type === 'boss' && updatedEnemy.bossType === 'ranged');
                    const enemySpeed = (YUBOKUMIN_DATA.find(b => b.type === enemy.bossType)?.speed ?? 1);
                    
                    if (isShooterType) {
                        const idealDistance = (updatedEnemy.type === 'boss') ? 200 : 150;
                        if (target.dist > idealDistance) { updatedEnemy.x += Math.cos(angleToTarget) * enemySpeed; updatedEnemy.y += Math.sin(angleToTarget) * enemySpeed; }
                        else if (target.dist < idealDistance - 20) { updatedEnemy.x -= Math.cos(angleToTarget) * enemySpeed; updatedEnemy.y -= Math.sin(angleToTarget) * enemySpeed; }
                        
                        if (now - (updatedEnemy.lastShot || 0) > 2500) {
                            updatedEnemy.lastShot = now;
                            newlySpawnedProjectiles.push({ id: `proj-${now}-${Math.random()}`, x: updatedEnemy.x+15, y: updatedEnemy.y+15, dx: Math.cos(angleToTarget) * 3, dy: Math.sin(angleToTarget) * 3, damage: updatedEnemy.damage, reflected: false, spawnTime: now, source: 'enemy', spellType: null, ownerId: updatedEnemy.id });
                        }
                    } else { // Melee
                        updatedEnemy.x += Math.cos(angleToTarget) * enemySpeed;
                        updatedEnemy.y += Math.sin(angleToTarget) * enemySpeed;
                        const attackDist = 'isBot' in target.t ? 30 : 25;
                        if (target.dist < attackDist) {
                            if ('isBot' in target.t) damageToPlayers[target.t.id] = (damageToPlayers[target.t.id] || 0) + updatedEnemy.damage;
                            else damageToAllies[target.t.id] = (damageToAllies[target.t.id] || 0) + updatedEnemy.damage;
                        }
                    }
                    
                    const enemySize = updatedEnemy.type === 'boss' ? 50 : 30;
                    for (const wall of SHOP_WALLS) {
                        if (updatedEnemy.x < wall.x + wall.width && updatedEnemy.x + enemySize > wall.x && updatedEnemy.y < wall.y + wall.height && updatedEnemy.y + enemySize > wall.y) {
                            updatedEnemy.x = oldX; updatedEnemy.y = oldY; break;
                        }
                    }
                }
                return updatedEnemy;
            });
            newProjectiles.push(...newlySpawnedProjectiles);

            // --- PROJECTILE & DAMAGE LOGIC ---
            const finalProjectiles: ProjectileState[] = [];
            for (let p of newProjectiles) {
                let proj = { ...p, x: p.x + p.dx, y: p.y + p.dy, hitEnemyIds: new Set(p.hitEnemyIds || [])};
                if (proj.x < 0 || proj.x > prev.gameDimensions.width || proj.y < 0 || proj.y > prev.gameDimensions.height || now - proj.spawnTime > 5000) continue;
                let consumed = false;

                if (proj.source === 'player') {
                     for (const enemy of newEnemies) {
                        if (enemy.hp <= 0) continue;
                        const enemySize = enemy.type === 'boss' ? 50 : 30;
                        if (Math.hypot((enemy.x + enemySize/2) - (proj.x + 4), (enemy.y + enemySize/2) - (proj.y + 4)) < enemySize / 2) {
                            if (proj.spellType === 'explosion') {
                                const owner = newPlayers.find(pl => pl.id === proj.ownerId);
                                const pinguinLevel = owner?.pinguinRicoLevel ?? 0;
                                newAreaEffects.push({
                                    id: `explosion-${now}-${Math.random()}`,
                                    x: enemy.x + enemySize/2, y: enemy.y + enemySize/2,
                                    radius: pinguinLevel > 0 ? 120 : 60,
                                    damagePerSecond: pinguinLevel > 0 ? 14 : 7,
                                    duration: pinguinLevel > 0 ? 2000 : 3000,
                                    startTime: now, lastTickTime: now, ownerId: proj.ownerId!,
                                    type: 'explosion', hitEnemyIdsThisTick: new Set(),
                                });
                                consumed = true; break;
                            }
                            if (proj.spellType === 'arrow' && proj.hitEnemyIds!.has(enemy.id)) continue;

                            damageToEnemies[enemy.id] = {damage: (damageToEnemies[enemy.id]?.damage || 0) + proj.damage};
                            if (proj.spellType === 'ice') damageToEnemies[enemy.id].freeze = 3000;
                            
                            if (proj.spellType === 'arrow') {
                                proj.hitEnemyIds!.add(enemy.id);
                                const owner = newPlayers.find(pl => pl.id === proj.ownerId);
                                if (owner?.piercingArrows && proj.hitEnemyIds!.size >= 15) consumed = true;
                                else if (!owner?.piercingArrows) consumed = true;
                            } else {
                                consumed = true;
                            }
                            if(consumed) break;
                        }
                     }
                } else { // Enemy projectile
                    for(const player of newPlayers) {
                         if (player.isDead) continue;
                         if (player.isMagicShieldActive) {
                            const dist = Math.hypot((proj.x + 4) - (player.x + 15), (proj.y + 4) - (player.y + 15));
                            if (dist < 55) { consumed = true; break; }
                         }
                         if(player.shield.active && !proj.reflected){
                              const shieldAngle = player.shield.angle;
                              if (Math.hypot(player.x + 15 + Math.cos(shieldAngle) * 30 - (proj.x + 4), player.y + 15 + Math.sin(shieldAngle) * 30 - (proj.y + 4)) < 18) {
                                  const speed = Math.hypot(proj.dx, proj.dy);
                                  proj = { ...proj, reflected: true, source: 'player', ownerId: player.id, dx: Math.cos(shieldAngle) * speed * 1.5, dy: Math.sin(shieldAngle) * speed * 1.5 };
                                  continue; // continue loop as reflected projectile
                              }
                         }
                         if (Math.hypot((player.x + 15) - (proj.x + 4), (player.y + 15) - (proj.y + 4)) < 19) {
                            damageToPlayers[player.id] = (damageToPlayers[player.id] || 0) + proj.damage;
                            consumed = true; break;
                        }
                    }
                }
                if(!consumed) finalProjectiles.push(proj);
            }
            
            // Area Effects
            const finalAreaEffects = [];
            for(const effect of newAreaEffects) {
                if(now > effect.startTime + effect.duration) continue;

                if (now > effect.lastTickTime + 1000) {
                    effect.lastTickTime = now;
                    effect.hitEnemyIdsThisTick.clear();
                }

                for(const enemy of newEnemies) {
                    if (enemy.hp <= 0 || effect.hitEnemyIdsThisTick.has(enemy.id)) continue;
                    const dist = Math.hypot(enemy.x + 15 - effect.x, enemy.y + 15 - effect.y);
                    if(dist < effect.radius) {
                        damageToEnemies[enemy.id] = {damage: (damageToEnemies[enemy.id]?.damage || 0) + effect.damagePerSecond * (16/1000)};
                        effect.hitEnemyIdsThisTick.add(enemy.id);
                    }
                }
                finalAreaEffects.push(effect);
            }
            
            newEnemies = newEnemies.map(e => {
                const dmgInfo = damageToEnemies[e.id];
                if(dmgInfo) {
                    e.hp -= dmgInfo.damage;
                    if(dmgInfo.freeze) e.frozenUntil = now + dmgInfo.freeze;
                    e.hitCount = (e.hitCount || 0) + 1;
                }
                const shieldDmg = shieldDamageToEnemies[e.id] || 0;
                if(e.shieldHp !== undefined && shieldDmg > 0) {
                   e.shieldHp -= shieldDmg;
                   e.hitCount = (e.hitCount || 0) + 1;
                }
                return e;
            });
            
            newAllies = newAllies.map(a => a.hp - (damageToAllies[a.id] || 0) > 0 ? { ...a, hp: a.hp - (damageToAllies[a.id] || 0) } : { ...a, hp: 0 }).filter(a => a.hp > 0);

            newPlayers = newPlayers.map(p => {
                if (p.isDead) return p;
                let totalDamage = damageToPlayers[p.id] || 0;
                if (totalDamage <= 0 || now - p.lastDmg < p.dmgCD) return p;
                
                if (p.invulnerable) {} 
                else if (p.shield.shieldHp && p.shield.shieldHp > 0) { p.shield.shieldHp -= 1; p.shieldHitTimestamp = now; } 
                else {
                    if (p.knowledge > 0 && Math.random() * 100 < p.knowledge) { // Negate or reflect
                       const attackerId = prev.enemies.find(e => Math.hypot(e.x - p.x, e.y - p.y) < 100)?.id; // find nearby attacker
                       if(attackerId) {
                          damageToEnemies[attackerId] = {damage: (damageToEnemies[attackerId]?.damage || 0) + totalDamage};
                       }
                    } else {
                        p.lives -= totalDamage * (1 - Math.min(0.9, p.resistance * 0.5));
                    }
                }
                p.lastDmg = now;
                return p;
            });
            
            let pointsGained = 0;
            const maxDoublePoints = newPlayers.filter(p=>!p.isDead).reduce((max, p) => Math.max(max, p.doublePointsLevel), 0);
            const pointMultiplier = [1, 2, 4, 6][maxDoublePoints] || 1;
            
            newEnemies.forEach(e => {
                const oldE = prev.enemies.find(pe => pe.id === e.id);
                if(e.hp <= 0 && (oldE?.hp ?? 0) > 0) {
                    pointsGained += e.pointValue;
                }
            });

            if(pointsGained > 0) {
                const alivePlayerCount = newPlayers.filter(p => !p.isDead).length;
                if(alivePlayerCount > 0) {
                    const pointsPerPlayer = Math.floor(pointsGained * pointMultiplier / alivePlayerCount);
                    newPlayers = newPlayers.map(p => p.isDead ? p : {...p, points: p.points + pointsPerPlayer});
                }
            }
            
            const finalEnemies = newEnemies.filter(e => e.hp > 0);
            resolveCollisions(newPlayers, finalEnemies, newAllies);
            
            newPlayers.forEach(p => {
                p.x = Math.max(0, Math.min(prev.gameDimensions.width - 30, p.x));
                p.y = Math.max(0, Math.min(prev.gameDimensions.height - 30, p.y));
                if (p.lives <= 0) p.isDead = true;
            });

            finalEnemies.forEach(e => {
                const size = e.type === 'boss' ? 50 : 30;
                e.x = Math.max(0, Math.min(prev.gameDimensions.width - size, e.x));
                e.y = Math.max(0, Math.min(prev.gameDimensions.height - size, e.y));
            });
            
            let newWaveState = prev.waveState;
            let newWaveTimer = prev.waveTimer;
            if (finalEnemies.length === 0 && prev.enemies.length > 0 && prev.waveState === 'fighting') {
                newWaveState = 'intermission';
                newWaveTimer = 15;
            }

            return { 
                ...prev, players: newPlayers, enemies: finalEnemies, allies: newAllies,
                projectiles: finalProjectiles, waveState: newWaveState,
                waveTimer: newWaveTimer, spawnedChests: newSpawnedChests,
                areaEffects: finalAreaEffects,
            };
        });
    }, [controls]);

    const handleOpenShop = useCallback(() => {
        const distToShopCenter = Math.hypot(humanPlayer.x + 15 - gameState.shop.x, humanPlayer.y + 15 - gameState.shop.y);
        if (distToShopCenter < gameState.shop.radius) {
            setShowShopModal(true);
        }
    }, [humanPlayer?.x, humanPlayer?.y, gameState.shop]);

    const handleBuyItem = useCallback((item: ShopItem) => {
        setGameState(prev => {
            const playerIndex = prev.players.findIndex(p => p.id === PLAYER_ID);
            if (playerIndex === -1) return prev;
            
            const originalPlayer = prev.players[playerIndex];
            if (originalPlayer.points < item.cost) return prev;

            const newPlayer = {...originalPlayer};
            newPlayer.points -= item.cost;
            let newSpawnedChests = [...prev.spawnedChests];
            let pickupText = "";

            switch(item.id) {
                case 'add_arrows': newPlayer.arrows = Math.min(newPlayer.maxArrows, newPlayer.arrows + 5); pickupText = "+5 Flechas!"; break;
                case 'upgrade_chest': case 'power_chest': {
                    const occupiedSlots = new Set(prev.spawnedChests.map(c => `${c.x},${c.y}`));
                    const availableSlot = CHEST_SPAWN_SLOTS.find(slot => !occupiedSlots.has(`${slot.x},${slot.y}`));
                    const spawnPos = availableSlot || { x: newPlayer.x + (Math.random() - 0.5) * 50, y: newPlayer.y + 40 + (Math.random() - 0.5) * 50 };
                    newSpawnedChests.push({ id: `spawned-chest-${item.id}-${Date.now()}`, x: spawnPos.x, y: spawnPos.y, type: item.id === 'upgrade_chest' ? 'upgrade' : 'power' });
                    break;
                }
                case 'cheap_shield': newPlayer.shield.shieldHp = (newPlayer.shield.shieldHp || 0) + 5; newPlayer.shield.maxShieldHp = (newPlayer.shield.maxShieldHp || 0) + 5; pickupText = "Escudo Barato!"; break;
                case 'bow': newPlayer.hasBow = true; pickupText = "Arco Adquirido!"; break;
                case 'axe': newPlayer.hasAxe = true; pickupText = "Machado Adquirido!"; break;
                case 'shield': newPlayer.shield = { ...newPlayer.shield, available: true }; pickupText = "Habilidade Escudo!"; break;
            }
            if (pickupText) newPlayer.pickupText = { text: pickupText, creationTime: Date.now() };
            
            const newPlayers = [...prev.players];
            newPlayers[playerIndex] = newPlayer;
            return { ...prev, players: newPlayers, spawnedChests: newSpawnedChests };
        });
        setShowShopModal(false);
    }, []);
    
    const applyNormalUpgradeToPlayer = (player: WavePlayerState, upgrade: NormalUpgradeType) => {
        switch(upgrade) {
            case 'damage': player.damageMultiplier += 0.2; break;
            case 'regen': player.regen = Math.min(2, player.regen + 0.25); break;
            case 'speed': player.speed *= 1.1; player.runBoost *= 1.1; break;
            case 'maxHealth': const newMax = Math.min(30, player.maxLives + 1); player.lives = Math.min(newMax, player.lives + (newMax - player.maxLives)); player.maxLives = newMax; break;
            case 'staminaRecharge': player.staminaRechargeRate += 0.5; break;
            case 'manaRecharge': player.manaRechargeRate += 0.5; break;
        }
    };
    
    const applyRedChestUpgradeToPlayer = (player: WavePlayerState, upgrade: RedChestUpgradeType) => {
         switch(upgrade) {
          case 'knowledge': player.knowledge = Math.min(40, player.knowledge + 3); break;
          case 'renegade': player.renegade = Math.min(40, player.renegade + 5); break;
          case 'resistant': player.resistant = true; break;
          case 'magic':
              const newMagic = player.magic + 5;
              if (player.magic === 0) { player.maxMana = 5; player.mana = 5; }
              if (newMagic >= 10 && !player.availableSpells.includes('fire')) { player.availableSpells.push('fire'); if(!player.selectedSpell) player.selectedSpell = 'fire'; player.maxMana += 5; player.mana += 5; }
              if (newMagic >= 15 && player.magic < 15) { player.maxMana += 15; player.mana += 15; }
              if (newMagic >= 20 && !player.availableSpells.includes('ice')) { player.availableSpells.push('ice'); }
              if (newMagic >= 30 && !player.availableSpells.includes('necromancer')) { player.availableSpells.push('necromancer'); }
              if (newMagic >= 35 && !player.availableSpells.includes('blessing')) { player.availableSpells.push('blessing'); }
              if (newMagic >= 40 && !player.availableSpells.includes('explosion')) { player.availableSpells.push('explosion'); }
              if (newMagic >= 45 && !player.availableSpells.includes('magic_shield')) { player.availableSpells.push('magic_shield'); }
              player.magic = newMagic;
              break;
          case 'corredor': player.maxStamina = Math.min(450, player.maxStamina + 50); player.stamina = player.maxStamina; break;
          case 'luck': player.luck = true; break;
          case 'piercingArrows': player.piercingArrows = true; break;
          case 'economy': player.manaCostReduction = Math.min(0.36, player.manaCostReduction + 0.12); break;
          case 'necromancerUpgrade': player.necromancerLevel = Math.min(5, player.necromancerLevel + 1); break;
          case 'doublePoints': player.doublePointsLevel = Math.min(3, player.doublePointsLevel + 1); break;
          case 'pinguinRico': player.pinguinRicoLevel = 1; break;
      }
    }

    const applyUpgrade = useCallback((upgrade: NormalUpgradeType) => {
        setGameState(p => ({...p, players: p.players.map(player => {
            if (player.id !== PLAYER_ID) return player;
            const newPlayer = {...player};
            applyNormalUpgradeToPlayer(newPlayer, upgrade);
            newPlayer.pickupText = { text: 'Atributo!', creationTime: Date.now() };
            return newPlayer;
        })}));
        setShowUpgradeModal(false);
    }, []);

    const applyRedChestUpgrade = useCallback((upgrade: RedChestUpgradeType) => {
        setGameState(p => ({...p, players: p.players.map(player => {
            if (player.id !== PLAYER_ID) return player;
            const newPlayer = {...player, availableSpells: [...player.availableSpells]};
            applyRedChestUpgradeToPlayer(newPlayer, upgrade);
            newPlayer.pickupText = { text: 'Poder!', creationTime: Date.now() };
            return newPlayer;
        })}));
      setShowRedChestModal(false);
    }, []);
    
    const handleAction = (action: 'magic' | 'bow' | 'shield' | 'switchMagic' | 'switchWeapon') => {
        setGameState(p => {
            const playerIndex = p.players.findIndex(pl => pl.id === PLAYER_ID);
            if(playerIndex === -1 || p.players[playerIndex].isDead) return p;
            
            const player = { ...p.players[playerIndex] };
            let newProjectiles = [...p.projectiles];
            let newAllies = [...p.allies];
            let newPlayers = [...p.players];
            const now = Date.now();

            switch(action) {
                case 'switchMagic':
                    if (player.availableSpells.length < 2) return p;
                    const currentIndex = player.availableSpells.indexOf(player.selectedSpell!);
                    const nextIndex = (currentIndex + 1) % player.availableSpells.length;
                    player.selectedSpell = player.availableSpells[nextIndex];
                    break;
                case 'switchWeapon':
                    if(player.hasAxe) player.equippedWeapon = player.equippedWeapon === 'sword' ? 'axe' : 'sword';
                    break;
                case 'shield':
                    if(!player.shield.available || player.shield.active || player.shield.cooldown) return p;
                    player.shield.active = true;
                    player.shield.cooldown = true;
                    player.invulnerable = true;
                    player.shield.activeUntil = now + (player.resistant ? 10000 : 5000);
                    break;
                case 'bow':
                    if (!player.hasBow || player.arrows <= 0 || now - player.lastBowShot < 2000) return p;
                    player.arrows--;
                    player.lastBowShot = now;
                    setAttackEffects(eff => ({...eff, [player.id]: {type: 'bow', angle: player.aimAngle, timestamp: now}}));
                    const arrowDamage = player.piercingArrows ? 9 : 5;
                    newProjectiles.push({ id: `arrow-${now}`, x: player.x + 11, y: player.y + 11, dx: Math.cos(player.aimAngle) * 6, dy: Math.sin(player.aimAngle) * 6, damage: arrowDamage, reflected: false, spawnTime: now, source: 'player', spellType: 'arrow', ownerId: player.id });
                    break;
                case 'magic':
                    if (!player.selectedSpell) return p;
                    if(player.selectedSpell === 'magic_shield') {
                        player.isMagicShieldActive = !player.isMagicShieldActive;
                        break;
                    }
                    if(player.selectedSpell === 'blessing') {
                        const allAllies = [...newPlayers, ...newAllies];
                        allAllies.forEach(ally => {
                            if ('isDead' in ally && !ally.isDead) ally.lives = Math.min(ally.maxLives, ally.lives + 5);
                            else if ('hp' in ally) ally.hp += 5; // Simple HP add for necromancer allies
                        });
                        break;
                    }
                     
                    let cost = 0;
                    if(player.selectedSpell === 'necromancer') cost = player.maxMana;
                    else if (player.selectedSpell === 'explosion') cost = player.maxMana * 0.33;
                    else cost = 3.5;
                    cost *= (1 - player.manaCostReduction);

                     if(player.mana < cost) return p;
                     player.mana -= cost;

                     if(player.selectedSpell === 'necromancer') {
                         const numAllies = 3 + player.necromancerLevel;
                         for (let i = 0; i < numAllies; i++) newAllies.push({ id: `ally-${player.id}-${now}-${i}`, x: player.x, y: player.y, hp: 2 * (2 ** player.necromancerLevel), targetId: null, attackCooldown: 1500, lastAttackTime: 0, ownerId: player.id });
                     } else {
                         const damage = player.selectedSpell === 'fire' ? 5 : 2;
                         newProjectiles.push({ id: `proj-${now}`, x: player.x + 11, y: player.y + 11, dx: Math.cos(player.aimAngle) * 5, dy: Math.sin(player.aimAngle) * 5, damage, reflected: false, spawnTime: now, source: 'player', spellType: player.selectedSpell, ownerId: player.id });
                     }
                    break;
            }
            newPlayers[playerIndex] = player;
            return { ...p, players: newPlayers, projectiles: newProjectiles, allies: newAllies };
        });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showShopModal || showUpgradeModal || showRedChestModal || isGameOver) return;
            const key = e.key.toLowerCase();
            keysPressed.current[key] = true;
            if (key === controls.switchMagic.toLowerCase()) handleAction('switchMagic');
            if (key === controls.switchWeapon.toLowerCase()) handleAction('switchWeapon');
            if (key === controls.shield.toLowerCase()) handleAction('shield');
            if (key === controls.magic.toLowerCase()) handleAction('magic');
            if (key === controls.fireBow.toLowerCase()) handleAction('bow');
        };
        const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key.toLowerCase()] = false; };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (gameLoopId.current) clearInterval(gameLoopId.current);
        };
    }, [controls, showShopModal, showUpgradeModal, showRedChestModal, isGameOver]);

  useEffect(() => {
    if (!isGameOver && !showShopModal && !showUpgradeModal && !showRedChestModal) {
      if (!gameLoopId.current) {
        gameLoopId.current = window.setInterval(gameLogic, 16);
      }
    } else {
      if(gameLoopId.current) {
        window.clearInterval(gameLoopId.current);
        gameLoopId.current = null;
      }
    }
    return () => {
      if (gameLoopId.current) window.clearInterval(gameLoopId.current);
    };
  }, [isGameOver, gameLogic, showShopModal, showUpgradeModal, showRedChestModal]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameContainerRef.current || humanPlayer.isDead) return;
    const rect = gameContainerRef.current.getBoundingClientRect();
    const mouseXInViewport = e.clientX - rect.left;
    const mouseYInViewport = e.clientY - rect.top;

    const playerCenterXInViewport = humanPlayer.x + 15 - cameraPosition.x;
    const playerCenterYInViewport = humanPlayer.y + 15 - cameraPosition.y;
    
    const angle = Math.atan2(mouseYInViewport - playerCenterYInViewport, mouseXInViewport - playerCenterXInViewport);
    setGameState(p => ({ ...p, players: p.players.map(pl => pl.id === humanPlayer.id ? { ...pl, aimAngle: angle, shield: {...pl.shield, angle: angle} } : pl) }));
  };

  useEffect(() => {
    const activeEffects: Record<string, {type: 'sword' | 'axe' | 'bow', angle: number, timestamp: number}> = {};
    const now = Date.now();
    for(const id in attackEffects) {
        const effect = attackEffects[id];
        const weapon = WEAPON_STATS[effect.type === 'bow' ? 'sword' : effect.type];
        if(now - effect.timestamp < weapon.animationDuration) {
            activeEffects[id] = effect;
        }
    }
    if(Object.keys(activeEffects).length !== Object.keys(attackEffects).length) {
       setAttackEffects(activeEffects);
    }
  },[gameState, attackEffects]);

  const renderSpellIcon = () => {
    if (!humanPlayer?.selectedSpell) return null;
    let icon;
    switch(humanPlayer.selectedSpell) {
        case 'fire': icon = '🔥'; break;
        case 'ice': icon = '❄️'; break;
        case 'necromancer': icon = '💀'; break;
        case 'blessing': icon = '💖'; break;
        case 'explosion': icon = '💥'; break;
        case 'magic_shield': icon = humanPlayer.isMagicShieldActive && humanPlayer.mana < 40 ? '🔴' : '🔵'; break;
        default: return null;
    }
    return <span className="text-2xl filter drop-shadow-[0_0_4px_#fff]">{icon}</span>;
  };

  const renderHeartRow = (lives: number) => {
    const fullHearts = Math.floor(Math.max(0, lives));
    const halfHeart = lives - fullHearts >= 0.5;
    let hearts = '❤️'.repeat(fullHearts);
    if (halfHeart && lives > 0) hearts += '💔';
    return <div className="h-6 whitespace-nowrap">{hearts}</div>;
  };
  
  if(!humanPlayer) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800 relative overflow-hidden" style={{width: `${VIEWPORT_DIMENSIONS.width}px`, height: `${VIEWPORT_DIMENSIONS.height}px`, margin: 'auto'}}>
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50">
            <button onClick={onBackToMenu} className="py-1.5 px-4 text-base cursor-pointer bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-md transition-colors">
                Menu Principal
            </button>
        </div>
        <div id="wave-hud" className="absolute top-0 left-0 right-0 z-30 p-4 text-white flex justify-between pointer-events-none" style={{ textShadow: '2px 2px 4px #000' }}>
            <div className="flex gap-4">
                <div>
                    <div className="text-2xl mb-1 flex flex-wrap w-64">{renderHeartRow(humanPlayer.lives)}</div>
                     <div className="mt-1 w-[180px] h-4 bg-[#503d2e] border-2 border-[#362815]">
                        <div className="h-full bg-gradient-to-r from-[#6afc4e] to-[#3ebc1e] transition-all duration-300" style={{ width: `${(humanPlayer.stamina / humanPlayer.maxStamina) * 100}%` }} />
                    </div>
                    {humanPlayer.maxMana > 0 && (
                    <div className="mt-1 w-[180px] h-4 bg-[#2c3e50] border-2 border-[#1a2530]">
                        <div className="h-full bg-gradient-to-r from-[#3498db] to-[#2980b9] transition-all duration-300" style={{ width: humanPlayer.maxMana > 0 ? `${(humanPlayer.mana / humanPlayer.maxMana) * 100}%` : '0%' }} />
                    </div>
                    )}
                </div>
                <div className="flex flex-col gap-2 mt-1">
                    {humanPlayer.hasAxe && <div className="text-2xl filter drop-shadow-[0_0_4px_#fff]">{humanPlayer.equippedWeapon === 'axe' ? '🪓' : '🗡️'}</div>}
                    {humanPlayer.shield.available && <div className="flex items-center gap-2 text-white transition-opacity" style={{ opacity: humanPlayer.shield.cooldown ? 0.6 : 1 }}>
                        <span className="text-2xl filter drop-shadow-[0_0_4px_#fff]">🛡️</span>
                        <span className="text-sm">{humanPlayer.shield.cooldown ? `⏳ ${shieldCooldownTimers[humanPlayer.id] || 0}s` : 'Pronto'}</span>
                    </div>}
                     {humanPlayer.shield.shieldHp !== undefined && humanPlayer.shield.shieldHp > 0 && (
                        <div className="flex items-center gap-2 text-white">
                           <span className="text-xl">🛡️</span>
                           <span className="text-sm font-bold">{humanPlayer.shield.shieldHp}</span>
                        </div>
                    )}
                    {humanPlayer.hasBow && <div className="flex items-center gap-2"><span className="text-2xl filter drop-shadow-[0_0_4px_#fff]">🏹</span><span className="text-lg font-bold">{humanPlayer.arrows}</span></div>}
                    {humanPlayer.selectedSpell && renderSpellIcon()}
                </div>
            </div>
            <div className="text-right">
                <div className="text-3xl font-bold">Onda: {gameState.wave}</div>
                <div className="text-2xl">Pontos: <span className="font-bold text-yellow-300">{humanPlayer.points}</span></div>
                {gameState.waveState === 'intermission' && ( <div className="text-xl text-cyan-300">Próxima onda em: {gameState.waveTimer}s</div> )}
            </div>
        </div>

        <Minimap gameState={gameState} />
        
        <div className="absolute top-1/4 left-2.5 z-40 flex flex-col gap-4">
            {gameState.players.filter(p => p.isBot && !p.isDead).map(bot => (
                <AllyHud key={bot.id} player={bot} customization={customization} />
            ))}
        </div>

        <div ref={gameContainerRef} className={`relative bg-gradient-to-br from-gray-600 to-gray-800 border-4 border-gray-900 cursor-crosshair`} style={{ width: `${VIEWPORT_DIMENSIONS.width}px`, height: `${VIEWPORT_DIMENSIONS.height}px`}} onMouseMove={handleMouseMove} onClick={(e) => { const target = e.target as HTMLElement; if(target.dataset.chest) return; keysPressed.current[controls.attack.toLowerCase()] = true; setTimeout(() => keysPressed.current[controls.attack.toLowerCase()] = false, 50) }}>
          <div className="absolute top-0 left-0" style={{ transform: `translate(${-cameraPosition.x}px, ${-cameraPosition.y}px)` }}>
              <div 
                className="absolute rounded-full bg-yellow-400/20 animate-shop-pulse cursor-pointer" 
                style={{ 
                    left: `${gameState.shop.x - gameState.shop.radius}px`, 
                    top: `${gameState.shop.y - gameState.shop.radius}px`, 
                    width: `${gameState.shop.radius * 2}px`, 
                    height: `${gameState.shop.radius * 2}px`, 
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    handleOpenShop();
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-4xl text-yellow-200 pointer-events-none" style={{textShadow: '0 0 10px black'}}>💰</div>
              </div>

              {gameState.players.map(p => (
                <React.Fragment key={p.id}>
                    <Player playerState={p} customization={customization} showResistanceUp={Date.now() - p.resistanceUpTimestamp < 2000} />
                    {p.shield.active && <Shield shieldState={p.shield} playerState={p} />}
                    {p.isMagicShieldActive && (
                        <div className="absolute rounded-full pointer-events-none transition-colors duration-300" style={{
                            left: p.x + 15 - 55, top: p.y + 15 - 55,
                            width: 110, height: 110,
                            backgroundColor: p.mana < 40 ? 'rgba(255, 0, 0, 0.2)' : 'rgba(52, 152, 219, 0.2)',
                            border: `3px solid ${p.mana < 40 ? 'rgba(255, 100, 100, 0.6)' : 'rgba(100, 180, 255, 0.6)'}`,
                            boxShadow: `0 0 15px ${p.mana < 40 ? 'rgba(255, 100, 100, 0.6)' : 'rgba(100, 180, 255, 0.6)'}`
                        }} />
                    )}
                    {attackEffects[p.id]?.type === 'sword' && <Sword show={true} angle={attackEffects[p.id].angle} playerPosition={p} />}
                    {attackEffects[p.id]?.type === 'axe' && <Axe show={true} angle={attackEffects[p.id].angle} playerPosition={p} />}
                    {attackEffects[p.id]?.type === 'bow' && <Bow show={true} angle={attackEffects[p.id].angle} playerPosition={p} />}
                </React.Fragment>
              ))}
              
              {gameState.enemies.map(enemy => <Enemy key={enemy.id} enemyState={enemy} isInWaveMode={true} />)}
              {gameState.allies.map(ally => <Ally key={ally.id} allyState={ally} />)}
              {gameState.projectiles.map(proj => <Projectile key={proj.id} projectileState={proj} />)}
              {gameState.areaEffects.map(effect => (
                  <div key={effect.id} className="absolute rounded-full pointer-events-none animate-explosion border-2" style={{
                      left: effect.x - effect.radius, top: effect.y - effect.radius,
                      width: effect.radius * 2, height: effect.radius * 2,
                  }} />
              ))}

              {gameState.spawnedChests.map(chest => (
                  <div key={chest.id} data-chest="true" className={`absolute w-8 h-8 cursor-pointer transition-transform hover:scale-110 z-10 flex items-center justify-center text-2xl ${chest.type === 'upgrade' ? 'bg-gradient-to-br from-[#d4af37] to-[#b89125] border-[#6f5a15]' : 'bg-gradient-to-br from-red-600 to-red-900 border-red-950'} border-2`} style={{left: `${chest.x}px`, top: `${chest.y}px`}}
                      onClick={(e) => { 
                          e.stopPropagation();
                          if (chest.type === 'upgrade') setShowUpgradeModal(true);
                          else setShowRedChestModal(true);
                          setGameState(p => ({...p, spawnedChests: p.spawnedChests.filter(c => c.id !== chest.id)}));
                      }}
                  >🎁</div>
              ))}
          </div>
        </div>

      {isGameOver && <WaveModeGameOverScreen wave={finalStats.wave} score={finalStats.score} onRestart={onBackToMenu} />}
      {showShopModal && <ShopModal player={humanPlayer} onBuy={handleBuyItem} onClose={() => setShowShopModal(false)} />}
      {showUpgradeModal && <UpgradeModal onConfirm={applyUpgrade} isWaveMode={true} />}
      {showRedChestModal && <RedChestUpgradeModal onConfirm={applyRedChestUpgrade} onClose={() => setShowRedChestModal(false)} playerState={humanPlayer} />}
    </div>
  );
};

const spawnEnemiesForWave = (wave: number, players: WavePlayerState[], gameDimensions: {width: number, height: number}, now: number): EnemyState[] => {
    const newEnemies: EnemyState[] = [];
    const numPlayers = players.length;
    
    const healthMultiplier = 1 + (wave - 1) * 0.15;
    const damageMultiplier = 1 + (wave - 1) * 0.1;

    const spawnEnemy = (type: EnemyState['type'], baseHp: number, baseDamage: number, pointValue: number) => {
        const randomAngle = Math.random() * Math.PI * 2;
        const randomRadius = (Math.min(gameDimensions.width, gameDimensions.height) / 2) * 0.8 + Math.random() * 200;
        const x = gameDimensions.width/2 + Math.cos(randomAngle) * randomRadius;
        const y = gameDimensions.height/2 + Math.sin(randomAngle) * randomRadius;
        
        let finalHp = baseHp * healthMultiplier * (1 + (numPlayers -1) * 0.5);
        let finalDamage = baseDamage * damageMultiplier;

        const enemy: EnemyState = {
            id: `wave-${wave}-enemy-${Math.random()}`, x, y,
            hp: finalHp,
            maxHp: finalHp,
            damage: finalDamage,
            type, bossType: null, targetId: null, pointValue, hitCount: 0,
        };
        
        const bonusChance = Math.random();
        let bonusTexts: string[] = [];
        if (bonusChance < 0.4 || (bonusChance >= 0.8 && bonusChance < 0.9)) { // Damage bonus
             const bonusValue = 0.05 * (1 + wave * 0.05);
             enemy.damage *= (1 + bonusValue);
             bonusTexts.push(`+Dano ${bonusValue.toFixed(2)}x`);
        }
        if (bonusChance > 0.6 || (bonusChance >= 0.8 && bonusChance < 0.9)) { // Health bonus
            const bonusValue = 5 * (1 + wave * 0.05);
            enemy.hp += bonusValue;
            enemy.maxHp = (enemy.maxHp ?? finalHp) + bonusValue;
            bonusTexts.push(`+${bonusValue.toFixed(0)} Vida`);
        }
        if(bonusTexts.length > 0) {
            enemy.statIncreaseText = { text: bonusTexts.join(', '), creationTime: now };
        }

        if (type.includes('shooter')) enemy.lastShot = 0;
        if (type === 'angel_shield') enemy.shieldHp = 1;
        newEnemies.push(enemy);
    };
    
    if (wave > 0 && wave % 5 === 0) { // Boss wave
        const bossCount = 1 + Math.floor(wave / 10);
        for (let i = 0; i < bossCount; i++) {
            const bossInfo = YUBOKUMIN_DATA[i % YUBOKUMIN_DATA.length];
            const bossHpMultiplier = 1 + (Math.floor((wave-1)/5)) * 1.5;
            let finalHp = bossInfo.maxHp * bossHpMultiplier * (1 + (numPlayers - 1) * 0.75);
            let finalDamage = bossInfo.damage * damageMultiplier;

            const newBoss: EnemyState = {
                id: `wave-boss-${wave}-${i}`,
                x: gameDimensions.width / 2 + (Math.random() - 0.5) * 400,
                y: gameDimensions.height / 2 + (Math.random() - 0.5) * 400,
                hp: finalHp,
                maxHp: finalHp,
                damage: finalDamage,
                type: 'boss',
                bossType: bossInfo.type,
                targetId: null,
                pointValue: 100, // Standard boss point value
                hitCount: 0,
            };
            newEnemies.push(newBoss);
        }
    } else { // Normal wave
        const enemyCount = Math.floor(5 + wave * 1.5 + numPlayers * 2);
        for(let i=0; i<enemyCount; i++){
            const rand = Math.random();
            const stage = Math.max(1, Math.min(3, Math.floor(wave / 7) + 1));
            if (stage === 3 && rand < 0.4) {
                 const angelRand = Math.random();
                 if (angelRand < 0.33) spawnEnemy('angel', 36, 12, 95);
                 else if (angelRand < 0.66) spawnEnemy('angel_shooter', 30, 8, 120);
                 else spawnEnemy('angel_shield', 4, 2, 80);
            }
            else if (stage >= 2 && rand < 0.45) {
                if (Math.random() < 0.5) spawnEnemy('knight', 12, 4, 60);
                else spawnEnemy('knight_shooter', 12, 3.5, 80);
            }
            else {
                if (Math.random() < 0.3) spawnEnemy('shooter', 3, 1, 30);
                else spawnEnemy('normal', 3, 0.5, 20);
            }
        }
    }

    return newEnemies;
};

export default WaveMode;
