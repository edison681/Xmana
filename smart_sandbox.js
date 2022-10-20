// *******************************************************
// * Xmana Smart Contracts for all actions on the Xmana Platform *
// * Based on XRPL Escrow functionality*
// * For concept demonstration only, final product/code will need to modify the XRPL library directly *
// * Be transformed to the needs of Xmana platform - high volume, low value, staking mechanism, multiple *
// * Beneficiaries which are not known by the time when escrow was created, etc. *
"use strict";
const xmana_smart_dist_adr = "rnuvEZ8yyNNe8j4wk9rfhdzrKv5AdvW2gk";
const xmana_smart_dist_seed = "sEd7ZKS7g1kMxs1afu9txCZ2NLAGQkD";
const xmana_smart_dist_wallet = xrpl.Wallet.fromSeed(xmana_smart_dist_seed);
const xmana_nft_stake_threshold = 0.1;

// *******************************************************
// ************** Xmana Smart NFT Staking ****************
// *******************************************************
// xmaNFT_smtArr = nft_id+"@"+staking_address+"#"+staking_side+"$"+token_amount
// staking_side is binary "VouchIt" or "BeatIt"
function xmana_smart_nft_staking(xmaNFT_id, xmaNFT_smtDict, staking_side, staking_amount, staking_wallet) {
        //connect XRPL server and staking wallet to stake
        const client = new xrpl.Client(server_address)
        client.connect()
        console.log("Connected to Sandbox");

        //check balance that wallet has enough tokens to stake
        if (client.getXrpBalance(staking_wallet.address) < staking_amount + 20) {
                console.log("Not enough tokens to stake the amount");
                return;
        } else {
                Smart_Escrow.createEscrow(staking_wallet, staking_amount);
        }
        client.disconnect()

        xmaNFT_smtDict[xmaNFT_id].push(
                tostring(xmaNFT_id) +
                "@" +
                tostring(staking_wallet.classicAddress) +
                "#" +
                tostring(staking_side) +
                "$" +
                tostring(staking_amount));

}
        
        
        
// *******************************************************
// ************ Xmana Smart Distribution Bot *************
// *******************************************************
// A centralized automated wallet account is not needed when a escrow is modified to directly handle such function
        
// xmaNFT_smtArr = nft_id+"@"+staking_address+"#"+staking_side+"$"+token_amount
function xmana_smart_dist_bot(xmaNFT_id, xmaNFT_smtDict){
        var total_vouch
        var total_beat
        var xmaNFT_smtArr = xmaNFT_smtDict[xmaNFT_id];      
        for (let i = 0; i < xmaNFT_smtArr.length; i++) {
            if (xmaNFT_smtArr[i].slice(xmaNFT_smtArr[i].indexOf('#') + 1, xmaNFT_smtArr[i].lastIndexOf('$')) = "VouchIt") { 
                total_vouch = total_vouch + parsefloat(xmaNFT_smtArr[i].slice(xmaNFT_smtArr[i].indexOf('$') + 1)) }
            else if (xmaNFT_smtArr[i].slice(xmaNFT_smtArr[i].indexOf('#') + 1,xmaNFT_smtArr[i].lastIndexOf('$')) = "BeatIt") {
                total_beat = total_beat + parsefloat(xmaNFT_smtArr[i].slice(xmaNFT_smtArr[i].indexOf('$') + 1))
                }
        }
        //connect xmana_smart_dist_wallet to make distribution
          const client = new xrpl.Client(server_address)
          client.connect()
        //loop to distribute the tokens
        for (let i = 0; i < xmaNFT_smtArr.length; i++) { 
        // total_beat side won, will receive total_vouch side tokens based on stake weight
            if (total_vouch / total_beat < xmana_nft_stake_threshold) {
                if (xmaNFT_smtArr[i].slice(xmaNFT_smtArr[i].indexOf('#') + 1, xmaNFT_smtArr[i].lastIndexOf('$')) = "BeatIt") {
                   var temp_recAdr = xmaNFT_smtArr[i].slice(xmaNFT_smtArr[i].indexOf('@') + 1, xmaNFT_smtArr[i].lastIndexOf('#'))
                   var temp_distAmt = total_vouch * (parsefloat(xmaNFT_smtArr[i].slice(xmaNFT_smtArr[i].indexOf('$') + 1)) / total_beat)}
                }
        // total_vouch side won, will receive total_beat side tokens based on stake weight        
           else if (total_beat / total_vouch < xmana_nft_stake_threshold) {
                if (xmaNFT_smtArr[i].slice(xmaNFT_smtArr[i].indexOf('#') + 1, xmaNFT_smtArr[i].lastIndexOf('$')) = "VouchIt") {
                                var temp_recAdr = xmaNFT_smtArr[i].slice(xmaNFT_smtArr[i].indexOf('@') + 1, xmaNFT_smtArr[i].lastIndexOf('#'))
                                var temp_distAmt = total_beat * (parsefloat(xmaNFT_smtArr[i].slice(xmaNFT_smtArr[i].indexOf('$') + 1)) / total_vouch)
                        }
                }
        // inconclusive staking result, all tokens will go back to original wallet                
           else {
                   var temp_recAdr = xmaNFT_smtArr[i].slice(xmaNFT_smtArr[i].indexOf('@') + 1, xmaNFT_smtArr[i].lastIndexOf('#'))
                   var temp_distAmt = parsefloat(xmaNFT_smtArr[i].slice(xmaNFT_smtArr[i].indexOf('$') + 1))
                 }
        // Prepare transaction
           const prepared = client.autofill({
                "TransactionType": "Payment",
                "Account": xmana_smart_dist_wallet.address,
                "Amount": temp_distAmt,
                "Destination": temp_recAdr})
        // ------------------------------------------------ Sign prepared instructions
           const signed = xmana_smart_dist_wallet.sign(prepared)
        // -------------------------------------------------------- Submit signed blob
           const tx = client.submitAndWait(signed.tx_blob)
         }
        client.disconnect()    
  }
    

