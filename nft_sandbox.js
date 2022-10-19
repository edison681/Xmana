//***************************************************************************//
// xmaNFT_smtArr = nft_id+"@"+staking_address+"#"+staking_side+"$"+token_amount
const server_address = "wss://xls20-sandbox.rippletest.net:51233";
var xmaNFT_smtDict = {};

//***************************
//** Mint Token *************
//***************************

async function mintToken() {
  var xmaNFT_smtArr = [];
  const staked_token = 10;
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client(server_address);
  await client.connect();
  console.log("Connected to Sandbox");

  //check balance that wallet has enough token to stake/escrow the required tokens for minting
  if (client.getXrpBalance(wallet.address) < staked_token + 20) {
    console.log("Not enough token to stake your nft minting");
    return;
  } else {
    // Call Xmana Smart/Escrow function to stake required tokens before minting NFT
    Smart_Escrow.createEscrow(wallet, staked_token);

    // Note that you must convert the token URL to a hexadecimal
    // value for this transaction.
    // ----------------------------------------------------------
    const transactionBlob = {
      TransactionType: "NFTokenMint",
      Account: wallet.classicAddress,
      URI: xrpl.convertStringToHex(tokenUrl.value),
      Flags: parseInt(flags.value),
      NFTokenTaxon: 0, //Required, but if you have no use for it, set to zero.
    };
    // Submit signed blob --------------------------------------------------------
    const tx = await client.submitAndWait(transactionBlob, { wallet });

    xmaNFT_smtArr.push(
      tostring(tx.NFTokenID.value) +
        "@" +
        tostring(wallet.classicAddress) +
        "#" +
        "VouchIt" +
        "$" +
        tostring(staked_token)
    );
    xmaNFT_smtDict[tx.NFTokenID.value] = xmaNFT_smtArr;

    const nfts = await client.request({
      method: "account_nfts",
      account: wallet.classicAddress,
    });
    console.log(nfts);
    // Check transaction results -------------------------------------------------
    console.log("Transaction result:", tx.result.meta.TransactionResult);
    console.log(
      "Balance changes:",
      JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
    );
    client.disconnect();
  }
} //End of mintToken

//***************************
//** Get Tokens *************
//***************************

async function getTokens() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client(server_address);
  await client.connect();
  console.log("Connected to Sandbox");
  const nfts = await client.request({
    method: "account_nfts",
    account: wallet.classicAddress,
  });
  console.log(nfts);
  client.disconnect();
} //End of getTokens

//***************************
//** Burn Token *************
//***************************

async function burnToken() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client(server_address);
  await client.connect();
  console.log("Connected to Sandbox");

  // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
    TransactionType: "NFTokenBurn",
    Account: wallet.classicAddress,
    NFTokenID: tokenId.value,
  };

  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(transactionBlob, { wallet });
  const nfts = await client.request({
    method: "account_nfts",
    account: wallet.classicAddress,
  });
  console.log(nfts);
  // Check transaction results -------------------------------------------------
  console.log("Transaction result:", tx.result.meta.TransactionResult);
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );
  client.disconnect();
}
// End of burnToken()

//********************************
//** Create Sell Offer ***********
//********************************

async function createSellOffer() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client(server_address);
  await client.connect();
  console.log("Connected to Sandbox");

  // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
    TransactionType: "NFTokenCreateOffer",
    Account: wallet.classicAddress,
    NFTokenID: tokenId.value,
    Amount: amount.value,
    Flags: parseInt(flags.value),
  };

  // Submit signed blob --------------------------------------------------------

  const tx = await client.submitAndWait(transactionBlob, { wallet }); //AndWait

  console.log("***Sell Offers***");
  let nftSellOffers;
  try {
    nftSellOffers = await client.request({
      method: "nft_sell_offers",
      nft_id: tokenId.value,
    });
  } catch (err) {
    console.log("No sell offers.");
  }
  console.log(JSON.stringify(nftSellOffers, null, 2));
  console.log("***Buy Offers***");
  let nftBuyOffers;
  try {
    nftBuyOffers = await client.request({
      method: "nft_buy_offers",
      nft_id: tokenId.value,
    });
  } catch (err) {
    console.log("No buy offers.");
  }
  console.log(JSON.stringify(nftBuyOffers, null, 2));

  // Check transaction results -------------------------------------------------
  console.log(
    "Transaction result:",
    JSON.stringify(tx.result.meta.TransactionResult, null, 2)
  );
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );
  client.disconnect();
  // End of createSellOffer()
}
//********************************
//** Create Buy Offer ***********
//********************************

