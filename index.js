"use strict";
const AWS = require("aws-sdk");
const REGION = "us-east-1";

const ses = new AWS.SES();
const documentClient = new AWS.DynamoDB.DocumentClient({ region: REGION });
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
exports.handler = (event, context, callback) => {
  console.log(event);
  const messageData = JSON.parse(event.Records[0].Sns.Message);
  console.log(messageData);
  const NoDataMessage = "No password reset link!";
  const WithdataMessage = "Password reset link!. \n\n";
  const emailAddress = messageData.toEmail;
  const UserId = messageData.toEmail;
  const SourceEmail = "noreply@prod.harishsivaprakash.me";
  let uniqueId =
    Math.random().toString(36).substring(2) + Date.now().toString(36);

  const emailParams = {
    Source: SourceEmail,
    Destination: {
      ToAddresses: [emailAddress],
    },
    Message: {
      Body: {
        Text: {
          Data: `Password reset link http://prod.harishsivaprakash.me/reset?email=${emailAddress}&token=${uniqueId}`,
        },
      },
      Subject: { Data: "Reset Password Link" },
    },
  };

  const SECONDS_IN_QUARTER_HOUR = 15 * 15;
  const secondsSinceEpoch = Math.round(Date.now() / 1000);
  const expirationTime = secondsSinceEpoch + SECONDS_IN_QUARTER_HOUR;
  const getParams = {
    TableName: "csye6225",
    Key: {
      id: emailAddress,
    },
  };
  documentClient.get(getParams, function (err, responseData) {
    if (isEmpty(responseData)) {
      //if not present
      console.log("Item not present "+ responseData)
      const DDBParams = {
        TableName: "csye6225",
        Item: {
          id: emailAddress,
          User_Id: emailAddress,
          UserTTL: expirationTime,
          token: uniqueId,
        },
      };
    
      ses.sendEmail(emailParams, function (err, data) {
        callback(null, { err: err, data: data });
        if (err) {
          console.log(err);
        } else {
          console.log(data);
          documentClient.put(DDBParams, function (err, data) {
            if (err) console.log(err);
            else console.log(data);
          });
        }
      });
    } else {
      //if present
      console.log("Item present "+responseData);
      var ttl=responseData.Item.UserTTL;
      if(ttl!=0 && ttl<secondsSinceEpoch){
        ///ttl expired,creating new token
        const DDBParams = {
          TableName: "csye6225",
          Item: {
            id: emailAddress,
            User_Id: emailAddress,
            UserTTL: expirationTime,
            token: uniqueId,
          },
        };
      
        ses.sendEmail(emailParams, function (err, data) {
          callback(null, { err: err, data: data });
          if (err) {
            console.log(err);
          } else {
            console.log(data);
            documentClient.put(DDBParams, function (err, data) {
              if (err) console.log(err);
              else console.log(data);
            });
          }
        });
      }
    }
  });


};
