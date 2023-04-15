const sharp = require('sharp');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');

const Discord = require('discord.js');
const { buffer } = require('sharp/lib/is');



async function createRatingsImage(svgFinal, coverImage) {
    var sharpStream;

    url = coverImage;
    if (!url.includes("http")) { url = "https://i.imgur.com/JHLAEGP.png"; }

    const input = (await axios({ url: url, responseType: "arraybuffer" })).data;
    await sharp(Buffer.from(input))
        .resize(150)
        .toBuffer()
        .then(async function (outputBuffer) {

            await sharp({
                create: {
                    width: 770,
                    height: 800,
                    channels: 4,
                    background: { r: 47, g: 49, b: 54, alpha: 0 }
                }
            }).composite([{
                input: Buffer.from(outputBuffer),
                top: 5,
                left: 5,

            }])
                .webp()
                .toBuffer()
                .then(async function (outputBuffer1) {

                    await sharp(Buffer.from(outputBuffer1))
                        .composite([{
                            input: Buffer.from(svgFinal),
                            top: 10,
                            left: 0,
                        }])
                        //.png()
                        .webp({loseless: false, quality:60})
                        .toBuffer()
                        .then(async function (outputBuffer2) {
                            sharpStream = outputBuffer2;
                        });
                    //.toFile('output.png', (err, info) => { console.log(err + "\n" + info) });
                });
        });

    return sharpStream;
}

