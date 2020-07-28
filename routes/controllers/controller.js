const AWS = require("aws-sdk")
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs')

const docClient = new AWS.DynamoDB.DocumentClient({
    httpOptions: {
        timeout: 5000
    },
    maxRetries: 3
})

module.exports = {
    home: (req, res) => {
        const params = {
            TableName: "niniscakes-cakes"
        }
        docClient.scan(params, (err, data) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                return res.render('main/home', {cakes: data.Items})
            }
        })
    },

    getRegister: (req, res) => {
        if (req.isAuthenticated()){
            return res.redirect('/')
        }
        return res.render('main/register')
    },

    getSetPwd: (req, res) => {
        if (req.isAuthenticated()){
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
                if (data.Item){
                    if(data.Item.tempPassword){
                        return res.render('main/set-password', {user: data.Item})
                    }
                }
                return res.redirect('/')
            }
        })
    },

    setPwd: (req, res) => {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.newPass, salt)
        const params = {
            TableName: "niniscakes-users",
            Key: {
                "_id": req.params.id
            },
            UpdateExpression: "set password = :h, tempPassword = :t ",
            ExpressionAttributeValues: {
                ":h": hash,
                ":t": false
            }
        }
        docClient.update(params, (err) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                return res.render('main/pwd-set')
            }
        })
    },

    getLogin: (req, res) => {
        if (req.isAuthenticated()){
            return res.redirect('/')
        }
        return res.render('main/login')
    },

    logout: (req, res) => {
        req.logout()
        req.session.destroy(() => {
            return res.redirect('/') 
        })
    },

    getProfile: (req, res) => {
        if (req.isAuthenticated()){
            return res.render('main/profile')
        }
        return res.redirect('/')
    },

    getEdit: (req, res) => {
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
                if (!data.Item || !req.isAuthenticated() || JSON.stringify(data.Item)!==JSON.stringify(req.user)){
                    return res.redirect('/')
                }
                return res.render('main/edit-profile')
            }
        })
    },

    editProfile: (req, res) => {
        const { firstName, lastName, email } = req.body
        const first = req.user.firstName
        const last = req.user.lastName
        const oldEmail = req.user.email
        const params = {
            TableName: "niniscakes-users",
            Key: {
                "_id": req.user._id
            },
            UpdateExpression: "set firstName = :f, lastName = :l, email = :e",
            ExpressionAttributeValues: {
                ":f": firstName,
                ":l": lastName,
                ":e": email
            }
        }
        docClient.update(params, (err) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                if (oldEmail!==email &&
                    (firstName!==first ||
                    lastName!==last)){
                        req.flash('success', 'Name and Email updated')
                        return res.redirect('/profile')
                }
                if (oldEmail===email){
                        req.flash('success', 'Name updated')
                        return res.redirect('/profile')
                }
                if (oldEmail!==email){
                        req.flash('success', 'Email updated')
                        return res.redirect('/profile')
                }
            }
        })
    },

    getChangePwd: (req, res) => {
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
                if (!data.Item || !req.isAuthenticated() || JSON.stringify(data.Item)!==JSON.stringify(req.user)){
                    return res.redirect('/')
                }
                return res.render('main/change-password')
            }
        })
    },

    changePwd: (req, res) => {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.newPass, salt)
        const params = {
            TableName: "niniscakes-users",
            Key: {
                "_id": req.params.id
            },
            UpdateExpression: "set password = :h",
            ExpressionAttributeValues: {
                ":h": hash
            }
        }
        docClient.update(params, (err, data) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                req.flash('success', 'Password changed')
                return res.redirect('/profile')
            }
        })
    },

    deleteUser: (req, res) => {
        const params = {
            TableName: "niniscakes-users",
            Key: {
                "_id": req.user._id
            }
        }
        docClient.delete(params, (err) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                req.session.regenerate(() => {
                    req.flash('message', 'Account deleted')
                    return res.redirect('/login')
                })
            }
        })
    },

    contact: (req, res) => {
        return res.render('main/contact')
    },

    getQuote: (req, res) => {
        if (!req.isAuthenticated()){
            req.flash('message', 'You must login to request a quote')
            return res.redirect('/login')
        }
        return res.render('main/quote')
    },

    quoteEmail: (req, res) => {
        const main = async () => {
            let transporter = nodemailer.createTransport({
                host: process.env.SMTP_URI,
                port: process.env.SMTP_PORT,
                secure: false,
                auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_SECRET
                }
            })
            let mailOptions = {
                from: "Nini's Cakes <niniscakesnyc@gmail.com>",
                to: "niniscakesnyc@gmail.com",
                subject: "New Request",
                text: `Hi Lania. A new quote has been requested. Name: ${req.body.name} Email: ${req.body.email} Phone # ${req.body.number} Type: ${req.body.type ? req.body.type : ''} Frosting: ${req.body.frosting ? req.body.frosting : ''} Tiers ${req.body.tiers ? req.body.tiers : ''} Color: ${req.body.color} Theme: ${req.body.theme} Feeds: ${req.body.feeds ? req.body.feeds : ''} Macarons: ${req.body.macarons ? 'Yes' : 'No'} Cookies: ${req.body.cookies ? 'Yes' : 'No'} Cupcakes: ${req.body.cupcakes ? 'Yes' : 'No'} Needed: ${req.body.date} Additional Comments: ${req.body.comments}`,
                html: `<p>Hi Lania,</p><p>A new quote has been requested:</p><p>Name: ${req.body.name}</p><p>Email: ${req.body.email}</p><p>Phone # ${req.body.number}</p><p>Type: ${req.body.type ? req.body.type : ''}</p><p>Frosting: ${req.body.frosting ? req.body.frosting : ''}</p><p>Tiers ${req.body.tiers ? req.body.tiers : ''}</p><p>Color: ${req.body.color}</p><p>Theme: ${req.body.theme}</p><p>Feeds: ${req.body.feeds ? req.body.feeds : ''}</p><p>Macarons: ${req.body.macarons ? 'Yes' : 'No'}</p><p>Cookies: ${req.body.cookies ? 'Yes' : 'No'}</p><p>Cupcakes: ${req.body.cupcakes ? 'Yes' : 'No'}</p><p>Needed: ${req.body.date}</p><span>Additional Comments:</span><p>${req.body.comments}</p>`,
            }
            await transporter.sendMail(mailOptions)
        }
        main()
        .then(() => {
            return res.render('main/quote-requested')
        })
        .catch(err => {
            return res.send(`Server Error: ${err}`)
        })
    },

    registerEmail: (req, res) => {
        const main = async () => {
            let transporter = nodemailer.createTransport({
                host: process.env.SMTP_URI,
                port: process.env.SMTP_PORT,
                secure: false,
                auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_SECRET
                }
            })
            let mailOptions = {
                from: "Nini's Cakes <niniscakesnyc@gmail.com>",
                to: req.body.email,
                subject: "Welcome to Nini's Cakes!",
                text: `Hi ${req.body.firstName},\nPlease click the following link and use the temporary password to set a new password and complete your registration.\nTemporary Password: ${res.locals.temp}\nLink: https://niniscakesnyc.com/set-password/${res.locals.id}`,
                html: `<p>Hi ${req.body.firstName},</p><p>Please click the below link and use the following temporary password to set a new password and complete your registration.</p><p>Temporary Password: ${res.locals.temp}</p><a href='https://niniscakesnyc.com/set-password/${res.locals.id}'>Complete Registration</a>`,
            }
            await transporter.sendMail(mailOptions)
        }
        main()
        .then(() => {
            return res.render('main/registered')
        })
        .catch(err => {
            return res.send(`Server Error: ${err}`)
        })
    },

    getForgot: (req, res) => {
        if (req.isAuthenticated()){
            return res.redirect('/')
        }
        return res.render('main/forgot-password')
    },

    sendReset: (req, res) => {
        const main = async () => {
            let transporter = nodemailer.createTransport({
                host: process.env.SMTP_URI,
                port: process.env.SMTP_PORT,
                secure: false,
                auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_SECRET
                }
            })
            let mailOptions = {
                from: "Nini's Cakes <niniscakesnyc@gmail.com>",
                to: req.body.email,
                subject: "Password Reset",
                text: `Please use the following link and verification code to reset your password:\nVerification Code: ${res.locals.temp}\nLink: https://niniscakesnyc.com/reset-password/${res.locals.id}`,
                html: `<p>Please use the below link and verification code to reset your password:</p><p>Verification Code: ${res.locals.temp}</p><a href='https://niniscakesnyc.com/reset-password/${res.locals.id}'>Reset Password</a>`,
            }
            await transporter.sendMail(mailOptions)
        }
        main()
        .then(() => {
            req.flash('message', 'A password reset link was just emailed to you')
            return res.redirect('/login')
        })
        .catch(err => {
            return res.send(`Server Error: ${err}`)
        })
    },

    getReset: (req, res) => {
        if (req.isAuthenticated()){
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
                if (data.Item){
                    if (data.Item.verificationCode){
                        return res.render('main/reset-password', {user: data.Item})
                    }
                }
                return res.redirect('/')
            }
        })
    },

    resetPwd: (req, res) => {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.newPass, salt)
        const params = {
            TableName: "niniscakes-users",
            Key: {
                "_id": req.params.id
            },
            UpdateExpression: "set password = :h, verificationCode = :v",
            ExpressionAttributeValues: {
                ":h": hash,
                ":v": ""
            }
        }
        docClient.update(params, (err) => {
            if (err) {
                return res.send(`Server Error: ${err}`)
            } else {
                return res.render('main/pwd-set')
            }
        })
    },

    about: (req, res) => {
        return res.render('main/about')
    },
}