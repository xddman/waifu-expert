const Discord = require('discord.js');
const {MessageActionRow, MessageSelectMenu} = require("discord.js");


async function getCharacters(msg, botCommand, id){
    try{
      var name="";
      try{
        name = msg.content.toString();
        var x = "!va ";
        if(!name.includes(" we at")){
          name=name+" we at"
        }
        var y= " we at";
        name = await name.substring(name.indexOf(x) + x.length, name.lastIndexOf(y));
      }catch(Exception){
          try{
              name = id.toString().split("|")[1]
          }catch(Exception){}
      }

      var sIndex;
      if(id.includes("notset"))
          sIndex=0;
      else
          sIndex=parseInt(id.toString().split("|")[0]);


    
          //anilist query
          var query = `
      query ($search: String) {
          Page{
          characters(search:$search){
            name {
              userPreferred
            }
            image {
              large
            }
            siteUrl
            media(perPage:1, type:ANIME){
              edges{
                  voiceActors(language:JAPANESE) {
                  id
                  image {
                    large
                  }
                  siteUrl
                  name {
                    full
                  }
                  characters(page:0 perPage:5, sort:FAVOURITES_DESC) {
                    nodes{
                      name {
                        userPreferred
                      }
                      media(sort:POPULARITY_DESC){
                        nodes{title{romaji}}
                      }
                    }
                  }
                }
                node{
                  title{
                    english
                    userPreferred
                  }
                  id
                }
              }
            }
            
            
          }
        }
        }
          `;
          
          // Define our query variables and values
          var variables = {
              search: name
          };
          
          // Define the config 
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
          

          console.log(""+response.data.Page.characters[sIndex]["name"]["userPreferred"]);
          test = [{
              label:""+response.data.Page.characters[sIndex]["name"]["userPreferred"].slice(0,90),
              value:"0|"+name
          }];

          var listlenght = response.data.Page.characters.length;
          if(listlenght>24)
              listlenght=24
          for(let q = 1; q < listlenght; q++){
              var checkVA="Nada--";
              try{
              checkVA=response.data.Page.characters[q]["media"]["edges"][0]["voiceActors"][0];
              }catch(Exception){}
              if(checkVA==="Nada--"){}
              else{
                  var labelName=""+response.data.Page.characters[q]["name"]["userPreferred"]+" ("+response.data.Page.characters[q].media.edges[0].node.title["userPreferred"]+")";
                  test.push({
                      label:labelName.slice(0,99),
                      value:""+q+"|"+name
                  });
              }
          }

          

          
          //console.log(response.data.Page.characters[sIndex]["name"]["userPreferred"]);
          var animeid=response.data.Page.characters[sIndex]["media"]["edges"][0]["voiceActors"][0]["name"]["full"];
          var aactorurl=response.data.Page.characters[sIndex]["media"]["edges"][0]["voiceActors"][0]["siteUrl"];
          var actorimage=response.data.Page.characters[sIndex]["media"]["edges"][0]["voiceActors"][0]["image"]["large"];
          var animetitle=response.data.Page.characters[sIndex]["media"]["edges"][0]["node"]["title"]["english"];
          var link=response.data.Page.characters[sIndex]["siteUrl"];
          var charimage=response.data.Page.characters[sIndex]["image"]["large"];
          var charname=response.data.Page.characters[sIndex]["name"]["userPreferred"];
          var altroles="";
          try{altroles=altroles+"\n"+response.data.Page.characters[sIndex]["media"]["edges"][0]["voiceActors"][0]["characters"]["nodes"][0]["name"]["userPreferred"];
          altroles=altroles+" ("+response.data.Page.characters[sIndex]["media"]["edges"][0]["voiceActors"][0]["characters"]["nodes"][0]["media"]["nodes"][0]["title"]["romaji"]+")";}catch(Exception){}
          
          try{altroles=altroles+"\n"+response.data.Page.characters[sIndex]["media"]["edges"][0]["voiceActors"][0]["characters"]["nodes"][1]["name"]["userPreferred"];
          altroles=altroles+" ("+response.data.Page.characters[sIndex]["media"]["edges"][0]["voiceActors"][0]["characters"]["nodes"][1]["media"]["nodes"][0]["title"]["romaji"]+")";}catch(Exception){}
          try{altroles=altroles+"\n"+response.data.Page.characters[sIndex]["media"]["edges"][0]["voiceActors"][0]["characters"]["nodes"][2]["name"]["userPreferred"];
          altroles=altroles+" ("+response.data.Page.characters[sIndex]["media"]["edges"][0]["voiceActors"][0]["characters"]["nodes"][2]["media"]["nodes"][0]["title"]["romaji"]+")";}catch(Exception){}
          try{altroles=altroles+"\n"+response.data.Page.characters[sIndex]["media"]["edges"][0]["voiceActors"][0]["characters"]["nodes"][3]["name"]["userPreferred"];
          altroles=altroles+" ("+response.data.Page.characters[sIndex]["media"]["edges"][0]["voiceActors"][0]["characters"]["nodes"][3]["media"]["nodes"][0]["title"]["romaji"]+")";}catch(Exception){}
          try{altroles=altroles+"\n"+response.data.Page.characters[sIndex]["media"]["edges"][0]["voiceActors"][0]["characters"]["nodes"][4]["name"]["userPreferred"];
              altroles=altroles+" ("+response.data.Page.characters[sIndex]["media"]["edges"][0]["voiceActors"][0]["characters"]["nodes"][4]["media"]["nodes"][0]["title"]["romaji"]+")";}catch(Exception){}
    
          console.log(animeid+" - "+animetitle+" - "+link);
          var search={
            id: animeid,
            title:animetitle,
            url:link,
            character:charname,
            actorurl: aactorurl,
            image:actorimage,
            charimage:charimage,
            altroles:altroles
          };


          
          console.log(search.title);
          const mangaembed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setAuthor({ name: search.character, iconURL: search.charimage, url: search.url })
          .setTitle(search.id)
          .setURL(search.actorurl)
          .setThumbnail(search.image)
          .setDescription(search.altroles)
          .setFooter({text:'Anime: '+search.title});




          if(id.includes("notset")){
              const row = new MessageActionRow()
                  .addComponents(
                      new MessageSelectMenu()
                      .setCustomId("2")
                      .setPlaceholder("Other Search Results")
                      .addOptions([
                          test
                      ])
                    );

            return await msg.channel.send({embeds: [mangaembed], components: [row] })
            //return await msg.channel.send({embeds: [mangaembed]});

          }else{
            return await msg.update({embeds: [mangaembed]});
          }

    }catch(Exception){
      console.log(Exception);
      try{msg.react("❌");return 0;}catch(Exception){}}
    
}




module.exports = {
    getCharacters
  }

 
 
 
 
  