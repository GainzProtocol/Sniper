import { ethers } from "ethers";
import { providerHttps } from "../config/network.js";
import { readFileSync } from 'fs';

// Approval function
export const approveToken = async (pk, tokenAddress, spenderAddress) => {
    const provider = new ethers.JsonRpcProvider(providerHttps);
    const wallet = new ethers.Wallet(pk, provider);
    const tokenAbi = JSON.parse(readFileSync('./abi/ERC20.json'));
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, wallet);

    try {
        const tx = await tokenContract.approve(spenderAddress, ethers.MaxUint256);
        const receipt = await tx.wait();
        return { status: 'success', hash: tx.hash };
    } catch (error) {
        console.error(`Failed to approve: ${error.message}`);
        return { status: 'fail', error: error.message };
    }
};
