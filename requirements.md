# Documents Management System
Create an application, that will be a documents management system. Users can upload, view and download files from the app.

There will be two categories of users:
- Admins
- Simple users

Simple users can only view list of files and download files to their devices.
Admins have same possibilities as simple users + permissions to upload files, upload new versions of files, change files names, delete files, register new users (simple or admins).

Implementation Requirements:
- Use Localstack to locally emulate AWS API (use free version of LocalStack (`ACTIVATE_PRO=0`))
- Use serverless framework to build & run the app
- Use DynamoDB to store data (for example: users, passwords, permissions, etc. - anything that should be stored in the DB)
- Use S3 to store documents files
- Use lambdas to create endpoints for frontend app
- For frontend you can use pure JS or any libs/frameworks you want. Just make sure that the app is looking nice

Notes:
- I've tested Localstack with v.2 of AWS SDK (`aws-sdk` lib) and haven't tested it with v.3. In case of any problems with v.3 SDK I would recommend to use v.2 instead
- I can recommend looking [at this demo app](https://docs.localstack.cloud/getting-started/quickstart/) first, to get first overview on how node.js app can be structured using Serverless + LocalStack AWS SDK
- You can also look into the `sample` folder to get first overview on how to get started with Serverless + LocalStack

Helpful resources & docs:
- [LocalStack docs](https://docs.localstack.cloud/getting-started/)
- [Serverless installation & .yml file](https://www.serverless.com/framework/docs/getting-started)
- [LocalStack plugin for Serverless](https://www.serverless.com/plugins/serverless-localstack)
- [Samples on using JS AWS SDK](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sdk-code-samples.html)
- [Javascript AWS SDK](https://docs.aws.amazon.com/sdk-for-javascript/)