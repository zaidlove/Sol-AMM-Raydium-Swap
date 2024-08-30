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