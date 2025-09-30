const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const queueEmbed = (q,p=0,s=10)=>{
  const start=p*s,now=q.player.current,list=q.tracks.slice(start,start+s)
    .map((t,n)=>`**${start+n+1}.** [${t.title}](${t.url||""})`).join("\n")||"Nothing queued";
  return new EmbedBuilder().setColor(0x5865f2).setTitle("🎶 Queue")
    .addFields({name:"Now Playing",value:`[${now.title}](${now.url||""})`},{name:`Page ${p+1}/${Math.max(1,Math.ceil(q.tracks.length/s))}`,value:list})
    .setFooter({text:`${q.tracks.length} track(s) total`});
};

module.exports = { queueEmbed };