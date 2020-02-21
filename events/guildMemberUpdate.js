// Emitted whenever a guild member changes - i.e. new role, removed role, nickname.
const messageAuto = require("../commands/roleChanged");

module.exports = message => {
  if (message.content.startsWith("!roleChanged")) {
    return messageAuto(message);
  }
};
