import { cache } from "../helpers/cache.js"
import { ethers } from "ethers";

// This function updates the inline keyboard based on the selected options
export const snipeKeyboard = (user) => {
    return {
        inline_keyboard: [
            [{ text: 'Select Wallets', callback_data: 'select_wallets' }],
            [
                { text: cache[user]?.snipeWallet === 0 ? '✅ A' : 'A', callback_data: 'snipe_w0' },
                { text: cache[user]?.snipeWallet === 1 ? '✅ B' : 'B', callback_data: 'snipe_w1' }
            ],
            [{ text: 'Slippage', callback_data: 'snipe_slippage' }],
            [
                { text: cache[user]?.snipeSlippage === 10 ? '✅ 10%' : '10%', callback_data: 'snipe_slippage10' },
                { text: cache[user]?.snipeSlippage === 20 ? '✅ 20%' : '20%', callback_data: 'snipe_slippage20' },
                { text: cache[user]?.snipeSlippage === 50 ? '✅ 50%' : '50%', callback_data: 'snipe_slippage50' }
            ],
            [{ text: 'Snipe Amount', callback_data: 'snipe_amount' }],
            [
                { text: cache[user]?.snipeAmount === ethers.parseUnits('0.01', 'ether') ? '✅ 0.01 ETH' : '0.01 ETH', callback_data: 'snipe_0.01eth' },
                { text: cache[user]?.snipeAmount === ethers.parseUnits('0.1', 'ether') ? '✅ 0.1 ETH' : '0.1 ETH', callback_data: 'snipe_0.1eth' },
                { text: cache[user]?.snipeAmount === ethers.parseUnits('0.5', 'ether') ? '✅ 0.5 ETH' : '0.5 ETH', callback_data: 'snipe_0.5eth' }
            ],
        ],
    };
};