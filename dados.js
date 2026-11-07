/* Platafarm v1 — dados de EXEMPLO (fictícios) para o protótipo */
window.PF = window.PF || {};

PF.corretores = [
  { id: 'c1', nome: 'Ricardo Menezes', creci: 'CRECI-MG 41.208', regiao: 'Triângulo Mineiro', fazendas: 14, vendas12m: 6, nota: 4.9, foto: 'RM' },
  { id: 'c2', nome: 'Helena Borges', creci: 'CRECI-MT 9.871', regiao: 'Médio-Norte do MT', fazendas: 22, vendas12m: 9, nota: 4.8, foto: 'HB' },
  { id: 'c3', nome: 'Paulo Guimarães', creci: 'CRECI-GO 18.552', regiao: 'Sudoeste Goiano e Matopiba', fazendas: 11, vendas12m: 4, nota: 4.7, foto: 'PG' }
];

// precoRegiao = preço médio por hectare da região (exemplo), para comparar
PF.fazendas = [
  { id: 'f1', titulo: 'Fazenda Santa Luzia', tipo: 'Fazenda', cidade: 'Sorriso', uf: 'MT', ha: 1575, preco: 47250000, precoRegiao: 33500, lat: -12.62, lng: -55.83,
    fotos: ['soja', 'silos', 'pista', 'sede'], selo: 'certificada', aptidao: 'Agricultura', cultura: 'Soja e milho safrinha', bioma: 'Cerrado', altitude: 380, chuva: 2000,
    abertaHa: 1180, reservaHa: 395, cidadeKm: 38, terraKm: 12, corretor: 'c2', destaque: true,
    opcionais: ['Luz', 'Internet', 'Silo', 'Barracão de máquinas', 'Casa sede', 'Casa de funcionário (3)', 'Pista de pouso', 'Poço artesiano'],
    docs: { ITR: 'ok', CCIR: 'ok', CAR: 'ok', Geo: 'ok', Matrícula: 'ok' },
    desc: 'Área de lavoura consolidada, 100% mecanizável, solo corrigido há 8 safras. Média de 64 sc/ha de soja nas últimas 3 safras. Silo de 120 mil sacas e pista de pouso de 1.100 m.' },
  { id: 'f2', titulo: 'Fazenda Boa Vista do Rio Grande', tipo: 'Fazenda', cidade: 'Uberaba', uf: 'MG', ha: 420, preco: 16800000, precoRegiao: 43000, lat: -19.60, lng: -47.83,
    fotos: ['pasto', 'curral', 'represa', 'sede'], selo: 'certificada', aptidao: 'Pecuária', cultura: 'Pastagem de braquiária', bioma: 'Cerrado', altitude: 760, chuva: 1550,
    abertaHa: 330, reservaHa: 90, cidadeKm: 22, terraKm: 6, corretor: 'c1', destaque: true,
    opcionais: ['Luz', 'Represa (3)', 'Curral', 'Cocheira', 'Casa sede', 'Casa de funcionário (2)', 'Divisões de pasto', 'Confinamento'],
    docs: { ITR: 'ok', CCIR: 'vencendo', CAR: 'ok', Geo: 'ok', Matrícula: 'ok' },
    desc: 'Pecuária de cria e recria, 28 piquetes com água em todos. Curral coberto com balança e tronco. Confinamento para 600 cabeças. Asfalto até 6 km da sede.' },
  { id: 'f3', titulo: 'Fazenda Cachoeira Alta', tipo: 'Fazenda', cidade: 'Rio Verde', uf: 'GO', ha: 880, preco: 33440000, precoRegiao: 41000, lat: -17.92, lng: -51.02,
    fotos: ['milho', 'soja', 'silos'], selo: null, aptidao: 'Agricultura', cultura: 'Soja, milho e sorgo', bioma: 'Cerrado', altitude: 820, chuva: 1700,
    abertaHa: 700, reservaHa: 180, cidadeKm: 31, terraKm: 9, corretor: 'c3', urgente: true,
    opcionais: ['Luz', 'Internet', 'Silo', 'Barracão de máquinas', 'Casa sede', 'Poço artesiano'],
    docs: { ITR: 'ok', CCIR: 'ok', CAR: 'ok', Geo: 'faltando', Matrícula: 'ok' },
    desc: 'Lavoura em plena produção no polo de Rio Verde, a 31 km de duas tradings. Venda por motivo de inventário, aceita parte em sacas.' },
  { id: 'f4', titulo: 'Sítio Recanto do Café', tipo: 'Sítio', cidade: 'Três Pontas', uf: 'MG', ha: 160, preco: 11200000, precoRegiao: 76000, lat: -21.40, lng: -45.54,
    fotos: ['cafe', 'sede', 'represa'], selo: 'certificada', aptidao: 'Agricultura', cultura: 'Café arábica', bioma: 'Mata Atlântica', altitude: 920, chuva: 1600,
    abertaHa: 118, reservaHa: 42, cidadeKm: 9, terraKm: 3, corretor: 'c1',
    opcionais: ['Luz', 'Internet', 'Terreiro', 'Tulha', 'Casa sede', 'Casa de funcionário (4)', 'Represa'],
    docs: { ITR: 'ok', CCIR: 'ok', CAR: 'ok', Geo: 'ok', Matrícula: 'ok' },
    desc: '420 mil pés de café arábica, 60% irrigado por gotejamento. Produtividade média de 38 sc/ha. Terreiro de cimento e secadores.' },
  { id: 'f5', titulo: 'Fazenda Primavera', tipo: 'Fazenda', cidade: 'Lucas do Rio Verde', uf: 'MT', ha: 412, preco: 12360000, precoRegiao: 34000, lat: -13.08, lng: -56.02,
    fotos: ['soja', 'milho'], selo: null, aptidao: 'Agricultura', cultura: 'Soja e milho', bioma: 'Cerrado', altitude: 390, chuva: 2100,
    abertaHa: 330, reservaHa: 82, cidadeKm: 18, terraKm: 5, corretor: 'c2', urgente: true,
    opcionais: ['Luz', 'Barracão de máquinas', 'Casa de funcionário (1)'],
    docs: { ITR: 'ok', CCIR: 'ok', CAR: 'ok', Geo: 'ok', Matrícula: 'ok' },
    desc: 'Área pronta para plantio, 12% abaixo do preço médio da região. Proprietário quer fechar antes do plantio.' },
  { id: 'f6', titulo: 'Fazenda São Bento', tipo: 'Fazenda', cidade: 'Prata', uf: 'MG', ha: 186, preco: 5900000, precoRegiao: 33000, lat: -19.33, lng: -48.88,
    fotos: ['sede', 'pasto', 'curral'], selo: 'certificada', aptidao: 'Pecuária', cultura: 'Pastagem', bioma: 'Cerrado', altitude: 640, chuva: 1450,
    abertaHa: 150, reservaHa: 36, cidadeKm: 14, terraKm: 8, corretor: 'c1',
    opcionais: ['Luz', 'Curral', 'Casa sede', 'Represa (1)', 'Divisões de pasto'],
    docs: { ITR: 'ok', CCIR: 'ok', CAR: 'ok', Geo: 'ok', Matrícula: 'ok' },
    desc: 'Casa sede reformada com varanda, 4 quartos. Pasto formado, curral de aroeira, represa com peixe.' },
  { id: 'f7', titulo: 'Fazenda Chapadão do Oeste', tipo: 'Fazenda', cidade: 'Luís Eduardo Magalhães', uf: 'BA', ha: 2400, preco: 60000000, precoRegiao: 27000, lat: -12.10, lng: -45.98,
    fotos: ['soja', 'cerrado', 'silos'], selo: null, aptidao: 'Agricultura', cultura: 'Soja, milho e algodão', bioma: 'Cerrado', altitude: 760, chuva: 1300,
    abertaHa: 1700, reservaHa: 700, cidadeKm: 42, terraKm: 18, corretor: 'c3', sigilosa: true,
    opcionais: ['Luz', 'Silo', 'Barracão de máquinas', 'Casa sede', 'Casa de funcionário (6)', 'Poço artesiano'],
    docs: { ITR: 'ok', CCIR: 'ok', CAR: 'ok', Geo: 'ok', Matrícula: 'ok' },
    desc: 'Venda sigilosa: detalhes liberados só para comprador verificado.' },
  { id: 'f8', titulo: 'Fazenda Eucaliptal Rio Pardo', tipo: 'Fazenda', cidade: 'Ribas do Rio Pardo', uf: 'MS', ha: 1300, preco: 22100000, precoRegiao: 19500, lat: -20.52, lng: -53.62,
    fotos: ['eucalipto', 'cerrado'], selo: null, aptidao: 'Silvicultura', cultura: 'Eucalipto (5 anos)', bioma: 'Cerrado', altitude: 390, chuva: 1400,
    abertaHa: 1000, reservaHa: 300, cidadeKm: 55, terraKm: 22, corretor: 'c3',
    opcionais: ['Luz', 'Casa de funcionário (2)', 'Barracão de máquinas'],
    docs: { ITR: 'ok', CCIR: 'ok', CAR: 'vencendo', Geo: 'ok', Matrícula: 'ok' },
    desc: 'Floresta de eucalipto com 5 anos, pronta para o primeiro corte em 2 anos. Próxima à nova fábrica de celulose.' },
  { id: 'f9', titulo: 'Reserva Serra Dourada', tipo: 'Reserva', cidade: 'Porto Nacional', uf: 'TO', ha: 950, preco: 4750000, precoRegiao: 6000, lat: -10.55, lng: -48.22,
    fotos: ['cerrado', 'represa'], selo: null, aptidao: 'Reserva legal', cultura: 'Mata nativa', bioma: 'Cerrado', altitude: 300, chuva: 1700,
    abertaHa: 0, reservaHa: 950, cidadeKm: 35, terraKm: 30, corretor: 'c3',
    opcionais: ['Rio'],
    docs: { ITR: 'ok', CCIR: 'ok', CAR: 'ok', Geo: 'ok', Matrícula: 'ok' },
    desc: 'Área de mata nativa para compensação de reserva legal de outras propriedades do bioma Cerrado.' },
  { id: 'f10', titulo: 'Chácara Bela Vista', tipo: 'Chácara', cidade: 'Uberaba', uf: 'MG', ha: 6, preco: 1350000, precoRegiao: 190000, lat: -19.73, lng: -47.90,
    fotos: ['chacara', 'represa'], selo: null, aptidao: 'Lazer', cultura: 'Pomar', bioma: 'Cerrado', altitude: 790, chuva: 1550,
    abertaHa: 6, reservaHa: 0, cidadeKm: 7, terraKm: 2, corretor: 'c1',
    opcionais: ['Luz', 'Internet', 'Casa sede', 'Piscina', 'Pomar', 'Poço artesiano'],
    docs: { ITR: 'ok', CCIR: 'ok', CAR: 'ok', Geo: 'ok', Matrícula: 'ok' },
    desc: 'Chácara de lazer a 7 km da cidade, casa com 3 suítes, piscina, área gourmet e pomar formado.' },
  { id: 'f11', titulo: 'Fazenda Céu Aberto', tipo: 'Fazenda', cidade: 'Nova Mutum', uf: 'MT', ha: 3200, preco: 105600000, precoRegiao: 34000, lat: -13.86, lng: -56.17,
    fotos: ['pista', 'soja', 'silos', 'sede'], selo: 'certificada', aptidao: 'Agricultura', cultura: 'Soja, milho e algodão', bioma: 'Cerrado', altitude: 460, chuva: 2100,
    abertaHa: 2560, reservaHa: 640, cidadeKm: 48, terraKm: 15, corretor: 'c2', destaque: true,
    opcionais: ['Luz', 'Internet', 'Silo', 'Barracão de máquinas', 'Casa sede', 'Casa de funcionário (8)', 'Pista de pouso', 'Hangar', 'Poço artesiano'],
    docs: { ITR: 'ok', CCIR: 'ok', CAR: 'ok', Geo: 'ok', Matrícula: 'ok' },
    desc: 'Complexo agrícola completo: pista homologada com hangar, armazém de 300 mil sacas, vila de funcionários. Algodão no sistema de segunda safra.' },
  { id: 'f12', titulo: 'Gleba Uberlândia Sul', tipo: 'Expansão urbana', cidade: 'Uberlândia', uf: 'MG', ha: 48, preco: 19200000, precoRegiao: 380000, lat: -18.99, lng: -48.21,
    fotos: ['cerrado', 'pasto'], selo: null, aptidao: 'Loteamento', cultura: 'Pasto', bioma: 'Cerrado', altitude: 870, chuva: 1500,
    abertaHa: 48, reservaHa: 0, cidadeKm: 1, terraKm: 0, corretor: 'c1',
    opcionais: ['Luz', 'Água da concessionária'],
    docs: { ITR: 'ok', CCIR: 'ok', CAR: 'ok', Geo: 'ok', Matrícula: 'ok' },
    desc: 'Gleba no vetor de crescimento sul da cidade, já dentro do perímetro urbano previsto no plano diretor.' }
];

