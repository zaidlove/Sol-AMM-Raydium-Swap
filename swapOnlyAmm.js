const assert = require ('assert');

const {
  jsonInfo2PoolKeys,
  Liquidity,
  Percent,
  TokenAmount,
  Token,
  TOKEN_PROGRAM_ID,
  SPL_ACCOUNT_LAYOUT
} = require('@raydium-io/raydium-sdk');

const {
  connection,
  DEFAULT_TOKEN,
  makeTxVersion,
  wallet
} = require('./config');
const { formatAmmKeysById } = require('./formatAmmKeysById');
const {
  buildAndSendTx,
  getWalletTokenAccount,
} = require('./util');
const { PublicKey, ComputeBudgetProgram } = require('@solana/web3.js');

async function swapOnlyAmm(input) {
  // -------- pre-action: get pool info --------
  const targetPoolInfo = await formatAmmKeysById(input.targetPool)
  assert(targetPoolInfo, 'cannot find the target pool')
  const poolKeys = jsonInfo2PoolKeys(targetPoolInfo)

  // -------- step 1: coumpute amount out --------
  const { amountOut, minAmountOut } = Liquidity.computeAmountOut({
    poolKeys: poolKeys,
    poolInfo: await Liquidity.fetchInfo({ connection, poolKeys }),
    amountIn: input.inputTokenAmount,
    currencyOut: input.outputToken,
    slippage: input.slippage,
  })

  // -------- step 2: create instructions by SDK function --------
  const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
    connection,
    poolKeys,
    userKeys: {
      tokenAccounts: input.walletTokenAccounts,
      owner: input.wallet.publicKey,
    },
    amountIn: input.inputTokenAmount,
    amountOut: minAmountOut,
    fixedSide: 'in',
    makeTxVersion,
    computeBudgetConfig: {
      microLamports: 100000
    }
  })

  console.log('amountOut:', amountOut.toFixed(), '  minAmountOut: ', minAmountOut.toFixed())

  return { txids: await buildAndSendTx(input.wallet, innerTransactions) }
}

async function confirmTransaction( txid ) {
  const latestBlockHash = await connection.getLatestBlockhash("confirmed");
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: txid
  }, 'confirmed')
  console.log("Swap transaction is confirmed");
}

async function buyToken( tokenAddress, poolId, buyTokenAmount ) {
  const inputToken = DEFAULT_TOKEN.WSOL
  const outputToken = new Token(TOKEN_PROGRAM_ID, new PublicKey(tokenAddress), 6, '$COFEEE', 'COFEEE')
  const targetPool = poolId
  const inputTokenAmount = new TokenAmount(inputToken, buyTokenAmount)
  const slippage = new Percent(100, 100)
  const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey)

  const { txids } = await swapOnlyAmm({
    outputToken,
    targetPool,
    inputTokenAmount,
    slippage,
    walletTokenAccounts,
    wallet,
  })
  console.log(txids)
  await confirmTransaction(txids[0])
  return txids[0]
}

async function sellToken( tokenAddress, poolId, sellTokenAmount ) {
  const outputToken = DEFAULT_TOKEN.WSOL
  const inputToken = new Token(TOKEN_PROGRAM_ID, new PublicKey(tokenAddress), 6, '$COFEEE', 'COFEEE')
  const targetPool = poolId
  const inputTokenAmount = new TokenAmount(inputToken, sellTokenAmount)
  const slippage = new Percent(100, 100)
  const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey)

  const { txids } = await swapOnlyAmm({
    outputToken,
    targetPool,
    inputTokenAmount,
    slippage,
    walletTokenAccounts,
    wallet,
  })
  console.log(txids)
  await confirmTransaction(txids[0])
  return txids[0]
}

module.exports = { buyToken, sellToken }