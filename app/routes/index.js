const express = require('express')
const router = express.Router()

//controllers
const IndexController = require('../controllers/IndexController')
const WalletAddressController = require('../controllers/Trx/WalletAddressController')
const TronGridController = require('../controllers/Trx/TronGridController')

router.get('/' , IndexController.index )

//generator
router.post('/generator' , WalletAddressController.Generator )

//tronGrid
router.get('/trongrid/ac' , TronGridController.GetAccount )
router.get('/trongrid/tx' , TronGridController.getTransactions )
router.get('/trongrid/as' , TronGridController.getAssets )

//tronweb
router.get('/tronweb' , TronGridController.tronWebApiTest )

module.exports = router