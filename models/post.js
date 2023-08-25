const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {
        required: true,
        type: String,
        
    },
    content: {
        required: true,
        type: String,
        
    },
    imageUrl: {
        required: true,
        type: String,
        
    },
    creator: {
       
            required: true,
            type: mongoose.Types.ObjectId,
            ref: 'User'

       

    },
 
}, {timestamps: true})

module.exports = mongoose.model('Post', PostSchema);