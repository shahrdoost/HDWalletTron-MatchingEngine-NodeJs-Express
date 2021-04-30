var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var matchSchema = new Schema({
      taker_order_id: String
    , taker_user_id: Number
    , taker_fee_percentage: Number
    , taker_fee_volume: Number
    , maker_order_id: String
    , maker_user_id: Number
    , maker_fee_percentage: Number
    , maker_fee_volume: Number
    , price: Number
    , volume: Number
    , market_id: String
    , taker_side: String
    , created_at: {type: Date, default: null}
});
module.exports = mongoose.model('matches', matchSchema);