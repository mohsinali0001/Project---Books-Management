const moment = require('moment')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const reviewSchema = new mongoose.Schema({
    bookId: {
        type: ObjectId,
        required: true,
        ref: 'books',
        trim: true
    },
    reviewedBy: {
        type: String,
        default: 'Guest',
        trim: true
    },
    reviewedAt: {
        type: String,
        default: moment().format('YYYY-MM-DD'),
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        trim: true
    },
    review: {
        type: String,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { versionKey: false }
)
module.exports = mongoose.model('review', reviewSchema)
