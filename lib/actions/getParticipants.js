const { messages } = require('elasticio-node');
const { Logger } = require('@elastic.io/component-commons-library');
const ClickMeetingClient = require('../clickMeetingClient');

const logger = Logger.getLogger();

async function processAction(msg, cfg) {
    const client = new ClickMeetingClient(this, cfg);
    //const {conferenceId} = msg.body;
    //const {sessionId} = msg.body.sessionId;

    const sessionId = msg.body.sessionId;
    const conferenceId = msg.body.roomId;

    logger.info("ConfId: " + conferenceId + " ; sessionId: " + sessionId);

    let getAll = false;
    if (sessionId === undefined) {
        logger.info("sessionId is undefined");
        getAll = true;
    }
    else if (sessionId === null) {
        logger.info("sessionId is null");
        getAll = true;
    }

    let participants = [];
    if (getAll) {
        const allSessions = await client.makeRequest({
            url: '/conferences/' + conferenceId + '/sessions',
            method: 'GET'
        });

        logger.info(allSessions);

        for (i = 0; i < allSessions.length; i++) {
            logger.info("Found " + allSessions[i]["id"])
            let result = await client.makeRequest({
                url: '/conferences/' + conferenceId + '/sessions/' + allSessions[i]["id"],
                method: 'GET'
            });
            
            logger.info("Some people: " + result.length);
            let attends = result["attendees"];

            for (let part = 0; part < attends.length; part++) {
                if (participants.length == 0) {
                    participants[0] = attends[part];
                }
                else {
                    participants[participants.length] = attends[part];
                }
            }
            logger.info("Cycle " + i + "  Participants => " + participants);
        }
    }

    else {
        const result = await client.makeRequest({
            url: '/conferences/' + conferenceId + '/sessions/' + sessionId,
            method: 'GET'
        });
    }

    logger.info(participants);

    let parts = {
        data: participants
    }
    await this.emit('data', messages.newMessageWithBody(parts))
    return;
};

module.exports.process = processAction;