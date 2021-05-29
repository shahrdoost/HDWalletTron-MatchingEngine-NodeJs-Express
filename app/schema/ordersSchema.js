var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const autoIncrementModelID = require('./counterModel');

var ordersSchema = new Schema({
    id: {type: Number, unique: true, min: 1},
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
    , filled_at: {type: Date, default: null}
    , expired_at: {type: Date, default: null}
    , canceled_at: {type: Date, default: null}
});

ordersSchema.pre('save', function (next) {
    if (!this.isNew) {
        next();
        return;
    }

    autoIncrementModelID('activitiesOrders', this, next);
});

module.exports = mongoose.model('orders', ordersSchema);