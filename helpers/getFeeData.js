import { ethers } from 'ethers';
import { providerHttps } from '../config/network.js';

const provider = new ethers.JsonRpcProvider(providerHttps)

export const getFeeData = async () => {
    const feeData = await provider.getFeeData();
    // console.log(feeData)
    return feeData
};