PF.gado = [
  { id: 'g1', categoria: 'Bezerro', raca: 'Nelore', sexo: 'Macho', idade: '7–8 meses', qtde: 120, peso: '210 kg', registro: 'Não', precoCab: 2350, cidade: 'Uberaba', uf: 'MG', km: 18, foto: 'bezerros' },
  { id: 'g2', categoria: 'Boi gordo', raca: 'Nelore', sexo: 'Macho', idade: '30 meses', qtde: 80, peso: '19,5 @', registro: 'Não', precoCab: 6240, cidade: 'Prata', uf: 'MG', km: 12, foto: 'pasto' },
  { id: 'g3', categoria: 'Vaca prenhe', raca: 'Nelore', sexo: 'Fêmea', idade: '4–6 anos', qtde: 45, peso: '450 kg', registro: 'Não', precoCab: 4100, cidade: 'Rio Verde', uf: 'GO', km: 25, foto: 'curral' },
  { id: 'g4', categoria: 'Touro', raca: 'Nelore PO', sexo: 'Macho', idade: '3 anos', qtde: 6, peso: '820 kg', registro: 'Sim (ABCZ)', precoCab: 28000, cidade: 'Uberaba', uf: 'MG', km: 10, foto: 'boi' },
  { id: 'g5', categoria: 'Novilha', raca: 'Angus x Nelore', sexo: 'Fêmea', idade: '14 meses', qtde: 60, peso: '300 kg', registro: 'Não', precoCab: 3300, cidade: 'Sorriso', uf: 'MT', km: 40, foto: 'bezerros' },
  { id: 'g6', categoria: 'Garrote', raca: 'Nelore', sexo: 'Macho', idade: '15 meses', qtde: 150, peso: '330 kg', registro: 'Não', precoCab: 3550, cidade: 'Lucas do Rio Verde', uf: 'MT', km: 22, foto: 'pasto' }
];
PF.arroba = { valor: 320, praca: 'Triângulo Mineiro (exemplo)' };

