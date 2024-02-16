import { ethers } from 'ethers';
import { providerWebsocket, routerAddress, customRouterAddress, blockExplorer } from '../config/network.js';
import { readFileSync } from 'fs';
import { cache, snipe } from '../helpers/cache.js';
import { buyToken } from '../actions/buy.js';
import { bot } from '../index.js';
import { approveToken } from '../actions/approve.js';
import { cleanSnipe } from '../helpers/cleanSnipe.js';
import { indexToLetter } from '../helpers/utils.js';

function delay(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

const executeBuys = async (list, tokenAddress, gas) => {
    const buyPromises = list.map(async ({ chatId, symbol, wallet, amount, slippage }) => {
        const pk = cache[chatId].pks[wallet]
        try {
            // const result = await buyToken(pk, tokenAddress, amount, slippage, gas);
            // Disable slippage temporarily for snipe.
            const result = await buyToken(pk, tokenAddress, amount, null, gas);
            return { status: result.status, symbol, hash: result.hash, error: null, chatId, wallet };
        } catch (error) {
            return { status: 'fail', symbol, hash: null, error: error.message, chatId, wallet };
        }
    });

    const results = await Promise.all(buyPromises);
    results.forEach(result => {
        if (result.status === 'success') {
            console.log(`Success for chatId ${result.chatId}, wallet ${result.wallet}: ${result.hash}`);
        } else {
            console.error(`Failure for chatId ${result.chatId}, wallet ${result.wallet}: ${result.error}`);
        }
    });

    return results;
}

const executeApprovals = async (results, tokenAddress) => {
    const approvalPromises = results.map(async({status, hash, error, chatId, wallet}) => {
        const pk = cache[chatId].pks[wallet]
        if (status === 'success') {
            const approvalResult = await approveToken(pk, tokenAddress, customRouterAddress)
            if (approvalResult.status === 'success') {
                console.log(`Approval successful. TxHash: ${approvalResult.hash}`);
            } else {
                console.error(`Approval failed: ${approvalResult.error}`);
            }
        }
    })
    await Promise.all(approvalPromises)
}

const sendResults = async (bot, results, token) => {
    const resultsMessagePromises = results.map(async({status, symbol, hash, error, chatId, wallet}) => {
        const successMessage = `Successfully sniped ${symbol} using wallet ${indexToLetter(wallet)}. [Transaction Hash](${blockExplorer}/tx/${hash})`;
        const failureMessage = `Failed to snipe ${symbol}. Error: ${error}`;
        const message = status === 'success' ? successMessage : failureMessage;
        try {
            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown', disable_web_page_preview: true });
        } catch (error) {
            console.error(`Failed to send a message to chatId ${chatId}:`, error);
        }
    })
    await Promise.all(resultsMessagePromises)
};

export const initMempoolListener = async () => {
    const provider = new ethers.WebSocketProvider(providerWebsocket);
    
    provider.on('pending', async (transaction) => {
        try {
            const tx = await provider.getTransaction(transaction);
            if (tx && tx.to) {
                // Snipe
                if (tx.to === routerAddress) {
                    const re1 = new RegExp("^0xf305d719");
                    if (re1.test(tx.data)) {
                        const routerAbi = JSON.parse(readFileSync('./abi/Router.json'));
                        const routerInterface = new ethers.Interface(routerAbi)
                        const decodedInput = routerInterface.parseTransaction({
                            data: tx.data,
                            value: tx.value,
                        });
                        const tokenAddress = decodedInput.args[0]
                        // If ca exists in snipe, do something..
                        if (snipe[tokenAddress] && snipe[tokenAddress].length > 0) {
                            console.log("tx", tx)
                            let gasToSnipe
                            if (tx.type === 2 && tx.maxPriorityFeePerGas && tx.maxFeePerGas) {
                                // EIP-1559
                                const priorityFeeAdjustment = ethers.parseUnits("0.5", "gwei");
                                gasToSnipe = {
                                    maxPriorityFeePerGas: tx.maxPriorityFeePerGas - priorityFeeAdjustment,
                                    maxFeePerGas: tx.maxFeePerGas + ethers.parseUnits("5", "gwei")
                                    
                                };
                            } else if (tx.gasPrice) {
                                const gasPriceAdjustment = ethers.parseUnits("0.5", "gwei");
                                gasToSnipe = {
                                    gasPrice: tx.gasPrice - gasPriceAdjustment
                                }
                            }
                            console.log("gasToSnipe", gasToSnipe)
                            // Snipe
                            // Get all wallet addresses, amount, and slippage
                            /*
                            [
                                { chatId: 1913179626, wallet: 0, amount: 100000000000000000n, slippage: 20 },
                                { chatId: 1913179626, wallet: 1, amount: 200000000000000000n, slippage: 50 }
                            ]
                            */
                            const chatIds = snipe[tokenAddress];
                            const snipeList = chatIds.flatMap(chatId => {
                                const snipeDetails = cache[chatId]?.snipe[tokenAddress];
                                if (snipeDetails) {
                                    return snipeDetails.map(detail => ({ chatId, ...detail }));
                                }
                                return [];
                            });
                            console.log("snipeList", snipeList)
                            console.log("tokenAddress", tokenAddress)
                            // const results = await executeBuys(snipeList, tokenAddress, gasToSnipe);
                            const results = await executeBuys(snipeList, tokenAddress);
                            console.log("results", results)
                            /*
                            results [
                                {
                                    status: 'success',
                                    hash: '0xdce80057a7809dfcb4ec54ab91d99592fb11750c2076d8453457fcfc53beae45',
                                    chatId: 1913179626,
                                    wallet: 0
                                }
                            ]
                            */
                            // Change tokenAddress to token symbol later
                            await sendResults(bot, results, tokenAddress)
                            await executeApprovals(results, tokenAddress)
                            // Delete entries
                            cleanSnipe(tokenAddress)
                            // Or maybe wait until after event?
                        }
                    }
                }
            }
        } catch (error) {
            // console.error('Error fetching transaction:', error);
            if (error.error && error.error.code === 429) {
                // Rate limit
                // console.log('Rate limit exceeded, handling it silently.');
            } else {
                // For all other errors, print them as usual
                console.error('Error fetching transaction:', error);
            }
        }
    });

    provider.websocket.on('error', () => {
        console.error('WebSocket error, attempting to reconnect...');
        setTimeout(initMempoolListener, 3000);
    });

    provider.websocket.on('close', () => {
        console.log('WebSocket closed, attempting to reconnect...');
        setTimeout(initMempoolListener, 3000);
    });
}
