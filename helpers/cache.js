import { ethers } from "ethers"
import { getFeeData } from "./getFeeData.js"

let _feeData

export const setFeeData = (newFeeData) => {
    _feeData = newFeeData
}

export const retrieveFeeData = async () => {
    if (!_feeData) {
        _feeData = await getFeeData()
    }
    return _feeData
}

export const cache = {}
export const initCache = (user) => {
    if (!cache[user]) {
        cache[user] = {
            alias: null,
            pks: [],
            wallets: [],
            assets: [],
            buyWallet: 0,         // WALLET INDEX
            snipeWallet: 0,       // WALLET INDEX
            // buyAmount: 0.01,      // ETH
            buyAmount: ethers.parseUnits('0.01', 'ether'), // 0.01 ETH
            // Numeric literals with absolute values equal to 2^53 or greater are too large to be represented accurately as integers.
            sellAmount: 100,      // PERCENTAGE
            // snipeAmount: 0.01,    // ETH
            snipeAmount: ethers.parseUnits('0.01', 'ether'), // 0.01 ETH
            buySlippage: 10,      // PERCENTAGE
            sellSlippage: 10,     // PERCENTAGE
            snipeSlippage: 50,    // PERCENTAGE
            awaiting: null,
            loading: 0,
            snipe: []
        }
    }
}

export const snipe = {}
export const initSnipe = (tokenAddress) => {
    if (!snipe[tokenAddress]) {
        snipe[tokenAddress] = []
    }
}


/* 

const snipe = {
    'tokenAddress1': [
        'chatId1',
        'chatId2',
        ...
    ],
    'tokenAddress2': [
        'chatId1',
        'chatId3'
    ],
    ..
}

const cache[chatId1].snipe = {
    'tokenAddress1':[
        {   
            symbol
            wallet: 0,
            amount: 0.1,
            slippage: 20
        }, 
        {
            symbol
            wallet: 1,
            amount: 0.2,
            slippage: 30
        },
    ],
    'tokenAddress2':[]
}

*/