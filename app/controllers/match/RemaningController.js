const controller = require('../controller')
const mongoose = require("mongoose");

const OrdersController = require('./OrdersController')
const globalNode = require('global-node');

// schema
const ordersSchema = require('../../schema/ordersSchema')
const matchSchema = require('../../schema/matchSchema')

//match controler
const MatchesController = require('./MatchesController')
//redis
const redis = require('redis');
const client = redis.createClient();
const {promisifyAll} = require('bluebird');
promisifyAll(redis);

class RemaningController extends controller {

    checkRemaningValue() {
        const runApplication = async () => {

            //   console.log('check remaning value runing')
            // check remaning value if both of them != null

            console.log('Sell_remaning_value ' + await client.getAsync('Sell_remaining_value'))
            console.log('buy_remaning_value ' + await client.getAsync('Buy_remaining_value'))
            console.log('Sell_status ' + await client.getAsync('Sell_status'))
            console.log('Buy_status ' + await client.getAsync('Buy_status'))


            ///////////////
            //////buy
            ////////////


            if (
                await client.getAsync('Buy_remaining_value') != 0
                && await client.getAsync('Sell_status') != 'filled'
                && await client.getAsync('Buy_status') != 'filled'
                && await client.getAsync('Sell_price') != null
                && await client.getAsync('Buy_price') != null
                && await client.getAsync('Sell_price') == await client.getAsync('Buy_price')
            ) {

                //check which user have remaning value
                // console.log('remaning orders outside run')
                //check bigger and smaller
                // var remaining_value = globalNode.getValue('Buy_remaining_value') - globalNode.getValue('Buy_remaining_value')
                // var remaining_value2 = globalNode.getValue('Buy_remaining_value') - globalNode.getValue('Sell_remaining_value')

                // check the number isnot negative
                if (await client.getAsync('Buy_remaining_value') > 0) {

                    //     console.log('remaning orders inside Buy_remaining_value run')

                    ordersSchema.find({
                        'side': 'sell',
                        'status': 'pending',
                        'price': await client.getAsync('Sell_price')
                    }).exec(function (err, post2) {
                        post2.forEach(async u => {

                            if (u.price == await client.getAsync('Buy_price')) {

                              //  console.log('remaning orders inside Buy_remaining_value run')

                                var datetime = new Date();
                                //   console.log('matched remaning' + '-' + u.price + '-' + globalNode.getValue('Buy_price') + ' at ' + datetime)

                                //check the other user have remaning value or not
                                var remaining_value;
                                var remaining_value2;
                                if (await client.getAsync('Sell_remaining_value') > 0) {
                                    var remaining_value2 = await client.getAsync('Buy_remaining_value') - await client.getAsync('Sell_remaining_value')
                                    var remaining_value = await client.getAsync('Sell_remaining_value') - await client.getAsync('Buy_remaining_value')
                                } else {
                                    var remaining_value = await client.getAsync('Sell_volume') - await client.getAsync('Buy_remaining_value')
                                    var remaining_value2 = await client.getAsync('Buy_remaining_value') - await client.getAsync('Sell_volume')
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
                                ordersSchema.findByIdAndUpdate(await client.getAsync('Sell_id'), {
                                        'remaining_value': remaining_value,
                                        'status': status
                                    },
                                    async (err, docs) => {
                                        if (err) {
                                            console.log(err)
                                        } else {
                                            console.log("status order Sell 1 updated remaning " + remaining_value);
                                            const RunController = require('./Run')
                                            RunController.reporter("RemaningController"
                                                , 'checkRemaningValue'
                                                , "status order Sell 1 updated remaning " + remaining_value
                                                , await client.getAsync('Buy_remaining_value')
                                                , await client.getAsync('Sell_idi'))
                                        }
                                    });

                                // update buy
                                ordersSchema.findByIdAndUpdate(await client.getAsync('Buy_id'), {
                                        'remaining_value': remaining_value2,
                                        'status': status2
                                    },
                                    async (err, docs) => {
                                        if (err) {
                                            console.log(err)
                                        } else {
                                            console.log("status order Buy 1 updated remaning " + remaining_value2);
                                            const RunController = require('./Run')
                                            RunController.reporter("RemaningController"
                                                , 'checkRemaningValue'
                                                , "status order Buy 1 updated remaning " + remaining_value2
                                                , await client.getAsync('Buy_remaining_value')
                                                , await client.getAsync('Buy_idi'))
                                        }
                                    });


                                // add match
                                 const MatchAdd = new matchSchema({
                                    taker_order_id: await client.getAsync('Sell_idi'),
                                    taker_user_id: await client.getAsync('Sell_user_id'),
                                    taker_fee_percentage: 0,
                                    taker_fee_volume: 0,
                                    maker_order_id: await client.getAsync('Buy_idi'),
                                    maker_user_id: await client.getAsync('Buy_user_id'),
                                    maker_fee_percentage: 0,
                                    maker_fee_volume: 0,
                                    price: await client.getAsync('Buy_price'),
                                    volume: volume,
                                    market_id: await client.getAsync('Buy_market_id'),
                                    created_at: Date.now(),
                                    taker_side: 'buy'
                                });

                                await MatchAdd.save(function (err, book) {
                                    if (err) return console.error(err);
                                    console.log('match remaning buy added to db');
                                });

                                await client.flushdb(function (err, succeeded) {
                                    console.log('nulling is ' + succeeded); // will be true if successfull
                                });

                                await client.setAsync('isMatched', 'false');

                            }


                        });
                    });


                }

            }


            ///////////////
            //////sell
            ////////////


            if (
                await client.getAsync('Sell_remaining_value') != 0
                && await client.getAsync('Sell_status') != 'filled'
                && await client.getAsync('Buy_status') != 'filled'
                && await client.getAsync('Sell_price') != null
                && await client.getAsync('Buy_price') != null
                && await client.getAsync('Sell_price') == await client.getAsync('Buy_price')
            ) {

                //check which user have remaning value
                // console.log('remaning orders outside run')
                //check bigger and smaller
                // var remaining_value = globalNode.getValue('Buy_remaining_value') - globalNode.getValue('Buy_remaining_value')
                // var remaining_value2 = globalNode.getValue('Buy_remaining_value') - globalNode.getValue('Sell_remaining_value')

                // check the number isnot negative
                if (await client.getAsync('Sell_remaining_value') > 0) {

                   // console.log('remaning orders inside Sell_remaining_value run')

                    ordersSchema.find({
                        'side': 'sell',
                        'status': 'pending',
                        'price': await client.getAsync('Sell_price')
                    }).exec(function (err, post2) {
                        post2.forEach(async u => {

                            if (u.price == await client.getAsync('Buy_price')) {

                                var datetime = new Date();
                                console.log('matched remaning' + '-' + u.price + '-' + await client.getAsync('Sell_price') + ' at ' + datetime)

                                //check the other user have remaning value or not
                                var remaining_value;
                                var remaining_value2;
                                if (await client.getAsync('Buy_remaining_value') > 0) {
                                    var remaining_value = await client.getAsync('Buy_remaining_value') - await client.getAsync('Sell_remaining_value')
                                    var remaining_value2 = await client.getAsync('Sell_remaining_value') - await client.getAsync('Buy_remaining_value')
                                } else {
                                    var remaining_value = await client.getAsync('Buy_volume') - await client.getAsync('Sell_remaining_value')
                                    var remaining_value2 = await client.getAsync('Sell_remaining_value') - await client.getAsync('Buy_volume')
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
                                ordersSchema.findByIdAndUpdate(await client.getAsync('Buy_id'), {
                                        'remaining_value': remaining_value,
                                        'status': status
                                    },
                                    async (err, docs) => {
                                        if (err) {
                                            console.log(err)
                                        } else {
                                            console.log("status order Buy 1 updated remaning " + remaining_value);
                                            const RunController = require('./Run')
                                            RunController.reporter("RemaningController"
                                                , 'checkRemaningValue'
                                                , "status order Buy 1 updated remaning " + remaining_value
                                                , await client.getAsync('Sell_remaining_value')
                                                , await client.getAsync('Buy_idi'))
                                        }
                                    });

                                // update buy
                                ordersSchema.findByIdAndUpdate(await client.getAsync('Sell_id'), {
                                        'remaining_value': remaining_value2,
                                        'status': status2
                                    },
                                    async (err, docs) => {
                                        if (err) {
                                            console.log(err)
                                        } else {
                                            console.log("status order Sell 1 updated remaning " + remaining_value2);
                                            const RunController = require('./Run')
                                            RunController.reporter("RemaningController"
                                                , 'checkRemaningValue'
                                                , "status order Sell 1 updated remaning " + remaining_value2
                                                , await client.getAsync('Sell_remaining_value')
                                                , await client.getAsync('Sell_idi'))
                                        }
                                    });

                                // add match
                                const MatchAdd = new matchSchema({
                                    taker_order_id: await client.getAsync('Sell_idi'),
                                    taker_user_id: await client.getAsync('Sell_user_id'),
                                    taker_fee_percentage: 0,
                                    taker_fee_volume: 0,
                                    maker_order_id: await client.getAsync('Buy_idi'),
                                    maker_user_id: await client.getAsync('Buy_user_id'),
                                    maker_fee_percentage: 0,
                                    maker_fee_volume: 0,
                                    price: await client.getAsync('Buy_price'),
                                    volume: volume,
                                    market_id: await client.getAsync('Buy_market_id'),
                                    created_at: Date.now(),
                                    taker_side: 'sell'
                                });

                                await  MatchAdd.save(function (err, book) {
                                    if (err) return console.error(err);
                                    console.log('match remaning buy added to db');
                                });

                                await client.flushdb(function (err, succeeded) {
                                    console.log('nulling is ' + succeeded); // will be true if successfull
                                });

                                await client.setAsync('isMatched', 'false');
                            }


                        });
                    });


                }
            }

        }
        runApplication();
    }


}

module.exports = new RemaningController;