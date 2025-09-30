const { queueEmbed } = require("./embeds");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const row=(p,m)=>new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId("prev").setLabel("⬅").setStyle(ButtonStyle.Secondary).setDisabled(p===0),
  new ButtonBuilder().setCustomId("next").setLabel("➡").setStyle(ButtonStyle.Secondary).setDisabled(p===m),
);

const setup=(msg,i,q,s=10)=>{
  let p=0,m=Math.ceil(q.tracks.length/s)-1;
  const c=msg.createMessageComponentCollector({time:60_000});
  c.on("collect",async b=>{
    if(b.user.id!==i.user.id)return b.reply({content:"❌ Not for you",ephemeral:true});
    if(b.customId==="next"&&p<m)p++;else if(b.customId==="prev"&&p>0)p++;else if(b.customId==="stop")return c.stop();
    await b.update({embeds:[queueEmbed(q,p,s)],components:[row(p,m)]});
  });
  c.on("end",()=>msg.edit({components:[]}).catch(()=>{}));
};
module.exports={setup,row};