import { ethers } from 'ethers';
import { providerHttps, customRouterAddress, routerAddress, nativeTokenAddress } from '../config/network.js';
import { readFileSync } from 'fs';

export const buyToken = async (pk, tokenAddress, purchaseValue, slippagePercentage=null, gas=null) => {
    const provider = new ethers.JsonRpcProvider(providerHttps)
    const wallet = new ethers.Wallet(pk, provider);
    const customRouterAbi = JSON.parse(readFileSync('./abi/CustomRouter.json')).abi;
    const customRouterContract = new ethers.Contract(customRouterAddress, customRouterAbi, wallet);
    
    // If slippagePercentage is defined, we calculate minimum tokens, otherwise we put it as zero
    let slippageAdjustedAmount
    if (slippagePercentage && slippagePercentage > 0) {
        const routerAbi = JSON.parse(readFileSync('./abi/Router.json'));
        const routerContract = new ethers.Contract(routerAddress, routerAbi, provider);
        const amountsOut = await routerContract.getAmountsOut(purchaseValue, [nativeTokenAddress, tokenAddress])
        const expectedAmount = amountsOut[1];
        // console.log("expectedAmount", expectedAmount)

        const slippage = BigInt(slippagePercentage) * BigInt(1e18) / BigInt(100);
        slippageAdjustedAmount = expectedAmount * (BigInt(1e18) - slippage) / BigInt(1e18);
    } else {
        slippageAdjustedAmount = 0
    }
    // console.log("slippageAdjustedAmount", slippageAdjustedAmount)
    try {
        const txOptions = {
            value: purchaseValue,
            gasLimit: BigInt(5000000)
        }

        if (gas && gas.maxPriorityFeePerGas && gas.maxFeePerGas) {
            // EIP-1559
            txOptions.type = 2
            txOptions.maxPriorityFeePerGas = gas.maxPriorityFeePerGas;
            txOptions.maxFeePerGas = gas.maxFeePerGas;
        } else if (gas && gas.gasPrice) {
            txOptions.gasPrice = gas;
        }

        const tx = await customRouterContract.buy(tokenAddress, slippageAdjustedAmount, txOptions)
        console.log("Transaction hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        return { status: 'success', hash: tx.hash };
    
    } catch (error) {
        console.error(`Failed to buy: ${error.message}`);
        return { status: 'fail', error: error.message };
    }
}