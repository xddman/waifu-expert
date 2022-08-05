const Discord = require('discord.js');
const got = require('got');
const cheerio = require('cheerio');
const { data } = require('cheerio/lib/api/attributes');
const {MessageActionRow, MessageSelectMenu} = require("discord.js");
require('dotenv').config({ path: __dirname + '/.env' });


module.exports = async function latestchap(msg, botCommand, id){
    var url="";
    var test;
    try{
    if(id.includes("notset")){
        var sType="";

        if(botCommand.command.includes("novel")){
            sType="novel";
        }

        //----------------------------------------------------------------*/
        botCommand = botCommand.arg.replace(/\s+/g, '+').toLowerCase();
        var series;
        
        //grab page search for the series
        if(sType.includes("novel"))
            url = "https://www.mangaupdates.com/series.html?display=list&search="+botCommand+"&type=Novel";
        else
            url = "https://www.mangaupdates.com/series.html?display=list&search="+botCommand
    
        console.log(url);
        var str1;

    
        const response = await got(url);
        var sbody = response.body.toString();
        str1 = sbody;

        const $1 = cheerio.load(sbody);
        $1.html;

        const listSearch = $1('div[class="col-6 py-1 py-md-0 text"], div[class="col-6 py-1 py-md-0 text alt "]')
            .toArray()
            .map(element => $1(element));


        var listlenght = listSearch.length;
        if(listlenght>24){listlenght=24;}
        var lbl = listSearch[0].html().split("href=\"")[1];
        var serieslink = lbl.split("\" alt=\"Series Info\">");
        var seriesname = serieslink[1].split("</a>")[0];
        if(seriesname.length>90)
            seriesname=seriesname.substring(0,90);
        serieslink=serieslink[0];
        var x1 = ">";
        var y1= "</";
        seriesname.slice(0,90);
        //seriesname = seriesname.substring(str1.indexOf(x1) + x1.length, str1.indexOf(y1));
        try{
        seriesname= seriesname.split("<i>")[1].split("</i>")[0];
        }catch(Exception){}
        test = [{
            label:""+seriesname,
            value:""+serieslink.slice(0,90)
        }];

        
        for(let q = 1; q < listlenght; q++){
            
            console.log
            lbl = listSearch[q].html().split("href=\"")[1];
            serieslink = lbl.split("\" alt=\"Series Info\">");
            seriesname = serieslink[1].split("</a>")[0];
            if(seriesname.length>90)
            seriesname=seriesname.substring(0,90);
            serieslink=serieslink[0];
            x1 = ">";
            y1= "</";
            seriesname.slice(0,90);
            //seriesname = seriesname.substring(str1.indexOf(x1) + x1.length, str1.indexOf(y1));
            try{
                seriesname= seriesname.split("<i>")[1].split("</i>")[0];
                }catch(Exception){}
            test.push({
                label:""+seriesname,
                value:""+serieslink.slice(0,90)
            });
        }
        
        //console.log(listSearch[0].html());

        //get the id from the html response
        x1 = " an account!";
        y1= "'Series Info'";
        str1 = str1.substring(str1.indexOf(x1) + x1.length, str1.indexOf(y1));

        x1 = "<a href='";
        y1= "' alt=";
        str1 = str1.substring(str1.indexOf(x1) + x1.length, str1.indexOf(y1));
        
        url=str1;
        //get series page
        }else{url=id;}
        console.log(url);
        const response2 = await got(url);
        sbody = response2.body.toString();
        //get the chapter from html
        str1 = sbody;

        const $ = cheerio.load(sbody);
        $.html;

        const list = $('div[class="sContent"]')
            .toArray()
            .map(element => $(element));
        
        
        //parsing the html
       

        var gaaa = list[2].html().split("<br>")
        console.log(list[2].html().split("<br>")[0]);
        const title = $('span[class="releasestitle tabletitle"]').text();
        var description = $(list[0]).text().split("More...")[0];
        description=description.replace(/\./g,". ");
        var chaptersfinal="None";
        try{
            //console.log(list[5].text());
            const chapters = $(list[5]).text().split("ago")[0].replace(/\n/g,"")+" ago";
            const chapters1 = $(list[5]).text().split("ago")[1].replace(/\n/g,"")+" ago";
            const chapters2 = $(list[5]).text().split("ago")[2].replace(/\n/g,"")+" ago";
            chaptersfinal= chapters+"\n"+chapters1+"\n"+chapters2;
        }catch(Exception){}
        const status = $(list[6]).text().replace(/\n/g,"");
        const type = $(list[1]).text().replace(/\n/g,"");

        var startend = $(list[8]).text().replace(/\n/g,"");
        if(startend.split("Ends at")[1]){
            startend = startend.split("Ends at")[0] +"\nEnds at" +startend.split("Ends at")[1];
        }
        const ratings = $(list[11]).text().split("Bayesian")[0].replace(/\n/g,"");
        const lastupdate = $(list[12]).text().replace(/\n/g,"");
        var poster = "";
        try{
        poster = $(list[13]).find('img').attr('src').replace(/\n/g,"");
        }catch(Exception){}
        const genres = $(list[14]).text().split("Search for")[0].replace(/\n/g,"");
        const authors = $(list[18]).text().replace(/\n/g,"");
        const artist = $(list[19]).text().replace(/\n/g,"");
        const year = $(list[20]).text().replace(/\n/g,"");
        const licensed = $(list[23]).text().replace(/\n/g,"");
        var EnglishRelease = "No";
        if(licensed.includes("Yes")){
            EnglishRelease="Yes";
            try{
                EnglishRelease = $(list[24]).text().replace(/\n/g,"");
                console.log(EnglishRelease);
            }catch(Exception){}
        }
        //defining the embed
        const mangaembed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(title)
        .setURL(url)
        .setThumbnail(poster)
        .addFields(
            { name: 'Author/Artist', value: authors+'\n'+artist, inline: true },
            { name: 'Release year', value: year, inline: true },
            { name: 'Ratings', value: ratings, inline: true },
            { name: 'Status', value: status, inline: true },
            { name: 'Anime Start/End', value: startend, inline: true },
            { name: 'Licensed', value: EnglishRelease, inline: true },
            { name: 'Latest chapter: ', value: chaptersfinal },
        )
        .setFooter({text:'Genres: '+genres});
        
        
        const mangadescembed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(title)
        .setURL(url)
        .setThumbnail(poster)
        .addFields(
            { name: 'Description:', value: description },
        )
        .setFooter({text:'Genres: '+genres});
        

        filter = r => ['A', 'B'].includes(r.emoji.name);
        //return await msg.channel.send(mangaembed);

        
        if(id.includes("notset")){
        const row = new MessageActionRow()
			.addComponents(
                new MessageSelectMenu()
                .setCustomId(process.env.BOT_INTERACTION_ID+1)
                .setPlaceholder("Other Search Results")
                .addOptions([
                    test
                ])
		    );
        

                await msg.channel.send({embeds: [mangaembed], components: [row] });

        
       
        
            }else{
                await msg.update({embeds: [mangaembed]});
            }

        return 0;
    }catch(Exception){
        console.log(Exception);
        msg.react("❌");
    }
 
}
