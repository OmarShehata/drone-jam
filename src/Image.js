import FastDct from "./lib/FastDct.js";

function pad(array) {
  // Pad an array with 0's to reach a power of 2 length.
  let nextPowerOf2 = 2 ** Math.ceil(Math.log2(array.length));
  for (let i = array.length; i < nextPowerOf2; i++) {
    array.push(0);
  }
  return array;
}

class Image {
  static async getImage(imageUrl) {
    const canvas = document.createElement("canvas");
    const request = await fetch(imageUrl);
    const blob = await request.blob();

    const imageBitmap = await createImageBitmap(blob);

    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBitmap, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return { imageData, imageBitmap };
  }

  static generateFrequenciesWhole(imageData) {
  	// Given an image, generate frequencies for the whole thing
  	
  }

  static generateFrequencies(imageData, blockSize) {
    // Given image data of a canvas
    // Break it down into N x N blocks
    // Generate a list of N frequencies for each block
    const { width, height, data } = imageData;
    function processBlock(startX, startY, endX, endY) {
      const values = [];
      for (let x = startX; x < endX; x++) {
        for (let y = startY; y < endY; y++) {
          const i = (y * width + x) * 4;
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const luma = (r + g + b) / 3
          values.push(luma);
        }
      }
      const dct = pad(values.slice());
      const padding = dct.length - values.length;
      FastDct.fastDctLee.transform(dct);
      return { padding, dct };
    }

    const blocks = [];
    for (let x = 0; x < width; x += blockSize) {
      for (let y = 0; y < height; y += blockSize) {
        const dctData = processBlock(x, y, x + blockSize, y + blockSize);
        dctData.x = x;
        dctData.y = y;
        blocks.push(dctData);
      }
    }

    return { blocks, width, height, blockSize };
  }

  static regenerateImage(blockData) {
    // Returns imageData that you can put to canvas
    // ctx.putImageData(finalImageData, 0, 0);
    const canvas = document.createElement("canvas");
    const { width, height, blocks, blockSize } = blockData
    const newImageData = canvas.getContext("2d").createImageData(width, height)

    for (let block of blocks) {
    	const dctCopy = block.dct.slice();
      FastDct.fastDctLee.inverseTransform(dctCopy);

      let values = dctCopy.slice(0, dctCopy.length - block.padding);
      const scale = dctCopy.length / 2;
      values = values.map(v => v / scale)

      let currentX = 0;
      let currentY = 0;
      for (let i = 0; i < values.length; i++) {
      	const X = block.x + currentX;
      	const Y = block.y + currentY;
  			const index = (Y * width + X) * 4;
  			newImageData.data[index] = values[i];
  			newImageData.data[index + 1] = values[i];
  			newImageData.data[index + 2] = values[i];
  			newImageData.data[index + 3] = 255;

  			currentY ++;
  			if (currentY >= blockSize) {
  				currentY = 0;
  				currentX ++;
  			}
      }

    }
    
    return newImageData	
  }
}

export default Image;
