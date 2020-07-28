# Nini's Cakes

## What is it?

Nini's Cakes NYC is a small business that designs custom cakes and other baked goods. This app displays some of its best products, provides potential customers with info on the business, and allows users to request quotes for orders.

## How it works

The homepage at the '/' route displays Nini's best products. Each image or title can be clicked to display a modal of the product along with a short description of it.

If a user wishes to request a quote for an order then he must login to his user account in the app at '/login'. If the user doesn't have an account then he can register at '/register'. Once registered, the user will receive an email with a temporary password along with a link where he can set his account password. This is done so that the user can verify his email address before logging in.

Once logged in, users can request a quote at '/quote' where they provide contact details and info on their order to Nini. Once submitted, the app emails Nini with the details.

Users who forget their password can utilize the '/forgot-password' route where they'd enter their email and the app would email them a verification code and link to reset the password.

Users who wish to update their name or email, change their password, or delete their account, can do so at the '/profile' route.

The '/about' route displays info about Nini's Cakes. The '/contact' route shows Nini's contact info. The '/logout' route allows users to logout of their accounts.

## Packages used

* aws-sdk
* bcryptjs
* connect-dynamodb
* connect-flash
* ejs
* express
* express-session
* fs
* method-override
* nanoid
* nodemailer
* passport
* passport-local

## Deployment

The app can be accessed at https://niniscakesnyc.com and is deployed on Amazon Web Services (AWS). It uses Route 53 to host the public DNS zone which has an alias record forwarding requests to niniscakesnyc.com to a Cloudfront distribution that is tied to API Gateway. Cloudfront utilizes an SSL cert created in Certificate Manager to ensure all web traffic is passed over https. API Gateway then links the request the the app.

The app's Nodejs code is run in a Lambda function. The API Gateway triggers this function when https requests are made to niniscakesnyc.com (Cloudfront redirects http requests to https). Users, cakes (products), quotes, and sessions are stored in DynamoDB tables. All of the static content for the app (css file, DOM js file, images) are stored in an s3 bucket. There are no html files, instead the files are ejs and are rendered on the Lambda/server end, and therefore not stored in s3. Finally, all emails are sent using SES.