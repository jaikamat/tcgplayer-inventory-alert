require('dotenv').config();
const CardModel = require('./db_connect');
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// find the cards that are losing the most inventory
// limit to a few
// send sms
