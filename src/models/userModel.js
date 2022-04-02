const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    title: {
        type: String, trim: true,
        required: true,
        enum: ["Mr", "Mrs", "Miss"]
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        'street': {
            type: String,
            trim: true
        },
        'city': {
            type: String
            , trim: true
        },
        'pincode': {
            type: String,
            trim: true
        }
    }
}, { timestamps: true, versionKey: false })
module.exports = mongoose.model('User', userSchema)