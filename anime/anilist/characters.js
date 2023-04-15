const Discord = require('discord.js');
const { MessageActionRow, MessageSelectMenu } = require("discord.js");
require('dotenv').config({ path: __dirname + '/.env' });
const got = require('got');
const imageManipulation = require("./imageManipulation.js")

async function getCharacterList(msg, args) {

  var mediaType="ANIME"
  if(args?.flag!=null){
    if(args?.flag==="a")
      mediaType="ANIME";
    else if(args?.flag==="m")
      mediaType="MANGA";
    else
      mediaType="ANIME";
  }

  var query = `
    query ($search: String){
        Media(type:`+mediaType+`, sort:SEARCH_MATCH, search:$search){
          id
          format
        	status
        	source
        	episodes
          siteUrl
          title {
            english
            userPreferred
          }
          characters(sort:FAVOURITES_DESC) {
            edges{
                 node {
                id
              }
              role
                voiceActors(language:JAPANESE) {
                id
                image {
                  large
                }
                siteUrl
                name {
                  full
                }
              }
              
            }
            nodes{
              name {
                userPreferred
                alternative
              }
              gender
              dateOfBirth {
                year
                month
                day
              }
              favourites
              
              image {
                medium
              }
            }
          }

          coverImage{
            medium
          }

        }
      }

        `;
  var name = args.arg.toString();
  // Define our query variables and values
  var variables = {
    search: name
  };

  // Define the config we'll need for our Api request
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

  


  var characters=[];


  var i = 0;
  while (i < response?.data?.Media?.characters?.nodes?.length) {
    characters.push({
      name: response.data.Media.characters?.nodes[i]?.name?.userPreferred,
      image: response.data.Media.characters?.nodes[i]?.image?.medium,
      birthday: response.data.Media.characters?.nodes[i]?.dateOfBirth?.day,
      birthmonth: response.data.Media.characters?.nodes[i]?.dateOfBirth?.month,
      favorites: response.data.Media.characters?.nodes[i]?.favourites,
      gender: response.data.Media.characters?.nodes[i]?.gender,
      role: response.data.Media.characters?.edges[i]?.role,
      alternative: response.data.Media.characters?.nodes[i]?.name?.alternative[0],
      voice: response.data.Media.characters?.edges[i]?.voiceActors[0]?.name?.full
    });

    i++;
  }
  
 

  var buffer = await imageManipulation.createCharactersImage(characters, response);
  var attachment = new Discord.MessageAttachment(buffer, 'image.webp');


  const exampleEmbed = new Discord.MessageEmbed()
  .setURL('https://discord.js.org/')
  .setAuthor({ name: ""+response.data.Media.title.userPreferred, url: ""+response.data.Media.siteUrl })
  .setImage('attachment://image.webp')


  return await msg.channel.send({ embeds: [exampleEmbed],files: [attachment] });





}






module.exports = {
  getCharacterList
}
