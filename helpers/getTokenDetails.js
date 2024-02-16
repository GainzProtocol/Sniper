import { ethers } from "ethers";
import { multicallAddress, providerHttps, nativeTokenAddress, routerAddress } from "../config/network.js";
import { readFileSync } from 'fs';

const provider = new ethers.JsonRpcProvider(providerHttps)

export const getTokenDetails = async (tokenAddress) => {
    try {
        const erc20Abi = JSON.parse(readFileSync('./abi/ERC20.json'));
        const erc20Interface = new ethers.Interface(erc20Abi);
        const routerAbi = JSON.parse(readFileSync('./abi/Router.json'));
        const routerInterface = new ethers.Interface(routerAbi)
        const multicallAbi = JSON.parse(readFileSync('./abi/Multicall.json'));
        const multicallContract = new ethers.Contract(multicallAddress, multicallAbi, provider);

        const calls = [
            {
                target: tokenAddress,
                callData: erc20Interface.encodeFunctionData('symbol', [])
            },
            {
                target: tokenAddress,
                callData: erc20Interface.encodeFunctionData('totalSupply', [])
            },
            {
                target: routerAddress,
                callData: routerInterface.encodeFunctionData('getAmountsOut', [
                    ethers.parseUnits('1', 18), // 1 token (assuming 18 decimals)
                    [tokenAddress, nativeTokenAddress]
                ])
            }
        ];

        const { returnData } = await multicallContract.aggregate.staticCall(calls);
        const symbol = erc20Interface.decodeFunctionResult('symbol', returnData[0])[0];
        const totalSupply = erc20Interface.decodeFunctionResult('totalSupply', returnData[1])[0];
        const amountsOut = routerInterface.decodeFunctionResult('getAmountsOut', returnData[2])[0];
        const pricePerTokenInWei = amountsOut[1]
        const marketCapInWei = totalSupply * pricePerTokenInWei;
        // console.log(symbol, totalSupply, pricePerTokenInWei, marketCapInWei)
        return {
            symbol: symbol,
            totalSupply: totalSupply.toString(),
            pricePerTokenInWei: pricePerTokenInWei.toString(),
            marketCapInWei: marketCapInWei.toString()
        }
    } catch (error) {
        console.error('Error fetching token details:', error);
        // Return available information with price and market cap as '0' if there's an overall error
        return {
            symbol: '', // symbol can't be fetched if the multicall itself fails
            totalSupply: '0',
            pricePerTokenInWei: '0',
            marketCapInWei: '0'
        };
    }
}