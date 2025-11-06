import { useState, useEffect, useRef } from "react";
import "./App.css";

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
        <div className="app-container">
            <h1>🌍 Guess the Flag!</h1>

            {!gameStarted && !gameOver && (
                <button onClick={startGame} className="start">
                    Start Game
                </button>
            )}

            {gameStarted && (
                <div>
                    <img src={currentCountry?.flag} alt="Country Flag" />
                    <form onSubmit={handleGuess}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            placeholder="Enter country name"
                        />
                        <br />
                        <button type="submit" className="submit">
                            Submit
                        </button>
                    </form>
                    <p>{message}</p>
                    <p>Score: {score}</p>
                    <p>Time left: {timeLeft}s</p>
                    <p>Record: {record}</p>
                </div>
            )}

            {gameOver && (
                <div>
                    <h2>🎉 Game Over!</h2>
                    <p>Your score: {score}</p>
                    <p>Record: {record}</p>
                    <button onClick={startGame} className="start">
                        Play Again
                    </button>
                </div>
            )}
        </div>
    );
}
