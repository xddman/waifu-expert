const sharp = require('sharp');
const axios = require('axios');


async function parseText(textData, imageData) {
    var imageWidth = 770;
    var imageHeigth = 800;
    var svgStartX = imageData["TextRegion"]["StartX"];
    var svgStartY = imageData["TextRegion"]["StartY"];
    var columnPercent = imageWidth / 100;

    const dayjs = require('dayjs');
    var duration = require('dayjs/plugin/duration')
    dayjs.extend(duration)
    


    var columnCounter = svgStartX;
    var columnStartX = svgStartX;
    var textStartY = svgStartY;
    var svgText = `<svg height="${imageHeigth}" width="${imageWidth}">`;

    for (var j = 0; j < 3; j++) {
        
        var b = dayjs.duration(textData[2][j], 'seconds').format('D[d] H[h]');
        if(parseInt(dayjs.duration(textData[2][j], 'seconds').format('D'))<1){
            b = dayjs.duration(textData[2][j], 'seconds').format('H[h] m[min]');
        }else if(parseInt(dayjs.duration(textData[2][j], 'seconds').format('m'))<1){
            b = dayjs.duration(textData[2][j], 'seconds').format('m[min]');
        }


        textData[2][j] = b;
        //console.log(textData[2][j]);




        svgText = svgText + `<svg height="${imageHeigth}" width="${(30 * columnPercent)}" x="${columnStartX+(25 + (j * 250))}" y="${svgStartY}">`;
        svgText=svgText+`<rect x="0" y="220" width="100%" height="13.2%" fill="black" opacity="60%"></rect>`;  //color column backgrounds for easier space distribution while coding
        
        //svgText=svgText+`<rect x="0" y="0" width="100%" height="100%" fill="green"></rect>`;  //color column backgrounds for easier space distribution while coding

        var watchColor="red";
        if(textData[3][j]<1)
            watchColor="lightgray";
        svgText=svgText+`<rect x="0" y="319" width="100%" height="1%" fill="${watchColor}" opacity="80%"></rect>`;


        
        for (var i = 1; i < 3; i++) {

                svgText = svgText + `

                <text fill="#ffffff" font-size="35" font-family="Verdana" text-anchor="middle"
                x="${110}" y="${217+(i*45)}">${textData[i][j]}</text>`;

        }

        svgText = svgText + `</svg>`;



        columnCounter++;
    }


    svgText = svgText + `</svg>`;


    return svgText;
}

/*
imageData["Columns"]={numberOfColumns:4};
imageData["Alignment"]={0:"start",1:"middle",2:"end",3:"end"};
imageData["TextRegion"]={StartX:5,StartY:30,EndX:100,EndY:200};
imageData["ColumnSize"]={0:50,1:20,2:20,3:5};
 */
//imageData["TextRegion"]["StartY"]
//
async function createImage(svgFinal, urlObj, imageData) {

    var finalBuffer;
    var url = "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx135806-NwyVfDvm0O3G.jpg";
    //var filepath={ path: __dirname + '/background.png'};
    await sharp(__dirname+'/background.png')
        .webp()
        .toBuffer()
        .then(async function (outputBuffer1) {
            finalBuffer = outputBuffer1;
        });

    for (let i = 0; i < 3; i++) {try{
        //break;
        //console.log(i);
        url = urlObj[0][i];

        input = (await axios({url: url, responseType: "arraybuffer"})).data;
        await sharp(Buffer.from(input))
            .resize({width:230, height:345})
            .png()
            //.toFile('output.png', (err, info) => { console.log(err + "\n" + info) });
            .toBuffer()
            .then(function (output) {
                input = output;
            })

        await sharp(Buffer.from(finalBuffer))
            .composite([{
                input: Buffer.from(input),
                top: 10,
                left: imageData["TextRegion"]["StartX"]+25 + (i * 250),

            }])
            .png()
            //.toFile('output.png', (err, info) => { console.log(err + "\n" + info) });
            .toBuffer()
            .then(function (output) {
                finalBuffer = output;
            })

        }catch(Exception){}
    }
    await sharp(Buffer.from(finalBuffer))
        .composite([{
            input: Buffer.from(svgFinal),
            top: 0,
            left: 0,
        }])
        .png()
        .toBuffer()
        .then(function(output){
            finalBuffer=output;
        })/*
        .toFile('output.png', (err, info) => {
            console.log(err + "\n" + info)
        });*/
    return finalBuffer;
}

async function svgMerge(svgFinal, buffer) {

    var finalBuffer=buffer;
    svgFinal = svgFinal.replace('&','');
    await sharp(Buffer.from(finalBuffer))
        .composite([{
            input: Buffer.from(svgFinal),
            top: 0,
            left: 0,
        }])
        .webp({quality:60})
        .toBuffer()
        .then(function(output){
            finalBuffer=output;
        });
        /*
        .toFile('output.png', (err, info) => {
            console.log(err + "\n" + info)
        });*/
    return finalBuffer;
}

module.exports = {
    parseText,
    createImage,
    svgMerge
}