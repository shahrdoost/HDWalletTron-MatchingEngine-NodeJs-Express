const controller = require('../controller')
const mongoose = require("mongoose");

const globalNode = require('global-node');
const matchSchema = require('../../schema/matchSchema')
//redis
const redis = require('redis');
const client = redis.createClient();
const {promisifyAll} = require('bluebird');
promisifyAll(redis);

class AddMatchToDb extends controller {

    AddMatch() {
        const runApplication = async () => {

            const taker_order_id = await client.getAsync('Sell_idi');
            const taker_user_id = await client.getAsync('Sell_user_id');
            const taker_fee_percentage = '000';
            const taker_fee_volume = '000';
            const maker_order_id = await client.getAsync('Buy_idi');
            const maker_user_id = await client.getAsync('Buy_user_id');
            const maker_fee_percentage = '000';
            const maker_fee_volume = '000';
            const price = await client.getAsync('Buy_price');
            const volume = await client.getAsync('Buy_volume');
            const market_id = await client.getAsync('Buy_market_id');
            const created_at = Date.now()
            const taker_side = await client.getAsync('Sell_side');

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

           await client.flushdb(function (err, succeeded) {
                console.log('nulling is ' + succeeded); // will be true if successfull
            });

        }
        runApplication();
    }

}

module.exports = new AddMatchToDb;