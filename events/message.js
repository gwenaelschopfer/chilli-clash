// This event will run on every single message received, from any channel or DM.
const checkWar = require("../commands/checkWar");
const messageAuto = require("../commands/messageAuto");

module.exports = (client, message) => {
  if (message.content.startsWith("!checkWar")) {
    return checkWar(message);
  }
  if (message.content.startsWith("!messageAuto")) {
    return messageAuto(message);
  }
};
