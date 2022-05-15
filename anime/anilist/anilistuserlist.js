const { setNonEnumerableProperties } = require('got');
const got = require('got');
const anilistuserid = require('./anilistuserid.js');
const Discord = require('discord.js');

module.exports = async function getUserAnilistList(msg, botCommand){
    var response=await anilistuserid(msg,botCommand);
    
    var userid=response.data.User.id;
    var useravatar=response.data.User.avatar.medium;
    var username=response.data.User.name;
    var userurl=response.data.User.siteUrl;
    console.log(userid);
    if(isNaN(userid)){return;}
    try{
    var sortType=msg.content.split(" ")[2];

    }catch(Exception){msg.react("❌");};
    var mediacount=10;
    var page=0;
    var descript="User's Anime Milestones:\n";
    console.log("Users anime milestones:")
    try{

        while(mediacount>0){
            page+=1;
        //mediaList(userId:$search, type:ANIME, status_not:PLANNING) {
        //status_not:PLANNING
        var url = 'https://graphql.anilist.co';
        if(botCommand.command.includes("milestonecomp")){
        if(sortType==="finished"||sortType==="FINISHED_ON_DESC"){
            sortType="FINISHED_ON_DESC";
            query = `
            query ($search: Int, $page: Int) { 
                Page(perPage:50, page: $page){
                    mediaList(userId: $search, type:ANIME, status:COMPLETED, sort: FINISHED_ON_DESC) {
                        id
                        status
                        score
                        completedAt {
                            year
                            month
                            day
                            
                        }
                        media {
                            id
                            title {
                                romaji
                                english
                                native
                                userPreferred
                            }
                        }
                    }
                    pageInfo {
                        total
                        perPage
                        currentPage
                        lastPage
                        hasNextPage
                    }
                }
            }
        `;
        }else{
            sortType="UPDATED_TIME";
        query = `
            query ($search: Int, $page: Int) { 
                Page(perPage:50, page: $page){
                    mediaList(userId: $search, type:ANIME, status:COMPLETED, sort: UPDATED_TIME) {
                        id
                        status
                        score
                        completedAt {
                            year
                            month
                            day
                            
                        }
                        media {
                            id
                            title {
                                romaji
                                english
                                native
                                userPreferred
                            }
                        }
                    }
                    pageInfo {
                        total
                        perPage
                        currentPage
                        lastPage
                        hasNextPage
                    }
                }
            }
        `;
        }
    }else{
        if(sortType==="finished"||sortType==="FINISHED_ON_DESC"){
            sortType="FINISHED_ON_DESC";
            query = `
            query ($search: Int, $page: Int) { 
                Page(perPage:50, page: $page){
                    mediaList(userId: $search, type:ANIME, status_not:PLANNING, sort: FINISHED_ON_DESC) {
                        id
                        status
                        score
                        completedAt {
                            year
                            month
                            day
                            
                        }
                        media {
                            id
                            title {
                                romaji
                                english
                                native
                                userPreferred
                            }
                        }
                    }
                    pageInfo {
                        total
                        perPage
                        currentPage
                        lastPage
                        hasNextPage
                    }
                }
            }
        `;
        }else{
            sortType="UPDATED_TIME";
            query = `
            query ($search: Int, $page: Int) { 
                Page(perPage:50, page: $page){
                    mediaList(userId: $search, type:ANIME, status_not:PLANNING, sort: UPDATED_TIME) {
                        id
                        status
                        score
                        completedAt {
                            year
                            month
                            day
                            
                        }
                        media {
                            id
                            title {
                                romaji
                                english
                                native
                                userPreferred
                            }
                        }
                    }
                    pageInfo {
                        total
                        perPage
                        currentPage
                        lastPage
                        hasNextPage
                    }
                }
            }
        `;
        }
    }
        

        variables = {
          search: userid,
          page: page
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
      
        //response["data"]["MediaList"]["progress"];
        mediacount=response.data.Page.mediaList.length;
        try{
            var animenumber=page*50
            console.log(animenumber+": "+response.data.Page.mediaList[49].media.title.userPreferred)
            descript=descript+"\n"+animenumber+": "+response.data.Page.mediaList[49].media.title.userPreferred;

        }catch(err){}
        //console.log(mediacount);
        
        
    }
      
    const mangaembed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(username)
        .setURL(userurl)
        .setThumbnail(useravatar)
        .setDescription(descript)
        .setFooter("Sorting type: "+sortType)

        
        

    return await msg.channel.send({embeds: [mangaembed]})

        }catch(err){
            console.log(err);
            msg.react("❌");
        }
        


}