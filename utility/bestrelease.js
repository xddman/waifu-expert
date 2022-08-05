const sqlite3 = require('sqlite3').verbose();
const Discord = require('discord.js');



const db=new sqlite3.Database(__dirname+'/animeindex.db', sqlite3.OPEN_READWRITE, (err)=>{
  if (err) return console.error(err.message);
  console.log("con success");
});


async function getBestRelease(msg, command) {

  var name = "%" + command.arg + "%";
  
  var counter=0;
  var sq = "select * from Smokes_Index where title like ? OR AlternateTitle like ?";
  db.all(sq, [name + '', name + ''], (err, rows) => {
    if (err) return console.error(err.message);
    rows.forEach(row => {
      //console.log(row.Title + ": " + row.BestRelease);
      if(counter<1)
        msg.reply("Best release of " + row.Title + " is: \n" + row.BestRelease);
      counter=5;
    });
  });





}

module.exports = {
    getBestRelease
}