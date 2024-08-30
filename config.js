const { 
    Currency,
    LOOKUP_TABLE_CACHE,
    MAINNET_PROGRAM_ID,
    RAYDIUM_MAINNET,
    Token,
    TxVersion,
    ENDPOINT: _ENDPOINT,
    TOKEN_PROGRAM_ID,
} = require('@raydium-io/raydium-sdk');

const {
    connection, 
    Keypair, 
    PublicKey
} = require("@solana/web3.js");
const base = require('base-x');

const base58 = require("bs58");
require("dotenv").config();

const rpcUrl = process.env.RPC_URL || "";
const rpcToken = undefined;

const wallet = Keypair.fromSecretKey(base58.decode(process.env.WALLET_PRIVATE_KEY || ""))
const connection = new Connection(rpcUrl, {commitment: 'confirmed'});
const PROGRAMIDS = MAINNET_PROGRAM_ID;
const ENDPOINT = _ENDPOINT;

const RAYDIUM_MAINNET_API = RAYDIUM_MAINNET;

const makeTxVersion = TxVersion.V0; // LEGACY

const addLookupTableInfo = LOOKUP_TABLE_CACHE // only mainnet. other = undefined

const DEFAULT_TOKEN = {
  'SOL': new Currency(9, 'USDC', 'USDC'),
  'WSOL': new Token(TOKEN_PROGRAM_ID, new PublicKey('So11111111111111111111111111111111111111112'), 9, 'SOL', 'Wrapped SOL'),
  'USDC': new Token(TOKEN_PROGRAM_ID, new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), 6, 'USDC', 'USDC'),
  'RAY': new Token(TOKEN_PROGRAM_ID, new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'), 6, 'RAY', 'RAY'),
  'POPCAT-USDC': new Token(TOKEN_PROGRAM_ID, new PublicKey('8aJHjpDT58WXU9UY6AfHsvU4bSeBqF4YUd7SimBRvHEn'), 9, 'POPCAT-USDC', 'Raydium (POPCAT-USDC) LP Token'),
}

module.exports = {rpcUrl, rpcToken, wallet, connection, PROGRAMIDS, ENDPOINT, RAYDIUM_MAINNET_API, makeTxVersion, addLookupTableInfo, DEFAULT_TOKEN}