async function createCharactersImage(characters, response) {
    let width = 770;
    let height = 800;
    var j = 260;
    var finalBuffer;

    var background;

    var url = response.data?.Media?.coverImage?.medium;
    if (!url.includes("http")) { url = "https://i.imgur.com/JHLAEGP.png"; }

    var input = (await axios({ url: url, responseType: "arraybuffer" })).data;

    await sharp(Buffer.from(input))
        .resize(150)
        .toBuffer()
        .then(async function (outputBuffer) {
            await sharp({
                create: {
                    width: 770,
                    height: 800,
                    channels: 4,
                    background: { r: 47, g: 49, b: 54, alpha: 0 }
                }
            }).composite([{
                input: Buffer.from(outputBuffer),
                top: 5,
                left: 5,

            }])
                .webp({quality:60})
                //.toFile('output.png', (err, info) => { console.log(err + "\n" + info) });
                .toBuffer()
                .then(async function (outputBuffer1) {
                    background = outputBuffer1;
                })
        });

    var svg = `
        <svg width="${width}" height="${height}">
        `
    const monthNames = ["null","January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    i = 0;
    k = 0;
    l = 0;

    var counterOne = characters?.length;
    if (counterOne < 6)
        counterOne = characters?.length;
    else
        counterOne = 6;

    while (i < counterOne) {
        if (i === 3) {
            l = 0;
            k = 1;
        }
        var leftPadding = k * 395;

        var birthday = "";
        if (monthNames[characters[i]?.birthmonth] === undefined) { birthday = ""; } else { birthday = monthNames[characters[i]?.birthmonth]; }
        if (characters[i]?.birthday === null) { birthday = birthday + ""; } else { birthday = birthday + " " + characters[i]?.birthday; }
        if (birthday?.length < 1) { birthday = "Unknown" }

        var fullName = characters[i]?.name;

        if (fullName?.length > 23)
            fullName = fullName?.slice(0, 23).trim() + "...";

        var altName = characters[i].alternative?.replace(/[^\w\s]/gi, '').trim();
        if (altName?.length > 23)
            altName = characters[i].alternative?.replace(/[^\w\s]/gi, '').slice(0, 23).trim() + "...";

        svg = svg + `
        <text fill="#ffffff" font-size="25" font-family="Verdana"
            x="${leftPadding + 2}" y="${j - 8 + (190 * l)}">${fullName}</text>
        <text fill="#ffffff" font-size="17" font-family="Verdana"
            x="${leftPadding + 120}" y="${j + 30 + (190 * l)}">Role: ${characters[i]?.role}</text>
        <text fill="#ffffff" font-size="17" font-family="Verdana"
            x="${leftPadding + 120}" y="${j + 55 + (190 * l)}">Birthday: ${birthday}</text>
        <text fill="#ffffff" font-size="17" font-family="Verdana"
            x="${leftPadding + 120}" y="${j + 80 + (190 * l)}">Gender: ${characters[i]?.gender}</text>
        <text fill="#ffffff" font-size="17" font-family="Verdana"
            x="${leftPadding + 120}" y="${j + 105 + (190 * l)}">VA: ${characters[i]?.voice}</text>
        <text fill="#ffffff" font-size="17" font-family="Verdana"
            x="${leftPadding + 120}" y="${j + 130 + (190 * l)}">Alt: ${altName}</text>
        `;




        url = characters[i].image;
        if (!url.includes("http")) { url = "https://i.imgur.com/default.jpg"; }
        if (url.includes("default.jpg")) {
            url = __dirname + "/../../images/default.jpg"
            await sharp(url)
                .toBuffer()
                .then(async function (bufferInput) {
                    input = bufferInput;
                })
        } else {
            input = (await axios({ url: url, responseType: "arraybuffer" })).data;
        }
        await sharp(Buffer.from(input))
            //.resize(150)
            .toBuffer()
            .then(async function (outputBuffer) {
                await sharp(Buffer.from(background))
                    .composite([{
                        input: Buffer.from(outputBuffer),
                        top: j + (190 * l),
                        left: 5 + leftPadding,

                    }])
                    .webp({quality:60})
                    //.toFile('output.png', (err, info) => { console.log(err + "\n" + info) });
                    .toBuffer()
                    .then(async function (outputBuffer1) {
                        background = outputBuffer1;
                    })
            });
        l++;
        i++;
    }


    svg = svg + `
<text fill="#ffffff" font-size="30" font-family="Verdana"
	x="220" y="40">Source:</text>

<text fill="#ffffff" font-size="20" font-family="Verdana"
	x="220" y="80">${response.data?.Media?.source}</text>

<text fill="#ffffff" font-size="30" font-family="Verdana"
	x="470" y="40">Status:</text>

<text fill="#ffffff" font-size="20" font-family="Verdana"
	x="470" y="80">${response.data?.Media?.status}</text>





<text fill="#ffffff" font-size="30" font-family="Verdana"
	x="220" y="145">Format:</text>

<text fill="#ffffff" font-size="20" font-family="Verdana"
	x="220" y="185">${response.data?.Media?.format}</text>

<text fill="#ffffff" font-size="30" font-family="Verdana"
	x="470" y="145">Episodes:</text>

<text fill="#ffffff" font-size="20" font-family="Verdana"
	x="470" y="185">${response.data?.Media?.episodes}</text>
`;




    svg = svg + "</svg>";
    await sharp(Buffer.from(background))
        .composite([{
            input: Buffer.from(svg),
            top: 1,
            left: 1,

        }])
        .webp({quality:60})
        //.toFile('output1.png', (err, info) => { console.log(err + "\n" + info) });
        .toBuffer()
        .then(async function (outputBuffer1) {
            finalBuffer = outputBuffer1;
        })
    /*
        await sharp(Buffer.from(background))
            .resize(1280)
            .png()
            .toFile('output1.png', (err, info) => { console.log(err + "\n" + info) });
    
    */









    return finalBuffer;



}

async function createUserInfoImage(user, cacheInfo) {
    //let width = 770;
    //let height = 800;
    var j = 260;
    var finalBuffer;
    var svg = `<svg width="770" height="800">`;
    var bannerBuffer;
    var finalBufferMulti=[];



    if(cacheInfo["type"]==="none"){
    var url = user.data?.User?.bannerImage;
    if (!url?.includes("http")) { url = "https://i.imgur.com/JHLAEGP.png"; }

    var input = (await axios({ url: url, responseType: "arraybuffer" })).data;

    var image = await sharp(Buffer.from(input));
    var metadata = await image.metadata();
    //console.log(metadata);
    var width = metadata?.width;
    var height = metadata?.height;

    //banner resizing and cropping
        
    var heightModified = (height/width)*770

                //console.log(metadata)
                if(heightModified >210){
                    await sharp(Buffer.from(input))
                    .resize({ width: 770 })
                    .toBuffer()
                    .then(async function (outputBuffer1) {
                        image = await sharp(Buffer.from(outputBuffer1));
                        metadata = await image.metadata();
                        width = metadata?.width;
                        height=metadata?.height;
                    image.extract({ width: 770, height: 210, left: 0, top: parseInt(height/2)-105 })
                    .png()
                    .toBuffer()
                    //.toFile('output3.png', (err, info) => { console.log(err + "\n" + info) });
                    .then(async function (outputBuffer2) {
                        bannerBuffer = outputBuffer2;
                    });
                });
                }else if(heightModified <210){
                    await sharp(Buffer.from(input))
                    .resize({height:210})
                    .png()
                    .toBuffer()
                    .then(function(outputBuffer2){
                        sharp(Buffer.from(outputBuffer2))
                        .extract({ width: 770, height: 210, left:0, top: 0 })
                        .png()
                        .toBuffer()
                        //.toFile('output3.png', (err, info) => { console.log(err + "\n" + info) });
                        .then(async function (outputBuffer2) {
                            bannerBuffer = outputBuffer2;
                        });

                    })

                }
            
    url=user.data.User.avatar.medium;
    input = (await axios({ url: url, responseType: "arraybuffer" })).data;

    image = await sharp(Buffer.from(input));
    metadata = await image.metadata();
    console.log("aaaaaaa")
    console.log(metadata);
    width = metadata?.width;
    height = metadata?.height;

    var profileBuffer;
    await sharp(Buffer.from(input))
    .resize(140)
    .toBuffer()
    .then(async function(outputBuffer){
        profileBuffer=outputBuffer;
    })

    image = await sharp(Buffer.from(profileBuffer));
    metadata = await image.metadata();
    //console.log(metadata);
    width = metadata?.width;
    height = metadata?.height;






    await sharp({
        create: {
            width: 770,
            height: 800,
            channels: 4,
            background: { r: 47, g: 49, b: 54, alpha: 255 }
        }
    }).composite([{
        input: Buffer.from(bannerBuffer),
        top: 0,
        left: 0,

    }])
        .jpeg()
        //.toFile('output.png', (err, info) => { console.log(err + "\n" + info) });
        .toBuffer()
        .then(async function (outputBuffer1) {
            await sharp(Buffer.from(outputBuffer1))
            .composite([{
                input: Buffer.from(profileBuffer),
                top: 210-height,
                left: 20,

            }])
                .jpeg()
                //.toFile('output.png', (err, info) => { console.log(err + "\n" + info) });
                .toBuffer()
                .then(function(output){
                    finalBuffer=output;
                })
        })

    const favoriteAnimeP = Promise.all(user.data?.User?.favourites?.anime?.edges.map(async edge => {
        url=edge.node?.coverImage?.medium;

        if (!url) {
            return;
        }

        input = (await axios({ url: url, responseType: "arraybuffer" })).data;

        return input;
    }));

    const favoriteCharacterP = Promise.all(user.data?.User?.favourites?.characters?.edges.map(async edge => {
        url=edge?.node?.image?.medium;

        if (!url) {
            return;
        }

        input = (await axios({ url: url, responseType: "arraybuffer" })).data;

        return input;
    }));

    console.time('anilist');

    const [favoriteAnime, favoriteCharacter] = await Promise.all([favoriteAnimeP, favoriteCharacterP]);

    const animeComposite = favoriteAnime.map((a, i) => ({
        input: a,
        top: 350,
        left: 25 + (i * 150)
    }));

    const characterComposite = favoriteCharacter.map((a, i) => ({
        input: a,
        top: 550,
        left: 25 + (i * 150)
    }));

    await sharp(Buffer.from(finalBuffer))
        .composite([...animeComposite, ...characterComposite])
        .jpeg()
        //.toFile('output.png', (err, info) => { console.log(err + "\n" + info) });
        .toBuffer()
        .then(function(output){
            finalBuffer=output;
        })

        
        halfBuffer=finalBuffer;
        finalBufferMulti["halfBuffer"]=halfBuffer;
        console.log("no cache");
        console.timeEnd('anilist');
    }else{
        finalBuffer=cacheInfo["halfCache"];
        finalBufferMulti["halfBuffer"]=finalBuffer;
        console.log("half cached");
    }







        svg=svg+`
        <text fill="#ffffff" font-size="25" font-family="Verdana"
        x="50" y="290">${user.data?.User?.statistics?.anime?.count}</text>
        <text fill="#ffffff" font-size="17" font-family="Verdana"
        x="25" y="260">Total Anime:</text>

        <text fill="#ffffff" font-size="25" font-family="Verdana"
        x="175" y="290">${parseFloat(user.data?.User?.statistics?.anime?.minutesWatched/60/24).toFixed(1)}</text>
        <text fill="#ffffff" font-size="17" font-family="Verdana"
        x="150" y="260">Days Watched:</text>
        
        <text fill="#ffffff" font-size="25" font-family="Verdana"
        x="310" y="290"> ${user.data?.User?.statistics?.anime?.meanScore}</text>
        <text fill="#ffffff" font-size="17" font-family="Verdana"
        x="296" y="260">Mean Score:</text>



        <text fill="#ffffff" font-size="25" font-family="Verdana"
        x="505" y="290"> ${user.data?.User?.statistics?.manga?.count}</text>
        <text fill="#ffffff" font-size="17" font-family="Verdana"
        x="480" y="260">Total Manga:</text>

        <text fill="#ffffff" font-size="25" font-family="Verdana"
        x="633" y="290"> ${user.data?.User?.statistics?.manga?.chaptersRead}</text>
        <text fill="#ffffff" font-size="17" font-family="Verdana"
        x="610" y="260">Chapters Read:</text>
        `;

        
        svg = svg + `
        <text fill="#ffffff" font-size="17" font-family="Verdana"
            x="25" y="330">Favorite Anime:</text>
        <text fill="#ffffff" font-size="17" font-family="Verdana"
            x="25" y="530">Favorite Characters:</text>
        `;
        svg = svg + "</svg>";


        await sharp(Buffer.from(finalBuffer))
        .composite([{
            input: Buffer.from(svg),
            top: 1,
            left: 1,

        }])
        .webp({ lossless: false, quality: 60 })
        //.toFile('output1.png', (err, info) => { console.log(err + "\n" + info) });
        .toBuffer()
        .then(async function (outputBuffer1) {
            finalBuffer = outputBuffer1;
        })


        finalBufferMulti["finalBuffer"]=finalBuffer;
        




    return finalBufferMulti;



}



module.exports = {
    createRatingsImage,
    createCharactersImage,
    createUserInfoImage
}