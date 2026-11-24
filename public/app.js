const byId = id => document.getElementById(id);
const number = id => String(id).padStart(3, "0");
let catalog = [];
let visible = [];
let entry;
let selected = 26;
let requestNumber = 0;
let tab = "overview";

// fetch() returns a promise. await pauses this function while the page stays interactive.
async function readJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Could not read " + path);
  return await response.json();
}

async function start() {
  try {
    catalog = await readJSON("index.json");
    filterList();
    await selectPokemon(26);
  } catch {
    showError("Index unavailable.");
  }
}

function showError(message) {
  byId("status").textContent = message;
  byId("retry").hidden = false;
}

async function selectPokemon(id) {
  selected = id;
  const request = ++requestNumber;
  byId("status").textContent = "Reading entry " + number(id) + "…";
  byId("retry").hidden = true;
  markSelection();
  try {
    const record = await readJSON("entries/" + id + ".json");
    // Ignore an older response if the trainer has already picked another Pokémon.
    if (request !== requestNumber) return;
    entry = record;
    byId("name").textContent = entry.name;
    byId("genus").textContent = entry.genus;
    byId("scene-id").textContent = "No. " + number(id);
    byId("portrait").src = "sprites/" + id + ".png";
    byId("portrait").alt = entry.name;
    byId("types").innerHTML = entry.types.map(type =>
      '<span class="type ' + type + '">' + type + '</span>').join("");
    renderDetails();
    byId("status").textContent = "Entry " + number(id) + " loaded";
  } catch {
    if (request === requestNumber) showError("Could not load entry " + number(id) + ".");
  }
}

function renderDetails() {
  if (!entry) return;
  byId("overview").setAttribute("aria-pressed", tab === "overview");
  byId("stats").setAttribute("aria-pressed", tab === "stats");
  if (tab === "overview") {
    byId("details").innerHTML = '<p></p><div class="metrics"><span><small>Height</small>' +
      entry.height + ' m</span><span><small>Weight</small>' + entry.weight + ' kg</span></div>';
    byId("details").querySelector("p").textContent = entry.description;
  } else {
    const labels = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
    byId("details").innerHTML = '<div class="bars">' + entry.stats.map((value, i) =>
      '<div><b>' + labels[i] + '</b><meter aria-label="' + labels[i] +
      '" max="255" value="' + value + '"></meter>' + value + '</div>').join("") + '</div>';
  }
}

function markSelection() {
  const list = byId("list");
  for (const button of list.querySelectorAll("button")) {
    button.setAttribute("aria-current", Number(button.dataset.id) === selected);
  }
  const active = list.querySelector('[aria-current="true"]');
  if (active) {
    const offset = active.getBoundingClientRect().top - list.getBoundingClientRect().top;
    if (offset < 0 || offset + active.offsetHeight > list.clientHeight) {
      list.scrollTop += offset - list.clientHeight / 2 + active.offsetHeight / 2;
    }
  }
}

function filterList() {
  const query = byId("search").value.trim().toLowerCase().replace(/^#/, "");
  visible = catalog.filter(p => p.name.toLowerCase().includes(query) || number(p.id).includes(query));
  byId("list").innerHTML = visible.map(p =>
    '<button class="row" data-id="' + p.id + '"><img loading="lazy" alt="" src="sprites/' +
    p.id + '.png"><small>#' + number(p.id) + '</small>' + p.name + '</button>').join("") ||
    "<p>No matching Pokémon.</p>";
  byId("count").textContent = visible.length + " / " + catalog.length + " ENTRIES";
  byId("prev").disabled = byId("next").disabled = visible.length === 0;
  markSelection();
}

function browse(step) {
  if (!visible.length) return;
  const current = visible.findIndex(p => p.id === selected);
  const next = current < 0 ? (step > 0 ? 0 : visible.length - 1) :
    (current + step + visible.length) % visible.length;
  selectPokemon(visible[next].id);
}

byId("search").addEventListener("input", filterList);
byId("list").addEventListener("click", event => {
  const button = event.target.closest("button");
  if (button) selectPokemon(Number(button.dataset.id));
});
for (const name of ["overview", "stats"]) {
  byId(name).onclick = () => {
    tab = name;
    renderDetails();
  };
}
byId("prev").onclick = () => browse(-1);
byId("next").onclick = () => browse(1);
byId("retry").onclick = () => catalog.length ? selectPokemon(selected) : start();
start();
