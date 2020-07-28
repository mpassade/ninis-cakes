const AWS = require("aws-sdk")
const bcrypt = require('bcryptjs')
const nanoid = require('nanoid').nanoid

const docClient = new AWS.DynamoDB.DocumentClient({
    httpOptions: {
        timeout: 5000
    },
    maxRetries: 3
})

module.exports = {
    checkRegister: (req, res, next) => {
        const { firstName, lastName, email } = req.body
        if (!firstName || !lastName || !email){
            req.flash('errors', 'All fields are required')
            return res.redirect('/register')
        }
        next()
    },

    duplicateAccount: (req, res, next) => {
        const params = {
            TableName: "niniscakes-users",
            ExpressionAttributeNames: {
                '#email': 'email'
            },
            ExpressionAttributeValues: {
                ":e": req.body.email
            },
            FilterExpression: "#email = :e"
        }
        docClient.scan(params, (err, data) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                if(data.Items.length){
                    req.flash('errors', 'An account with that email address already exists')
                    return res.redirect('/register')
                }
                next()
            }
        })
    },

    createId: (req, res, next) => {
        res.locals.id = nanoid()
        const params = {
            TableName : "niniscakes-users",
            Key: {
                '_id': res.locals.id
            }
        }
        const getId = (err, data) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                if (data.Item){
                    res.locals.id = nanoid()
                    params.Key = {
                        "_id": res.locals.id
                    }
                    docClient.get(params, getId)
                } else {
                    return next()
                }
            }
        }
        docClient.get(params, getId)
    },

    checkPwds: (req, res, next) => {
        const { tempPass, newPass, confirmNew } = req.body
        if (!tempPass || !newPass || !confirmNew){
            req.flash('errors', 'All fields are required')
            return res.redirect(`/set-password/${req.params.id}`)
        }
        next()
    },

    checkTemp: (req, res, next) => {
        const params = {
            TableName : "niniscakes-users",
            Key: {
                '_id': req.params.id
            }
        }
        docClient.get(params, (err, data) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                if (data.Item){
                    bcrypt.compare(req.body.tempPass, data.Item.password)
                    .then(result => {
                        if (result){
                            return next()
                        }
                        req.flash('errors', 'Invalid Temporary Password')
                        return res.redirect(`/set-password/${req.params.id}`)
                    }).catch(err => {
                        return res.send(`Server Error: ${err}`)
                    })
                } else {
                    return res.redirect('/')
                }
            }
        })
    },

    checkNewPwd: (req, res, next) => {
        const regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/
        if (req.body.newPass !== req.body.confirmNew){
            req.flash('errors', "New passwords don't match")
            return res.redirect(`/set-password/${req.params.id}`)
        }
        if (!regex.test(req.body.newPass) ||
            req.body.newPass.length<8 ||
            req.body.newPass.length>32){
                req.flash('errors', 'Password must be between 8 and 32 characters long. It must contain at least 1 lowercase letter, 1 uppercase letter, and 1 number.')
                return res.redirect(`/set-password/${req.params.id}`)
        }
        next()
    },

    checkLogin: (req, res, next) => {
        const {email, password} = req.body
        if (!email || !password){
            req.flash('errors', 'All fields are required')
            return res.redirect('/login')
        }
        next()
    },

    checkEdit: (req, res, next) => {
        const { firstName, lastName, email } = req.body
        if (!firstName || !lastName || !email){
            req.flash('errors', 'All fields are required')
            return res.redirect(`/edit-profile/${req.params.id}`)
        }
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
                return res.send(`Server Error: ${err}`)
            } else {
                if (data.Items.length && JSON.stringify(data.Items[0])!==JSON.stringify(req.user)){
                    req.flash('errors', 'An account with that email address already exists')
                    return res.redirect(`/edit-profile/${req.user._id}`)
                }
                if (data.Items.length){
                    if (firstName===data.Items[0].firstName && lastName===data.Items[0].lastName){
                        return res.redirect('/profile')
                    }
                }
                next()
            }
        })
    },

    checkPwds2: (req, res, next) => {
        const { oldPass, newPass, confirmNew } = req.body
        if (!oldPass || !newPass || !confirmNew){
            req.flash('errors', 'All fields are required')
            return res.redirect(`/change-password/${req.params.id}`)
        }
        next()
    },

    checkOld: (req, res, next) => {
        const params = {
            TableName : "niniscakes-users",
            Key: {
                '_id': req.params.id
            }
        }
        docClient.get(params, (err, data) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                bcrypt.compare(req.body.oldPass, data.Item.password)
                .then(result => {
                    if (result){
                        return next()
                    }
                    req.flash('errors', 'Old password is incorrect')
                    return res.redirect(`/change-password/${req.params.id}`)
                }).catch(err => {
                    return res.send(`Server Error: ${err}`)
                })
            }
        })
    },

    checkNewPwd2: (req, res, next) => {
        const regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/
        if (req.body.newPass !== req.body.confirmNew){
            req.flash('errors', "New passwords don't match")
            return res.redirect(`/change-password/${req.params.id}`)
        }
        if (!regex.test(req.body.newPass) ||
            req.body.newPass.length<8 ||
            req.body.newPass.length>32){
                req.flash('errors', 'Password must be between 8 and 32 characters long. It must contain at least 1 lowercase letter, 1 uppercase letter, and 1 number.')
                return res.redirect(`/change-password/${req.params.id}`)
        }
        next()
    },

    checkQuote: (req, res, next) => {
        const { name, number, email } = req.body
        if (!name || !number || !email){
            req.flash('errors', 'Name, email, and phone number are required')
            return res.redirect('/quote')
        }
        next()
    },

    verifyUser: (req, res, next) => {
        if (!req.isAuthenticated()){
            return res.redirect('/')
        }
        const params = {
            TableName : "niniscakes-users",
            Key: {
                '_id': req.params.id
            }
        }
        docClient.get(params, (err, data) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                if (JSON.stringify(data.Item)!==JSON.stringify(req.user)){
                    return res.redirect('/')
                } else {
                    next()
                }
            }
        })
    },

    createQuoteId: (req, res, next) => {
        res.locals.id = nanoid()
        const params = {
            TableName : "niniscakes-quotes",
            Key: {
                '_id': res.locals.id
            }
        }
        const getId = (err, data) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                if (data.Item){
                    res.locals.id = nanoid()
                    params.Key = {
                        "_id": res.locals.id
                    }
                    docClient.get(params, getId)
                } else {
                    return next()
                }
            }
        }
        docClient.get(params, getId)
    },

    requestQuote: (req, res, next) => {
        const params = {
            TableName: 'niniscakes-quotes',
            Item: {
                "_id": res.locals.id,
                "requestor": req.user.email,
                "name":  req.body.name,
                "email": req.body.email,
                "number": req.body.number,
                "type": req.body.type,
                "frosting": req.body.frosting,
                "tiers": req.body.tiers,
                "color": req.body.color,
                "theme": req.body.theme,
                "feeds": req.body.feeds,
                "extras": {
                    "macarons": req.body.macarons ? true : false,
                    "cookies": req.body.cookies ? true : false,
                    "cupcakes": req.body.cupcakes ? true : false
                },
                "needed": req.body.date,
                "comment": req.body.comments
            }
        }
        docClient.put(params, (err) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                next()
            }
        })
    },

    register: (req, res, next) => {
        const temp = nanoid()
        res.locals.temp = temp
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(temp, salt)
        const params = {
            TableName: 'niniscakes-users',
            Item: {
                "_id": res.locals.id,
                "email": req.body.email,
                "firstName":  req.body.firstName,
                "lastName": req.body.lastName,
                "password": hash,
                "tempPassword": true
            }
        }
        docClient.put(params, (err) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                next()
            }
        })
    },

    checkReset: (req, res, next) => {
        const { email } = req.body
        if (!email){
            req.flash('errors', 'Please enter your email')
            return res.redirect('/forgot-password')
        }
        next()
    },

    verifyEmail: (req, res, next) => {
        const params = {
            TableName: "niniscakes-users",
            ExpressionAttributeNames: {
                '#email': 'email'
            },
            ExpressionAttributeValues: {
                ":e": req.body.email
            },
            FilterExpression: "#email = :e"
        }
        docClient.scan(params, (err, data) => {
            if (err){
                return res.send(`Server Error: ${err}`)
            } else {
                if (!data.Items.length) {
                    req.flash('errors', 'A user with that email does not exist')
                    return res.redirect('/forgot-password')
                }
                res.locals.id = data.Items[0]._id
                next()
            }
        })
    },

    setTemp: (req, res, next) => {
        const temp = nanoid()
        res.locals.temp = temp
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(temp, salt)
        const params = {
            TableName: "niniscakes-users",
            Key: {
                "_id": res.locals.id
            },
            UpdateExpression: "set verificationCode = :h",
            ExpressionAttributeValues: {
                ":h": hash
            }
        }
        docClient.update(params, (err) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                next()
            }
        })
    },

    checkPwds3: (req, res, next) => {
        const { tempPass, newPass, confirmNew } = req.body
        if (!tempPass || !newPass || !confirmNew){
            req.flash('errors', 'All fields are required')
            return res.redirect(`/reset-password/${req.params.id}`)
        }
        next()
    },

    verifyCode: (req, res, next) => {
        const params = {
            TableName : "niniscakes-users",
            Key: {
                '_id': req.params.id
            }
        }
        docClient.get(params, (err, data) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                if (data.Item){
                    bcrypt.compare(req.body.tempPass, data.Item.verificationCode)
                    .then(result => {
                        if (result){
                            return next()
                        }
                        req.flash('errors', 'Invalid Verification Code')
                        return res.redirect(`/reset-password/${req.params.id}`)
                    }).catch(err => {
                        return res.send(`Server Error: ${err}`)
                    })
                } else {
                    return res.redirect('/')
                }
            }
        })
    },

    checkNewPwd3: (req, res, next) => {
        const regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/
        if (req.body.newPass !== req.body.confirmNew){
            req.flash('errors', "New passwords don't match")
            return res.redirect(`/reset-password/${req.params.id}`)
        }
        if (!regex.test(req.body.newPass) ||
            req.body.newPass.length<8 ||
            req.body.newPass.length>32){
                req.flash('errors', 'Password must be between 8 and 32 characters long. It must contain at least 1 lowercase letter, 1 uppercase letter, and 1 number.')
                return res.redirect(`/reset-password/${req.params.id}`)
        }
        next()
    },
}