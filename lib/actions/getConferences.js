const { messages } = require('elasticio-node');
const { Logger } = require('@elastic.io/component-commons-library');
const ClickMeetingClient = require('../clickMeetingClient');

const logger = Logger.getLogger();

async function processAction(msg, cfg) {
    const client = new ClickMeetingClient(this, cfg);
    let conferenceStatus = msg.body.conferenceStatus;

    logger.info("Status: " + conferenceStatus)

    if (conferenceStatus === undefined) {
        logger.info("Status is undefined");
        conferenceStatus = 'Active';
    }
    else if (conferenceStatus === null) {
        logger.info("Status is null");
        conferenceStatus = 'Inactive';
    }

    const result = await client.makeRequest({
        url: `/conferences/${conferenceStatus}`,
        method: 'GET',
        
    });

    logger.info("Conferences retrieved");
    logger.info(result);

    
    const confs = {
        statusCode: 200,
        results: result
    };

    logger.info("This would be nice to emit:" + confs);

    await this.emit('data', messages.newMessageWithBody(confs));
    return;
};


module.exports.process = processAction;