const mongoose  =  require('mongoose')

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'I am new here'
    },
    posts: [{
        type: mongoose.Types.ObjectId,
        ref: 'post'
    }]
}, {timestamps: true})

module.exports = mongoose.model('User', UserSchema)