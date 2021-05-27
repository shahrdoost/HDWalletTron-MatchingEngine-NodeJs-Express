const controller = require('../controller')
const mongoose = require("mongoose");

const OrdersController = require('./OrdersController')
const globalNode = require('global-node');

// schema
const ordersSchema = require('../../schema/ordersSchema')
const matchSchema = require('../../schema/matchSchema')

//remaning
const RemaningController = require('./RemaningController')

class MatchesController extends controller {

    nullProperty() {

        console.log('nulling is run')

        globalNode.setProperty('Sell_id', null);
        globalNode.setProperty('Sell_price', null);
        globalNode.setProperty('Sell_user_id', null);
        globalNode.setProperty('Sell_type', null);
        globalNode.setProperty('Sell_data', null);
        globalNode.setProperty('Sell_side', null);
        globalNode.setProperty('Sell_market_id', null);
        globalNode.setProperty('Sell_volume', null);
        globalNode.setProperty('Sell_status', null);

        globalNode.setProperty('Buy_id', null);
        globalNode.setProperty('Buy_price', null);
        globalNode.setProperty('Buy_user_id', null);
        globalNode.setProperty('Buy_type', null);
        globalNode.setProperty('Buy_data', null);
        globalNode.setProperty('Buy_side', null);
        globalNode.setProperty('Buy_market_id', null);
        globalNode.setProperty('Buy_volume', null);
        globalNode.setProperty('Buy_status', null);
    }

}

module.exports = new MatchesController;