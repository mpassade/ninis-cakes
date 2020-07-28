const express = require('express')
const app = express()
const AWS = require('aws-sdk')
const path = require('path')
const flash = require('connect-flash')
const morgan = require('morgan')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('passport')
const DynamoDBStore = require('connect-dynamodb')(session)

require('dotenv').config()
require('./lib/passport.js')

AWS.config.update({
  region: "us-east-1",
  endpoint: process.env.DYNAMODB_URI
})

const port = process.env.PORT || 8000
const dynamodb = new AWS.DynamoDB()
const router = require('./routes/routes.js')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'))

app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        store: new DynamoDBStore({
          client: dynamodb,
          table: 'niniscakes-session'
        }),
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 * 24
        }
    })
)

app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.user = req.user
    res.locals.authenticated = req.isAuthenticated()
    res.locals.errors = req.flash('errors')
    res.locals.success = req.flash('success')
    res.locals.message = req.flash('message')
    res.locals.id = ""
    res.locals.temp = ""
    next()
})

app.use('/', router)

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

// module.exports = app

