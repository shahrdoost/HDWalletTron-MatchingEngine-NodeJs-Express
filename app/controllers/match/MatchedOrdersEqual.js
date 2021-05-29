const controller = require('../controller')
const mongoose = require("mongoose");

const OrdersController = require('./OrdersController')
const globalNode = require('global-node');

//schema
const ordersSchema = require('../../schema/ordersSchema')
const matchSchema = require('../../schema/matchSchema')
const reporterSchema = require('../../schema/reporterSchems')

//reporter
const RunController = require('./Run')

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
                && await client.getAsync('Buy_remaining_value') == 0
                && await client.getAsync('Sell_remaining_value') == 0) {


                //update status order 1
                ordersSchema.findByIdAndUpdate(await client.getAsync('Sell_id'), {'status': 'filled'},
                    async (err, docs) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("status order Sell 1 updated ");

                            const RunController = require('./Run')
                            RunController.reporter('MatchedOrdersEqual'
                                , 'updateMatchedOrdersEqual'
                                , 'status order Sell 1 updated'
                                , await client.getAsync('Sell_volume')
                                ,  await client.getAsync('Sell_idi'))
                        }
                    });

                globalNode.setProperty('Buy_idi', await client.getAsync('Buy_idi'));
                globalNode.setProperty('Sell_volume', await client.getAsync('Sell_volume'));
                //update status order 2
                ordersSchema.findByIdAndUpdate(await client.getAsync('Buy_id'), {
                        'status': 'filled',
                        'remaining_value': 0
                    },
                    async (err, docs) =>{
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("status order Buy 2 updated ");

                            const RunController = require('./Run')
                            RunController.reporter('MatchedOrdersEqual'
                                , 'updateMatchedOrdersEqual'
                                , 'status order Buy 2 updated'
                                , await client.getAsync('Sell_volume')
                                ,  await client.getAsync('Buy_idi'))
                        }
                    });

                AddMatchToDb.AddMatch()
            }
        }
        runApplication();
    }

}

module.exports = new MatchedOrdersEqual;