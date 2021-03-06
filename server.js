// const dotenv = require('dotenv').config()
// if (process.env.NODE_ENV !== 'production'){
//     require('dotenv').config()
// }

// Requires
const express = require('express')
const cookieSession = require('cookie-session')
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const cors = require('cors')

//Route Requires
const { checkAuthenticated } = require('./middleware/auth')
const homepage = require('./routes/homepage')
const welcome = require('./routes/welcome')
const login = require('./routes/login')
const register = require('./routes/register')
const takenCourses = require('./routes/takenCourse')
const getUser = require('./routes/getUser')
const Makeup = require('./routes/makeup')
const CurrentTrimester = require('./routes/getCurrentTrimester')
const Enroll = require('./routes/enroll')
const Advice = require('./routes/advice')
const EditTrimester = require('./routes/editTrimester')
const Playground = require('./routes/playground')
const Comments = require('./routes/comments')
const GPCC = require('./routes/gpcc')

//App Uses
app.set("trust proxy", 1)
app.use(express.json());
app.set('view-engine', 'pug')
app.use(express.urlencoded({extended: false}))
app.use(flash())

// Session Setting
// The "session" one works but heroku warns us of memory leak.
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax', // must be 'none' to enable cross-site delivery
        secure: process.env.NODE_ENV === "production", // must be true if sameSite='none'
        maxAge: 24 * 60 * 60 * 1000
    }
}))
// app.use(cookieSession({
//     secret: "secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax', // must be 'none' to enable cross-site delivery
//         secure: process.env.NODE_ENV === "production", // must be true if sameSite='none'
//     }
// }))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// I am not sure why, but there will be CORS error if this "use" is deleted.
app.use(
    cors({
         origin: "http://localhost:3000", // allow to server to accept request from different origin
         methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
         credentials: true, // allow session cookie from browser to pass through
   })
);

//App Route Uses
app.use('/', homepage)
app.use('/welcome', welcome)
app.use('/login', login)
app.use('/register', register)
app.use('/taken-courses', takenCourses)
app.use('/getuser', getUser)
app.use('/makeup', Makeup)
app.use('/getcurrenttrimester', CurrentTrimester)
app.use('/enrollment', Enroll)
app.use('/advice', Advice)
app.use('/edittrimester', EditTrimester)
app.use('/gpcc', GPCC)
app.use('/playground', Playground)
app.use('/comments', Comments)

app.delete('/logout', checkAuthenticated, (req, res) =>{
    req.logOut()
    res.send('Log out successful')
})

// app.get('/logout', (req, res) => {
//     req.logOut()
//     res.send('Log out successful')
// })

app.set('port', 5000);
app.listen(process.env.PORT || app.get('port'))
console.log('Server Running on port localhost:' + app.get('port'));