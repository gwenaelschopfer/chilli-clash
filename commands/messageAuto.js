module.exports = message => {
  // Send a message to the bot-test channel
  const botTestChannel = message.client.channels.get(`680342949275631624`);

  botTestChannel.send("My Message");
};
