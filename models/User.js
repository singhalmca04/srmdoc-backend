const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema =  new Schema({
    name: {type:String, default: "", required: true },
    password: {type:String, default: "" },
    email: { type: String, unique: true },
    googleId: String,
    image: String },
    {
        timestamps: true
});

module.exports = mongoose.model('User', UserSchema);