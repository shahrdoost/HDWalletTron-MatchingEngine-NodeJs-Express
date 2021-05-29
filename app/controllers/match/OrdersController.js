const controller = require('../controller')
const mongoose = require("mongoose");
const { validationResult } = require('express-validator');
const ordersSchema = require('../../schema/ordersSchema')
// const globalNode = require('global-node');
const redis = require('redis');
const client = redis.createClient();
const { promisifyAll } = require('bluebird');
promisifyAll(redis);

class OrdersController extends controller {

    async AddOrder(req, res) {

        //validate body param
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
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
        const remaining_value = 0
        const created_at = Date.now()

        //null
        const filled_at = null
        const expired_at = null
        const canceled_at = null

        const addorder = new ordersSchema({
            user_id: user_id,
            type: type,
            data: data
            , side: side,
            market_id: market_id,
            price: price,
            volume: volume,
            status: status,
            remaining_value: remaining_value,
            created_at: created_at,
            filled_at: filled_at,
            expired_at: expired_at
            , canceled_at: canceled_at
        });

        addorder.save().then(() => console.log('added'));

        // return all orders
        var orders = [];

        ordersSchema.find({}).sort({ created_at: -1 }).exec(function (err, records) {

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

        const doSomethingAsync = async () => {


            try {

                await client.setAsync('loop', '0')
                const post2 = await ordersSchema.find({
                    'side': 'buy',
                    'status': 'pending'
                }).exec()
                post2.forEach(async (u) => {


                    const runSetRedisif = async () => {
                        // search in sell prices
                        await ordersSchema.findOne({
                            'side': 'sell',
                            'status': 'pending',
                            'price': u.price
                        }, async (err, uu) => {

                            if (uu != null) {
                                var datetime = new Date();
                                await console.log('matched' + '-' + uu.price + ' at ' + datetime)
                                await console.log(await client.getAsync('isMatched'))

                                await client.setAsync('isMatched', 'true');

                                await client.setAsync('Sell_id', uu._id.toString());
                                await client.setAsync('Sell_idi', uu.id.toString());
                                await client.setAsync('Sell_price', uu.price.toString());
                                await client.setAsync('Sell_user_id', uu.user_id.toString());
                                await client.setAsync('Sell_type', uu.type);
                                await client.setAsync('Sell_data', uu.data);
                                await client.setAsync('Sell_side', uu.side);
                                await client.setAsync('Sell_market_id', uu.market_id);
                                await client.setAsync('Sell_volume', uu.volume.toString());
                                await client.setAsync('Sell_status', uu.status);
                                await client.setAsync('Sell_remaining_value', uu.remaining_value.toString());


                                await client.setAsync('Buy_id', u._id.toString());
                                await client.setAsync('Buy_idi', u.id.toString());
                                await client.setAsync('Buy_price', u.price.toString());
                                await client.setAsync('Buy_user_id', u.user_id.toString());
                                await client.setAsync('Buy_type', u.type);
                                await client.setAsync('Buy_data', u.data);
                                await client.setAsync('Buy_side', u.side);
                                await client.setAsync('Buy_market_id', u.market_id);
                                await client.setAsync('Buy_volume', u.volume.toString());
                                await client.setAsync('Buy_status', u.status);
                                await client.setAsync('Buy_remaining_value', u.remaining_value.toString());

                                // set key is matched
                                // await console.log(await client.getAsync('isMatched'))

                            }
                        }
                        );

                    }
                    await runSetRedisif();

                });
            } catch (error) {

            }



        }

        const doSomething = async () => {
            await client.setAsync('isMatched', 'false');
            await doSomethingAsync()
            //  console.log(globalNode.getValue('Sell_id'))
            // res.json([globalNode.getValue('BuyPrice') , globalNode.getValue('SellPrice')])
        }

        doSomething()

    }

}

module.exports = new OrdersController;