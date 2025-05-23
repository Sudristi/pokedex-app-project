import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pokemonName, setPokemonName] = useState('pikachu');
  const [pokemonData, setPokemonData] = useState(null);
  const [input, setInput] = useState('');
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [evolutionSprites, setEvolutionSprites] = useState([]);



  useEffect(() => {
    fetchPokemon(pokemonName);
  }, [pokemonName]);

  const fetchPokemon = async (nameOrId) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${String(nameOrId).toLowerCase()}`);
      if (!res.ok) throw new Error('Pokémon not found');
      const data = await res.json();
      setPokemonData(data);

      const speciesRes = await fetch(data.species.url);
      const speciesData = await speciesRes.json();

      const evolutionRes = await fetch(speciesData.evolution_chain.url);
      const evolutionData = await evolutionRes.json();

      const chain = [];
      let current = evolutionData.chain;

      while (current) {
        chain.push(current.species.name);
        current = current.evolves_to[0];
      }

      setEvolutionChain(chain);

      const spritePromises = chain.map(async (name) => {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = await res.json();
        return {
          name,
          sprite: data.sprites.front_default,
        };
      });
      
      const sprites = await Promise.all(spritePromises);
      setEvolutionSprites(sprites);

    } catch (err) {
      console.error(err);
      setPokemonData(null);
      setEvolutionChain([]);
    }
  };

  // Gets a random pokemon
  const getRandomPokemon = () => {
    const randomId = Math.floor(Math.random() * 898) + 1; // IDs from 1 to 898
    fetchPokemon(randomId);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPokemonName(input);
    setInput('');
  };

  return (
    <div className="App">
      <div className="logo-container">
       <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
        alt="Pokeball"
        className="pokeball-logo"
       />
        <h1>Pokedex</h1>
      </div>
      <div className="search-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search Pokémon"
          />
          <button type="submit">Search</button>
        </form>
        <button onClick={getRandomPokemon} className="random-button">
          🎲 Random
        </button>
      </div>

      {pokemonData ? (
        <div className="pokemon-card">
          <h2>{pokemonData.name.toUpperCase()}</h2>
          <img
            src={pokemonData.sprites.front_default}
            alt={pokemonData.name}
          />
          <p>Type: {pokemonData.types.map(t => t.type.name).join(', ')}</p>
        </div>
      ) : (
        <p>Pokémon not found.</p>
      )}
       {evolutionChain.length > 0 && (
        <div className = "evolution-chain">
          <h3>Evolution Chain:</h3>
          <div className = "evolution-list">
            {evolutionSprites.map((stage, index) => (
              <div className = "evolution-stage" key = {index}>
                <img src = {stage.sprite} alt = {stage.name} />
                <p>{stage.name.charAt(0).toUpperCase() + stage.name.slice(1)}</p>
              </div>
            ))}
        </div>
      </div>
      )}
    </div>
  );
}

export default App;