PF.arrendamentos = [
  { id: 'a1', tipo: 'Pecuária', cidade: 'Uberaba', uf: 'MG', ha: 250, cabecas: 300, pastagem: 'Braquiária', valor: '1,2 @/cab/mês', match: 'Pedido de arrendatário em Conceição das Alagoas: 280 cabeças' },
  { id: 'a2', tipo: 'Agricultura', cidade: 'Rio Verde', uf: 'GO', ha: 600, cultura: 'Soja', valor: '12 sc soja/ha/ano', match: 'Pedido de arrendatário: 500 a 800 ha para soja no sudoeste goiano' },
  { id: 'a3', tipo: 'Agricultura', cidade: 'Sorriso', uf: 'MT', ha: 1200, cultura: 'Soja e milho', valor: '10 sc soja/ha/ano', match: null }
];

PF.chat = [
  { de: 'eu', txt: 'Boa tarde, Helena. A Santa Luzia ainda está disponível?', h: '14:02' },
  { de: 'ela', txt: 'Boa tarde! Está sim. Já tem 2 visitas marcadas para semana que vem.', h: '14:05' },
  { de: 'ela', txt: 'O proprietário aceita 30% de entrada e o resto em 3 safras. Quer que eu mande o laudo do solo?', h: '14:05' },
  { de: 'eu', txt: 'Manda sim. E dá para visitar na quinta?', h: '14:09' },
  { de: 'ela', txt: 'Quinta às 9h, saindo de Sorriso. Vou confirmar com o gerente da fazenda.', h: '14:11' }
];

PF.interessados = [
  { nome: 'Marcos A.', fazenda: 'f1', quando: 'hoje', resumo: 'Produtor de Primavera do Leste. Quer expandir 1.000 a 2.000 ha. Tem crédito pré-aprovado e pede visita em até 15 dias.', quente: true },
  { nome: 'Grupo Aliança Agro', fazenda: 'f11', quando: 'ontem', resumo: 'Fundo de terras. Pediu matrícula, CAR e histórico de produtividade. Decide por comitê em 30 dias.', quente: true },
  { nome: 'Juliana R.', fazenda: 'f5', quando: '3 dias', resumo: 'Primeira compra. Ainda comparando com fazendas em Sinop. Sem pressa.', quente: false }
];
