const Discord = require('discord.js');
const { Formatters } = require('discord.js');
const { MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
require('dotenv').config({ path: __dirname + '/.env' });
const search = require('./animesearch.js');
const imageManipulation = require('./imageManipulation.js');


async function getAnime(msg, command, page, tab) {
    var currentpage = page;
    var id = msg.customId;
    var maxpage = 2;
    if (tab.includes(process.env.BOT_INTERACTION_ID + 'NextPage')) {
        currentpage = parseInt(id.split("|")[1]);
        maxpage = parseInt(id.split("|")[2]);
    }
    if (tab.includes(process.env.BOT_INTERACTION_ID + 'PreviousPage')) {
        currentpage = parseInt(id.split("|")[1]);
        maxpage = parseInt(id.split("|")[2]);
    }

    var anime = await search.getAnimeSearch(command);

    if (currentpage < 1) {
        currentpage = 1;
    }



    //anilist query
    var query = `
    query ($mediaId: Int, $page: Int) {
        Page(page: $page, perPage:11) {
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

    // Define our query variables and values
    var variables = {
        mediaId: anime.id,
        page: currentpage
    };

    var token = "Bearer " + process.env.ANILIST_TOKEN;
    // Define the config 
    var response;
    var url = 'https://graphql.anilist.co';
    const got = require('got');
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

    var mangaembed;
    var sent;

    const row = new MessageActionRow();



    if (response?.data?.Page?.mediaList?.length < 1) {
        row.addComponents(
            new MessageButton()
                .setCustomId(process.env.BOT_INTERACTION_ID + 'AboutAfter')
                .setLabel('About')
                .setStyle('PRIMARY')
        );

        row.addComponents(
            new MessageButton()
                .setCustomId(process.env.BOT_INTERACTION_ID + 'PreviousPage|' + (currentpage - 2).toString() + "|" + maxpage.toString())
                .setLabel('Previous')
                .setStyle('PRIMARY')
        );



        try {
            return await msg.update({ components: [row] }).catch((Exception) => { console.log(Exception) });
        } catch (Exception) { }

    }

    if (tab.includes("About")) {
        row.addComponents(
            new MessageButton()
                .setCustomId(process.env.BOT_INTERACTION_ID + 'AnimeRatings')
                .setLabel('Ratings')
                .setStyle('PRIMARY')
        );

        row.addComponents(
            new MessageButton()
                .setCustomId(process.env.BOT_INTERACTION_ID + 'AnimeDescription')
                .setLabel('Description')
                .setStyle('PRIMARY')
        );
        var startDate = anime.all["data"]["Media"]["startDate"]["month"] + "/" + anime.all["data"]["Media"]["startDate"]["year"];
        var endDate = anime.all["data"]["Media"]["endDate"]["month"] + "/" + anime.all["data"]["Media"]["endDate"]["year"];
        const footer = ({ text: 'Genres: ' + anime.all["data"]["Media"]["genres"] });
        var genres = anime.all.data.Media.genres;
        var genresFinal = "";
        //genres=genres.replace(",", "\n");
        var i = 1;
        while (i < genres.length + 1) {
            genresFinal = genresFinal + genres[i - 1].toString() + ", ";
            if (i % 3 === 0) {
                genresFinal = genresFinal + "\n"
            }
            i++;
        }


        mangaembed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            //.setAuthor({ name: search.character, iconURL: search.charimage, url: search.url })
            .setTitle(anime.title)
            .setURL(anime.siteUrl)
            .setThumbnail(anime.poster)
            .addFields(
                { name: "Started:", value: startDate, inline: true },
                { name: "Ended:", value: endDate, inline: true },
                { name: "Score:", value: "Average: " + anime.averageScore + "%\nMean: " + anime.meanScore + "%", inline: true },
                { name: "Episodes:", value: " " + anime.all["data"]["Media"]["episodes"]?.toString(), inline: true },
                { name: "Source:", value: " " + anime.all["data"]["Media"]["source"]?.toString(), inline: true },
                { name: "Status:", value: " " + anime.all["data"]["Media"]["status"]?.toString(), inline: true },
                { name: "Studio:", value: " " + anime.all.data.Media.studios?.nodes[0]?.name?.toString(), inline: true },
                { name: "Popularity:", value: " " + anime.all.data.Media.popularity?.toString(), inline: true },
                { name: "Genres:", value: " " + genresFinal, inline: true },

            )
        //.setDescription("Average score: "+anime.averageScore+"% Mean score: "+anime.meanScore+"%")
        //.setFooter(footer);


        if (anime.all["data"]["Media"]["status"].toString().includes("RELEASING")) {
            var time1 = "t:" + anime.all.data.Media.nextAiringEpisode.airingAt + ">";
            var finalTime = "";
            finalTime = Formatters.time(anime.all.data.Media.nextAiringEpisode.airingAt, Formatters.TimestampStyles.RelativeTime);
            mangaembed.addFields({ name: "Next ep: " + anime.all["data"]["Media"]["nextAiringEpisode"]["episode"].toString(), value: "In: " + finalTime, inline: true })
        }


        //Formatters.time(anime.all.data.Media.nextAiringEpisode.airingAt, Formatters.timestampStyles.RelativeTime);


        if (tab === "About")
            sent = await msg.channel.send({ embeds: [mangaembed], components: [row] });
        else
            sent = await msg.update({ embeds: [mangaembed], components: [row] }).catch((Exception) => { console.log(Exception) });
    }



    if (tab.includes(process.env.BOT_INTERACTION_ID + 'AnimeRatings') || tab.includes(process.env.BOT_INTERACTION_ID + 'NextPage') || tab.includes(process.env.BOT_INTERACTION_ID + 'PreviousPage')) {
        var scoreboard = "\n";
        var i = 0;
        var users = "\n";
        var scores = "\n";
        while (i < response?.data?.Page?.mediaList?.length) {
            var username = response.data.Page.mediaList[i].user.name + " - - ";
            scores = parseFloat(response.data.Page.mediaList[i].score);
            if (scores === 0)
                scores = "Not Rated";
            else
                scores = scores.toString() + "/10"
            scoreboard = scoreboard + "" + username + "" + scores + "\n";
            //users = users + username + "\n";
            //scores = scores + response.data.Page.mediaList[i].score + "/10 \n";
            i++;
        }
        /*
        row.addComponents(
            new MessageButton()
                .setCustomId(process.env.BOT_INTERACTION_ID + 'AboutAfter')
                .setLabel('About')
                .setStyle('PRIMARY')
        );*/

        row.addComponents(
            new MessageButton()
                .setCustomId(process.env.BOT_INTERACTION_ID + 'PreviousPage|' + (currentpage - 1).toString() + "|" + maxpage.toString())
                .setLabel('Previous')
                .setStyle('PRIMARY')
        );


        row.addComponents(
            new MessageButton()
                .setCustomId(process.env.BOT_INTERACTION_ID + 'NextPage|' + (currentpage + 1).toString() + "|" + maxpage.toString())
                .setLabel('Next')
                .setStyle('PRIMARY')
        );


        //image stuff
        let width = 770;
        let height = 800;
        let label = "jokerbus:";
        var j = 220;
        var spacing = 50;
        var svg = `
        <svg width="${width}" height="${height}">
        `;


        i = 0;
        while (i < response?.data?.Page?.mediaList?.length) {
            i++;
            scores = parseFloat(response.data.Page.mediaList[i - 1].score);
            if (scores === 0)
                scores = "-";
            else {
                //scores=scores.toPrecision(2);
                scores = scores.toString() + "/10"
            }

            var progress;
            switch (response.data.Page.mediaList[i - 1].status) {
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
                    progress = "Ep " + response.data.Page.mediaList[i - 1].progress.toString();
                    break;
                default:
                    progress = "Planned"
                    break;
            }

            svg = svg + `
                <text fill="#ffffff" font-size="35" font-family="Verdana"
                    x="5" y="${j + spacing * i}">${response.data.Page.mediaList[i - 1].user.name}:</text>
                <text fill="#ffffff" font-size="35" font-family="Verdana"
                    x="410" y="${j + spacing * i}" >${progress}</text>
                <text fill="#ffffff" font-size="35" font-family="Verdana"
                    x="740" y="${j + spacing * i}" text-anchor="end">${scores}</text>
            `;




        }

        var coverImage = anime.all.data.Media.coverImage?.medium;

        svg = svg + `
            <text fill="#ffffff" font-size="30" font-family="Verdana"
                x="220" y="25">Mean Score:</text>

            <text fill="#ffffff" font-size="30" font-family="Verdana"
                x="220" y="70">${anime.all.data.Media?.meanScore}</text>

            <text fill="#ffffff" font-size="30" font-family="Verdana"
                x="470" y="25">Average Score:</text>

            <text fill="#ffffff" font-size="30" font-family="Verdana"
                x="470" y="70">${anime.all.data.Media?.averageScore}</text>





            <text fill="#ffffff" font-size="30" font-family="Verdana"
                x="220" y="130">Favorites:</text>

            <text fill="#ffffff" font-size="30" font-family="Verdana"
                x="220" y="175">${anime.all.data.Media?.favourites}</text>

            <text fill="#ffffff" font-size="30" font-family="Verdana"
                x="470" y="130">Popularity:</text>

            <text fill="#ffffff" font-size="30" font-family="Verdana"
                x="470" y="175">${anime.all.data.Media?.popularity}</text>
            `;


        svg = svg + "</svg>";











        //console.log(currentpage);

        mangaembed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            //.setAuthor({ name: search.character, iconURL: search.charimage, url: search.url })
            .setTitle("Ratings of " + anime.title)
            .setURL(anime.siteUrl)
            .setThumbnail(anime.poster)
            .setDescription("Average Score: " + anime.averageScore + "% - - - Mean Score: " + anime.meanScore + "%")
            .addField(name = "\u200b", value = scoreboard, inline = true)
            //.addField(name="Scores:",value=scores,inline=true)
            //.addField('\u200b', '\u200b', inline=true)
            .setFooter({ text: 'Page: ' + currentpage });


        var buffer = await imageManipulation.createRatingsImage(svg, coverImage);
        var attachment = new Discord.MessageAttachment(buffer, 'image.png');


        const exampleEmbed = new Discord.MessageEmbed()
            .setURL('https://discord.js.org/')
            .setAuthor({ name: "Ratings of " + anime.title, url: anime.siteUrl })
            .setImage('attachment://image.png')
            .setFooter({ text: '&setmyanilist YourAnilist / &deletemyanilist' })

        if (tab.includes('AnimeRatingsCMD'))
            sent = await msg.channel.send({ embeds: [exampleEmbed], components: [row], files: [attachment] });
        else
            sent = await msg.update({ embeds: [exampleEmbed], components: [row], files: [attachment] }).catch((Exception) => { console.log(Exception) });
    }

    if (tab.includes("Description")) {
        row.addComponents(
            new MessageButton()
                .setCustomId(process.env.BOT_INTERACTION_ID + 'AboutAfter')
                .setLabel('About')
                .setStyle('PRIMARY')
        );



        mangaembed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            //.setAuthor({ name: search.character, iconURL: search.charimage, url: search.url })
            .setTitle(anime.title)
            .setURL(anime.siteUrl)
            .setThumbnail(anime.poster)
            .setDescription(anime.description)




        sent = await msg.update({ embeds: [mangaembed], components: [row] }).catch((Exception) => { console.log(Exception) });


    }
















    if (tab === "About" || tab.includes('AnimeRatingsCMD')) {
        sent.createMessageComponentCollector({
            filter: async interaction => {
                await getAnime(interaction, command, currentpage, interaction.customId).catch((Exception) => { console.log(Exception) });
            }
        });
    }












    return sent;


    //return await msg.channel.send({ embeds: [mangaembed], components:[row] });



}




module.exports = {
    getAnime
}