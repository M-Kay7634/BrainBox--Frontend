import { useLocation, Link } from 'react-router-dom';

export default function Result() {
  const { state } = useLocation();
  if (!state) return (
    <div style={{ padding: 20 }}>No result data. <Link to='/'>Back</Link></div>
  );
  const { score, moves, game, timeTaken } = state;

  return (
    <div style={{ padding: 20 }}>
      <h1>Result - {game}</h1>
      <p>Score: {score}</p>
      {moves !== null && <p>Moves/Answers: {moves}</p>}
      {timeTaken !== undefined && <p>Time taken: {timeTaken}s</p>}
      <Link to='/'><button>Back to Dashboard</button></Link>
    </div>
  );
}
