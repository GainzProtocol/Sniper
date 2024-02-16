import { cache, initCache, snipe } from '../helpers/cache.js';
import { ethers } from 'ethers';
import { buyToken } from '../actions/buy.js';
import { getFeeData } from '../helpers/getFeeData.js';
import { fetchGasPrices } from '../helpers/getGasPrices.js';

const executeBuys = async (list, tokenAddress, gas) => {
    const buyPromises = list.map(async ({ chatId, wallet, amount, slippage }) => {
        console.log(chatId, wallet, amount, slippage)
        const pk = cache[chatId].pks[wallet]
        try {
            const result = await buyToken(pk, tokenAddress, amount, slippage, gas);
            return { status: result.status, hash: result.hash, chatId, wallet };
        } catch (error) {
            return { status: 'fail', error: error.message, chatId, wallet };
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

export const logCommand = async (msg) => {
    const chatId = msg.chat.id;
    initCache(chatId)
    console.log("LOG")
    // await getFeeData()
    await fetchGasPrices()

    // const gas = BigInt(1500000000)
    // console.log(gas - ethers.parseUnits("0.5", "gwei"))
    
    

    // console.log(cache[chatId].snipe['0xd447AdEda60A4581F30129eC10ac1b3291ECc830'])
    // console.log(JSON.stringify(cache, null, 2));
}