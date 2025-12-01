import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitScore } from '../services/api';

function genProblem() {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const ops = ['+','-','*'];
  const op = ops[Math.floor(Math.random()*ops.length)];
  let ans;
  if (op === '+') ans = a + b;
  if (op === '-') ans = a - b;
  if (op === '*') ans = a * b;
  return { q: `${a} ${op} ${b}`, ans };
}

export default function SpeedMath() {
  const [timeLeft, setTimeLeft] = useState(30);
  const [problem, setProblem] = useState(genProblem());
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      clearInterval(timerRef.current);
      // finish game
      submitScore({ playerName: 'Guest', game: 'Speed Math', score, timeTaken: 30 })
        .catch(() => {});
      navigate('/result', { state: { score, moves: null, game: 'Speed Math', timeTaken: 30 } });
    }
  }, [timeLeft, score, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseInt(input) === problem.ans) {
      setScore(s => s + 10);
    }
    setInput('');
    setProblem(genProblem());
  };

  return (
    <div style={{ padding:20 }}>
      <h2>Speed Math</h2>
      <p>Time Left: {timeLeft}s</p>
      <p>Score: {score}</p>
      <div style={{ margin:12 }}>
        <h3>{problem.q}</h3>
        <form onSubmit={handleSubmit}>
          <input value={input} onChange={e => setInput(e.target.value)} autoFocus />
          <button type='submit'>Submit</button>
        </form>
      </div>
    </div>
  );
}
