const { messages } = require('elasticio-node');
const { Logger } = require('@elastic.io/component-commons-library');
const axios = require('axios');
const qs = require('qs');


const logger = Logger.getLogger();

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

async function getData(config) {
  try {
    let res = await axios({
      url: config.url,
      method: config.method,
      timeout: 8000,
      headers: config.headers,
      data: config.data,
    });
    // Don't forget to return something   
    return res.data;
  }
  catch (err) {
    console.error(err);
  }
}

async function processAction(msg, cfg) {
  logger.info('This is inbound message: %s', JSON.stringify(msg))
  
  const webinarRoomId = msg.body.webinarRoomId;
  const registrationPayload = msg.body.registrationPayload;
  const roomDetails = msg.body.roomDetails;
  const apikey = cfg.apiKey;

  logger.info('This is webinarRoomId: ', webinarRoomId);
  logger.info("--");
  logger.info('This is registrationPayload: ', registrationPayload);
  logger.info("--");
  logger.info('This are roomDetails ' + JSON.stringify(roomDetails));
  logger.info("--");
  let result = new Object();

  let apiCallPayload = new Object();

  try {
    var registrationFormFieldsMap = new Map();
    var regFieldsArray = roomDetails;
    regFieldsArray.forEach(field => { registrationFormFieldsMap.set(camelize(field["label"]), field["id"]) });

    var keys = Object.keys(registrationPayload);
    for (var i = 0; i < keys.length; i++) {
      var regPayload = registrationPayload[keys[i]];
      var regPayloadKeys = Object.keys(regPayload)
      for (var regs = 0; regs < regPayloadKeys.length; regs++) {
        try {
          if (!(registrationFormFieldsMap.get(regPayloadKeys[regs]) === undefined)) {
            apiCallPayload["registration[" + registrationFormFieldsMap.get(regPayloadKeys[regs]) + "]"] = regPayload[regPayloadKeys[regs]]
          }
        }
        catch {
          logger.info("Didn't find the key:" + regPayloadKeys[regs])
        }
      }
    }
    let data = qs.stringify(apiCallPayload);

    logger.info("This is data: " + data)

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.clickmeeting.com/v1/conferences/' + webinarRoomId + '/registration',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Api-Key': apikey
      },
      data: data
    };

    await getData(config).then(res => result = res);

  }
  catch (errr) {
    logger.info("ERROR general errr" + errr);
    result = errr;
  }

  logger.info("Ending string| result: " + JSON.stringify(result));

  return messages.newMessageWithBody({
    responseBody: result
  });
}

module.exports.process = processAction;