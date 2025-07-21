'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Отключаем SSR для MoleGame, чтобы избежать hydration mismatch
const MoleGame = dynamic(() => import('@/components/MoleGame'), { ssr: false });

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #667eea, #764ba2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '2rem',
        color: 'white',
      }}
    >
      {/* Wallet connect в правом верхнем углу */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10,
        }}
      >
        <ConnectButton />
      </div>

      {/* Основная игра по центру */}
      <MoleGame />
    </main>
  );
}
