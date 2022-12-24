class CollisonDetector {
  constructor () {
    this.stage = null
    this.currentSpriteBitmaps = {}

    this.canvasSize1 = {
      w: 0,
      h: 0
    }

    this.canvasSize2 = {
      w: 0,
      h: 0
    }

    this.canvasElement1 = null
    this.canvasContext1 = null
    this.canvasElement2 = null
    this.canvasContext2 = null
  }

  /**
   * @param {Stage} stage
   * @returns
   */
  init (stage) {
    this.stage = stage

    this.canvasSize1 = {
      w: this.stage.width,
      h: this.stage.height
    }

    this.canvasSize2 = JSON.parse(JSON.stringify(this.canvasSize1))

    const createCanvas1 = () => {
      const el = document.createElement('canvas')

      el.id = 'collisionCanvas1'
      el.width = this.canvasSize1.w
      el.height = this.canvasSize1.h
      el.style.zIndex = 0
      el.style.position = 'absolute'
      el.style.left = '0px'
      el.style.top = this.stage.height

      this.canvasElement1 = el
      this.canvasContext1 = this.canvasElement1.getContext('2d')

      return el
    }

    const createCanvas2 = () => {
      const el = document.createElement('canvas')

      el.id = 'collisionCanvas2'
      el.width = this.canvasSize2.w
      el.height = this.canvasSize2.h
      el.style.zIndex = 0
      el.style.position = 'absolute'
      el.style.left = '0px'
      el.style.top = this.stage.height

      this.canvasElement2 = el
      this.canvasContext2 = this.canvasElement2.getContext('2d')

      return el
    }

    const body = document.getElementsByTagNameNS('*', 'body')[0]
    body.style.overflow = 'hidden'

    body.appendChild(createCanvas1())
    body.appendChild(createCanvas2())

    return this
  }

  async refreshSpriteBitmapCache () {
    const sprites = this.stage.sprites
    this.currentSpriteBitmaps = {}

    for (let i = 0; i < sprites.length; i++) {
      const sprite = sprites[i]
      const imageUrl = sprite.costume.image
      if (imageUrl === '') continue // no costume for sprite
      const image = await this.loadImageFromUrl(imageUrl)

      const canvas = document.createElement('canvas')
      const size = Math.sqrt(Math.pow(image.width, 2) + Math.pow(image.height, 2)) // Get diagonal as the size so no matter the rotation, the image will fit inside the box

      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')

      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((sprite.direction - 90) * Math.PI / 180)
      ctx.drawImage(image, -image.width / 2, -image.height / 2)
      const bitmapData = canvas.toDataURL('image/png')

      await this.saveImageFromBitmap(imageUrl, bitmapData, size)
    }

    console.log('Generated Bitmaps', this.currentSpriteBitmaps)
  }

  async saveImageFromBitmap (url, bitmapData, size) {
    return new Promise(resolve => {
      const imageData = new Image()
      imageData.src = bitmapData
      imageData.onload = async () => {
        this.currentSpriteBitmaps[url] = {
          data: await createImageBitmap(imageData),
          w: size,
          h: size
        }
        resolve()
      }
    })
  }

  async loadImageFromUrl (url) {
    return new Promise(resolve => {
      const image = new Image()
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
      image.onload = () => {
        resolve(image)
      }
      image.onerror = () => {
        throw new Error()
      }
    })
  }

  doSpritesOverlap (spriteData1, spriteData2) {
    const spriteBitmap1 = this.currentSpriteBitmaps[spriteData1.image]
    const spriteBitmap2 = this.currentSpriteBitmaps[spriteData2.image]

    if (!spriteBitmap1 || !spriteBitmap1.data || !spriteBitmap2 || !spriteBitmap2.data) return false // does not have image data

    // check if they overlap
    if (
      spriteData1.x > spriteData2.x + spriteBitmap2.w ||
      spriteData1.x + spriteBitmap1.w < spriteData2.x ||
      spriteData1.y > spriteData2.y + spriteData2.h ||
      spriteData1.y + spriteData1.h < spriteData2.y
    ) return false // no overlap

    // size of overlapping area
    // find left edge
    const ax = spriteData1.x < spriteData2.x ? spriteData2.x : spriteData1.x
    // find right edge calculate width
    let aw = spriteData1.x + spriteBitmap1.w < spriteData2.x + spriteBitmap2.w ? (spriteData1.x + spriteBitmap1.w) - ax : (spriteData2.x + spriteBitmap2.w) - ax
    // do the same for top and bottom
    const ay = spriteData1.y < spriteData2.y ? spriteData2.y : spriteData1.y
    let ah = spriteData1.y + spriteData1.h < spriteData2.y + spriteData2.h ? (spriteData1.y + spriteData1.h) - ay : (spriteData2.y + spriteData2.h) - ay

    if (aw === 0 || ah === 0) return false // no overlap, on edge

    this.canvasContext1.clearRect(0, 0, this.canvasSize1.w, this.canvasSize1.h)
    this.canvasContext2.clearRect(0, 0, this.canvasSize2.w, this.canvasSize2.h)

    // resize
    this.canvasSize1 = Object.assign({}, {
      w: aw,
      h: ah
    })
    this.canvasElement1.width = aw
    this.canvasElement1.height = aw
    this.canvasContext1 = this.canvasElement1.getContext('2d')

    // draw the first image relative to the overlap area
    this.canvasContext1.drawImage(spriteBitmap1.data, spriteData1.x - ax, spriteData1.y - ay)
    // only pixels will remain if both images are not trasparent
    this.canvasContext1.globalCompositeOperation = 'destination-in'
    this.canvasContext1.drawImage(spriteBitmap2.data, spriteData2.x - ax, spriteData2.y - ay)
    this.canvasContext1.globalCompositeOperation = 'source-over'

    // now draw over its self to amplify any pixels that have low alpha
    for (let i = 0; i < 32; i++) {
      this.canvasContext1.drawImage(this.canvasElement1, 0, 0)
    }

    // set canvas 2 size
    this.canvasSize2 = Object.assign({}, {
      w: Math.max(1, Math.floor(aw / 8)),
      h: Math.max(1, Math.floor(ah / 8))
    })
    let rw = this.canvasSize2.w
    let rh = this.canvasSize2.h
    this.canvasElement2.width = rw
    this.canvasElement2.height = rh
    this.canvasContext2 = this.canvasElement2.getContext('2d')

    while (rw > 8 && rh > 8) {
      // draw the mask image several times
      for (let i = 0; i < 32; i++) {
        this.canvasContext2.drawImage(
          this.canvasElement1,
          0, 0, aw, ah,
          Math.random(),
          Math.random(),
          rw, rh
        )
      }

      // clear main canvas
      this.canvasContext1.clearRect(0, 0, aw, ah)

      // set the new size
      aw = rw
      ah = rh

      // draw the small copy onto original
      this.canvasContext1.drawImage(this.canvasElement2, 0, 0)

      this.canvasContext2.clearRect(0, 0, this.canvasSize2.w, this.canvasSize2.h)

      rw = Math.max(1, Math.floor(aw / 8))
      rh = Math.max(1, Math.floor(ah / 8))
    }

    return this.checkPixels(aw, ah)
  }

  checkPixels (w, h) {
    const imageData = new Uint32Array(this.canvasContext1.getImageData(0, 0, w, h).data.buffer)
    let i = 0
    // if any pixel is not zero then there must be an overlap
    while (i < imageData.length) {
      if (imageData[i++] !== 0) {
        return true
      }
    }
    return false
  }
}

export default new CollisonDetector()
