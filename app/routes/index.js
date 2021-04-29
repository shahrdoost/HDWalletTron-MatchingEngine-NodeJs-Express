const express = require('express')
const router = express.Router()
const {check} = require('express-validator');


//controllers
const IndexController = require('../controllers/IndexController')
const WalletAddressController = require('../controllers/wallet/Trx/WalletAddressController')
const TronGridController = require('../controllers/wallet/Trx/TronGridController')
const OrdersController = require('../controllers/match/OrdersController')
const MatchesController = require('../controllers/match/MatchesController')

router.get('/', IndexController.index)

//generator
router.post('/generator', WalletAddressController.Generator)

//TRX
router.post('/trx/ac', TronGridController.GetAccount)
router.post('/trx/tx', TronGridController.getTransactions)
router.get('/trx/as', TronGridController.getAssets)
router.post('/trx/send', TronGridController.SendTx)

// match
// add order
router.post('/order/send', [
    check('type').notEmpty().isString(),
    check('data').notEmpty(),
    check('side').notEmpty().isString(),
    check('market_id').notEmpty().isString(),
    check('price').notEmpty().isNumeric(),
    check('volume').notEmpty().isNumeric(),
    //check('password').isLength({min: 5}).trim().escape()
], OrdersController.AddOrder)

//check order
router.get('/match/check', MatchesController.CheckOrders)


module.exports = router