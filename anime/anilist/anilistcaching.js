const sharp = require('sharp');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const crypto = require('crypto');
const Discord = require('discord.js');
const { buffer } = require('sharp/lib/is');
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const { Blob } = require("buffer");


async function cacheAnilistCommandCheck(command, hash1, hash2, msg, anilistid) {
    var cacheStatus=[];
    cacheStatus["hashFull"] = crypto.createHash('sha256').update(hash1).digest('hex'); 
    cacheStatus["hashHalf"] = crypto.createHash('sha256').update(hash2).digest('hex'); 
    var anilist = await getAnilistFromDiscordId(anilistid);
    
    
    //    anilist["cachedFull"]=result[0].cachedFull;
    //    anilist["cachedHalf"]=result[0].cachedHalf;
    
    
    cacheStatus["status"]="none";
    if(anilist===0){
        //not cached at all; return new hashes and create full image
        cacheStatus["status"]="empty";
        return cacheStatus;
    }else{
        if(anilist["hashFull"]===cacheStatus["hashFull"]){
            //hashes match perfectly, just send cached image;
            cacheStatus["status"]="full";
            cacheStatus["cache"]=anilist["cachedFull"];
            return cacheStatus;
        }else
            if(anilist["hashNoText"]===cacheStatus["hashHalf"]){
                cacheStatus["status"]="half";
                cacheStatus["cache"]=anilist["cachedHalf"];
                return cacheStatus;
                //images hashed, text changed; manipulate image text and send
            }else{
                //nothing matches; create brand new image
                cacheStatus["status"]="none";
                return cacheStatus;
            }
    }
    
}

async function addAnilistCacheToDatabase(command, msg, hashFull, hashHalf, cacheFull, cacheHalf, cacheStatus,anilistid) {
    const db = await sqlite.open({
        filename: __dirname + '/anilist.db',
        driver: sqlite3.Database
    });

    //console.log("inserting " + anilistUsername);
    //var name = authorId;
    var counter = 0;
    if(cacheStatus==="empty"){
       
        var sq = "insert into cmd_anilist (discordid, anilisthash, anilisthashnotext, cachedfull, cachedHalf) values (?,?,?,?,?)";
        await db.run(sq, [anilistid, hashFull, hashHalf, cacheFull, cacheHalf], async (err, rows) => {
            if (err) return console.error(err.message);
        });
    }
    else{
       
        var sq = "update cmd_anilist set anilisthash=?, anilisthashnotext=?, cachedfull=?, cachedHalf=? where discordid=?";
        await db.run(sq, [hashFull, hashHalf, cacheFull, cacheHalf, anilistid], async (err, rows) => {
            if (err) return console.error(err.message);
        });
    }
    db.close();
    return 0;




}


async function cacheAnilistCommand(user) {
    await cacheAnilistCommandCheck;



}


async function getAnilistFromDiscordId(userId) {

  const db = await sqlite.open({
      filename: __dirname + '/anilist.db',
      driver: sqlite3.Database
  });

  var serverIdSQL= userId;
  var sq = "select * from cmd_anilist where discordid=?";
  const result = await db.all(sq, [serverIdSQL]);
  var anilist=[];
 if(result.length>0) {
    anilist["hashFull"]=result[0].anilisthash;
    anilist["hashNoText"]=result[0].anilisthashnotext;
    anilist["cachedFull"]=result[0].cachedFull;
    anilist["cachedHalf"]=result[0].cachedHalf;
 }else{
    anilist=0;
 }

  
  db.close();
  //console.log(filteredRatings);
  return anilist;



}



module.exports = {
    cacheAnilistCommand,
    cacheAnilistCommandCheck,
    getAnilistFromDiscordId,
    addAnilistCacheToDatabase
}