class Smart_Escrow {
        constructor(wallet, staked_amount) {
        this.wallet = wallet;
        this.staked_amount = staked_amount;
        }
        
        // *******************************************************
        // ************* Create Escrow ***************************
        // *******************************************************
        static createEscrow(wallet, staked_amount) {
                ("use strict");
                const RippleAPI = require("ripple-lib").RippleAPI;
                const cc = require("five-bells-condition");
                const crypto = require("crypto");

                const myAddr = wallet.classicAddress;
                const mySecret = wallet.seed;

                // Construct condition and fulfillment
                const preimageData = crypto.randomBytes(32);
                const myFulfillment = new cc.PreimageSha256();
                myFulfillment.setPreimage(preimageData);
                const conditionHex = myFulfillment
                .getConditionBinary()
                .toString("hex")
                .toUpperCase();

                console.log("Condition:", conditionHex);
                console.log(
                "Fulfillment:",
                myFulfillment.serializeBinary().toString("hex").toUpperCase()
                );

                // Construct transaction
                const currentTime = new Date();
                const myEscrow = {
                destination: xmana_smart_dist_wallet.classicAddress, // Destination can be same as source
                destinationTag: 2017,
                amount: staked_amount, //decimal XRP
                condition: conditionHex,
                allowExecuteAfter: currentTime.toISOString(), // can be executed right away if the condition is met
                };
                const myInstructions = {
                maxLedgerVersionOffset: 5,
                };

                // Connect and submit
                const api = new RippleAPI({ server: "wss://s2.ripple.com" });

                function submitTransaction(lastClosedLedgerVersion, prepared, secret) {
                const signedData = api.sign(prepared.txJSON, secret);
                console.log("Transaction ID: ", signedData.id);
                return api.submit(signedData.signedTransaction).then((data) => {
                        console.log("Tentative Result: ", data.resultCode);
                        console.log("Tentative Message: ", data.resultMessage);
                });
                }

                api
                .connect()
                .then(() => {
                        console.log("Connected");
                        return api.prepareEscrowCreation(myAddr, myEscrow, myInstructions);
                })
                .then((prepared) => {
                        console.log("EscrowCreation Prepared");
                        return api.getLedger().then((ledger) => {
                        console.log("Current Ledger", ledger.ledgerVersion);
                        return submitTransaction(ledger.ledgerVersion, prepared, mySecret);
                        });
                })
                .then(() => {
                        api.disconnect().then(() => {
                        console.log("api disconnected");
                        process.exit();
                        });
                })
                .catch(console.error);
                }
        // *******************************************************
        // ************* Cancel Escrow ***************************
        // *******************************************************
        static cancelEscrow(wallet) {
        ("use strict");
        const RippleAPI = require("ripple-lib").RippleAPI;

        const myAddr = wallet.classicAddress;
        const mySecret = wallet.seed;

        const myEscrowCancellation = {
        owner: myAddr,
        escrowSequence: 366,
        };
        const myInstructions = {
        maxLedgerVersionOffset: 5,
        };

        const api = new RippleAPI({ server: "wss://s2.ripple.com" });

        function submitTransaction(lastClosedLedgerVersion, prepared, secret) {
        const signedData = api.sign(prepared.txJSON, secret);
        console.log("Transaction ID: ", signedData.id);
        return api.submit(signedData.signedTransaction).then((data) => {
                console.log("Tentative Result: ", data.resultCode);
                console.log("Tentative Message: ", data.resultMessage);
        });
        }

        api
        .connect()
        .then(() => {
                console.log("Connected");
                return api.prepareEscrowCancellation(
                myAddr,
                myEscrowCancellation,
                myInstructions
                );
        })
        .then((prepared) => {
                console.log("EscrowCancellation Prepared");
                return api.getLedger().then((ledger) => {
                console.log("Current Ledger", ledger.ledgerVersion);
                return submitTransaction(ledger.ledgerVersion, prepared, mySecret);
                });
        })
        .then(() => {
                api.disconnect().then(() => {
                console.log("api disconnected");
                process.exit();
                });
        })
        .catch(console.error);
        }
        // *******************************************************
        // ************* Make Condition **************************
        // *******************************************************
        static makeCondition() {
        const cc = require("five-bells-condition");
        const crypto = require("crypto");

        const preimageData = crypto.randomBytes(32);
        const myFulfillment = new cc.PreimageSha256();
        myFulfillment.setPreimage(preimageData);

        console.log(
        "Condition:",
        myFulfillment.getConditionBinary().toString("hex").toUpperCase()
        );
        console.log(
        "Fulfillment:",
        myFulfillment.serializeBinary().toString("hex").toUpperCase()
        );
        }
}
