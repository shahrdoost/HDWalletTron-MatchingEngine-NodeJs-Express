const express = require('express')
const router = express.Router()

//controllers
const IndexController = require('./../../controllers/IndexController')



router.get('/' , IndexController.index )
router.get('/address' , IndexController.addressGenerator )

module.exports = router