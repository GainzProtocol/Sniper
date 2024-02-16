import { ethers } from "ethers";
import { multicallAddress, providerHttps, startingBlock, nativeTokenAddress, routerAddress, factoryAddress } from "../config/network.js";
import { readFileSync } from 'fs';
import { cache } from "./cache.js";

const provider = new ethers.JsonRpcProvider(providerHttps)

const fetchTokenAddressesForWallet = async (walletAddress) => {
    try {
        const transferEventSignature = ethers.id("Transfer(address,address,uint256)");
        const logs = await provider.getLogs({
            fromBlock: startingBlock,
            toBlock: await provider.getBlockNumber(),
            topics: [transferEventSignature, null, ethers.zeroPadValue(walletAddress, 32)],
        });
        const tokenAddresses = new Set(logs.map(log => log.address));
        return Array.from(tokenAddresses);
    } catch (error) {
        console.error(`Error fetching token addresses for wallet ${walletAddress}:`, error);
        throw error;
    }
}

const fetchAllTokenAddressesForWallets = async (walletAddresses) => {
    try {
        const logPromises = walletAddresses.map(walletAddress => fetchTokenAddressesForWallet(walletAddress));
        const allLogs = await Promise.all(logPromises);

        const results = walletAddresses.map((walletAddress, index) => ({
            walletAddress: walletAddress,
            tokenAddresses: allLogs[index]
        }));
        
        return results;
    } catch (error) {
        console.error("Error fetching all token addresses for wallets:", error);
        throw error;
    }
    /*
        [
            {
                walletAddress: '0xd72a9155EB7A5666199bAA14A89c83D473B952F3',
                tokenAddresses: [ '0x1D96560988A7590958F6c355724361eA29044B69', '0xe1355Dcb0A19703804c30034cF1346C4e76DA707 ]
            },
            {
                walletAddress: '0x6c8C90984a55Ccd276Caa69Bdf967297c5E7f563',
                tokenAddresses: [ '0xe1355Dcb0A19703804c30034cF1346C4e76DA707' ]
            }
        ]
    */
}

