const mongoose = require("mongoose");

const AuthorSchema = new mongoose.Schema({
    AuthorID: {
        type: Number,
        required: true,
        unique: true
    },
    AuthorName: {
        type: String,
        required: true
    },
    AuthorNameBN: {
        type: String,
        required: true
    },
    AuthorPhoto: {
        type: String,
        required: true
    },
    AuthorDesc: {
        type: String,
        required: true
    },
    AuthorSlug: {
        type: String,
        required: true,
        unique: true
    },
    BookCount: {
        type: Number,
        required: true,
        default: 0
    },
    Deleted: {
        type: Boolean,
        required: true,
        default: false
    },
    Popular: {
        type: Boolean,
        required: true,
        default: false
    }
}).index({
    AuthorName: "text", AuthorNameBN: 'text'
})

const AuthorModel = mongoose.model("authors", AuthorSchema);
AuthorModel.createIndexes()
module.exports = AuthorModel;
