import { http, createConfig } from 'wagmi';
import type { Chain } from 'viem/chains'; 

const MONAD_RPC = process.env.NEXT_PUBLIC_MONAD_RPC!;

export const monadTestnet: Chain = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [MONAD_RPC],
    },
    public: {
      http: [MONAD_RPC],
    },
  },
  blockExplorers: {
    default: {
      name: 'MonadScan',
      url: 'https://explorer.testnet.monad.xyz',
    },
  },
  testnet: true,
};

export const config = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(MONAD_RPC),
  },
});
