import { cache, snipe } from "./cache.js";

export const cleanSnipe = (tokenAddress) => {
    if (snipe[tokenAddress]) {
        snipe[tokenAddress].forEach(chatId => {
            if (cache[chatId] && cache[chatId].snipe && cache[chatId].snipe[tokenAddress]) {
                delete cache[chatId].snipe[tokenAddress];
            }
        });

        // Once all instances are removed from the cache, delete the tokenAddress from snipe
        delete snipe[tokenAddress];
    }
}