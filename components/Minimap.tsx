import React from 'react';
import type { WaveGameState } from '../types';

interface MinimapProps {
    gameState: WaveGameState;
}

const MINIMAP_SIZE = { width: 200, height: 133 }; // Maintain aspect ratio of 3000x2000

const Minimap: React.FC<MinimapProps> = ({ gameState }) => {
    const { players, enemies, gameDimensions, shop } = gameState;

    const scaleX = MINIMAP_SIZE.width / gameDimensions.width;
    const scaleY = MINIMAP_SIZE.height / gameDimensions.height;

    return (
        <div 
            className="absolute top-4 right-4 bg-black/50 border-2 border-gray-500 rounded-md z-40"
            style={{ width: `${MINIMAP_SIZE.width}px`, height: `${MINIMAP_SIZE.height}px`}}
        >
            {/* Shop Area */}
            <div 
                className="absolute rounded-full bg-yellow-400/30"
                style={{
                    width: `${shop.radius * 2 * scaleX}px`,
                    height: `${shop.radius * 2 * scaleY}px`,
                    left: `${(shop.x - shop.radius) * scaleX}px`,
                    top: `${(shop.y - shop.radius) * scaleY}px`,
                }}
            />

            {/* Enemies */}
            {enemies.map(enemy => (
                <div 
                    key={enemy.id}
                    className="absolute w-1.5 h-1.5 bg-red-500 rounded-full"
                    style={{
                        left: `${enemy.x * scaleX}px`,
                        top: `${enemy.y * scaleY}px`,
                    }}
                />
            ))}

            {/* Players */}
            {players.map(player => (
                 <div 
                    key={player.id}
                    className={`absolute w-2 h-2 rounded-full ${player.isDead ? 'bg-gray-500' : 'bg-white'}`}
                    style={{
                        left: `${player.x * scaleX}px`,
                        top: `${player.y * scaleY}px`,
                    }}
                />
            ))}
        </div>
    );
};

export default Minimap;
