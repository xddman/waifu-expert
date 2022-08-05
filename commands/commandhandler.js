const Discord = require('discord.js');


async function commandHandler(msg){

    //Get the command
    var command=msg.content.split(" ")[0];
    console.log("Ran: '"+command+"'");


    //Get mentions if exist
    var mentioned=false;
    var mentionId=null;
    var mentionUsername=null;
    if(msg.mentions.members.first()){
        var mentions=msg.mentions.members.first();
        console.log("Mentions: '<@"+mentions.user.id+"> \""+mentions.user.username+"\"'");
        mentioned=true; 
        mentionId=mentions.user.id;
        mentionUsername=mentions.user.username;
    }

    var messageAuthorId = msg.author.id;
    var messageAuthorUsername = msg.author.username;
    //Get arguments if exist
    var arg=msg.content.split(command+"")[1];
    if(mentioned===true)
        arg=arg.replace("<@"+mentions.user.id+">",'');
    
    arg=arg.replace(/\s\s+/g, ' ').trim();
    console.log("Args: '"+arg+"'");

    //Pack it all up nicely and return it
    var finalCommand = {
        command: command,
        arg:arg,
        mentioned:mentioned,
        mentionId:mentionId,
        mentionUsername:mentionUsername,
        authorId:messageAuthorId,
        authorUsername:messageAuthorUsername
    };

    return finalCommand;

}


module.exports = {
    commandHandler,
}