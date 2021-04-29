var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ordersSchema = new Schema({
    user_id: Number
    , type: String
    , data: mongoose.Mixed
    , side: String
    , market_id: String
    , price: Number
    , volume: Number
    , status: String
    , remaining_value: Number
    , created_at: Date
    , filled_at: {type: Date , default:null}
    , expired_at: {type: Date , default:null}
    , canceled_at: {type: Date , default:null}
});
module.exports = mongoose.model('orders', ordersSchema);