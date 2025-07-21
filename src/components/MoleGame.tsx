import React, { useEffect, useRef, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_CONFIG } from '@/lib/contract';
import Leaderboard from './Leaderboard';

const HOLE_COUNT = 9;
const GAME_DURATION = 30;

const MoleGame = () => {
  const [nickname, setNickname] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [activeMoles, setActiveMoles] = useState<number[]>([]);
  const [moleTypes, setMoleTypes] = useState<number[]>(Array(HOLE_COUNT).fill(0));
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const [showEndScreen, setShowEndScreen] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [isHighScore, setIsHighScore] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const moleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bgSound = useRef<HTMLAudioElement | null>(null);

  const { address, isConnected } = useAccount();
  const { data: storedNickname } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getNickname',
    args: [address],
    query: { enabled: !!address },
  });
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    bgSound.current = new Audio('/Assets/bgsong.mp3');
    if (bgSound.current) {
      bgSound.current.loop = true;
      bgSound.current.volume = 0.2;
    }

    const savedBest = localStorage.getItem('bestScore');
    if (savedBest) setBestScore(Number(savedBest));
  }, []);

  useEffect(() => {
    if (storedNickname && typeof storedNickname === 'string') {
      setNickname(storedNickname);
    }
  }, [storedNickname]);

  useEffect(() => {
    document.body.style.cursor = isRunning ? 'none' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [isRunning]);

  const generateMoleTypes = () => {
    const newTypes = Array.from({ length: HOLE_COUNT }, () => Math.random() < 0.5 ? 1 : 2);
    setMoleTypes(newTypes);
  };

  const startGame = async () => {
    if (!nickname || !isConnected) return;

    if (!storedNickname) {
      try {
        const signature = await signMessageAsync({ message: 'Register Whack-a-MON' });
        await writeContractAsync({
          ...CONTRACT_CONFIG,
          functionName: 'registerPlayer',
          args: [nickname],
        });
        console.log('Player registered');
      } catch (err) {
        console.error('Registration failed:', err);
        return;
      }
    }

    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsRunning(true);
    setActiveMoles([]);
    setShowEndScreen(false);
    generateMoleTypes();
    bgSound.current?.play().catch(() => {});

    clearInterval(timerRef.current!);
    clearTimeout(moleTimerRef.current!);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          clearTimeout(moleTimerRef.current!);
          setIsRunning(false);
          setActiveMoles([]);
          bgSound.current?.pause();

          const newHigh = score > bestScore;
          if (newHigh) {
            localStorage.setItem('bestScore', String(score));
            setBestScore(score);
          }
          setIsHighScore(newHigh);
          setShowEndScreen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    spawnMoles();
  };

  const spawnMoles = (delay = 1200) => {
    const indexes: number[] = [];
    while (indexes.length < 1 + (Math.random() < 0.25 ? 1 : 0)) {
      const idx = Math.floor(Math.random() * HOLE_COUNT);
      if (!indexes.includes(idx)) indexes.push(idx);
    }
    setActiveMoles(indexes);
    moleTimerRef.current = setTimeout(() => spawnMoles(Math.max(300, delay - 20)), delay);
  };

  const handleMoleClick = (index: number) => {
    if (!isRunning || !activeMoles.includes(index)) return;
    setScore((prev) => prev + 1);
    new Audio('/Assets/hit.mp3').play();
    setActiveMoles(prev => prev.filter(i => i !== index));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPos({ x: e.pageX - 50, y: e.pageY - 50 });
  };

  const saveScore = async () => {
    try {
      const signature = await signMessageAsync({ message: 'Save score for Whack-a-MON' });
      await writeContractAsync({
        ...CONTRACT_CONFIG,
        functionName: 'updateBestScore',
        args: [score],
      });
      alert('Score saved to blockchain!');
    } catch (err) {
      console.error('Failed to save score:', err);
      alert('Failed to save score');
    }
  };

  return (
  <div className="pageContainer" onMouseMove={handleMouseMove}>
    <div className="gameSection">
      <div className="leftPanel">
        <h1>Whack-a-MON</h1>
        <div className="scorePanel">
          <div>Score: {score}</div>
          <div>Time: {timeLeft}s</div>
        </div>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter nickname"
          disabled={isRunning}
          className="nicknameInput"
        />
        <div className="gameContainer">
          {Array.from({ length: HOLE_COUNT }).map((_, i) => (
            <div key={i} className="hole" onClick={() => handleMoleClick(i)}>
              <div className={`mole mole${moleTypes[i]} ${activeMoles.includes(i) ? 'up' : ''}`} />
            </div>
          ))}
        </div>
        <button onClick={startGame} disabled={!nickname.trim() || isRunning} className="button">
          Start Game
        </button>

        {isRunning && (
          <div className="customCursor" style={{ left: cursorPos.x, top: cursorPos.y }} />
        )}

        {showEndScreen && (
          <div className="endScreen">
            <div className="endContent">
              <h2>Game Over</h2>
              <p>Your Score: {score}</p>
              {isHighScore && <p className="highScore">🎉 New High Score!</p>}
              <div className="buttons">
                <button onClick={() => setShowEndScreen(false)}>Back</button>
                <button onClick={saveScore}>Save Score</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    <div className="leaderboardSection">
      <Leaderboard currentNickname={nickname} />
    </div>

    <style jsx>{`
      .pageContainer {
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
      }

      .gameSection {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
      }

      .leaderboardSection {
        display: flex;
        justify-content: center;
        padding: 60px 20px 100px;
      }

      .leftPanel {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .scorePanel {
        display: flex;
        justify-content: space-between;
        width: 300px;
        font-size: 1.2rem;
        margin-bottom: 10px;
      }

      .nicknameInput {
        margin: 10px;
        padding: 8px;
        border-radius: 8px;
        border: none;
        background: rgba(255,255,255,0.15);
        color: white;
        text-align: center;
      }

      .gameContainer {
        display: grid;
        grid-template-columns: repeat(3, 100px);
        gap: 15px;
        margin: 20px;
      }

      .hole {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: #2c3e50;
        position: relative;
        overflow: hidden;
      }

      .mole {
        position: absolute;
        width: 100px;
        height: 100px;
        bottom: -60px;
        left: 50%;
        transform: translateX(-50%);
        transition: bottom 0.3s;
      }

      .mole.up {
        bottom: 10px;
      }

      .mole1 {
        background: url('/Assets/mole1.png') no-repeat center center/cover;
      }

      .mole2 {
        background: url('/Assets/mole2.png') no-repeat center center/cover;
      }

      .button {
        margin-top: 10px;
        padding: 10px 20px;
        border: none;
        border-radius: 10px;
        background-color: #ff7675;
        color: white;
        cursor: pointer;
      }

      .button:disabled {
        background-color: #999;
        cursor: not-allowed;
      }

      .customCursor {
        position: fixed;
        width: 100px;
        height: 100px;
        background: url('/Assets/molebat.png') no-repeat center center;
        background-size: contain;
        pointer-events: none;
        z-index: 9999;
      }

      .endScreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        animation: fadeIn 0.4s ease forwards;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .endContent {
        background: white;
        color: #333;
        padding: 30px;
        border-radius: 12px;
        text-align: center;
        width: 90%;
        max-width: 320px;
      }

      .endContent .buttons {
        display: flex;
        justify-content: space-around;
        margin-top: 20px;
      }

      .endContent button {
        padding: 8px 16px;
        background-color: #764ba2;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      }

      @media (max-width: 768px) {
        .gameSection {
          padding-top: 60px;
          padding-bottom: 60px;
        }
        .leaderboardSection {
          padding: 40px 20px 80px;
        }
      }
    `}</style>
  </div>
);

};

export default MoleGame;
