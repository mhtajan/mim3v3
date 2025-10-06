
const client = require('../app/bot');
const { EmbedBuilder } = require('discord.js');
const { queueEmbed } = require('./embeds');
const { setup, row } = require('./collector');


client.on("raw", (data) => {
  client.moonlink.packetUpdate(data);
});

async function play(i) {
  const q = i.options.getString("song");
  const p = client.moonlink.createPlayer({
    guildId: i.guild.id,
    voiceChannelId: i.member.voice.channel.id,
    textChannelId: i.channel.id,
    selfDeaf: true,
    volume: 50,
  });

  let source = /https:\/\/open\.spotify\.com\/(track|album|artist|playlist)\/[A-Za-z0-9]{22}/.test(q.toString()) ? "Spotify" : "youtube";

  const r = await client.moonlink.search({query: q.toString(), source: source}, i.user);
    if(r.loadType === "empty") return i.reply({content:"No results found.",ephemeral:!0}).then(()=>setTimeout(()=>i.deleteReply(),1e4));
    if(r.loadType === "error") return i.reply({content:"There was an error while searching.",ephemeral:!0}).then(()=>setTimeout(()=>i.deleteReply(),1e4));
    if(r.loadType === "no_matches") return i.reply({content:"No matches found.",ephemeral:!0}).then(()=>setTimeout(()=>i.deleteReply(),1e4));
    if (r.loadType === "playlist") {
        i.reply(`Added playlist **${r.playlistInfo.name}** (${r.tracks.length} songs)`);
        r.tracks.forEach(t => p.queue.add(t));
    }else{
        p.queue.add(r.tracks[0]);
        i.reply(`Added **${r.tracks[0].title}** to the queue`);
    }
    p.playing || p.play();
}

const checkVoiceChannel = i => i.member.voice.channel ? true : (i.reply({ content: "Error: You must be in a voice channel to execute this command.", ephemeral: true }), false);
const checkNodeConnection = i => (n=client.moonlink.nodes.get("default"))&&n.connected|| (i.reply({content:"Error: Lavalink node not connected.",ephemeral:!0}).then(()=>setTimeout(()=>i.deleteReply(),1e4)),0);

const getPlayer = i => client.moonlink.players.cache.get(i.guild.id) || (i.reply({content:"Mim3 is currently not playing.",withResponse:true}), null);
const pause     = i => checkVoiceChannel(i) && checkNodeConnection(i) && (p=getPlayer(i)) && (p.pause(),     i.reply("Playback paused."));
const resume    = i => checkVoiceChannel(i) && checkNodeConnection(i) && (p=getPlayer(i)) && (p.resume(),    i.reply("Playback resumed."));
const stop      = i => checkVoiceChannel(i) && checkNodeConnection(i) && (p=getPlayer(i)) && (p.destroy(),   i.reply("Playback stopped and queue cleared."));
const skip      = i => checkVoiceChannel(i) && checkNodeConnection(i) && (p=getPlayer(i)) && (p.skip(),      i.reply("Skipped current track."));
const volume    = i => checkVoiceChannel(i) && checkNodeConnection(i) && (p=getPlayer(i)) && (p.setVolume(v=i.options.getInteger("volume")), i.reply(`Volume set to ${v}%`));
const nonStop   = i => checkVoiceChannel(i) && checkNodeConnection(i) && (p=getPlayer(i)) && (p.autoLeave=!p.autoLeave, p.autoPlay=!p.autoPlay, i.reply(`Non-stop mode is now **${p.autoLeave?"enabled":"disabled"}**`));
const clearQueue= i => checkVoiceChannel(i) && checkNodeConnection(i) && (p=getPlayer(i)) && (p.queue.clear(),   i.reply("Queue cleared."));
const shuffle   = i => checkVoiceChannel(i) && checkNodeConnection(i) && (p=getPlayer(i)) && (p.queue.shuffle(), i.reply("Queue shuffled."));
const getQueue=i=>(p=getPlayer(i))?p.queue:null;
const queue=async i=>{const q=getQueue(i);if(!q)return null;const s=10,m=Math.max(1,Math.ceil(q.tracks.length/s)-1);setup(await i.reply({embeds:[queueEmbed(q,0,s)],components:[row(0,m)],ephemeral:true}),i,q,s);};
const eightD    = i => checkVoiceChannel(i) && checkNodeConnection(i) && (p=getPlayer(i)) && (p.filters.setRotation({rotationHz: 0.2}), i.reply(`8D mode is now enabled.`));
const disable8D = i => checkVoiceChannel(i) && checkNodeConnection(i) && (p=getPlayer(i)) && (p.filters.setRotation({rotationHz: 0}), i.reply("8D mode disabled."));
const bassBoost = i => checkVoiceChannel(i) && checkNodeConnection(i) && (p=getPlayer(i)) && (p.filters.setEqualizer([{band:0,gain:0.6},{band:1,gain:0.7},{band:2,gain:0.8},{band:3,gain:0.55},{band:4,gain:0.25}])
, i.reply("Bass boost enabled."));
const disableBassBoost = i => checkVoiceChannel(i) && checkNodeConnection(i) && (p=getPlayer(i)) && (p.filters.setEqualizer([]), i.reply("Bass boost disabled."));
const autoLeave = i => checkVoiceChannel(i) && checkNodeConnection(i) && (p=getPlayer(i)) && (p.setAutoLeave=!p.setAutoLeave, i.reply(`Auto-leave is now **${p.setAutoLeave?"enabled":"disabled"}**`));



const stat = i => {
  const s = client.moonlink.nodes.get("default").getSystemStats();
  const t = Math.floor(process.uptime());
  const [d,h,m,sec] = [t/86400,(t%86400)/3600,(t%3600)/60,t%60].map(Math.floor);
  i.reply({embeds:[new EmbedBuilder().setColor(0x00ff99).setTitle("📊 Bot Statistics")
    .addFields(
      {name:"🟢 Uptime",value:`\`${d}d ${h}h ${m}m ${sec}s\``},
      {name:"💾 Memory Usage",value:`\`${(s.memoryUsage/1024/1024).toFixed(2)} MB\``},
      {name:"🧠 CPU Load",value:`\`${(s.cpuLoad*100).toFixed(2)}%\``}
    )
    .setFooter({text:`Requested by ${i.user.username}`,iconURL:i.client.user.avatarURL()})
    .setTimestamp()]});
};

const commands = { 
  play, pause, queue, resume, skip, stop, volume,
  "non-stop": nonStop, "clear-queue": clearQueue,
  stat, shuffle 
};

module.exports = async function handleInteraction(i) {
  if (i.isChatInputCommand && commands[i.commandName]) {
    await commands[i.commandName](i);
  }
};