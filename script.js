let pokedex = [];
let pokedexNames = [];

const traducciones = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  speed: "Velocidad",
  "special-attack": "Ataque Especial",
  "special-defense": "Defensa Especial",
  bug: "Bicho", electric: "Eléctrico", fairy: "Hada", fighting: "Lucha", fire: "Fuego",
  flying: "Volador", ghost: "Fantasma", grass: "Planta", ground: "Tierra", ice: "Hielo",
  normal: "Normal", poison: "Veneno", psychic: "Psíquico", rock: "Roca", dragon: "Dragón",
  dark: "Siniestro", steel: "Acero", water: "Agua"
};

const efectividad = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { grass: 2, ice: 2, bug: 2, steel: 2, fire: 0.5, water: 0.5, rock: 0.5, dragon: 0.5 },
    water: { fire: 2, rock: 2, ground: 2, water: 0.5, grass: 0.5, dragon: 0.5 },
    electric: { water: 2, flying: 2, electric: 0.5, grass: 0.5, dragon: 0.5, ground: 0 },
    grass: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
    ice: { grass: 2, ground: 2, flying: 2, dragon: 2, fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5 },
    fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, ghost: 0, fairy: 0.5 },
    poison: { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
    ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
    flying: { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
    bug: { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
    ghost: { psychic: 2, ghost: 2, normal: 0, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
    steel: { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
    fairy: { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 }
  };  

async function loadPokedex() {
  try {
    const saved = localStorage.getItem("pokedex");
    if (!saved || saved === "undefined" || saved === "null") {
      localStorage.removeItem("pokedex");
      const res = await fetch("pokedex.json");
      const data = await res.json();
      pokedex = data.results || data;
      localStorage.setItem("pokedex", JSON.stringify(pokedex));
    } else {
      pokedex = JSON.parse(saved);
    }
    renderNames();
  } catch (e) {
    console.error("Error al cargar pokedex:", e);
    localStorage.removeItem("pokedex");
  }
}

function renderNames() {
  pokedexNames = pokedex.map(p => p.name);
  const datalist = document.getElementById("suggestions");
  datalist.innerHTML = "";
  pokedexNames.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    datalist.appendChild(option);
  });
}

document.getElementById("buscar").addEventListener("click", () => {
  const name = document.getElementById("search").value.toLowerCase();
  if (!pokedexNames.includes(name)) return;

  fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
    .then(res => res.json())
    .then(pokemon => {
      const result = document.getElementById("result");
      const types = pokemon.types.map(t => traducciones[t.type.name] || t.type.name).join(", ");
      const stats = pokemon.stats.map(s => 
        `<li><b>${traducciones[s.stat.name] || s.stat.name}:</b> ${s.base_stat}</li>`
      ).join("");

      let tabla = '<h4>Debilidades y Resistencias</h4><table style="width:100%;border-collapse:collapse;margin-top:10px">';
      tabla += '<tr><th style="text-align:left;">Tipo Atacante</th><th>Multiplicador</th></tr>';

      for (const tipoAtk in efectividad) {
        let mult = 1;
        for (const tipoDef of pokemon.types.map(t => t.type.name)) {
          const efecto = efectividad[tipoAtk]?.[tipoDef] ?? 1;
          mult *= efecto;
        }

        if (mult !== 1) {
          const clase = mult === 4 ? "🔥 x4" :
                        mult === 2 ? "⬆️ x2" :
                        mult === 0.5 ? "⬇️ x0.5" :
                        mult === 0.25 ? "🧊 x0.25" :
                        mult === 0 ? "❌ x0" : `x${mult}`;
          tabla += `<tr><td>${traducciones[tipoAtk] || tipoAtk}</td><td>${clase}</td></tr>`;
        }
      }

      tabla += '</table>';

      result.innerHTML = `
        <h3>${pokemon.name.toUpperCase()}</h3>
        <img src="${pokemon.sprites.front_default}" />
        <p><b>N.º Pokédex:</b> #${String(pokemon.id).padStart(3, "0")}</p>
        <p><b>Tipo:</b> ${types}</p>
        <ul style="list-style:none;padding:0">${stats}</ul>
        ${tabla}
      `;
    });
});

document.getElementById("mostrarTodos").addEventListener("click", () => {
  const container = document.getElementById("pokedex");
  container.innerHTML = "";
  pokedex.forEach(pokemon => {
    const id = parseInt(pokemon.url.split("/").filter(Boolean).pop());
    if (id > 1025) return;
    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.innerHTML = `
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" />
      <p><b>#${String(id).padStart(3, "0")}</b></p>
      <p>${capitalize(pokemon.name)}</p>
    `;
    container.appendChild(card);
  });
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

loadPokedex();