async function createBuyOffer() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client(server_address);
  await client.connect();
  console.log("Connected to Sandbox");

  // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
    TransactionType: "NFTokenCreateOffer",
    Account: wallet.classicAddress,
    Owner: owner.value,
    NFTokenID: tokenId.value,
    Amount: amount.value,
    Flags: parseInt(flags.value),
  };

  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(transactionBlob, { wallet });

  console.log("***Sell Offers***");
  let nftSellOffers;
  try {
    nftSellOffers = await client.request({
      method: "nft_sell_offers",
      nft_id: tokenId.value,
    });
  } catch (err) {
    console.log("No sell offers.");
  }
  console.log(JSON.stringify(nftSellOffers, null, 2));
  console.log("***Buy Offers***");
  let nftBuyOffers;
  try {
    nftBuyOffers = await client.request({
      method: "nft_buy_offers",
      nft_id: tokenId.value,
    });
  } catch (err) {
    console.log("No buy offers.");
  }
  console.log(JSON.stringify(nftBuyOffers, null, 2));

  // Check transaction results -------------------------------------------------
  console.log(
    "Transaction result:",
    JSON.stringify(tx.result.meta.TransactionResult, null, 2)
  );
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );
  client.disconnect();
  // End of createBuyOffer()
}

//***************************
//** Cancel Offer ***********
//***************************

async function cancelOffer() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client(server_address);
  await client.connect();
  console.log("Connected to Sandbox");

  const tokenOfferID = tokenOfferIndex.value;
  const tokenOffers = [tokenOfferID];

  // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
    TransactionType: "NFTokenCancelOffer",
    Account: wallet.classicAddress,
    NFTokenOffers: tokenOffers,
  };

  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(transactionBlob, { wallet });

  console.log("***Sell Offers***");
  let nftSellOffers;
  try {
    nftSellOffers = await client.request({
      method: "nft_sell_offers",
      nft_id: tokenId.value,
    });
  } catch (err) {
    console.log("No sell offers.");
  }
  console.log(JSON.stringify(nftSellOffers, null, 2));
  console.log("***Buy Offers***");
  let nftBuyOffers;
  try {
    nftBuyOffers = await client.request({
      method: "nft_buy_offers",
      nft_id: tokenId.value,
    });
  } catch (err) {
    console.log("No buy offers.");
  }
  console.log(JSON.stringify(nftBuyOffers, null, 2));

  // Check transaction results -------------------------------------------------

  console.log(
    "Transaction result:",
    JSON.stringify(tx.result.meta.TransactionResult, null, 2)
  );
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );

  client.disconnect();
  // End of cancelOffer()
}
//***************************
//** Get Offers *************
//***************************

async function getOffers() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client(server_address);
  await client.connect();
  console.log("Connected to Sandbox");
  console.log("***Sell Offers***");

  let nftSellOffers;
  try {
    nftSellOffers = await client.request({
      method: "nft_sell_offers",
      nft_id: tokenId.value,
    });
  } catch (err) {
    console.log("No sell offers.");
  }
  console.log(JSON.stringify(nftSellOffers, null, 2));
  console.log("***Buy Offers***");
  let nftBuyOffers;
  try {
    nftBuyOffers = await client.request({
      method: "nft_buy_offers",
      nft_id: tokenId.value,
    });
  } catch (err) {
    console.log("No buy offers.");
  }
  console.log(JSON.stringify(nftBuyOffers, null, 2));
  client.disconnect();
  // End of getOffers()
}
//***************************
//** Accept Sell Offer ******
//***************************

async function acceptSellOffer() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client(server_address);
  await client.connect();
  console.log("Connected to Sandbox");

  // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
    TransactionType: "NFTokenAcceptOffer",
    Account: wallet.classicAddress,
    NFTokenSellOffer: tokenOfferIndex.value,
  };
  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(transactionBlob, { wallet });
  const nfts = await client.request({
    method: "account_nfts",
    account: wallet.classicAddress,
  });
  console.log(JSON.stringify(nfts, null, 2));

  // Check transaction results -------------------------------------------------
  console.log(
    "Transaction result:",
    JSON.stringify(tx.result.meta.TransactionResult, null, 2)
  );
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );
  client.disconnect();
  // End of acceptSellOffer()
}
//***************************
//** Accept Buy Offer ******
//***************************

async function acceptBuyOffer() {
  const wallet = xrpl.Wallet.fromSeed(secret.value);
  const client = new xrpl.Client(server_address);
  await client.connect();
  console.log("Connected to Sandbox");

  // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
    TransactionType: "NFTokenAcceptOffer",
    Account: wallet.classicAddress,
    NFTokenBuyOffer: tokenOfferIndex.value,
  };
  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(transactionBlob, { wallet });
  const nfts = await client.request({
    method: "account_nfts",
    account: wallet.classicAddress,
  });
  console.log(JSON.stringify(nfts, null, 2));

  // Check transaction results -------------------------------------------------
  console.log(
    "Transaction result:",
    JSON.stringify(tx.result.meta.TransactionResult, null, 2)
  );
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );
  client.disconnect();
  // End of submitTransaction()
}
