const Discord = require('discord.js');
const { Formatters } = require('discord.js');
const { MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
require('dotenv').config({ path: __dirname + '/.env' });
const search = require('./animesearch.js');
const imageManipulation = require('./imageManipulation.js');

var pageCache={};
var ratingsCache = {};

async function cacheAnimeRatings(command) {
    var anime = await search.getAnimeSearch(command);



    var query = `
        query ($mediaId: Int, $page: Int) {
            Page(page: $page, perPage:50) {
              mediaList(mediaId: $mediaId, isFollowing: true, sort:SCORE_DESC) {
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


            response = await got.post(url, {
                json: {
                    query,
                    variables
                },
                headers: {
                    "Authorization": token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                responseType: 'json'
            }).json();

            var tempCache = response.data.Page.mediaList;
            if (currentPage === 1)
                ratingsCache[anime.id] = tempCache;
            else
                ratingsCache[anime.id] = [...ratingsCache[anime.id], ...tempCache];

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
    var first=0;
    if(currentPage===0){
        anime = await cacheAnimeRatings(command);
        currentPage=1;
    }else
        first=1;

    var Pages = Math.ceil(ratingsCache[anime.id].length/11);
    
    //image stuff
    let width = 770;
    let height = 800;
    var j = 220;
    var spacing = 50;
    var svg = `
        <svg width="${width}" height="${height}">
    `;
    var scoreboard = "\n";
    var i = 0;
    var scores = "\n";

    i = 0;
    var personalCurrentPage=currentPage-1;

    while (i < ratingsCache[anime.id].length-(personalCurrentPage*11)&&i<11) {
        
        var iReplacer=i + (personalCurrentPage*11);
        i++;
        
        scores = parseFloat(ratingsCache[anime.id][iReplacer].score);
        if (scores === 0)
            scores = "-";
        else {
            scores = scores.toString() + "/10"
        }

        var progress;
        switch (ratingsCache[anime.id][iReplacer].status) {
            case "COMPLETED":
                progress = "Comp";
                break;
            case "PAUSED":
                progress = "Paused";
                break;
            case "DROPPED":
                progress = "Dropped";
                break;
            case "CURRENT":
                progress = "Ep " + ratingsCache[anime.id][iReplacer].progress.toString();
                break;
            default:
                progress = "Planned"
                break;
        }

        svg = svg + `
                <text fill="#ffffff" font-size="35" font-family="Verdana"
                    x="5" y="${j + spacing * i}">${ratingsCache[anime.id][iReplacer].user.name}:</text>
                <text fill="#ffffff" font-size="35" font-family="Verdana"
                    x="410" y="${j + spacing * i}" >${progress}</text>
                <text fill="#ffffff" font-size="35" font-family="Verdana"
                    x="740" y="${j + spacing * i}" text-anchor="end">${scores}</text>
            `;




    }

    var coverImage = anime.all.data.Media.coverImage?.medium;
    var serverAverage=0;
    try{
    serverAverage = ratingsCache[anime.id].filter(r => r.score > 0).map(r => r.score);
    serverAverage=serverAverage.reduce((a, b) => a + b) / serverAverage.length;
    
    serverAverage=parseInt(serverAverage*10);
    }catch(err){serverAverage=null}
    //console.log(serverAverage);

    svg = svg + `
        <text fill="#ffffff" font-size="30" font-family="Verdana"
            x="220" y="25">Server Average:</text>

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
    var attachment = await new Discord.MessageAttachment(buffer, 'image.png');



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

    if(currentPage<2)
        row.components[0].setDisabled(true);
    if(currentPage>Pages-1)
        row.components[1].setDisabled(true);





    const exampleEmbed = new Discord.MessageEmbed()
        .setURL('https://discord.js.org/')
        .setAuthor({ name: "Ratings of " + anime.title, url: anime.siteUrl })
        .setImage('attachment://image.png')
        .setFooter({ text:'Page '+currentPage+'/'+Pages+ ' - &setmyanilist YourAnilist / &deletemyanilist' })

    var sent;
    if(first===0){
        sent = await msg.channel.send({ embeds: [exampleEmbed], components: [row], files: [attachment] });
        await sent;
        pageCache[sent.id]={page:currentPage, anime:anime};
    }else{
        sent = await msg.update({ embeds: [exampleEmbed], components: [row], files: [attachment]}).catch((Exception) => { console.log(Exception) });
        await sent;
        pageCache[msg.message.id]={page:currentPage, anime:anime};
    }
    
    
    
    return pageCache;








}

async function handleRatingsInteractions(msg, command, anime, currentPage) {

    var currentPageINT=pageCache[msg.message.id].page;
    anime = pageCache[msg.message.id].anime;

    
    if(currentPage===-1){
        currentPageINT-=1;
        getRatings(msg,command,anime,currentPageINT).catch((Exception) => {console.log(Exception)});
    }else if(currentPage===1){
        currentPageINT+=1;
        getRatings(msg,command,anime,currentPageINT).catch((Exception) => {console.log(Exception)});
    }

}

module.exports = {
    getRatings,
    cacheAnimeRatings,
    handleRatingsInteractions
}