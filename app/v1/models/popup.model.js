const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PopupSchema = new Schema({
    popupId: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('popup', PopupSchema);
