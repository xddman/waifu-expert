# waifu-expert
Waifu-Expert discord bot


.env:
```
BOT_TOKEN=""
BOT_OWNER=discordid
BOT_PREFIX='&'
BOT_INTERACTION_ID="Test-Bot"
ANILIST_TOKEN=""
```

Commands:

&setmyanilist [AnilistUsername] - sets user anilist, adds it to sqlite database and bot follows the user on anilist.
&deletemyanilist - removes users anilist and unfollows them.
&ratings [Anime] - shows ratings of the specified anime for the users that the bot follows (&setmyanilist).
![Screenshot](https://prnt.sc/um2kfM9p1GHy)


&va [Character Name] - shows the voice actor of the specified anime character and some of their other popular roles.
![Screenshot](https://prnt.sc/tHHj1tyZUPzD)

&characters [Anime Name] - shows characters from specified anime with some info about them.
![Screenshot](https://prnt.sc/tH9xM0MLx1_P)

&manga [Manga Name] - shows some information about the specified manga like latest fantranslated chapter, latest official eng/jp released volumes, anime starting/endings.
&novel [Novel Name] - same as manga just for novels.
![Screenshot](https://prnt.sc/Lu3dnavar1x0)



