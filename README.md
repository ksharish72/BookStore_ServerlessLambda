## Serverless computing of Lambda Function

**Lambda Function Definition**

_Usage_: 
1. index.js file handles the code of lambda function which is getting invoked by an SNS source
2. circleCI job triggers as soon as the function is updated and pushed to the repository
3. Updated Lambda function is zipped and placed in S3 bucket for the lambda function new version update
4. Lambda code is written in `Nodejs` with `aws-sdk` support to trigger email to the recipient 

**How to update Lambda function**

`aws lambda update-function-code --function-name  forgotPassword \`
`--s3-bucket S3_Bucket --s3-key  S3KeyZip`

Lambda Handler Definition - `index.handler`
