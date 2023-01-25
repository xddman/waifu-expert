const Discord = require('discord.js');
const {MessageActionRow, MessageSelectMenu} = require("discord.js");

async function getHelp(msg, command) {


    var description=`
    *Anilist commands:*
    &setmyanilist [AnilistUsername] - Set your anilist
    &deletemyanilist - Remove your anilist\n
    &anilist [Blank/@user] - show your [Blank], or someone elses [@user] anilist
    &ratings [Anime Name] - Shows ratings of an anime [Server]
    &rating [Anime Name] - Shows ratings of an anime [Global]
    &myratings [Anime Name] - Show ratings for the users you follow on anilist
    &characters [Anime Name] - Shows top characters from an anime
    &va [Character Name] - Shows characters voice actor and other roles they had
    &airingmissed - shows airing anime that you are not caught up to\n
    *Tags:*
    By adding a tag you can show info for a manga or a ln.
    Current tags: 
    "-ln" for light novels
    "-m" for manga
    "-a" for anime [default without a tag]
    ex: "&ratings-m [Manga Name]", "&characters-ln [Light novel Name]"
    Commands that support tags: &rating, &ratings, &characters, &myratings\n
    *Mangaupdates:*
    &manga [Manga Name] - Shows info about a manga from the mangaupdates site
    &novel [Light Novel Name] - Shows info about a light novel from the mangaupdates site 
    `;

    const helpembed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle("Commands:")
    .setThumbnail("https://images-ext-1.discordapp.net/external/y2I-ThDCZgTnBvRHcA_r7XB7GGTZGhVvzjLt0Xx86Gc/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/815345251686154280/f394c97e63f7aa78e82ab4d9f218d146.webp?width=663&height=663")
    .setDescription(description);


    const sent = await msg.channel.send({embeds: [helpembed]});
    return sent;

}

module.exports = {
    getHelp
}