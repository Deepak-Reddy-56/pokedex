# PocketDex
A Game Boy-inspired field Pokédex for all 151 Kanto Pokémon. Built with plain HTML, CSS and asynchronous JavaScript. The static site lives in public/ and requires no dependencies or build command.

## Run locally
From the repository root, run `python -m http.server 8000 --directory public` and open http://localhost:8000.

## Demonstrate asynchronous JavaScript
1. Open the Network panel, disable cache, and choose a slow connection.
2. Reload. In app.js, start() waits for readJSON("index.json") to populate the searchable list.
3. Select Pikachu. selectPokemon(25) updates the loading message, then awaits a fetch for entries/25.json. You can still type in the search box while the promise is pending.
4. Once JSON parsing finishes, the name, sprite, types and details update without reloading the page. Pick another species quickly to see why the request counter matters.
5. Set the network offline and pick an uncached entry to see the error. Go online and press Retry lookup.

Filtering and tab switching use data already in memory. The bundled records deliberately keep the live demo independent of external API availability.

## Credits
Species data from [PokéAPI](https://github.com/PokeAPI/pokeapi), sprites from [PokéAPI/sprites](https://github.com/PokeAPI/sprites). Pokémon and character artwork belong to their respective owners. The landscape is original pixel artwork. Press Start 2P is distributed under the SIL Open Font License included in public/assets/OFL.txt.
