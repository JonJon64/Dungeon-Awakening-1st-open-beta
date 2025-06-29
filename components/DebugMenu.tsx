import React from 'react';
import type { GameState, EnemyState, PlayerState, BossType } from '../types';
import { BASE_GAME_WIDTH, BASE_GAME_HEIGHT, YUBOKUMIN_DATA } from '../constants';

interface DebugMenuProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const DebugButton: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children}) => (
    <button className="w-full my-0.5 p-1.5 text-sm bg-gray-700 hover:bg-teal-600 rounded transition-colors duration-150" onClick={onClick}>{children}</button>
);


const DebugMenu: React.FC<DebugMenuProps> = ({ setGameState }) => {

  const addLife = (n: number) => setGameState(p => ({ ...p, player: { ...p.player, lives: p.player.lives + n, maxLives: p.player.maxLives + n } }));
  const addStamina = (n: number) => setGameState(p => ({ ...p, player: { ...p.player, stamina: Math.min(p.player.maxStamina, p.player.stamina + n) } }));
  const setMaxStamina = () => setGameState(p => ({...p, player: {...p.player, stamina: p.player.maxStamina}}));

  const debugSpawnEnemy = (type: 'normal' | 'shooter' | 'knight' | 'knight_shooter' | 'angel' | 'angel_shooter' | 'angel_shield') => {
    setGameState(p => {
      let damage, hp, shieldHp;
      switch(type) {
        case 'normal': damage = 0.5; hp = 3; break;
        case 'shooter': damage = 1; hp = 3; break;
        case 'knight': damage = 4; hp = 12; break;
        case 'knight_shooter': damage = 3.5; hp = 12; break;
        case 'angel': damage = 12; hp = 36; break;
        case 'angel_shooter': damage = 8; hp = 30; break;
        case 'angel_shield': damage = 2; hp = 4; shieldHp = 1; break;
        default: damage = 1; hp = 3;
      }
      
      const newEnemy: EnemyState = {
        id: `debug-${type}-${Date.now()}`,
        x: p.gameDimensions.width / 2 - 15,
        y: p.gameDimensions.height / 2 - 15,
        hp,
        damage,
        type: type,
        bossType: null,
        lastShot: type.includes('shooter') ? 0 : undefined,
        shieldHp: shieldHp,
        targetId: null,
      };
      return {
        ...p,
        enemies: [...p.enemies, newEnemy]
      };
    });
  };

  const debugSpawnBoss = (type: BossType) => {
     const bossInfo = YUBOKUMIN_DATA.find(b => b.type === type) || YUBOKUMIN_DATA[0];
     const newBoss: EnemyState = {
        id: `debug-boss-${Date.now()}`,
        x: BASE_GAME_WIDTH / 2 - 25,
        y: BASE_GAME_HEIGHT / 2 - 25,
        hp: bossInfo.maxHp,
        damage: bossInfo.damage,
        type: 'boss',
        bossType: bossInfo.type,
        shieldHits: 0,
        targetId: null,
     };
     setGameState(p => ({
         ...p,
         enemies: [...p.enemies, newBoss],
     }));
  };
  
  const debugClearScene = () => {
    setGameState(p => ({ ...p, enemies: [], projectiles: [], allies: [] }));
  };
  
  const debugSpawnChest = (type: 'normal' | 'blue' | 'red') => {
    setGameState(p => {
        const position = { x: p.gameDimensions.width / 2 - 16, y: p.gameDimensions.height / 2 - 16 };
        switch (type) {
            case 'blue': return { ...p, blueChestPosition: position };
            case 'red': return { ...p, redChestPosition: position };
            case 'normal':
            default: return { ...p, chest: 'normal' };
        }
    });
  };

  const spawnEnemiesForRoom = (room: number, playerState: PlayerState, gameDimensions: {width: number, height: number}): EnemyState[] => {
    const isStage2 = room > 20 && room <= 40;
    const isStage3 = room > 40;
    const newEnemies: EnemyState[] = [];
    
    const createEnemy = (type: EnemyState['type'], x: number, y: number, baseHp: number, baseDamage: number): EnemyState => {
        let hp = baseHp;
        let damage = baseDamage;
        
        const enemy: EnemyState = {
          id: `enemy-${type}-${Date.now()}-${Math.random()}`,
          x, y, hp, damage, type, bossType: null,
          targetId: null,
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
  };

  const goToStage = (stage: number) => {
    setGameState(prev => {
        const newRoom = stage === 1 ? 1 : stage === 2 ? 21 : 41;
        
        const isStage2 = newRoom > 20 && newRoom <= 40;
        const isStage3 = newRoom > 40;

        const newGameDimensions = {
            width: isStage3 ? BASE_GAME_WIDTH * 1.4 * 1.6 : (isStage2 ? BASE_GAME_WIDTH * 1.4 : BASE_GAME_WIDTH),
            height: isStage3 ? BASE_GAME_HEIGHT * 1.4 * 1.6 : (isStage2 ? BASE_GAME_HEIGHT * 1.4 : BASE_GAME_HEIGHT),
        };

        const newEnemies = spawnEnemiesForRoom(newRoom, prev.player, newGameDimensions);
        
        return {
            ...prev,
            room: newRoom,
            player: { ...prev.player, x: newGameDimensions.width / 2 - 15, y: 30 },
            enemies: newEnemies,
            projectiles: [],
            allies: [],
            chest: null,
            blueChestPosition: null,
            bowChestPosition: null,
            redChestPosition: null,
            doorOpen: false,
            gameDimensions: newGameDimensions,
        };
    });
  };

  return (
    <div className="fixed top-14 right-2.5 w-56 p-3 bg-gray-900/80 backdrop-blur-sm border border-gray-600 text-white text-sm z-50 rounded-lg shadow-lg">
      <h3 className="text-center font-bold text-lg mb-3 text-teal-400">🔧 Debug Menu</h3>

      <div className="mb-3">
        <h4 className="font-semibold text-teal-300 border-b border-gray-700 pb-1 mb-2">Player</h4>
        <div className="grid grid-cols-2 gap-2">
            <DebugButton onClick={() => addLife(1)}>+1 Vida</DebugButton>
            <DebugButton onClick={() => addLife(5)}>+5 Vidas</DebugButton>
            <DebugButton onClick={() => addStamina(25)}>+25 Estamina</DebugButton>
            <DebugButton onClick={setMaxStamina}>Max Estamina</DebugButton>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="font-semibold text-teal-300 border-b border-gray-700 pb-1 mb-2">Spawning</h4>
        <div className="grid grid-cols-2 gap-2">
            <DebugButton onClick={() => debugSpawnEnemy('normal')}>Inimigo</DebugButton>
            <DebugButton onClick={() => debugSpawnEnemy('shooter')}>Shooter</DebugButton>
            <DebugButton onClick={() => debugSpawnEnemy('knight')}>Cavaleiro</DebugButton>
            <DebugButton onClick={() => debugSpawnEnemy('knight_shooter')}>Cav. Shooter</DebugButton>
            <DebugButton onClick={() => debugSpawnEnemy('angel')}>Anjo</DebugButton>
            <DebugButton onClick={() => debugSpawnEnemy('angel_shooter')}>Anjo Shooter</DebugButton>
            <DebugButton onClick={() => debugSpawnEnemy('angel_shield')}>Anjo Escudeiro</DebugButton>
            <DebugButton onClick={() => debugSpawnBoss('melee')}>Boss Melee</DebugButton>
            <DebugButton onClick={() => debugSpawnBoss('ranged')}>Boss Ranged</DebugButton>
            <DebugButton onClick={() => debugSpawnBoss('slowed')}>Boss Slow</DebugButton>
            <DebugButton onClick={() => debugSpawnChest('normal')}>Baú</DebugButton>
            <DebugButton onClick={() => debugSpawnChest('red')}>Baú Vermelho</DebugButton>
        </div>
      </div>
      
      <div className="mb-3">
        <h4 className="font-semibold text-teal-300 border-b border-gray-700 pb-1 mb-2">Cenário</h4>
        <div className="grid grid-cols-3 gap-1">
          <DebugButton onClick={() => goToStage(1)}>Estágio 1</DebugButton>
          <DebugButton onClick={() => goToStage(2)}>Estágio 2</DebugButton>
          <DebugButton onClick={() => goToStage(3)}>Estágio 3</DebugButton>
        </div>
        <DebugButton onClick={debugClearScene}>Limpar Entidades</DebugButton>
      </div>

      <div>
        <h4 className="font-semibold text-teal-300 border-b border-gray-700 pb-1 mb-2">Atributos / Equipamentos</h4>
        <div className="grid grid-cols-2 gap-2">
          <DebugButton onClick={() => setGameState(p => ({...p, player: {...p.player, hasBow: true}}))}>Pegar Arco</DebugButton>
          <DebugButton onClick={() => setGameState(p => ({...p, player: {...p.player, arrows: p.player.maxArrows}}))}>Max Flechas</DebugButton>
          <DebugButton onClick={() => setGameState(p => ({ ...p, player: { ...p.player, resistance: p.player.resistance + 1 }, resistanceUpTimestamp: Date.now() }))}>+Resistência</DebugButton>
          <DebugButton onClick={() => setGameState(p => ({...p, player: {...p.player, magic: p.player.magic + 10, maxMana: p.player.maxMana + 20, mana: p.player.mana + 20}}))}>+Magia</DebugButton>
          <DebugButton onClick={() => setGameState(p => ({...p, player: {...p.player, luck: true}}))}>+Sorte</DebugButton>
          <DebugButton onClick={() => setGameState(p => ({...p, player: {...p.player, renegade: Math.min(30, p.player.renegade + 5)}}))}>+Renegado</DebugButton>
          <DebugButton onClick={() => setGameState(p => {
              const player = {...p.player};
              if (!player.availableSpells.includes('blessing')) {
                  player.magic = Math.max(player.magic, 35);
                  player.availableSpells.push('blessing');
                  if (!player.selectedSpell) player.selectedSpell = 'blessing';
              }
              return {...p, player};
          })}>Adquirir Benção</DebugButton>
        </div>
      </div>

    </div>
  );
};

export default DebugMenu;