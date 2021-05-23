var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const autoIncrementModelID = require('./counterModel');

var matchSchema = new Schema({
    id: {type: Number, unique: true, min: 1},
      taker_order_id: Number
    , taker_user_id: Number
    , taker_fee_percentage: Number
    , taker_fee_volume: Number
    , maker_order_id: Number
    , maker_user_id: Number
    , maker_fee_percentage: Number
    , maker_fee_volume: Number
    , price: Number
    , volume: Number
    , market_id: String
    , taker_side: String
    , created_at: {type: Date, default: null}
});

matchSchema.pre('save', function (next) {
    if (!this.isNew) {
        next();
        return;
    }

    autoIncrementModelID('activities', this, next);
});

module.exports = mongoose.model('matches', matchSchema);