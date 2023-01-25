require('dotenv').config({ path: __dirname + '/.env' });
const search = require('./animesearch.js');
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');

async function getUsersCurrentAnimes(command){
    var userAnilistId=await getUserIdFromDb(command); 
    
   }


async function getUserIdFromDb(command){
    var authorId=command.authorId;
    const db = await sqlite.open({
        filename: __dirname + '/anilist.db',
        driver: sqlite3.Database
    });

    var name = authorId;

    var counter = 0;
    var sq = "select COUNT(discord_id) from anilist_users where discord_id=?";
    var result = await db.all(sq, [name]);




    counter = result[0]["COUNT(discord_id)"];
    if(counter>0){
        sq = "select anilist_id from anilist_users where discord_id=?";
        result = await db.all(sq, [name]);
        db.close();
        return result[0].anilist_id;
    }else{
        return 0;
    }
   
    
}

module.exports = {
    getUsersCurrentAnimes,
    getUserIdFromDb
}