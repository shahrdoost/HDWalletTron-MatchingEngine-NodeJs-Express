var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const autoIncrementModelID = require('./counterModel');

var reporterSchema = new Schema({
    id: {type: Number, unique: true, min: 1}
    , file: String
    , method: String
    , message: String
    , value: String
    , created_at: {type: Date, default: null}
});

reporterSchema.pre('save', function (next) {
    if (!this.isNew) {
        next();
        return;
    }

    autoIncrementModelID('activitiesReporter', this, next);
});

module.exports = mongoose.model('reporter', reporterSchema);