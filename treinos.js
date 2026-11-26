/*
  TREINOS DO TCHELA CLUB
  ----------------------
  Este é o arquivo para editar os treinos. Cada treino (A a E) tem uma lista de exercícios.
  Cada exercício tem a versão "academia" e a versão "casa" (mesmo foco muscular).

  Campos de cada exercício:
    series    -> quantas séries
    reps      -> faixa de repetições [mínimo, máximo] (ou segundos, se for exercício de tempo)
    descanso  -> segundos de descanso entre as séries
    lado      -> texto opcional, ex.: "cada perna" (as repetições contam para um lado)
    academia / casa -> a versão do exercício em cada lugar:
       id     -> nome curto sem espaço (é por ele que o app guarda o histórico; não mude depois de usar)
       nome   -> nome que aparece no app
       equip  -> "smith", "halter", "halter-ajustavel", "maquina", "polia" ou "corpo"
       teste  -> carga sugerida na primeira vez
       dica   -> como fazer
       subs   -> 1 ou 2 substituições
       semCarga: true  -> exercício sem peso (só repetições)
       tempo: true     -> exercício de tempo (prancha); "reps" vira segundos
       (a versão "casa" pode ter series/reps/descanso/lado próprios)

  Depois de editar, aumente o número de "versao" abaixo: assim o celular troca o plano antigo
  pelo novo (a não ser que você tenha editado o plano pelo próprio app).
*/
window.PLANO_PADRAO = {
  versao: 1,

  aquecimento: {
    academia: '3 min de caminhada leve na esteira + 2 séries leves do 1º exercício (10 e 6 repetições).',
    casa: '3 min de caminhada leve na esteira (ou polichinelo sem pular) + 2 séries leves do 1º exercício.'
  },

  cardio: {
    academia: { nome: 'Caminhada inclinada', detalhe: '15–20 min · 5 a 6 km/h · inclinação 8–12%' },
    casa: { nome: 'Caminhada rápida ou intervalada', detalhe: '15–20 min · 5,5 a 6,5 km/h, ou 2 min rápido + 1 min normal' }
  },

  // A cada quantas voltas completas (A→E) vem uma volta leve (deload)
  deloadACada: 7,

  // VÍDEOS: um vídeo escolhido para cada exercício (pelo "id" do exercício).
  // Para trocar, cole outro link do YouTube. Exercício sem vídeo aqui abre a busca no YouTube.
  videos: {
    'hip-thrust-smith': 'https://www.youtube.com/watch?v=1LQcKrm29GU', // GUSTAVO SANTOS - Personal Nutri
    'hip-thrust-halter-sofa': 'https://www.youtube.com/watch?v=GX3Dt-jO-PI', // Mais leve com a Jaque
    'stiff-halteres': 'https://www.youtube.com/watch?v=cETLf4xXYCQ', // Miqueias Alves Personal
    'cadeira-flexora': 'https://www.youtube.com/watch?v=Zss6E3VU6X0', // Leandro Twin
    'ponte-pes-sofa': 'https://www.youtube.com/watch?v=ua0In1wBglE', // Glauco Kruger - Personal Integrativo
    'cadeira-abdutora': 'https://www.youtube.com/watch?v=e2gmqTG1OgQ', // Leandro Twin
    'abducao-miniband-sentada': 'https://www.youtube.com/watch?v=h9pSOjCeJ8o', // Glauco Kruger - Personal Integrativo
    'puxada-alta-fechada': 'https://www.youtube.com/watch?v=IFDUGxHRIKA', // Treino Mestre
    'remada-curvada-halteres': 'https://www.youtube.com/watch?v=Vk6c7CjtM14', // Leandro Twin
    'remada-baixa': 'https://www.youtube.com/watch?v=f8AVh4VBbos', // Laércio Refundini - Aulas
    'remada-elastico-sentada': 'https://www.youtube.com/watch?v=zxndd6x_NL8', // Rodrigo Peralta
    'remada-unilateral-halter': 'https://www.youtube.com/watch?v=m4h4jT9patY', // Leandro Twin
    'face-pull': 'https://www.youtube.com/watch?v=jvwPfCguVQM', // Miqueias Alves Personal
    'pull-apart-elastico': 'https://www.youtube.com/watch?v=66OT1z4BCTc', // Treino Certo
    'rosca-alternada': 'https://www.youtube.com/watch?v=S1HAcTVQVYE', // Leandro Twin
    'dead-bug': 'https://www.youtube.com/watch?v=0loS0bRNqfs', // Treinadora Sarah Castro
    'prancha': 'https://www.youtube.com/watch?v=qNRqGqESAWU', // Leandro Twin
    'agachamento-smith': 'https://www.youtube.com/watch?v=7D9boQk3lEE', // Tay Training
    'agachamento-goblet': 'https://www.youtube.com/watch?v=ge1vdJRP0UA', // Guilherme Stellbrink I FisioPrev
    'afundo-bulgaro': 'https://www.youtube.com/watch?v=pdau2xieCCs', // Tay Training
    'cadeira-extensora': 'https://www.youtube.com/watch?v=el3oHblB5DM', // Leandro Twin
    'subida-degrau': 'https://www.youtube.com/watch?v=UU4IdhzZA5w', // Italo
    'coice-polia': 'https://www.youtube.com/watch?v=XYCCcD0MxN8', // Tay Training
    'coice-miniband': 'https://www.youtube.com/watch?v=k0s0HP1Rr8Q', // Mais leve com a Jaque
    'chest-press': 'https://www.youtube.com/watch?v=WGdi4iTfza8', // Guilherme Stellbrink I FisioPrev
    'flexao': 'https://www.youtube.com/watch?v=COpDKiH4byU', // Miqueias Alves Personal
    'desenvolvimento-halteres': 'https://www.youtube.com/watch?v=eufDL9MmF8A', // Laércio Refundini - Aulas
    'elevacao-lateral': 'https://www.youtube.com/watch?v=IwWvZ0rlNXs', // Leandro Twin
    'crucifixo-inverso-crossover': 'https://www.youtube.com/watch?v=IzPMAqlrjkA', // koach Team
    'crucifixo-inverso-halteres': 'https://www.youtube.com/watch?v=5P0DUzvhITA', // 4Nutrition Oficial
    'triceps-corda': 'https://www.youtube.com/watch?v=dTqDKC0D6P4', // Leandro Twin
    'triceps-frances': 'https://www.youtube.com/watch?v=9EkGm94Q2Ms', // Guilherme Stellbrink I FisioPrev
    'pallof-press': 'https://www.youtube.com/watch?v=Wez6pSiwfJg', // CT Powerfit
    'prancha-toque-ombro': 'https://www.youtube.com/watch?v=3ZSopTK46bs', // Adrenalina Training
    'hip-thrust-pausa-smith': 'https://www.youtube.com/watch?v=KYhMic5gn9U', // Tay Training
    'hip-thrust-unilateral': 'https://www.youtube.com/watch?v=4AeXJJRhkMw', // Guilherme Stellbrink I FisioPrev
    'remada-crossover': 'https://www.youtube.com/watch?v=HpWWreyaBN0', // Leandro Twin
    'remada-curvada-elastico': 'https://www.youtube.com/watch?v=eKmJqS7Gzvk', // Mais leve com a Jaque
    'abdutora-tronco-frente': 'https://www.youtube.com/watch?v=39m1b68te78', // Treino Certo
    'abducao-deitada-miniband': 'https://www.youtube.com/watch?v=GgGb_0ESHdw', // Treinadora Sarah Castro
    'rosca-martelo': 'https://www.youtube.com/watch?v=0qkQy8V2FC0', // Leandro Twin
    'triceps-frances-polia': 'https://www.youtube.com/watch?v=-j2irrajCLg', // Treinador Morin
    'triceps-coice': 'https://www.youtube.com/watch?v=PyKv23F-fVM', // Leandro Twin
    'roda-abdomen': 'https://www.youtube.com/watch?v=vRi105QOGKU', // Fit Nerdz
    'bicicleta-lenta': 'https://www.youtube.com/watch?v=oB6Hn_PaM9U', // Saúde na Rotina com Diego e Dafne
    'elevacao-pernas': 'https://www.youtube.com/watch?v=UL2xb7V9ELU', // Vida Ativa
    'prancha-lateral': 'https://www.youtube.com/watch?v=zt7PjySXWCw', // Guilherme Stellbrink I FisioPrev
  },

  treinos: [
    {
      id: 'A', nome: 'Glúteo e posterior', cardio: true,
      exercicios: [
        { series: 4, reps: [8, 12], descanso: 120,
          academia: { id: 'hip-thrust-smith', nome: 'Hip thrust no Smith', equip: 'smith', teste: 'só a barra do Smith (ou + 5 kg de cada lado)',
            dica: 'Escápulas apoiadas na borda do banco, pés na largura do quadril. Suba empurrando pelos calcanhares e trave o glúteo 1 s no topo, queixo para baixo. Desça controlando.',
            subs: ['Hip thrust com halter no banco', 'Ponte de glúteo no chão com halter'] },
          casa: { id: 'hip-thrust-halter-sofa', nome: 'Hip thrust com halter (costas no sofá)', equip: 'halter-ajustavel', reps: [10, 15], teste: 'halter ajustável em ~10–12 kg apoiado no quadril',
            dica: 'Costas apoiadas na borda do sofá, halter no quadril (com a toalha ou o colchonete por baixo). Suba pelos calcanhares e aperte o glúteo 2 s no topo.',
            subs: ['Ponte de glúteo no chão com halter', 'Hip thrust com mini band nos joelhos'] } },

        { series: 3, reps: [8, 12], descanso: 120,
          academia: { id: 'stiff-halteres', nome: 'Stiff com halteres', equip: 'halter', teste: '2 halteres de 6–8 kg',
            dica: 'Joelhos levemente dobrados. Leve o quadril para trás deslizando os halteres rente às pernas até sentir alongar atrás da coxa. Costas retas o tempo todo. Suba empurrando o quadril para a frente.',
            subs: ['Stiff no Smith', 'Stiff com kettlebell'] },
          casa: { id: 'stiff-halteres', nome: 'Stiff com halteres', equip: 'halter-ajustavel', teste: 'halteres de 6–8 kg (ou um halter seguro com as duas mãos)',
            dica: 'Joelhos levemente dobrados. Leve o quadril para trás deslizando os halteres rente às pernas até sentir alongar atrás da coxa. Costas retas o tempo todo.',
            subs: ['Stiff com uma perna só', 'Ponte com pés no sofá'] } },

        { series: 3, reps: [10, 15], descanso: 75,
          academia: { id: 'cadeira-flexora', nome: 'Cadeira flexora', equip: 'maquina', teste: '15–20 kg',
            dica: 'Rolo logo acima do calcanhar e joelho alinhado com o eixo da máquina. Dobre os joelhos, segure 1 s e volte devagar (3 s).',
            subs: ['Flexora em pé na polia com tornozeleira', 'Flexora deitada com caneleira'] },
          casa: { id: 'ponte-pes-sofa', nome: 'Ponte com pés no sofá', equip: 'corpo', semCarga: true,
            dica: 'Deitada no colchonete, calcanhares na borda do sofá, joelhos levemente dobrados. Suba o quadril puxando com os calcanhares (você sente atrás da coxa). Fica mais difícil com uma perna só.',
            subs: ['Ponte com uma perna só no sofá', 'Stiff com uma perna só'] } },

        { series: 3, reps: [12, 15], descanso: 60,
          academia: { id: 'cadeira-abdutora', nome: 'Cadeira abdutora', equip: 'maquina', teste: '20–25 kg',
            dica: 'Costas apoiadas. Abra as pernas com força, segure 1 s abertas e volte controlando, sem deixar as placas baterem.',
            subs: ['Abdução em pé na polia com tornozeleira', 'Abdução sentada com mini band'] },
          casa: { id: 'abducao-miniband-sentada', nome: 'Abdução sentada com mini band', equip: 'corpo', semCarga: true, reps: [15, 20],
            dica: 'Mini band logo acima dos joelhos, sentada na beira do sofá com o tronco um pouco inclinado à frente. Abra os joelhos e segure 1 s.',
            subs: ['Abdução deitada de lado com mini band', 'Caminhada lateral com mini band'] } }
      ]
    },

    {
      id: 'B', nome: 'Costas e bíceps', cardio: false,
      exercicios: [
        { series: 3, reps: [8, 12], descanso: 90,
          academia: { id: 'puxada-alta-fechada', nome: 'Puxada alta pegada fechada', equip: 'polia', teste: '20–25 kg',
            dica: 'Mãos na largura dos ombros (palmas para você ou neutras). Peito para cima, puxe a barra até o queixo levando os cotovelos para baixo e para trás. Volte devagar até esticar os braços.',
            subs: ['Puxada alta pegada aberta', 'Puxada com um braço na polia'] },
          casa: { id: 'remada-curvada-halteres', nome: 'Remada curvada com halteres', equip: 'halter-ajustavel', teste: 'halteres de 6–8 kg',
            dica: 'Tronco inclinado à frente (~45°), costas retas, joelhos levemente dobrados. Puxe os halteres em direção ao umbigo, cotovelos rentes ao corpo, e aperte as costas no final.',
            subs: ['Remada curvada com elástico pisando', 'Pullover com halter no chão'] } },

        { series: 3, reps: [10, 12], descanso: 90,
          academia: { id: 'remada-baixa', nome: 'Remada baixa sentada', equip: 'polia', teste: '20–25 kg',
            dica: 'Tronco firme e reto, sem balançar. Puxe o triângulo até a barriga levando os ombros para trás e para baixo. Estique os braços devagar sem curvar as costas.',
            subs: ['Remada em pé no crossover', 'Remada unilateral com halter'] },
          casa: { id: 'remada-elastico-sentada', nome: 'Remada sentada com elástico nos pés', equip: 'corpo', semCarga: true, reps: [12, 15],
            dica: 'Sentada no colchonete com as pernas esticadas, elástico passado pela sola dos pés. Puxe as alças até a barriga, cotovelos rentes, e aperte as escápulas. Para pesar mais, encurte o elástico.',
            subs: ['Remada curvada com elástico pisando', 'Remada curvada com halteres'] } },

        { series: 3, reps: [10, 12], descanso: 75, lado: 'cada lado',
          academia: { id: 'remada-unilateral-halter', nome: 'Remada unilateral com halter', equip: 'halter', teste: 'halter de 8–10 kg',
            dica: 'Joelho e mão do mesmo lado apoiados no banco, costas paralelas ao chão. Puxe o halter em direção ao quadril (não ao ombro) e desça alongando.',
            subs: ['Remada unilateral na polia baixa', 'Remada com kettlebell'] },
          casa: { id: 'remada-unilateral-halter', nome: 'Remada unilateral com halter (apoio no sofá)', equip: 'halter-ajustavel', teste: 'halter de 8 kg',
            dica: 'Joelho e mão do mesmo lado apoiados no sofá, costas paralelas ao chão. Puxe o halter em direção ao quadril e desça alongando.',
            subs: ['Remada curvada com halteres', 'Remada curvada com elástico pisando'] } },

        { series: 3, reps: [12, 15], descanso: 60,
          academia: { id: 'face-pull', nome: 'Face pull na polia (corda)', equip: 'polia', teste: '5–10 kg',
            dica: 'Polia na altura do rosto. Puxe a corda em direção à testa abrindo os cotovelos para os lados e girando as mãos para trás. É o exercício da postura: carga leve e controle.',
            subs: ['Crucifixo inverso no crossover', 'Crucifixo inverso com halteres'] },
          casa: { id: 'pull-apart-elastico', nome: 'Abrir o elástico na frente do peito', equip: 'corpo', semCarga: true, reps: [15, 20],
            dica: 'Braços esticados na frente do peito segurando o elástico. Abra os braços até o elástico encostar no peito, apertando as escápulas, e volte devagar.',
            subs: ['Crucifixo inverso curvada com halteres', 'Y e T deitada de bruços'] } },

        { series: 3, reps: [10, 12], descanso: 60,
          academia: { id: 'rosca-alternada', nome: 'Rosca alternada com halteres', equip: 'halter', teste: 'halteres de 4–5 kg',
            dica: 'Cotovelos colados no corpo, sem balançar o tronco. Suba girando a palma para cima e desça em 2–3 s.',
            subs: ['Rosca na polia com barra', 'Rosca martelo'] },
          casa: { id: 'rosca-alternada', nome: 'Rosca alternada com halteres', equip: 'halter-ajustavel', teste: 'halteres de 4–5 kg',
            dica: 'Cotovelos colados no corpo, sem balançar o tronco. Suba girando a palma para cima e desça em 2–3 s.',
            subs: ['Rosca com elástico pisando', 'Rosca martelo'] } },

        { series: 3, reps: [8, 12], descanso: 45, lado: 'cada lado',
          academia: { id: 'dead-bug', nome: 'Dead bug', equip: 'corpo', semCarga: true,
            dica: 'Deitada de barriga para cima, braços para o teto, joelhos a 90°. Cole a lombar no chão e estenda braço e perna opostos devagar, sem a lombar sair do chão.',
            subs: ['Abdominal na bola suíça', 'Elevação de pernas deitada'] },
          casa: { id: 'dead-bug', nome: 'Dead bug', equip: 'corpo', semCarga: true,
            dica: 'Deitada de barriga para cima, braços para o teto, joelhos a 90°. Cole a lombar no chão e estenda braço e perna opostos devagar, sem a lombar sair do chão.',
            subs: ['Elevação de pernas deitada', 'Bicicleta lenta'] } },

        { series: 3, reps: [30, 45], descanso: 45,
          academia: { id: 'prancha', nome: 'Prancha', equip: 'corpo', semCarga: true, tempo: true,
            dica: 'Antebraços no chão, cotovelos embaixo dos ombros, corpo reto da cabeça ao calcanhar. Contraia o abdômen e o glúteo; não deixe o quadril cair.',
            subs: ['Prancha na bola suíça', 'Prancha com toque no ombro'] },
          casa: { id: 'prancha', nome: 'Prancha', equip: 'corpo', semCarga: true, tempo: true,
            dica: 'Antebraços no chão, cotovelos embaixo dos ombros, corpo reto da cabeça ao calcanhar. Contraia o abdômen e o glúteo; não deixe o quadril cair.',
            subs: ['Prancha com toque no ombro', 'Prancha lateral'] } }
      ]
    },

    {
      id: 'C', nome: 'Glúteo e quadríceps', cardio: true,
      exercicios: [
        { series: 3, reps: [8, 12], descanso: 120,
          academia: { id: 'agachamento-smith', nome: 'Agachamento no Smith (pés à frente)', equip: 'smith', teste: 'só a barra do Smith',
            dica: 'Pés um passo à frente da barra, um pouco mais abertos que o quadril. Desça levando o quadril para trás até a coxa passar da linha do joelho e suba pelos calcanhares. Pés à frente = mais glúteo, menos frente da coxa.',
            subs: ['Agachamento goblet com halter', 'Agachamento sumô com kettlebell'] },
          casa: { id: 'agachamento-goblet', nome: 'Agachamento com halter no peito (goblet)', equip: 'halter-ajustavel', reps: [10, 15], teste: 'halter de 8–10 kg',
            dica: 'Segure o halter em pé, colado no peito. Pés um pouco mais abertos que o quadril; desça entre as pernas mantendo o peito aberto e suba pelos calcanhares.',
            subs: ['Agachamento sumô com halter', 'Agachamento com mini band nos joelhos'] } },

        { series: 3, reps: [8, 12], descanso: 90, lado: 'cada perna',
          academia: { id: 'afundo-bulgaro', nome: 'Afundo búlgaro com halteres', equip: 'halter', teste: 'halteres de 4–6 kg (ou sem peso na 1ª vez)',
            dica: 'Peito do pé de trás apoiado no banco, pé da frente bem à frente. Incline o tronco um pouco à frente e desça reto: assim o trabalho vai mais para o glúteo. Suba pelo calcanhar da frente.',
            subs: ['Afundo búlgaro no Smith', 'Afundo para trás com halteres'] },
          casa: { id: 'afundo-bulgaro', nome: 'Afundo búlgaro (pé de trás no sofá)', equip: 'halter-ajustavel', teste: 'sem peso na 1ª vez, depois halteres de 4–6 kg',
            dica: 'Peito do pé de trás apoiado no sofá, pé da frente bem à frente. Incline o tronco um pouco à frente e desça reto. Suba pelo calcanhar da frente.',
            subs: ['Afundo para trás com halteres', 'Subida no degrau'] } },

        { series: 2, reps: [12, 15], descanso: 60,
          academia: { id: 'cadeira-extensora', nome: 'Cadeira extensora', equip: 'maquina', teste: '15–20 kg',
            dica: 'Joelho alinhado com o eixo da máquina, rolo acima do tornozelo. Estique as pernas, segure 1 s e desça devagar. Aqui é manutenção: só 2 séries.',
            subs: ['Extensora com caneleira sentada', 'Afundo para trás com halteres'] },
          casa: { id: 'subida-degrau', nome: 'Subida no degrau', equip: 'halter-ajustavel', reps: [10, 12], lado: 'cada perna', teste: 'sem peso na 1ª vez',
            dica: 'Pé inteiro no degrau, tronco levemente à frente. Suba empurrando pelo calcanhar da perna de cima, sem dar impulso com a de baixo, e desça devagar.',
            subs: ['Afundo para trás', 'Agachamento com halter no peito (goblet)'] } },

        { series: 3, reps: [12, 15], descanso: 45, lado: 'cada perna',
          academia: { id: 'coice-polia', nome: 'Coice de glúteo na polia (tornozeleira)', equip: 'polia', teste: '5 kg',
            dica: 'Tornozeleira presa na polia baixa, mãos apoiadas na máquina, tronco levemente inclinado. Leve a perna para trás e para cima sem arquear a lombar; aperte o glúteo no topo.',
            subs: ['Coice com caneleira em quatro apoios', 'Abdução em pé na polia'] },
          casa: { id: 'coice-miniband', nome: 'Coice de quatro apoios com mini band', equip: 'corpo', semCarga: true, reps: [15, 20],
            dica: 'De quatro no colchonete, mini band nos pés (ou acima dos joelhos). Empurre o calcanhar para o teto com o joelho dobrado, sem girar o quadril.',
            subs: ['Coice com halter atrás do joelho', 'Abdução de quatro apoios (hidrante)'] } }
      ]
    },

    {
      id: 'D', nome: 'Ombro, peito e tríceps', cardio: false,
      exercicios: [
        { series: 3, reps: [8, 12], descanso: 90,
          academia: { id: 'chest-press', nome: 'Chest press (supino sentado na máquina)', equip: 'maquina', teste: '15–20 kg',
            dica: 'Banco ajustado para as pegadas ficarem na altura do meio do peito. Escápulas encostadas, empurre sem travar os cotovelos e volte devagar.',
            subs: ['Supino com halteres no banco', 'Supino inclinado com halteres'] },
          casa: { id: 'flexao', nome: 'Flexão de braço (inclinada no sofá ou de joelhos)', equip: 'corpo', semCarga: true, reps: [8, 15],
            dica: 'Mãos um pouco mais abertas que os ombros, corpo reto. Desça o peito até perto do apoio e empurre. Quando fizer 15 fácil, passe para uma versão mais baixa (sofá → de joelhos no chão → completa).',
            subs: ['Supino no chão com halteres', 'Flexão de joelhos'] } },

        { series: 3, reps: [8, 12], descanso: 90,
          academia: { id: 'desenvolvimento-halteres', nome: 'Desenvolvimento com halteres sentada', equip: 'halter', teste: 'halteres de 4–6 kg',
            dica: 'Banco quase reto (~80°), halteres na altura das orelhas. Empurre para cima sem bater um no outro e desça até a altura do queixo, controlando.',
            subs: ['Desenvolvimento no Smith', 'Desenvolvimento Arnold'] },
          casa: { id: 'desenvolvimento-halteres', nome: 'Desenvolvimento com halteres sentada', equip: 'halter-ajustavel', teste: 'halteres de 4–6 kg',
            dica: 'Sentada no sofá ou numa cadeira firme, costas retas, halteres na altura das orelhas. Empurre para cima e desça até a altura do queixo, controlando.',
            subs: ['Desenvolvimento Arnold', 'Desenvolvimento em pé com elástico pisando'] } },

        { series: 3, reps: [12, 15], descanso: 60,
          academia: { id: 'elevacao-lateral', nome: 'Elevação lateral com halteres', equip: 'halter', teste: 'halteres de 2–3 kg',
            dica: 'Cotovelos levemente dobrados. Suba os braços para os lados até a altura dos ombros (não mais), como se derramasse uma jarra. Desça em 2–3 s, sem balanço.',
            subs: ['Elevação lateral na polia', 'Elevação lateral com elástico'] },
          casa: { id: 'elevacao-lateral', nome: 'Elevação lateral com halteres', equip: 'halter-ajustavel', teste: 'halteres de 2–3 kg',
            dica: 'Cotovelos levemente dobrados. Suba os braços para os lados até a altura dos ombros (não mais). Desça em 2–3 s, sem balanço.',
            subs: ['Elevação lateral com elástico pisando', 'Elevação lateral sentada'] } },

        { series: 3, reps: [12, 15], descanso: 60,
          academia: { id: 'crucifixo-inverso-crossover', nome: 'Crucifixo inverso no crossover', equip: 'polia', teste: '2,5–5 kg',
            dica: 'Polias na altura dos ombros, cabos cruzados (a mão direita pega o cabo da esquerda). Abra os braços para trás com os cotovelos quase esticados, apertando atrás do ombro.',
            subs: ['Crucifixo inverso com halteres', 'Face pull na polia (corda)'] },
          casa: { id: 'crucifixo-inverso-halteres', nome: 'Crucifixo inverso curvada com halteres', equip: 'halter-ajustavel', teste: 'halteres de 2–3 kg',
            dica: 'Tronco inclinado à frente, costas retas. Abra os braços para os lados como asas, cotovelos levemente dobrados, e aperte atrás do ombro.',
            subs: ['Abrir o elástico na frente do peito', 'Y e T deitada de bruços'] } },

        { series: 3, reps: [10, 15], descanso: 60,
          academia: { id: 'triceps-corda', nome: 'Tríceps na polia com corda', equip: 'polia', teste: '10 kg',
            dica: 'Cotovelos colados no corpo e parados. Empurre a corda para baixo abrindo as pontas no final e volte até 90°.',
            subs: ['Tríceps na polia com barra', 'Tríceps francês com halter'] },
          casa: { id: 'triceps-frances', nome: 'Tríceps francês com halter', equip: 'halter-ajustavel', teste: 'halter de 4–6 kg',
            dica: 'Sentada, halter seguro com as duas mãos atrás da cabeça. Estique os braços para cima com os cotovelos apontando para a frente e desça devagar.',
            subs: ['Tríceps coice com halter', 'Tríceps no sofá (mergulho)'] } },

        { series: 3, reps: [10, 12], descanso: 45, lado: 'cada lado',
          academia: { id: 'pallof-press', nome: 'Pallof press na polia', equip: 'polia', teste: '5–10 kg',
            dica: 'De lado para a polia (altura do peito), segure a alça no peito e estique os braços à frente sem deixar o tronco girar. Trabalha a cintura sem engrossar.',
            subs: ['Prancha lateral', 'Prancha com toque no ombro'] },
          casa: { id: 'prancha-toque-ombro', nome: 'Prancha com toque no ombro', equip: 'corpo', semCarga: true, reps: [8, 12],
            dica: 'Prancha alta (braços esticados), pés um pouco afastados. Toque o ombro oposto alternando, sem o quadril balançar.',
            subs: ['Dead bug', 'Prancha lateral'] } }
      ]
    },

    {
      id: 'E', nome: 'Glúteo, costas e abdômen', cardio: true,
      exercicios: [
        { series: 3, reps: [10, 15], descanso: 90,
          academia: { id: 'hip-thrust-pausa-smith', nome: 'Hip thrust com pausa no Smith', equip: 'smith', teste: '~70% da carga do hip thrust do treino A',
            dica: 'Igual ao hip thrust, mas segure 2 s lá em cima apertando o glúteo em toda repetição. Carga mais leve que no treino A.',
            subs: ['Hip thrust com uma perna no banco', 'Ponte de glúteo com mini band'] },
          casa: { id: 'hip-thrust-unilateral', nome: 'Hip thrust com uma perna (costas no sofá)', equip: 'halter-ajustavel', lado: 'cada perna', teste: 'sem peso na 1ª vez',
            dica: 'Costas no sofá, um pé no chão e a outra perna dobrada no ar. Suba pelo calcanhar do pé de apoio e segure 1 s. Quando ficar fácil, apoie o halter no quadril.',
            subs: ['Hip thrust com halter (costas no sofá)', 'Ponte com uma perna no chão'] } },

        { series: 3, reps: [10, 12], descanso: 75,
          academia: { id: 'remada-crossover', nome: 'Remada em pé no crossover', equip: 'polia', teste: '10 kg de cada lado',
            dica: 'Polias na altura do peito, uma alça em cada mão, palmas viradas uma para a outra. Um passo para trás, joelhos soltos; puxe as alças até a lateral do tronco apertando as escápulas.',
            subs: ['Remada baixa sentada', 'Remada unilateral com halter'] },
          casa: { id: 'remada-curvada-elastico', nome: 'Remada curvada com elástico pisando', equip: 'corpo', semCarga: true, reps: [12, 15],
            dica: 'Pise no meio do elástico com os pés na largura do quadril, incline o tronco à frente (~45°) com as costas retas e puxe as alças até a barriga.',
            subs: ['Remada curvada com halteres', 'Remada sentada com elástico nos pés'] } },

        { series: 3, reps: [12, 15], descanso: 60,
          academia: { id: 'abdutora-tronco-frente', nome: 'Cadeira abdutora com tronco à frente', equip: 'maquina', teste: 'mesma carga da abdutora do treino A',
            dica: 'Na mesma abdutora, solte as costas do encosto e incline o tronco à frente segurando nas laterais. Pega mais a parte de cima do glúteo.',
            subs: ['Cadeira abdutora', 'Abdução em pé na polia com tornozeleira'] },
          casa: { id: 'abducao-deitada-miniband', nome: 'Abdução deitada de lado com mini band', equip: 'corpo', semCarga: true, reps: [15, 20], lado: 'cada perna',
            dica: 'Deitada de lado, mini band acima dos joelhos, perna de baixo dobrada. Suba a perna de cima esticada e um pouco para trás, sem girar o pé para cima.',
            subs: ['Abdução sentada com mini band', 'Caminhada lateral com mini band'] } },

        { series: 2, reps: [10, 15], descanso: 45,
          academia: { id: 'rosca-martelo', nome: 'Rosca martelo (alterne com o tríceps)', equip: 'halter', teste: 'halteres de 4–6 kg',
            dica: 'Palmas viradas uma para a outra, cotovelos colados. Faça uma série de rosca e logo em seguida uma de tríceps; descanse depois das duas.',
            subs: ['Rosca alternada com halteres', 'Rosca na polia com corda'] },
          casa: { id: 'rosca-martelo', nome: 'Rosca martelo (alterne com o tríceps)', equip: 'halter-ajustavel', teste: 'halteres de 4–6 kg',
            dica: 'Palmas viradas uma para a outra, cotovelos colados. Faça uma série de rosca e logo em seguida uma de tríceps; descanse depois das duas.',
            subs: ['Rosca alternada com halteres', 'Rosca com elástico pisando'] } },

        { series: 2, reps: [10, 15], descanso: 45,
          academia: { id: 'triceps-frances-polia', nome: 'Tríceps francês na polia (corda)', equip: 'polia', teste: '5–10 kg',
            dica: 'De costas para a polia, corda atrás da cabeça, cotovelos apontando para a frente. Estique os braços à frente e para cima e volte devagar.',
            subs: ['Tríceps na polia com corda', 'Tríceps francês com halter'] },
          casa: { id: 'triceps-coice', nome: 'Tríceps coice com halter', equip: 'halter-ajustavel', lado: 'cada braço', teste: 'halter de 3–4 kg',
            dica: 'Tronco inclinado à frente, cotovelo colado no corpo e parado. Estique o braço para trás e volte devagar.',
            subs: ['Tríceps francês com halter', 'Tríceps no sofá (mergulho)'] } },

        { series: 3, reps: [6, 10], descanso: 45,
          academia: { id: 'roda-abdomen', nome: 'Roda de abdômen (de joelhos)', equip: 'corpo', semCarga: true,
            dica: 'De joelhos no colchonete, abdômen contraído. Role à frente só até onde conseguir sem a lombar afundar e volte puxando com o abdômen. Aumente a distância aos poucos.',
            subs: ['Prancha com alcance à frente', 'Abdominal na bola suíça'] },
          casa: { id: 'bicicleta-lenta', nome: 'Bicicleta lenta', equip: 'corpo', semCarga: true, reps: [10, 15], lado: 'cada lado',
            dica: 'Lombar colada no chão, mãos atrás da cabeça sem puxar o pescoço. Leve o cotovelo em direção ao joelho oposto girando o tronco, devagar (2 s por lado).',
            subs: ['Dead bug', 'Prancha com alcance à frente'] } },

        { series: 3, reps: [10, 15], descanso: 45,
          academia: { id: 'elevacao-pernas', nome: 'Elevação de pernas deitada', equip: 'corpo', semCarga: true,
            dica: 'Deitada, mãos embaixo do quadril, pernas esticadas (ou levemente dobradas). Suba as pernas até 90° e desça devagar sem a lombar sair do chão.',
            subs: ['Elevação de joelhos com a bola suíça', 'Dead bug'] },
          casa: { id: 'elevacao-pernas', nome: 'Elevação de pernas deitada', equip: 'corpo', semCarga: true,
            dica: 'Deitada, mãos embaixo do quadril, pernas esticadas (ou levemente dobradas). Suba as pernas até 90° e desça devagar sem a lombar sair do chão.',
            subs: ['Dead bug', 'Bicicleta lenta'] } },

        { series: 2, reps: [20, 40], descanso: 30, lado: 'cada lado',
          academia: { id: 'prancha-lateral', nome: 'Prancha lateral', equip: 'corpo', semCarga: true, tempo: true,
            dica: 'Apoiada no antebraço, cotovelo embaixo do ombro, corpo reto de lado. Suba o quadril e mantenha sem deixá-lo cair.',
            subs: ['Prancha lateral com joelho apoiado', 'Pallof press na polia'] },
          casa: { id: 'prancha-lateral', nome: 'Prancha lateral', equip: 'corpo', semCarga: true, tempo: true,
            dica: 'Apoiada no antebraço, cotovelo embaixo do ombro, corpo reto de lado. Suba o quadril e mantenha sem deixá-lo cair.',
            subs: ['Prancha lateral com joelho apoiado', 'Prancha com toque no ombro'] } }
      ]
    }
  ]
};
