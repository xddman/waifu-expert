
require('dotenv').config({ path: __dirname + '/.env' });
const search = require('./animesearch.js');
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');

var ratingsCache = {};

async function getUserFollowers(msg, command) {
    var userAnilistId=await getUserIdFromDb(command);
    if(userAnilistId===0){
        return 0;
    }
    

    var query = `
    query ($page: Int){
        Page (page: $page, perPage: 50) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          followers(userId:`+userAnilistId.toString()+`) {
           id 
            name
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
            var serverID=msg.id.toString();//msg.guildId.toString();
            var tempCache = response.data.Page.followers;
            
            //ratingsCache[serverID][123]={};
            if (currentPage === 1){
                ratingsCache={};
                ratingsCache[123]={};
                ratingsCache[123] = tempCache;
            }
            else
                ratingsCache[123] = [...ratingsCache[123], ...tempCache];

            currentPage++;
            //console.log(response);
        } catch (err) {
            console.log(err);
        }
    }


    return ratingsCache;
    //console.log(response);


}

async function sortUserIds(msg, command){
    ratingsCache = await getUserFollowers(msg,command);
    if(ratingsCache===0)
        return 0;
    //ratingsCache[1042894904327675965]["123"]
    var followerList="";
    var i=0
    ratingsCache[123].forEach(user => {
        if(i===0)
            followerList=user.id;
        else
            followerList=followerList+", "+user.id
        i++;
    });

    return followerList;


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
    getUserFollowers,
    sortUserIds,
    getUserIdFromDb
}