const fetchTokenData = async (walletsAndTokens) => {
    try {
        const erc20Abi = JSON.parse(readFileSync('./abi/ERC20.json'));
        const erc20Interface = new ethers.Interface(erc20Abi);
        const factoryAbi = JSON.parse(readFileSync('./abi/Factory.json'))
        const factoryInterface = new ethers.Interface(factoryAbi);
        // const pairAbi = JSON.parse(readFileSync('./abi/Pair.json'))
        // const pairInterface = new ethers.Interface(pairAbi);
        const multicallAbi = JSON.parse(readFileSync('./abi/Multicall.json'));
        const multicallContract = new ethers.Contract(multicallAddress, multicallAbi, provider);
        
        const routerAbi = JSON.parse(readFileSync('./abi/Router.json'));
        const routerInterface = new ethers.Interface(routerAbi)

        const calls = walletsAndTokens.flatMap(({ walletAddress, tokenAddresses }) =>
            tokenAddresses.flatMap(tokenAddress => [
                {
                    target: tokenAddress,
                    callData: erc20Interface.encodeFunctionData('symbol', [])
                },
                {
                    target: tokenAddress,
                    callData: erc20Interface.encodeFunctionData('balanceOf', [walletAddress])
                },
                {   
                    target: factoryAddress, 
                    callData: factoryInterface.encodeFunctionData('getPair', [tokenAddress, nativeTokenAddress]) 
                }
            ])
        );
        
        const { returnData } = await multicallContract.aggregate.staticCall(calls);
        // console.log("returnData", returnData)

        let tokenDataResults = {};
        let index = 0;

        for (const { walletAddress, tokenAddresses } of walletsAndTokens) {
            tokenAddresses.forEach(tokenAddress => {
                // Initialize unique key for each token and wallet combination
                const uniqueKey = `${walletAddress.toLowerCase()}_${tokenAddress.toLowerCase()}`;

                // Ensure an object exists at the unique key
                if (!tokenDataResults[uniqueKey]) {
                    tokenDataResults[uniqueKey] = { symbol: '', balance: '', pairAddress: '', tokenValue: BigInt(0) };
                }

                const symbolData = returnData[index++];
                tokenDataResults[uniqueKey].symbol = erc20Interface.decodeFunctionResult('symbol', symbolData)[0];

                const balanceData = returnData[index++];
                tokenDataResults[uniqueKey].balance = erc20Interface.decodeFunctionResult('balanceOf', balanceData)[0].toString();

                const pairAddressData = returnData[index++];
                tokenDataResults[uniqueKey].pairAddress = factoryInterface.decodeFunctionResult('getPair', pairAddressData)[0];
            });
        }

        // const validTokens = Object.entries(tokenDataResults).filter(([_, { pairAddress }]) => pairAddress !== ethers.ZeroAddress);
        const validTokens = Object.entries(tokenDataResults).filter(([_, { pairAddress, balance }]) => 
        pairAddress !== ethers.ZeroAddress && BigInt(balance) > BigInt(0));
      
        // console.log("validTokens", validTokens)

        const amountsOutCalls = validTokens.map(([uniqueKey, { balance, pairAddress }]) => {
            return {
                target: routerAddress,
                callData: routerInterface.encodeFunctionData('getAmountsOut', [
                    balance, // Balance of the token
                    [uniqueKey.split('_')[1].toString(), nativeTokenAddress] // Path from token to ETH
                ])
            };
        });

        const amountsOutReturnData = (await multicallContract.aggregate.staticCall(amountsOutCalls))[1];
        // console.log("amountsOutReturnData", amountsOutReturnData)

        amountsOutReturnData.forEach((data, index) => {
            const decodedResult = routerInterface.decodeFunctionResult('getAmountsOut', data);
            const amounts = decodedResult[0];
            const ethAmount = amounts[amounts.length - 1];
            // Find the corresponding token in validTokens and assign the ETH amount
            const [uniqueKey] = validTokens[index];
            tokenDataResults[uniqueKey].tokenValue = ethAmount;
        });
        // console.log(tokenDataResults)
        const results = walletsAndTokens.map(({ walletAddress, tokenAddresses }) => ({
            walletAddress,
            tokenAddresses: tokenAddresses.map(tokenAddress => {
                const uniqueKey = `${walletAddress.toLowerCase()}_${tokenAddress.toLowerCase()}`;
                return {
                    [tokenAddress]: tokenDataResults[uniqueKey]
                };
            })
        }));

        return results;
    } catch (error) {
        console.error("Error fetching token symbols and balances:", error);
        throw error;
    }
    /*
        [
            {
                walletAddress: '0xd72a9155EB7A5666199bAA14A89c83D473B952F3',
                tokenAddresses: [
                    {
                        '0x1D96560988A7590958F6c355724361eA29044B69': {
                            symbol: 'LOLO',
                            balance: '14835849383584931373189438',
                            pairAddress: ..
                            tokenValue: '21217594351298553'
                        }
                    },
                    {
                        '0xe1355Dcb0A19703804c30034cF1346C4e76DA707': {
                            symbol: 'B0B0',
                            balance: '8085233224993469572759881',
                            pairAddress: ..
                            tokenValue: '11563153168254915'
                        }
                    }
                ]
            },
            {
                walletAddress: '0x6c8C90984a55Ccd276Caa69Bdf967297c5E7f563',
                tokenAddresses: [
                    {
                        '0xe1355Dcb0A19703804c30034cF1346C4e76DA707': {
                            symbol: 'B0B0',
                            balance: '6750616158591461800429557',
                            pairAddress: ..
                            tokenValue: '9654441183043638'
                        }
                    }
                ]
            }
        ]
    */
}

export const getAssets = async (user) => {
    try {
        const wallets = cache[user].wallets
        const walletsAndTokens = await fetchAllTokenAddressesForWallets(wallets)
        // console.log(walletsAndTokens)
        const data = await fetchTokenData(walletsAndTokens)
        // console.log("data", data)
        const assets = []
        data.forEach((walletInfo, index) => {
            walletInfo.tokenAddresses.forEach(tokenInfo => {
                const tokenAddress = Object.keys(tokenInfo)[0];
                const tokenData = tokenInfo[tokenAddress];
                if (tokenData.tokenValue > 0) {
                    assets.push({
                        wallet: wallets.indexOf(walletInfo.walletAddress),
                        tokenAddress: tokenAddress,
                        symbol: tokenData.symbol,
                        balance: tokenData.balance,
                        pairAddress: tokenData.pairAddress,
                        tokenValue: tokenData.tokenValue
                    });
                }
            });
        });
        // console.log("getAssets", assets)
        return assets
        /*
            [
                { wallet: 0, tokenAddress: '0x2382938293823', symbol: 'BOBO', balance: '1232', pairAddress: '', tokenValue: '' },
                { wallet: 1, tokenAddress: '0x2382938293823', symbol: 'LOLO', balance: '3231', pairAddress: '', tokenValue: '' },
            ];
        */
    } catch (error) {
        console.error(`Error getting assets for user ${user}:`, error);
        throw error;
    }
}