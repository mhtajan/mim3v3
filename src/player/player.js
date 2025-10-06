const { Manager, PlayerManager } = require("moonlink.js");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const client = require("../app/bot.js");
const setupManager = require("./manager.js");
const { Events, ActivityType } = require("discord.js");
const handleInteraction = require("./functions.js");

setupManager(client);
client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.moonlink.init(client.user.id);
});

client.on(Events.InteractionCreate, handleInteraction);

client.moonlink.on("nodeCreate", (node) => {
  console.log(`${node.host} was created`);
});
client.moonlink.on("nodeConnect", (node) => {
  console.log(`${node.host} was connected`);
});
client.moonlink.on("nodeDisconnect", (node) => {
  console.log(`${node.host} was disconnected`);
});
client.moonlink.on("nodeError", (node, error) => {
  console.error(`Node error: ${error.message}`);
});

const playerEmbeds = new Map();

client.moonlink.on("trackStart", async (p, t) => {
  const ch = client.channels.cache.get(p.textChannelId); if (!ch) return;
  if (playerEmbeds.has(p.textChannelId)) ch.messages.delete(playerEmbeds.get(p.textChannelId)).catch(()=>{});
  playerEmbeds.set(p.textChannelId,(await ch.send({embeds:[new EmbedBuilder().setTitle(t.title).setURL(t.url).setImage(t.artworkUrl).setFooter({text:"Now Playing 🎵"}).setTimestamp()]})).id);
  client.user.setPresence({status:"online",activities:[{name:t.title,type:ActivityType.Watching,url:t.url}]});
});

client.moonlink.on("trackEnd", () => client.user.setPresence({status:"online"}));



