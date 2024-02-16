import { bot } from '../index.js';
import { cache, initSnipe, snipe } from '../helpers/cache.js';
import { getTokenSymbolAndPool } from '../helpers/getTokenSymbolAndPool.js';

export const handleAwaitingSnipeTokenAddress = async (msg) => {
    const chatId = msg.chat.id
    const address = msg.text.trim()
    // Validate token address
    const { tokenAddress, symbol, hasPool } = await getTokenSymbolAndPool(address)
    // We want to snipe tokens that doesn't have any pool yet
    if (symbol !== '' && !hasPool) {
        initSnipe(tokenAddress)
        if (!snipe[tokenAddress].includes(chatId)) {
            // If chatId is not already in the array, add it
            snipe[tokenAddress].push(chatId);
        }
        
        if (!cache[chatId].snipe[tokenAddress]) {
            cache[chatId].snipe[tokenAddress] = []
        }

        const walletToAdd = cache[chatId].snipeWallet
        const index = cache[chatId].snipe[tokenAddress].findIndex(w => w.wallet === walletToAdd);
        // If wallet already exists, update, otherwise push
        if (index === -1) {
            cache[chatId].snipe[tokenAddress].push({
                symbol,
                wallet: walletToAdd,
                amount: cache[chatId].snipeAmount,
                slippage: cache[chatId].snipeSlippage
            })
            await bot.sendMessage(chatId, `Token ${symbol} has been added to list of snipes`)
        } else {
            // update
            cache[chatId].snipe[tokenAddress][index] = {
                symbol,
                wallet: walletToAdd,
                amount: cache[chatId].snipeAmount,
                slippage: cache[chatId].snipeSlippage
            }
            await bot.sendMessage(chatId, `You already have assigned this wallet to snipe token ${symbol}. Entry has been updated.`)
        }
        
    } else {
        await bot.sendMessage(chatId, "Token is not available for snipe")
    }
    
}