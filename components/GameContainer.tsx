

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Controls, Customization, EnemyState, GameState, PlayerState, ProjectileState, AllyState, BossType, RedChestUpgradeType } from '../types';
import { initialPlayerState, BASE_GAME_WIDTH, BASE_GAME_HEIGHT, YUBOKUMIN_DATA } from '../constants';

import Player from './Player';
import Enemy from './Enemy';
import Ally from './Ally';
import Projectile from './Projectile';
import Hud from './Hud';
import PauseMenu from './PauseMenu';
import GameOverScreen from './GameOverScreen';
import DebugMenu from './DebugMenu';
import UpgradeModal, { UpgradeType } from './UpgradeModal';
import RedChestUpgradeModal from './RedChestUpgradeModal';
import Shield from './Shield';
import Sword from './Sword';
import Bow from './Bow';
import Axe from './Axe';

interface GameContainerProps {
  controls: Controls;
  customization: Customization;
  onGameOver: (room: number, kills: number) => void;
  onShowControls: () => void;
  onBackToMenu: () => void;
  isPaused: boolean;
  setPaused: (paused: boolean) => void;
  isGameOver: boolean;
  finalStats: { room: number; kills: number };
  onRestart: () => void;
  onRoomChange: (room: number) => void;
}

const WEAPON_STATS = {
  sword: { range: 100, cooldown: 300, damage: 1, angleTolerance: Math.PI / 4, animationDuration: 220, swingArc: Math.PI / 2 },
  axe: { range: 130, cooldown: 600, damage: 1.8, angleTolerance: Math.PI / 3, animationDuration: 500, swingArc: Math.PI * 1.5 }
};

