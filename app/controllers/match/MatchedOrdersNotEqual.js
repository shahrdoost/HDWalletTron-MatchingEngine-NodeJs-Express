const controller = require('../controller')

const globalNode = require('global-node');
//schema
const ordersSchema = require('../../schema/ordersSchema')
const AddMatchToDb = require('./AddMatchToDb')
//reporter
const RunController = require('./Run')

//redis
const redis = require('redis');
const client = redis.createClient();
const {promisifyAll} = require('bluebird');
promisifyAll(redis);

class MatchedOrdersNotEqual extends controller {

    updatedMatchedOrdersNotEqual() {
        const runApplication = async () => {

            if (await client.getAsync('Buy_volume') > await client.getAsync('Sell_volume')
                && await client.getAsync('Sell_price') == await client.getAsync('Buy_price')
                && await client.getAsync('Sell_status') !== 'filled'
                && await client.getAsync('Buy_status') !== 'filled'
                && await client.getAsync('Sell_price') != null
                && await client.getAsync('Buy_price') != null
                && await client.getAsync('Buy_remaining_value') === "0"
                && await client.getAsync('Sell_remaining_value') === "0") {

                let remaining_value = await client.getAsync('Buy_volume') - await client.getAsync('Sell_volume')
                console.log('remaning_value is ' + remaining_value)

                // update pending
                ordersSchema.findByIdAndUpdate(await client.getAsync('Buy_id'), {
                        'remaining_value': remaining_value,
                        'status': 'pending'
                    },
                    async err => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("status order Buy updated remaning " + remaining_value);

                            const RunController = require('./Run')
                            RunController.reporter('MatchedOrdersNotEqual'
                                , 'updatedMatchedOrdersNotEqual'
                                , "status order Buy updated remaning " + remaining_value
                                , await client.getAsync('Sell_volume')
                                , await client.getAsync('Sell_idi'))
                        }
                    });

                // update filled
                ordersSchema.findByIdAndUpdate(await client.getAsync('Sell_id'), {
                        'status': 'filled',
                        'remaining_value': 0
                    },
                    async err => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("status order Sell updated filled ");
                            const RunController = require('./Run')
                            RunController.reporter('MatchedOrdersNotEqual'
                                , 'updatedMatchedOrdersNotEqual'
                                , "status order Sell updated filled "
                                , await client.getAsync('Sell_volume')
                                , await client.getAsync('Sell_idi'))
                        }
                    });

                AddMatchToDb.AddMatch()
            }


            // revers check
            if (await client.getAsync('Buy_volume') < await client.getAsync('Sell_volume')
                && await client.getAsync('Sell_price') == await client.getAsync('Buy_price')
                && await client.getAsync('Sell_status') !== 'filled'
                && await client.getAsync('Buy_status') !== 'filled'
                && await client.getAsync('Sell_price') != null
                && await client.getAsync('Buy_price') != null
                && await client.getAsync('Buy_remaining_value') === '0'
                && await client.getAsync('Sell_remaining_value') === '0') {

                let remaining_value = await client.getAsync('Sell_volume') - await client.getAsync('Buy_volume')
                // console.log('remaning_value is ' + remaining_value)

                // update pending
                ordersSchema.findByIdAndUpdate(await client.getAsync('Sell_id'), {
                        'remaining_value': remaining_value,
                        'status': 'pending'
                    },
                    async err => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("status order Sell 1 updated remaning " + remaining_value);

                            const RunController = require('./Run')
                            RunController.reporter('MatchedOrdersNotEqual'
                                , 'updatedMatchedOrdersNotEqual'
                                , "status order Sell 1 updated remaning " + remaining_value
                                ,await client.getAsync('Buy_volume')
                                ,await client.getAsync('Sell_idi'))
                        }
                    });

                // update filled
                ordersSchema.findByIdAndUpdate(await client.getAsync('Buy_id'), {'status': 'filled'},
                    async err => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("status order Buy 1 updated filled ");

                            const RunController = require('./Run')
                            RunController.reporter('MatchedOrdersNotEqual'
                                , 'updatedMatchedOrdersNotEqual'
                                , "status order Buy 1 updated filled "
                                , await client.getAsync('Buy_volume')
                                , await client.getAsync('Buy_idi'))
                        }
                    });

                AddMatchToDb.AddMatch()

            }

        }
        runApplication();
    }

}

module.exports = new MatchedOrdersNotEqual;