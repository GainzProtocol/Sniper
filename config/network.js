import 'dotenv/config';

let _providerHttps;
let _providerWebsocket;
let _factoryAddress;
let _nativeTokenAddress;
let _customRouterAddress;
let _routerAddress;
let _multicallAddress;
let _startingBlock;
let _blockExplorer;

if (process.env.ENVIRONMENT === 'PRODUCTION') {
    // Using mainnet for now. Will use Blast for production
    _providerHttps = process.env.PRODUCTION_HTTPS;
    _providerWebsocket = process.env.PRODUCTION_WEBSOCKET;
    _factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
    _nativeTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // WETH, change to BLAST later
    _customRouterAddress = ""
    _routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    _multicallAddress = "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441"
    _startingBlock = 19073992
    _blockExplorer = ""
} else { // Goerli
    _providerHttps = process.env.DEVELOPMENT_HTTPS;
    _providerWebsocket = process.env.DEVELOPMENT_WEBSOCKET;
    _factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
    _nativeTokenAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6" // WETH
    _customRouterAddress = "0xDe451F1300f884c8Bf6ed6203DCd1D548d9B5Aa1"
    _routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    _multicallAddress = "0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e"
    _startingBlock = 10024103
    _blockExplorer = "https://goerli.etherscan.io"
}

export const providerHttps = _providerHttps;
export const providerWebsocket = _providerWebsocket;
export const factoryAddress = _factoryAddress;
export const nativeTokenAddress = _nativeTokenAddress;
export const customRouterAddress = _customRouterAddress;
export const routerAddress = _routerAddress;
export const multicallAddress = _multicallAddress;
export const startingBlock = _startingBlock;
export const blockExplorer = _blockExplorer;