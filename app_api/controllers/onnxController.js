
const fsp = require('fs').promises;
const ndarray = require("ndarray")
const ops = require("ndarray-ops")
const imagenetClasses = require('./../lib/imagenetClasses');



const testApi = async (req, res) => {
    try {
        const x = new Float32Array(3 * 4 * 5).fill(11);
        const y = new Float32Array(3 * 4 * 5).fill(22);
        console.log("x:", x, '\n');
        console.log("y:", y);

        const tensorX = new onnx.Tensor(x, 'float32', [3, 4, 5]);
        const tensorY = new onnx.Tensor(y, 'float32', [3, 4, 5]);
        console.log("xTen:", tensorX, '\n');
        console.log(typeof tensorX, typeof tensorX[0], typeof tensorX[1], typeof tensorX[2]);
        console.log('\n');
        console.log("yTen:", tensorX);

        // Run model with Tensor inputs and get the result by output name defined in model.
        const outputMap = await session.run([tensorX, tensorY]);
        const outputData = outputMap.get('sum');

        // Check if result is expected.
        // assert.deepEqual(outputData.dims, [5, 5, 5]);
        // assert(outputData.data.every((value) => value === 3));
        console.log(`Got an Tensor of size ${outputData.data.length} with all elements being ${outputData.data[0]}`);

        return res.status(200).json({ "test": outputData.data[0] });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ "error": error.message });
    }
}


const testApi2 = async (req, res) => {
    try {
        // Load image.
        // const imageSize = 224;
        // const imageLoader = new ImageLoader(imageSize, imageSize);
        // const imageData = await imageLoader.getImageData('../resnet-cat.jpg');

        const image = await fsp.readFile('/home/luca/Scrivania/code/xeria-be/app_api/lib/resnet-cat.jpg');
        console.log("image", image);

        // Preprocess the image data to match input dimension requirement, which is 1*3*224*224.
        const width = 224;
        const height = 224;
        const preprocessedData = preprocess(image, width, height);

        const inputTensor = new onnx.Tensor(preprocessedData, 'float32', [1, 3, width, height]);
        // Run model with Tensor inputs and get the result.
        const outputMap = await session2.run([inputTensor]);
        const outputData = outputMap.values().next().value.data;

        // Render the output result in html.
        const result = printMatches(outputData);

        return res.status(200).json({ "test": result });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ "error": error.message });
    }
}
/**
 * Preprocess raw image data to match Resnet50 requirement.
 */
function preprocess(data, width, height) {
    const dataFromImage = ndarray(new Float32Array(data), [width, height, 4]);
    const dataProcessed = ndarray(new Float32Array(width * height * 3), [1, 3, height, width]);

    // Normalize 0-255 to (-1)-1
    // ndarray.ops.divseq(dataFromImage, 128.0);
    // ndarray.ops.subseq(dataFromImage, 1.0);
    ops.divseq(dataFromImage, 128.0);
    ops.subseq(dataFromImage, 1.0);


    // Realign imageData from [224*224*4] to the correct dimension [1*3*224*224].
    // ndarray.ops.assign(dataProcessed.pick(0, 0, null, null), dataFromImage.pick(null, null, 2));
    // ndarray.ops.assign(dataProcessed.pick(0, 1, null, null), dataFromImage.pick(null, null, 1));
    // ndarray.ops.assign(dataProcessed.pick(0, 2, null, null), dataFromImage.pick(null, null, 0));
    ops.assign(dataProcessed.pick(0, 0, null, null), dataFromImage.pick(null, null, 2));
    ops.assign(dataProcessed.pick(0, 1, null, null), dataFromImage.pick(null, null, 1));
    ops.assign(dataProcessed.pick(0, 2, null, null), dataFromImage.pick(null, null, 0));

    return dataProcessed.data;
}

// class ImageLoader {
//     constructor(imageWidth, imageHeight) {
//       this.canvas = document.createElement('canvas');
//       this.canvas.width = imageWidth;
//       this.canvas.height = imageHeight;
//       this.ctx = this.canvas.getContext('2d');
//     }
//     async getImageData(url) {
//       await this.loadImageAsync(url);
//       const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
//       return imageData;
//     }
//     loadImageAsync(url) {
//       return new Promise((resolve, reject) => {
//         this.loadImageCb(url, () => {
//           resolve();
//         });
//       });
//     }
//     loadImageCb(url, cb) {
//       loadImage(
//         url,
//         img => {
//           if (img.type === 'error') {
//             throw `Could not load image: ${url}`;
//           } else {
//             // load image data onto input canvas
//             this.ctx.drawImage(img, 0, 0)
//             //console.log(`image was loaded`);
//             window.setTimeout(() => { cb(); }, 0);
//           }
//         },
//         {
//           maxWidth: this.canvas.width,
//           maxHeight: this.canvas.height,
//           cover: true,
//           crop: true,
//           canvas: true,
//           crossOrigin: 'Anonymous'
//         }
//       );
//     }
//   }

function printMatches(data) {
    let outputClasses = [];
    if (!data || data.length === 0) {
        const empty = [];
        for (let i = 0; i < 5; i++) {
            empty.push({ name: '-', probability: 0, index: 0 });
        }
        outputClasses = empty;
    } else {
        outputClasses = imagenetClassesTopK(data, 5);
    }
    const results = [];
    for (let i of [0, 1, 2, 3, 4]) {
        results.push(`${outputClasses[i].name}: ${Math.round(100 * outputClasses[i].probability)}%`);
    }
    return results;
}

/**
* Utility function to post-process Resnet50 output. Find top k ImageNet classes with highest probability.
*/
function imagenetClassesTopK(classProbabilities, k) {
    if (!k) { k = 5; }
    const probs = Array.from(classProbabilities);
    const probsIndices = probs.map(
        function (prob, index) {
            return [prob, index];
        }
    );
    const sorted = probsIndices.sort(
        function (a, b) {
            if (a[0] < b[0]) {
                return -1;
            }
            if (a[0] > b[0]) {
                return 1;
            }
            return 0;
        }
    ).reverse();
    const topK = sorted.slice(0, k).map(function (probIndex) {
        const iClass = imagenetClasses[probIndex[1]];
        return {
            id: iClass[0],
            index: parseInt(probIndex[1], 10),
            name: iClass[1].replace(/_/g, ' '),
            probability: probIndex[0]
        };
    });
    return topK;
}
module.exports = {
    testApi,
    testApi2
}