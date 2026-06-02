const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema =  new Schema({
    name: {type:String, default: "", required: true },
    password: {type:String, default: "" },
    email: { type: String, unique: true },
    role: { type: String, enum: ['admin', 'student'], default: 'admin' },
    isActive: { type: Boolean, default: true },
    googleId: String,
    image: String },
    {
        timestamps: true
});

module.exports = mongoose.model('User', UserSchema);