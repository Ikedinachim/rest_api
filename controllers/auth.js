const {validationResult}  =  require('express-validator')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

exports.signUp = (req, res, next) => {
const email = req.body.email;
const password = req.body.password;
const name = req.body.name;
const error = validationResult(req)
if (!error.isEmpty()) {
   const err = new Error('Validation Failed!');
   err.statusCode = 422;
   err.data = error.array()
   throw err 
}

bcrypt.hash(password, 12)
.then(hashedPassword => {
const user = new User({
    name: name,
    email: email,
    password: hashedPassword
})
return user.save()
}).then(result => {
    res.status(201).json({
        message: 'User created Successfully!',
        result: result
    })
})
.catch(err => {
if (!err.statusCode) {
    err.statusCode = 500
    
}
next(err)
})


}

exports.logIn = (req, res, next) => {
    email = req.body.email;
    password = req.body.password;
    let loadedUser;
    User.findOne({email:email}).then(user => {
        if (!user) {
            const err = new Error('User with this email does not exits!')
            err.statusCode = 401;
            throw err
        }
        loadedUser = user;
       return bcrypt.compare(password, user.password);
    }).then(isEqual => {
        if (!isEqual) {
            //password is wrong
            const err = new Error('Wrong Password!')
            err.statusCode = 401;
            throw err
        }
        const token  = jwt.sign({
            userId: loadedUser._id.toString(),
            email: loadedUser.email,
            name: loadedUser.name
        },process.env.SECRET_TOKEN_KEY, {expiresIn: '1h'});

        res.status(200).json({
            message: 'Login Successful',
            token: token,
            userId: loadedUser._id.toString()
        })

    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
            
        }
        next(err)
        })
        
    
}