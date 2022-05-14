const got = require('got');

module.exports = async function getUserAnilistId(msg, botCommand){
    var username=msg.content.split(" ")[1];
    try{
        var url = 'https://graphql.anilist.co';
        query = `
        query ($search: String) { 
            User(search:$search) {
              id
            name
            avatar {
              medium
            }
        siteUrl
            }
    }
       
        `;
        
        variables = {
          search: username,
        };
      
        var response = await got.post(url, {
          json: {
                query,
                variables
          },
          headers: [{
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          }],
          responseType: 'json'    
        }).json();
      
        //return response["data"]["MediaList"]["progress"];
        //console.log(response)
        console.log("user id:"+response.data.User.id);
        return response;
      
        }catch(err){
          console.log(err);
          msg.react("❌");
        }
}