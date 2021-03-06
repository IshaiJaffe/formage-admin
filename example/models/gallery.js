var mongoose = require('mongoose');
var Types = mongoose.Schema.Types;

var schema = new mongoose.Schema({
    title: { type: String, required: true },
    picture: Types.Picture,
    pictures: [Types.Picture],
    tags: [String]
});

schema.methods.toString = function() {
    return this.title;
};

var gallery = module.exports = mongoose.model('gallery', schema);
