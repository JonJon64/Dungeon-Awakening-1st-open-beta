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
            <p>Seu objetivo é sobreviver o maior número de salas possível, derrotando todos os inimigos em cada uma para avançar. O jogo possui 60 salas divididas em 3 estágios, cada um com inimigos mais fortes. A cada 5 salas, um ou mais chefes aparecerão.</p>
        
            <SectionTitle>Controles Padrão</SectionTitle>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <p>Mover para Cima: <Key>{initialControls.up.toUpperCase()}</Key></p>
                <p>Mover para Baixo: <Key>{initialControls.down.toUpperCase()}</Key></p>
                <p>Mover para Esquerda: <Key>{initialControls.left.toUpperCase()}</Key></p>
                <p>Mover para Direita: <Key>{initialControls.right.toUpperCase()}</Key></p>
                <p>Correr: <Key>{initialControls.run}</Key></p>
                <p>Atacar (Espada): <Key>Espaço</Key></p>
                <p>Escudo: <Key>{initialControls.shield.toUpperCase()}</Key></p>
                <p>Disparar Arco: <Key>{initialControls.fireBow.toUpperCase()}</Key></p>
                <p>Usar Magia: <Key>{initialControls.magic.toUpperCase()}</Key></p>
                <p>Trocar Magia: <Key>{initialControls.switchMagic.toUpperCase()}</Key></p>
                <p>Mirar: <Key>Mouse</Key></p>
            </div>
            
            <SectionTitle>Atributos (Baús Normais)</SectionTitle>
            <p>Após limpar uma sala de inimigos comuns, um baú de tesouro aparece, oferecendo uma escolha entre quatro atributos básicos.</p>
            <AttributeItem title="+50% Dano" description="Aumenta o dano do seu ataque de espada." />
            <AttributeItem title="+0.5 Regeneração/s" description="Recupera vida lentamente. Máximo de 2/s." />
            <AttributeItem title="+20% Velocidade" description="Aumenta sua velocidade de movimento e corrida." />
            <AttributeItem title="+0.5 Vida Máxima" description="Aumenta sua vida máxima e atual permanentemente." />

            <SectionTitle>Poderes (Baús Vermelhos)</SectionTitle>
            <p>A cada duas salas, um baú vermelho especial aparece, oferecendo poderes únicos e passivos que mudam drasticamente sua forma de jogar.</p>
            <AttributeItem title="Conhecimento" description="Dá uma pequena chance de ignorar completamente o dano recebido." />
            <AttributeItem title="Renegado" description="Dá uma pequena chance de refletir o dano que você recebe para todos os inimigos na tela." />
            <AttributeItem title="Resistência" description="Melhora seu escudo, aumentando a duração e diminuindo a recarga." />
            <AttributeItem title="Corredor" description="Aumenta sua estamina máxima, permitindo que você corra por mais tempo." />
            <AttributeItem title="Sorte" description="Aumenta a chance de inimigos derrubarem flechas e o número de inimigos no Estágio 2." />
            <AttributeItem title="Flecha Perfurante" description="Suas flechas atravessam múltiplos inimigos, causando dano e empurrando-os." />
            <AttributeItem title="Economia de Mana" description="Reduz o custo de mana de todas as magias." />
            <AttributeItem title="Necromante (Upgrade)" description="Fortalece seus esqueletos invocados, aumentando a vida, dano e o número de aliados." />
            
            <SectionTitle>Magia e Poderes</SectionTitle>
            <p>O atributo "Magia" (de baús vermelhos) desbloqueia uma barra de mana e novos feitiços. Você pode alternar entre os feitiços aprendidos com a tecla <Key>T</Key>.</p>
            <SubTitle>🔥 Fogo</SubTitle>
            <p>Desbloqueado com 10 de Magia. Dispara uma bola de fogo que causa dano moderado.</p>
            <SubTitle>❄️ Gelo</SubTitle>
            <p>Desbloqueado com 20 de Magia. Dispara um projétil de gelo que causa dano alto.</p>
            <SubTitle>💀 Necromante</SubTitle>
            <p>Desbloqueado com 30 de Magia. Usa toda a sua mana para invocar 3 esqueletos aliados que lutam por você. Pode ser aprimorado com o poder "Necromante" do baú vermelho.</p>
            <SubTitle>💖 Bênção</SubTitle>
            <p>Desbloqueado com 35 de Magia. Este poder divino tem dois estágios, consome toda a sua estamina (não usa mana) e tem 45s de recarga.</p>
            <ul className="list-disc list-inside text-gray-300 ml-4">
                <li><b>Primeiro Uso:</b> Aumenta sua vida máxima para 30 permanentemente.</li>
                <li><b>Usos Seguintes:</b> Ativa uma poderosa regeneração de 3.5 vida/segundo por 5 segundos.</li>
            </ul>

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
            <SubTitle>🛡️ Escudo</SubTitle>
            <p>Você pode encontrar o escudo em um baú azul após derrotar o primeiro chefe. Uma vez adquirido, pressione <Key>R</Key> para ativá-lo. O escudo bloqueia ataques corpo a corpo e reflete projéteis. Ele tem um tempo de uso e recarga. O upgrade 'Resistente' de baús vermelhos melhora a duração e a recarga do escudo.</p>
            <SubTitle>🏹 Arco e Flecha</SubTitle>
            <p>Disponível em um baú especial na sala 15. Use <Key>F</Key> para disparar uma flecha. Flechas são limitadas e podem ser recuperadas ao derrotar inimigos. O upgrade 'Flecha Perfurante' permite que suas flechas atravessem múltiplos inimigos.</p>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;