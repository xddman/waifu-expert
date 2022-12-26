const fs = require('fs');
const Discord = require("discord.js");
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] })
const ytdl = require('ytdl-core');
const { title } = require('process');


module.exports = async function ytdler(msg, botCommand){
  try{
    var tt=botCommand;
    var quality=249;
    var filter=140;
    var exten='.mp4';
    if(botCommand=='!ytdl '){quality=140;filter='audioonly';exten='.ogg'}
    if(botCommand=='!ytdl2 '){quality=249;filter='audioonly';exten='.ogg'}
    if(botCommand=='!ytdl3 '){quality=251;filter='audioonly';exten='.ogg'}
    if(botCommand=='!ytdl4 '){quality=18;filter='videoandaudio';exten='.mp4'}
    if(botCommand=='!ytdlsave '){quality=251;filter='audioonly';exten='.ogg'}
    var str = msg.content.toString();
    botCommand = str.split(botCommand)[1];
    
    //----------------------------------------------------------------*/

    var counter=1;

    var url = botCommand;
    let info = await ytdl.getInfo(ytdl.getURLVideoID(url));
    var title = info['videoDetails']['title'].toString();
    title = title.replace(/[^a-zA-Z ]/g, "");
    console.log(title);
    const stream = ytdl(url, {quality: quality },{ filter: filter })

    stream.pipe(fs.createWriteStream( __dirname+ '/'+title+exten));

    stream.on('response', function(res) {
        var totalSize = res.headers['content-length'];
        var dataRead = 0;
        res.on('data', function(data) {
          dataRead += data.length;
          var percent = dataRead / totalSize;
          percent = parseInt((percent * 100), 10);
          if(percent%20==0)
          console.log(percent + '% ');
        });
        res.on('end', async function() {
          console.log('\nDone');
          if(tt=='!ytdlsave '){
            return await msg.channel.send("Request is downloaded");
          }else{
            try{           //msg.channel.send({ embeds: [exampleEmbed], components: [row], files: [attachment] });
              var attachment = await new Discord.MessageAttachment(__dirname+ "/"+title+exten);
              return await msg.channel.send({content:"Requested: "+title, files: [attachment]}).then((msg) => {
                fs.unlinkSync(__dirname+ "/"+title+exten);
              });
            }catch(err){return console.log(err);}
          }
        });
      });

  }catch(err){
    console.log(err);
  }
}

