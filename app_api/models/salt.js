const mongoose = require('mongoose');

const saltSchema = new mongoose.Schema({
    value: {
        type: String,
        required: true
    }
});

// compile module
mongoose.model('Salt', saltSchema);