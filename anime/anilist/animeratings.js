const Discord = require('discord.js');
const { MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
require('dotenv').config({ path: __dirname + '/.env' });
const search = require('./animesearch.js');
const imageManipulation = require('./imageManipulation.js');
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const anilistgetuserfollowers= require('./anilistgetuserfollowers.js');

var pageCache = {};
var ratingsCache = {};
var filteredRatings={};

async function cacheAnimeRatings(msg, command) {
    var anime = await search.getAnimeSearch(command);

    var query="";
    if(command?.command?.toString()?.substring(1)==="ratings"||command?.command?.toString()?.substring(1)==="rating"){
    query = `
        query ($mediaId: Int, $page: Int) {
            Page(page: $page, perPage:50) {
              mediaList(mediaId: $mediaId, isFollowing: true, sort:[SCORE_DESC,PROGRESS_DESC,STATUS]) {
                id
                user{
                  name
                }
                media {
                  id
                  title {
                    english
                    userPreferred
                  }
                }
                score(format:POINT_10_DECIMAL)
                status
                progress
                repeat
              }
              pageInfo{
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
        else if(command?.command?.toString()?.substring(1)==="myratings"){
           var userIdList = await anilistgetuserfollowers.sortUserIds(msg, command);
            if(userIdList===0)
                return 0;
           query = `
           query ($mediaId: Int, $page: Int) {
            Page(page: $page, perPage:50) {
              mediaList(mediaId: $mediaId, userId_in:[`+userIdList+`], sort:[SCORE_DESC,PROGRESS_DESC,STATUS]) {
                id
                user{
                  name
                }
                media {
                  id
                  title {
                    english
                    userPreferred
                  }
                }
                score(format:POINT_10_DECIMAL)
                status
                progress
                repeat
              }
              pageInfo{
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
        
    var currentPage = 1;
    const got = require('got');
    var url = 'https://graphql.anilist.co';
    var token = "Bearer " + process.env.ANILIST_TOKEN;
    var response = [];
    response["data"] = { Page: { pageInfo: { hasNextPage: true } } };

    
    while (response.data.Page.pageInfo.hasNextPage) {
        try {
            var variables = {
                mediaId: anime.id,
                page: currentPage
            };


           var response1 = await got.post(url, {
                json: {
                    query,
                    variables
                },
                headers: {
                    "Authorization": token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'accept-encoding':'gzip, deflate, br'
                },
                responseType: 'json'
            });
            var headers = response1.headers;
            response=response1.body;
            try{
            console.log("x-ratelimit-remaining: "+headers["x-ratelimit-remaining"]);
            }catch(exc){
                console.log(exc);
                console.log(headers);
            }

            
            var serverID=msg.id.toString();//msg.guildId.toString();
            var tempCache = response.data.Page.mediaList;
            
            if (currentPage === 1){
                ratingsCache[serverID]={};
                ratingsCache[serverID][anime.id] = tempCache;
            }
            else
                ratingsCache[serverID][anime.id] = [...ratingsCache[serverID][anime.id], ...tempCache];

            currentPage++;
            //console.log(response);
        } catch (err) {
            console.log(err);
        }
    }

    return anime;
    //console.log(response);


}

async function getRatings(msg, command, anime, currentPage) {


    
    var first = 0;
    if (currentPage === 0) {
        anime = await cacheAnimeRatings(msg, command);
        if(anime===0)
            return msg.reply("Failed. You are not followed. To add your anilist, use &setmyanilist YourAnilist.");;
        currentPage = 1;
    } else
        first = 1;

    var serverID
        if (first === 0) {
            serverID=msg.id.toString();//msg.guildId.toString();
        } else {
            serverID=msg.message.id.toString();//msg.guildId.toString();
        }

    

    //image stuff
    let width = 770;
    let height = 800;
    var j = 220;
    var spacing = 50;
    var svg = `
        <svg width="${width}" height="${height}">
    `;

    var i = 0;
    var scores = "\n";


    
    var Pages;

    var averageType="List";
    if(command?.command?.toString()?.substring(1)==="ratings"){
        filteredRatings1 = await serverRatingsSorter(anime, msg.guildId.toString(), msg.id.toString());
        filteredRatings={...filteredRatings,...filteredRatings1};
        //averageType="Server"
        
    }
    else if(command?.command?.toString()?.substring(1)==="rating"||command?.command?.toString()?.substring(1)==="myratings"){
        filteredRatings[serverID]={...filteredRatings[serverID], ...ratingsCache[serverID]};
        filteredRatings[serverID][anime.id]["length"]=filteredRatings[serverID][anime.id].length;
        //if(command?.command?.toString()?.substring(1)==="myratings")
            //averageType="User"
       // else
           // averageType="Global";
        
    }
    
    
    Pages = Math.ceil(filteredRatings[serverID][anime.id].length / 11);


    
    i = 0;
    var personalCurrentPage = currentPage - 1;


    //var test1=filteredRatings.length;
    var epch="Ep ";
    if(anime.type==="MANGA")
        epch="Ch "

    while (i < filteredRatings[serverID][anime.id].length - (personalCurrentPage * 11) && i < 11) {

        var iReplacer = i + (personalCurrentPage * 11);
        i++;

        scores = parseFloat(filteredRatings[serverID][anime.id][iReplacer].score);
        if (scores === 0)
            scores = "-";
        else {
            scores = scores.toString() + "/10"
        }

        var progress;
        var progresse;
        switch (filteredRatings[serverID][anime.id][iReplacer].status) {
            case "COMPLETED":
                progress = "Comp";
                progresse = "";//🗸
                break;
            case "PAUSED":
                if(filteredRatings[serverID][anime.id][iReplacer]?.progress>0){
                    progress = epch+filteredRatings[serverID][anime.id][iReplacer]?.progress?.toString();//+" Ep";
                    progresse = '';//Ⅱ
                }
                else{
                    progress="Paused";
                    progresse = "";
                }
                break;
            case "DROPPED":
                if(filteredRatings[serverID][anime.id][iReplacer]?.progress>0){
                    progress = epch+filteredRatings[serverID][anime.id][iReplacer]?.progress?.toString();//+" Ep";
                    progresse = '';}//"";}//☓
                else{//❌×✖χ
                    progress="Dropped";
                    progresse = '';//
                }
                break;
            case "CURRENT":
                if(filteredRatings[serverID][anime.id][iReplacer]?.progress>0){
                    progress = epch+filteredRatings[serverID][anime.id][iReplacer]?.progress?.toString();//+" Ep";
                    progresse = "";//▶
                }
                else{
                    progress="Current";
                    progresse = "";//⏵
                }
                break;
            default:
                if(filteredRatings[serverID][anime.id][iReplacer]?.progress>0){
                    progress = epch+filteredRatings[serverID][anime.id][iReplacer]?.progress?.toString();//+" Ep";
                    progresse = "";//📜
                }
                else{
                    progress="Planning";//
                    progresse = "";}
                break;//💭
        }

        var rewatche="";
        var rewatch="";
        if(filteredRatings[serverID][anime.id][iReplacer]?.repeat>0){
            rewatch=filteredRatings[serverID][anime.id][iReplacer]?.repeat?.toString().substr(0, 2);
            
            
            svg = svg + `
            <text fill="#ffffff" font-size="30" font-family="'fa-solid'"
            x="520" y="${j + spacing * i}">${rewatche}</text>

            <text fill="#ffffff" font-size="35" font-family="Verdana"
            x="560" y="${j + spacing * i}" text-anchor="start">${rewatch}</text>`;
        }

        svg = svg + `
                <text fill="#ffffff" font-size="35" font-family="Verdana"
                    x="5" y="${j + spacing * i}">${filteredRatings[serverID][anime.id][iReplacer].user.name.substr(0, 13)}:</text>
                <text fill="#ffffff" font-size="35" font-family="'fa-solid'"
                    x="320" y="${j + spacing * i}">${progresse}</text>
                <text fill="#ffffff" font-size="35" font-family="Verdana"
                    x="740" y="${j + spacing * i}" text-anchor="end">${scores}</text>
            `;
        //progress x=400
        
            svg = svg + `<text fill="#ffffff" font-size="35" font-family="Verdana"
            x="370" y="${j + spacing * i}" text-anchor="start">${progress}</text>`;
        //x=580
        




    }

    var coverImage = anime.all.data.Media.coverImage?.medium;
    var serverAverage = 0;
    try {
        serverAverage =Object.values(filteredRatings[serverID][anime.id]).filter(r => r.score > 0).map(r => r.score);
        serverAverage = serverAverage.reduce((a, b) => a + b) / serverAverage.length;

        serverAverage = parseInt(serverAverage * 10);
    } catch (err) {
        //console.log(err);
         serverAverage = null; }
    //console.log(serverAverage);







    svg = svg + `
        <text fill="#ffffff" font-size="30" font-family="Verdana"
            x="220" y="25">`+averageType+` Average:</text>

        <text fill="#ffffff" font-size="30" font-family="Verdana"
            x="220" y="70">${serverAverage}</text>

        <text fill="#ffffff" font-size="30" font-family="Verdana"
            x="490" y="25">Anilist Average:</text>

        <text fill="#ffffff" font-size="30" font-family="Verdana"
            x="490" y="70">${anime.all.data.Media?.averageScore}</text>





        <text fill="#ffffff" font-size="30" font-family="Verdana"
            x="220" y="130">Favorites:</text>

        <text fill="#ffffff" font-size="30" font-family="Verdana"
            x="220" y="175">${anime.all.data.Media?.favourites}</text>

        <text fill="#ffffff" font-size="30" font-family="Verdana"
            x="490" y="130">Popularity:</text>

        <text fill="#ffffff" font-size="30" font-family="Verdana"
            x="490" y="175">${anime.all.data.Media?.popularity}</text>
        `;


    svg = svg + "</svg>";


    var buffer = await imageManipulation.createRatingsImage(svg, coverImage);
    var attachment = await new Discord.MessageAttachment(buffer, 'image.webp');



    const row = new MessageActionRow();


    row.addComponents(
        new MessageButton()
            .setCustomId(process.env.BOT_INTERACTION_ID + 'PreviousPageRR')
            .setLabel('Previous')
            .setStyle('PRIMARY')
    );



    row.addComponents(
        new MessageButton()
            .setCustomId(process.env.BOT_INTERACTION_ID + 'NextPageRR')
            .setLabel('Next')
            .setStyle('PRIMARY')
    );

    if (currentPage < 2)
        row.components[0].setDisabled(true);
    if (currentPage > Pages - 1)
        row.components[1].setDisabled(true);
  





    const exampleEmbed = new Discord.MessageEmbed()
        .setURL('https://discord.js.org/')
        .setAuthor({ name: "Ratings of " + anime.title, url: anime.siteUrl })
        .setImage('attachment://image.webp')
        .setFooter({ text: 'Page ' + currentPage + '/' + Pages + ' - &setmyanilist YourAnilist / &deletemyanilist' })

    var sent;
    if (first === 0) {
        sent = await msg.channel.send({ embeds: [exampleEmbed], components: [row], files: [attachment] });
        await sent;
        filteredRatings[sent.id]=filteredRatings[serverID];
        filteredRatings = Object.keys(filteredRatings).filter(key =>
            key !== msg.id).reduce((obj, key) =>
            {
                obj[key] = filteredRatings[key];
                return obj;
            }, {}
        );
        pageCache[sent.id] = { page: currentPage, anime: anime };
    } else {
        sent = await msg.update({ embeds: [exampleEmbed], components: [row], files: [attachment] }).catch((Exception) => { console.log(Exception) });
        await sent;
        pageCache[msg.message.id] = { page: currentPage, anime: anime };
    }



    return pageCache;








}

async function handleRatingsInteractions(msg, command, anime, currentPage) {

    var currentPageINT = pageCache[msg.message.id].page;
    anime = pageCache[msg.message.id].anime;


    if (currentPage === -1) {
        currentPageINT -= 1;
        getRatings(msg, command, anime, currentPageINT).catch((Exception) => { console.log(Exception) });
    } else if (currentPage === 1) {
        currentPageINT += 1;
        getRatings(msg, command, anime, currentPageINT).catch((Exception) => { console.log(Exception) });
    }

}

async function serverRatingsSorter(anime, serverId, msgId) {

    const db = await sqlite.open({
        filename: __dirname + '/anilist.db',
        driver: sqlite3.Database
    });

    //serverId = "%" + serverId + "%";
    var serverIdSQL= "%" + serverId + "%";
    var sq = "select anilist_username from anilist_users where users_servers like ?";
    const result = await db.all(sq, [serverIdSQL]);
    var filteredRatings = {};
    serverId=msgId;
    filteredRatings[serverId]={};
    filteredRatings[serverId][anime.id] = {};
    filteredRatings[serverId][anime.id]["length"]=0;

    var i = 0;
    var j = 0;
    var z = 0;
    while (i < ratingsCache[serverId][anime.id].length) {
        j=0;
        while(j<result.length){
            //ratingsCache[21355][0].user.name
            if (result[j].anilist_username === ratingsCache[serverId][anime.id][i].user.name) {
                filteredRatings[serverId][anime.id][z] = ratingsCache[serverId][anime.id][i];
                z++;
            }
            j++
        }

        i++
    }
    filteredRatings[serverId][anime.id]["length"]=z;
    
    db.close();
    //console.log(filteredRatings);
    return filteredRatings;



}




module.exports = {
    getRatings,
    cacheAnimeRatings,
    handleRatingsInteractions,
    serverRatingsSorter
}