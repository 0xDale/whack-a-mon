import { Address } from 'viem';
import abi from './abi.json'; // сюда вставь ABI или импортируй

export const CONTRACT_ADDRESS = '0x0C79743646c7e093077F2215437973F4110F05b9';

export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESS as Address,
  abi,
};