const GameContainer: React.FC<GameContainerProps> = ({
  controls,
  customization,
  onGameOver,
  onShowControls,
  onBackToMenu,
  isPaused,
  setPaused,
  isGameOver,
  finalStats,
  onRestart,
  onRoomChange
}) => {
  const [gameState, setGameState] = useState<GameState>({
    player: { ...initialPlayerState },
    room: 1,
    kills: 0,
    enemies: [],
    allies: [],
    projectiles: [],
    chest: null,
    blueChestPosition: null,
    bowChestPosition: null,
    redChestPosition: null,
    doorOpen: false,
    lastDmg: 0,
    dmgCD: 800,
    shield: { available: false, active: false, cooldown: false, angle: 0 },
    gameDimensions: { width: BASE_GAME_WIDTH, height: BASE_GAME_HEIGHT },
    bossEncounterCount: { melee: 0, ranged: 0, slowed: 0 },
    resistanceUpTimestamp: 0,
  });
  const [showSwordAttackEffect, setShowSwordAttackEffect] = useState(false);
  const [showAxeAttackEffect, setShowAxeAttackEffect] = useState(false);
  const [showBowAttackEffect, setShowBowAttackEffect] = useState(false);
  const [showDebugMenu, setShowDebugMenu] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showRedChestModal, setShowRedChestModal] = useState(false);
  const [shieldCooldownTimer, setShieldCooldownTimer] = useState(0);

  const keysPressed = useRef<Record<string, boolean>>({});
  const gameLoopId = useRef<number | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const shieldIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    onRoomChange(gameState.room);
  }, [gameState.room, onRoomChange]);

  const spawnEnemiesForRoom = useCallback((room: number, playerState: PlayerState, gameDimensions: {width: number, height: number}): EnemyState[] => {
    const isStage2 = room > 20 && room <= 40;
    const isStage3 = room > 40;
    const newEnemies: EnemyState[] = [];
    
    const createEnemy = (type: EnemyState['type'], x: number, y: number, baseHp: number, baseDamage: number): EnemyState => {
        let hp = baseHp;
        let damage = baseDamage;
        let hpIncrease = 0;
        let damageIncrease = 0;
        
        const isKnightType = type === 'knight' || type === 'knight_shooter';
        const isAngelType = type.includes('angel');
        const scalingStartRoom = isAngelType ? 43 : (isKnightType ? 23 : 8);
        
        if (room >= scalingStartRoom) {
            const steps = room - (scalingStartRoom - 1);
            for (let i = 0; i < steps; i++) {
                const increaseAmount = isAngelType ? (Math.random() < 0.5 ? 1 : 2) : 0.5;
                if (Math.random() < 0.5) {
                    hp += increaseAmount;
                    hpIncrease += increaseAmount;
                } else {
                    damage += increaseAmount;
                    damageIncrease += increaseAmount;
                }
            }
        }
        
        let statIncreaseText: EnemyState['statIncreaseText'] = undefined;
        const texts = [];
        if (hpIncrease > 0) texts.push(`+${hpIncrease.toFixed(1)} Vida`);
        if (damageIncrease > 0) texts.push(`+${damageIncrease.toFixed(1)} Dano`);
        
        if (texts.length > 0) {
            statIncreaseText = { text: texts.join(', '), creationTime: Date.now() };
        }
        
        let pointValue = 0;
        switch(type) {
            case 'normal': pointValue = 10; break;
            case 'shooter': pointValue = 15; break;
            case 'knight': pointValue = 25; break;
            case 'knight_shooter': pointValue = 30; break;
            case 'angel': pointValue = 50; break;
            case 'angel_shooter': pointValue = 60; break;
            case 'angel_shield': pointValue = 75; break;
            default: pointValue = 10;
        }

        const enemy: EnemyState = {
          id: `enemy-${type}-${Date.now()}-${Math.random()}`,
          x, y, hp, damage, type, bossType: null,
          targetId: null,
          statIncreaseText,
          pointValue,
          maxHp: hp,
          hitCount: 0,
        };

        if (type.includes('shooter')) enemy.lastShot = 0;
        if (type === 'angel_shield') enemy.shieldHp = 1;

        return enemy;
    };

    if (room === 13) {
      newEnemies.push(createEnemy('angel_shield', Math.random() * (gameDimensions.width - 30), Math.random() * (gameDimensions.height - 30), 4, 2));
    }

    if (isStage3) {
      const count = Math.floor(Math.random() * 4) + 5;
      for (let i = 0; i < count; i++) {
        const rand = Math.random();
        const x = Math.random() * (gameDimensions.width - 30);
        const y = Math.random() * (gameDimensions.height - 30);
        if (rand < 0.33) {
          newEnemies.push(createEnemy('angel', x, y, 36, 12));
        } else if (rand < 0.66) {
          newEnemies.push(createEnemy('angel_shooter', x, y, 30, 8));
        } else {
          newEnemies.push(createEnemy('angel_shield', x, y, 4, 2));
        }
      }
    } else if (isStage2) {
      const totalEnemiesToSpawn = playerState.luck ? 25 + Math.floor(Math.random() * 11) : 10 + Math.floor(Math.random() * 6);
      let knightShootersCount = 0;
      let knightsCount = 0;
      const maxKnights = playerState.luck ? 35 : 20;

      for (let i = 0; i < totalEnemiesToSpawn; i++) {
        const isShooter = Math.random() < 0.4;
        if (isShooter) {
          knightShootersCount++;
        } else if (knightsCount < maxKnights) {
          knightsCount++;
        } else {
          knightShootersCount++;
        }
      }
      
      for (let i = 0; i < knightsCount; i++) {
        newEnemies.push(createEnemy('knight', Math.random() * (gameDimensions.width - 30), Math.random() * (gameDimensions.height - 30), 12, 4));
      }
      for (let i = 0; i < knightShootersCount; i++) {
        newEnemies.push(createEnemy('knight_shooter', Math.random() * (gameDimensions.width - 30), Math.random() * (gameDimensions.height - 30), 12, 3.5));
      }
    } else { // Stage 1
      const count = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < count; i++) {
        const isShooter = Math.random() < 0.2;
        if(isShooter) {
            newEnemies.push(createEnemy('shooter', Math.random() * (gameDimensions.width - 30), Math.random() * (gameDimensions.height - 30), 3, 1));
        } else {
            newEnemies.push(createEnemy('normal', Math.random() * (gameDimensions.width - 30), Math.random() * (gameDimensions.height - 30), 3, 0.5));
        }
      }
    }
    return newEnemies;
  }, []);

  const spawnBossForRoom = (room: number, encounterCount: number, gameDimensions: {width: number, height: number}, bossType: BossType): EnemyState => {
    const isStage2 = room > 20 && room <= 40;
    const bossInfo = YUBOKUMIN_DATA.find(b => b.type === bossType) || YUBOKUMIN_DATA[0];

    const hpMultiplier = Math.pow(1.8, encounterCount); // Reduced scaling factor
    const finalHp = (isStage2 ? bossInfo.maxHp * 2 : bossInfo.maxHp) * hpMultiplier;
    
    const newBoss: EnemyState = {
        id: `boss-${bossType}-${Date.now()}`,
        x: gameDimensions.width / 2 - 25, y: gameDimensions.height / 2 - 25,
        hp: finalHp,
        maxHp: finalHp,
        damage: bossInfo.damage,
        type: 'boss',
        bossType: bossInfo.type,
        shieldHits: 0,
        targetId: null,
        pointValue: bossInfo.pointValue,
        hitCount: 0,
    };
    return newBoss;
  };

  const nextRoom = useCallback(() => {
    setGameState(prev => {
      const newRoom = prev.room + 1;
      if (newRoom > 60) {
        alert('🏆 Vitória!');
        onBackToMenu();
        return prev;
      }
      
      let newPlayerState = { ...prev.player };
      let newResistanceUpTimestamp = prev.resistanceUpTimestamp;
      if (newRoom % 3 === 0) {
        newPlayerState.resistance += 1;
        newResistanceUpTimestamp = Date.now();
      }

      const isStage2 = newRoom > 20 && newRoom <= 40;
      const isStage3 = newRoom > 40;

      const newGameDimensions = {
        width: isStage3 ? BASE_GAME_WIDTH * 1.4 * 1.6 : (isStage2 ? BASE_GAME_WIDTH * 1.4 : BASE_GAME_WIDTH),
        height: isStage3 ? BASE_GAME_HEIGHT * 1.4 * 1.6 : (isStage2 ? BASE_GAME_HEIGHT * 1.4 : BASE_GAME_HEIGHT),
      };

      let nextState: Partial<GameState> = {};
      let newBossEncounterCount = { ...prev.bossEncounterCount };

      if (newRoom % 5 === 0) {
        const newBosses: EnemyState[] = [];
        let bossCount = 0;
        if (isStage3) {
            bossCount = Math.floor(Math.random() * 3) + 1; // 1-3 bosses
        } else if (isStage2) {
            bossCount = Math.floor(Math.random() * 2) + 1; // 1-2 bosses
        } else { // Stage 1
            bossCount = 1;
        }
        
        const availableBossTypes: BossType[] = ['melee', 'ranged', 'slowed'];

        for (let i = 0; i < bossCount; i++) {
            const randomBossType = availableBossTypes[Math.floor(Math.random() * availableBossTypes.length)];
            const encounterCount = prev.bossEncounterCount[randomBossType as keyof typeof prev.bossEncounterCount];
            const newBoss = spawnBossForRoom(newRoom, encounterCount, newGameDimensions, randomBossType);
            
            newBoss.x = (newGameDimensions.width / (bossCount + 1)) * (i + 1) - 25;
            newBoss.y = Math.random() * (newGameDimensions.height - 100) + 50;
            
            newBosses.push(newBoss);
            newBossEncounterCount = { ...newBossEncounterCount, [randomBossType as keyof typeof newBossEncounterCount]: encounterCount + 1 };
        }
        nextState = { enemies: newBosses };
      } else {
        const newEnemies = spawnEnemiesForRoom(newRoom, newPlayerState, newGameDimensions);
        nextState = { enemies: newEnemies };
      }

      return {
        ...prev,
        ...nextState,
        room: newRoom,
        player: { ...newPlayerState, x: newGameDimensions.width / 2 - 15, y: 30 },
        chest: null,
        blueChestPosition: null,
        bowChestPosition: null,
        redChestPosition: null,
        projectiles: [],
        allies: [],
        doorOpen: false,
        gameDimensions: newGameDimensions,
        bossEncounterCount: newBossEncounterCount,
        resistanceUpTimestamp: newResistanceUpTimestamp,
      };
    });
  }, [onBackToMenu, spawnEnemiesForRoom]);
  
  useEffect(() => {
    setGameState(prev => ({ ...prev, enemies: spawnEnemiesForRoom(1, prev.player, prev.gameDimensions), projectiles: [] }));
  }, [spawnEnemiesForRoom]);


  const gameLogic = useCallback(() => {
    setGameState(prev => {
      if (prev.player.lives <= 0) {
        if (!isGameOver) onGameOver(prev.room, prev.kills);
        return prev;
      }
      
      const now = Date.now();
      let newPlayer: PlayerState = { ...prev.player };
      let newKills = prev.kills;
      let newLastDmg = prev.lastDmg;
      const enemiesKilledThisFrame = new Set<string>();
      
      let currentEnemies = [...prev.enemies];
      let currentAllies = [...prev.allies];
      const newlySpawnedProjectiles: ProjectileState[] = [];
      const damageToEnemies: Record<string, {damage: number, freeze?: number}> = {};
      const shieldDamageToEnemies: Record<string, number> = {};
      const damageToAllies: Record<string, number> = {};
      const { width: gameWidth, height: gameHeight } = prev.gameDimensions;

      // Player Movement & State
      const isRunning = keysPressed.current[controls.run.toLowerCase()] && newPlayer.stamina > 0;
      newPlayer.boosting = isRunning;
      if(isRunning) {
        newPlayer.stamina = Math.max(0, newPlayer.stamina - 1.5);
        newPlayer.lastRunTime = Date.now();
      }
      const speed = newPlayer.boosting ? newPlayer.runBoost : newPlayer.speed;
      let dx = 0, dy = 0;
      if (keysPressed.current[controls.up.toLowerCase()]) dy -= 1;
      if (keysPressed.current[controls.down.toLowerCase()]) dy += 1;
      if (keysPressed.current[controls.left.toLowerCase()]) dx -= 1;
      if (keysPressed.current[controls.right.toLowerCase()]) dx += 1;

      if (dx !== 0 || dy !== 0) {
          const len = Math.hypot(dx, dy);
          newPlayer.x += (dx / len) * speed;
          newPlayer.y += (dy / len) * speed;
      }
      newPlayer.x = Math.max(0, Math.min(gameWidth - 30, newPlayer.x));
      newPlayer.y = Math.max(0, Math.min(gameHeight - 30, newPlayer.y));
      
      if (!newPlayer.boosting && Date.now() - newPlayer.lastRunTime > 4000) newPlayer.stamina = Math.min(newPlayer.maxStamina, newPlayer.stamina + 0.5);
      if (newPlayer.regen > 0 && newPlayer.lives < newPlayer.maxLives) newPlayer.lives = Math.min(newPlayer.maxLives, newPlayer.lives + newPlayer.regen * (16/1000));
      if (now < newPlayer.blessingRegenEndTime && newPlayer.lives < newPlayer.maxLives) {
          newPlayer.lives = Math.min(newPlayer.maxLives, newPlayer.lives + 3.5 * (16/1000));
      }
      if (newPlayer.maxMana > 0) newPlayer.mana = Math.min(newPlayer.maxMana, newPlayer.mana + 0.01);
      
      const playerCenterX = newPlayer.x + 15;
      const playerCenterY = newPlayer.y + 15;

       // --- DYNAMIC ATTACK LOGIC ---
      if (newPlayer.attackState) {
          const { type, startTime, startAngle, hitEnemies } = newPlayer.attackState;
          const weaponStats = WEAPON_STATS[type];
          const progress = (now - startTime) / weaponStats.animationDuration;

          if (progress > 1) {
              newPlayer.attackState = undefined;
          } else {
              // Sword swings from -45 to +45 deg relative to startAngle
              // Axe swings from -150 to +150
              const swingStartOffset = type === 'sword' ? -Math.PI / 4 : -Math.PI * (5/6);
              const currentAngle = startAngle + swingStartOffset + (progress * weaponStats.swingArc);

              currentEnemies.forEach(enemy => {
                  if (enemy.hp <= 0 || hitEnemies.has(enemy.id)) return;
                  
                  const enemySize = enemy.type === 'boss' ? 50 : 30;
                  const ex = enemy.x + enemySize / 2;
                  const ey = enemy.y + enemySize / 2;
                  const distToPlayer = Math.hypot(ex - playerCenterX, ey - playerCenterY);
                  
                  if (distToPlayer < weaponStats.range + enemySize / 2) {
                      const angleToEnemy = Math.atan2(ey - playerCenterY, ex - playerCenterX);
                      let angleDiff = Math.abs(currentAngle - angleToEnemy);
                      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
                      
                      if (angleDiff < weaponStats.angleTolerance) {
                           if (enemy.type === 'angel_shield' && (enemy.shieldHp ?? 0) > 0) {
                                shieldDamageToEnemies[enemy.id] = (shieldDamageToEnemies[enemy.id] || 0) + 1;
                           } else {
                                const damageDealt = weaponStats.damage * newPlayer.damageMultiplier;
                                damageToEnemies[enemy.id] = {damage: (damageToEnemies[enemy.id]?.damage || 0) + damageDealt};
                           }
                           hitEnemies.add(enemy.id);
                      }
                  }
              });
          }
      }

      // Ally AI
      currentAllies = currentAllies.map(ally => {
        let updatedAlly = { ...ally };
        const allySpeed = 1.5 * (newPlayer.speed / initialPlayerState.speed);
        if (updatedAlly.attackState?.isAttacking && now - updatedAlly.attackState.timestamp > 300) {
            updatedAlly.attackState = { ...updatedAlly.attackState, isAttacking: false };
        }
        
        let nearestEnemy: EnemyState | null = null;
        let minDistance = 120; // Attack radius
        currentEnemies.forEach(enemy => {
            if (enemy.hp <= 0) return;
            const dist = Math.hypot((enemy.x + 15) - (updatedAlly.x + 10), (enemy.y + 15) - (updatedAlly.y + 10));
            if (dist < minDistance) {
                minDistance = dist;
                nearestEnemy = enemy;
            }
        });
        
        if (nearestEnemy) {
            updatedAlly.targetId = nearestEnemy.id;
            const targetX = nearestEnemy.x + (nearestEnemy.type === 'boss' ? 25 : 15);
            const targetY = nearestEnemy.y + (nearestEnemy.type === 'boss' ? 25 : 15);
            
            if (minDistance > 25) { // If not in attack range, move towards
                const angle = Math.atan2(targetY - (updatedAlly.y + 10), targetX - (updatedAlly.x + 10));
                updatedAlly.x += Math.cos(angle) * allySpeed;
                updatedAlly.y += Math.sin(angle) * allySpeed;
            } else if (now - updatedAlly.lastAttackTime > updatedAlly.attackCooldown) { // Attack
                updatedAlly.lastAttackTime = now;
                updatedAlly.attackState = { isAttacking: true, timestamp: now };
                const allyDamage = 2 * (2 ** newPlayer.necromancerLevel);
                damageToEnemies[nearestEnemy.id] = {damage: (damageToEnemies[nearestEnemy.id]?.damage || 0) + allyDamage};
            }
        } else {
            updatedAlly.targetId = null;
            // Follow player if no enemies
             const distToPlayer = Math.hypot(playerCenterX - (updatedAlly.x + 10), playerCenterY - (updatedAlly.y + 10));
             if (distToPlayer > 60) { // Keep a distance
                 const angle = Math.atan2(playerCenterY - (updatedAlly.y + 10), playerCenterX - (updatedAlly.x + 10));
                 updatedAlly.x += Math.cos(angle) * allySpeed;
                 updatedAlly.y += Math.sin(angle) * allySpeed;
             }
        }
        return updatedAlly;
      });

      // Enemy AI
      currentEnemies = currentEnemies.map(enemy => {
          let updatedEnemy = {...enemy};
          if(updatedEnemy.frozenUntil && now < updatedEnemy.frozenUntil) {
              return updatedEnemy; // Skip AI if frozen
          }

          if (updatedEnemy.statIncreaseText && now - updatedEnemy.statIncreaseText.creationTime > 2000) {
              delete updatedEnemy.statIncreaseText;
          }
          if (updatedEnemy.attackState?.isAttacking && now - updatedEnemy.attackState.timestamp > 300) {
            updatedEnemy.attackState = { ...updatedEnemy.attackState, isAttacking: false };
          }
          const enemySize = updatedEnemy.type === 'boss' ? 50 : 30;
          const enemyCenterX = updatedEnemy.x + enemySize / 2;
          const enemyCenterY = updatedEnemy.y + enemySize / 2;
          
          let currentTarget: { x: number, y: number, id: string } | null = null;
          if (updatedEnemy.targetId) {
            if (updatedEnemy.targetId === 'player') currentTarget = { x: playerCenterX, y: playerCenterY, id: 'player' };
            else {
              const targetAlly = currentAllies.find(a => a.id === updatedEnemy.targetId);
              if (targetAlly?.hp > 0) currentTarget = { x: targetAlly.x + 10, y: targetAlly.y + 10, id: targetAlly.id };
              else updatedEnemy.targetId = null;
            }
          }
          if (!currentTarget) {
            let closestTarget: { x: number; y: number; id: string; dist: number; } = { x: playerCenterX, y: playerCenterY, id: 'player', dist: Math.hypot(playerCenterX - enemyCenterX, playerCenterY - enemyCenterY) };
            currentAllies.forEach(ally => {
              const dist = Math.hypot((ally.x + 10) - enemyCenterX, (ally.y + 10) - enemyCenterY);
              if (dist < closestTarget.dist) closestTarget = { x: ally.x + 10, y: ally.y + 10, id: ally.id, dist: dist };
            });
            updatedEnemy.targetId = closestTarget.id;
            currentTarget = { x: closestTarget.x, y: closestTarget.y, id: closestTarget.id };
          }

          if (currentTarget) {
              const edx = currentTarget.x - enemyCenterX;
              const edy = currentTarget.y - enemyCenterY;
              const angleToTarget = Math.atan2(edy, edx);
              updatedEnemy.angleToTarget = angleToTarget;
              
              const distToTarget = Math.hypot(edx, edy);
              const isShooterType = updatedEnemy.type.includes('shooter') || (updatedEnemy.type === 'boss' && updatedEnemy.bossType === 'ranged');
              
              let enemySpeed = 1;
              if (updatedEnemy.type === 'boss') {
                  const bossInfo = YUBOKUMIN_DATA.find(b => b.type === updatedEnemy.bossType);
                  if(bossInfo) enemySpeed = bossInfo.speed;
              } else if (updatedEnemy.type.includes('angel')) {
                  enemySpeed = isShooterType ? newPlayer.speed * 0.4 : newPlayer.speed * 0.7;
              } else enemySpeed = isShooterType ? newPlayer.speed * 0.3 : newPlayer.speed * 0.6;
              
              if (distToTarget > 0) {
                  if (isShooterType) {
                      const idealDistance = (updatedEnemy.type === 'boss' && updatedEnemy.bossType === 'ranged') ? YUBOKUMIN_DATA.find(b => b.type === 'ranged')?.preferredDistance || 160 : 150;
                      if (distToTarget > idealDistance) {
                          updatedEnemy.x += (edx / distToTarget) * enemySpeed;
                          updatedEnemy.y += (edy / distToTarget) * enemySpeed;
                      } else if (distToTarget < idealDistance - 50) {
                          updatedEnemy.x -= (edx / distToTarget) * enemySpeed * 0.8;
                          updatedEnemy.y -= (edy / distToTarget) * enemySpeed * 0.8;
                      }
                  } else {
                      const attackRange = enemySize / 2 + (currentTarget.id === 'player' ? 15 : 10) + (updatedEnemy.type === 'angel_shield' && (updatedEnemy.shieldHp ?? 0) > 0 ? 20 : 0);
                      if (distToTarget > attackRange) {
                          updatedEnemy.x += (edx / distToTarget) * enemySpeed;
                          updatedEnemy.y += (edy / distToTarget) * enemySpeed;
                      }
                  }
              }
              if (isShooterType && now - (updatedEnemy.lastShot || 0) > 2000) {
                  updatedEnemy.lastShot = now;
                  let projectileSpeed = 2;
                  let damage = updatedEnemy.damage;
                  if (updatedEnemy.type === 'boss') {
                    if (prev.room >= 25 && prev.room <= 40) damage *= 1.5;
                    projectileSpeed = 3;
                  }
                  newlySpawnedProjectiles.push({ id: `proj-${now}-${Math.random()}`, x: enemyCenterX - 4, y: enemyCenterY - 4, dx: Math.cos(angleToTarget) * projectileSpeed, dy: Math.sin(angleToTarget) * projectileSpeed, damage, reflected: false, spawnTime: now, source: 'enemy', spellType: null, ownerId: updatedEnemy.id });
              }
          }
          updatedEnemy.x = Math.max(0, Math.min(gameWidth - enemySize, updatedEnemy.x));
          updatedEnemy.y = Math.max(0, Math.min(gameHeight - enemySize, updatedEnemy.y));
          return updatedEnemy;
      });

      // Projectile Logic
      const pushToEnemies: Record<string, { x: number; y: number }> = {};
      const projectilesThatHitPlayer: ProjectileState[] = [];
      const finalProjectiles: ProjectileState[] = [];

      for (let p of prev.projectiles) {
          let proj = { ...p, x: p.x + p.dx, y: p.y + p.dy };

          if (proj.x < -10 || proj.x > gameWidth + 10 || proj.y < -10 || proj.y > gameHeight + 10 || now - proj.spawnTime > 5000) continue;
          
          if (prev.shield.active && !proj.reflected && proj.source === 'enemy') {
              const shieldAngle = prev.shield.angle;
              const shieldX = playerCenterX + Math.cos(shieldAngle) * 30;
              const shieldY = playerCenterY + Math.sin(shieldAngle) * 30;
              if (Math.hypot(shieldX - (proj.x + 4), shieldY - (proj.y + 4)) < 18) {
                  const speed = Math.hypot(proj.dx, proj.dy);
                  proj = { ...proj, reflected: true, dx: Math.cos(shieldAngle) * speed * 1.5, dy: Math.sin(shieldAngle) * speed * 1.5 };
              }
          }

          let projectileConsumed = false;

          if (proj.source === 'player' || proj.reflected) {
              for (const enemy of currentEnemies) {
                  if (enemy.hp <= 0) continue;
                  const enemySize = enemy.type === 'boss' ? 50 : 30;
                  const distToEnemy = Math.hypot((enemy.x + enemySize/2) - (proj.x + 4), (enemy.y + enemySize/2) - (proj.y + 4));

                  if (distToEnemy < enemySize / 2) {
                      if (enemy.type === 'angel_shield' && (enemy.shieldHp ?? 0) > 0) {
                          if (proj.spellType === 'arrow' && newPlayer.piercingArrows) {
                              damageToEnemies[enemy.id] = {damage:(damageToEnemies[enemy.id]?.damage || 0) + 3};
                              shieldDamageToEnemies[enemy.id] = 1;
                              // piercing arrow continues
                          } else {
                              if (proj.spellType !== 'arrow') { // Fire, Ice, etc. break shield
                                  shieldDamageToEnemies[enemy.id] = 1;
                              }
                              projectileConsumed = true; // Arrow bounces off, spells are consumed
                          }
                      } else {
                          if (proj.spellType === 'arrow' && newPlayer.piercingArrows) {
                              if (proj.hitEnemyIds?.has(enemy.id)) continue;
                              const newHitIds = new Set(proj.hitEnemyIds || []);
                              newHitIds.add(enemy.id);
                              proj = { ...proj, hitEnemyIds: newHitIds };
                              if (newHitIds.size >= 7) projectileConsumed = true;
                          } else projectileConsumed = true;
                          
                          const damageDealt = proj.reflected ? newPlayer.damageMultiplier : proj.damage;
                          damageToEnemies[enemy.id] = {damage: (damageToEnemies[enemy.id]?.damage || 0) + damageDealt};
                          if(proj.spellType === 'ice') {
                              damageToEnemies[enemy.id].freeze = 3000;
                          }

                          if (proj.spellType === 'arrow' && !proj.reflected) {
                              const speed = Math.hypot(proj.dx, proj.dy);
                              if (speed > 0) pushToEnemies[enemy.id] = { x: (proj.dx / speed) * 160, y: (proj.dy / speed) * 160 };
                          }
                      }
                      if (projectileConsumed) break;
                  }
              }
          } else { // Enemy projectile
              for (const ally of currentAllies) {
                  if (ally.hp <= 0) continue;
                  if (Math.hypot((ally.x + 10) - (proj.x + 4), (ally.y + 10) - (proj.y + 4)) < 14) {
                      damageToAllies[ally.id] = (damageToAllies[ally.id] || 0) + proj.damage;
                      projectileConsumed = true; break;
                  }
              }
              if (!projectileConsumed && !newPlayer.invulnerable && Math.hypot(playerCenterX - (proj.x + 4), playerCenterY - (proj.y + 4)) < 19) {
                  projectilesThatHitPlayer.push(proj);
                  projectileConsumed = true;
              }
          }
          if (!projectileConsumed) finalProjectiles.push(proj);
      }
      
      // Apply projectile damage and effects
      currentEnemies = currentEnemies.map(e => {
          const effects = damageToEnemies[e.id];
          const shieldDmg = shieldDamageToEnemies[e.id] || 0;
          const push = pushToEnemies[e.id];
          if (!effects && shieldDmg === 0 && !push) return e;
          
          let { hp, shieldHp, x, y, frozenUntil, hitCount } = e;
          if (effects) {
              hp -= effects.damage;
              if (effects.freeze) frozenUntil = now + effects.freeze;
              hitCount = (hitCount || 0) + 1;
          }
          if (shieldHp !== undefined && shieldDmg > 0) shieldHp -= shieldDmg;
          if (push) { x += push.x; y += push.y; }

          if (hp <= 0 && e.hp > 0) enemiesKilledThisFrame.add(e.id);
          return { ...e, hp, shieldHp, x, y, frozenUntil, hitCount };
      });

      // Contact/Melee damage
      let playerDamageThisFrame = 0;
      projectilesThatHitPlayer.forEach(p => playerDamageThisFrame += p.damage);
      const enemyAttackUpdates: Record<string, { attackState: EnemyState['attackState'] }> = {};

      if (now - prev.lastDmg > prev.dmgCD) {
        currentEnemies.forEach(enemy => {
          if (enemy.frozenUntil && now < enemy.frozenUntil) return;
          const isMelee = !enemy.type.includes('shooter') && (!enemy.type.includes('boss') || (enemy.bossType === 'melee' || enemy.bossType === 'slowed'));
          if (!isMelee || !enemy.targetId || enemy.hp <= 0) return;
          if (enemy.type === 'angel_shield' && (enemy.shieldHp ?? 0) > 0) {
            // Player pushback for shield angel
            if (!newPlayer.invulnerable) {
              const dist = Math.hypot(playerCenterX - (enemy.x + 15), playerCenterY - (enemy.y + 15));
              if (dist < 45) { // 15 player radius + 30 enemy radius/push range
                  const pushAngle = Math.atan2(playerCenterY - (enemy.y+15), playerCenterX - (enemy.x+15));
                  const pushback = 50 / 16; // apply over a few frames
                  newPlayer.x += Math.cos(pushAngle) * pushback;
                  newPlayer.y += Math.sin(pushAngle) * pushback;
              }
            }
            return;
          }

          const enemySize = enemy.type === 'boss' ? 50 : 30;
          
          let wasInRange = false;
          let angleToTarget = 0;

          if (enemy.targetId === 'player' && !newPlayer.invulnerable) {
              const dist = Math.hypot(playerCenterX - (enemy.x + enemySize/2), playerCenterY - (enemy.y + enemySize/2));
              if (dist < (15 + enemySize / 2) * 1.35) {
                  playerDamageThisFrame += enemy.damage;
                  wasInRange = true;
                  angleToTarget = Math.atan2(playerCenterY - (enemy.y + enemySize/2), playerCenterX - (enemy.x + enemySize/2));
              }
          } else {
              const targetAlly = currentAllies.find(a => a.id === enemy.targetId);
              if (targetAlly) {
                  const dist = Math.hypot((targetAlly.x + 10) - (enemy.x + enemySize/2), (targetAlly.y + 10) - (enemy.y + enemySize/2));
                  if (dist < (10 + enemySize / 2) * 1.35 && now - (enemy.attackState?.timestamp || 0) > 1000) {
                      damageToAllies[targetAlly.id] = (damageToAllies[targetAlly.id] || 0) + enemy.damage;
                      wasInRange = true;
                      angleToTarget = Math.atan2((targetAlly.y + 10) - (enemy.y + enemySize/2), (targetAlly.x + 10) - (enemy.x + enemySize/2));
                  }
              }
          }
          if (wasInRange && enemy.type !== 'boss') {
              enemyAttackUpdates[enemy.id] = { attackState: { isAttacking: true, angle: angleToTarget, timestamp: now } };
          }
        });
        
        if (playerDamageThisFrame > 0) {
            if (Math.random() * 100 < newPlayer.knowledge) { /* no-op */ } 
            else if (Math.random() * 100 < newPlayer.renegade) {
                 Object.keys(damageToEnemies).forEach(enemyId => {
                    damageToEnemies[enemyId].damage = (damageToEnemies[enemyId]?.damage || 0) + playerDamageThisFrame;
                });
            } else {
                const damageReduction = 1 - Math.min(0.9, newPlayer.resistance * 0.05);
                newPlayer.lives -= playerDamageThisFrame * damageReduction;
            }
            newLastDmg = now;
        }
      }

      currentEnemies = currentEnemies.map(e => ({ ...e, ...(enemyAttackUpdates[e.id] && { attackState: enemyAttackUpdates[e.id].attackState }) }));

      // Apply ally damage and filter dead allies
      currentAllies = currentAllies.map(a => {
        const damage = damageToAllies[a.id] || 0;
        if (damage > 0) return { ...a, hp: a.hp - damage };
        return a;
      }).filter(a => a.hp > 0);
      
      // Filter dead enemies and update stats
      const finalEnemies = currentEnemies.filter(e => e.hp > 0);
      newKills += enemiesKilledThisFrame.size;

      let bossesKilledCount = 0;
      enemiesKilledThisFrame.forEach(killedId => {
          const killedEnemy = prev.enemies.find(e => e.id === killedId);
          if (killedEnemy?.type === 'boss') {
              bossesKilledCount++;
          }
          const arrowDropChance = newPlayer.luck ? 0.65 : 0.25;
          if (newPlayer.hasBow && newPlayer.arrows < newPlayer.maxArrows && Math.random() < arrowDropChance) newPlayer.arrows++;
      });
      
      if (bossesKilledCount > 0) {
          const damageBonus = 0.12 * bossesKilledCount;
          newPlayer.damageMultiplier += damageBonus;
          newPlayer.damageUpTimestamp = Date.now();
          newPlayer.damageUpValue = damageBonus;
      }
      
      let chest = prev.chest;
      let blueChestPosition = prev.blueChestPosition;
      let bowChestPosition = prev.bowChestPosition;
      let redChestPosition = prev.redChestPosition;

      if (finalEnemies.length === 0 && prev.enemies.length > 0) {
          if (prev.room === 20 && !newPlayer.hasAxe) {
              newPlayer.hasAxe = true;
          }

          const wasBossRoom = prev.enemies.some(e => e.type === 'boss');
          if (wasBossRoom) {
              chest = 'normal';
              if (!prev.shield.available) blueChestPosition = { x: 10, y: gameHeight - 50 };
          } else {
              chest = 'normal';
          }
          if (prev.room === 15 && !newPlayer.hasBow) bowChestPosition = { x: gameWidth - 42, y: gameHeight / 2 - 14 };
          if (prev.room % 2 === 0 && prev.room > 0) redChestPosition = {x: 20, y: gameHeight / 2 - 14 };
      }
      let doorShouldBeOpen = finalEnemies.length === 0 && !chest && !blueChestPosition && !bowChestPosition && !redChestPosition;

      return { ...prev, player: newPlayer, enemies: finalEnemies, allies: currentAllies, projectiles: [...finalProjectiles, ...newlySpawnedProjectiles], kills: newKills, doorOpen: doorShouldBeOpen, chest, blueChestPosition, bowChestPosition, redChestPosition, lastDmg: newLastDmg };
    });
  }, [controls, onGameOver, isGameOver]);

  const handleAttack = useCallback(() => {
    setGameState(prev => {
        const now = Date.now();
        if (prev.player.attackState) return prev;

        const weapon = prev.player.equippedWeapon;
        const weaponStats = WEAPON_STATS[weapon];
        
        if (weapon === 'sword') {
            setShowSwordAttackEffect(true);
            setTimeout(() => setShowSwordAttackEffect(false), weaponStats.animationDuration);
        } else if (weapon === 'axe') {
            setShowAxeAttackEffect(true);
            setTimeout(() => setShowAxeAttackEffect(false), weaponStats.animationDuration);
        }

        const newPlayerState = { 
            ...prev.player,
            attackState: {
                type: weapon,
                startTime: now,
                startAngle: prev.player.aimAngle,
                hitEnemies: new Set<string>()
            }
        };

        return { ...prev, player: newPlayerState };
    });
  }, []);
  
  const handleMagicCast = useCallback(() => {
    setGameState(p => {
        if (!p.player.selectedSpell) return p;
        const spell = p.player.selectedSpell;

        if (spell === 'blessing') {
            const blessingCooldown = 45000; // 45 seconds
            const now = Date.now();
            if (now - p.player.lastBlessingTime < blessingCooldown) return p;
            if (p.player.stamina < p.player.maxStamina) return p;

            let newPlayerState = { ...p.player, stamina: 0, lastBlessingTime: now };
            
            if (p.player.blessingState === 'inactive') {
                const healthToAdd = 30 - p.player.maxLives;
                newPlayerState.maxLives = 30;
                if (healthToAdd > 0) {
                    newPlayerState.lives += healthToAdd;
                }
                newPlayerState.blessingState = 'maxHealthSet';
            } else { // 'maxHealthSet'
                newPlayerState.blessingRegenEndTime = now + 5000; // 5 seconds of regen
            }
            
            return { ...p, player: newPlayerState };
        }

        const manaCost = (spell === 'necromancer' ? p.player.maxMana : 3.5) * (1 - p.player.manaCostReduction);
        if (p.player.mana < manaCost) return p;

        if (spell === 'necromancer') {
            if (p.allies.length > 0) return p; // Only one set of allies at a time.
            const numAllies = 3 + p.player.necromancerLevel;
            const allyHp = 2 * (2 ** p.player.necromancerLevel);
            
            const newAllies: AllyState[] = [];
            for (let i = 0; i < numAllies; i++) {
                newAllies.push({
                    id: `ally-${Date.now()}-${i}`,
                    x: p.player.x + (Math.random() - 0.5) * 60,
                    y: p.player.y + (Math.random() - 0.5) * 60,
                    hp: allyHp,
                    targetId: null,
                    attackCooldown: 1500, // ms
                    lastAttackTime: 0,
                    ownerId: 'player',
                });
            }
            return {
                ...p,
                player: {...p.player, mana: p.player.mana - manaCost },
                allies: newAllies
            };
        }

        // Projectile spells (fire, ice)
        let damage = 0;
        if (spell === 'fire') damage = 5;
        if (spell === 'ice') damage = 2; // Damage changed to 2
        
        const newProjectile: ProjectileState = {
            id: `player-proj-${Date.now()}`,
            x: p.player.x + 11, // center of player
            y: p.player.y + 11,
            dx: Math.cos(p.player.aimAngle) * 5,
            dy: Math.sin(p.player.aimAngle) * 5,
            damage,
            reflected: false,
            spawnTime: Date.now(),
            source: 'player',
            spellType: spell,
            ownerId: 'player'
        };

        return {
            ...p,
            player: {...p.player, mana: p.player.mana - manaCost},
            projectiles: [...p.projectiles, newProjectile]
        };
    })
  }, []);

  const handleFireBow = useCallback(() => {
    setGameState(p => {
        const now = Date.now();
        if (!p.player.hasBow || p.player.arrows <= 0 || now - p.player.lastBowShot < 2000) {
            return p;
        }

        setShowBowAttackEffect(true);
        setTimeout(() => setShowBowAttackEffect(false), 300);

        const newArrow: ProjectileState = {
            id: `arrow-${Date.now()}`,
            x: p.player.x + 11,
            y: p.player.y + 11,
            dx: Math.cos(p.player.aimAngle) * 6,
            dy: Math.sin(p.player.aimAngle) * 6,
            damage: 5,
            reflected: false,
            spawnTime: Date.now(),
            source: 'player',
            spellType: 'arrow' as const,
            ownerId: 'player'
        };
        
        if (p.player.piercingArrows) {
            newArrow.hitEnemyIds = new Set();
        }

        return {
            ...p,
            player: { ...p.player, arrows: p.player.arrows - 1, lastBowShot: now },
            projectiles: [...p.projectiles, newArrow]
        };
    });
  }, []);

  const handleSwitchMagic = useCallback(() => {
    setGameState(p => {
        if (p.player.availableSpells.length < 2) return p;
        const currentIndex = p.player.availableSpells.indexOf(p.player.selectedSpell!);
        const nextIndex = (currentIndex + 1) % p.player.availableSpells.length;
        return {...p, player: {...p.player, selectedSpell: p.player.availableSpells[nextIndex]}};
    });
  }, []);

  const handleSwitchWeapon = useCallback(() => {
    setGameState(p => {
        if (!p.player.hasAxe) return p;
        const newWeapon = p.player.equippedWeapon === 'sword' ? 'axe' : 'sword';
        return { ...p, player: { ...p.player, equippedWeapon: newWeapon } };
    });
  }, []);


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameContainerRef.current) return;
    const rect = gameContainerRef.current.getBoundingClientRect();

    const mouseXInGame = (e.clientX - rect.left);
    const mouseYInGame = (e.clientY - rect.top);

    const playerCenterXInGame = gameState.player.x + 15;
    const playerCenterYInGame = gameState.player.y + 15;
    
    const angle = Math.atan2(mouseYInGame - playerCenterYInGame, mouseXInGame - playerCenterXInGame);
    setGameState(p => ({ ...p, player: { ...p.player, aimAngle: angle }, shield: {...p.shield, angle: angle} }));
  };
  
  const tryActivateShield = useCallback(() => {
    setGameState(prev => {
        if (!prev.shield.available || prev.shield.active || prev.shield.cooldown) return prev;
        
        if(shieldIntervalRef.current) clearInterval(shieldIntervalRef.current);

        const shieldDuration = prev.player.resistant ? 6000 : 4000;
        const cooldownDuration = prev.player.resistant ? 2 : 6;
        
        setTimeout(() => {
            setGameState(p => ({ ...p, shield: {...p.shield, active: false}, player: {...p.player, invulnerable: false} }));
            
            setShieldCooldownTimer(cooldownDuration);
            shieldIntervalRef.current = window.setInterval(() => {
                setShieldCooldownTimer(t => {
                    if (t <= 1) {
                        if(shieldIntervalRef.current) clearInterval(shieldIntervalRef.current);
                        setGameState(p => ({...p, shield: {...p.shield, cooldown: false}}));
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }, shieldDuration);

        return {
            ...prev,
            shield: { ...prev.shield, active: true, cooldown: true },
            player: { ...prev.player, invulnerable: true }
        }
    });
  }, []);

  const applyUpgrade = useCallback((upgrade: UpgradeType) => {
    setGameState(p => {
      const newPlayer = { ...p.player };
      switch(upgrade) {
        case 'damage': newPlayer.damageMultiplier += 0.5; break;
        case 'regen': newPlayer.regen = Math.min(2, newPlayer.regen + 0.5); break;
        case 'speed': 
          newPlayer.speed = Math.min(40, newPlayer.speed * 1.2);
          newPlayer.runBoost = Math.min(100, newPlayer.runBoost * 1.2);
          break;
        case 'maxHealth':
          const newMax = Math.min(30, newPlayer.maxLives + 0.5);
          const diff = newMax - newPlayer.maxLives;
          newPlayer.maxLives = newMax;
          newPlayer.lives += diff;
          break;
      }
      return {...p, player: newPlayer};
    });
    setShowUpgradeModal(false);
  }, []);

  const applyRedChestUpgrade = useCallback((upgrade: RedChestUpgradeType) => {
      setGameState(p => {
          const newPlayer = {...p.player};
          switch(upgrade) {
              case 'knowledge': newPlayer.knowledge = Math.min(30, newPlayer.knowledge + 3); break;
              case 'renegade': newPlayer.renegade = Math.min(30, newPlayer.renegade + 5); break;
              case 'resistant': newPlayer.resistant = true; break;
              case 'magic':
                  const currentMagic = newPlayer.magic;
                  const newMagic = currentMagic + 5;
                  if (currentMagic === 0) { newPlayer.maxMana = 5; newPlayer.mana = 5; }
                  if (newMagic >= 10 && !newPlayer.availableSpells.includes('fire')) { newPlayer.availableSpells.push('fire'); newPlayer.selectedSpell = 'fire'; newPlayer.maxMana += 5; newPlayer.mana += 5; }
                  if (newMagic >= 15 && currentMagic < 15) { newPlayer.maxMana += 15; newPlayer.mana += 15; }
                  if (newMagic >= 20 && !newPlayer.availableSpells.includes('ice')) { newPlayer.availableSpells.push('ice'); }
                  if (newMagic >= 30 && !newPlayer.availableSpells.includes('necromancer')) { newPlayer.availableSpells.push('necromancer'); }
                  if (newMagic >= 35 && !newPlayer.availableSpells.includes('blessing')) { newPlayer.availableSpells.push('blessing'); }
                  newPlayer.magic = newMagic;
                  break;
              case 'corredor': {
                const newMaxStamina = Math.min(300, newPlayer.maxStamina + 25);
                const diff = newMaxStamina - newPlayer.maxStamina;
                newPlayer.maxStamina = newMaxStamina;
                newPlayer.stamina += diff;
                break;
              }
              case 'luck': newPlayer.luck = true; break;
              case 'piercingArrows': newPlayer.piercingArrows = true; break;
              case 'economy': newPlayer.manaCostReduction = Math.min(0.36, newPlayer.manaCostReduction + 0.12); break;
              case 'necromancerUpgrade': newPlayer.necromancerLevel = Math.min(2, newPlayer.necromancerLevel + 1); break;
          }
          return {...p, player: newPlayer };
      });
      setShowRedChestModal(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = true;
      if (key === controls.attack.toLowerCase()) handleAttack();
      if (key === controls.shield.toLowerCase()) tryActivateShield();
      if (key === controls.magic.toLowerCase()) handleMagicCast();
      if (key === controls.fireBow.toLowerCase()) handleFireBow();
      if (key === controls.switchMagic.toLowerCase()) handleSwitchMagic();
      if (key === controls.switchWeapon.toLowerCase()) handleSwitchWeapon();
      if (key === 'g' && keysPressed.current['h']) setShowDebugMenu(prev => !prev);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (shieldIntervalRef.current) clearInterval(shieldIntervalRef.current);
    };
  }, [controls, handleAttack, tryActivateShield, handleMagicCast, handleFireBow, handleSwitchMagic, handleSwitchWeapon]);

  useEffect(() => {
    if (!isPaused && !isGameOver) {
      gameLoopId.current = window.setInterval(gameLogic, 16);
    } else {
      if(gameLoopId.current) window.clearInterval(gameLoopId.current);
    }
    return () => {
      if (gameLoopId.current) window.clearInterval(gameLoopId.current);
    };
  }, [isPaused, isGameOver, gameLogic]);
  
  const isStage2 = gameState.room > 20 && gameState.room <= 40;
  const isStage3 = gameState.room > 40;
  const backgroundClass = isStage3
    ? 'bg-gradient-to-br from-red-800 to-red-950'
    : isStage2
    ? 'bg-gradient-to-br from-gray-600 to-gray-800'
    : 'bg-gradient-to-br from-[#564b3d] to-[#86755f]';
  const borderClass = isStage3 ? 'border-[#600f0f]' : 'border-[#493d2a]';

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Hud 
        lives={gameState.player.lives} 
        stamina={gameState.player.stamina}
        maxStamina={gameState.player.maxStamina}
        mana={gameState.player.mana}
        maxMana={gameState.player.maxMana}
        selectedSpell={gameState.player.selectedSpell}
        room={gameState.room} 
        kills={gameState.kills} 
        shield={gameState.shield} 
        shieldCooldownTimer={shieldCooldownTimer}
        hasBow={gameState.player.hasBow}
        arrows={gameState.player.arrows}
        hasAxe={gameState.player.hasAxe}
        equippedWeapon={gameState.player.equippedWeapon}
      />
      
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        <button onClick={() => setPaused(true)} className="py-1.5 px-3 text-base cursor-pointer bg-gray-200 text-black rounded">Pausar</button>
      </div>

      {isPaused && <PauseMenu onResume={() => setPaused(false)} onHome={onBackToMenu} />}
      {isGameOver && <GameOverScreen room={finalStats.room} kills={finalStats.kills} onRestart={onRestart} />}
      {showDebugMenu && <DebugMenu setGameState={setGameState} />}
      {showUpgradeModal && <UpgradeModal onConfirm={applyUpgrade} />}
      {showRedChestModal && <RedChestUpgradeModal onConfirm={applyRedChestUpgrade} onClose={() => setShowRedChestModal(false)} playerState={gameState.player} />}

      <div style={{width: `${gameState.gameDimensions.width}px`, height: `${gameState.gameDimensions.height}px`}} className="transition-all duration-500">
        <div
          ref={gameContainerRef}
          className={`relative w-full h-full ${backgroundClass} ${borderClass} border-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden`}
          onMouseMove={handleMouseMove}
          onClick={(e) => {
            // Prevent attack from firing when clicking chests
            const target = e.target as HTMLElement;
            if (target.dataset.chest) return;
            handleAttack();
          }}
        >
          <Player playerState={gameState.player} customization={customization} showResistanceUp={Date.now() - gameState.resistanceUpTimestamp < 2000} />
          <Shield shieldState={gameState.shield} playerState={gameState.player} />
          <Sword show={showSwordAttackEffect} angle={gameState.player.aimAngle} playerPosition={gameState.player} />
          <Axe show={showAxeAttackEffect} angle={gameState.player.aimAngle} playerPosition={gameState.player} />
          <Bow show={showBowAttackEffect} angle={gameState.player.aimAngle} playerPosition={gameState.player} />


          {gameState.enemies.map(enemy => <Enemy key={enemy.id} enemyState={enemy} />)}
          {gameState.allies.map(ally => <Ally key={ally.id} allyState={ally} />)}
          {gameState.projectiles.map(proj => <Projectile key={proj.id} projectileState={proj} />)}
          
          {gameState.chest === 'normal' && (
              <div
                  data-chest="true"
                  className="absolute w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#b89125] border-2 border-[#6f5a15] cursor-pointer transition-transform hover:scale-110 z-10 flex items-center justify-center text-2xl"
                  style={{left: `${gameState.gameDimensions.width / 2 - 16}px`, top: `${gameState.gameDimensions.height / 2 - 14}px`}}
                  onClick={(e) => { e.stopPropagation(); setShowUpgradeModal(true); setGameState(p => ({...p, chest: null, doorOpen: p.enemies.length === 0 && !p.blueChestPosition && !p.bowChestPosition && !p.redChestPosition })) }}
              >🎁</div>
          )}

          {gameState.blueChestPosition && (
              <div
                  data-chest="true"
                  className="absolute w-8 h-8 bg-gradient-to-br from-[#4f91e8] to-[#1f4fa8] border-2 border-[#1f4fa8] text-white cursor-pointer transition-transform hover:scale-110 z-10 flex items-center justify-center text-2xl"
                  style={{left: `${gameState.blueChestPosition.x}px`, top: `${gameState.blueChestPosition.y}px`}}
                  onClick={(e) => { e.stopPropagation(); setGameState(p => ({...p, blueChestPosition: null, shield: {...p.shield, available: true}, doorOpen: p.enemies.length === 0 && !p.chest && !p.bowChestPosition && !p.redChestPosition })) }}
              >💙</div>
          )}

          {gameState.bowChestPosition && (
              <div
                  data-chest="true"
                  className="absolute w-8 h-8 bg-gradient-to-br from-[#4f91e8] to-[#1f4fa8] border-2 border-[#1f4fa8] text-white cursor-pointer transition-transform hover:scale-110 z-10 flex items-center justify-center text-2xl"
                  style={{left: `${gameState.bowChestPosition.x}px`, top: `${gameState.bowChestPosition.y}px`}}
                  onClick={(e) => { e.stopPropagation(); setGameState(p => ({...p, bowChestPosition: null, player: {...p.player, hasBow: true }, doorOpen: p.enemies.length === 0 && !p.chest && !p.blueChestPosition && !p.redChestPosition })) }}
              >🏹</div>
          )}

          {gameState.redChestPosition && (
              <div
                  data-chest="true"
                  className="absolute w-8 h-8 bg-gradient-to-br from-red-600 to-red-900 border-2 border-red-950 text-white cursor-pointer transition-transform hover:scale-110 z-10 flex items-center justify-center text-2xl"
                  style={{left: `${gameState.redChestPosition.x}px`, top: `${gameState.redChestPosition.y}px`}}
                  onClick={(e) => { e.stopPropagation(); setShowRedChestModal(true); setGameState(p => ({...p, redChestPosition: null, doorOpen: p.enemies.length === 0 && !p.chest && !p.blueChestPosition && !p.bowChestPosition})) }}
              >🎁</div>
          )}

          {gameState.doorOpen && (
              <div
                  className={`absolute w-10 h-16 bg-gradient-to-b from-[#8b5a2b] to-[#5c3a1c] border-2 ${borderClass} cursor-pointer transition-transform hover:scale-105 hover:-translate-y-0.5 z-10`}
                  style={{left: `${gameState.gameDimensions.width / 2 - 20}px`, top: `${gameState.gameDimensions.height - 80}px`}}
                  onClick={(e) => { e.stopPropagation(); nextRoom(); }}
              />
          )}

        </div>
      </div>
    </div>
  );
};

export default GameContainer;