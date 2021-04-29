const controller = require('../../controller')

const TronGrid = require('trongrid');
const TronWeb = require('tronweb');
const WalletGenerator = require('./WalletAddressController')

const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io'
});

const tronGrid = new TronGrid(tronWeb);
tronGrid.setExperimental('32c75bad-9f6a-4b98-93c9-9ecc11d9a0ca');

//address
const address = 'TRtBDGNZ5qBAihGEPzLdP28d5Hf6YfyPUu';

class TronGridController extends controller {


    async GetAccount(req, res) {


        const options = {
            showAssets: true,
            onlyConfirmed: true,
        };

        const address = 'TRtBDGNZ5qBAihGEPzLdP28d5Hf6YfyPUu';

        // promise
        tronGrid.account.get(address, options).then(account => {

            res.end(account.data[0].owner_permission.keys[0].address);

        }).catch(err => console.error(err));

    }


    async getTransactions(req, res) {

        const options = {
            onlyTo: true,
            onlyConfirmed: false,
            limit: 100,
            orderBy: 'timestamp,asc',
            minBlockTimestamp: Date.now() - 60000 // from a minute ago to go on
        };

        var userid = req.body.user_id;
        var id = req.body.tx_id;

        //set address
        const address = WalletGenerator.GeneratorJust(userid);

        // promise
        tronGrid.account.getTransactions(address, options).then(transactions => {

            res.setHeader('Content-Type', 'application/json')
            res.json({
                data: transactions.data[id].raw_data.contract[0].parameter.value,
                status: transactions.data[id].ret[0].contractRet,
                tx_id: transactions.data[id].txID,
                fee: transactions.data[id].ret[0].fee,
                time: transactions.data[id].raw_data.timestamp,
                owner_address: tronWeb.address.fromHex(transactions.data[id].raw_data.contract[0].parameter.value.owner_address),
                to_address: tronWeb.address.fromHex(transactions.data[id].raw_data.contract[0].parameter.value.to_address)
            })

            // res.end(JSON.stringify(transactions.data[id]));

        }).catch(err =>  res.json({error : err})  );

    }


    async getAssets(req, res) {

        const options = {};

        // promise
        tronGrid.asset.get(address, options).then(assets => {
            res.end(JSON.stringify({assets}));
        }).catch(err => console.error(err));

    }

    SendTx(req, res) {

        //give data from post req
        let userid = req.body.user_id;
        let to_address = req.body.to;
        let amount = req.body.amount;


        //set prikey
        const prikey = WalletGenerator.GetPriKey(userid);

        tronWeb.trx.sendTransaction(to_address, amount, prikey).then(result => {

            res.end(JSON.stringify({result}));

        }).catch(err =>
        res.json({error : err}))
    }


}

module.exports = new TronGridController;