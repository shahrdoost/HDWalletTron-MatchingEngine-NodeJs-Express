const controller = require('../controller')

const globalNode = require('global-node');
//schema
const ordersSchema = require('../../schema/ordersSchema')
const AddMatchToDb = require('./AddMatchToDb')
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
                    function (err, docs) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("status order Buy updated remaning " + remaining_value);
                        }
                    });

                // update filled
                ordersSchema.findByIdAndUpdate(await client.getAsync('Sell_id'), {
                        'status': 'filled',
                        'remaining_value': 0
                    },
                    function (err, docs) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("status order Sell updated filled ");
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
                    function (err, docs) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("status order Sell 1 updated remaning " + remaining_value);
                        }
                    });

                // update filled
                ordersSchema.findByIdAndUpdate(await client.getAsync('Buy_id'), {'status': 'filled'},
                    function (err, docs) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("status order Buy 1 updated filled ");
                        }
                    });

                AddMatchToDb.AddMatch()

            }

        }
        runApplication();
    }

}

module.exports = new MatchedOrdersNotEqual;