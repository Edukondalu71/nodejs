// postdata.js
const mongoose = require('mongoose');

const PostObjSchema = mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('PostObj', PostObjSchema);
