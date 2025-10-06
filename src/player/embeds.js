const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const queueEmbed=(q,p=0,s=10)=>{const st=p*s,n=q.player.current,l=q.tracks.slice(st,st+s).map((t,i)=>`**${st+i+1}.** [${t.title}](${t.url||""})`).join("\n")||"Nothing queued";return new EmbedBuilder().setColor(0x5865f2).setTitle("🎶 Queue").addFields({name:"Now Playing",value:n?`[${n.title}](${n.url||""})`:"Nothing is playing"},{name:`Page ${p+1}/${Math.max(1,Math.ceil(q.tracks.length/s))}`,value:l}).setFooter({text:`${q.tracks.length} track(s) total`});};

module.exports = { queueEmbed };