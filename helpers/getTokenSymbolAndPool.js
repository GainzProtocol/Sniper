import { ethers } from 'ethers';
import { providerHttps, factoryAddress, nativeTokenAddress, multicallAddress } from '../config/network.js';
import { readFileSync } from 'fs';

export const getTokenSymbolAndPool = async (address) => {
    try {
        if (!address || !address.startsWith('0x') || address.length !== 42) {
            return { tokenAddress: address, symbol: '', hasPool: false };
        }
        const provider = new ethers.JsonRpcProvider(providerHttps)
        // const erc20Abi = ["function symbol() view returns (string)"];
        const erc20Abi = JSON.parse(readFileSync('./abi/ERC20.json'));
        const erc20Interface = new ethers.Interface(erc20Abi);
        const factoryAbi = JSON.parse(readFileSync('./abi/Factory.json'));
        const factoryInterface = new ethers.Interface(factoryAbi);
        const multicallAbi = JSON.parse(readFileSync('./abi/Multicall.json'));
        const multicallContract = new ethers.Contract(multicallAddress, multicallAbi, provider);
        const tokenAddress = ethers.getAddress(address)
        const calls = [
            {
                target: tokenAddress,
                callData: erc20Interface.encodeFunctionData('symbol', [])
            },
            {
                target: factoryAddress,
                callData: factoryInterface.encodeFunctionData('getPair', [tokenAddress, nativeTokenAddress])
            }
        ];
        
        const { returnData } = await multicallContract.aggregate.staticCall(calls);
        
        // Decode return data
        const symbol = erc20Interface.decodeFunctionResult('symbol', returnData[0])[0];
        const pairAddress = factoryInterface.decodeFunctionResult('getPair', returnData[1])[0];
        const hasPool = pairAddress !== ethers.ZeroAddress;
        return { tokenAddress, symbol, hasPool };

    } catch (error) {
        console.error('Error checking token for snipe:', error);
        // throw error;
        return { tokenAddress: address, symbol: '', hasPool: false };
    }
}