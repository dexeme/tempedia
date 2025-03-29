const input = document.getElementById("temtemInput");
const infoDiv = document.getElementById("temtemInfo");

const typeColors = {
  Neutral: "#A8A77A",
  Fire: "#EE8130",
  Water: "#6390F0",
  Nature: "#7AC74C",
  Electric: "#F7D02C",
  Earth: "#E2BF65",
  Mental: "#A97FFA",
  Wind: "#A8B820",
  Digital: "#6F6F6F",
  Melee: "#C22E28",
  Crystal: "#B6A136",
  Toxic: "#A33EA1"
};

const typeEffectiveness = {
  Neutral: { Mental: 2 },
  Fire: { Nature: 2, Crystal: 2, Fire: 0.5, Water: 0.5, Earth: 0.5 },
  Water: { Fire: 2, Earth: 2, Digital: 2, Water: 0.5, Nature: 0.5, Toxic: 0.5 },
  Nature: { Water: 2, Earth: 2, Fire: 0.5, Nature: 0.5, Toxic: 0.5 },
  Electric: { Water: 2, Mental: 2, Wind: 2, Digital: 2, Nature: 0.5, Electric: 0.5, Earth: 0.5, Crystal: 0.5 },
  Earth: { Fire: 2, Electric: 2, Crystal: 2, Water: 0.5, Nature: 0.5, Wind: 0.5, Melee: 0.5 },
  Mental: { Neutral: 2, Melee: 2, Crystal: 0.5 },
  Wind: { Toxic: 2, Electric: 0.5, Wind: 0.5 },
  Digital: { Mental: 2, Melee: 2, Digital: 2, Water: 0.5, Electric: 0.5 },
  Melee: { Earth: 2, Crystal: 2, Mental: 0.5, Melee: 0.5 },
  Crystal: { Electric: 2, Mental: 2, Fire: 0.5, Earth: 0.5, Melee: 0.5 },
  Toxic: { Water: 2, Nature: 2, Earth: 0.5, Digital: 0.5, Crystal: 0.5, Toxic: 0.5 }
};

input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    buscarTemtem(input.value.trim());
  }
});

async function buscarTemtem(nome) {
  if (!nome) return;

  infoDiv.innerHTML = "Buscando...";
  try {
    const response = await fetch(`http://temtem-api.mael.tech/api/temtems?names=${encodeURIComponent(nome)}`);
    const data = await response.json();

    if (data.length === 0) {
      infoDiv.innerHTML = `<p class="error">Temtem "${nome}" não encontrado.</p>`;
      return;
    }

    const temtem = data[0];
    const imageUrl = temtem.icon ? `http://temtem-api.mael.tech${temtem.icon}` : 'http://via.placeholder.com/100';

    const fraquezas = calcularFraquezasResistencias(temtem.types);
    const forcas = calcularForcasOfensivas(temtem.types);

    const html = `
      <div class="temtem-card">
        <img src="${imageUrl}" alt="${temtem.name}" />
        <h2>${temtem.name}</h2>
        <div class="types">
          ${temtem.types.map(tipo => `<button class="type-button" style="background:${typeColors[tipo] || '#ccc'}">${tipo}</button>`).join(' ')}
        </div>
        <p>${temtem.gameDescription}</p>
        <div class="weaknesses">
          <h3>Weakness chart:</h3>
          ${renderTipoTabelado(fraquezas)}
        </div>
        <div class="weaknesses">
          <h3>Strong Against:</h3>
          ${renderTipoTabelado(forcas)}
        </div>
        <div class="stats">
          <h3>Stats Base:</h3>
          ${Object.entries(temtem.stats).map(([key, value]) => `
            <div class="stat"><strong>${key.toUpperCase()}</strong>: ${value}</div>
          `).join('')}
        </div>
      </div>
    `;

    infoDiv.innerHTML = html;

  } catch (error) {
    console.error(error);
    infoDiv.innerHTML = `<p class="error">Erro ao buscar dados da API.</p>`;
  }
}

// Contra quem o Temtem é fraco (defensivamente)
function calcularFraquezasResistencias(tipos) {
  const effectiveness = {};
  Object.keys(typeColors).forEach(tipo => effectiveness[tipo] = 1);

  // Cada tipo ATACANDO este Temtem
  Object.keys(typeEffectiveness).forEach(atacante => {
    tipos.forEach(defensor => {
      const mult = typeEffectiveness[atacante]?.[defensor];
      if (mult) effectiveness[atacante] *= mult;
    });
  });

  return categorizarMultiplicadores(effectiveness);
}

// Contra quem o Temtem é forte (ofensivamente)
function calcularForcasOfensivas(tipos) {
  const effectiveness = {};
  Object.keys(typeColors).forEach(tipo => effectiveness[tipo] = 1);

  tipos.forEach(atacante => {
    const tabela = typeEffectiveness[atacante];
    if (tabela) {
      for (const [defensor, mult] of Object.entries(tabela)) {
        effectiveness[defensor] *= mult;
      }
    }
  });

  return categorizarMultiplicadores(effectiveness);
}

// Organiza os multiplicadores em categorias
function categorizarMultiplicadores(effectiveness) {
  const result = {
    '4x': [],
    '2x': [],
    '1x': [],
    '1/2x': [],
    '1/4x': []
  };

  for (const [tipo, mult] of Object.entries(effectiveness)) {
    if (mult === 4) result['4x'].push(tipo);
    else if (mult === 2) result['2x'].push(tipo);
    else if (mult === 1) result['1x'].push(tipo);
    else if (mult === 0.5) result['1/2x'].push(tipo);
    else if (mult === 0.25) result['1/4x'].push(tipo);
  }

  return result;
}

// Gera HTML com botões coloridos por tipo
function renderTipoTabelado(data) {
  return Object.entries(data).map(([categoria, tipos]) => {
    if (tipos.length === 0) return '';
    const buttons = tipos.map(tipo =>
      `<button class="type-button" style="background:${typeColors[tipo] || '#ccc'}">${tipo}</button>`
    ).join(' ');
    return `<div><strong>${categoria}:</strong> ${buttons}</div>`;
  }).join('');
}
