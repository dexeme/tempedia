const input = document.getElementById("temtemInput");
const infoDiv = document.getElementById("temtemInfo");

input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    buscarTemtem(input.value.trim());
  }
});

async function buscarTemtem(nome) {
  if (!nome) return;

  infoDiv.innerHTML = "Buscando...";
  try {
    const response = await fetch("https://temtem-api.mael.tech/api/temtems");
    const data = await response.json();

    const temtem = data.find(t => t.name.toLowerCase() === nome.toLowerCase());

    if (!temtem) {
      infoDiv.innerHTML = `<p class="error">Temtem "${nome}" não encontrado.</p>`;
      return;
    }

    const html = `
      <div class="temtem-card">
        <img src="${temtem.image}" alt="${temtem.name}" />
        <h2>${temtem.name}</h2>
        <div class="types">
          ${temtem.types.map(tipo => `<span class="type">${tipo}</span>`).join('')}
        </div>
        <p>${temtem.gameDescription}</p>
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
