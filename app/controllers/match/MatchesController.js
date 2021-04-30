const controller = require('../controller')
const mongoose = require("mongoose");

const OrdersController = require('./OrdersController')
const globalNode = require('global-node');

// schema
const ordersSchema = require('../../schema/ordersSchema')
const matchSchema = require('../../schema/matchSchema')

class MatchesController extends controller {

    async CheckOrders(req, res) {

        try {

            await this.GetMatchedOrder();
            await this.AddMatch();

        } catch (e) {
            console.error(e); // 30
        }

    }

    GetMatchedOrder() {
        const GetMatchedOrder = OrdersController.GetMatchedOrder();
    }

    AddMatch() {


        let SellPrice = globalNode.getValue('Sell_price');
        let BuyPrice = globalNode.getValue('Buy_price');

        let Buy_status = globalNode.getValue('Buy_status');
        let Sell_status = globalNode.getValue('Sell_status');

        console.log(SellPrice + ' is sellPrice')
        console.log(BuyPrice + ' is buyPrice')

        if (SellPrice == BuyPrice && Sell_status != 'filled' && Buy_status != 'filled') {

            const taker_order_id = globalNode.getValue('Sell_id');
            const taker_user_id = globalNode.getValue('Sell_user_id');
            const taker_fee_percentage = '123';
            const taker_fee_volume = '123';
            const maker_order_id = globalNode.getValue('Buy_id');
            const maker_user_id = globalNode.getValue('Buy_user_id');
            const maker_fee_percentage = '123';
            const maker_fee_volume = '123';
            const price = globalNode.getValue('Buy_price');
            const volume = globalNode.getValue('Buy_volume');
            const market_id = globalNode.getValue('Buy_market_id');
            const created_at = Date.now()
            const taker_side = globalNode.getValue('Sell_side');

            //add to match record
            const MatchAdd = new matchSchema({
                taker_order_id: taker_order_id,
                taker_user_id: taker_user_id,
                taker_fee_percentage: taker_fee_percentage,
                taker_fee_volume: taker_fee_volume,
                maker_order_id: maker_order_id,
                maker_user_id: maker_user_id,
                maker_fee_percentage: maker_fee_percentage,
                maker_fee_volume: maker_fee_volume,
                price: price,
                volume: volume,
                market_id: market_id,
                created_at: created_at,
                taker_side: taker_side
            });

            MatchAdd.save(function (err, book) {
                if (err) return console.error(err);
                console.log('match added to db');
            });

            //update status order 1
            ordersSchema.findByIdAndUpdate(globalNode.getValue('Sell_id'), {'status': 'filled'},
                function (err, docs) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("status order 1 updated ");
                    }
                });

            //update status order 2
            ordersSchema.findByIdAndUpdate(globalNode.getValue('Buy_id'), {'status': 'filled'},
                function (err, docs) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("status order 2 updated ");
                    }
                });

        }
    }

}

module.exports = new MatchesController;