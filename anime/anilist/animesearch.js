const got = require('got');

async function getAnimeSearch(command) {

        var search=command.arg;
        var mediaType="ANIME"
        if(command?.flag!=null){
          if(command?.flag==="a")
            mediaType="ANIME";
          else if(command?.flag==="m")
            mediaType="MANGA";
          else if(command?.flag==="ln")
            mediaType="MANGA";
          else
            mediaType="ANIME";
        }
      
      
        var query = `
        query ($search: String){
          Page (page: 1, perPage: 10) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
              perPage
            }
            media (search: $search, type:`+mediaType+`) {
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
                    format
            }
          }
        }
            `;



        
            if(search.includes("anilist.co/anime/")){
              search=search.split("anilist.co/anime/")[1];
              search=search.split("/")[0];
              query = `
              query ($search: String){
                Media(type:`+mediaType+`, search:$search){
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
      
        if(command?.flag==="ln"){
          var i=0;
          while(i<10){
            if(response.data.Page.media[i].format==='NOVEL'){
              response["data"]["Media"]=response.data.Page.media[i];
              break;
            }
            i++;
          }
        }else if(command?.flag==="m"){
          var i=0;
          while(i<10){
            if(response.data.Page.media[i].format==='MANGA'){
              response["data"]["Media"]=response.data.Page.media[i];
              break;
            }
            i++;
          }
        }
        else{
          response["data"]["Media"]=response.data.Page.media[0];
        }

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
          type:mediaType,
          all:response
        };


        
}


module.exports = {
    getAnimeSearch
}