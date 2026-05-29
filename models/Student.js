const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
    name: {type:String, default: "", required: true },
    address: {type:String, default: "" },
},{
        timestamps: true
});

module.exports = mongoose.model('Student', StudentSchema);