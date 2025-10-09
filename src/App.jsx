import { useState, useEffect, useRef } from "react";

export default function App() {
  const [countries, setCountries] = useState([]);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(
    Number(localStorage.getItem("flagRecord") || 0)
  );
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Fetch countries from API
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,flags")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const filtered = data
          .filter((c) => c.flags?.png && c.name?.common)
          .map((c) => ({
            name: c.name.common,
            flag: c.flags.png,
          }));
        setCountries(filtered);
      })
      .catch((err) => console.error("Failed to load countries:", err));
  }, []);

  // Start the game
  const startGame = () => {
    setScore(0);
    setMessage("");
    setTimeLeft(60);
    setGameStarted(true);
    setGameOver(false);
    pickRandomCountry();
    inputRef.current?.focus();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setGameStarted(false);
    setCurrentCountry(null);
    setGameOver(true);

    if (score > record) {
      setRecord(score);
      localStorage.setItem("flagRecord", score);
    }
  };

  const pickRandomCountry = () => {
    if (countries.length === 0) return;
    const randomIndex = Math.floor(Math.random() * countries.length);
    setCurrentCountry(countries[randomIndex]);
  };

  const handleGuess = (e) => {
    e.preventDefault();
    if (!currentCountry) return;

    if (guess.trim().toLowerCase() === currentCountry.name.toLowerCase()) {
      setScore(score + 1);
      setMessage(`✅ Correct! It was ${currentCountry.name}`);
    } else {
      setMessage(`❌ Wrong! It was ${currentCountry.name}`);
    }

    setGuess("");
    pickRandomCountry();
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4 text-center">🌍 Guess the Flag!</h1>

      {!gameStarted && !gameOver && (
        <button
          onClick={startGame}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Start Game
        </button>
      )}

      {gameStarted && (
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <img
              src={currentCountry?.flag}
              alt="Country Flag"
              className="w-48 h-32 object-contain border rounded shadow"
            />
          </div>
          <form onSubmit={handleGuess} className="flex flex-col items-center">
            <input
              ref={inputRef}
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              className="px-4 py-2 border rounded mb-2 text-center"
              placeholder="Enter country name"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Submit
            </button>
          </form>
          <p className="mt-2 font-semibold">{message}</p>
          <p className="mt-2">Score: {score}</p>
          <p className="mt-1">Time left: {timeLeft}s</p>
          <p className="mt-1">Record: {record}</p>
        </div>
      )}

      {gameOver && (
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-4 text-center">🎉 Game Over!</h2>
          <p className="text-xl mb-2">Your score: {score}</p>
          <p className="text-lg mb-4">Record: {record}</p>
          <button
            onClick={startGame}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
