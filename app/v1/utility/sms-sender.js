const axios = require("axios");

const { SMSQ_API_KEY, SMSQ_CLIENT_ID } = process.env;

const SendSMS = async (phoneNumber, message) => {
  try {
    const res = await axios.get(
      `http://fmsms.fantasyhost.com.bd/api/v2/SendSMS?ApiKey=${SMSQ_API_KEY}&ClientId=${SMSQ_CLIENT_ID}&SenderId=Student BZR&Message=${message}&MobileNumbers=${phoneNumber}`
    );
    console.log(res.data);
    return res.data;
  } catch (e) {
    console.log(e);
  }
};

module.exports = { SendSMS };
