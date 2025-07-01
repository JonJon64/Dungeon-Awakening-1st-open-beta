
import React from 'react';

interface ChangelogModalProps {
  onClose: () => void;
}

const VersionSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h2 className="text-2xl font-bold mb-3 text-yellow-300 border-b-2 border-yellow-400/50 pb-1">{title}</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-200">
            {children}
        </ul>
    </div>
);

const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-[#6e5b45] p-6 border-4 border-[#493d2a] rounded-lg shadow-xl w-full max-w-3xl h-full max-h-[90vh] relative flex flex-col">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Changelog</h1>
        <button onClick={onClose} className="absolute top-4 right-4 text-3xl text-white hover:text-red-500 transition-colors">&times;</button>
        
        <div className="overflow-y-auto pr-4 flex-grow text-left">
            <VersionSection title="Versão 1.9.9 Beta (React) (Atual)">
                <li><b>Novas Magias (Modo Onda):</b></li>
                <ul className="list-['-_'] list-inside ml-4 mt-1 space-y-1">
                    <li><b>Explosão (40 de Magia):</b> Dispara um projétil que cria uma área de dano ao impacto. Pode ser aprimorada com o poder "Pinguin Rico" para dobrar o raio e o dano.</li>
                    <li><b>Escudo Mágico (45 de Magia):</b> Cria uma barreira que consome mana, bloqueia projéteis e empurra inimigos.</li>
                </ul>
                 <li><b>Novos Atributos e Melhorias de IA (Modo Onda):</b></li>
                 <ul className="list-['-_'] list-inside ml-4 mt-1 space-y-1">
                    <li><b>Novos Atributos:</b> Adicionados upgrades de '+50% Recarga de Estamina' e '+50% Recarga de Mana' no baú de atributos.</li>
                    <li><b>Melhoria de IA (Bots):</b> Aliados bots agora trocam para o machado para combater inimigos atiradores, aproveitando o maior alcance.</li>
                    <li>A IA dos aliados da magia Necromante foi corrigida. Agora eles atacam inimigos em um raio de 120px e seguem o jogador se não houver alvos.</li>
                    <li>Aliados da magia Necromante agora persistem entre as ondas no Modo Onda.</li>
                </ul>
                <li><b>Rebalanceamento e Correções (Modo Onda):</b></li>
                <ul className="list-['-_'] list-inside ml-4 mt-1 space-y-1">
                    <li><b>Escudo (Habilidade):</b> Duração base aumentada para 5 segundos, recarga de 2 segundos. Upgrade 'Resistente' agora dobra a duração. O escudo agora também empurra inimigos ao colidir com eles.</li>
                    <li><b>Bênção:</b> No Modo Onda, agora concede 5 de vida instantaneamente para todos os jogadores e aliados na partida.</li>
                    <li><b>Arco e Flecha:</b> Dano base aumentado para 5. Com 'Flecha Perfurante', o dano sobe para 9 e pode atingir até 15 inimigos.</li>
                    <li><b>Conhecimento:</b> Limite de upgrade aumentado para 40%. Agora também concede uma chance de refletir 100% do dano recebido.</li>
                    <li><b>Renegado:</b> Limite de upgrade aumentado para 40%.</li>
                    <li><b>Corredor:</b> Bônus de estamina por upgrade aumentado para +50, com um novo limite de 450.</li>
                    <li>Adicionada colisão entre todos os aliados, inimigos e jogadores para evitar sobreposição.</li>
                </ul>
                 <li><b>Nota do Desenvolvedor:</b> Preparem-se! A próxima atualização poderá ser uma das maiores até agora, com grandes novidades a caminho.</li>
            </VersionSection>

            <VersionSection title="Versão 1.9.8 Beta (React)">
                <li>Corrigido um erro crítico que causava uma falha no jogo (`TypeError`) durante o combate no Modo Onda, especialmente com múltiplos jogadores ou bots atacando simultaneamente.</li>
                <li>Implementado um novo sistema de bônus de Resistência no Modo Onda: a cada 2 ondas, jogadores e aliados têm a chance de ganhar um bônus de resistência acumulativo (entre +0.12 e +0.50), com limite de 1.25. Um indicador de texto sobre o personagem mostra o bônus atual.</li>
                <li>A fórmula de redução de dano da resistência foi ajustada para ser mais impactante (1.0 de resistência agora equivale a 50% de redução de dano).</li>
            </VersionSection>

            <VersionSection title="Versão 1.9.7">
                <li>A mecânica de bônus de onda foi retrabalhada: agora, cada jogador, bot e inimigo recebe um bônus de vida e/ou dano individualmente, com um texto de notificação aparecendo sobre eles.</li>
                <li>O multiplicador do bônus de onda agora aumenta com o progresso da partida.</li>
                <li>Implementadas barras de vida individuais para cada inimigo no Modo Onda, posicionadas abaixo deles.</li>
                <li>Adicionada uma animação de "flash" e pulso quando os inimigos sofrem dano, melhorando o feedback visual do combate.</li>
                <li>Ataque da espada foi aprimorado para que a área de dano siga a animação da espada, tornando o combate corpo a corpo mais preciso.</li>
            </VersionSection>
            
            <VersionSection title="Versão 1.9.6">
                <li>Sistema de pontuação do Modo Onda foi rebalanceado para recompensar mais os jogadores.</li>
                <li>Adicionado novo bônus de Onda: No início de cada onda, todos os jogadores, aliados e inimigos recebem um bônus de Dano ou Vida, com um aviso na tela.</li>
            </VersionSection>

            <VersionSection title="Versão 1.9.5">
                <li>Melhoria na IA de esquiva dos aliados no Modo Onda: agora eles podem desviar de múltiplos projéteis de forma mais eficaz, em vez de travar.</li>
                <li>Após esquivar, os aliados agora priorizam atacar os inimigos atiradores mais próximos.</li>
                <li>Adicionada esta tela de Changelog para acompanhar as atualizações.</li>
            </VersionSection>

            <VersionSection title="Versão 1.8">
                <li>Corrigido bug que fazia a vida dos chefes escalar indefinidamente, tornando-os imortais.</li>
                <li>Implementadas as mecânicas de Arco, Magia e Escudo para o jogador no Modo Onda.</li>
                <li>Magia de Gelo agora causa 2 de dano e congela inimigos atingidos.</li>
                <li>Aliados do Modo Onda agora se beneficiam de atributos, compram itens e abrem baús.</li>
                <li>Aliados (Modo Onda e Necromante) agora tentam desviar de projéteis.</li>
                <li>Inimigos atiradores (Cavaleiros, Anjos, Chefes) agora disparam projéteis corretamente.</li>
                <li>Aliados do Necromante agora seguem o jogador quando não estão em combate.</li>
                <li>Adicionado o poder 'Pontos em Dobro' para o Modo Onda.</li>
                <li>Upgrade de Velocidade agora afeta apenas o jogador e seus aliados do Necromante.</li>
                <li>Limite de upgrade do Necromante aumentado para 5 no Modo Onda.</li>
                <li>HUD dos aliados no Modo Onda agora exibe a pontuação individual.</li>
            </VersionSection>
            
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;
