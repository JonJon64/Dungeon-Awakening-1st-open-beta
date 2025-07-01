

import React from 'react';
import type { ShopItem, WavePlayerState } from '../types';

interface ShopModalProps {
    player: WavePlayerState;
    onBuy: (item: ShopItem) => void;
    onClose: () => void;
}

const SHOP_ITEMS: ShopItem[] = [
    { id: 'cheap_shield', name: 'Escudo Barato (5 Cargas)', cost: 50, type: 'ability' },
    { id: 'add_arrows', name: 'Comprar 5 Flechas', cost: 20, type: 'ability' },
    { id: 'upgrade_chest', name: 'Baú de Atributo', cost: 95, type: 'chest' },
    { id: 'power_chest', name: 'Baú de Poder', cost: 95, type: 'chest' },
    { id: 'shield', name: 'Habilidade: Escudo', cost: 500, type: 'ability' },
    { id: 'bow', name: 'Arma: Arco', cost: 250, type: 'weapon' },
    { id: 'axe', name: 'Arma: Machado', cost: 250, type: 'weapon' },
];

const ShopModal: React.FC<ShopModalProps> = ({ player, onBuy, onClose }) => {

    const availableItems = SHOP_ITEMS.filter(item => {
        if (item.type === 'chest') return true;
        if (item.id === 'axe' && player.hasAxe) return false;
        if (item.id === 'bow' && player.hasBow) return false;
        if (item.id === 'shield' && player.shield.available) return false;
        if (item.id === 'add_arrows' && (!player.hasBow || player.arrows >= player.maxArrows)) return false;
        if (item.id === 'cheap_shield' && ((player.shield.shieldHp ?? 0) >= 20 || player.shield.available)) return false;
        return true;
    });

    const renderItem = (item: ShopItem) => {
        const canAfford = player.points >= item.cost;
        return (
            <div key={item.id} className="bg-black/20 p-4 rounded-lg flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <p className="text-yellow-300 font-semibold">{item.cost} Pontos</p>
                </div>
                <button
                    onClick={() => onBuy(item)}
                    disabled={!canAfford}
                    className="py-2 px-5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    Comprar
                </button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={onClose}>
            <div 
                className="bg-gradient-to-br from-[#6e5b45] to-[#5c432c] p-6 border-4 border-[#493d2a] rounded-lg shadow-xl w-full max-w-lg text-white"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold">💰 Loja</h2>
                    <p className="text-xl">Seus Pontos: <span className="font-bold text-yellow-300">{player.points}</span></p>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {availableItems.length > 0 ? (
                        availableItems.map(renderItem)
                    ) : (
                        <p className="text-center text-gray-300 p-4">Todos os itens permanentes foram comprados!</p>
                    )}
                </div>
                <button onClick={onClose} className="mt-6 w-full py-3 text-lg bg-red-700 hover:bg-red-800 rounded-lg transition-colors">
                    Sair da Loja
                </button>
            </div>
        </div>
    );
};

export default ShopModal;
