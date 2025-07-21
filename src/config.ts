// src/config.ts
import { http, createConfig } from 'wagmi';
import { Chain } from 'wagmi';

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
      http: ['https://snowy-floral-theorem.monad-testnet.quiknode.pro/fc22e376d43919d211f52e068defe10aaa3b81ee/'],
    },
    public: {
      http: ['https://snowy-floral-theorem.monad-testnet.quiknode.pro/fc22e376d43919d211f52e068defe10aaa3b81ee/'],
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
    [monadTestnet.id]: http(
      'https://snowy-floral-theorem.monad-testnet.quiknode.pro/fc22e376d43919d211f52e068defe10aaa3b81ee/'
    ),
  },
});
