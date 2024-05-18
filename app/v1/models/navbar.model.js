const mongoose = require('mongoose');

const NavbarSchema = new mongoose.Schema({
    nav_item_id:{
        type:Number,
        required:true,
        unique:true
    },
    name: {
        type: String,
        required: true
    },
    primaryURL:{
        type: String,
        required: true
    },
    urls:{
        type: Array,
        required: true
    },
    index:{
        type: Number,
        required: true
    }
})

const Navbar = mongoose.model('Navbar', NavbarSchema);
module.exports = Navbar;