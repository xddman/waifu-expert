const Discord = require('discord.js');
const got = require('got');


module.exports = async function adddeluserlist(msg, action){
    fs = require('fs');
    var val=msg.content.toString().split("!userlistadd ")[1];
    var val1=msg.content.toString().split("!userlistdel ")[1];
    console.log(val1);
    let newdata = {
      messageid: val
    };
    
    try{
      fs.readFileSync('userlist.json', function (err,data) {
        return olddata= data;
      });
    olddata = JSON.parse(olddata);

      if(action=="add"){

        olddata.push(newdata);
        console.log(olddata);
      
        let data = JSON.stringify(olddata, null, 4);
        fs.writeFileSync('userlist.json', data);


      }else if(action=="del"){

        for (let i = 0; i < olddata.length; i++) {
          
          if(olddata[i].messageid==val1){
            olddata.splice(i,1);

          }
        }
        let data = JSON.stringify(olddata, null, 4);
        fs.writeFileSync('userlist.json', data);

      }




  }catch(err){
    console.log(err);
  }
}