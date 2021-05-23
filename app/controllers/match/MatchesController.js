const controller = require('../controller')
const mongoose = require("mongoose");

const OrdersController = require('./OrdersController')
const globalNode = require('global-node');

// schema
const ordersSchema = require('../../schema/ordersSchema')
const matchSchema = require('../../schema/matchSchema')

//remaning
const RemaningController = require('./RemaningController')

//plimit
const pLimit = require('p-limit');
const limit = pLimit(1);

class MatchesController extends controller {

    CheckOrders(req, res) {

        const input = [
            limit(() => this.GetMatchedOrder()),
            limit(() => this.AddMatch()),
            limit(() => this.updatedMatchedOrdersEqual()),
            limit(() => this.updatedMatchedOrdersNotEqual()),
            limit(() => RemaningController.checkRemaningValue()),
        ];

        (async () => {
            // Only one promise is run at once
            const result = await Promise.all(input);
            console.log(result);
        })();
    }

    GetMatchedOrder() {
        const GetMatchedOrder = OrdersController.GetMatchedOrder();
    }

    AddMatch() {

        //price
        let SellPrice = globalNode.getValue('Sell_price');
        let BuyPrice = globalNode.getValue('Buy_price');
        //status
        let Buy_status = globalNode.getValue('Buy_status');
        let Sell_status = globalNode.getValue('Sell_status');

        //   console.log(SellPrice + ' is sellPrice')
        //  console.log(BuyPrice + ' is buyPrice')

        if (SellPrice == BuyPrice
            && Sell_status != 'filled'
            && Buy_status != 'filled'
            && SellPrice != null
            && BuyPrice != null
            && globalNode.getValue('Buy_remaining_value') === 0
            && globalNode.getValue('Sell_remaining_value') === 0
        ) {

            const taker_order_id = globalNode.getValue('Sell_idi');
            const taker_user_id = globalNode.getValue('Sell_user_id');
            const taker_fee_percentage = '123';
            const taker_fee_volume = '123';
            const maker_order_id = globalNode.getValue('Buy_idi');
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

        }
    }

    updatedMatchedOrdersEqual() {

        //equal check

        if (globalNode.getValue('Sell_volume') == globalNode.getValue('Buy_volume')
            && globalNode.getValue('Sell_price') == globalNode.getValue('Buy_price')
            && globalNode.getValue('Sell_status') !== 'filled'
            && globalNode.getValue('Buy_status') !== 'filled'
            && globalNode.getValue('Sell_price') != null
            && globalNode.getValue('Buy_price') != null
            && globalNode.getValue('Buy_remaining_value') === 0
            && globalNode.getValue('Sell_remaining_value') === 0) {

            //update status order 1
            ordersSchema.findByIdAndUpdate(globalNode.getValue('Sell_id'), {'status': 'filled'},
                function (err, docs) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("status order Sell 1 updated ");
                    }
                });

            //update status order 2
            ordersSchema.findByIdAndUpdate(globalNode.getValue('Buy_id'), {'status': 'filled', 'remaining_value': 0},
                function (err, docs) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("status order Buy 2 updated ");
                    }
                });


        }

    }

    updatedMatchedOrdersNotEqual() {

        // console.log('updatedMatchedOrdersNotEqual runing')
        // console.log('Buy_volume is' + globalNode.getValue('Buy_volume'))
        //  console.log('Sell_volume is' + globalNode.getValue('Sell_volume'))

        // check remaning value if both of them != #1 buy with sell
        if (globalNode.getValue('Buy_volume') > globalNode.getValue('Sell_volume')
            && globalNode.getValue('Sell_price') == globalNode.getValue('Buy_price')
            && globalNode.getValue('Sell_status') !== 'filled'
            && globalNode.getValue('Buy_status') !== 'filled'
            && globalNode.getValue('Sell_price') != null
            && globalNode.getValue('Buy_price') != null
            && globalNode.getValue('Buy_remaining_value') === 0
            && globalNode.getValue('Sell_remaining_value') === 0) {

            let remaining_value = globalNode.getValue('Buy_volume') - globalNode.getValue('Sell_volume')
            //console.log('remaning_value is ' + remaining_value)

            // update pending
            ordersSchema.findByIdAndUpdate(globalNode.getValue('Buy_id'), {
                    'remaining_value': remaining_value,
                    'status': 'pending'
                },
                function (err, docs) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("status order Buy updated remaning " + remaining_value);
                    }
                });

            // update filled
            ordersSchema.findByIdAndUpdate(globalNode.getValue('Sell_id'), {'status': 'filled', 'remaining_value': 0},
                function (err, docs) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("status order Sell updated filled ");
                    }
                });

        }


        // revers check

        // check remaning value if both of them != #1 buy with sell
        if (globalNode.getValue('Buy_volume') < globalNode.getValue('Sell_volume')
            && globalNode.getValue('Sell_price') == globalNode.getValue('Buy_price')
            && globalNode.getValue('Sell_status') !== 'filled'
            && globalNode.getValue('Buy_status') !== 'filled'
            && globalNode.getValue('Sell_price') != null
            && globalNode.getValue('Buy_price') != null
            && globalNode.getValue('Buy_remaining_value') === 0
            && globalNode.getValue('Sell_remaining_value') === 0) {

            let remaining_value = globalNode.getValue('Sell_volume') - globalNode.getValue('Buy_volume')
            // console.log('remaning_value is ' + remaining_value)

            // update pending
            ordersSchema.findByIdAndUpdate(globalNode.getValue('Sell_id'), {
                    'remaining_value': remaining_value,
                    'status': 'pending'
                },
                function (err, docs) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("status order Sell 1 updated remaning " + remaining_value);
                    }
                });

            // update filled
            ordersSchema.findByIdAndUpdate(globalNode.getValue('Buy_id'), {'status': 'filled'},
                function (err, docs) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("status order Buy 1 updated filled ");
                    }
                });

        }

    }

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