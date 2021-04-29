const controller = require('../controller')
const mongoose = require("mongoose");

const ordersSchema = require('../../schema/ordersSchema')
const globalNode = require('global-node');

class MatchesController extends controller {

    CheckOrders(req, res) {

        const doSomethingAsync = () => {

            //BuyPrice
            const BuyPrice = new Promise((resolve, reject) => {
                ordersSchema.findOne({'side': 'buy'}).sort({'price': -1}).exec(function (err, post) {
                    resolve(post.price)
                });
            })


            BuyPrice.then(ok => {
                globalNode.setProperty('BuyPrice', ok);
            })
                .catch(err => {
                    console.error(err)
                })

            //sellPrice
            const SellPrice = new Promise((resolve, reject) => {
                ordersSchema.findOne({'side': 'sell'}).sort({'price': 1}).exec(function (err, post) {
                    resolve(post.price)
                })
            })

            SellPrice.then(ok => {
                globalNode.setProperty('SellPrice', ok);
            })
                .catch(err => {
                    console.error(err)
                })
        }

        const doSomething = async () => {
           await doSomethingAsync()
            res.json([globalNode.getValue('BuyPrice') , globalNode.getValue('SellPrice')])
        }

        doSomething()

    }
}

module.exports = new MatchesController;