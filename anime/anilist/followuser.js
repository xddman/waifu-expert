const Discord = require('discord.js');
const { Formatters } = require('discord.js');
const { MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
require('dotenv').config({ path: __dirname + '/.env' });
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const anilistuserid = require('./anilistuserid.js');




async function followUserAnilist(msg, command) {




    var anilistUserId = await anilistuserid(msg, command);
    anilistUserId = anilistUserId.data.User.id;
    console.log("======>" + anilistUserId);




    var checkDbForUser = await CheckAnilistToDatabase(command.authorId, command);
    if (checkDbForUser < 1) {
        await AddAnilistToDatabase(command.arg, command, msg);
    } else {
        console.log("Anilist already set as ...'s anilist");
    }

    var isUserFollowed = await isFollowed(anilistUserId);
    if (isUserFollowed === false && checkDbForUser < 1) {


        var query = `
            mutation($userId:Int){
                ToggleFollow(userId:$userId) {
                id
                }
            }      
            `;

        // Define our query variables and values
        var variables = {
            userId: anilistUserId,
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

        msg.reply("Added user.");
    } else {
        msg.reply("Your anilist is already set.");
    }











}

async function isFollowed(id) {

    var query = `
    query($userId:Int){
        User(id:$userId){
          isFollowing
        }
        
      }   
    `;

    // Define our query variables and values
    var variables = {
        userId: id,
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

    //console.log(response);
    return response.data.User.isFollowing;

}

async function CheckAnilistToDatabase(authorId, command) {
    const db = await sqlite.open({
        filename: __dirname + '/anilist.db',
        driver: sqlite3.Database
    });

    var name = authorId;

    var counter = 0;
    var sq = "select COUNT(discord_id) from anilist_users where discord_id=?";
    const result = await db.all(sq, [name]);




    counter = result[0]["COUNT(discord_id)"];
    db.close();
    return counter;



    //return counter;

}

async function AddAnilistToDatabase(anilistUsername, command, msg) {
    const db = await sqlite.open({
        filename: __dirname + '/anilist.db',
        driver: sqlite3.Database
    });

    console.log("inserting " + anilistUsername);
    //var name = authorId;

    var counter = 0;
    var sq = "insert or ignore into anilist_users (discord_id, discord_username, anilist_username, users_servers) values (?,?,?,?)";
    await db.run(sq, [command.authorId, command.authorUsername, anilistUsername, msg.guildId.toString()], async (err, rows) => {
        if (err) return console.error(err.message);
    });

    db.close();
    return 0;




}

async function DeleteAnilistToDatabase(msg, command) {
    const db = await sqlite.open({
        filename: __dirname + '/anilist.db',
        driver: sqlite3.Database
    });

    var sq = "select COUNT(discord_id),anilist_username from anilist_users where discord_id=?";
    const result = await db.all(sq, command.authorId);

    counter = result[0]["COUNT(discord_id)"];


    if (counter > 0) {
        console.log("deleting " + command.authorUsername);

        sq = "delete from anilist_users where discord_id=?";
        await db.run(sq, [command.authorId]);
        db.close();

        command.arg = result[0].anilist_username;
        var anilistUserId = await anilistuserid(msg, command);
        anilistUserId = anilistUserId.data.User.id;

        var query = `
            mutation($userId:Int){
                ToggleFollow(userId:$userId) {
                id
                }
            }      
            `;

        // Define our query variables and values
        var variables = {
            userId: anilistUserId,
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








        return msg.reply("Unfollowed successfully..");
    } else {
        db.close();
        return msg.reply("Failed. You are not followed.");
    }




}

async function checkUserServers(client) {




    const db = await sqlite.open({
        filename: __dirname + '/anilist.db',
        driver: sqlite3.Database
    });

    var discordId;
    var sq = "select cast(discord_id as TEXT) as ID from anilist_users";
    const result = await db.all(sq);
    var i=0;
    while(i<result.length){
    
        discordId = result[i].ID;
        //discordId=discordId-11;

        var ServerList = await client.guilds.cache.filter((u) => u.members.cache.get(discordId));
        var serverString = "";
        ServerList.forEach(key => {
            //console.log(key.id);
            serverString = serverString + key.id + ",";
        });


        sq = "update anilist_users set users_servers=? where discord_id=?";
        await db.run(sq, [serverString, discordId], async (err, rows) => {
            if (err) return console.error(err.message);
        });
    i++
    }
    db.close();
    return 0;

}


module.exports = {
    followUserAnilist,
    isFollowed,
    CheckAnilistToDatabase,
    AddAnilistToDatabase,
    DeleteAnilistToDatabase,
    checkUserServers
}