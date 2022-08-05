const { wrapAll } = require('cheerio/lib/api/manipulation');
const got = require('got');

async function getAnimeSearch(command) {

        var search=command.arg;

      
      
        var query = `
        query ($search: String){
          Media(type:ANIME, search:$search){
            id
            bannerImage
            siteUrl
            title {
              english
              userPreferred
            }
            popularity
            studios {
              nodes{
                name
              }
            }
            description
            nextAiringEpisode {
              id
              airingAt
              timeUntilAiring
              episode
            }
            characters {
              nodes{
                name {
                  userPreferred
                }
                image {
                  medium
                }
              }
            }
            genres
            source
            favourites
            meanScore
            averageScore
            episodes
            coverImage{
              large
              medium
            }
            seasonYear
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            status
          }
        }
            `;



        
            if(search.includes("anilist.co/anime/")){
              search=search.split("anilist.co/anime/")[1];
              search=search.split("/")[0];
              query = `
              query ($search: String){
                Media(type:ANIME, search:$search){
                  id
                  bannerImage
                  siteUrl
                  title {
                    english
                    userPreferred
                  }
                  popularity
                  studios {
                    nodes{
                      name
                    }
                  }
                  description
                  nextAiringEpisode {
                    id
                    airingAt
                    timeUntilAiring
                    episode
                  }
                  characters {
                    nodes{
                      name {
                        userPreferred
                      }
                      image {
                        medium
                      }
                    }
                  }
                  genres
                  source
                  favourites
                  meanScore
                  averageScore
                  episodes
                  coverImage{
                    large
                    medium
                  }
                  seasonYear
                  startDate {
                    year
                    month
                    day
                  }
                  endDate {
                    year
                    month
                    day
                  }
                  status
                }
              }
                  `;
      
            }
      
        // Define our query variables and values that will be used in the query request
        var variables = {
          search: search
        };
      
        // Define the config we'll need for our Api request
        var url = 'https://graphql.anilist.co';
      
       
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
      
        var animeid = response["data"]["Media"]["id"];
        var siteUrl = response["data"]["Media"]["siteUrl"];
        var averageScore = response["data"]["Media"]["averageScore"];
        var meanScore = response["data"]["Media"]["meanScore"];
        var description = response["data"]["Media"]["description"];
        description = description.replace(/<[^>]*>?/gm, '');
        var poster = response["data"]["Media"]["coverImage"]["large"];
        var animetitle = "";
        try {
          animetitle = response["data"]["Media"]["title"]["userPreferred"];
        } catch (Exception) { }
        if (animetitle === null)
          try {
            animetitle = response["data"]["Media"]["title"]["romaji"];
          } catch (Exception) { }
      
        return response = {
          id: animeid,
          title: animetitle,
          poster: poster,
          description: description,
          siteUrl: siteUrl,
          averageScore:averageScore,
          meanScore:meanScore,
          all:response
        };


        
}


module.exports = {
    getAnimeSearch
}