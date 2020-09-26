const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    cf: {
        type: String,
        // unique: true,
        required: true
    },
    name:{
        type:String,
        required:true
    }
});

mongoose.model('User', userSchema);