
import React from 'react';
import { initialControls, YUBOKUMIN_DATA } from '../constants';

interface HowToPlayModalProps {
  onClose: () => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-2xl font-bold mt-6 mb-3 text-yellow-300 border-b-2 border-yellow-400/50 pb-1">{children}</h2>
);

const SubTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xl font-semibold mt-4 mb-2 text-yellow-200">{children}</h3>
);

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-block px-2 py-1 bg-gray-900/50 rounded-md font-mono text-lg">{children}</span>
);

const EnemyDisplay: React.FC<{ classes: string, name: string, description: string }> = ({ classes, name, description }) => (
    <div className="flex items-start gap-4 my-3">
        <div className={`w-[30px] h-[30px] flex-shrink-0 mt-1 ${classes}`}></div>
        <div>
            <h4 className="font-bold text-white">{name}</h4>
            <p className="text-sm text-gray-300">{description}</p>
        </div>
    </div>
);

const BossDisplay: React.FC<{ color: string, name: string, description: string }> = ({ color, name, description }) => (
    <div className="flex items-start gap-4 my-3">
        <div className="w-[50px] h-[50px] flex-shrink-0 mt-1 border-2 border-black" style={{ backgroundColor: color }}></div>
        <div>
            <h4 className="font-bold text-white">{name}</h4>
            <p className="text-sm text-gray-300">{description}</p>
        </div>
    </div>
);

const AttributeItem: React.FC<{ title: string, description: string }> = ({ title, description }) => (
    <div className="my-2">
        <h4 className="font-bold text-white">{title}</h4>
        <p className="text-sm text-gray-300">{description}</p>
    </div>
);


