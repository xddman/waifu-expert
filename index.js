const Discord = require('discord.js');
const client = new Discord.Client({
  intents: 32767,
});

const followuser= require('./anime/anilist/followuser.js');
const youdl = require('./utility/youtubedl.js');
const commander = require('./commands/commandselector.js');
const interactionhandler = require("./commands/interactionhandler.js");
const process = require('node:process');


require('dotenv').config({path: __dirname+'/.env'});

var countspeed = 1;
//console.log("ENV ==========>"+JSON.stringify(process.env));

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  var minutes = 120, the_interval = minutes * 60 * 1000;
  followuser.checkUserServers(client).catch((Exception) => {console.log(Exception)});
  setInterval(function() {
    followuser.checkUserServers(client).catch((Exception) => {console.log(Exception)});
  }, the_interval);




  let commands;
  commands=client.application?.commands;
  //commands?.create({name: 'ping1', description: 'replies with pong.'});


});


client.on("messageDelete", function (message) {
  //console.log(`[message deleted] ` +message.author.username + `: ${message}`);
});


client.on('messageCreate', async msg => {
  
  if (msg.content.startsWith(process.env.BOT_PREFIX)) {
    await commander.commandSelector(msg, client).catch();
  }
  















  if (msg.content.startsWith(process.env.BOT_PREFIX+"count")) {
    var timer = countspeed;
    try {
      if (msg.content.includes(" ")) {
        timer = msg.content;
        timer = timer.split(" ")[1];
        timer = Number(timer);
        if (timer < 0.4 || timer > 5.0) {
          timer = 1.35;
        }
      }
    } catch (Exception) { }
    if (isNaN(timer))
      timer = 1.35;
    console.log(timer);
    for (let i = 3; i > -1; i--) {
      if (i > 0) {
        console.log(i);
        msg.channel.send("" + i);
      } else {
        console.log("go");
        msg.channel.send("go");
      }

      await sleep(timer * 1000);
    }
  }

  if (msg.content.startsWith(process.env.BOT_PREFIX+"cspeed ")) {

    try {
      countspeed = Number(msg.content.split(" ")[1]);
      if (countspeed < 0.4 || countspeed > 5.0) {
        countspeed = 1;
      }
    } catch (Exception) { }

    if (isNaN(countspeed))
      countspeed = 1;

    console.log(countspeed);
  }


  if (msg.author.id == process.env.BOT_OWNER) {
    if (msg.content.includes("!ytdl ")) {
      youdl(msg, "!ytdl ").catch();
    }
    if (msg.content.includes("!ytdl2 ")) {
      youdl(msg, "!ytdl2 ").catch();
    }
    if (msg.content.includes("!ytdl3 ")) {
      youdl(msg, "!ytdl3 ").catch();
    }
    if (msg.content.includes("!ytdl4 ")) {
      youdl(msg, "!ytdl4 ").catch();
    }
    if (msg.content.includes("!ytdlsave ")) {
      youdl(msg, "!ytdlsave ").catch();
    }
  }

});

client.on('interactionCreate', async interaction => {

  interactionhandler.interactionHandler(interaction).catch((Exception) => {console.log(Exception)});



});



function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}





















client.login(process.env.BOT_TOKEN);