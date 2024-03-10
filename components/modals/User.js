const { default: mongoose } = require('mongoose');
const mangoose = require('mongoose');

const userSchema = new mangoose.Schema({
    user : {
        type : String,
        required: true
    },
    password : {
        type : String,
        required: true
    },
    id : {
        type : String,
        required: true,
        default: false  // used for optional values
    }
});

module.exports = mongoose.model('User', userSchema)

