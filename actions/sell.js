import { ethers } from 'ethers';
import { providerHttps, customRouterAddress, routerAddress, nativeTokenAddress, blockExplorer } from '../config/network.js';
import { readFileSync } from 'fs';
import { cache } from '../helpers/cache.js';
import { bot } from '../index.js';

/*
    {
        wallet: 0,
        tokenAddress: '0x1D96560988A7590958F6c355724361eA29044B69',
        symbol: 'LOLO',
        balance: '14835849.383584931373189438',
        value: '0.021217594351298553'
    }
*/
export const sellToken = async (chatId, pk, asset, sellPercentage, slippagePercentage) => {
    const provider = new ethers.JsonRpcProvider(providerHttps)
    const wallet = new ethers.Wallet(pk, provider);
    const sellPercentageBigInt = BigInt(sellPercentage) * BigInt(1e18) / BigInt(100);
    const amountToSell =  sellPercentageBigInt * BigInt(asset.balance) / BigInt(1e18)
    // console.log(amountToSell)

    const customRouterAbi = JSON.parse(readFileSync('./abi/CustomRouter.json')).abi;
    const customRouterContract = new ethers.Contract(customRouterAddress, customRouterAbi, wallet);
    const routerAbi = JSON.parse(readFileSync('./abi/Router.json'));
    const routerContract = new ethers.Contract(routerAddress, routerAbi, provider);
    const amountsOut = await routerContract.getAmountsOut(amountToSell, [asset.tokenAddress, nativeTokenAddress])
    const expectedAmount = amountsOut[1];

    const slippage = BigInt(slippagePercentage) * BigInt(1e18) / BigInt(100);
    const slippageAdjustedAmount = expectedAmount * (BigInt(1e18) - slippage) / BigInt(1e18);

    try {
        const tx = await customRouterContract.sell(asset.tokenAddress, amountToSell, slippageAdjustedAmount);
        console.log("Transaction hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        return { status: 'success', hash: tx.hash };

    } catch (error) {
        console.error(`Failed to sell: ${error.message}`);
        return { status: 'fail', error: error.message };
    }
    
}