const controller = require('../controller')
const mongoose = require("mongoose");

const OrdersController = require('./OrdersController')
const globalNode = require('global-node');

const ordersSchema = require('../../schema/ordersSchema')
const matchSchema = require('../../schema/matchSchema')
const reporterSchema = require('../../schema/reporterSchems')

const AddMatchToDb = require('./AddMatchToDb')
//redis
const redis = require('redis');
const client = redis.createClient();
const {promisifyAll} = require('bluebird');
promisifyAll(redis);

class MatchedOrdersEqual extends controller {

    updateMatchedOrdersEqual() {
        const runApplication = async () => {
            //equal check

            if (await client.getAsync('Sell_volume') == await client.getAsync('Buy_volume')
                && await client.getAsync('Sell_price') == await client.getAsync('Buy_price')
                && await client.getAsync('Sell_status') !== 'filled'
                && await client.getAsync('Buy_status') !== 'filled'
                && await client.getAsync('Sell_price') != null
                && await client.getAsync('Buy_price') != null
                && await client.getAsync('Buy_remaining_value') === 0
                && await client.getAsync('Sell_remaining_value') === 0) {

                //update status order 1
                ordersSchema.findByIdAndUpdate(await client.getAsync('Sell_id'), {'status': 'filled'},
                    function (err, docs) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("status order Sell 1 updated ");
                        }
                    });

                //update status order 2
                ordersSchema.findByIdAndUpdate(await client.getAsync('Buy_id'), {
                        'status': 'filled',
                        'remaining_value': 0
                    },
                    function (err, docs) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("status order Buy 2 updated ");
                        }
                    });

                AddMatchToDb.AddMatch()
            }
        }
        runApplication();
    }

}

module.exports = new MatchedOrdersEqual;