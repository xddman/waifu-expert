const Discord = require('discord.js');
const client = new Discord.Client({
  intents: 32767,
});

const mangaFind = require('./chapterfinder.js');
const youdl = require('./youtubedl.js');
const anilistuserlist = require('./anilistuserlist.js');
const anilistuserid = require('./anilistuserid.js');
const dictionary = require('./dictionary.js');
//const imgProcessing = require('./imageprocessing.js');
const characters = require('./characters.js');

require('dotenv').config();

var countspeed=1;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  //imgProcessing("asd", "!manga ", "notset").catch();
});


client.on("messageDelete", function(message){
  //console.log(`[message deleted] ` +message.author.username + `: ${message}`);
});


client.on('messageCreate', async msg => {
  if(msg.content.includes("!va ")){
    characters.getCharacters(msg,"", "notset").catch();
  }
  if(msg.content.includes("!character ")){
    //characters.getAnimeCharacters(msg).catch();
  }
  if(msg.content.includes("!manga ")){
    mangaFind(msg, "!manga ", "notset").catch();
  }
  if(msg.content.includes("!novel ")){
    mangaFind(msg, "!novel ", "notset").catch();
  }
  if(msg.content.includes("!count")){
    var timer=countspeed;
    try{
      if(msg.content.includes(" ")){
        timer=msg.content;
        timer=timer.split(" ")[1];
        timer=Number(timer);
        if(timer<0.4||timer>5.0){
          timer=1.35;
        }
      }
    }catch(Exception){}
    if(isNaN(timer))
        timer=1.35;
    console.log(timer);
    for (let i = 3; i > -1; i--) {
      if(i>0){
        console.log(i);
        msg.channel.send(""+i);
      }else{
        console.log("go");
        msg.channel.send("go");
      }
      
      await sleep(timer*1000);
   }
  }

  if(msg.content.includes("!milestonecomp")){
    anilistuserlist(msg,"asd");
  }
  if(msg.content.includes("!milestoneall")){
    anilistuserlist(msg,"asd");
  }

  if(msg.content.includes("!definition ")){
    dictionary(msg, "!definition ").catch();
  }

  if(msg.content.includes("!cspeed ")){
    
    try{
      countspeed=Number(msg.content.split(" ")[1]);
      if(countspeed<0.4||countspeed>5.0){
        countspeed=1;
      }
    }catch(Exception){}
    
    if(isNaN(countspeed))
      countspeed=1;

    console.log(countspeed);
  }


  if(msg.content.includes("!anime ")){
    try{
    var search = await anime(msg);
    console.log(search.title);
    //msg.reply(search.title+": "+search.id+" voice acts "+search.character+"\n"+search.url+"\n"+search.actorurl);

    const mangaembed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    //.setAuthor({ name: search.character, iconURL: search.charimage, url: search.url })
    .setTitle(search.title)
    .setURL(search.siteUrl)
    .setThumbnail(search.poster)
    .setDescription(search.description)
    //.setFooter({text:'Anime: '+search.title});

    await msg.channel.send({embeds: [mangaembed]});

    }catch(Exception){}
  }
  
  if(msg.author.id==process.env.BOT_OWNER){
    if(msg.content.includes("!ytdl ")){
      youdl(msg, "!ytdl ").catch();
    }
    if(msg.content.includes("!ytdl2 ")){
      youdl(msg, "!ytdl2 ").catch();
    }
    if(msg.content.includes("!ytdl3 ")){
      youdl(msg, "!ytdl3 ").catch();
    }
    if(msg.content.includes("!ytdl4 ")){
      youdl(msg, "!ytdl4 ").catch();
    }
    if(msg.content.includes("!ytdlsave ")){
      youdl(msg, "!ytdlsave ").catch();
    }
    if(msg.content.includes("!whatep ")){
            
            var useranilist;// = await getuseranilist(msg);
            if(msg.content.includes("joker")){
              useranilist="jokersus";
            }else{
              useranilist="xddman";
            }
            
            if(useranilist=="Not-Found"){
              msg.reply("You are not in our list, please message ur mum to be added");
            }else{
              var search = await animesearch(msg);
              var episodenumb = await userlistsearch(useranilist, search.id);
              

              msg.reply(useranilist+" has seen "+episodenumb+" episodes of "+search.title);
            }
      }

  }
 
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isSelectMenu()) return;

	if (interaction.customId === '1') {
    mangaFind(interaction, "nocommand", ""+interaction.values[0]).catch();
	}
  if (interaction.customId === '2') {
    characters.getCharacters(interaction, "nocommand", ""+interaction.values[0]).catch();
	}


});


