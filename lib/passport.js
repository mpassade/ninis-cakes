const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const AWS = require("aws-sdk")

AWS.config.update({
    region: "us-east-1",
    endpoint: process.env.DYNAMODB_URI
})

const docClient = new AWS.DynamoDB.DocumentClient()

passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser((id, done) => {
    const params = {
        TableName : "niniscakes-users",
        Key: {
            '_id': id
        }
    }
    docClient.get(params, (err, data) => {
        done(err, data.Item)
    })
})

passport.use(
    'local-login',
    new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    (req, email, password, done) => {
        const params = {
            TableName: "niniscakes-users",
            ExpressionAttributeNames: {
                '#email': 'email'
            },
            ExpressionAttributeValues: {
                ":e": email
            },
            FilterExpression: "#email = :e"
        }
        docClient.scan(params, (err, data) => {
            if (err) {
                return done(err, null)
            } 
            if (!data.Items.length) {
                return done(null, false, req.flash('errors', 'A user with that email does not exist'))
            }
            if (data.Items[0].tempPassword===true){
                return done(null, false, req.flash('errors', 'Please follow the link in the email and set a new password'))
            }
            bcrypt.compare(password, data.Items[0].password)
            .then((result) => {
                if (!result) {
                    return done(null, false, req.flash('errors', 'Check email and password'))
                } else {
                    return done(null, data.Items[0])
                }
            }).catch((error) => {
                return done(error, null)
            })
        })
    })
)