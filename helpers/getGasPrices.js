import { ethers } from 'ethers';
import { providerHttps } from '../config/network.js';

const provider = new ethers.JsonRpcProvider(providerHttps)

export const fetchGasPrices = async () => {
    const blockNumbers = []
    const gasPrices = []
    const latestBlockNumber = await provider.getBlockNumber();
    // console.log(latestBlockNumber)

    for (let i = 0; i < 10; i++) {
        blockNumbers.push(latestBlockNumber - i);
    }
    // Fetch blocks and transactions
    const blocks = await Promise.all(blockNumbers.map(blockNumber => provider.getBlockWithTransactions(blockNumber)));
    console.log(blocks)

}