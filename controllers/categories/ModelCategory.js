const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategoryShema = new Schema({
    name:{
        type: String,
        require: true
    },
    create_at:{
        type: Date,
        default: Date.now
    },
    update_at:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.models.category || mongoose.model('category', CategoryShema);