# The Sound of Sight

What does it mean to listen to an image? This tool explores one possible answer. The image is broken down into a list of frequencies (using discrete cosine transform). The top 10 frequencies are then played as a sound. 

The sliders let you filter the frequencies, of both the sound & the image simultanously. The **harmonize** button applies a filter to keep only frequencies that are a multiple of the input. So harmonizing on `220` will produce an image and a sound with frequencies `220`, `440`, `880`, etc..

Try it at: https://omarshehata.itch.io/sound-of-sight

Made for [Drone Jam 2022](https://itch.io/jam/drone). 

![drone](https://user-images.githubusercontent.com/1711126/168429136-e598d686-552d-4033-9ac3-e151fbfa12d9.gif)

## Preview

The video below shows most of the tool's features, including drag & drop to add your own images. **Unmute the video**.

https://user-images.githubusercontent.com/1711126/168429807-9aa8b879-21ab-4c79-8be7-53578844fb44.mp4

It is also possible to write some code in the browser console to apply your own filters. Here I'm using it to turn the image into one or more pure frequencies and listen to that.

https://user-images.githubusercontent.com/1711126/168430039-6659d378-be53-420d-b181-31af0999a59e.mp4

Below is an example code snippet you can try that will remove all frequencies below 440 & above 880.

```javascript
const {imageFrequencyData, Image, canvas, toSoundFrequency, playImage} = window.data
const {dct, originalDct} = imageFrequencyData
for (let i = 1; i < dct.length; i++) {
  const f = toSoundFrequency(i, dct.length)
  if (f >= 440 && f <= 880) {
    dct[i] = originalDct[i]
  } else {
    dct[i] = 0
    
  }
}
const newImageData = Image.regenerateImageWhole(imageFrequencyData)
const ctx = canvas.getContext("2d");
ctx.putImageData(newImageData, 0, 0)
playImage()
```
