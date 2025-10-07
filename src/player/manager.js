const { Manager } = require('moonlink.js');

module.exports = client => {
    client.moonlink = new Manager({
        nodes: [
      {
        identifier: "node_1",
        host: process.env.LAVALINK_HOST,
        password: process.env.LAVALINK_PASSWORD,
        port: process.env.LAVALINK_PORT,
        secure: false,
      },
    ],
    sendPayload: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(JSON.parse(payload));
    },
    options:{
      disableNativeSources: true,
    }
    })
    return client.moonlink;
}