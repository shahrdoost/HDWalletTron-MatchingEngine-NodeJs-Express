const controller = require('../controller')
const mongoose = require("mongoose");

const OrdersController = require('./OrdersController')
const MatchesController = require('./MatchesController')
const globalNode = require('global-node');

// schema
const ordersSchema = require('../../schema/ordersSchema')
const matchSchema = require('../../schema/matchSchema')

//remaning
const RemaningController = require('./RemaningController')
const MatchedOrdersEqual = require('./MatchedOrdersEqual')
const MatchedOrdersNotEqual = require('./MatchedOrdersNotEqual')

//plimit
const pLimit = require('p-limit');
const limit = pLimit(1);

//redis
var redis = require('redis');
var client = redis.createClient();

class RunController extends controller {

    run(req, res) {
        try {
            const input = [

             //   limit(() => this.deleteRedisKeys()),
                limit(() => OrdersController.GetMatchedOrder()),
                limit(() => MatchedOrdersEqual.updateMatchedOrdersEqual()),
                limit(() => MatchedOrdersNotEqual.updatedMatchedOrdersNotEqual()),
                limit(() => RemaningController.checkRemaningValue()),

            ];

            (async () => {
                // Only one promise is run at once
                const result = await Promise.all(input);
              //  console.log(result);
            })();
        } catch (e) {
            console.log(e);
        }

    }

    deleteRedisKeys() {
        const runApplication = async () => {
            await client.flushdb(function (err, succeeded) {
                console.log('nulling is ' + succeeded); // will be true if successfull
            });
        }
        runApplication();
    }
}

module.exports = new RunController;