const controller = require('../controller')
const mongoose = require("mongoose");
const {validationResult} = require('express-validator');

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

        // require schema
        const ordersSchema = require('../../schema/ordersSchema')

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

}

module.exports = new OrdersController;