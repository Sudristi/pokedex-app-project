import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pokemonName, setPokemonName] = useState('pikachu');
  const [pokemonData, setPokemonData] = useState(null);
  const [input, setInput] = useState('');
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [evolutionSprites, setEvolutionSprites] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [typeMatchups, setTypeMatchups] = useState([]);

  useEffect(() => {
    fetchPokemon(pokemonName);
  }, [pokemonName]);

  useEffect(() => {
    const fetchTypes = async () => {
      const res = await fetch('https://pokeapi.co/api/v2/type');
      const data = await res.json();
      setAllTypes(data.results.map(type => type.name));
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    const fetchPokemonByType = async () => {
      if (!selectedType) return;
      const res = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
      const data = await res.json();
      const pokemonList = data.pokemon.map(p => p.pokemon.name);
      const randomName = pokemonList[Math.floor(Math.random() * pokemonList.length)];
      fetchPokemon(randomName);
    };
    fetchPokemonByType();
  }, [selectedType]);

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

      const typeNames = data.types.map(t => t.type.name);
      const matchupPromises = typeNames.map(async (type) => {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        const data = await res.json();
        return {
          name: type,
          double_damage_from: data.damage_relations.double_damage_from.map(d => d.name),
          double_damage_to: data.damage_relations.double_damage_to.map(d => d.name),
        };
      });

      const matchups = await Promise.all(matchupPromises);
      setTypeMatchups(matchups);

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
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search Pokémon"
        />
        <button type="submit" onClick={handleSearch}>Search</button>
        <button onClick={getRandomPokemon} className="random-button">
          🎲 Random
        </button>
      </div>

      <div className="type-filter">
        <label htmlFor="type">Filter by Type:</label>
        <select
          id="type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">-- All Types --</option>
          {allTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
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
        <div className="evolution-chain">
          <h3>Evolution Chain:</h3>
          <div className="evolution-list">
            {evolutionSprites.map((stage, index) => (
              <div className="evolution-stage" key={index}>
                <img src={stage.sprite} alt={stage.name} />
                <p>{stage.name.charAt(0).toUpperCase() + stage.name.slice(1)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {typeMatchups.length > 0 && (
        <div className="matchups">
          <h3>Type Strengths & Weaknesses</h3>
          {typeMatchups.map((matchup, index) => (
            <div key={index} className="matchup">
              <h4>{matchup.name.toUpperCase()}</h4>
              <p><strong>Strong Against:</strong> {matchup.double_damage_to.join(', ') || 'None'}</p>
              <p><strong>Weak Against:</strong> {matchup.double_damage_from.join(', ') || 'None'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
