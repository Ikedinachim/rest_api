const express = require('express')
const {body} = require('express-validator')
const User = require('../models/user')
const authController = require('../controllers/auth')

const router = express.Router()



router.put('/signup', [
    body('email').isEmail()
    .withMessage('Enter a valid Email')
    .custom((value,req)=> {
      return  User.findOne({email: value}).then(userDoc => {
            if(userDoc){
              return  Promise.reject('User with this email already exists!!')

            }
        }).catch(err => {
            console.log(err)
        })
         }).normalizeEmail(),
    body('password').isLength({min: 5}).withMessage('Password must contain at least 5 characters'),
    body('name').notEmpty().withMessage('Name is a required field!')
], authController.signUp )


router.post('/login', authController.logIn)


module.exports = router