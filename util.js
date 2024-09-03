const {
    buildSimpleTransaction,
    findProgramAddress,
    SPL_ACCOUNT_LAYOUT,
    TOKEN_PROGRAM_ID
  } = require('@raydium-io/raydium-sdk');
  const {
    PublicKey,
    VersionedTransaction,
  } = require('@solana/web3.js');
  
  const {
    addLookupTableInfo,
    connection,
    makeTxVersion,
    wallet,
  } = require('./config');
  const base58 = require('bs58');

  async function sendTx(
    connection,
    payer,
    txs,
    options
  ) {
    const txids = [];
    for (const iTx of txs) {
      if (iTx instanceof VersionedTransaction) {
        iTx.sign([payer]);
        sendAndConfirmTransaction(iTx)
        const signature = base58.encode(iTx.signatures[0])
        txids.push(signature)
      } else {
        txids.push(await connection.sendTransaction(iTx, [payer], options));
      }
    }
    return txids;
  }

  async function sleep (ms) {
    return new Promise(r => setTimeout(r, ms));
  };
  
  async function sendAndConfirmTransaction( transaction ) {
    const blockhashResponse = await connection.getLatestBlockhashAndContext();
    const lastValidBlockHeight = blockhashResponse.context.slot + 150;
    const rawTransaction = transaction.serialize()
    let blockheight = await connection.getBlockHeight('confirmed')
    while ( blockheight < lastValidBlockHeight ) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true
      })
      await sleep(2000)
      blockheight = await connection.getBlockHeight()
    }
  }
  
  async function getTokenSupply( tokenAddress ) {
    const tokenSupply = await connection.getTokenSupply(tokenAddress)
    return tokenSupply.value.amount
  }
  
  async function getWalletTokenAccount(connection, wallet) {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
      programId: TOKEN_PROGRAM_ID,
    }, {commitment:"confirmed"});
    return walletTokenAccount.value.map((i) => ({
      pubkey: i.pubkey,
      programId: i.account.owner,
      accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
  }
  
  async function buildAndSendTx(payer, innerSimpleV0Transaction, options) {
    const willSendTx = await buildSimpleTransaction({
      connection,
      makeTxVersion,
      payer: payer.publicKey,
      innerTransactions: innerSimpleV0Transaction,
      addLookupTableInfo: addLookupTableInfo,
    })
  
    return await sendTx(connection, payer, willSendTx, options)
  }
  
  function getATAAddress(programId, owner, mint) {
    const { publicKey, nonce } = findProgramAddress(
      [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
      new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
    );
    return { publicKey, nonce };
  }
  
  async function sleepTime(ms) {
    console.log((new Date()).toLocaleString(), 'sleepTime', ms)
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  module.exports = {getWalletTokenAccount, buildAndSendTx, getATAAddress, sleepTime, getTokenSupply}