async function animesearch(msg){
  var name = msg.content.toString();
  var x = "!whatep ";
  if(!name.includes(" we at")){
    name=name+" we at"
  }
  var y= " we at";
  name = await name.substring(name.indexOf(x) + x.length, name.lastIndexOf(y));


  var query = `
      query ($search: String) { 
        Media (type: ANIME, search: $search) { 
          id
          title {
            english
          }
        coverImage { large }
        description
        bannerImage
        }
      }
      `;
      
      // Define our query variables and values that will be used in the query request
      var variables = {
          search: name
      };
      
      // Define the config we'll need for our Api request
      var url = 'https://graphql.anilist.co';
     
      const got = require('got');
      var response = await got.post(url, {
            json: {
              query,
              variables
          },
          headers: [{
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }],
          responseType: 'json'    
      }).json();
    
      var animeid=response["data"]["Media"]["id"];
      var animetitle=response["data"]["Media"]["title"]["english"];

      return response={
        id: animeid,
        title: animetitle
      };
}

async function userlistsearch(username, animeid){
  const got = require('got');
  try{
  var url = 'https://graphql.anilist.co';
  query = `
    query ($username: String, $mediaid: Int) {
      MediaList (userName: $username, mediaId: $mediaid) { 
        status
        score
        progress
        user {
          id
          name
        }
        media {
          id
          title {
          english
          }
        }
      }
    }
  `;
  
  variables = {
    username: username,
    mediaid: animeid
  };

  var response = await got.post(url, {
    json: {
          query,
          variables
    },
    headers: [{
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }],
    responseType: 'json'    
  }).json();

  return response["data"]["MediaList"]["progress"];

  }catch(err){
    console.log(err);
  }


}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


async function anime(msg){
  var name = msg.content.toString();
  var x = "!anime ";
  if(!name.includes(" we at")){
    name=name+" we at"
  }
  var y= " we at";
  name = await name.substring(name.indexOf(x) + x.length, name.lastIndexOf(y));


  var query = `
      query ($search: String) { 
        Media (type: ANIME, search: $search) { 
          id
          title {
            english
            romaji
          }
        coverImage { large }
        description
        bannerImage
        siteUrl
        }
      }
      `;
      
      // Define our query variables and values that will be used in the query request
      var variables = {
          search: name
      };
      
      // Define the config we'll need for our Api request
      var url = 'https://graphql.anilist.co';
     
      const got = require('got');
      var response = await got.post(url, {
            json: {
              query,
              variables
          },
          headers: [{
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }],
          responseType: 'json'    
      }).json();
    
      var animeid=response["data"]["Media"]["id"];
      var siteUrl=response["data"]["Media"]["siteUrl"];
      var description=response["data"]["Media"]["description"];
      description=description.replace(/<[^>]*>?/gm, '');
      var poster=response["data"]["Media"]["coverImage"]["large"];
      var animetitle="";
      try{
      animetitle=response["data"]["Media"]["title"]["english"];
    }catch(Exception){}
        if(animetitle===null)
        try{
        animetitle=response["data"]["Media"]["title"]["romaji"];  
        }catch(Exception){}

      return response={
        id: animeid,
        title: animetitle,
        poster:poster,
        description:description,
        siteUrl:siteUrl
      };
}

client.login(process.env.BOT_TOKEN);