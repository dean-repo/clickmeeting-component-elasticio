const { messages } = require('elasticio-node');
const { Logger } = require('@elastic.io/component-commons-library');
const ClickMeetingClient = require('../clickMeetingClient');

const logger = Logger.getLogger();

async function processAction(msg, cfg) {
    const client = new ClickMeetingClient(this, cfg);
    const conferenceId = msg.body.conferenceId;

    logger.info("Looking for: " + conferenceId)

    if (conferenceId === undefined) {
        logger.info("Id is undefined");
    }
    else if (conferenceId === null) {
        logger.info("Id is null");
    }

    const result = await client.makeRequest({
        url: `/conferences/${conferenceId}`,
        method: 'GET',
        body: "{}"
    });

    logger.info(result);

    const conf = {
        statusCode: 200,
        result: result
    };
    //await this.emit('results', messages.newMessageWithBody(conf))
    //return conf;
    return messages.newMessageWithBody({
        responseBody: conf
    });
};

module.exports.process = processAction;