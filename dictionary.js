const Discord = require('discord.js');
const got = require('got');

module.exports = async function getDefinition(msg, botCommand){
    
    
    try{
        var requestedWord=msg.content.split(" ")[1];
        var url = 'https://api.dictionaryapi.dev/api/v2/entries/en/'+requestedWord;
        const response = await got(url);
        var body = response.body;

        const word = JSON.parse(body);
        const wordReturned= word[0].word;
        const description = word[0].meanings[0].definitions[0].definition;

        var count=0;
        if(word[0].meanings[0].synonyms.length>5)
            count=4
        else
            count=word[0].meanings[0].synonyms.length;
        var i=0;
        var synonyms="";
        while(i<count){
            synonyms=synonyms+"\n"+word[0].meanings[0].synonyms[i];
            i++;
        }

        count=0;
        if(word[0].meanings[0].antonyms.length>5)
            count=4
        else
            count=word[0].meanings[0].antonyms.length;
        i=0;
        var antonyms="";
        while(i<count){
            antonyms=antonyms+"\n"+word[0].meanings[0].antonyms[i];
            i++;
        }


        const mangaembed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle("Word: \""+wordReturned+"\"")
        .setDescription(description+"")
        .addFields(
            { name: 'Synonyms: ', value: synonyms+".", inline: true },
            { name: 'Antonyms: ', value: antonyms+".", inline: true },
        )



        return await msg.channel.send({embeds: [mangaembed]});

        }catch(err){
          console.log(err);
          msg.react("❌");
        }



}