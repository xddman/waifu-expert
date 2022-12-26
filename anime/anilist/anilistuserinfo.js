const Discord = require('discord.js');
const got = require('got');
const imageManipulation = require("./imageManipulation.js")
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');

async function userInfo(msg, args) {
  var query = `
          query ($search: String){
            User(search:$search) {
              id
              name
              avatar {
                medium
              }
              bannerImage
          favourites {
                  anime(perPage:5) {
                    edges{
                      node{
                        title{
                          userPreferred
                        }
                        coverImage{
                          medium
                        }
                      }
                    }
                  }
              characters(perPage:5){
                edges{
                  node{
                    name {
                      userPreferred
                    }
                    image{
                      medium
                    }
                  }
                }
              }
          }
              statistics{
                manga{
                  count
                  chaptersRead
                }
                      anime {
                        count
                        meanScore
                        minutesWatched
                        episodesWatched
                        genres(sort:COUNT_DESC, limit:5) {
                          genre
                          count
                        }
                        tags(limit:5 sort:COUNT_DESC){
                          tag {
                            name
                          }
                        }
                      }
                    }
              siteUrl
              options{
                profileColor
              }
            }
          }
      `;
  
      var variables = {
        search: "asd"
      };
  var mentionedAnilist="";
  if(args.mentioned===true){

    mentionedAnilist=await getAnilistFromDiscordId(args.mentionId);
    variables = {
      search: mentionedAnilist
    };

  }else if(args.arg.match(/^[0-9]+$/) != null){
    mentionedAnilist=await getAnilistFromDiscordId(args.arg);
    variables = {
      search: mentionedAnilist
    };
  }else if(args.arg===""&&args.mentioned===false){
    mentionedAnilist=await getAnilistFromDiscordId(args.authorId);
    variables = {
      search: mentionedAnilist
    };
  }
  else{

  var name = args.arg.toString();

  variables = {
    search: name
  };
  }

  if(mentionedAnilist===null)
  {
    if(args.arg===""&&args.mentioned===false)
      msg.reply("Anilist not set. Set your anilist with &setmyanilist YourAnilistUsername");
    msg.react("❌");
    return 0;
  }
  var url = 'https://graphql.anilist.co';


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



  var buffer = await imageManipulation.createUserInfoImage(response).catch((Exception) => { console.log(Exception) });
  var attachment = await new Discord.MessageAttachment(buffer, 'image1.png');

  var color1 = await colorPicker(response.data.User?.options?.profileColor);
  console.log(response.data.User?.options?.profileColor);
  const exampleEmbed = new Discord.MessageEmbed()
    .setURL('https://discord.js.org/')
    .setAuthor({ name: "" + response.data?.User?.name, url: "" + response.data?.User?.siteUrl })
    .setImage('attachment://image1.png')
    .setColor(color1)


  return await msg.channel.send({ embeds: [exampleEmbed], files: [attachment] });













}


function colorPicker(str) {
  var color;
  switch (str) {
    case "blue":
      color = "#0000FF";
      break;
    case "purple":
      color = "#6a0dad";
      break;
    case "pink":
      color = "#FFC0CB";
      break;
    case "orange":
      color = "#FFA500";
      break;
    case "red":
      color = "#FF0000";
      break;
    case "green":
      color = "#00FF00";
      break;
    case "gray":
      color = "#808080";
      break;

    default:
      color = "#FFFFFF";
      break;
  }
  return color;
  // (blue, purple, pink, orange, red, green, gray)
}

async function getAnilistFromDiscordId(userId) {

  const db = await sqlite.open({
      filename: __dirname + '/anilist.db',
      driver: sqlite3.Database
  });

  var serverIdSQL= userId;
  var sq = "select anilist_username from anilist_users where discord_id=?";
  const result = await db.all(sq, [serverIdSQL]);
  var anilist=null;
 if(result.length>0) {
  anilist=result[0].anilist_username
 }

  
  db.close();
  //console.log(filteredRatings);
  return anilist;



}


module.exports = {
  userInfo,
  getAnilistFromDiscordId
}