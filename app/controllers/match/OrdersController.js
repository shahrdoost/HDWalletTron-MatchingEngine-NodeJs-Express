const controller = require('../controller')
const mongoose = require("mongoose");
const {validationResult} = require('express-validator');
const ordersSchema = require('../../schema/ordersSchema')
const globalNode = require('global-node');

class OrdersController extends controller {

    AddOrder(req, res) {

        //validate body param
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        // set variable
        const user_id = 666
        const type = req.body.type
        const data = req.body.data
        const side = req.body.side
        const market_id = req.body.market_id
        const price = req.body.price
        const volume = req.body.volume

        // set variable inside
        const status = 'pending'
        const remaining_value = volume
        const created_at = Date.now()

        //null
        const filled_at = null
        const expired_at = null
        const canceled_at = null

        const addorder = new ordersSchema({
            user_id: user_id, type: type, data: data
            , side: side, market_id: market_id, price: price, volume: volume, status: status,
            remaining_value: remaining_value, created_at: created_at, filled_at: filled_at, expired_at: expired_at
            , canceled_at: canceled_at
        });

        addorder.save().then(() => console.log('added'));

        // return all orders
        var orders = [];

        ordersSchema.find({}).sort({created_at: -1}).exec(function (err, records) {

            records.forEach(function (post, i) {
                orders.push({
                    id: i,
                    objectId: post._id,
                    user_id: post.user_id,
                    type: post.type,
                    data: post.data,
                    side: post.side,
                    market_id: post.market_id,
                    price: post.price,
                    volume: post.volume,
                    status: post.status,
                    remaining_value: post.remaining_value,
                    created_at: post.created_at,
                    filled_at: post.filled_at,
                    expired_at: post.expired_at,
                    canceled_at: post.canceled_at,
                });
            });
            res.json({
                orders: orders
            });
        });
    };

    GetMatchedOrder() {

        const doSomethingAsync = () => {

            //BuyPrice
            //  const BuyPrice = new Promise((resolve, reject) => {
            //      ordersSchema.findOne({'side': 'buy'}).exec(function (err, post) {
            //          resolve(post.price)
            //      });
            //   })

            console.log('GetMatchedOrder run')

            ordersSchema.find({'side': 'buy'}).exec(function (err, post2) {
                post2.forEach(function (u) {

                    // search in sell prices
                    ordersSchema.find({'side': 'sell'}).exec(function (err, post3) {
                        post3.forEach(function (uu) {

                            if (u.price === uu.price) {

                                console.log('mathced' + '-' + u.price + '-' + uu.price)

                                globalNode.setProperty('Sell_id', u._id);
                                globalNode.setProperty('Sell_price', u.price);
                                globalNode.setProperty('Sell_user_id', u.user_id);
                                globalNode.setProperty('Sell_type', u.type);
                                globalNode.setProperty('Sell_data', u.data);
                                globalNode.setProperty('Sell_side', u.side);
                                globalNode.setProperty('Sell_market_id', u.market_id);
                                globalNode.setProperty('Sell_volume', u.volume);
                                globalNode.setProperty('Sell_status', u.status);


                                globalNode.setProperty('Buy_id', uu._id);
                                globalNode.setProperty('Buy_price', uu.price);
                                globalNode.setProperty('Buy_user_id', uu.user_id);
                                globalNode.setProperty('Buy_type', uu.type);
                                globalNode.setProperty('Buy_data', uu.data);
                                globalNode.setProperty('Buy_side', uu.side);
                                globalNode.setProperty('Buy_market_id', uu.market_id);
                                globalNode.setProperty('Buy_volume', uu.volume);
                                globalNode.setProperty('Buy_status', uu.status);

                                // set key is matched
                                globalNode.setProperty('isMatched', 'true');

                            } else {
                             //   console.log('not matched Orders')
                                // set key is matched
                                globalNode.setProperty('isMatched', 'false');

                                globalNode.setProperty('Sell_price', u.price);
                                globalNode.setProperty('Buy_price', uu.price);

                            }

                        });
                    });

                });
            });

        }

        const doSomething = async () => {
            await doSomethingAsync()
            //  console.log(globalNode.getValue('Sell_id'))
            // res.json([globalNode.getValue('BuyPrice') , globalNode.getValue('SellPrice')])
        }

        doSomething()

    }

}

module.exports = new OrdersController;