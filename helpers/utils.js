import { ethers } from "ethers";

export const splitString = (inputString) => {
    const strings = inputString.split('-');
    if (strings.length === 2) {
        return [strings[0], strings[1]];
    } else {
        throw new Error('Input string is not in the expected format.');
    }
}

export const indexToLetter = (index) => {
    // Convert 0 to A, 1 to B, etc.
    return String.fromCharCode(65 + index);
}

export const formatToEther = (amountInWei, decimalPlaces) => {
    const amountInEther = ethers.formatUnits(amountInWei, 'ether');
    const fixedAmountInEther = parseFloat(amountInEther).toFixed(decimalPlaces);
    return fixedAmountInEther
}