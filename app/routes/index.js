const express = require('express')
const router = express.Router()

//controllers
const IndexController = require('../controllers/IndexController')
const WalletAddressController = require('../controllers/WalletAddressController')

router.get('/' , IndexController.index )
router.get('/generator' , WalletAddressController.Generator )

module.exports = router