const sharp = require('sharp');

async function parseText(textData, imageData) {
    var imageWidth=770;
    var imageHeigth=800;
    var svgStartX=imageData["TextRegion"]["StartX"];
    var svgStartY=imageData["TextRegion"]["StartY"];
    var columnPercent=(imageWidth-((imageData["Columns"]["numberOfColumns"]-1)*37))/100;


    var columnCounter=0;
    var columnStartX=0+svgStartX;
    var textStartX=svgStartX;
    var svgText = `<svg height="${imageHeigth}" width="${imageWidth}">`;

    textData.forEach(item => {
        switch (imageData["Alignment"][columnCounter]) {
            case "middle":
                textStartX=(imageData["ColumnSize"][columnCounter]*columnPercent)/2;
                break;
            case "end":
                textStartX=(imageData["ColumnSize"][columnCounter]*columnPercent);
                break;
            default:
                textStartX=columnStartX+0;
                break;
        }

        svgText = svgText+`

<svg height="${imageHeigth}" width="${(imageData["ColumnSize"][columnCounter]*columnPercent)}" x="${columnStartX}" y="${svgStartY}">`;
        //svgText=svgText+`<rect x="0" y="0" width="100%" height="100%" fill="green"></rect>`;  //color column backgrounds for easier space distribution while coding
        for (var i = 0; i < item.length&&i<imageData["maxRows"]; i++) {
            if(imageData["Title"]===true&&i===0){
                var tempAlign=imageData["Alignment"][columnCounter];
                var tempTextStartX=textStartX;
                if(tempAlign==="start"){
                    tempAlign="middle";
                    tempTextStartX=(imageData["ColumnSize"][columnCounter]*columnPercent)/2;
                }
                svgText=svgText+`
                    <defs>
                    <filter id="whiteOutlineEffect" color-interpolation-filters="sRGB">
                    <feMorphology in="SourceAlpha" result="MORPH" operator="dilate" radius="0.5" />
                    <feColorMatrix in="MORPH" result="WHITENED" type="matrix" values="-1 0 0 0 1, 0 -1 0 0 1, 0 0 -1 0 1, 0 0 0 1 0"/>
                    <feMerge>
                        <feMergeNode in="WHITENED"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                    </filter>
                    </defs>
                    <text fill="#ffffff" font-size="30" font-family="Verdana" text-anchor="${tempAlign}" filter="url(#whiteOutlineEffect)"
                    x="${tempTextStartX}" y="${(svgStartY+(35*i+1))}">${item[i]}</text>`;

            }else
                svgText=svgText+`
                <text fill="#ffffff" font-size="30" font-family="Verdana" text-anchor="${imageData["Alignment"][columnCounter]}"
                x="${textStartX}" y="${(svgStartY+(35*i+1))}">${item[i]}</text>`;

        }

        svgText=svgText+`
</svg>`;


        columnStartX=columnStartX+(imageData["ColumnSize"][columnCounter]*columnPercent)+25;
        columnCounter++;
    });




    svgText=svgText+`</svg>`;




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
async function createImage(svgFinal, imageData) {
    var sharpStream;


    await sharp({
        create: {
            width: 770,
            height: 800,
            channels: 4,
            background: { r: 43, g: 45, b: 49, alpha: 0 }
        }
    })
        .ensureAlpha()
        .png()
        .toBuffer()
        .then(async function (outputBuffer1) {

            await sharp(Buffer.from(outputBuffer1))
                .composite([{
                    input: Buffer.from(svgFinal),
                    top: 0,
                    left: 0,
                }])
                .png()
                .toBuffer()
                .then(async function (outputBuffer2) {
                    sharpStream = outputBuffer2;
                });
            /*.toFile('./output.png', (err, info) => {
                console.log(err + "\n" + info)
            });*/
        });


    return sharpStream;
}


module.exports = {
    parseText,
    createImage
}