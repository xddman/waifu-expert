const Discord = require('discord.js');
require('dotenv').config({ path: __dirname + '/.env' });
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const imageTextParser = require('../../library/ImageTextParser.js');
const imageProfileParser = require('../../library/imageProfileParser.js');




const talkedRecently = new Set();

async function listMissed(msg, command) {
    if (talkedRecently.has(msg.author.id)) {
        msg.channel.send("Wait 10 seconds before using this command again. - <@" + msg.author + ">");
    } else {


        const db = await sqlite.open({
            filename: __dirname + '/anilist.db',
            driver: sqlite3.Database
        });

        responseAllCounter=0;
        var name = command.authorId;
        var counter = 0;
        var sq = "select COUNT(discord_id),anilist_id from anilist_users where discord_id=?";
        const result = await db.all(sq, [name]);

        try {
            counter = result[0]["COUNT(discord_id)"];
            var userAnilistId = result[0].anilist_id;
        } catch (exc) { }
        if (counter < 1) {
            return msg.reply("Please add your anilist first. &setmyanilist YourAnilistUsername");
        }



        db.close();

        //userAnilistId = 120786; //dumbass with over 50 anime on his watchlist
        var query = `
        query ( $page: Int) {
            Page(page: $page, perPage:50) {
              mediaList(userId:`+ userAnilistId + `, sort:[SCORE_DESC,PROGRESS_DESC,STATUS], type:ANIME, status:CURRENT) {
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
                  coverImage {
                    extraLarge
                    large
                    medium
                    color
                  }
                  episodes
                  nextAiringEpisode {
                    episode
                    timeUntilAiring
                    airingAt
                    id
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

        // Define our query variables and values


        var token = "Bearer " + process.env.ANILIST_TOKEN;
        // Define the config 
        var url = 'https://graphql.anilist.co';
        const got = require('got');
        var responseAll = [];
        var response1 = [];
        //responseAll["data"]["Page"]=[{mediaList:0}];
        responseAll["data"] = { Page: { mediaList: {} } };
        var currentPage = 1;
        response1["data"] = { Page: { pageInfo: { hasNextPage: true } } };
        var response=[];
        response["data"] = { Page: { pageInfo: { hasNextPage: true } } };


        while (response?.data?.Page?.pageInfo?.hasNextPage) {
            var variables = {
                page: currentPage
            };

            response1 = await got.post(url, {
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
            });
            var headers = response1.headers;
            response = response1.body;
            try {
                console.log("x-ratelimit-remaining: " + headers["x-ratelimit-remaining"]);
            } catch (exc) {
                console.log(exc);
                console.log(headers);
            }
            //var responseAll=response;
            response1 = response;
            //responseAll["data"]["Page"]["mediaList"] = {...responseAll["data"]["Page"]["mediaList"],...response1["data"]["Page"]["mediaList"]};
            var currentItem=0;
            await response["data"]["Page"]["mediaList"].forEach(item => {
                responseAll["data"]["Page"]["mediaList"][responseAllCounter]=item;
                responseAllCounter++;
            });
            //merges and replaces first grab

            currentPage++;
        }


        //response=responseAll;
        //response.data.Page.mediaList[1].media.nextAiringEpisode.episode
        //response.data.Page.mediaList[0].media.nextAiringEpisode



        var formattedObject = await createObjectText(responseAll);
        var posterObject = await createObjectPoster(responseAll);

        var imageData = [];
        imageData["Columns"] = { numberOfColumns: 3 };
        imageData["Alignment"] = { 0: "start", 1: "middle", 2: "end" };
        imageData["TextRegion"] = { StartX: 0, StartY: 210, EndX: 100, EndY: 200 };
        imageData["ColumnSize"] = { 0: 66, 1: 14, 2: 22 };
        imageData["Title"] = true;
        imageData["maxRows"] = 11;


        var svgFinal = await imageTextParser.parseText(formattedObject, imageData);
        //var svgImg = await imageTextParser.createImage(svgFinal, imageData2);

        var imageData2 = [];
        imageData2["Columns"] = { numberOfColumns: 4 };
        imageData2["Alignment"] = { 0: "start", 1: "middle", 2: "end", 3: "end" };
        imageData2["TextRegion"] = { StartX: -10, StartY: 30, EndX: 100, EndY: 200 };
        imageData2["ColumnSize"] = { 0: 50, 1: 20, 2: 20, 3: 5 };
        imageData2["Title"] = true;
        imageData2["maxRows"] = 10;
        var posterSvg = await imageProfileParser.parseText(posterObject, imageData2);
        var posterImg = await imageProfileParser.createImage(posterSvg, posterObject, imageData2);
        var buffer = await imageProfileParser.svgMerge(svgFinal, posterImg);



        //var buffer = await imageTextParser.parseText(formattedObject,imageData);
        var attachment = await new Discord.MessageAttachment(buffer, 'image.webp');


        if (formattedObject[0]?.length < 1)
            airingListSorted = "None";

        const exampleEmbed = new Discord.MessageEmbed()
            .setURL('https://waifu.expert/')
            .setAuthor({ name: "Airing Animes from " + command.authorUsername + "" })
            .setImage('attachment://image.webp')
            .setFooter({ text: '&setmyanilist YourAnilist / &deletemyanilist' });


        sent = await msg.channel.send({ embeds: [exampleEmbed], files: [attachment] });


        talkedRecently.add(msg.author.id);
        setTimeout(() => {

            talkedRecently.delete(msg.author.id);
        }, 10000);

        return sent;
    }


}


async function createObjectText(responseAll) {
    var filteredList = [];
    filteredList[0] = []; filteredList[0][0] = "Anime";
    filteredList[1] = []; filteredList[1][0] = "Behind";
    filteredList[2] = []; filteredList[2][0] = "Seen";
    var userAiringList = 0;
    userAiringList = Object.values(responseAll.data.Page.mediaList).filter(r => r.media.nextAiringEpisode !== null).map(r => r);
    var airingListSorted = "\n";
    var i = 1;
    await userAiringList.forEach(item => {
        try {
            var behind = item.media.nextAiringEpisode.episode - (item.progress + 1);

            if (behind > 0) {
                filteredList[0][i] = item.media.title.userPreferred;
                filteredList[1][i] = (item.media.nextAiringEpisode.episode - 1) - item.progress;
                filteredList[2][i] = item.progress + "/" + (item.media.nextAiringEpisode.episode-1);


                /**                filteredList[0][i]=""+item.media.title.userPreferred;
                filteredList[1][i]=""+item.progress;
                filteredList[2][i]=""+item.media.nextAiringEpisode.episode; */
                i++;
            }

        } catch (Exception) {
            console.log(Exception);
        }

        //console.log(airingListSorted);
    });

    return filteredList;
}
//userAiringList[0].media.nextAiringEpisode.timeUntilAiring
async function createObjectPoster(responseAll) {
    var filteredList = [];
    filteredList[0] = [];
    filteredList[1] = [];
    filteredList[2] = [];
    filteredList[3] = [];
    var userAiringList = 0;
    userAiringList = Object.values(responseAll.data.Page.mediaList).filter(r => r.media.nextAiringEpisode !== null).map(r => r);
    userAiringList.sort((a, b) => a.media.nextAiringEpisode.timeUntilAiring - b.media.nextAiringEpisode.timeUntilAiring).map(a => a.watch).slice(0, 3);
    var i = 0;
    await userAiringList.forEach(item => {
        try {



            filteredList[0][i] = "" + item.media.coverImage.large;
            filteredList[1][i] = "Ep " + item.media.nextAiringEpisode.episode;
            filteredList[2][i] = "" + item.media.nextAiringEpisode.timeUntilAiring;
            filteredList[3][i] = ((item.media.nextAiringEpisode.episode-1) - item.progress);


            i++;


        } catch (Exception) {
            console.log(Exception);
        }

        //console.log(airingListSorted);
    });

    return filteredList;
}



module.exports = {
    listMissed,
    createObjectText,
    createObjectPoster
}