import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitScore } from '../services/api';

const baseCards = ['🍎','🍌','🍒','🍇','🍉','🍍'];

function shuffleArray(arr) {
  return arr
    .map(v => ({ v, r: Math.random() }))
    .sort((a,b) => a.r - b.r)
    .map(x => x.v);
}

export default function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [opened, setOpened] = useState([]); // indices
  const [matched, setMatched] = useState([]); // indices
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const navigate = useNavigate();
  const lockRef = useRef(false);

  useEffect(() => {
    const doubled = [...baseCards, ...baseCards];
    setCards(shuffleArray(doubled));
    setStartedAt(Date.now());
  }, []);

  useEffect(() => {
    if (opened.length === 2) {
      const [i, j] = opened;
      if (cards[i] === cards[j]) {
        setMatched(prev => [...prev, i, j]);
      }
      lockRef.current = true;
      setTimeout(() => {
        setOpened([]);
        lockRef.current = false;
      }, 700);
      setMoves(m => m + 1);
    }
  }, [opened, cards]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      const timeTaken = Math.round((Date.now() - startedAt) / 1000);
      const score = Math.max(0, 100 - moves * 2 - timeTaken);

      // submit score (as guest)
      submitScore({ game: 'Memory Flip', score, timeTaken: moves })
        .catch(err => console.log('score save failed', err));

      navigate('/result', { state: { score, moves, game: 'Memory Flip', timeTaken } });
    }
  }, [matched, cards.length, startedAt, moves, navigate]);

  const handleClick = (index) => {
    if (lockRef.current) return;
    if (opened.includes(index)) return;
    if (matched.includes(index)) return;
    setOpened(prev => [...prev, index]);
  };

  const restart = () => {
    const doubled = [...baseCards, ...baseCards];
    setCards(shuffleArray(doubled));
    setOpened([]); setMatched([]); setMoves(0); setStartedAt(Date.now());
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Memory Flip</h2>
      <p>Moves: {moves}</p>
      <button onClick={restart}>Restart</button>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(6, cards.length/2)}, 60px)`, gap: 8, marginTop:12 }}>
        {cards.map((c, i) => (
          <button key={i} onClick={() => handleClick(i)} style={{ height:60, width:60, fontSize:24 }}>
            {opened.includes(i) || matched.includes(i) ? c : '❓'}
          </button>
        ))}
      </div>
    </div>
  );
}
