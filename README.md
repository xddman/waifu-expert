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
```
&setmyanilist [AnilistUsername] - sets user anilist, adds it to sqlite database and bot follows the user on anilist.
&deletemyanilist - removes users anilist and unfollows them.
&ratings [Anime] - shows ratings of the specified anime for the users that the bot follows (&setmyanilist).
```
![Screenshot](https://i.imgur.com/15qv8T1.png)

```
&anilist [AnilistUsername] - info about the users anilist like profile picture, banner, anime/amanga stats, favorite anime and favorite characters
```
![Screenshot](https://i.imgur.com/2IKUmpO.png)

```
&va [Character Name] - shows the voice actor of the specified anime character and some of their other popular roles.
```
![Screenshot](https://i.imgur.com/46zoi5X.png)
```
&characters [Anime Name] - shows characters from specified anime with some info about them.
```
![Screenshot](https://i.imgur.com/5eYlirY.png)
```
&manga [Manga Name] - shows some information about the specified manga like latest fantranslated chapter, latest official eng/jp released volumes, anime starting/endings.
&novel [Novel Name] - same as manga just for novels.
```
![Screenshot](https://i.imgur.com/rZ5OTyc.png)



