const controller = require('../controller')

const TronGrid = require('trongrid');
const TronWeb = require('tronweb');

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

        // promise
        tronGrid.account.get(address, options).then(account => {
            res.end(JSON.stringify({ account }));
        }).catch(err => console.error(err));

    }



    async getTransactions(req,res) {

        const options = {
            onlyTo: true,
            onlyConfirmed: true,
            limit: 100,
            orderBy: 'timestamp,asc',
            minBlockTimestamp: Date.now() - 60000 // from a minute ago to go on
        };

        // promise
        tronGrid.account.getTransactions(address, options).then(transactions => {
            res.end(JSON.stringify( transactions ));
        }).catch(err => console.error(err));

    }


    async getAssets(req,res) {

        const options = {};

        // promise
        tronGrid.asset.get(address, options).then(assets => {
            res.end(JSON.stringify({ assets }));
        }).catch(err => console.error(err));

    }

    tronWebApiTest(req,res){

      //  tronWeb.setAddress('TRtBDGNZ5qBAihGEPzLdP28d5Hf6YfyPUu')
      // res.end(JSON.stringify(tronWeb.defaultAddress))

       tronWeb.trx.sendTransaction("TVDGpn4hCSzJ5nkHPLetk8KQBtwaTppnkr", 1000,'ac85b2c1ef194eea9148b01d478c7e7bebf9e77b746a6671fbf4d74c40b70154').then(result => {
           res.end(JSON.stringify({ result }));
       }).catch(err => console.error(err));

    }


}

module.exports = new TronGridController;