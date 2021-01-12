const express = require('express')
const router = express.Router()
const passport = require('passport')
const authMethods = require('../middleware/auth')
const methodOverride = require('method-override')
const checkAuthenticated = authMethods.checkAuthenticated
const checkNotAuthenticated = authMethods.checkNotAuthenticated

//Temporary User variable
const credential = require('../user')
const users = credential.users

//Passport Configuration
const initializePassport = require('../passport-config')
initializePassport(
    passport, 
    email => users.find(users => users.email === email),
    id => users.find(user => user.id === id)
)

router.use(passport.initialize())
router.use(passport.session())
router.use(methodOverride('_method'))

router.get('/',checkNotAuthenticated, (req, res) => {
    // This route is here just to make sure that user cannot enter login page again once they login (basically prevent user from logging in more than once)
    // The middleware, checkNotAuthenticated, is called here to check if the user is already logged in.
})

router.post('/', checkNotAuthenticated, passport.authenticate('local'), (req, res) => {
    res.send("Successful Log In")
})

module.exports = router