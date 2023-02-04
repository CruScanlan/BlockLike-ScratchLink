class CollisonDetector {
  constructor () {
    this.stage = null
    this.currentSpriteBitmaps = {}

    this.collisionCanvasSize1 = {
      w: 0,
      h: 0
    }

    this.collisionCanvasSize2 = {
      w: 0,
      h: 0
    }

    this.collisonCanvasElement1 = null
    this.collisonCanvasContext1 = null
    this.collisonCanvasElement2 = null
    this.collisonCanvasContext2 = null

    this.edgeCanvasSize = {
      w: 0,
      h: 0
    }

    this.edgeCanvasElement = null
    this.edgeCanvasContext = null
  }

  /**
   * @param {Stage} stage
   * @returns
   */
  init (stage) {
    this.stage = stage

    this.collisionCanvasSize1 = {
      w: this.stage.width,
      h: this.stage.height
    }

    this.collisionCanvasSize2 = JSON.parse(JSON.stringify(this.collisionCanvasSize1))

    this.edgeCanvasSize = { // 2px bigger so we can check the edge for visible pixels
      w: this.stage.width + 2,
      h: this.stage.height + 2
    }

    const createCollisionCanvas1 = () => {
      const el = document.createElement('canvas')

      el.id = 'collisionCanvas1'
      el.width = this.collisionCanvasSize1.w
      el.height = this.collisionCanvasSize1.h
      el.style.zIndex = 0
      el.style.position = 'absolute'
      el.style.left = '0px'
      el.style.top = this.stage.height

      this.collisonCanvasElement1 = el
      this.collisonCanvasContext1 = this.collisonCanvasElement1.getContext('2d')

      return el
    }

    const createCollisionCanvas2 = () => {
      const el = document.createElement('canvas')

      el.id = 'collisionCanvas2'
      el.width = this.collisionCanvasSize2.w
      el.height = this.collisionCanvasSize2.h
      el.style.zIndex = 0
      el.style.position = 'absolute'
      el.style.left = '0px'
      el.style.top = this.stage.height

      this.collisonCanvasElement2 = el
      this.collisonCanvasContext2 = this.collisonCanvasElement2.getContext('2d')

      return el
    }

    const createEdgeCanvas = () => {
      const el = document.createElement('canvas')

      el.id = 'edgeCanvas'
      el.width = this.edgeCanvasSize.w
      el.height = this.edgeCanvasSize.h
      el.style.zIndex = 0
      el.style.position = 'absolute'
      el.style.left = '0px'
      el.style.top = this.stage.height

      this.edgeCanvasElement = el
      this.edgeCanvasContext = this.edgeCanvasElement.getContext('2d')

      document.addEventListener('keyup', (e) => {
        if (e.code === 'ControlLeft') {
          console.log('download canvas')
          const link = document.createElement('a')
          link.setAttribute('download', 'canvas.png')
          link.setAttribute('href', this.edgeCanvasElement.toDataURL('image/png').replace('image/png', 'image/octet-stream'))
          link.click()
        }
      })

      return el
    }

    const body = document.getElementsByTagNameNS('*', 'body')[0]
    body.style.overflow = 'hidden'

    body.appendChild(createCollisionCanvas1())
    body.appendChild(createCollisionCanvas2())
    body.appendChild(createEdgeCanvas())

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

      canvas.width = sprite.width
      canvas.height = sprite.height
      const ctx = canvas.getContext('2d')

      const ratio = image.width / image.height
      let drawWidth = image.width
      let drawHeight = image.height
      if (image.width / sprite.width > image.height / sprite.height) {
        drawWidth = sprite.width
        drawHeight = sprite.width / ratio
      } else {
        drawWidth = sprite.height * ratio
        drawHeight = sprite.height
      }

      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((sprite.direction - 90) * Math.PI / 180)
      ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
      const bitmapData = canvas.toDataURL('image/png')

      await this.saveImageFromBitmap(
        imageUrl,
        bitmapData,
        {
          w: sprite.width,
          h: sprite.height
        }
      )
    }

    // console.log('Generated Bitmaps', this.currentSpriteBitmaps)
  }

  async saveImageFromBitmap (url, bitmapData, sizeData) {
    return new Promise(resolve => {
      const imageData = new Image()
      imageData.src = bitmapData
      imageData.onload = async () => {
        this.currentSpriteBitmaps[url] = {
          data: await createImageBitmap(imageData),
          ...sizeData
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

    spriteData1.x = spriteData1.x - (spriteData1.w / 2)
    spriteData1.y = (spriteData1.y * -1) - (spriteData1.h / 2)

    spriteData2.x = spriteData2.x - (spriteData2.w / 2)
    spriteData2.y = (spriteData2.y * -1) - (spriteData2.h / 2)

    // check if they overlap
    if (
      spriteData1.x > spriteData2.x + spriteData2.w ||
      spriteData1.x + spriteData1.w < spriteData2.x ||
      spriteData1.y > spriteData2.y + spriteData2.h ||
      spriteData1.y + spriteData1.h < spriteData2.y
    ) return false // no overlap

    // size of overlapping area
    // find left edge
    const ax = spriteData1.x < spriteData2.x ? spriteData2.x : spriteData1.x
    // find right edge calculate width
    let aw = spriteData1.x + spriteData1.w < spriteData2.x + spriteData2.w ? (spriteData1.x + spriteData1.w) - ax : (spriteData2.x + spriteData2.w) - ax
    // do the same for top and bottom
    const ay = spriteData1.y < spriteData2.y ? spriteData2.y : spriteData1.y
    let ah = spriteData1.y + spriteData1.h < spriteData2.y + spriteData2.h ? (spriteData1.y + spriteData1.h) - ay : (spriteData2.y + spriteData2.h) - ay

    if (aw < 1 || ah < 1) return false // no overlap, on edge

    this.collisonCanvasContext1.clearRect(0, 0, this.collisionCanvasSize1.w, this.collisionCanvasSize1.h)
    this.collisonCanvasContext2.clearRect(0, 0, this.collisionCanvasSize2.w, this.collisionCanvasSize2.h)

    // resize
    this.collisionCanvasSize1 = Object.assign({}, {
      w: aw,
      h: ah
    })
    this.collisonCanvasElement1.width = aw
    this.collisonCanvasElement1.height = ah
    this.collisonCanvasContext1 = this.collisonCanvasElement1.getContext('2d')

    // draw the first image relative to the overlap area
    this.collisonCanvasContext1.drawImage(spriteBitmap1.data, spriteData1.x - ax, spriteData1.y - ay)
    // only pixels will remain if both images are not trasparent
    this.collisonCanvasContext1.globalCompositeOperation = 'destination-in'
    this.collisonCanvasContext1.drawImage(spriteBitmap2.data, spriteData2.x - ax, spriteData2.y - ay)

    // now draw over its self to amplify any pixels that have low alpha
    this.collisonCanvasContext1.globalCompositeOperation = 'source-over'
    for (let i = 0; i < 32; i++) {
      this.collisonCanvasContext1.drawImage(this.collisonCanvasElement1, 0, 0)
    }

    // set canvas 2 size
    this.collisionCanvasSize2 = Object.assign({}, {
      w: Math.max(1, Math.floor(aw / 8)),
      h: Math.max(1, Math.floor(ah / 8))
    })

    let rw = this.collisionCanvasSize2.w
    let rh = this.collisionCanvasSize2.h
    this.collisonCanvasElement2.width = rw
    this.collisonCanvasElement2.height = rh
    this.collisonCanvasContext2 = this.collisonCanvasElement2.getContext('2d')

    while (rw > 8 && rh > 8) {
      // draw the mask image several times
      for (let i = 0; i < 32; i++) {
        this.collisonCanvasContext2.drawImage(
          this.collisonCanvasElement1,
          0, 0, aw, ah,
          Math.random(),
          Math.random(),
          rw, rh
        )
      }

      // clear main canvas
      this.collisonCanvasContext1.clearRect(0, 0, aw, ah)

      // set the new size
      aw = rw
      ah = rh

      // draw the small copy onto original
      this.collisonCanvasContext1.drawImage(this.collisonCanvasElement2, 0, 0)

      this.collisonCanvasContext2.clearRect(0, 0, this.collisionCanvasSize2.w, this.collisionCanvasSize2.h)

      rw = Math.max(1, Math.floor(aw / 8))
      rh = Math.max(1, Math.floor(ah / 8))
    }

    return this.checkCollisonPixels(aw, ah)
  }

  checkCollisonPixels (w, h) {
    const imageData = new Uint32Array(this.collisonCanvasContext1.getImageData(0, 0, w, h).data.buffer)
    let i = 0
    // if any pixel is not zero then there must be an overlap
    while (i < imageData.length) {
      if (imageData[i++] !== 0) return true
    }
    return false
  }

  isSpriteTouchingEdge (spriteData) {
    const spriteBitmap = this.currentSpriteBitmaps[spriteData.image]
    if (!spriteBitmap || !spriteBitmap.data) {
      return null // does not have image data
    }

    if (
      !(
        (spriteData.x) + (spriteData.w / 2) > this.edgeCanvasSize.w / 2 ||
        (spriteData.x) - (spriteData.w / 2) < -1 * (this.edgeCanvasSize.w / 2) ||
        (spriteData.y) + (spriteData.h / 2) > this.edgeCanvasSize.h / 2 ||
        (spriteData.y) - (spriteData.h / 2) < -1 * (this.edgeCanvasSize.h / 2)
      )
    ) return null // bounding box not touching edge

    // if bounding box is all the way out of canvas and has skipped the edge detect then treat as touching
    if (spriteData.x - spriteData.w > this.edgeCanvasSize.w / 2) return 'right'
    if (spriteData.x + spriteData.w < -1 * (this.edgeCanvasSize.w / 2)) return 'left'
    if (spriteData.y - spriteData.h > this.edgeCanvasSize.h / 2) return 'top'
    if (spriteData.y + spriteData.h < -1 * (this.edgeCanvasSize.h / 2)) return 'bottom'

    spriteData.x = (this.edgeCanvasSize.w / 2) + (spriteData.x - (spriteData.w / 2))
    spriteData.y = (this.edgeCanvasSize.h / 2) + ((spriteData.y * -1) - (spriteData.h / 2))

    this.edgeCanvasContext.clearRect(0, 0, this.edgeCanvasSize.w, this.edgeCanvasSize.h)
    this.edgeCanvasContext.drawImage(spriteBitmap.data, spriteData.x + 1, spriteData.y + 1) // +1 because the canvas is 1 pixel bigger on each edge and draws from top left

    if (this.checkEdgeAreaHasPixels(0, 0, this.edgeCanvasSize.w, 1)) return 'top'
    if (this.checkEdgeAreaHasPixels(0, this.edgeCanvasSize.h - 1, this.edgeCanvasSize.w, 1)) return 'bottom'
    if (this.checkEdgeAreaHasPixels(0, 0, 1, this.edgeCanvasSize.h)) return 'left'
    if (this.checkEdgeAreaHasPixels(this.edgeCanvasSize.w - 1, 0, 1, this.edgeCanvasSize.h)) return 'right'

    return null
  }

  checkEdgeAreaHasPixels (sx, sy, sw, sh) {
    const imageData = new Uint32Array(this.edgeCanvasContext.getImageData(sx, sy, sw, sh).data.buffer)
    let i = 0
    while (i < imageData.length) {
      if (imageData[i++] !== 0) return true
    }
    return false
  }
}

export default new CollisonDetector()
