import React from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_CONFIG } from '@/lib/contract';

const Leaderboard = ({ currentNickname }: { currentNickname: string }) => {
  const { data } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getLeaderboard',
    query: { refetchInterval: 15000 },
  });

  const [nicknames, scores] = Array.isArray(data) && data.length === 2 ? data : [[], []];

  return (
    <div className="leaderboard">
      <h2>LEADERBOARD</h2>
      <h3>{currentNickname || 'Your game name'}</h3>
      <div className="table">
        {[...Array(Math.min(10, nicknames.length))].map((_, i) => (
          <div key={i} className={`row ${i === 0 ? 'first' : ''}`}>
            <span className="place">{i + 1}</span>
            <span className="name">{nicknames[i]}</span>
            <span className="score">{scores[i]}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .leaderboard {
          margin-top: 200px;
          width: 100%;
          max-width: 360px;
          padding: 20px;
          color: white;
          text-align: center;
        }
        h2 {
          font-size: 1.6rem;
          letter-spacing: 1px;
        }
        h3 {
          font-family: 'Press Start 2P', cursive;
          font-size: 1rem;
          color: white;
          margin-bottom: 10px;
        }
        .table {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.1);
          padding: 10px;
          border-radius: 8px;
        }
        .place {
          font-weight: bold;
          width: 24px;
          color: white;
        }
        .name {
          flex: 1;
          text-align: left;
          color: white;
        }
        .score {
          width: 32px;
          text-align: right;
          color: white;
        }
        .row.first {
          background: linear-gradient(270deg, #8e2de2, #4a00e0);
          background-size: 400% 400%;
          animation: shimmer 6s ease infinite;
          color: white;
        }

        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @media (max-width: 768px) {
          .leaderboard {
            margin-top: 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;