const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-[#6e5b45] p-6 border-4 border-[#493d2a] rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] relative flex flex-col">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Como Jogar</h1>
        <button onClick={onClose} className="absolute top-4 right-4 text-3xl text-white hover:text-red-500 transition-colors">&times;</button>
        
        <div className="overflow-y-auto pr-4 flex-grow">
            <SectionTitle>O Objetivo</SectionTitle>
            <p>Seu objetivo é sobreviver o maior número de salas possível (Modo Clássico) ou ondas de inimigos (Modo Onda), derrotando todos em cada uma para avançar. O Modo Clássico possui 60 salas divididas em 3 estágios. A cada 5 salas, um ou mais chefes aparecerão.</p>
        
            <SectionTitle>Controles Padrão</SectionTitle>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <p>Mover para Cima: <Key>{initialControls.up.toUpperCase()}</Key></p>
                <p>Mover para Baixo: <Key>{initialControls.down.toUpperCase()}</Key></p>
                <p>Mover para Esquerda: <Key>{initialControls.left.toUpperCase()}</Key></p>
                <p>Mover para Direita: <Key>{initialControls.right.toUpperCase()}</Key></p>
                <p>Correr: <Key>{initialControls.run}</Key></p>
                <p>Atacar (Arma Principal): <Key>Espaço</Key></p>
                <p>Trocar Arma Principal: <Key>{initialControls.switchWeapon.toUpperCase()}</Key></p>
                <p>Escudo: <Key>{initialControls.shield.toUpperCase()}</Key></p>
                <p>Disparar Arco: <Key>{initialControls.fireBow.toUpperCase()}</Key></p>
                <p>Usar Magia: <Key>{initialControls.magic.toUpperCase()}</Key></p>
                <p>Trocar Magia: <Key>{initialControls.switchMagic.toUpperCase()}</Key></p>
                <p>Mirar: <Key>Mouse</Key></p>
            </div>
            
            <SectionTitle>Atributos (Baús Normais)</SectionTitle>
            <p>No Modo Clássico, após limpar uma sala, um baú oferece uma escolha de atributos. No Modo Onda, estes podem ser comprados ou encontrados em baús e podem incluir opções exclusivas.</p>
            <AttributeItem title="Dano (+50% Clássico / +20% Onda)" description="Aumenta o dano do seu ataque." />
            <AttributeItem title="Regeneração (+0.5 Clássico / +0.25 Onda)" description="Recupera vida lentamente. Máximo de 2/s." />
            <AttributeItem title="Velocidade (+20% Clássico / +10% Onda)" description="Move-se mais rapidamente." />
            <AttributeItem title="Vida Máxima (+0.5 Clássico / +1 Onda)" description="Aumenta sua vida máxima permanentemente." />
            <AttributeItem title="Recarga de Estamina +50% (Exclusivo Modo Onda)" description="Aumenta a velocidade de recuperação de estamina." />
            <AttributeItem title="Recarga de Mana +50% (Exclusivo Modo Onda)" description="Aumenta a velocidade de recuperação de mana." />


            <SectionTitle>Poderes (Baús Vermelhos)</SectionTitle>
            <p>A cada duas salas (ou comprado na loja do Modo Onda), um baú vermelho especial aparece, oferecendo poderes únicos e passivos que mudam drasticamente sua forma de jogar.</p>
            <AttributeItem title="Conhecimento" description="Dá uma chance de ignorar completamente o dano recebido. No Modo Onda, também tem chance de refletir 100% do dano de volta." />
            <AttributeItem title="Renegado" description="Dá uma chance de refletir o dano que você recebe para todos os inimigos na tela." />
            <AttributeItem title="Resistência" description="Melhora seu escudo. No Modo Onda, dobra a duração do escudo de habilidade." />
            <AttributeItem title="Corredor" description="Aumenta sua estamina máxima. O bônus é maior no Modo Onda." />
            <AttributeItem title="Sorte" description="Aumenta a chance de inimigos derrubarem flechas e o número de inimigos no Estágio 2." />
            <AttributeItem title="Flecha Perfurante" description="Suas flechas atravessam múltiplos inimigos. No modo Onda, causa dano massivo e perfura mais inimigos." />
            <AttributeItem title="Economia de Mana" description="Reduz o custo de mana de todas as magias." />
            <AttributeItem title="Necromante (Upgrade)" description="Fortalece seus esqueletos invocados, aumentando a vida, dano e o número de aliados." />
            <AttributeItem title="Pinguin Rico (Modo Onda)" description="Melhora a magia Explosão, dobrando seu raio e dano." />
            
            <SectionTitle>Magia e Poderes</SectionTitle>
            <p>O atributo "Magia" (de baús vermelhos) desbloqueia uma barra de mana e novos feitiços. Você pode alternar entre os feitiços aprendidos com a tecla <Key>T</Key>.</p>
            <SubTitle>🔥 Fogo</SubTitle>
            <p>Desbloqueado com 10 de Magia. Dispara uma bola de fogo que causa dano moderado.</p>
            <SubTitle>❄️ Gelo</SubTitle>
            <p>Desbloqueado com 20 de Magia. Dispara um projétil de gelo que causa dano e congela inimigos por um curto período.</p>
            <SubTitle>💀 Necromante</SubTitle>
            <p>Desbloqueado com 30 de Magia. Usa toda a sua mana para invocar 3 esqueletos aliados que lutam por você. Pode ser aprimorado com o poder "Necromante" do baú vermelho.</p>
            <SubTitle>💖 Bênção</SubTitle>
            <p>Desbloqueado com 35 de Magia. Este poder divino consome toda a sua estamina e tem uma longa recarga. No Modo Clássico, aumenta sua vida máxima permanentemente e depois concede regeneração intensa. No Modo Onda, cura instantaneamente 5 de vida para todos os aliados na partida.</p>
             <SubTitle>💥 Explosão (Modo Onda)</SubTitle>
            <p>Desbloqueado com 40 de Magia. Dispara um projétil que, ao atingir um inimigo, cria uma área de dano contínuo. Pode ser aprimorado com 'Pinguin Rico'.</p>
            <SubTitle>🔵 Escudo Mágico (Modo Onda)</SubTitle>
            <p>Desbloqueado com 45 de Magia. Cria uma barreira protetora que bloqueia projéteis e empurra inimigos, consumindo mana ao longo do tempo.</p>

            <SectionTitle>Estágios & Inimigos</SectionTitle>
            <div>
                <SubTitle>Estágio 1 (Salas 1-20)</SubTitle>
                <EnemyDisplay classes="bg-gradient-to-br from-red-600 to-red-900 border-2 border-red-950" name="Inimigo Comum" description="Oponente básico que persegue e ataca corpo a corpo." />
                <EnemyDisplay classes="bg-gradient-to-br from-red-600 to-red-900 border-2 border-dashed border-white" name="Atirador Comum" description="Mantém distância e dispara projéteis." />

                <SubTitle>Estágio 2 (Salas 21-40)</SubTitle>
                <EnemyDisplay classes="bg-gradient-to-br from-yellow-500 to-yellow-700 border-2 border-yellow-900" name="Cavaleiro" description="Mais resistente e forte que os inimigos comuns." />
                <EnemyDisplay classes="bg-gradient-to-br from-yellow-500 to-yellow-700 border-2 border-dashed border-white" name="Atirador Cavaleiro" description="Uma versão mais perigosa do atirador." />

                <SubTitle>Estágio 3 (Salas 41-60)</SubTitle>
                <EnemyDisplay classes="bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-gray-400" name="Anjo" description="Inimigo de elite com alta vida e dano." />
                <EnemyDisplay classes="bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-dashed border-cyan-300" name="Anjo Atirador" description="Dispara projéteis velozes e dolorosos." />
                <EnemyDisplay classes="bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-gray-400" name="Anjo Escudeiro" description="Carrega um escudo que bloqueia seus ataques. Ataque o escudo diretamente para quebrá-lo." />
            </div>

            <SectionTitle>Chefes (Yubokumin)</SectionTitle>
            <p>Aparecem a cada 5 salas. Derrotá-los concede um bônus permanente de +0.12x de dano.</p>
            <BossDisplay color={YUBOKUMIN_DATA[0].color} name={YUBOKUMIN_DATA[0].name} description="Um guerreiro rápido que avança para o combate corpo a corpo."/>
            <BossDisplay color={YUBOKUMIN_DATA[2].color} name={YUBOKUMIN_DATA[2].name} description="Prefere manter distância, atirando projéteis poderosos."/>
            <BossDisplay color={YUBOKUMIN_DATA[1].color} name={YUBOKUMIN_DATA[1].name} description="Um chefe lento, mas extremamente resistente e com dano massivo."/>


            <SectionTitle>Itens e Habilidades</SectionTitle>
            <SubTitle>🗡️ Machado de Batalha</SubTitle>
            <p>Você obterá um Machado de Batalha ao completar a sala 20. Pressione <Key>E</Key> para alternar entre a Espada e o Machado. O machado é mais lento, mas causa mais dano e tem um alcance maior, ideal para acertar múltiplos inimigos.</p>
            <SubTitle>🛡️ Escudo</SubTitle>
            <p>No Modo Clássico, encontrado em um baú azul. Uma vez adquirido, pressione <Key>R</Key> para ativá-lo. O escudo bloqueia ataques corpo a corpo e reflete projéteis. No Modo Onda, ele dura 5 segundos com 2 segundos de recarga e colide com inimigos, empurrando-os.</p>
            <SubTitle>🏹 Arco e Flecha</SubTitle>
            <p>Disponível em um baú na sala 15. Use <Key>F</Key> para disparar uma flecha de alto dano (dano base 5). Flechas são limitadas e podem ser recuperadas ao derrotar inimigos.</p>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
