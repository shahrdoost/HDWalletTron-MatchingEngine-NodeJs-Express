const controller = require('../controller')
const mongoose = require("mongoose");

const OrdersController = require('./OrdersController')
const globalNode = require('global-node');

// schema
const ordersSchema = require('../../schema/ordersSchema')
const matchSchema = require('../../schema/matchSchema')

//match controler
const MatchesController = require('./MatchesController')


class RemaningController extends controller {

    checkRemaningValue() {

        //   console.log('check remaning value runing')
        // check remaning value if both of them != null

        console.log('buy_remaning_value ' + globalNode.getValue('Buy_remaining_value'))
        console.log('Sell_status ' + globalNode.getValue('Sell_status'))
        console.log('Buy_status ' + globalNode.getValue('Buy_status'))


        ///////////////
        //////buy
        ////////////


        if (
            globalNode.getValue('Buy_remaining_value') != null
            && globalNode.getValue('Sell_status') !== 'filled'
            && globalNode.getValue('Buy_status') !== 'filled'
            && globalNode.getValue('Sell_price') != null
            && globalNode.getValue('Buy_price') != null
            && globalNode.getValue('Sell_price') == globalNode.getValue('Buy_price')
        ) {

            //check which user have remaning value
            // console.log('remaning orders outside run')
            //check bigger and smaller
            // var remaining_value = globalNode.getValue('Buy_remaining_value') - globalNode.getValue('Buy_remaining_value')
            // var remaining_value2 = globalNode.getValue('Buy_remaining_value') - globalNode.getValue('Sell_remaining_value')

            // check the number isnot negative
            if (globalNode.getValue('Buy_remaining_value') > 0) {

                // console.log('remaning orders inside Buy_remaining_value run')

                ordersSchema.find({
                    'side': 'sell',
                    'status': 'pending',
                    'price': globalNode.getValue('Sell_price')
                }).exec(function (err, post2) {
                    post2.forEach(function (u) {

                        if (u.price === globalNode.getValue('Buy_price')) {

                            console.log('remaning orders inside Buy_remaining_value run')

                            var datetime = new Date();
                            //   console.log('matched remaning' + '-' + u.price + '-' + globalNode.getValue('Buy_price') + ' at ' + datetime)

                            //check the other user have remaning value or not
                            var remaining_value;
                            var remaining_value2;
                            if (globalNode.getValue('Sell_remaining_value') > 0) {
                                var remaining_value = globalNode.getValue('Buy_remaining_value') - globalNode.getValue('Sell_remaining_value')
                                var remaining_value2 = globalNode.getValue('Sell_remaining_value') - globalNode.getValue('Buy_remaining_value')
                            } else {
                                var remaining_value = globalNode.getValue('Sell_volume') - globalNode.getValue('Buy_remaining_value')
                                var remaining_value2 = globalNode.getValue('Buy_remaining_value') - globalNode.getValue('Sell_volume')
                            }


                            var status;
                            var status2;
                            var volume;
                            if (remaining_value > 0) {
                                var status = 'pending'
                                var volume = remaining_value;
                            }
                            if (remaining_value == 0) {
                                var status = 'filled'
                                var volume = remaining_value;
                            }
                            if (remaining_value < 0) {
                                var status = 'filled'
                            }

                            //status 2
                            if (remaining_value2 > 0) {
                                var status2 = 'pending'
                            }
                            if (remaining_value2 == 0) {
                                var status2 = 'filled'
                            }
                            if (remaining_value2 < 0) {
                                var status2 = 'filled'
                            }

                            console.log('status 1 ' + status)
                            console.log('status 2 ' + status2)

                            //       console.log('status is Buy_remaining_value' + status)
                            // update sell
                            ordersSchema.findByIdAndUpdate(globalNode.getValue('Sell_id'), {
                                    'remaining_value': remaining_value,
                                    'status': status
                                },
                                function (err, docs) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log("status order Sell 1 updated remaning " + remaining_value);
                                    }
                                });

                            // update buy
                            ordersSchema.findByIdAndUpdate(globalNode.getValue('Buy_id'), {
                                    'remaining_value': remaining_value2,
                                    'status': status2
                                },
                                function (err, docs) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log("status order Buy 1 updated remaning " + remaining_value2);
                                    }
                                });


                            // add match
                            const MatchAdd = new matchSchema({
                                taker_order_id: globalNode.getValue('Sell_id'),
                                taker_user_id: globalNode.getValue('Sell_user_id'),
                                taker_fee_percentage: 0,
                                taker_fee_volume: 0,
                                maker_order_id: globalNode.getValue('Buy_id'),
                                maker_user_id: globalNode.getValue('Buy_user_id'),
                                maker_fee_percentage: 0,
                                maker_fee_volume: 0,
                                price: globalNode.getValue('Buy_price'),
                                volume: volume,
                                market_id: globalNode.getValue('Buy_market_id'),
                                created_at: Date.now(),
                                taker_side: 'buy'
                            });

                            MatchAdd.save(function (err, book) {
                                if (err) return console.error(err);
                                console.log('match remaning buy added to db');
                            });

                        }


                    });
                });


            }

        }


        ///////////////
        //////sell
        ////////////


        if (
            globalNode.getValue('Sell_remaining_value') != null
            && globalNode.getValue('Sell_status') !== 'filled'
            && globalNode.getValue('Buy_status') !== 'filled'
            && globalNode.getValue('Sell_price') != null
            && globalNode.getValue('Buy_price') != null
            && globalNode.getValue('Sell_price') == globalNode.getValue('Buy_price')
        ) {

            //check which user have remaning value
            // console.log('remaning orders outside run')
            //check bigger and smaller
            // var remaining_value = globalNode.getValue('Buy_remaining_value') - globalNode.getValue('Buy_remaining_value')
            // var remaining_value2 = globalNode.getValue('Buy_remaining_value') - globalNode.getValue('Sell_remaining_value')

            // check the number isnot negative
            if (globalNode.getValue('Sell_remaining_value') > 0) {

                console.log('remaning orders inside Sell_remaining_value run')

                ordersSchema.find({
                    'side': 'sell',
                    'status': 'pending',
                    'price': globalNode.getValue('Sell_price')
                }).exec(function (err, post2) {
                    post2.forEach(function (u) {

                        if (u.price === globalNode.getValue('Buy_price')) {

                            var datetime = new Date();
                            console.log('matched remaning' + '-' + u.price + '-' + globalNode.getValue('Sell_price') + ' at ' + datetime)

                            //check the other user have remaning value or not
                            var remaining_value;
                            var remaining_value2;
                            if (globalNode.getValue('Buy_remaining_value') > 0) {
                                var remaining_value = globalNode.getValue('Buy_remaining_value') - globalNode.getValue('Sell_remaining_value')
                                var remaining_value2 = globalNode.getValue('Sell_remaining_value') - globalNode.getValue('Buy_remaining_value')
                            } else {
                                var remaining_value = globalNode.getValue('Buy_volume') - globalNode.getValue('Sell_remaining_value')
                                var remaining_value2 = globalNode.getValue('Sell_remaining_value') - globalNode.getValue('Buy_volume')
                            }


                            var status;
                            var status2;
                            var volume;
                            if (remaining_value > 0) {
                                var status = 'pending'
                                var volume = remaining_value;
                            }
                            if (remaining_value == 0) {
                                var status = 'filled'
                                var volume = remaining_value;
                            }
                            if (remaining_value < 0) {
                                var status = 'filled'
                            }

                            //status 2
                            if (remaining_value2 > 0) {
                                var status2 = 'pending'
                            }
                            if (remaining_value2 == 0) {
                                var status2 = 'filled'
                            }
                            if (remaining_value2 < 0) {
                                var status2 = 'filled'
                            }

                            console.log('status 1 ' + status)
                            console.log('status 2' + status2)

                            console.log('status is Sell_remaining_value' + status)
                            // update sell
                            ordersSchema.findByIdAndUpdate(globalNode.getValue('Buy_id'), {
                                    'remaining_value': remaining_value,
                                    'status': status
                                },
                                function (err, docs) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log("status order Buy 1 updated remaning " + remaining_value);
                                    }
                                });

                            // update buy
                            ordersSchema.findByIdAndUpdate(globalNode.getValue('Sell_id'), {
                                    'remaining_value': remaining_value2,
                                    'status': status2
                                },
                                function (err, docs) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log("status order Sell 1 updated remaning " + remaining_value2);
                                    }
                                });

                            // add match
                            const MatchAdd = new matchSchema({
                                taker_order_id: globalNode.getValue('Sell_id'),
                                taker_user_id: globalNode.getValue('Sell_user_id'),
                                taker_fee_percentage: 0,
                                taker_fee_volume: 0,
                                maker_order_id: globalNode.getValue('Buy_id'),
                                maker_user_id: globalNode.getValue('Buy_user_id'),
                                maker_fee_percentage: 0,
                                maker_fee_volume: 0,
                                price: globalNode.getValue('Buy_price'),
                                volume: volume,
                                market_id: globalNode.getValue('Buy_market_id'),
                                created_at: Date.now(),
                                taker_side: 'sell'
                            });

                            MatchAdd.save(function (err, book) {
                                if (err) return console.error(err);
                                console.log('match remaning buy added to db');
                            });

                        }


                    });
                });


            }
        }


    }


}

module.exports = new RemaningController;