import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pokemonName, setPokemonName] = useState('pikachu');
  const [pokemonData, setPokemonData] = useState(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetchPokemon(pokemonName);
  }, [pokemonName]);

  const fetchPokemon = async (name) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      if (!res.ok) throw new Error('Pokémon not found');
      const data = await res.json();
      setPokemonData(data);
    } catch (err) {
      console.error(err);
      setPokemonData(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPokemonName(input);
    setInput('');
  };

  return (
    <div className="App">
      <h1>Pokedex</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search Pokémon"
        />
        <button type="submit">Search</button>
      </form>

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
    </div>
  );
}

export default App;
