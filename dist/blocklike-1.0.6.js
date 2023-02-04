var blockLike;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/backdrop.js":
/*!*************************!*\
  !*** ./src/backdrop.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Backdrop)
/* harmony export */ });
/* harmony import */ var _look__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./look */ "./src/look.js");


/**
 * Class representing a Backdrop.
 * Backdrops can be added to the Stage.
 * @extends Look
 *
 * @example
 * let backdrop = new blockLike.Backdrop();
 *
 * @example
 * let backdrop = new blockLike.Backdrop({
 *   image: 'https://www.blocklike.org/images/backdrop.svg'
 * });
 *
 * @example
 * let backdrop = new blockLike.Backdrop({
 *   color: '#A2DAFF'
 * });
 */
class Backdrop extends _look__WEBPACK_IMPORTED_MODULE_0__["default"] {
  /**
  * constructor - Creates a Backdrop to be used by Stage objects.
  *
  * @param {object} options - options for the backdrop.
  * @param {string} options.image - a URI (or data URI) for the backdrop image.
  * @param {string} options.color - a css color string ('#ff0000', 'red')
  */
  constructor (options = {}) {
    const defaults = {}
    const actual = { ...defaults, ...options }

    super()

    this.image = actual.image
    this.color = actual.color

    // preload
    if (this.image) {
      const image = new window.Image()
      image.src = this.image
    }
  }

  /** Setup Actions * */

  /**
  * addTo - Adds the backdrop to the stage
  *
  * @example
  * let stage = new blockLike.Stage();
  * let backdrop = new blockLike.Backdrop();
  *
  * backdrop.addTo(stage);
  *
  * @param {object} stage - which stage to add the backdrop too.
  */
  addTo (stage) {
    const curStage = stage
    stage.backdrops.push(this)
    // if "bare" set the added as active
    !stage.backdrop ? curStage.backdrop = stage.backdrops[0] : null
    stage.element ? stage.element.update(stage) : null
  }

  /**
  * removeFrom - Removes the backdrop to the stage
  *
  * @example
  * let stage = new blockLike.Stage();
  * let backdrop = new blockLike.Backdrop();
  *
  * backdrop.addTo(stage);
  * backdrop.removeFrom(stage);
  *
  * @param {object} stage - which stage to remove the backdrop from.
  */
  removeFrom (stage) {
    stage.removeBackdrop(this)
  }
}


/***/ }),

/***/ "./src/collision-detector.js":
/*!***********************************!*\
  !*** ./src/collision-detector.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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
      this.edgeCanvasContext = this.edgeCanvasElement.getContext('2d', { willReadFrequently: true })

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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new CollisonDetector());


/***/ }),

/***/ "./src/costume.js":
/*!************************!*\
  !*** ./src/costume.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Costume)
/* harmony export */ });
/* harmony import */ var _look__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./look */ "./src/look.js");


/**
 * Class representing a Costume.
 * Costumes can be added to a Sprite.
 * @extends Look
 *
 * @example
 * let costume = new blockLike.Costume();
 *
 * @example
 * let costume = new blockLike.Costume({
 *   width: 50,
 *   height: 50,
 *   color: '#A2DAFF',
 *   image: 'https://www.blocklike.org/images/sheep_step.png'
 * });
 */
class Costume extends _look__WEBPACK_IMPORTED_MODULE_0__["default"] {
  /**
  * constructor - Creates a Costume to be used by Sprite objects..
  *
  * @param {object} options - options for the costume.
  * @param {number} options.width - the costume width in pixels. Default is 100.
  * @param {number} options.height - the costume height in pixels. Default is 100.
  * @param {string} options.image - a URI (or data URI) for the costume image.
  * @param {string} options.color - a css color string ('#ff0000', 'red')
  */
  constructor (options = {}) {
    const defaults = {
      width: 100,
      height: 100,
      color: null
    }
    const actual = { ...defaults, ...options }

    super()

    this.width = actual.width
    this.height = actual.height
    this.visibleWidth = actual.width
    this.visibleHeight = actual.height

    this.image = actual.image
    this.color = actual.color

    // preload
    if (this.image) {
      const image = new window.Image()
      image.src = this.image
    }

    this.innerHTML = ''
  }

  /** Setup Actions * */

  /**
  * addTo - Adds the costume to the sprite
  *
  * @example
  * let sprite = new blockLike.Sprite();
  * let costume = new blockLike.Costume();
  *
  * costume.addTo(sprite);
  *
  * @param {object} sprite - which sprite to add the costume too.
  */
  addTo (sprite) {
    const curSprite = sprite
    sprite.costumes.push(this)

    // if "bare" set the added as active.
    if (!sprite.costume) {
      curSprite.costume = sprite.costumes[0]
      curSprite.width = sprite.costume.visibleWidth
      curSprite.height = sprite.costume.visibleHeight
    }

    sprite.element ? sprite.element.update(sprite) : null
  }

  /**
  * removeFrom - Removes the costume from to the sprite
  *
  * @example
  * let sprite = new blockLike.Sprite();
  * let costume = new blockLike.Costume();
  *
  * costume.addTo(sprite);
  * costume.removeFrom(sprite);
  *
  * @param {object} sprite - which sprite to remove the costume from.
  */
  removeFrom (sprite) {
    sprite.removeCostume(this)
  }

  /** Looks * */

  /**
  * resizeToImage - sets the width and height of the costume to that of the image file.
  *
  * @example
  * let costume = new blockLike.Costume({
  *   image: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Sheep_in_gray.svg'
  * });
  *
  * costume.resizeToImage();
  */
  resizeToImage () {
    // register the image size from the file
    if (this.image) {
      const image = new window.Image()
      const me = this

      image.src = this.image

      image.addEventListener('load', () => {
        me.width = image.width
        me.height = image.height
        me.visibleWidth = me.width
        me.visibleHeight = me.height
      })
    }
  }

  /**
  * inner - Places an HTML element inside the costume.
  *
  * @example
  * let costume = new blockLike.Costume();
  *
  * costume.inner('<p class="big centered rainbow">:)</p>');
  *
  * @example
  * costume.inner('I like text only');
  *
  * @param {string} html - the html to insert.
  */
  inner (html) {
    this.innerHTML = html
  }

  /**
  * insert - Places a DOM element inside the costume.
  *
  * @example
  * let costume = new blockLike.Costume();
  *
  * costume.insert(document.getElementById('my-html-creation'));
  *
  * @param {object} el - the DOM element.
  */
  insert (el) {
    const iel = el.cloneNode(true)
    iel.style.display = 'block'
    iel.style.visibility = 'inherit'

    this.image = null
    this.color = 'transparent'
    this.innerHTML = iel.outerHTML
  }
}


/***/ }),

/***/ "./src/document-css.js":
/*!*****************************!*\
  !*** ./src/document-css.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "askCSS": () => (/* binding */ askCSS),
/* harmony export */   "defaultCSS": () => (/* binding */ defaultCSS),
/* harmony export */   "sayCSS": () => (/* binding */ sayCSS),
/* harmony export */   "thinkCSS": () => (/* binding */ thinkCSS),
/* harmony export */   "uiCSS": () => (/* binding */ uiCSS)
/* harmony export */ });
/**
* Collection of css strings to be injected to the head section of a page.
* @private
*/
const defaultCSS = `
* { 
  box-sizing: border-box;
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-touch-callout:none;                /* prevent callout to copy image, etc when tap to hold */
  -webkit-tap-highlight-color:rgba(0,0,0,0); /* prevent tap highlight color / shadow */
}
html, body{
  margin:0;
  padding:0;
}
`

const uiCSS = `
.blocklike-flag {
  text-align: center;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 65px;
  line-height: 65px;
  padding: 32px;
  color: #222;
  background: #fafafa;
  border: 2px solid #666;
  border-radius: 65px;
}
`

const thinkCSS = `
.blocklike-think {
  position: absolute;
  min-width: 60px;
  max-width: 200px;
  left: 200px;
  padding: 10px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  min-height: 16px;
  line-height: 16px;
  text-align: left;
  color: #222;
  background: #fafafa;
  border: 2px solid #444;
  border-radius: 20px;
}
.blocklike-think:before {
  position:absolute;
  bottom: -30px;
  left: 0px;
  width: 30px;
  height: 30px;
  background: #fafafa;
  border: 2px solid #444;
  border-radius: 20px;
  content: "";
}
.blocklike-think:after {
  position: absolute;
  bottom: -45px;
  left: 0px;
  width: 15px;
  height: 15px;
  background: #fafafa;
  border: 2px solid #444;
  border-radius: 15px;
  content: "";
}
`

const sayCSS = `
.blocklike-ask,
.blocklike-say {
  position: absolute;
  display: inline-block;
  min-width: 60px;
  max-width: 200px;
  padding: 10px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  min-height: 16px;
  line-height: 16px;
  text-align: left;
  background-color: #fafafa;
  border: 2px solid #444;
  border-radius: 20px;
}
.blocklike-ask:before,
.blocklike-say:before {
  content: ' ';
  position: absolute;
  width: 0;
  height: 0;
  left: 13px;
  right: auto;
  top: auto;
  bottom: -33px;
  border: 16px solid;
  border-color: #444 transparent transparent #444;
}
.blocklike-ask:after,
.blocklike-say:after {
  content: ' ';
  position: absolute;
  width: 0;
  height: 0;
  left: 15px;
  right: auto;
  top: auto;
  bottom: -28px;
  border: 16px solid;
  border-color: #fafafa transparent transparent #fafafa;
}
`

const askCSS = `
.blocklike-ask input {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  padding: 2px;
  margin: 2px;
  width: 75%;
}
.blocklike-ask button {
  font-size: 16px;
  line-height: 16px;
  height: 26px;
  padding: 0 5px;
  margin: 0;
}
`


/***/ }),

/***/ "./src/element-css.js":
/*!****************************!*\
  !*** ./src/element-css.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "apply": () => (/* binding */ apply),
/* harmony export */   "register": () => (/* binding */ register)
/* harmony export */ });
/**
* Encapsulates the functionality of managing element style properties for the entities.
*/

/**
* apply - apply cssRules of an entity to its DOM element.
*
* @param {function} entity - a Sprite or Stage.
*/
function apply (entity) {
  const curEntity = entity
  // Sprites have Costumes, Stage has Backdrop, figure out which entity it is.
  const curLook = entity.backdrop || entity.costume
  const curLooks = entity.backdrops || entity.costumes

  const el = entity.element.el

  // remove any style applied by any look
  if (curLooks) {
    curLooks.forEach((b) => {
      b.cssRules.forEach((item) => {
        const camelCased = item.prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
        el.style[camelCased] = ''
      })
    })
  }

  // add current look styles
  if (curLook) {
    curLook.cssRules.forEach((item) => {
      const camelCased = item.prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      el.style[camelCased] = item.value
    })
  }

  // Add curEntity styles. Must be done after look styles.
  curEntity.cssRules.forEach((item) => {
    const camelCased = item.prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    el.style[camelCased] = item.value
  })
}

/**
* register - register cssRules of for an entity based on user input.
* Note: All rules are registered dash-case a-la css.
* This is regardless of how they are set and though they are used camelCase.
*
* @param {string} prop - the css property (e.g. color). Alternatively an object with key: value pairs.
* @param {string} value - the value for the css property (e.g. #ff8833)
* @param {function} entity - a Sprite or Stage.
*/
function register (prop, value, entity) {
  const curEntity = entity

  if (typeof prop === 'string' && typeof value === 'string') {
    const dashed = prop.replace(/([A-Z])/g, ($1) => `-${$1.toLowerCase()}`)
    curEntity.cssRules.push({ prop: dashed, value })
  } else if (typeof prop === 'object' && !value) {
    Object.keys(prop).forEach((key) => {
      const dashed = key.replace(/([A-Z])/g, ($1) => `-${$1.toLowerCase()}`)
      curEntity.cssRules.push({ prop: dashed, value: prop[key] })
    })
  }
}


/***/ }),

/***/ "./src/entity.js":
/*!***********************!*\
  !*** ./src/entity.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Entity)
/* harmony export */ });
/* harmony import */ var _rewriter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rewriter */ "./src/rewriter.js");
/* harmony import */ var _element_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./element-css */ "./src/element-css.js");



/**
 * Class representing an entity.
 * Abstract for Stage and Sprite.
 * Do not instantiate objects directly from this class.
 *
 * @private
 */
class Entity {
  /**
  * constructor - Entity is abstract for Stage and Sprite.
  *
  * @param {number} pace - the number of milliseconds to pace paced methods.
  */
  constructor (pace) {
    Entity.messageListeners = []
    this.id = this._generateUUID()
    this.pace = pace
    this.sounds = [] // will hold all sounds currently played by entity, if any.
    /*
    * Paced methods work in the following manner:
    * 1. Event Method functions are rewritten.
    * 2. For paced methods rewriter will add an await to a promise after the paced method call.
    * 3. The promise will resolve after {pace} milliseconds.
    *
    * This allows the paced method to halt execution of any code following it until it is done.
    */
    this.paced = [
      'goTo',
      'move',
      'changeX',
      'changeY',
      'setX',
      'setY',
      'goTowards',
      'turnRight',
      'turnLeft',
      'pointInDirection',
      'pointTowards',
      'changeSize',
      'setSize',
      'say',
      'think',
      'refresh'
    ]

    /*
    * Waited methods work in the following manner:
    * 1. Event Method functions are rewritten.
    * 2. For waited methods rewriter will add an await to a promise after the waited method call.
    * 3. The promise includes a document level event listener.
    * 4. rewriter modifies the waited method call, inserting a triggeringId parameter.
    * 4. The event listener is unique to the triggeringId.
    * 5. When the method completes running an event is dispatched resolving the promise.
    *
    * This allows the waited method to halt execution of any code following it until it is done.
    */
    this.waited = [
      'wait',
      'glide',
      'sayWait',
      'thinkWait',
      'playSoundUntilDone',
      'broadcastMessageWait'
    ]

    /*
    * waitedRetunred methods work similarly to waited methods only that they enable capturing a value
    * into a globally declared variable (or an undeclared one).
    * 1. Event Method functions are rewritten.
    * 2. For waitedReturned methods rewriter will add an await to a promise after the waited method call.
    * 3. The promise includes a document level event listener.
    * 4. rewriter modifies the waited method call, inserting:
    *   - the name of the variable into which a value is returned.
    *   - a triggeringId parameter.
    * 4. The event listener is unique to the triggeringId.
    * 5. When the method completes running an event is dispatched resolving the promise.
    * 6. The value returned is transfered into the variable using eval.
    *
    * This allows the waited method to halt execution of any code following it until it is done.
    * At which point the variable has "captured" the value.
    */
    this.waitedReturned = [
      'invoke',
      'ask'
    ]

    /*
    * Event methods (evented) are containers for functions to be rewritten.
    * When an event method is nested inside another the code of the inner method is NOT rewritten.
    */
    this.evented = [
      'whenFlag',
      'whenLoaded',
      'whenClicked',
      'whenKeyPressed',
      'whenEvent',
      'whenReceiveMessage',
      'whenCloned'
    ]
  }

  /**
  * _generateUUID - generates a unique ID.
  * Source: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  *
  * @private
  * @return {string} - a unique id.
  */
  _generateUUID () {
    let d
    let r

    d = new Date().getTime()

    if (window.performance && typeof window.performance.now === 'function') {
      d += window.performance.now() // use high-precision timer if available
    }

    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      r = (d + Math.random() * 16) % 16 | 0 // eslint-disable-line no-mixed-operators, no-bitwise
      d = Math.floor(d / 16)
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16) // eslint-disable-line no-mixed-operators, no-bitwise
    })

    return uuid
  }

  /**
  * _releaseWaited - releases a waited promise by dispatching an event.
  *
  * @private
  * @param {string} triggeringId - the name of the event that invoked the code that requested the wait.
  */
  _releaseWaited (triggeringId) {
    const event = new window.CustomEvent(`blockLike.waited.${triggeringId}`, { detail: { value: 0 } })
    document.dispatchEvent(event)
  }

  /**
  * _setToVar - sets a globally scoped user defined variable who's name is specified as a a string
  * with the value provided.
  *
  * @private
  * @param {varString} text - the name of the variable to which value should be set.
  * @param {any} value - the value to set.
  */
  _setToVar (varString, value) {
    try {
      eval(`${varString} = '${value}'`) // eslint-disable-line no-eval
    } catch (error) {
      throw ('BlockLike.js Error: Variables accepting a value must be declared in the global scope.') // eslint-disable-line no-throw-literal
    }
  }

  /**
  * _exec - asynchronous function execution.
  * This is what creates the "paced" execution of the user supplied functions.
  *
  * @private
  * @param {function} func - a function to rewrite and execute.
  * @param {array} argsArr - an array of arguments to pass to the function.
  */
  _exec (func, argsArr) {
    const me = this
    me.triggeringId = this._generateUUID()
    const f = (0,_rewriter__WEBPACK_IMPORTED_MODULE_0__["default"])(func, me)
    return f.apply(me, argsArr)
  }

  /**
  * invoke - invoke a function. Allows passing an argument or array of arguments.
  * Function will be "paced" and code execution will be "waited" until it is completed.
  *
  * @example
  * sprite.whenFlag(() => {
  *   this.invoke(jump);
  *   this.invoke(talk, 'hi');
  *   this.invoke(pattern, [5, 50, 12]);
  * });
  *
  * @param {function} func - a function to rewrite and execute.
  * @param {array} argsArr - an array of arguments to pass to the function. A single variable also accepted.
  */
  invoke (func, argsArr, theVar = null, triggeringId = null) {
    // theVar and triggeringId are not user supplied, they are inserted by rewriter.
    let args = argsArr
    !(argsArr instanceof Array) ? args = [argsArr] : null

    this._exec(func, args).then((result) => {
      // this is the waited method listener. release it.
      this._releaseWaited(triggeringId)
      // set the user defined variable to the captured value.
      theVar ? this._setToVar(theVar, result) : null
    })
  }

  /**
  * wait - creates a pause in execution.
  *
  * @example
  * this.wait(5);
  *
  * @example
  * let time = 5;
  * this.wait(time * 0.95);
  *
  * @param {number} sec - number of seconds to wait. Must be an actual number.
  */
  wait (sec, triggeringId = null) {
    // triggeringId is not user supplied, it is inserted by rewriter.
    setTimeout(() => {
      this._releaseWaited(triggeringId)
    }, sec * 1000)
  }

  /** Events * */

  /**
  * whenLoaded - invoke user supplied function.
  * To be used with code that needs to run onload.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenLoaded( function() {
  *   this.say('I am alive');
  * });
  *
  * @param {function} func - a function to rewrite and execute.
  */
  whenLoaded (func) {
    setTimeout(() => {
      this._exec(func, [])
    }, 0)
  }

  /**
  * whenFlag - adds a flag to cover the stage with an event listener attached.
  * When triggered will remove the flag div and invoke user supplied function.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenFlag( function() {
  *   this.say('I am alive');
  * });
  *
  * @param {function} func - a function to rewrite and execute.
  */
  whenFlag (func) {
    const me = this

    if (me.element) {
      me.element.addFlag(this)

      this.element.flag.addEventListener('click', (e) => {
        me.element.removeFlag(me)
        me._exec(func, [e])
        e.stopPropagation()
      })
    }
  }

  /**
  * whenClicked - adds a click event listener to the sprite or stage.
  * When triggered will invoke user supplied function.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.say('I am alive');
  * });
  *
  * @param {function} func - a function to rewrite and execute.
  */
  whenClicked (func) {
    const me = this

    if (me.element) {
      this.element.el.addEventListener('click', (e) => {
        me._exec(func, [e])
        e.stopPropagation()
      })
    }
  }

  /**
  * whenKeyPressed - adds a keypress event listener to document.
  * When triggered will invoke user supplied function.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenKeyPressed(' ', function() {
  *   this.say('Spacepressed');
  * });
  *
  * @param {string} userKey - the key pressed. may be the code or the character itself (A or 65)
  * @param {function} func - a function to rewrite and execute.
  */
  whenKeyPressed (userKey, func) {
    const me = this
    let check
    typeof userKey === 'string' ? check = userKey.toLowerCase() : check = userKey

    document.addEventListener('keydown', (e) => {
      let match = false
      // Make sure each property is supported by browsers.
      // Note: user may write incompatible code.
      e.code && e.code.toLowerCase() === check ? match = true : null
      e.key && e.key.toLowerCase() === check ? match = true : null
      e.keyCode === check ? match = true : null
      if (match) {
        me._exec(func, [e])
        e.preventDefault()
      }
    })
  }

  /**
  * whenEvent - adds the specified event listener to sprite/stage.
  * When triggered will invoke user supplied function.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenEvent('mouseover', (e) => {
  *   console.log(e);
  * });
  *
  * @param {string} eventStr - the named event (mosemove etc.).
  * @param {function} func - a function to rewrite and execute.
  */
  whenEvent (eventStr, func) {
    const me = this

    if (me.element) {
      let attachTo = this.element.el
      let options = {}
      'keydown|keyup|keypress'.indexOf(eventStr) !== -1 ? attachTo = document : null
      'touchstart|touchmove'.indexOf(eventStr) !== -1 ? options = { passive: true } : null

      attachTo.addEventListener(eventStr, (e) => {
        me._exec(func, [e])
        e.stopPropagation()
      }, options)
    }
  }

  /**
  * whenReceiveMessage - adds the specified event listener to document.
  * When triggered will invoke user supplied function.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenReceiveMessage('move', function() {
  *   this.move(-10);
  * })
  *
  * @param {string} msg - the named message (event);
  * @param {function} func - a function to rewrite and execute.
  */
  whenReceiveMessage (msg, func) {
    const listenerId = this._generateUUID()
    // register as a message listener.
    Entity.messageListeners.push({ msg, listenerId })

    // listen to specified message
    document.addEventListener(msg, (e) => {
      // execute the func and then
      this._exec(func, [e]).then(() => {
        // dispatch an event that is unique to the listener and message received.
        const msgId = e.detail.msgId
        const event = new window.CustomEvent('blockLike.donewheneeceivemessage', { detail: { msgId, listenerId } })

        document.dispatchEvent(event)
      })
    })
  }

  /**
  * broadcastMessage - dispatches a custom event that acts as a global message.
  *
  * @example
  * let stage = new blockLike.Stage();
  *
  * stage.whenClicked(function() {
  *  stage.broadcastMessage('move')
  * });
  *
  * @param {string} msg - the named message (event)
  */
  broadcastMessage (msg) {
    const msgId = this._generateUUID()
    const event = new window.CustomEvent(msg, { detail: { msgId } })
    document.dispatchEvent(event)
  }

  /**
  * broadcastMessageWait - dispatches a custom event that acts as a global message.
  * Waits for all whenReceiveMessage listeners to complete.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  *
  * sprite.whenReceiveMessage('move', function() {
  *   this.move(-10);
  *   this.wait(5);
  * })
  *
  * stage.whenClicked(function() {
  *  stage.broadcastMessageWait('move');
  *  sprite.say('All done');
  * });
  *
  * @param {string} msg - the named message (event)
  */
  broadcastMessageWait (msg, triggeringId = null) {
    // triggeringId is not user supplied, it is inserted by rewriter.
    const me = this
    const msgId = this._generateUUID()
    // save registered listeners for this broadcast.
    let myListeners = Entity.messageListeners.filter((item) => item.msg === msg)
    // dispatch the message
    const event = new window.CustomEvent(msg, { detail: { msgId } })
    document.dispatchEvent(event)

    // listen to those who received the message
    document.addEventListener('blockLike.donewheneeceivemessage', function broadcastMessageWaitListener (e) {
      // if event is for this message remove listenerId from list of listeners.
      (e.detail.msgId === msgId) ? myListeners = myListeners.filter((item) => item.listenerId !== e.detail.listenerId) : null
      // all listeners responded.
      if (!myListeners.length) {
        // remove the event listener
        document.removeEventListener('blockLike.donewheneeceivemessage', broadcastMessageWaitListener)
        // release the wait
        me._releaseWaited(triggeringId)
      }
    })
  }

  /** Sound * */

  /**
  * playSound - plays a sound file (mp3, wav)
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.playSound('../../sounds/bleat.wav');
  * });
  *
  * @param {string} url - the url of the file to play.
  */
  playSound (url) {
    const audio = new window.Audio(url)
    audio.play()
    this.sounds.push(audio)
    audio.addEventListener('ended', () => {
      this.sounds = this.sounds.filter((item) => item !== audio)
    })
  }

  /**
  * playSoundLoop - plays a sound file (mp3, wav) again and again
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.playSoundLoop('../../sounds/bleat.wav');
  * });
  *
  * @param {string} url - the url of the file to play.
  */
  playSoundLoop (url) {
    const audio = new window.Audio(url)
    audio.play()
    this.sounds.push(audio)
    audio.addEventListener('ended', () => {
      audio.currentTime = 0
      audio.play()
    })
  }

  /**
  * playSoundUntilDone - plays a sound file (mp3, wav) until done.
  * This is similar to playSound and wait for the duration of the sound.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.playSoundUntilDone('../../sounds/bleat.wav');
  * });
  *
  * @param {string} url - the url of the file to play.
  */
  playSoundUntilDone (url, triggeringId = null) {
    // triggeringId is not user supplied, it is inserted by rewriter.
    const audio = new window.Audio(url)
    audio.play()
    this.sounds.push(audio)
    audio.addEventListener('ended', () => {
      this.sounds = this.sounds.filter((item) => item !== audio)
      this._releaseWaited(triggeringId)
    })
  }

  /**
  * stopSounds - stops all sounds played by sprite or stage.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.playSound('../../sounds/bleat.wav');
  * });
  *
  * stage.whenKeyPressed('Escape', () => {
  *   this.stopSounds();
  * });
  */
  stopSounds () {
    this.sounds.forEach((item) => {
      item.pause()
    })
    this.sounds = []
  }

  /* css */

  /**
  * css - applies a CSS rule to the sprite and all costumes.
  *
  * @example
  * let sprite = new blockLike.Sprite();
  *
  * sprite.css('background', '#0000ff');
  *
  * @param {string} prop - the css property (e.g. color). Alternatively an object with key: value pairs.
  * @param {string} value - the value for the css property (e.g. #ff8833)
  */
  css (prop, value = null) {
    _element_css__WEBPACK_IMPORTED_MODULE_1__.register(prop, value, this)
    this.element ? this.element.update(this) : null
  }

  /**
  * addClass - adds a css class to sprite and all costumes.
  *
  * @example
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addClass('rainbow');
  *
  * @param {string} name - the css class name to add.
  */
  addClass (name) {
    !this.hasClass(name) ? this.classes.push(name) : null
    this.element ? this.element.update(this) : null
  }

  /**
  * removeClass - removes a css class from the sprite and all costumes.
  *
  * @example
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addClass('rainbow');
  * sprite.removeClass('rainbow');
  *
  * @param {string} name - the css class name to remove.
  */
  removeClass (name) {
    this.classes = this.classes.filter((item) => item !== name)
    this.element ? this.element.update(this) : null
  }

  /**
  * hasClass - is the css class applied to the sprite and all costumes.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.hasClass('rainbow') ? this.removeClass('rainbow') : this.addClass('rainbow');
  * });
  *
  * @param {string} name - the css class name.
  * @return {boolean} - is the css class name on the list.
  */
  hasClass (name) {
    return this.classes.indexOf(name) !== -1
  }
}


/***/ }),

/***/ "./src/look.js":
/*!*********************!*\
  !*** ./src/look.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Look)
/* harmony export */ });
/* harmony import */ var _element_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./element-css */ "./src/element-css.js");


/**
 * Class representing a look.
 * Abstract for Costume and Backdrop.
 * Do not instantiate objects directly from this class.
 *
 * @private
 */
class Look {
  /**
  * constructor - Look is abstract for Costume and Backdrop.
  */
  constructor () {
    this.cssRules = []
    this.classes = []
  }

  /** Looks * */

  /**
  * css - applies a CSS rule to a Costume or Backdrop.
  *
  * @example
  * let costume = new blockLike.Costume();
  *
  * costume.css('font-size', '16px');
  *
  * @example
  * let backdrop = new blockLike.Backdrop();
  *
  * backdrop.css('cursor', 'pointer');
  *
  * @param {string} prop - the css property (e.g. color)
  * @param {string} value - the value for the css property (e.g. #ff8833)
  */
  css (prop, value = null) {
    _element_css__WEBPACK_IMPORTED_MODULE_0__.register(prop, value, this)
  }

  /**
  * addClass - adds a css class to costume.
  *
  * @example
  * let costume = new blockLike.Costume();
  *
  * costume.addClass('rainbow');
  *
  * @example
  * let backdrop = new blockLike.Backdrop();
  *
  * backdrop.addClass('rainbow');
  *
  * @param {string} name - the css class name to add.
  */
  addClass (name) {
    !this.hasClass(name) ? this.classes.push(name) : null
  }

  /**
  * removeClass - removes a css class from the costume.
  *
  * @example
  * let costume = new blockLike.Costume();
  *
  * costume.hasClass('rainbow') ? costume.removeClass('rainbow') : costume.addClass('rainbow');
  *
  * @example
  * let backdrop = new blockLike.Backdrop();
  *
  * backdrop.hasClass('rainbow') ? backdrop.removeClass('rainbow') : backdrop.addClass('rainbow');
  *
  * @param {string} name - the css class name to remove.
  */
  removeClass (name) {
    this.classes = this.classes.filter((item) => item !== name)
  }

  /**
  * hasClass - is the css class applied to the costume.
  *
  * @example
  * let costume = new blockLike.Costume();
  *
  * costume.hasClass('rainbow') ? costume.removeClass('rainbow') : costume.addClass('rainbow');
  *
  * @example
  * let backdrop = new blockLike.Backdrop();
  *
  * backdrop.hasClass('rainbow') ? backdrop.removeClass('rainbow') : backdrop.addClass('rainbow');
  *
  * @param {string} name - the css class name.
  * @return {boolean} - is the css class name on the list.
  */
  hasClass (name) {
    return this.classes.indexOf(name) !== -1
  }
}


/***/ }),

/***/ "./src/platforms.js":
/*!**************************!*\
  !*** ./src/platforms.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ platforms)
/* harmony export */ });
/**
* platforms - collection of things to ensure it plays nicely with coding platforms.
*/
function platforms () {
  /**
  * codepen.io
  * Paced and Waited methods trigger the protection - hence we prolong it.
  * https://blog.codepen.io/2016/06/08/can-adjust-infinite-loop-protection-timing/
  */
  if (window.CP) {
    window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 60000
  }
}


/***/ }),

/***/ "./src/rewriter.js":
/*!*************************!*\
  !*** ./src/rewriter.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rewrite)
/* harmony export */ });
/**
* Encapsulates the functionality of rewriting user code to allow for BlockLike.js features.
*/

/**
* countChar - count how many times a given character (or string) appears in another string.
* helper for evented skipping and method rewriting.
*
* @param {string} str - a line of code.
* @param {string} char - a string to look for.
*
* @return {number} - the number of times found.
*/
function countChar (str, char) {
  const regExp = new RegExp(`\\${char}`, 'g')
  return (str.match(regExp) || []).length
}

/**
* replaceUserStringWithBlanks - for a given line of code, replaces all occurrences of
* user provided strings with a sequence of spaces of the same length.
* helper for evented skipping and method rewriting.
*
* @param {string} line - a line of code.
* @return {string} - the line without strings.
*/
function replaceUserStringWithBlanks (line) {
  return line.replace(/"(.*?)"|'(.*?)'|`(.*?)`/g, ' ')
}

/**
* isMethodInString - checks a string against an array of method names.
*
* @param {string} str - a line of code.
* @param {Array} arr - an array of method names.
*
* @return {boolean} - is the method in the string.
*/
function isMethodInString (arr, str) {
  return (arr.some((method) => str.indexOf(`.${method}(`) !== -1))
}

/**
* isPaced - checks if a line of code includes a paced method.
*
* @param {string} item - a line of code.
* @param {entity} entity - the entity triggering the method.
*
* @return {string} - is paced in code.
*/
function isPaced (item, entity) {
  return isMethodInString(entity.paced, item)
}

/**
* isWaited - checks if a line of code includes a waited method.
*
* @param {string} item - a line of code.
* @param {entity} entity - the entity triggering the method.
*
* @return {string} - is waited in code.
*/
function isWaited (item, entity) {
  return isMethodInString(entity.waited, item)
}

/**
* isEvented - checks if a line of code includes an evented method.
*
* @param {string} item - a line of code.
* @param {entity} entity - the entity triggering the method.
*
* @return {string} - is evented in code.
*/
function isEvented (item, entity) {
  return isMethodInString(entity.evented, item)
}

/**
* whichWaitedReturn - checks if a line of code includes a waitedReturn method.
*
* @param {string} item - a line of code.
* @param {entity} entity - the entity triggering the method.
*
* @return {string} - the waitedReturn method found or null.
*/
function whichWaitedReturn (item, entity) {
  return entity.waitedReturned.find((method) => (item.indexOf(`.${method}(`) !== -1 ? method : false))
}

/**
* insertLoopProtection- inserts a zero timed await line after a while deceleration.
*
* @param {string} item - a line of code.
* @param {entity} entity - the entity triggering the method.
*
* @return {string} - a modified line of code.
*/
function insertLoopProtection (item, entity) {
  const check = item.replace(/\s+/g, '')

  const regExp = /while\([\S]*\){|for\([\S]*\){|do[\S]*{/
  const matches = regExp.exec(check)

  const code = `${item}\n await new Promise(resolve => setTimeout(resolve, 0));`
  return matches ? code : item
}

/**
* insertPaced - inserts a timed await line after any method that is on the list of paced methods.
*
* @param {string} item - a line of code.
* @param {entity} entity - the entity triggering the method.
*
* @return {string} - a modified line of code.
*/
function insertPaced (item, entity) {
  const code = `${item}\n await new Promise(resolve => setTimeout(resolve, ${entity.pace}));`
  return entity.pace && isPaced(replaceUserStringWithBlanks(item), entity) ? code : item
}

/**
* insertWaited - inserts the "mechanism" that stops execution and awaits for the method to finish.
*
* @param {string} item - a line of code.
* @param {entity} entity - the entity triggering the method.
*
* @return {string} - a modified (multi)line of code.
*/
function insertWaited (item, entity) {
  let found = null
  let code

  // look for waited methods.
  found = isWaited(replaceUserStringWithBlanks(item), entity)

  // not a normal "waited". look for waitedReturned.
  if (!found) {
    let theVar = null

    found = whichWaitedReturn(replaceUserStringWithBlanks(item), entity)

    // code for waitedReturn
    theVar = item.substr(0, item.indexOf('='))
      .replace('let', '')
      .replace('var', '')
      .replace('const', '')
      .trim()

    code = `${item.substring(0, item.lastIndexOf(')'))}, '${theVar}', '${entity.triggeringId}')`

    // invoke is "forgiving". may, or may not, have variables.
    found === 'invoke' && (item.indexOf(',') === -1) ? code = `${item.substring(0, item.lastIndexOf(')'))}, [], '${theVar}', '${entity.triggeringId}')` : null
  } else {
    // code for "normal" waited
    code = `${item.substring(0, item.lastIndexOf(')'))}, '${entity.triggeringId}')`
  }

  // entity.triggeringId creates a unique context to chain the waited methods.
  code = `${code}\n await new Promise(resolve => {
      document.addEventListener('blockLike.waited.${entity.triggeringId}', function waitedListener(e) {
        document.removeEventListener('blockLike.waited.${entity.triggeringId}', waitedListener);
        resolve();
      });
    });`

  return found ? code : item
}

/**
* insertAsync - Adds keyword async to function deceleration if not present
* Will catch:
* - all named function decelerations with a space after the keyword 'function'
* - anything that has a fat arrow with any of several variable patterns before it.
*
* @param {string} item - a line of code.
* @return {string} - a modified line of code.
*/
function insertAsync (item) {
  const exist = item.indexOf('async ')

  // function declaration
  let regExp = /function(\s*?[a-zA-Z]\w*\s*?\(|\s*?\()/
  let matches = regExp.exec(replaceUserStringWithBlanks(item))

  // or arrow
  if (!matches) {
    regExp = /([a-zA-Z]\w*|\(\s*?[a-zA-Z]\w*(,\s*[a-zA-Z]\w*)*\s*?\))\s*?=>/
    matches = regExp.exec(replaceUserStringWithBlanks(item))
  }
  return exist === -1 && matches ? `${item.substring(0, matches.index)}async ${item.substring(matches.index, item.length)}` : item
}

/**
* emptyLoopProtection - examines the code for while and for statements that are empty.
* Note: since while(true){} is likely to be coded by the user this prevents infinite loops.
*
* @param {string} item - a line of code.
* @return {string} - a modified line of code.
*/
function emptyLoopProtection (funcS) {
  const check = funcS.replace(/\s+/g, '').replace(/\r?\n|\r/g, '')

  const regExp = /while\([\s\S]*\){}|for\([\s\S]*\){}|do{}while\([\s\S]*\)/
  const matches = regExp.exec(check)

  return !!matches
}

/**
* removeOuter - Removes the outer function definition and returns the function code body.
*
* @param {string} funcS - the function being rewritten.
* @return {string} - the body of the function.
*/
function removeOuter (funcS) {
  return funcS.substring(funcS.indexOf('{') + 1, funcS.lastIndexOf('}'))
}

/**
* removeComments - Removes comments from code.
* from: https://stackoverflow.com/a/15123777
*
* @param {string} funcS - the function being rewritten.
* @return {string} - the function without comments.
*/
function removeComments (funcS) {
  return funcS.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '')
}

/**
* getEventObjectVarName - extracts the variable name that holds the event object.
*
* @param {string} funcS - the function being rewritten.
* @return {string} - the variable name.
*/
function getEventObjectVarName (funcS) {
  return funcS.substring(funcS.indexOf('(') + 1, funcS.indexOf(')'))
}

/**
* rewrite - rewrites a function to an async version that is "paced" using awaiting for promises.
* This allows the user to write sequential simple code that will be executed in a paced manner.
*
* @param {function} func - a function to rewrite
* @param - {Object} entity - a sprite or stage object to which the function applies.
* @return {function} - an async modified function.
*/
function rewrite (func, entity) {
  let code = func.toString()
  const theVar = getEventObjectVarName(code)

  // rewrite the code
  if (emptyLoopProtection(code)) {
    code = 'throw \'BlockLike.js Error: Empty loop detected\';'
  } else {
    code = removeComments(removeOuter(code))
    code = code.split('\n').filter((item) => item.trim().length !== 0)

    // counter for open parentheses.
    let eventedOpenParen = 0
    // let hasPacedCode = false

    code = code.map((item) => {
      const temp = item
      let result = temp

      // internal evented methods are skipped
      if (isEvented(temp, entity) || eventedOpenParen) {
        eventedOpenParen += (countChar(replaceUserStringWithBlanks(temp), '(') - countChar(replaceUserStringWithBlanks(temp), ')'))
      } else {
        // if (isPaced(temp, entity)) hasPacedCode = true
        // a method can be one of the following but not more than one
        result === temp ? result = insertPaced(temp, entity) : null // more likely
        result === temp ? result = insertWaited(temp, entity) : null // less likely

        // and only if not a method will add async to functions
        result === temp ? result = insertAsync(temp) : null
      }

      // insert a paced promise resolve at the start of a loop block (under certain conditions)
      // this causes the code to skip an event loop and prevents endless loops
      result = insertLoopProtection(result, entity)

      return result
    })

    code = code.join('\n')
  }

  // transform the text into a function
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
  let af = new AsyncFunction(code)

  // pass the event object to the function if exists.
  theVar ? af = new AsyncFunction(theVar, code) : null

  window.blockLike && window.blockLike.debug ? console.log(af) : null // eslint-disable-line no-console

  return af
}


/***/ }),

/***/ "./src/sprite-element.js":
/*!*******************************!*\
  !*** ./src/sprite-element.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SpriteElement)
/* harmony export */ });
/* harmony import */ var _element_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./element-css */ "./src/element-css.js");


/**
 * Class representing the UI Element of the sprite.
 * Each Sprite has one.
 * @private
 */
class SpriteElement {
  /**
  * constructor - Creates a Sprite Element.
  *
  * @param {object} sprite - the sprite for which the element is created.
  * @param {object} stage - the stage to which the sprite is added.
  */
  constructor (sprite, stage) {
    const el = document.createElement('div')

    el.id = `${sprite.id}`
    el.style.position = 'absolute'
    el.style.touchAction = 'manipulation'

    stage.element.el.appendChild(el)

    this.el = el
  }

  /**
  * update - updates the DOM element. This is always called after the constructor.
  *
  * @param {object} sprite - the sprite to update.
  */
  update (sprite) {
    const el = sprite.element.el
    // Convert the center based x coordinate to a left based one.
    const x = sprite.x - (sprite.width / 2)
    // Convert the center based y coordinate to a left based one.
    const y = (sprite.y * -1) - (sprite.height / 2)

    // Costume
    if (sprite.costume) {
      el.style.width = `${sprite.costume.visibleWidth}px`
      el.style.height = `${sprite.costume.visibleHeight}px`
    }

    el.style.left = `${(sprite.stageWidth / 2) + x}px`
    el.style.top = `${(sprite.stageHeight / 2) + y}px`
    el.style.zIndex = sprite.z

    el.style.visibility = `${(sprite.showing ? 'visible' : 'hidden')}`

    // Left or right rotation
    // Direction divided by 180 and floored -> 1 or 2.
    // Subtract 1 -> 0 or 1.
    // Multiply by -1 -> 0 or -1.
    // Css transform -> None or full X.
    sprite.rotationStyle === 1 ? el.style.transform = `scaleX(${((Math.floor(sprite.direction / 180) * 2) - 1) * -1})` : null

    // Full rotation
    // Sprite "neutral position" is 90. CSS is 0. Subtract 90.
    // Normalize to 360.
    // Css rotate -> Number of degrees.
    sprite.rotationStyle === 0 ? el.style.transform = `rotate(${((sprite.direction - 90) + 360) % 360}deg)` : null

    // CSS rules classes and the background color.
    // The costume color setting overrides any CSS setting.

    // There is no color property to current costume - so reset the background-color property of the element.
    !sprite.costume || !sprite.costume.color ? el.style.backgroundColor = '' : null

    // apply CSS rules (may include background color)
    _element_css__WEBPACK_IMPORTED_MODULE_0__.apply(sprite)

    // apply CSS classes
    sprite.costume ? el.className = sprite.costume.classes.concat(sprite.classes).join(' ') : el.className = sprite.classes.join(' ')

    // There is a color property to current costume - so apply it and override CSS rules.
    sprite.costume && sprite.costume.color ? el.style.backgroundColor = sprite.costume.color : null

    // Image.
    if (sprite.costume && el.firstChild) { // has image from previous costume
      if (!sprite.costume.image) { // needs removed as there is no image in current costume.
        el.removeChild(el.firstChild)
      } else if (sprite.costume.image !== this.el.firstChild.src) { // needs replaced
        this.el.firstChild.src = sprite.costume.image
      }
    } else if (sprite.costume && sprite.costume.image) { // needs an image inserted.
      const image = new window.Image()

      image.style.width = '100%'
      image.style.height = '100%'
      image.style.position = 'absolute'
      image.src = sprite.costume.image
      el.appendChild(image)
    }

    el.firstChild ? el.firstChild.draggable = false : null

    // Inner. Must by done after the image
    sprite.costume && sprite.costume.innerHTML ? el.innerHTML = sprite.costume.innerHTML : null

    // Text UI goes where sprite goes.
    sprite.textui ? sprite.textui.update(sprite) : null

    this.el = el
  }

  /**
  * delete - deletes the DOM element.
  *
  * @param {object} sprite - the sprite to delete.
  */
  delete (sprite) {
    const el = sprite.element.el

    el.parentNode.removeChild(el)
    return null
  }

  /**
  * addFlag - puts the flag div infront of everything (shows it).
  *
  * @param {object} sprite - the sprite that "requested" the flag.
  */
  addFlag (sprite) {
    const el = sprite.element.flag

    el.style.zIndex = 1000
    el.style.display = 'block'
  }

  /**
  * removeFlag - puts the flag div at the back (hides it).
  *
  * @param {object} sprite - the sprite that "requested" the flag.
  */
  removeFlag (sprite) {
    const el = sprite.element.flag

    el.style.zIndex = -1
    el.style.display = 'none'
  }
}


/***/ }),

/***/ "./src/sprite.js":
/*!***********************!*\
  !*** ./src/sprite.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Sprite)
/* harmony export */ });
/* harmony import */ var _entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./entity */ "./src/entity.js");
/* harmony import */ var _stage_surface__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stage-surface */ "./src/stage-surface.js");
/* harmony import */ var _sprite_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./sprite-element */ "./src/sprite-element.js");
/* harmony import */ var _costume__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./costume */ "./src/costume.js");
/* harmony import */ var _text_ui_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./text-ui-element */ "./src/text-ui-element.js");
/* harmony import */ var _collision_detector__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./collision-detector */ "./src/collision-detector.js");









/**
 * Class representing a Sprite.
 * Sprites can be added to the Stage.
 * @extends Entity
 *
 * @example
 * let sprite = new blockLike.Sprite();
 *
 * @example
 * let sprite = new blockLike.Sprite({
 *   costume: new blockLike.Costume({
 *     width: 50,
 *     height: 50,
 *     color: '#A2DAFF',
 *     image: 'https://www.blocklike.org/images/sheep_step.png'
 *   })
 * });
 *
 * @example
 * let sprite = new blockLike.Sprite({
 *     width: 50,
 *     height: 50,
 *     color: '#A2DAFF',
 *     image: 'https://www.blocklike.org/images/sheep_step.png'
 * });
 *
 * @example
 * let confetti = new blockLike.Sprite('https://www.blocklike.org/images/confetti.svg');
 *
 * @example
 * let bareZeroSizedSprite = new blockLike.Sprite(null);
 */
class Sprite extends _entity__WEBPACK_IMPORTED_MODULE_0__["default"] {
  /**
  * constructor - Creates a Sprite to be added to Stage.
  *
  * @param {object} options - options for the sprite and/or options passed to costume.
  * Alternatively an image URL. If a URL is provided default costume will be sized to image.
  * @param {number} options.pace - The number of milliseconds to wait for each paced method.
  * @param {object} options.costume - A default Costume.
  * @param {number} options.width - the costume width in pixels. Default is 100.
  * @param {number} options.height - the costume height in pixels. Default is 100.
  * @param {string} options.image - a URL (or data URL) for the costume image.
  * @param {string} options.color - a css color string ('#ff0000', 'red').
  * @param {string} options - a URL (or data URL) for the costume image.
  */
  constructor (options = {}) {
    const sheepy = 'data:image/png;base64,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'
    const defaults = {
      pace: 33
    }

    let actual = {}
    typeof options === 'object' ? actual = { ...defaults, ...options } : actual = defaults

    super(actual.pace)

    // costumes
    this.costumes = []

    /*
    * alternate options  - image url.
    * user can send a url instead of an option object.
    * this will be treated as a costume image url.
    * the image will be set the sprite costume.
    * when the image is loaded, costume width and height will be set to actual image width and height.
    * sprite will be refreshed.
    */
    if (typeof options === 'string') {
      actual.costume = new _costume__WEBPACK_IMPORTED_MODULE_3__["default"]({ image: options, width: 0, height: 0 })
      const image = new window.Image()

      const me = actual.costume
      image.src = options

      image.addEventListener('load', () => {
        me.originalWidth = image.width
        me.originalHeight = image.height
        me.width = me.originalWidth
        me.height = me.originalHeight

        this.refresh()
      })
    }

    /*
    * alternate options - passing custome options to sprite.
    * if costume is not defined by user, it will be created.
    * when no image is set, sheepy is default.
    *
    * alternate options - null.
    * user can pass null instead of an option object.
    * this is same as setting a costume as null.
    * the sprite will have no costumes and no size.
    */
    if (typeof actual.costume === 'undefined' && options !== null) {
      const costumeOptions = {}
      actual.width ? costumeOptions.width = actual.width : null
      actual.height ? costumeOptions.height = actual.height : null
      actual.color ? costumeOptions.color = actual.color : null;
      (typeof actual.image !== 'undefined') ? costumeOptions.image = actual.image : costumeOptions.image = sheepy

      actual.costume = new _costume__WEBPACK_IMPORTED_MODULE_3__["default"](costumeOptions)
    }

    // set costume
    actual.costume ? this.costume = actual.costume : null
    this.costume ? this.costumes.push(this.costume) : null

    // set width
    this.costume ? this.width = this.costume.visibleWidth : this.width = 0
    this.costume ? this.height = this.costume.visibleHeight : this.height = 0

    this.x = 0
    this.y = 0
    this.z = 0

    this.prevX = 0
    this.prevY = 0

    this.showing = true
    this.direction = 90
    this.magnification = 100

    this.rotationStyle = 0

    this.textui = null

    this.drawing = false
    this.penColor = '#222222'
    this.penSize = 1

    this.cssRules = []
    this.classes = []

    this.collisionDetector = _collision_detector__WEBPACK_IMPORTED_MODULE_5__["default"]
  }

  /** Setup Actions * */

  /**
  * addTo - Adds the sprite to the stage
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  *
  * @param {object} stage - which stage to add the sprite too.
  */
  addTo (stage) {
    this.stageWidth = stage.width
    this.stageHeight = stage.height

    this.element = new _sprite_element__WEBPACK_IMPORTED_MODULE_2__["default"](this, stage)
    this.surface = new _stage_surface__WEBPACK_IMPORTED_MODULE_1__["default"](stage)

    this.element.flag = stage.element.flag
    this.againstBackdrop = stage.element.backdropContainer

    stage.sprites.push(this)
    this.z = stage.sprites.length

    this.element.update(this)
  }

  /**
  * clone - Creates a clone of the sprite and triggers an event.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   let clone = this.clone();
  *   clone.move(100);
  *   clone.addTo(stage);
  * });
  *
  */
  clone () {
    // make a new sprite.
    const sprite = new Sprite()
    // save id.
    const id = sprite.id
    // and assign properties.
    const clone = Object.assign(sprite, this)
    // reassign the unique id.
    clone.id = id

    // remove DOM elements
    clone.element = null
    clone.surface = null

    // detach arrays
    clone.cssRules = JSON.parse(JSON.stringify(this.cssRules))
    clone.classes = this.classes.slice()

    // figure out what the current costume is.
    const currentCostumeIndex = this.costumes.indexOf(this.costume)

    // fill the costumes array with new costumes and assign properties.
    clone.costumes = this.costumes.map((item) => {
      const costume = new _costume__WEBPACK_IMPORTED_MODULE_3__["default"]()
      const obj = Object.assign(costume, item)

      // detach arrays
      obj.cssRules = JSON.parse(JSON.stringify(item.cssRules))
      obj.classes = item.classes.slice()

      return obj
    })

    // set the current costume.
    clone.costume = clone.costumes[currentCostumeIndex]

    // announce a clone
    const event = new window.CustomEvent(`blockLike.spritecloned.${this.id}`, { detail: clone })
    document.dispatchEvent(event)

    return clone
  }

  /**
  * removeFrom - Removes a sprite from the stage.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.removeFrom(stage);
  *
  */
  removeFrom (stage) {
    const curStage = stage

    curStage.sprites = stage.sprites.filter((item) => item !== this)
    this.element ? this.element = this.element.delete(this) : null
  }

  /** Events * */

  /**
  * whenCloned - Adds a document level event listener triggered by a custom event.
  * The custom event is triggered by the clone() method.
  * When triggered will invoke user supplied function.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.clone();
  * });
  *
  * sprite.whenCloned( function() {
  *   this.addTo(stage);
  *   this.glide(5, 100, 0);
  * });
  *
  * @param {function} func - a function to rewrite and execute.
  */
  whenCloned (func) {
    document.addEventListener(`blockLike.spritecloned.${this.id}`, (e) => {
      e.detail._exec(func, [])
      e.stopPropagation()
    })
  }

  /** Motion * */

  /**
  * _motion - Moves the sprite to specified location (x, y).
  * All user motion methods translated to this motion.
  *
  * @private
  * @param {number} x - the x coordinate for the center of the sprite (0 is center screen).
  * @param {number} y - the y coordinate for the center of the sprite (0 is center screen).
  */
  _motion (x, y) {
    this.prevX = this.x
    this.prevY = this.y
    this.x = x
    this.y = y
    this.element ? this.element.update(this) : null
    this.surface ? this.surface.draw(this) : null
  }

  /**
  * glide - Moves the sprite for the specified number of seconds so it arrives at specified location when time is up.
  * Provides smooth movement.
  *
  * @example
  * sprite.whenClicked( function() {
  *   this.glide(3, 100, 100);
  * });
  *
  * @example
  * sprite.whenClicked( function() {
  *   let time = 5;
  *   this.glide(time, 100, 100);
  * });
  *
  * @param {number} sec - the number of seconds the whole movement will last (and will halt further execution for).
  * @param {number} x - the x coordinate.
  * @param {number} y - the y coordinate.
  */
  glide (sec, x, y, triggeringId = null) {
    let i = 0
    const me = this
    // divide the x and y difference into steps
    const framesPerSecond = 1000 / this.pace
    const stepX = (x - this.x) / (sec * framesPerSecond)
    const stepY = (y - this.y) / (sec * framesPerSecond)
    const int = setInterval(() => {
      i += 1
      me._motion(me.x + stepX, me.y + stepY)
      if (i / framesPerSecond >= sec) {
        //  clear the interval and fix any "drift"
        clearInterval(int)
        me._motion(x, y)
        me._releaseWaited(triggeringId)
      }
    }, this.pace)
  }

  /**
  * move - Moves the sprite a specified number of pixels in the direction it is pointing.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.move(100, 100);
  * });
  *
  * @param {number} pixels - number of pixels to move.
  */
  move (pixels) {
    /**
    * toRad - converts a degree to radians.
    *
    * @param {number} deg - number of degrees.
    * @return {number} - degrees converted to radians.
    */
    function toRad (deg) {
      return deg * (Math.PI / 180)
    }

    const dx = Math.round(Math.cos(toRad(this.direction - 90)) * pixels)
    const dy = Math.round(Math.sin(toRad(this.direction + 90)) * pixels)

    this._motion(this.x + dx, this.y + dy)
  }

  /**
  * goTo - Moves the sprite to specified location.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.goTo(100, 100);
  * });
  *
  * @param {number} x - the x coordinate.
  * @param {number} y - the y coordinate.
  */
  goTo (x, y) {
    this._motion(x, y)
  }

  /**
  * goTowards - Moves the sprite towards another sprite.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  * let otherSprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * otherSprite.addTo(stage);
  * otherSprite.move(100);
  * sprite.whenClicked( function() {
  *   this.goTowards(otherSprite);
  * });
  *
  * @param {object} sprite - the sprite to move to.
  */
  goTowards (sprite) {
    this._motion(sprite.x, sprite.y)
  }

  /**
  * setX - Places the sprite at the specified x position.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.setX(100);
  * });
  *
  * @param {number} x - the x coordinate
  */
  setX (x) {
    this._motion(x, this.y)
  }

  /**
  * setY - Places the sprite at the specified y position.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.setY(100);
  * });
  *
  * @param {number} y - the y coordinate.
  */
  setY (y) {
    this._motion(this.x, y)
  }

  /**
  * changeX - Moves the sprite on the x axis a specified number of pixels.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.changeX(100);
  * });
  *
  * @param {number} pixels - number of pixels to move.
  */
  changeX (pixels) {
    this._motion(this.x + pixels, this.y)
  }

  /**
  * changeY - Moves the sprite on the y axis a specified number of pixels.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.changeY(100);
  * });
  *
  * @param {number} pixels - number of pixels to move.
  */
  changeY (pixels) {
    this._motion(this.x, this.y + pixels)
  }

  /**
  * pointInDirection - Points the sprite in a specified direction.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.pointInDirection(45);
  * });
  *
  * @param {number} deg - direction to point to.
  */
  pointInDirection (deg) {
    deg > 0 ? this.direction = deg % 360 : this.direction = (deg + (360 * 10)) % 360
    this.element ? this.element.update(this) : null

    this.collisionDetector.refreshSpriteBitmapCache()
  }

  /**
  * pointTowards - Point the sprite towards another sprite.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  * let otherSprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * otherSprite.addTo(stage);
  * otherSprite.goTo(100, 100);
  * sprite.whenClicked( function() {
  *   this.pointTowards(otherSprite);
  * });
  *
  * @param {object} sprite - the sprite to move to.
  */
  pointTowards (sprite) {
    /**
    * computeDirectionTo - finds the direction from sprite's current location to a specified set of coordinates.
    *
    * @param {number} fromX - the x coordinate
    * @param {number} fromY - the y coordinate
    * @param {number} toX - the x coordinate
    * @param {number} toY - the y coordinate
    * @return {number} - direction in degrees.
    */
    function computeDirectionTo (fromX, fromY, toX, toY) {
      /**
      * toDeg - Converts radians to degrees.
      *
      * @param {number} rad - number of radians.
      * @return {number} - radians converted to degrees.
      */
      function toDeg (rad) {
        return rad * (180 / Math.PI)
      }

      // 1) Find the angle in rad, convert to deg (90 to -90).
      // 2) Find the sign of the delta on y axis (1, -1). Shift to (0, -2). Multiply by 90. (0, 180)
      // Add 1) and 2)
      // Normalize to 360

      let result = (toDeg(Math.atan((fromX - toX) / (fromY - toY))) + (90 * (Math.sign(fromY - toY) + 1)) + 360) % 360;
      (fromY - toY) === 0 ? result += 90 : null // make sure we fix atan lim (division by zero).

      return result
    }

    this.direction = computeDirectionTo(this.x, this.y, sprite.x, sprite.y)
    this.element ? this.element.update(this) : null
    this.collisionDetector.refreshSpriteBitmapCache()
  }

  /**
  * turnRight - Turns the sprite in a specified number of degrees to the right (clockwise)
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.turnRight(45);
  * });
  *
  * @param {number} deg - number of degrees to turn.
  */
  turnRight (deg) {
    this.direction = (this.direction + deg) % 360
    this.element ? this.element.update(this) : null
    this.collisionDetector.refreshSpriteBitmapCache()
  }

  /**
  * turnLeft - Turns the sprite in a specified number of degrees to the left (counter-clockwise)
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.turnLeft(45);
  * });
  *
  * @param {number} deg - number of degrees to turn.
  */
  turnLeft (deg) {
    this.direction = ((this.direction + 360) - deg) % 360
    this.element ? this.element.update(this) : null
    this.collisionDetector.refreshSpriteBitmapCache()
  }

  /**
  * setRotationStyle - Sets one of three possible rotation styles:
  *   - 'no' / 2 - the sprites changes the direction in which it points without changing the sprites appearance.
  *   - 'left-right' / 1 - the sprite will flip horizontally when direction is between 180 and 360.
  *   - 'all' / 0 - the sprite will rotate around its center
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.setRotationStyle('left-right');
  *
  * @example
  * sprite.setRotationStyle(1);
  *
  * @param {number} deg - number of degrees to turn.
  */
  setRotationStyle (style) {
    let curStyle = style

    style === 'no' ? curStyle = 2 : null
    style === 'left-right' ? curStyle = 1 : null
    style === 'all' ? curStyle = 0 : null

    this.rotationStyle = curStyle
  }

  /** Looks * */

  /**
  * _refreshCostume - Sets the costume and sprite width and hight then refreshes element.
  *
  * @private
  */
  _refreshCostume () {
    if (this.costume) {
      this.width = this.costume.visibleWidth
      this.height = this.costume.visibleHeight
    }

    this.element ? this.element.update(this) : null

    this.collisionDetector.refreshSpriteBitmapCache()
  }

  /**
  * addCostume - Adds a costume to the sprite
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  * let costume = new blockLike.Costume();
  *
  * sprite.addTo(stage);
  * sprite.addCostume(costume);
  *
  * @param {object} costume - the costume to add.
  */
  addCostume (costume) {
    this.costumes.push(costume)

    // if "bare" set the added as active.
    if (!this.costume) {
      this.costume = this.costumes[0]
      this.width = this.costume.visibleWidth
      this.height = this.costume.visibleHeight
    }

    this.element ? this.element.update(this) : null
  }

  /**
  * switchCostumeTo - Switches to specified costume. If not found fails silently.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  * let costume = new blockLike.Costume();
  *
  * sprite.addTo(stage);
  * sprite.addCostume(costume);
  * sprite.switchCostumeTo(costume);
  *
  * @param {object} backdrop - the costume to switch too.
  */
  switchCostumeTo (costume) {
    const currentCostumeIndex = this.costumes.indexOf(costume)
    currentCostumeIndex !== -1 ? this.costume = this.costumes[currentCostumeIndex] : null

    this._refreshCostume()
  }

  /**
  * switchCostumeToNum - Switches to specified costume by number of current (0 is first). If not found fails silently.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  * let costume = new blockLike.Costume();
  *
  * sprite.addTo(stage);
  * sprite.addCostume(costume);
  * sprite.switchCostumeToNum(1);
  *
  * @param {number} index - the costume to switch too.
  */
  switchCostumeToNum (index) {
    this.switchCostumeTo(this.costumes[index])
  }

  /**
  * nextCostume - Switches to the next costume.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  * let costume = new blockLike.Costume();
  *
  * sprite.addTo(stage);
  * sprite.addCostume(costume);
  * sprite.nextCostume();
  *
  */
  nextCostume () {
    const currentCostumeIndex = this.costumes.indexOf(this.costume)
    this.costume = this.costumes[(currentCostumeIndex + 1) % this.costumes.length]

    this._refreshCostume()
  }

  /**
  * removeCostume - Removes a costume.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  * let costume = new blockLike.Costume();
  *
  * sprite.addTo(stage);
  * sprite.addCostume(costume);
  * sprite.removeCostume(costume);
  *
  * @param {object} costume - the costume to remove.
  */
  removeCostume (costume) {
    if (this.costumes.length > 1) {
      const currentCostumeIndex = this.costumes.indexOf(costume)
      this.costume === costume ? this.costume = this.costumes[(currentCostumeIndex + 1) % this.costumes.length] : null
      this.costumes = this.costumes.filter((item) => item !== costume)
    } else {
      this.costumes = []
      this.costume = null
    }
    this._refreshCostume()
  }

  /**
  * removeCostumeNum - Removes the specified costume by number of current (0 is first).
  * If there is only one costume, will fail and emit a console message.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  * let costume = new blockLike.Costume();
  *
  * sprite.addTo(stage);
  * sprite.addCostume(costume);
  * sprite.removeCostumeNum(1);
  *
  * @param {number} index - the costume to remove.
  */
  removeCostumeNum (index) {
    this.removeCostume(this.costumes[index])
  }

  /**
  * show - Shows the sprite. By default sprites are shown.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.hide();
  * sprite.show();
  *
  */
  show () {
    this.showing = true
    this.element ? this.element.update(this) : null
  }

  /**
  * hide - Hides the sprite. By default sprites are shown.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.hide();
  *
  */
  hide () {
    this.showing = false
    this.element ? this.element.update(this) : null
  }

  /**
  * refresh - Forces a sprite refresh.
  * Note: service method to be used if costume was manipulated directly.
  */
  refresh () {
    const me = this
    // wait a sec...
    // TODO: This is to accomodate dynamic image resize. Not ideal. Should be event driven.
    setTimeout(() => {
      // in case costume was resized force a reset of size.
      me.setSize(me.magnification)
      // then refresh the DOM.
      me.element ? me.element.update(me) : null
      this.collisionDetector.refreshSpriteBitmapCache()
    }, this.pace)
  }

  /**
  * resizeToImage - sets the width and height of the sprite to that of the image file of current costume.
  * Note: service method. Similar to calling resizeToImage() on costume and then refresh() on sprite.
  *
  * @example
  * const sprite = new blockLike.Sprite(null);
  *
  * const angrySheep = new blockLike.Costume({
  *   image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Emojione_1F411.svg/200px-Emojione_1F411.svg.png',
  * });
  * angrySheep.addTo(sprite);
  *
  * sprite.resizeToImage();
  * sprite.addTo(stage);
  */
  resizeToImage () {
    if (this.costume) {
      this.costume.resizeToImage()
    }

    this.refresh()
  }

  /**
  * inner - Places an HTML element inside the current costume of the sprite.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.inner('<p class="big centered rainbow">:)</p>');
  *
  * @example
  * sprite.inner('I like text only');
  *
  * @param {object} el - the DOM element.
  */
  inner (html) {
    this.costume.inner(html)
    this.element ? this.element.update(this) : null
  }

  /**
  * insert - Places a DOM element inside the current costume of the sprite.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.insert(document.getElementById('my-html-creation'));
  *
  * @param {object} el - the DOM element.
  */
  insert (el) {
    this.costume.insert(el)
    this.element ? this.element.update(this) : null
  }

  /**
  * _refreshSize - Sets the sprite width and hight in relation to original then refreshes element.
  *
  * @private
  * @param {object} costume - the costume to add.
  */
  _refreshSize () {
    /**
    * decimalRound - rounds a number too decimal points.
    *
    * @param {number} value - the value to round.
    * @param {number} points - how many decimal points to leave.
    */
    function decimalRound (value, points) {
      return Math.round(value * (10 ** points)) / (10 ** points)
    }

    if (this.costume) {
      this.width = decimalRound(this.costume.width * (this.magnification / 100), 2)
      this.height = decimalRound(this.costume.height * (this.magnification / 100), 2)

      this.costumes.forEach((item) => {
        const costume = item
        costume.visibleWidth = decimalRound(costume.width * (this.magnification / 100), 2)
        costume.visibleHeight = decimalRound(costume.height * (this.magnification / 100), 2)
      })

      this.costume.visibleWidth = this.width
      this.costume.visibleHeight = this.height

      this.element ? this.element.update(this) : null
    }

    this.collisionDetector.refreshSpriteBitmapCache()
  }

  /**
  * changeSize - Changes the size of the sprite by specified percentage number.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.changeSize(50);
  *
  * @param {number} change - the percentage change.
  */
  changeSize (change) {
    this.magnification += change

    this._refreshSize()
  }

  /**
  * setSize - Sets the size of the sprite to the specified percentage number.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.setSize(150);
  *
  * @param {number} percent - the percentage to set.
  */
  setSize (percent) {
    this.magnification = percent

    this._refreshSize()
  }

  /** Text UI * */

  /**
  * think - Creates a "think bubble" over the sprite.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.think('I think therefore I am.');
  *
  * @param {string} text - the text inside the bubble.
  */
  think (text) {
    if (this.element) {
      this.textui ? this.textui = this.textui.delete(this) : null
      typeof text !== 'undefined' && text.toString() ? this.textui = new _text_ui_element__WEBPACK_IMPORTED_MODULE_4__["default"](this, 'think', text) : null
    }
  }

  /**
  * thinkWait - Creates a "think bubble" over the sprite for a specified number of seconds.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.thinkWait('I think therefore I am.', 3);
  *
  * @param {string} text - the text inside the bubble.
  * @param {number} sec - the number of seconds to wait.
  */
  thinkWait (text, sec, triggeringId = null) {
    setTimeout(() => {
      this.think('')
      this._releaseWaited(triggeringId)
    }, sec * 1000)
    this.think(text)
  }

  /**
  * say - Creates a "speech bubble" over the sprite.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.say('It is not the consciousness of men that determines their being, but, on the contrary, their social being that determines their consciousness.');
  *
  * @param {string} text - the text inside the bubble.
  */
  say (text) {
    if (this.element) {
      this.textui ? this.textui = this.textui.delete(this) : null
      typeof text !== 'undefined' && text.toString() ? this.textui = new _text_ui_element__WEBPACK_IMPORTED_MODULE_4__["default"](this, 'say', text) : null
    }
  }

  /**
  * sayWait - Creates a "speech bubble" over the sprite for a specified number of seconds.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.sayWait('It is not the consciousness of men that determines their being, but, on the contrary, their social being that determines their consciousness.', 3);
  *
  * @param {string} text - the text inside the bubble.
  * @param {number} sec - the number of seconds to wait.
  */
  sayWait (text, sec, triggeringId = null) { // eslint-disable-line class-methods-use-this
    setTimeout(() => {
      this.say('')
      this._releaseWaited(triggeringId)
    }, sec * 1000)
    this.say(text)
  }

  /**
  * ask - Creates an "ask bubble" over the sprite.
  * Allows for an input box to be displayed to the user and
  * capture user input into the variable specified by the user.
  * Note - variable for answer must be declared in global scope.
  *
  * @example
  * //good:
  * let answer;
  * sprite.whenClicked( function() {
  *   answer = this.ask('Is the destiny of mankind decided by material computation?');
  *   this.say(answer);
  * });
  *
  * // bad:
  * sprite.whenClicked( function() {
  *   let answer;
  *   answer = this.ask('Is the destiny of mankind decided by material computation?');
  *   this.say(answer);
  * });
  *
  * @param {string} text - the text of the question
  *
  */
  ask (text, theVar = null, triggeringId = null) {
    const me = this
    me.askId = this._generateUUID()

    if (this.element) {
      this.textui ? this.textui = this.textui.delete(this) : null
      typeof text !== 'undefined' && text.toString() ? this.textui = new _text_ui_element__WEBPACK_IMPORTED_MODULE_4__["default"](me, 'ask', text) : null

      // this will wait for user input
      document.addEventListener(`blockLike.ask.${this.id}.${me.askId}`, function askListener (e) {
        // remove it.
        document.removeEventListener(`blockLike.ask.${me.id}.${me.askId}`, askListener)
        // this is the waited method listener. release it.
        me._releaseWaited(triggeringId)
        // set the user defined variable to the captured value.
        theVar ? me._setToVar(theVar, e.detail.value) : null
        // remove the UI.
        me.textui ? me.textui = me.textui.delete(me) : null
      })
    }
  }

  /** Pen * */

  /**
  * penClear - Clears the drawing surface.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.penClear();
  * });
  *
  */
  penClear () {
    this.surface.clear(this)
  }

  /**
  * penDown - "Activates" drawing by setting required values.
  * When activated sprite motion will create the drawing on the stage's canvas.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.penDown();
  *   this.move(100);
  * });
  *
  */
  penDown () {
    this.drawing = true
    this.prevX = this.x
    this.prevY = this.y
    this.surface.draw(this)
  }

  /**
  * penUp - "Deactivates" drawing by setting required values.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.penDown();
  *   this.move(100);
  *   this.penUp();
  * });
  *
  */
  penUp () {
    this.drawing = false
    this.surface.draw(this)
  }

  /**
  * setPenColor - Sets the color of the pen.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.setPenColor('#ff0000')
  *
  * @example
  * sprite.setPenColor('red')
  *
  * @param {string} colorString - a valid color definition for canvas strokeStyle.
  */
  setPenColor (colorString) {
    this.penColor = colorString
  }

  /**
  * setPenSize - Sets the size of the pen.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.setPenSize(10);
  *
  * @param {number} pixels - a number for canvas lineWidth.
  */
  setPenSize (pixels) {
    this.penSize = pixels
  }

  /**
  * changePenSize - Changes the size of the pen.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   this.changePenSize(10);
  * });
  *
  * @param {number} change - the change in pixels.
  */
  changePenSize (change) {
    this.penSize += change
  }

  /* Sensing */

  /**
  * distanceTo - Returns the distance to a point on the screen.
  *
  * @example
  * let stage = new blockLike.Stage({sensing: true});
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  *
  * stage.whenClicked( function() {
  *  sprite.say(this.distanceTo(this.mouseX, this.mouseY))
  * });
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  * let sprite = new blockLike.otherSprite();
  *
  * sprite.addTo(stage);
  * otherSprite.addTo(stage);
  *
  * stage.whenClicked( function() {
  *  sprite.say(this.distanceTo(otherSprite.x, otherSprite.y))
  * });
  *
  * @param {number} x - the x coordinate.
  * @param {number} y - the y coordinate.
  * @return {number} - distance in pixels to position on screen (not rounded).
  */
  distanceTo (x, y) {
    const dx = this.x - x
    const dy = this.y - y

    return Math.sqrt((dx * dx) + (dy * dy))
  }

  /**
  * touchingEdge - Checks is this sprite touches the edge of the stage and returns the edge touched.
  *
  * Notes:
  * 1. This is based on rectangular collision detection.
  * 2. this compares a naive rectangle, so if the sprite is rotated touching might be sensed early or late.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *  while(this.x < stage.width / 2) {
  *    this.move(10)
  *    this.say(this.touchingEdge());
  *   }
  * });
  *
  * @return {string} - the side of the stage that is touched (null, top, bottom, left, right)
  */
  touchingEdge () {
    // const startTime = performance.now()
    const collided = this.collisionDetector.isSpriteTouchingEdge({
      image: this.costume.image,
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    })
    // console.log(`Process Time: ${performance.now() - startTime}`)

    return collided
  }

  /**
  * isTouchingEdge - Checks is this sprite touches the edge.
  *
  * Notes:
  * 1. This is based on rectangular collision detection.
  * 2. this compares a naive rectangle, so if the sprite is rotated touching might be sensed early or late.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *  while(this.x < stage.width / 2) {
  *    this.move(10)
  *    this.say(this.isTouchingEdge());
  *   }
  * });
  *
  * @return {boolean} - is the sprite touching the edge.
  */
  isTouchingEdge () {
    return !!this.touchingEdge()
  }

  /**
  * touching - Checks is this sprite touches another and returns at what side it touches.
  *
  * Notes:
  * 1. this compares a naive rectangle, so if the sprite is rotated touching might be sensed early or late.
  * 2. if the sprite has gone "into" the other the side "penetrated more" will be returned.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  * let otherSprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * otherSprite.addTo(stage);
  * otherSprite.move(200);
  * sprite.whenClicked( function() {
  *  while(!this.touching(otherSprite)) {
  *    this.move(10);
  *    this.say(this.touching(otherSprite))
  *   }
  * });
  *
  * @param {string} sprite - the sprite to check if touching.
  * @return {string} - the side of the sprite that is touched (null, top, bottom, left, right)
  */
  touching (sprite) {
    // const startTime = performance.now()
    const collided = this.collisionDetector.doSpritesOverlap(
      {
        image: this.costume.image,
        x: this.x,
        y: this.y,
        w: this.width,
        h: this.height
      },
      {
        image: sprite.costume.image,
        x: sprite.x,
        y: sprite.y,
        w: sprite.width,
        h: sprite.height
      }
    )
    // console.log(`Process Time: ${performance.now() - startTime}`)

    return collided
  }

  /**
  * isTouching - Checks is this sprite touches another.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  * let otherSprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * otherSprite.addTo(stage);
  * otherSprite.move(200);
  * sprite.whenClicked( function() {
  *  while(!this.isTouching(otherSprite)) {
  *    this.move(10);
  *   }
  * });
  *
  * @param {string} sprite - the sprite to check if touching.
  * @return {boolean} - is the sprite touching the specified sprite.
  */
  isTouching (sprite) {
    return !!this.touching(sprite)
  }

  /**
  * touchingBackdropColor - Returns the hex value to all pixels in backdrop area covered by the sprite rectangle.
  *
  * Notes:
  * 1. This is based on rectangular collision detection.
  * 2. This compares a naive rectangle, so if the sprite is rotated touching might be sensed early or late.
  * 3. The backdrop image must be a local image served from same origin.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.whenClicked( function() {
  *   while(true){
  *     let touchedColors = this.touchingBackdropColor();
  *     this.say(touchedColors);
  *     this.move(5);
  *   }
  * });
  *
  * @return {array} - colors (strings) touched.
  */
  touchingBackdropColor () {
    const result = []

    /**
    * rgbToHex - converts a color defined by RGB values into a on defined as a hex string.
    *
    * From: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    *
    * @param {number} r - the red value (0 to 255).
    * @param {number} g - the green value (0 to 255).
    * @param {number} b -  the blue value (0 to 255).
    * @return {string} - hex color string.
    */
    function rgbToHex (r, g, b) {
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}` // eslint-disable-line no-bitwise
    }

    try {
      const backdropContext = this.againstBackdrop.getContext('2d')
      const data = backdropContext.getImageData(((this.stageWidth / 2) - (this.width / 2)) + this.x, ((this.stageHeight / 2) - (this.height / 2)) - this.y, this.width, this.height).data

      for (let i = 0; i < data.length; i += 4) {
        data[i + 3] !== 0 ? result.push(rgbToHex(data[i], data[i + 1], data[i + 2])) : null
      }
    } catch (e) {
      console.log('BlockLike.js Notice: isTouchingBackdropColor() ingnored. Backdrop image can not be located at a remote origin.') // eslint-disable-line no-console
    }

    return Array.from(new Set(result))
  }

  /**
  * isTouchingBackdropColor - compares a given hex value to all pixels in backdrop area covered by the sprite rectangle.
  * If a match is found the color is returned.
  *
  * Notes:
  * 1. This is based on rectangular collision detection.
  * 2. This compares a naive rectangle, so if the sprite is rotated touching might be sensed early or late.
  * 3. The backdrop image must be a local image served from same origin.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * let moving = true;
  * sprite.whenClicked( function() {
  *   while(moving){
  *     this.isTouchingBackdropColor('#ff0000') ? moving = false : moving = true;
  *     this.move(5);
  *   }
  * });
  *
  * @param {string} backdropColor - the color to evaluate.
  * @return {boolean} - does the sprite touch the color.
  */
  isTouchingBackdropColor (backdropColor) {
    const hexArr = this.touchingBackdropColor(backdropColor)

    return hexArr.includes(backdropColor)
  }
}


/***/ }),

/***/ "./src/stage-element.js":
/*!******************************!*\
  !*** ./src/stage-element.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ StageElement)
/* harmony export */ });
/* harmony import */ var _element_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./element-css */ "./src/element-css.js");


/**
 * Class representing the UI Element of the stage.
 * Each Stage has one.
 * @private
 */
class StageElement {
  /**
  * constructor - Creates a Stage Element.
  *
  * @param {object} options - the stage for which the element is created.
  * @param {object} stage - the stage created.
  */
  constructor (options, stage) {
    const el = document.createElement('div')

    /**
    * createDiv - creates a div at specified zIndex.
    *
    * @param {number} zIndex - desired place in "stack"
    * @return {object} - a stage wide/high DOM element.
    */
    function createDiv (zIndex) {
      const sel = document.createElement('div')

      sel.style.width = `${options.width}px`
      sel.style.height = `${options.height}px`
      sel.style.zIndex = zIndex
      sel.style.position = 'absolute'
      sel.style.touchAction = 'manipulation'

      return sel
    }

    /**
    * createCanvas - creates a canvas at specified zIndex.
    *
    * @param {number} zIndex - desired place in "stack"
    * @return {object} - a stage wide/high DOM element.
    */
    function createCanvas (zIndex) {
      const cel = document.createElement('canvas')

      cel.width = options.width
      cel.height = options.height
      cel.style.zIndex = zIndex
      cel.style.position = 'absolute'
      cel.style.left = '0px'
      cel.style.top = '0px'

      return cel
    }

    /**
    * createFlag - creates a "flag" div.
    *
    * @return {object} - a stage wide/high DOM element with flag at centers.
    */
    function createFlag () {
      const flagSize = 130
      const fel = createDiv(-1)

      const felitem = document.createElement('div')

      // Convert the center based x coordinate to a left based one.
      const x = -(flagSize / 2)
      // Convert the center based y coordinate to a left based one.
      const y = -(flagSize / 2)

      // looks
      felitem.style.width = `${flagSize}px`
      felitem.style.height = `${flagSize}px`
      felitem.style.position = 'absolute'
      felitem.innerHTML = '&#9873;'

      felitem.style.left = `${(options.width / 2) + x}px`
      felitem.style.top = `${(options.height / 2) + y}px`
      felitem.className = 'blocklike-flag'

      fel.appendChild(felitem)
      fel.style.display = 'none'

      return fel
    }

    el.id = `${stage.id}`

    el.style.width = `${options.width}px`
    el.style.height = `${options.height}px`

    el.style.position = 'relative'
    el.style.boxSizing = 'border-box'
    el.style.overflow = 'hidden'

    options.parent.appendChild(el)

    this.backdropContainer = createCanvas(0)
    this.backdropContainer.id = `${stage.id}-backdrop`
    this.backdropContainer.className = 'blocklike-panel-backdrop'
    el.appendChild(this.backdropContainer)

    this.canvas = createCanvas(0)
    this.canvas.id = `${stage.id}-surface`
    this.canvas.className = 'blocklike-panel-surface'
    el.appendChild(this.canvas)

    this.flag = createFlag()
    this.flag.id = `${stage.id}-flag`
    this.flag.className = 'blocklike-panel-flag'
    el.appendChild(this.flag)

    this.context = this.canvas.getContext('2d')

    this.el = el
  }

  /**
  * update - updates the DOM element.
  *
  * @param {object} stage - the stage to update.
  */
  update (stage) {
    const el = stage.element.el
    const backdropContext = stage.element.backdropContainer.getContext('2d')

    let marginTB = 0
    if (stage.element.el.parentElement.tagName === 'BODY') {
      marginTB = Math.floor((window.innerHeight - stage.height) / 2)
      marginTB < 0 ? marginTB = 0 : null
    }

    // If color - fill the canvas with the color set, or clear it
    if (stage.backdrop && stage.backdrop.color) {
      backdropContext.rect(0, 0, stage.width, stage.height)
      backdropContext.fillStyle = stage.backdrop.color
      backdropContext.fill()
    } else {
      backdropContext.clearRect(0, 0, stage.width, stage.height)
    }

    // If image - draw the image on canvas
    if (stage.backdrop && stage.backdrop.image) {
      const img = new Image()
      img.onload = () => {
        backdropContext.drawImage(img, 0, 0, stage.width, stage.height)
      }
      img.src = stage.backdrop.image
    }

    // zoom and placement
    el.style.transform = `scale(${stage.magnification / 100})`
    el.style.margin = `${marginTB}px auto`

    // css rules
    _element_css__WEBPACK_IMPORTED_MODULE_0__.apply(stage)

    // css classes
    stage.backdrop ? el.className = stage.backdrop.classes.concat(stage.classes).join(' ') : el.className = stage.classes.join(' ')
  }

  /**
  * delete - deletes the DOM element
  */
  delete (stage) {
    const el = stage.element.el

    el.parentNode.removeChild(el)
    return null
  }

  /**
  * addFlag - puts the flag div infront of everything (shows it)
  *
  * @param {object} stage - the stage that "requested" the flag.
  */
  addFlag (stage) {
    const el = stage.element.flag

    el.style.zIndex = 1000
    el.style.display = 'block'
  }

  /**
  * removeFlag - puts the flag div at the back (hides it)
  *
  * @param {object} stage - the stage that "requested" the flag.
  */
  removeFlag (stage) {
    const el = stage.element.flag

    el.style.zIndex = -1
    el.style.display = 'none'
  }
}


/***/ }),

/***/ "./src/stage-sensing.js":
/*!******************************!*\
  !*** ./src/stage-sensing.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ enable)
/* harmony export */ });
/**
* Encapsulates the stage sensing functionality.
*/

/**
* enable - Enables sensing of document level events (keydown, mousemove, mousedown, touchmove)
*/
function enable (stage) {
  const me = stage
  me.sensing = true

  /**
  * decimalRound - rounds a number too decimal points.
  *
  * @param {number} value - the value to round.
  * @param {number} points - how many decimal points to leave.
  */
  function decimalRound (value, points) {
    return Math.round(value * (10 ** points)) / (10 ** points)
  }

  /**
  * computeX - Computes centered x based on x extracted from event.
  */
  function computeX (x) {
    const mag = me.magnification / 100
    return decimalRound((x - (me.element.el.offsetLeft) - (me.width / 2)) / mag, 2)
  }

  /**
  * computeY - Computes centered y based on y extracted from event.
  */
  function computeY (y) {
    const mag = me.magnification / 100
    return decimalRound((-y + me.element.el.offsetTop + (me.height / 2)) / mag, 2)
  }

  document.addEventListener('keydown', (e) => {
    e.key && me.keysKey.indexOf(e.key.toLowerCase()) === -1 ? me.keysKey.push(e.key.toLowerCase()) : null
    e.code && me.keysCode.indexOf(e.code.toLowerCase()) === -1 ? me.keysCode.push(e.code.toLowerCase()) : null
    me.keysKeyCode.indexOf(e.keyCode) === -1 ? me.keysKeyCode.push(e.keyCode) : null
  })

  document.addEventListener('keyup', (e) => {
    e.key ? me.keysKey = me.keysKey.filter((item) => item !== e.key.toLowerCase()) : null
    e.code ? me.keysCode = me.keysCode.filter((item) => item !== e.code.toLowerCase()) : null
    me.keysKeyCode = me.keysKeyCode.filter((item) => item !== e.keyCode)
  })

  me.element.el.addEventListener('mousemove', (e) => {
    me.mouseX = computeX(e.clientX)
    me.mouseY = computeY(e.clientY)
  })

  me.element.el.addEventListener('touchmove', (e) => {
    me.mouseX = computeX(e.changedTouches[0].clientX)
    me.mouseY = computeY(e.changedTouches[0].clientY)
  }, { passive: true })

  me.element.el.addEventListener('mousedown', () => {
    me.mouseDown = true
  })
  me.element.el.addEventListener('mouseup', () => {
    me.mouseDown = false
  })

  me.element.el.addEventListener('touchstart', (e) => {
    me.mouseX = computeX(e.touches[0].clientX)
    me.mouseY = computeY(e.touches[0].clientY)
    me.mouseDown = true
  }, { passive: true })

  me.element.el.addEventListener('touchend', () => {
    me.mouseDown = false
    me.mouseX = null
    me.mouseY = null
  })
}


/***/ }),

/***/ "./src/stage-surface.js":
/*!******************************!*\
  !*** ./src/stage-surface.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ StageSurface)
/* harmony export */ });
/**
 * Class representing the stage surface on which sprites draw.
 * Each Stage has one.
 * @private
 */
class StageSurface {
  /**
  * constructor - Creates a Stage.
  *
  * @param {object} stage - the stage on which the sprite is drawing.
  */
  constructor (stage) {
    this.context = stage.element.context
  }

  /**
  * draw - draws a line "behind" a moving sprite.
  * Note: sprite always has current and previous x,y values to allow drawing to previous location.
  *
  * @param {object} sprite - the sprite drawing the line.
  */
  draw (sprite) {
    if (sprite.drawing) {
      this.context.beginPath()
      this.context.moveTo((sprite.stageWidth / 2) + sprite.x, (sprite.stageHeight / 2) + (sprite.y * -1))
      this.context.lineTo((sprite.stageWidth / 2) + sprite.prevX, (sprite.stageHeight / 2) + (sprite.prevY * -1))
      this.context.lineWidth = sprite.penSize
      this.context.strokeStyle = sprite.penColor
      this.context.stroke()
    }
  }

  /**
  * clear - clears the canvas
  */
  clear (sprite) {
    this.context.clearRect(0, 0, sprite.stageWidth, sprite.stageHeight)
  }
}


/***/ }),

/***/ "./src/stage.js":
/*!**********************!*\
  !*** ./src/stage.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Stage)
/* harmony export */ });
/* harmony import */ var _entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./entity */ "./src/entity.js");
/* harmony import */ var _stage_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stage-element */ "./src/stage-element.js");
/* harmony import */ var _stage_surface__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stage-surface */ "./src/stage-surface.js");
/* harmony import */ var _sprite_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sprite-element */ "./src/sprite-element.js");
/* harmony import */ var _collision_detector__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./collision-detector */ "./src/collision-detector.js");
/* harmony import */ var _stage_sensing__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./stage-sensing */ "./src/stage-sensing.js");









/**
 * Class representing a Stage.
 * @extends Entity
 *
 * @example
 * let stage = new blockLike.Stage();
 *
 * @example
 * let stage = new blockLike.Stage({
 *   width: 600,
 *   height: 400,
 *   pace: 16,
 *   sensing: true,
 *   parent: document.getElementById('stage-wrap'),
 *   backdrop: new blockLike.Backdrop({color: '#FFB6C1'})
 * });
 */
class Stage extends _entity__WEBPACK_IMPORTED_MODULE_0__["default"] {
  /**
  * constructor - Creates a Stage.
  *
  * @param {object} options - Options for the Stage.
  * @param {number} options.width - The stage width in pixels. Default is full window.
  * @param {number} options.height - The stage height in pixels. Default is full window.
  * @param {number} options.pace - The number of milliseconds to wait for each paced method.  Will disable pacing when set to zero.
  * @param {object} options.parent - The DOM element into which the stage will be inserted. Default is the body.
  * @param {object} options.backdrop - A default Backdrop.
  * @param {boolean} options.sensing - Enables sensing of mouse location and what keys pressed.
  * If true, will constantly update stage properties: mouseX, mouseY, keysKeyCode, keysKeyCode and keysCode based on user input.
  */
  constructor (options = {}) {
    const defaults = {
      width: window.innerWidth,
      height: window.innerHeight,
      parent: document.body,
      pace: 33,
      backdrop: null
    }
    const actual = { ...defaults, ...options }

    super(actual.pace)

    // backdrops
    this.backdrops = []

    if (actual.backdrop) {
      this.backdrop = actual.backdrop
      this.backdrops.push(this.backdrop)
    }

    this.element = new _stage_element__WEBPACK_IMPORTED_MODULE_1__["default"](actual, this)
    this.width = actual.width
    this.height = actual.height

    this.keysCode = []
    this.keysKey = []
    this.keysKeyCode = []

    this.sprites = []

    this.magnification = 100

    this.cssRules = []
    this.classes = []

    this.mouseDown = null
    this.mouseX = null
    this.mouseY = null

    actual.sensing ? (0,_stage_sensing__WEBPACK_IMPORTED_MODULE_5__["default"])(this) : null

    this.collisionDetector = _collision_detector__WEBPACK_IMPORTED_MODULE_4__["default"].init(this)

    this.element.update(this)
  }

  /**
  * delete - Deletes the stage element.
  *
  * @example
  * let stage = new blockLike.Stage();
  *
  * stage.delete();
  */
  delete () {
    this.element = this.element.delete(this)
  }

  /** Setup Actions * */

  /**
  * addSprite - Adds a sprite to the stage
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * stage.addSprite(sprite);
  *
  * @param {object} sprite - the sprite to add.
  */
  addSprite (sprite) {
    const curSprite = sprite

    curSprite.element = new _sprite_element__WEBPACK_IMPORTED_MODULE_3__["default"](sprite, this)
    curSprite.surface = new _stage_surface__WEBPACK_IMPORTED_MODULE_2__["default"](this)

    curSprite.element.flag = this.element.flag
    curSprite.againstBackdrop = this.element.backdropContainer

    curSprite.stageWidth = this.width
    curSprite.stageHeight = this.height

    this.sprites.push(curSprite)
    curSprite.z = this.sprites.length

    sprite.element.update(curSprite)

    this.collisionDetector.refreshSpriteBitmapCache()
  }

  /**
  * removeSprite - Removes a sprite from the stage
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * stage.addSprite(sprite);
  * stage.removeSprite(sprite);
  *
  * @param {object} sprite - the sprite to add.
  */
  removeSprite (sprite) {
    const curSprite = sprite
    this.sprites = this.sprites.filter((item) => item !== sprite)
    curSprite.element ? curSprite.element = curSprite.element.delete(curSprite) : null
  }

  /** looks * */

  /**
  * addBackdrop - Adds a backdrop to the stage
  *
  * @example
  * let stage = new blockLike.Stage();
  * let backdrop = new blockLike.Backdrop();
  *
  * stage.addBackdrop(backdrop);
  *
  * @param {object} backdrop - the backdrop to add.
  */
  addBackdrop (backdrop) {
    this.backdrops.push(backdrop)
    // if "bare" set the added as active
    !this.backdrop ? this.backdrop = this.backdrops[0] : null
    this.element ? this.element.update(this) : null
  }

  /**
  * switchBackdropTo - Switches to specified backdrop. If not found fails silently.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let backdrop = new blockLike.Backdrop();
  *
  * stage.addBackdrop(backdrop);
  * stage.switchBackdropTo(backdrop);
  *
  * @param {object} backdrop - the backdrop to switch too.
  */
  switchBackdropTo (backdrop) {
    const currentBackdropIndex = this.backdrops.indexOf(backdrop)
    currentBackdropIndex !== -1 ? this.backdrop = this.backdrops[currentBackdropIndex] : null

    this.element ? this.element.update(this) : null
  }

  /**
  * switchBackdropToNum - Switches to specified backdrop by number of current (0 is first). If not found fails silently.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let backdrop = new blockLike.Backdrop();
  *
  * stage.addBackdrop(backdrop);
  * stage.switchBackdropToNum(1);
  *
  * @param {number} index - the backdrop to switch too.
  */
  switchBackdropToNum (index) {
    this.switchBackdropTo(this.backdrops[index])
  }

  /**
  * nextBackdrop - Switches to the next backdrop.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let backdrop = new blockLike.Backdrop();
  *
  * stage.addBackdrop(backdrop);
  * stage.nextBackdrop();
  */
  nextBackdrop () {
    const currentBackdropIndex = this.backdrops.indexOf(this.backdrop)
    this.backdrop = this.backdrops[(currentBackdropIndex + 1) % this.backdrops.length]

    this.element ? this.element.update(this) : null
  }

  /**
  * removeBackdrop - Removes a backdrop.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let backdrop = new blockLike.Backdrop();
  *
  * stage.addBackdrop(backdrop);
  * stage.removeBackdrop(backdrop);
  *
  * @param {object} backdrop - the backdrop to remove.
  */
  removeBackdrop (backdrop) {
    if (this.backdrops.length > 1) {
      const currentBackdropIndex = this.backdrops.indexOf(backdrop)
      this.backdrop === backdrop ? this.backdrop = this.backdrops[(currentBackdropIndex + 1) % this.backdrops.length] : null
      this.backdrops = this.backdrops.filter((item) => item !== backdrop)
    } else {
      this.backdrops = []
      this.backdrop = null
    }
    this.element ? this.element.update(this) : null
  }

  /**
  * removeBackdropNum - Removes the specified backdrop by number of current (0 is first).
  * If there is only one backdrop, will fail and emit a console message.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let backdrop = new blockLike.Backdrop();
  *
  * stage.addBackdrop(backdrop);
  * stage.removeBackdropNum(1);
  *
  * @param {number} index - the backdrop to remove.
  */
  removeBackdropNum (index) {
    this.removeBackdrop(this.backdrops[index])
  }

  /**
  * refresh - Forces a sprite refresh.
  * Note: service method to be used if costume was manipulated directly.
  */
  refresh () {
    this.element ? this.element.update(this) : null
  }

  /**
  * zoom - zooms the stage to the specified percentage number.
  *
  * @example
  * let stage = new blockLike.Stage();
  *
  * stage.zoom(150);
  *
  * @param {number} percent - the percentage to set.
  */
  zoom (percent) {
    this.magnification = percent
    this.element.update(this)
  }

  /** Sprites * */

  /**
  * _refreshSprites - Refresh the DOM element of all sprites currently on stage.
  *
  * @private
  * @param {number} index - the backdrop to switch too.
  */
  _refreshSprites () {
    let i = 0
    this.sprites.forEach((item) => {
      const sprite = item
      i += 1
      sprite.z = i
      sprite.element ? sprite.element.update(sprite) : null
    })
  }

  /**
  * sendSpriteBackwards - Moves the sprite one place down the "pile".
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * stage.addSprite(sprite);
  * stage.whenFlag( function() {
  *   this.sendSpriteBackwards(sprite);
  * });
  *
  * @param {object} sprite - the sprite to move.
  */
  sendSpriteBackwards (sprite) {
    const index = this.sprites.indexOf(sprite)
    if (index > 0) {
      this.sprites[index] = this.sprites[index - 1] // move one up
      this.sprites[index - 1] = sprite // me subject down
    }
    this._refreshSprites()
  }

  /**
  * sendSpriteForward - Moves the sprite one place up in the "pile".
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * stage.addSprite(sprite);
  * stage.whenFlag( function() {
  *   this.sendSpriteForward(sprite);
  * });
  *
  * @param {object} sprite - the sprite to move.
  */
  sendSpriteForward (sprite) {
    const index = this.sprites.indexOf(sprite)
    if (index < this.sprites.length - 1 && index !== -1) {
      this.sprites[index] = this.sprites[index + 1] // move one down
      this.sprites[index + 1] = sprite // me subject up
    }
    this._refreshSprites()
  }

  /**
  * sendSpriteToFront - Brings the sprite to the front of the "pile"
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * stage.addSprite(sprite);
  * stage.whenFlag( function() {
  *   this.sendSpriteToFront(sprite);
  * });
  *
  * @param {object} sprite - the sprite to move.
  */
  sendSpriteToFront (sprite) {
    const index = this.sprites.indexOf(sprite)
    if (index !== -1) {
      this.sprites.splice(index, 1)
      this.sprites.push(sprite)
    }
    this._refreshSprites()
  }

  /**
  * sendSpriteToBack - Sends the sprite to the back of the "pile"
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * stage.addSprite(sprite);
  * stage.whenFlag( function() {
  *   this.sendSpriteToBack(sprite);
  * });
  *
  * @param {object} sprite - the sprite to move.
  */
  sendSpriteToBack (sprite) {
    const index = this.sprites.indexOf(sprite)
    if (index !== -1) {
      this.sprites.splice(index, 1)
      this.sprites.unshift(sprite)
    }
    this._refreshSprites()
  }

  /* sensing */

  /**
  * isKeyPressed - Checks if a key is pressed. Stage sensing must be enabled.
  *
  * @example
  * let stage = new blockLike.Stage();
  * let sprite = new blockLike.Sprite();
  *
  * sprite.addTo(stage);
  * sprite.say(stage.isKeyPressed('a'));
  *
  * @param {string} userKey - the key pressed. May be the code or the character itself (A or 65)
  * @param {function} func - a function to rewrite and execute.
  */
  isKeyPressed (userKey) {
    let match = false
    let check

    typeof userKey === 'string' ? check = userKey.toLowerCase() : check = userKey
    // Make sure each property is supported by browsers.
    // Note: user may write incompatible code.
    this.keysKey.indexOf(check) !== -1 ? match = true : null
    this.keysCode.indexOf(check) !== -1 ? match = true : null
    this.keysKeyCode.indexOf(check) !== -1 ? match = true : null

    !this.sensing ? console.log('BlockLike.js Notice: isKeyPressed() ingnored. Stage sensing not enabled.') : null // eslint-disable-line no-console

    return match
  }
}


/***/ }),

/***/ "./src/text-ui-element.js":
/*!********************************!*\
  !*** ./src/text-ui-element.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TextUiElement)
/* harmony export */ });
/**
 * Class representing the UI Elements attached to a sprite.
 * Each Sprite may have one.
 * @private
 */
class TextUiElement {
  /**
  * constructor - Creates a ui element that "attahces" to a sprite.
  *
  * @param {object} sprite - the sprite to which the ui is attached.
  * @param {string} type - what ui to create (say bubble, think bubble or ask box)
  * @param {string} text -  what the text said/thought/ask will be.
  * @param {object} askId - the ask box identifier (used to manage events).
  */
  constructor (sprite, type, text) {
    const el = document.createElement('div')
    /**
    * askInput - encapsulate the functionality of the input field used to capture user input with ask().
    *
    * @return {object} - the input dom element.
    */
    function askInput () {
      /**
      * sendAnswer - dispatches an event when the user has submitted the input.
      */
      function sendAnswer (value) {
        const event = new window.CustomEvent(`blockLike.ask.${sprite.id}.${sprite.askId}`, { detail: { value, askId: sprite.askId } })
        document.dispatchEvent(event)
      }

      const input = document.createElement('input')
      input.addEventListener('keydown', (e) => {
        if (e.keyCode === 13) {
          sendAnswer(input.value)
          input.value = ''
        }
      })
      el.appendChild(input)

      const submit = document.createElement('button')
      submit.innerHTML = '&#x2713'
      submit.addEventListener('click', () => {
        sendAnswer(input.value)
        input.value = ''
      })
      el.appendChild(submit)

      return input
    }

    this.text = text.toString()
    this.type = type

    // Convert the center based x coordinate to a left based one.
    const x = sprite.x - (sprite.width / 2)
    // Convert the center based y coordinate to a left based one.
    const y = (sprite.y * -1) - (sprite.height / 2)

    el.style.position = 'absolute'
    el.innerHTML = `${text}<br />`

    // looks
    // TODO: make this nicer...
    el.style.left = `${(sprite.stageWidth / 2) + x + (sprite.width * 0.6)}px`
    el.style.top = `${((sprite.stageHeight / 2) + y) - 80 - (Math.floor(this.text.length / 30) * 16)}px`

    el.style.zIndex = sprite.z
    el.className = `blocklike-${type}`

    let iel = null
    if (type === 'ask') {
      iel = askInput(sprite, el)
      el.style.top = `${((sprite.stageHeight / 2) + y) - 110 - (Math.floor(this.text.length / 30) * 16)}px`
    }

    sprite.element.el.parentNode.insertBefore(el, sprite.element.el)
    iel ? iel.focus() : null

    el.style.visibility = `${(sprite.showing ? 'visible' : 'hidden')}`

    this.el = el
  }

  /**
  * update - updated the DOM element (moves with sprite).
  *
  * @param {object} sprite - the sprite to which the ui is attached.
  */
  update (sprite) {
    const el = sprite.textui.el

    // Convert the center based x coordinate to a left based one.
    const x = sprite.x - (sprite.width / 2)
    // Convert the center based y coordinate to a left based one.
    const y = (sprite.y * -1) - (sprite.height / 2)

    // looks
    // TODO: make this nicer...
    el.style.left = `${(sprite.stageWidth / 2) + x + (sprite.width * 0.6)}px`
    el.style.top = `${((sprite.stageHeight / 2) + y) - 80 - (Math.floor(this.text.length / 30) * 16)}px`

    if (sprite.textui.type === 'ask') {
      el.style.top = `${((sprite.stageHeight / 2) + y) - 110 - (Math.floor(this.text.length / 30) * 16)}px`
    }

    el.style.visibility = `${(sprite.showing ? 'visible' : 'hidden')}`
  }

  /**
  * delete - deletes the DOM element (hides it).
  *
  * @param {object} sprite - the sprite to which the ui is attached.
  */
  delete (sprite) {
    const el = sprite.textui.el

    el.parentNode.removeChild(el)
    return null
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!********************!*\
  !*** ./src/lib.js ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Backdrop": () => (/* reexport safe */ _backdrop__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   "Costume": () => (/* reexport safe */ _costume__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   "Sprite": () => (/* reexport safe */ _sprite__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   "Stage": () => (/* reexport safe */ _stage__WEBPACK_IMPORTED_MODULE_2__["default"])
/* harmony export */ });
/* harmony import */ var _document_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./document-css */ "./src/document-css.js");
/* harmony import */ var _platforms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./platforms */ "./src/platforms.js");
/* harmony import */ var _stage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stage */ "./src/stage.js");
/* harmony import */ var _backdrop__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./backdrop */ "./src/backdrop.js");
/* harmony import */ var _sprite__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./sprite */ "./src/sprite.js");
/* harmony import */ var _costume__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./costume */ "./src/costume.js");
/**
* BlockLike.js
*
* BlockLike.js is an educational JavaScript library.
* It bridges the gap between block-based and text-based programming.
*
* BlockLike.js is designed following Scratch concepts, methods and patterns.
* The screen is a centered stage. Interaction is with Sprites.
* Code is executed in a "paced" manner.
* Scratch block code and BlockLike.js text code are meant to be
* as literally similar as possible.
*
* BlockLike.js is written in ES6/ES7 flavored JavaScript.
* It is environment independent.
* It can be used anywhere modern JavaScript runs.
*
* @author Yaron (Ron) Ilan
* @email blocklike@ronilan.com
*
* Copyright 2018
* Fabriqué au Canada : Made in Canada
*/




 // eslint-disable-line no-unused-vars
 // eslint-disable-line no-unused-vars
 // eslint-disable-line no-unused-vars
 // eslint-disable-line no-unused-vars






(function init () {
  const style = document.createElement('style')

  style.type = 'text/css'
  style.innerHTML = `
    ${_document_css__WEBPACK_IMPORTED_MODULE_0__.defaultCSS}\n\n 
    ${_document_css__WEBPACK_IMPORTED_MODULE_0__.uiCSS}\n\n 
    ${_document_css__WEBPACK_IMPORTED_MODULE_0__.thinkCSS}\n\n 
    ${_document_css__WEBPACK_IMPORTED_MODULE_0__.sayCSS} \n\n 
    ${_document_css__WEBPACK_IMPORTED_MODULE_0__.askCSS}`

  document.getElementsByTagName('head')[0].appendChild(style)

  ;(0,_platforms__WEBPACK_IMPORTED_MODULE_1__["default"])()
}())

})();

blockLike = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkM7QUFDN0MsNkNBQTZDO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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S0FBSztBQUNqQjtBQUNBO0FBQ0E7QUFDQSxjQUFjLFdBQVcsS0FBSyxNQUFNO0FBQ3BDLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFVBQVU7QUFDdEIsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxxREFBTztBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFVBQVU7QUFDdEIsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxVQUFVO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxVQUFVO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksVUFBVTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxVQUFVO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxVQUFVO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvRUFBb0UsZ0JBQWdCO0FBQ3BGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxVQUFVO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLGlCQUFpQjtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1GQUFtRixVQUFVLHFCQUFxQjtBQUNsSDtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQSxnREFBZ0QsVUFBVSxTQUFTO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0QsVUFBVSxTQUFTO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQSxJQUFJLGtEQUFZO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixnREFBTztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUVBQW1FLFFBQVEsS0FBSyxlQUFlO0FBQy9GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxVQUFVO0FBQ3RCO0FBQ0E7QUFDQSx3REFBd0QsUUFBUTtBQUNoRTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsUUFBUTtBQUN0QixlQUFlLFFBQVE7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsUUFBUTtBQUN0QixjQUFjLFFBQVE7QUFDdEIsY0FBYyxRQUFRO0FBQ3RCLGNBQWMsUUFBUTtBQUN0QixlQUFlLFFBQVE7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixRQUFRO0FBQ3hCLGlCQUFpQixRQUFRO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxRQUFRO0FBQ3RCLGNBQWMsUUFBUTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUUsd0RBQWE7QUFDdEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUUsd0RBQWE7QUFDdEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxRQUFRO0FBQ3BCO0FBQ0EsNkNBQTZDO0FBQzdDO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUUsd0RBQWE7QUFDdEY7QUFDQTtBQUNBLGlEQUFpRCxRQUFRLEdBQUcsU0FBUztBQUNyRTtBQUNBLHNEQUFzRCxNQUFNLEdBQUcsU0FBUztBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsY0FBYztBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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LENBQUM7QUFDeEIsTUFBTSxnREFBWSxDQUFDO0FBQ25CLE1BQU0sbURBQWUsQ0FBQztBQUN0QixNQUFNLGlEQUFhLEVBQUU7QUFDckIsTUFBTSxpREFBYSxDQUFDO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLEVBQUUsdURBQVM7QUFDWCxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmxvY2tMaWtlLy4vc3JjL2JhY2tkcm9wLmpzIiwid2VicGFjazovL2Jsb2NrTGlrZS8uL3NyYy9jb2xsaXNpb24tZGV0ZWN0b3IuanMiLCJ3ZWJwYWNrOi8vYmxvY2tMaWtlLy4vc3JjL2Nvc3R1bWUuanMiLCJ3ZWJwYWNrOi8vYmxvY2tMaWtlLy4vc3JjL2RvY3VtZW50LWNzcy5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvZWxlbWVudC1jc3MuanMiLCJ3ZWJwYWNrOi8vYmxvY2tMaWtlLy4vc3JjL2VudGl0eS5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvbG9vay5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvcGxhdGZvcm1zLmpzIiwid2VicGFjazovL2Jsb2NrTGlrZS8uL3NyYy9yZXdyaXRlci5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvc3ByaXRlLWVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vYmxvY2tMaWtlLy4vc3JjL3Nwcml0ZS5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvc3RhZ2UtZWxlbWVudC5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvc3RhZ2Utc2Vuc2luZy5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvc3RhZ2Utc3VyZmFjZS5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvc3RhZ2UuanMiLCJ3ZWJwYWNrOi8vYmxvY2tMaWtlLy4vc3JjL3RleHQtdWktZWxlbWVudC5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2Uvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYmxvY2tMaWtlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9ibG9ja0xpa2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9ibG9ja0xpa2Uvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvbGliLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb29rIGZyb20gJy4vbG9vaydcclxuXHJcbi8qKlxyXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBCYWNrZHJvcC5cclxuICogQmFja2Ryb3BzIGNhbiBiZSBhZGRlZCB0byB0aGUgU3RhZ2UuXHJcbiAqIEBleHRlbmRzIExvb2tcclxuICpcclxuICogQGV4YW1wbGVcclxuICogbGV0IGJhY2tkcm9wID0gbmV3IGJsb2NrTGlrZS5CYWNrZHJvcCgpO1xyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBsZXQgYmFja2Ryb3AgPSBuZXcgYmxvY2tMaWtlLkJhY2tkcm9wKHtcclxuICogICBpbWFnZTogJ2h0dHBzOi8vd3d3LmJsb2NrbGlrZS5vcmcvaW1hZ2VzL2JhY2tkcm9wLnN2ZydcclxuICogfSk7XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGxldCBiYWNrZHJvcCA9IG5ldyBibG9ja0xpa2UuQmFja2Ryb3Aoe1xyXG4gKiAgIGNvbG9yOiAnI0EyREFGRidcclxuICogfSk7XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYWNrZHJvcCBleHRlbmRzIExvb2sge1xyXG4gIC8qKlxyXG4gICogY29uc3RydWN0b3IgLSBDcmVhdGVzIGEgQmFja2Ryb3AgdG8gYmUgdXNlZCBieSBTdGFnZSBvYmplY3RzLlxyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gb3B0aW9ucyBmb3IgdGhlIGJhY2tkcm9wLlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuaW1hZ2UgLSBhIFVSSSAob3IgZGF0YSBVUkkpIGZvciB0aGUgYmFja2Ryb3AgaW1hZ2UuXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jb2xvciAtIGEgY3NzIGNvbG9yIHN0cmluZyAoJyNmZjAwMDAnLCAncmVkJylcclxuICAqL1xyXG4gIGNvbnN0cnVjdG9yIChvcHRpb25zID0ge30pIHtcclxuICAgIGNvbnN0IGRlZmF1bHRzID0ge31cclxuICAgIGNvbnN0IGFjdHVhbCA9IHsgLi4uZGVmYXVsdHMsIC4uLm9wdGlvbnMgfVxyXG5cclxuICAgIHN1cGVyKClcclxuXHJcbiAgICB0aGlzLmltYWdlID0gYWN0dWFsLmltYWdlXHJcbiAgICB0aGlzLmNvbG9yID0gYWN0dWFsLmNvbG9yXHJcblxyXG4gICAgLy8gcHJlbG9hZFxyXG4gICAgaWYgKHRoaXMuaW1hZ2UpIHtcclxuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgd2luZG93LkltYWdlKClcclxuICAgICAgaW1hZ2Uuc3JjID0gdGhpcy5pbWFnZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFNldHVwIEFjdGlvbnMgKiAqL1xyXG5cclxuICAvKipcclxuICAqIGFkZFRvIC0gQWRkcyB0aGUgYmFja2Ryb3AgdG8gdGhlIHN0YWdlXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBiYWNrZHJvcCA9IG5ldyBibG9ja0xpa2UuQmFja2Ryb3AoKTtcclxuICAqXHJcbiAgKiBiYWNrZHJvcC5hZGRUbyhzdGFnZSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHN0YWdlIC0gd2hpY2ggc3RhZ2UgdG8gYWRkIHRoZSBiYWNrZHJvcCB0b28uXHJcbiAgKi9cclxuICBhZGRUbyAoc3RhZ2UpIHtcclxuICAgIGNvbnN0IGN1clN0YWdlID0gc3RhZ2VcclxuICAgIHN0YWdlLmJhY2tkcm9wcy5wdXNoKHRoaXMpXHJcbiAgICAvLyBpZiBcImJhcmVcIiBzZXQgdGhlIGFkZGVkIGFzIGFjdGl2ZVxyXG4gICAgIXN0YWdlLmJhY2tkcm9wID8gY3VyU3RhZ2UuYmFja2Ryb3AgPSBzdGFnZS5iYWNrZHJvcHNbMF0gOiBudWxsXHJcbiAgICBzdGFnZS5lbGVtZW50ID8gc3RhZ2UuZWxlbWVudC51cGRhdGUoc3RhZ2UpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiByZW1vdmVGcm9tIC0gUmVtb3ZlcyB0aGUgYmFja2Ryb3AgdG8gdGhlIHN0YWdlXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBiYWNrZHJvcCA9IG5ldyBibG9ja0xpa2UuQmFja2Ryb3AoKTtcclxuICAqXHJcbiAgKiBiYWNrZHJvcC5hZGRUbyhzdGFnZSk7XHJcbiAgKiBiYWNrZHJvcC5yZW1vdmVGcm9tKHN0YWdlKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3RhZ2UgLSB3aGljaCBzdGFnZSB0byByZW1vdmUgdGhlIGJhY2tkcm9wIGZyb20uXHJcbiAgKi9cclxuICByZW1vdmVGcm9tIChzdGFnZSkge1xyXG4gICAgc3RhZ2UucmVtb3ZlQmFja2Ryb3AodGhpcylcclxuICB9XHJcbn1cclxuIiwiY2xhc3MgQ29sbGlzb25EZXRlY3RvciB7XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5zdGFnZSA9IG51bGxcclxuICAgIHRoaXMuY3VycmVudFNwcml0ZUJpdG1hcHMgPSB7fVxyXG5cclxuICAgIHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTEgPSB7XHJcbiAgICAgIHc6IDAsXHJcbiAgICAgIGg6IDBcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUyID0ge1xyXG4gICAgICB3OiAwLFxyXG4gICAgICBoOiAwXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jb2xsaXNvbkNhbnZhc0VsZW1lbnQxID0gbnVsbFxyXG4gICAgdGhpcy5jb2xsaXNvbkNhbnZhc0NvbnRleHQxID0gbnVsbFxyXG4gICAgdGhpcy5jb2xsaXNvbkNhbnZhc0VsZW1lbnQyID0gbnVsbFxyXG4gICAgdGhpcy5jb2xsaXNvbkNhbnZhc0NvbnRleHQyID0gbnVsbFxyXG5cclxuICAgIHRoaXMuZWRnZUNhbnZhc1NpemUgPSB7XHJcbiAgICAgIHc6IDAsXHJcbiAgICAgIGg6IDBcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmVkZ2VDYW52YXNFbGVtZW50ID0gbnVsbFxyXG4gICAgdGhpcy5lZGdlQ2FudmFzQ29udGV4dCA9IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7U3RhZ2V9IHN0YWdlXHJcbiAgICogQHJldHVybnNcclxuICAgKi9cclxuICBpbml0IChzdGFnZSkge1xyXG4gICAgdGhpcy5zdGFnZSA9IHN0YWdlXHJcblxyXG4gICAgdGhpcy5jb2xsaXNpb25DYW52YXNTaXplMSA9IHtcclxuICAgICAgdzogdGhpcy5zdGFnZS53aWR0aCxcclxuICAgICAgaDogdGhpcy5zdGFnZS5oZWlnaHRcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUyID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUxKSlcclxuXHJcbiAgICB0aGlzLmVkZ2VDYW52YXNTaXplID0geyAvLyAycHggYmlnZ2VyIHNvIHdlIGNhbiBjaGVjayB0aGUgZWRnZSBmb3IgdmlzaWJsZSBwaXhlbHNcclxuICAgICAgdzogdGhpcy5zdGFnZS53aWR0aCArIDIsXHJcbiAgICAgIGg6IHRoaXMuc3RhZ2UuaGVpZ2h0ICsgMlxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNyZWF0ZUNvbGxpc2lvbkNhbnZhczEgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcclxuXHJcbiAgICAgIGVsLmlkID0gJ2NvbGxpc2lvbkNhbnZhczEnXHJcbiAgICAgIGVsLndpZHRoID0gdGhpcy5jb2xsaXNpb25DYW52YXNTaXplMS53XHJcbiAgICAgIGVsLmhlaWdodCA9IHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTEuaFxyXG4gICAgICBlbC5zdHlsZS56SW5kZXggPSAwXHJcbiAgICAgIGVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICBlbC5zdHlsZS5sZWZ0ID0gJzBweCdcclxuICAgICAgZWwuc3R5bGUudG9wID0gdGhpcy5zdGFnZS5oZWlnaHRcclxuXHJcbiAgICAgIHRoaXMuY29sbGlzb25DYW52YXNFbGVtZW50MSA9IGVsXHJcbiAgICAgIHRoaXMuY29sbGlzb25DYW52YXNDb250ZXh0MSA9IHRoaXMuY29sbGlzb25DYW52YXNFbGVtZW50MS5nZXRDb250ZXh0KCcyZCcpXHJcblxyXG4gICAgICByZXR1cm4gZWxcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjcmVhdGVDb2xsaXNpb25DYW52YXMyID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcblxyXG4gICAgICBlbC5pZCA9ICdjb2xsaXNpb25DYW52YXMyJ1xyXG4gICAgICBlbC53aWR0aCA9IHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTIud1xyXG4gICAgICBlbC5oZWlnaHQgPSB0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUyLmhcclxuICAgICAgZWwuc3R5bGUuekluZGV4ID0gMFxyXG4gICAgICBlbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcclxuICAgICAgZWwuc3R5bGUubGVmdCA9ICcwcHgnXHJcbiAgICAgIGVsLnN0eWxlLnRvcCA9IHRoaXMuc3RhZ2UuaGVpZ2h0XHJcblxyXG4gICAgICB0aGlzLmNvbGxpc29uQ2FudmFzRWxlbWVudDIgPSBlbFxyXG4gICAgICB0aGlzLmNvbGxpc29uQ2FudmFzQ29udGV4dDIgPSB0aGlzLmNvbGxpc29uQ2FudmFzRWxlbWVudDIuZ2V0Q29udGV4dCgnMmQnKVxyXG5cclxuICAgICAgcmV0dXJuIGVsXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY3JlYXRlRWRnZUNhbnZhcyA9ICgpID0+IHtcclxuICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxyXG5cclxuICAgICAgZWwuaWQgPSAnZWRnZUNhbnZhcydcclxuICAgICAgZWwud2lkdGggPSB0aGlzLmVkZ2VDYW52YXNTaXplLndcclxuICAgICAgZWwuaGVpZ2h0ID0gdGhpcy5lZGdlQ2FudmFzU2l6ZS5oXHJcbiAgICAgIGVsLnN0eWxlLnpJbmRleCA9IDBcclxuICAgICAgZWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgIGVsLnN0eWxlLmxlZnQgPSAnMHB4J1xyXG4gICAgICBlbC5zdHlsZS50b3AgPSB0aGlzLnN0YWdlLmhlaWdodFxyXG5cclxuICAgICAgdGhpcy5lZGdlQ2FudmFzRWxlbWVudCA9IGVsXHJcbiAgICAgIHRoaXMuZWRnZUNhbnZhc0NvbnRleHQgPSB0aGlzLmVkZ2VDYW52YXNFbGVtZW50LmdldENvbnRleHQoJzJkJywgeyB3aWxsUmVhZEZyZXF1ZW50bHk6IHRydWUgfSlcclxuXHJcbiAgICAgIHJldHVybiBlbFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZU5TKCcqJywgJ2JvZHknKVswXVxyXG4gICAgYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nXHJcblxyXG4gICAgYm9keS5hcHBlbmRDaGlsZChjcmVhdGVDb2xsaXNpb25DYW52YXMxKCkpXHJcbiAgICBib2R5LmFwcGVuZENoaWxkKGNyZWF0ZUNvbGxpc2lvbkNhbnZhczIoKSlcclxuICAgIGJvZHkuYXBwZW5kQ2hpbGQoY3JlYXRlRWRnZUNhbnZhcygpKVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBhc3luYyByZWZyZXNoU3ByaXRlQml0bWFwQ2FjaGUgKCkge1xyXG4gICAgY29uc3Qgc3ByaXRlcyA9IHRoaXMuc3RhZ2Uuc3ByaXRlc1xyXG4gICAgdGhpcy5jdXJyZW50U3ByaXRlQml0bWFwcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcHJpdGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IHNwcml0ZSA9IHNwcml0ZXNbaV1cclxuICAgICAgY29uc3QgaW1hZ2VVcmwgPSBzcHJpdGUuY29zdHVtZS5pbWFnZVxyXG4gICAgICBpZiAoaW1hZ2VVcmwgPT09ICcnKSBjb250aW51ZSAvLyBubyBjb3N0dW1lIGZvciBzcHJpdGVcclxuICAgICAgY29uc3QgaW1hZ2UgPSBhd2FpdCB0aGlzLmxvYWRJbWFnZUZyb21VcmwoaW1hZ2VVcmwpXHJcblxyXG4gICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxyXG5cclxuICAgICAgY2FudmFzLndpZHRoID0gc3ByaXRlLndpZHRoXHJcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBzcHJpdGUuaGVpZ2h0XHJcbiAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcblxyXG4gICAgICBjb25zdCByYXRpbyA9IGltYWdlLndpZHRoIC8gaW1hZ2UuaGVpZ2h0XHJcbiAgICAgIGxldCBkcmF3V2lkdGggPSBpbWFnZS53aWR0aFxyXG4gICAgICBsZXQgZHJhd0hlaWdodCA9IGltYWdlLmhlaWdodFxyXG4gICAgICBpZiAoaW1hZ2Uud2lkdGggLyBzcHJpdGUud2lkdGggPiBpbWFnZS5oZWlnaHQgLyBzcHJpdGUuaGVpZ2h0KSB7XHJcbiAgICAgICAgZHJhd1dpZHRoID0gc3ByaXRlLndpZHRoXHJcbiAgICAgICAgZHJhd0hlaWdodCA9IHNwcml0ZS53aWR0aCAvIHJhdGlvXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZHJhd1dpZHRoID0gc3ByaXRlLmhlaWdodCAqIHJhdGlvXHJcbiAgICAgICAgZHJhd0hlaWdodCA9IHNwcml0ZS5oZWlnaHRcclxuICAgICAgfVxyXG5cclxuICAgICAgY3R4LnRyYW5zbGF0ZShjYW52YXMud2lkdGggLyAyLCBjYW52YXMuaGVpZ2h0IC8gMilcclxuICAgICAgY3R4LnJvdGF0ZSgoc3ByaXRlLmRpcmVjdGlvbiAtIDkwKSAqIE1hdGguUEkgLyAxODApXHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIC1kcmF3V2lkdGggLyAyLCAtZHJhd0hlaWdodCAvIDIsIGRyYXdXaWR0aCwgZHJhd0hlaWdodClcclxuICAgICAgY29uc3QgYml0bWFwRGF0YSA9IGNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpXHJcblxyXG4gICAgICBhd2FpdCB0aGlzLnNhdmVJbWFnZUZyb21CaXRtYXAoXHJcbiAgICAgICAgaW1hZ2VVcmwsXHJcbiAgICAgICAgYml0bWFwRGF0YSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB3OiBzcHJpdGUud2lkdGgsXHJcbiAgICAgICAgICBoOiBzcHJpdGUuaGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29uc29sZS5sb2coJ0dlbmVyYXRlZCBCaXRtYXBzJywgdGhpcy5jdXJyZW50U3ByaXRlQml0bWFwcylcclxuICB9XHJcblxyXG4gIGFzeW5jIHNhdmVJbWFnZUZyb21CaXRtYXAgKHVybCwgYml0bWFwRGF0YSwgc2l6ZURhdGEpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgY29uc3QgaW1hZ2VEYXRhID0gbmV3IEltYWdlKClcclxuICAgICAgaW1hZ2VEYXRhLnNyYyA9IGJpdG1hcERhdGFcclxuICAgICAgaW1hZ2VEYXRhLm9ubG9hZCA9IGFzeW5jICgpID0+IHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTcHJpdGVCaXRtYXBzW3VybF0gPSB7XHJcbiAgICAgICAgICBkYXRhOiBhd2FpdCBjcmVhdGVJbWFnZUJpdG1hcChpbWFnZURhdGEpLFxyXG4gICAgICAgICAgLi4uc2l6ZURhdGFcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzb2x2ZSgpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBhc3luYyBsb2FkSW1hZ2VGcm9tVXJsICh1cmwpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoJ2Nyb3NzT3JpZ2luJywgJ2Fub255bW91cycpXHJcbiAgICAgIGltYWdlLnNyYyA9IHVybFxyXG4gICAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgcmVzb2x2ZShpbWFnZSlcclxuICAgICAgfVxyXG4gICAgICBpbWFnZS5vbmVycm9yID0gKCkgPT4ge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBkb1Nwcml0ZXNPdmVybGFwIChzcHJpdGVEYXRhMSwgc3ByaXRlRGF0YTIpIHtcclxuICAgIGNvbnN0IHNwcml0ZUJpdG1hcDEgPSB0aGlzLmN1cnJlbnRTcHJpdGVCaXRtYXBzW3Nwcml0ZURhdGExLmltYWdlXVxyXG4gICAgY29uc3Qgc3ByaXRlQml0bWFwMiA9IHRoaXMuY3VycmVudFNwcml0ZUJpdG1hcHNbc3ByaXRlRGF0YTIuaW1hZ2VdXHJcblxyXG4gICAgaWYgKCFzcHJpdGVCaXRtYXAxIHx8ICFzcHJpdGVCaXRtYXAxLmRhdGEgfHwgIXNwcml0ZUJpdG1hcDIgfHwgIXNwcml0ZUJpdG1hcDIuZGF0YSkgcmV0dXJuIGZhbHNlIC8vIGRvZXMgbm90IGhhdmUgaW1hZ2UgZGF0YVxyXG5cclxuICAgIHNwcml0ZURhdGExLnggPSBzcHJpdGVEYXRhMS54IC0gKHNwcml0ZURhdGExLncgLyAyKVxyXG4gICAgc3ByaXRlRGF0YTEueSA9IChzcHJpdGVEYXRhMS55ICogLTEpIC0gKHNwcml0ZURhdGExLmggLyAyKVxyXG5cclxuICAgIHNwcml0ZURhdGEyLnggPSBzcHJpdGVEYXRhMi54IC0gKHNwcml0ZURhdGEyLncgLyAyKVxyXG4gICAgc3ByaXRlRGF0YTIueSA9IChzcHJpdGVEYXRhMi55ICogLTEpIC0gKHNwcml0ZURhdGEyLmggLyAyKVxyXG5cclxuICAgIC8vIGNoZWNrIGlmIHRoZXkgb3ZlcmxhcFxyXG4gICAgaWYgKFxyXG4gICAgICBzcHJpdGVEYXRhMS54ID4gc3ByaXRlRGF0YTIueCArIHNwcml0ZURhdGEyLncgfHxcclxuICAgICAgc3ByaXRlRGF0YTEueCArIHNwcml0ZURhdGExLncgPCBzcHJpdGVEYXRhMi54IHx8XHJcbiAgICAgIHNwcml0ZURhdGExLnkgPiBzcHJpdGVEYXRhMi55ICsgc3ByaXRlRGF0YTIuaCB8fFxyXG4gICAgICBzcHJpdGVEYXRhMS55ICsgc3ByaXRlRGF0YTEuaCA8IHNwcml0ZURhdGEyLnlcclxuICAgICkgcmV0dXJuIGZhbHNlIC8vIG5vIG92ZXJsYXBcclxuXHJcbiAgICAvLyBzaXplIG9mIG92ZXJsYXBwaW5nIGFyZWFcclxuICAgIC8vIGZpbmQgbGVmdCBlZGdlXHJcbiAgICBjb25zdCBheCA9IHNwcml0ZURhdGExLnggPCBzcHJpdGVEYXRhMi54ID8gc3ByaXRlRGF0YTIueCA6IHNwcml0ZURhdGExLnhcclxuICAgIC8vIGZpbmQgcmlnaHQgZWRnZSBjYWxjdWxhdGUgd2lkdGhcclxuICAgIGxldCBhdyA9IHNwcml0ZURhdGExLnggKyBzcHJpdGVEYXRhMS53IDwgc3ByaXRlRGF0YTIueCArIHNwcml0ZURhdGEyLncgPyAoc3ByaXRlRGF0YTEueCArIHNwcml0ZURhdGExLncpIC0gYXggOiAoc3ByaXRlRGF0YTIueCArIHNwcml0ZURhdGEyLncpIC0gYXhcclxuICAgIC8vIGRvIHRoZSBzYW1lIGZvciB0b3AgYW5kIGJvdHRvbVxyXG4gICAgY29uc3QgYXkgPSBzcHJpdGVEYXRhMS55IDwgc3ByaXRlRGF0YTIueSA/IHNwcml0ZURhdGEyLnkgOiBzcHJpdGVEYXRhMS55XHJcbiAgICBsZXQgYWggPSBzcHJpdGVEYXRhMS55ICsgc3ByaXRlRGF0YTEuaCA8IHNwcml0ZURhdGEyLnkgKyBzcHJpdGVEYXRhMi5oID8gKHNwcml0ZURhdGExLnkgKyBzcHJpdGVEYXRhMS5oKSAtIGF5IDogKHNwcml0ZURhdGEyLnkgKyBzcHJpdGVEYXRhMi5oKSAtIGF5XHJcblxyXG4gICAgaWYgKGF3IDwgMSB8fCBhaCA8IDEpIHJldHVybiBmYWxzZSAvLyBubyBvdmVybGFwLCBvbiBlZGdlXHJcblxyXG4gICAgdGhpcy5jb2xsaXNvbkNhbnZhc0NvbnRleHQxLmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUxLncsIHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTEuaClcclxuICAgIHRoaXMuY29sbGlzb25DYW52YXNDb250ZXh0Mi5jbGVhclJlY3QoMCwgMCwgdGhpcy5jb2xsaXNpb25DYW52YXNTaXplMi53LCB0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUyLmgpXHJcblxyXG4gICAgLy8gcmVzaXplXHJcbiAgICB0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUxID0gT2JqZWN0LmFzc2lnbih7fSwge1xyXG4gICAgICB3OiBhdyxcclxuICAgICAgaDogYWhcclxuICAgIH0pXHJcbiAgICB0aGlzLmNvbGxpc29uQ2FudmFzRWxlbWVudDEud2lkdGggPSBhd1xyXG4gICAgdGhpcy5jb2xsaXNvbkNhbnZhc0VsZW1lbnQxLmhlaWdodCA9IGFoXHJcbiAgICB0aGlzLmNvbGxpc29uQ2FudmFzQ29udGV4dDEgPSB0aGlzLmNvbGxpc29uQ2FudmFzRWxlbWVudDEuZ2V0Q29udGV4dCgnMmQnKVxyXG5cclxuICAgIC8vIGRyYXcgdGhlIGZpcnN0IGltYWdlIHJlbGF0aXZlIHRvIHRoZSBvdmVybGFwIGFyZWFcclxuICAgIHRoaXMuY29sbGlzb25DYW52YXNDb250ZXh0MS5kcmF3SW1hZ2Uoc3ByaXRlQml0bWFwMS5kYXRhLCBzcHJpdGVEYXRhMS54IC0gYXgsIHNwcml0ZURhdGExLnkgLSBheSlcclxuICAgIC8vIG9ubHkgcGl4ZWxzIHdpbGwgcmVtYWluIGlmIGJvdGggaW1hZ2VzIGFyZSBub3QgdHJhc3BhcmVudFxyXG4gICAgdGhpcy5jb2xsaXNvbkNhbnZhc0NvbnRleHQxLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1pbidcclxuICAgIHRoaXMuY29sbGlzb25DYW52YXNDb250ZXh0MS5kcmF3SW1hZ2Uoc3ByaXRlQml0bWFwMi5kYXRhLCBzcHJpdGVEYXRhMi54IC0gYXgsIHNwcml0ZURhdGEyLnkgLSBheSlcclxuXHJcbiAgICAvLyBub3cgZHJhdyBvdmVyIGl0cyBzZWxmIHRvIGFtcGxpZnkgYW55IHBpeGVscyB0aGF0IGhhdmUgbG93IGFscGhhXHJcbiAgICB0aGlzLmNvbGxpc29uQ2FudmFzQ29udGV4dDEuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJ1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSsrKSB7XHJcbiAgICAgIHRoaXMuY29sbGlzb25DYW52YXNDb250ZXh0MS5kcmF3SW1hZ2UodGhpcy5jb2xsaXNvbkNhbnZhc0VsZW1lbnQxLCAwLCAwKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNldCBjYW52YXMgMiBzaXplXHJcbiAgICB0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUyID0gT2JqZWN0LmFzc2lnbih7fSwge1xyXG4gICAgICB3OiBNYXRoLm1heCgxLCBNYXRoLmZsb29yKGF3IC8gOCkpLFxyXG4gICAgICBoOiBNYXRoLm1heCgxLCBNYXRoLmZsb29yKGFoIC8gOCkpXHJcbiAgICB9KVxyXG5cclxuICAgIGxldCBydyA9IHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTIud1xyXG4gICAgbGV0IHJoID0gdGhpcy5jb2xsaXNpb25DYW52YXNTaXplMi5oXHJcbiAgICB0aGlzLmNvbGxpc29uQ2FudmFzRWxlbWVudDIud2lkdGggPSByd1xyXG4gICAgdGhpcy5jb2xsaXNvbkNhbnZhc0VsZW1lbnQyLmhlaWdodCA9IHJoXHJcbiAgICB0aGlzLmNvbGxpc29uQ2FudmFzQ29udGV4dDIgPSB0aGlzLmNvbGxpc29uQ2FudmFzRWxlbWVudDIuZ2V0Q29udGV4dCgnMmQnKVxyXG5cclxuICAgIHdoaWxlIChydyA+IDggJiYgcmggPiA4KSB7XHJcbiAgICAgIC8vIGRyYXcgdGhlIG1hc2sgaW1hZ2Ugc2V2ZXJhbCB0aW1lc1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDMyOyBpKyspIHtcclxuICAgICAgICB0aGlzLmNvbGxpc29uQ2FudmFzQ29udGV4dDIuZHJhd0ltYWdlKFxyXG4gICAgICAgICAgdGhpcy5jb2xsaXNvbkNhbnZhc0VsZW1lbnQxLFxyXG4gICAgICAgICAgMCwgMCwgYXcsIGFoLFxyXG4gICAgICAgICAgTWF0aC5yYW5kb20oKSxcclxuICAgICAgICAgIE1hdGgucmFuZG9tKCksXHJcbiAgICAgICAgICBydywgcmhcclxuICAgICAgICApXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGNsZWFyIG1haW4gY2FudmFzXHJcbiAgICAgIHRoaXMuY29sbGlzb25DYW52YXNDb250ZXh0MS5jbGVhclJlY3QoMCwgMCwgYXcsIGFoKVxyXG5cclxuICAgICAgLy8gc2V0IHRoZSBuZXcgc2l6ZVxyXG4gICAgICBhdyA9IHJ3XHJcbiAgICAgIGFoID0gcmhcclxuXHJcbiAgICAgIC8vIGRyYXcgdGhlIHNtYWxsIGNvcHkgb250byBvcmlnaW5hbFxyXG4gICAgICB0aGlzLmNvbGxpc29uQ2FudmFzQ29udGV4dDEuZHJhd0ltYWdlKHRoaXMuY29sbGlzb25DYW52YXNFbGVtZW50MiwgMCwgMClcclxuXHJcbiAgICAgIHRoaXMuY29sbGlzb25DYW52YXNDb250ZXh0Mi5jbGVhclJlY3QoMCwgMCwgdGhpcy5jb2xsaXNpb25DYW52YXNTaXplMi53LCB0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUyLmgpXHJcblxyXG4gICAgICBydyA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IoYXcgLyA4KSlcclxuICAgICAgcmggPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKGFoIC8gOCkpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuY2hlY2tDb2xsaXNvblBpeGVscyhhdywgYWgpXHJcbiAgfVxyXG5cclxuICBjaGVja0NvbGxpc29uUGl4ZWxzICh3LCBoKSB7XHJcbiAgICBjb25zdCBpbWFnZURhdGEgPSBuZXcgVWludDMyQXJyYXkodGhpcy5jb2xsaXNvbkNhbnZhc0NvbnRleHQxLmdldEltYWdlRGF0YSgwLCAwLCB3LCBoKS5kYXRhLmJ1ZmZlcilcclxuICAgIGxldCBpID0gMFxyXG4gICAgLy8gaWYgYW55IHBpeGVsIGlzIG5vdCB6ZXJvIHRoZW4gdGhlcmUgbXVzdCBiZSBhbiBvdmVybGFwXHJcbiAgICB3aGlsZSAoaSA8IGltYWdlRGF0YS5sZW5ndGgpIHtcclxuICAgICAgaWYgKGltYWdlRGF0YVtpKytdICE9PSAwKSByZXR1cm4gdHJ1ZVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG5cclxuICBpc1Nwcml0ZVRvdWNoaW5nRWRnZSAoc3ByaXRlRGF0YSkge1xyXG4gICAgY29uc3Qgc3ByaXRlQml0bWFwID0gdGhpcy5jdXJyZW50U3ByaXRlQml0bWFwc1tzcHJpdGVEYXRhLmltYWdlXVxyXG4gICAgaWYgKCFzcHJpdGVCaXRtYXAgfHwgIXNwcml0ZUJpdG1hcC5kYXRhKSB7XHJcbiAgICAgIHJldHVybiBudWxsIC8vIGRvZXMgbm90IGhhdmUgaW1hZ2UgZGF0YVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChcclxuICAgICAgIShcclxuICAgICAgICAoc3ByaXRlRGF0YS54KSArIChzcHJpdGVEYXRhLncgLyAyKSA+IHRoaXMuZWRnZUNhbnZhc1NpemUudyAvIDIgfHxcclxuICAgICAgICAoc3ByaXRlRGF0YS54KSAtIChzcHJpdGVEYXRhLncgLyAyKSA8IC0xICogKHRoaXMuZWRnZUNhbnZhc1NpemUudyAvIDIpIHx8XHJcbiAgICAgICAgKHNwcml0ZURhdGEueSkgKyAoc3ByaXRlRGF0YS5oIC8gMikgPiB0aGlzLmVkZ2VDYW52YXNTaXplLmggLyAyIHx8XHJcbiAgICAgICAgKHNwcml0ZURhdGEueSkgLSAoc3ByaXRlRGF0YS5oIC8gMikgPCAtMSAqICh0aGlzLmVkZ2VDYW52YXNTaXplLmggLyAyKVxyXG4gICAgICApXHJcbiAgICApIHJldHVybiBudWxsIC8vIGJvdW5kaW5nIGJveCBub3QgdG91Y2hpbmcgZWRnZVxyXG5cclxuICAgIC8vIGlmIGJvdW5kaW5nIGJveCBpcyBhbGwgdGhlIHdheSBvdXQgb2YgY2FudmFzIGFuZCBoYXMgc2tpcHBlZCB0aGUgZWRnZSBkZXRlY3QgdGhlbiB0cmVhdCBhcyB0b3VjaGluZ1xyXG4gICAgaWYgKHNwcml0ZURhdGEueCAtIHNwcml0ZURhdGEudyA+IHRoaXMuZWRnZUNhbnZhc1NpemUudyAvIDIpIHJldHVybiAncmlnaHQnXHJcbiAgICBpZiAoc3ByaXRlRGF0YS54ICsgc3ByaXRlRGF0YS53IDwgLTEgKiAodGhpcy5lZGdlQ2FudmFzU2l6ZS53IC8gMikpIHJldHVybiAnbGVmdCdcclxuICAgIGlmIChzcHJpdGVEYXRhLnkgLSBzcHJpdGVEYXRhLmggPiB0aGlzLmVkZ2VDYW52YXNTaXplLmggLyAyKSByZXR1cm4gJ3RvcCdcclxuICAgIGlmIChzcHJpdGVEYXRhLnkgKyBzcHJpdGVEYXRhLmggPCAtMSAqICh0aGlzLmVkZ2VDYW52YXNTaXplLmggLyAyKSkgcmV0dXJuICdib3R0b20nXHJcblxyXG4gICAgc3ByaXRlRGF0YS54ID0gKHRoaXMuZWRnZUNhbnZhc1NpemUudyAvIDIpICsgKHNwcml0ZURhdGEueCAtIChzcHJpdGVEYXRhLncgLyAyKSlcclxuICAgIHNwcml0ZURhdGEueSA9ICh0aGlzLmVkZ2VDYW52YXNTaXplLmggLyAyKSArICgoc3ByaXRlRGF0YS55ICogLTEpIC0gKHNwcml0ZURhdGEuaCAvIDIpKVxyXG5cclxuICAgIHRoaXMuZWRnZUNhbnZhc0NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuZWRnZUNhbnZhc1NpemUudywgdGhpcy5lZGdlQ2FudmFzU2l6ZS5oKVxyXG4gICAgdGhpcy5lZGdlQ2FudmFzQ29udGV4dC5kcmF3SW1hZ2Uoc3ByaXRlQml0bWFwLmRhdGEsIHNwcml0ZURhdGEueCArIDEsIHNwcml0ZURhdGEueSArIDEpIC8vICsxIGJlY2F1c2UgdGhlIGNhbnZhcyBpcyAxIHBpeGVsIGJpZ2dlciBvbiBlYWNoIGVkZ2UgYW5kIGRyYXdzIGZyb20gdG9wIGxlZnRcclxuXHJcbiAgICBpZiAodGhpcy5jaGVja0VkZ2VBcmVhSGFzUGl4ZWxzKDAsIDAsIHRoaXMuZWRnZUNhbnZhc1NpemUudywgMSkpIHJldHVybiAndG9wJ1xyXG4gICAgaWYgKHRoaXMuY2hlY2tFZGdlQXJlYUhhc1BpeGVscygwLCB0aGlzLmVkZ2VDYW52YXNTaXplLmggLSAxLCB0aGlzLmVkZ2VDYW52YXNTaXplLncsIDEpKSByZXR1cm4gJ2JvdHRvbSdcclxuICAgIGlmICh0aGlzLmNoZWNrRWRnZUFyZWFIYXNQaXhlbHMoMCwgMCwgMSwgdGhpcy5lZGdlQ2FudmFzU2l6ZS5oKSkgcmV0dXJuICdsZWZ0J1xyXG4gICAgaWYgKHRoaXMuY2hlY2tFZGdlQXJlYUhhc1BpeGVscyh0aGlzLmVkZ2VDYW52YXNTaXplLncgLSAxLCAwLCAxLCB0aGlzLmVkZ2VDYW52YXNTaXplLmgpKSByZXR1cm4gJ3JpZ2h0J1xyXG5cclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG5cclxuICBjaGVja0VkZ2VBcmVhSGFzUGl4ZWxzIChzeCwgc3ksIHN3LCBzaCkge1xyXG4gICAgY29uc3QgaW1hZ2VEYXRhID0gbmV3IFVpbnQzMkFycmF5KHRoaXMuZWRnZUNhbnZhc0NvbnRleHQuZ2V0SW1hZ2VEYXRhKHN4LCBzeSwgc3csIHNoKS5kYXRhLmJ1ZmZlcilcclxuICAgIGxldCBpID0gMFxyXG4gICAgd2hpbGUgKGkgPCBpbWFnZURhdGEubGVuZ3RoKSB7XHJcbiAgICAgIGlmIChpbWFnZURhdGFbaSsrXSAhPT0gMCkgcmV0dXJuIHRydWVcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgbmV3IENvbGxpc29uRGV0ZWN0b3IoKVxyXG4iLCJpbXBvcnQgTG9vayBmcm9tICcuL2xvb2snXHJcblxyXG4vKipcclxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgQ29zdHVtZS5cclxuICogQ29zdHVtZXMgY2FuIGJlIGFkZGVkIHRvIGEgU3ByaXRlLlxyXG4gKiBAZXh0ZW5kcyBMb29rXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGxldCBjb3N0dW1lID0gbmV3IGJsb2NrTGlrZS5Db3N0dW1lKCk7XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGxldCBjb3N0dW1lID0gbmV3IGJsb2NrTGlrZS5Db3N0dW1lKHtcclxuICogICB3aWR0aDogNTAsXHJcbiAqICAgaGVpZ2h0OiA1MCxcclxuICogICBjb2xvcjogJyNBMkRBRkYnLFxyXG4gKiAgIGltYWdlOiAnaHR0cHM6Ly93d3cuYmxvY2tsaWtlLm9yZy9pbWFnZXMvc2hlZXBfc3RlcC5wbmcnXHJcbiAqIH0pO1xyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29zdHVtZSBleHRlbmRzIExvb2sge1xyXG4gIC8qKlxyXG4gICogY29uc3RydWN0b3IgLSBDcmVhdGVzIGEgQ29zdHVtZSB0byBiZSB1c2VkIGJ5IFNwcml0ZSBvYmplY3RzLi5cclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIG9wdGlvbnMgZm9yIHRoZSBjb3N0dW1lLlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMud2lkdGggLSB0aGUgY29zdHVtZSB3aWR0aCBpbiBwaXhlbHMuIERlZmF1bHQgaXMgMTAwLlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuaGVpZ2h0IC0gdGhlIGNvc3R1bWUgaGVpZ2h0IGluIHBpeGVscy4gRGVmYXVsdCBpcyAxMDAuXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5pbWFnZSAtIGEgVVJJIChvciBkYXRhIFVSSSkgZm9yIHRoZSBjb3N0dW1lIGltYWdlLlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY29sb3IgLSBhIGNzcyBjb2xvciBzdHJpbmcgKCcjZmYwMDAwJywgJ3JlZCcpXHJcbiAgKi9cclxuICBjb25zdHJ1Y3RvciAob3B0aW9ucyA9IHt9KSB7XHJcbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcclxuICAgICAgd2lkdGg6IDEwMCxcclxuICAgICAgaGVpZ2h0OiAxMDAsXHJcbiAgICAgIGNvbG9yOiBudWxsXHJcbiAgICB9XHJcbiAgICBjb25zdCBhY3R1YWwgPSB7IC4uLmRlZmF1bHRzLCAuLi5vcHRpb25zIH1cclxuXHJcbiAgICBzdXBlcigpXHJcblxyXG4gICAgdGhpcy53aWR0aCA9IGFjdHVhbC53aWR0aFxyXG4gICAgdGhpcy5oZWlnaHQgPSBhY3R1YWwuaGVpZ2h0XHJcbiAgICB0aGlzLnZpc2libGVXaWR0aCA9IGFjdHVhbC53aWR0aFxyXG4gICAgdGhpcy52aXNpYmxlSGVpZ2h0ID0gYWN0dWFsLmhlaWdodFxyXG5cclxuICAgIHRoaXMuaW1hZ2UgPSBhY3R1YWwuaW1hZ2VcclxuICAgIHRoaXMuY29sb3IgPSBhY3R1YWwuY29sb3JcclxuXHJcbiAgICAvLyBwcmVsb2FkXHJcbiAgICBpZiAodGhpcy5pbWFnZSkge1xyXG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyB3aW5kb3cuSW1hZ2UoKVxyXG4gICAgICBpbWFnZS5zcmMgPSB0aGlzLmltYWdlXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbm5lckhUTUwgPSAnJ1xyXG4gIH1cclxuXHJcbiAgLyoqIFNldHVwIEFjdGlvbnMgKiAqL1xyXG5cclxuICAvKipcclxuICAqIGFkZFRvIC0gQWRkcyB0aGUgY29zdHVtZSB0byB0aGUgc3ByaXRlXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICogbGV0IGNvc3R1bWUgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoKTtcclxuICAqXHJcbiAgKiBjb3N0dW1lLmFkZFRvKHNwcml0ZSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHNwcml0ZSAtIHdoaWNoIHNwcml0ZSB0byBhZGQgdGhlIGNvc3R1bWUgdG9vLlxyXG4gICovXHJcbiAgYWRkVG8gKHNwcml0ZSkge1xyXG4gICAgY29uc3QgY3VyU3ByaXRlID0gc3ByaXRlXHJcbiAgICBzcHJpdGUuY29zdHVtZXMucHVzaCh0aGlzKVxyXG5cclxuICAgIC8vIGlmIFwiYmFyZVwiIHNldCB0aGUgYWRkZWQgYXMgYWN0aXZlLlxyXG4gICAgaWYgKCFzcHJpdGUuY29zdHVtZSkge1xyXG4gICAgICBjdXJTcHJpdGUuY29zdHVtZSA9IHNwcml0ZS5jb3N0dW1lc1swXVxyXG4gICAgICBjdXJTcHJpdGUud2lkdGggPSBzcHJpdGUuY29zdHVtZS52aXNpYmxlV2lkdGhcclxuICAgICAgY3VyU3ByaXRlLmhlaWdodCA9IHNwcml0ZS5jb3N0dW1lLnZpc2libGVIZWlnaHRcclxuICAgIH1cclxuXHJcbiAgICBzcHJpdGUuZWxlbWVudCA/IHNwcml0ZS5lbGVtZW50LnVwZGF0ZShzcHJpdGUpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiByZW1vdmVGcm9tIC0gUmVtb3ZlcyB0aGUgY29zdHVtZSBmcm9tIHRvIHRoZSBzcHJpdGVcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKiBsZXQgY29zdHVtZSA9IG5ldyBibG9ja0xpa2UuQ29zdHVtZSgpO1xyXG4gICpcclxuICAqIGNvc3R1bWUuYWRkVG8oc3ByaXRlKTtcclxuICAqIGNvc3R1bWUucmVtb3ZlRnJvbShzcHJpdGUpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzcHJpdGUgLSB3aGljaCBzcHJpdGUgdG8gcmVtb3ZlIHRoZSBjb3N0dW1lIGZyb20uXHJcbiAgKi9cclxuICByZW1vdmVGcm9tIChzcHJpdGUpIHtcclxuICAgIHNwcml0ZS5yZW1vdmVDb3N0dW1lKHRoaXMpXHJcbiAgfVxyXG5cclxuICAvKiogTG9va3MgKiAqL1xyXG5cclxuICAvKipcclxuICAqIHJlc2l6ZVRvSW1hZ2UgLSBzZXRzIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSBjb3N0dW1lIHRvIHRoYXQgb2YgdGhlIGltYWdlIGZpbGUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBjb3N0dW1lID0gbmV3IGJsb2NrTGlrZS5Db3N0dW1lKHtcclxuICAqICAgaW1hZ2U6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL2QvZDMvU2hlZXBfaW5fZ3JheS5zdmcnXHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBjb3N0dW1lLnJlc2l6ZVRvSW1hZ2UoKTtcclxuICAqL1xyXG4gIHJlc2l6ZVRvSW1hZ2UgKCkge1xyXG4gICAgLy8gcmVnaXN0ZXIgdGhlIGltYWdlIHNpemUgZnJvbSB0aGUgZmlsZVxyXG4gICAgaWYgKHRoaXMuaW1hZ2UpIHtcclxuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgd2luZG93LkltYWdlKClcclxuICAgICAgY29uc3QgbWUgPSB0aGlzXHJcblxyXG4gICAgICBpbWFnZS5zcmMgPSB0aGlzLmltYWdlXHJcblxyXG4gICAgICBpbWFnZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xyXG4gICAgICAgIG1lLndpZHRoID0gaW1hZ2Uud2lkdGhcclxuICAgICAgICBtZS5oZWlnaHQgPSBpbWFnZS5oZWlnaHRcclxuICAgICAgICBtZS52aXNpYmxlV2lkdGggPSBtZS53aWR0aFxyXG4gICAgICAgIG1lLnZpc2libGVIZWlnaHQgPSBtZS5oZWlnaHRcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogaW5uZXIgLSBQbGFjZXMgYW4gSFRNTCBlbGVtZW50IGluc2lkZSB0aGUgY29zdHVtZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IGNvc3R1bWUgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoKTtcclxuICAqXHJcbiAgKiBjb3N0dW1lLmlubmVyKCc8cCBjbGFzcz1cImJpZyBjZW50ZXJlZCByYWluYm93XCI+Oik8L3A+Jyk7XHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGNvc3R1bWUuaW5uZXIoJ0kgbGlrZSB0ZXh0IG9ubHknKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCAtIHRoZSBodG1sIHRvIGluc2VydC5cclxuICAqL1xyXG4gIGlubmVyIChodG1sKSB7XHJcbiAgICB0aGlzLmlubmVySFRNTCA9IGh0bWxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogaW5zZXJ0IC0gUGxhY2VzIGEgRE9NIGVsZW1lbnQgaW5zaWRlIHRoZSBjb3N0dW1lLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgY29zdHVtZSA9IG5ldyBibG9ja0xpa2UuQ29zdHVtZSgpO1xyXG4gICpcclxuICAqIGNvc3R1bWUuaW5zZXJ0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdteS1odG1sLWNyZWF0aW9uJykpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBlbCAtIHRoZSBET00gZWxlbWVudC5cclxuICAqL1xyXG4gIGluc2VydCAoZWwpIHtcclxuICAgIGNvbnN0IGllbCA9IGVsLmNsb25lTm9kZSh0cnVlKVxyXG4gICAgaWVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgICBpZWwuc3R5bGUudmlzaWJpbGl0eSA9ICdpbmhlcml0J1xyXG5cclxuICAgIHRoaXMuaW1hZ2UgPSBudWxsXHJcbiAgICB0aGlzLmNvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgdGhpcy5pbm5lckhUTUwgPSBpZWwub3V0ZXJIVE1MXHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4qIENvbGxlY3Rpb24gb2YgY3NzIHN0cmluZ3MgdG8gYmUgaW5qZWN0ZWQgdG8gdGhlIGhlYWQgc2VjdGlvbiBvZiBhIHBhZ2UuXHJcbiogQHByaXZhdGVcclxuKi9cclxuZXhwb3J0IGNvbnN0IGRlZmF1bHRDU1MgPSBgXHJcbiogeyBcclxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xyXG4gIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgwLCAwLCAwKTtcclxuICAtd2Via2l0LXRvdWNoLWNhbGxvdXQ6bm9uZTsgICAgICAgICAgICAgICAgLyogcHJldmVudCBjYWxsb3V0IHRvIGNvcHkgaW1hZ2UsIGV0YyB3aGVuIHRhcCB0byBob2xkICovXHJcbiAgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOnJnYmEoMCwwLDAsMCk7IC8qIHByZXZlbnQgdGFwIGhpZ2hsaWdodCBjb2xvciAvIHNoYWRvdyAqL1xyXG59XHJcbmh0bWwsIGJvZHl7XHJcbiAgbWFyZ2luOjA7XHJcbiAgcGFkZGluZzowO1xyXG59XHJcbmBcclxuXHJcbmV4cG9ydCBjb25zdCB1aUNTUyA9IGBcclxuLmJsb2NrbGlrZS1mbGFnIHtcclxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgZm9udC1mYW1pbHk6IEFyaWFsLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7XHJcbiAgZm9udC1zaXplOiA2NXB4O1xyXG4gIGxpbmUtaGVpZ2h0OiA2NXB4O1xyXG4gIHBhZGRpbmc6IDMycHg7XHJcbiAgY29sb3I6ICMyMjI7XHJcbiAgYmFja2dyb3VuZDogI2ZhZmFmYTtcclxuICBib3JkZXI6IDJweCBzb2xpZCAjNjY2O1xyXG4gIGJvcmRlci1yYWRpdXM6IDY1cHg7XHJcbn1cclxuYFxyXG5cclxuZXhwb3J0IGNvbnN0IHRoaW5rQ1NTID0gYFxyXG4uYmxvY2tsaWtlLXRoaW5rIHtcclxuICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgbWluLXdpZHRoOiA2MHB4O1xyXG4gIG1heC13aWR0aDogMjAwcHg7XHJcbiAgbGVmdDogMjAwcHg7XHJcbiAgcGFkZGluZzogMTBweDtcclxuICBmb250LWZhbWlseTogQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZjtcclxuICBmb250LXNpemU6IDE2cHg7XHJcbiAgbWluLWhlaWdodDogMTZweDtcclxuICBsaW5lLWhlaWdodDogMTZweDtcclxuICB0ZXh0LWFsaWduOiBsZWZ0O1xyXG4gIGNvbG9yOiAjMjIyO1xyXG4gIGJhY2tncm91bmQ6ICNmYWZhZmE7XHJcbiAgYm9yZGVyOiAycHggc29saWQgIzQ0NDtcclxuICBib3JkZXItcmFkaXVzOiAyMHB4O1xyXG59XHJcbi5ibG9ja2xpa2UtdGhpbms6YmVmb3JlIHtcclxuICBwb3NpdGlvbjphYnNvbHV0ZTtcclxuICBib3R0b206IC0zMHB4O1xyXG4gIGxlZnQ6IDBweDtcclxuICB3aWR0aDogMzBweDtcclxuICBoZWlnaHQ6IDMwcHg7XHJcbiAgYmFja2dyb3VuZDogI2ZhZmFmYTtcclxuICBib3JkZXI6IDJweCBzb2xpZCAjNDQ0O1xyXG4gIGJvcmRlci1yYWRpdXM6IDIwcHg7XHJcbiAgY29udGVudDogXCJcIjtcclxufVxyXG4uYmxvY2tsaWtlLXRoaW5rOmFmdGVyIHtcclxuICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgYm90dG9tOiAtNDVweDtcclxuICBsZWZ0OiAwcHg7XHJcbiAgd2lkdGg6IDE1cHg7XHJcbiAgaGVpZ2h0OiAxNXB4O1xyXG4gIGJhY2tncm91bmQ6ICNmYWZhZmE7XHJcbiAgYm9yZGVyOiAycHggc29saWQgIzQ0NDtcclxuICBib3JkZXItcmFkaXVzOiAxNXB4O1xyXG4gIGNvbnRlbnQ6IFwiXCI7XHJcbn1cclxuYFxyXG5cclxuZXhwb3J0IGNvbnN0IHNheUNTUyA9IGBcclxuLmJsb2NrbGlrZS1hc2ssXHJcbi5ibG9ja2xpa2Utc2F5IHtcclxuICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xyXG4gIG1pbi13aWR0aDogNjBweDtcclxuICBtYXgtd2lkdGg6IDIwMHB4O1xyXG4gIHBhZGRpbmc6IDEwcHg7XHJcbiAgZm9udC1mYW1pbHk6IEFyaWFsLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7XHJcbiAgZm9udC1zaXplOiAxNnB4O1xyXG4gIG1pbi1oZWlnaHQ6IDE2cHg7XHJcbiAgbGluZS1oZWlnaHQ6IDE2cHg7XHJcbiAgdGV4dC1hbGlnbjogbGVmdDtcclxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmFmYWZhO1xyXG4gIGJvcmRlcjogMnB4IHNvbGlkICM0NDQ7XHJcbiAgYm9yZGVyLXJhZGl1czogMjBweDtcclxufVxyXG4uYmxvY2tsaWtlLWFzazpiZWZvcmUsXHJcbi5ibG9ja2xpa2Utc2F5OmJlZm9yZSB7XHJcbiAgY29udGVudDogJyAnO1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICB3aWR0aDogMDtcclxuICBoZWlnaHQ6IDA7XHJcbiAgbGVmdDogMTNweDtcclxuICByaWdodDogYXV0bztcclxuICB0b3A6IGF1dG87XHJcbiAgYm90dG9tOiAtMzNweDtcclxuICBib3JkZXI6IDE2cHggc29saWQ7XHJcbiAgYm9yZGVyLWNvbG9yOiAjNDQ0IHRyYW5zcGFyZW50IHRyYW5zcGFyZW50ICM0NDQ7XHJcbn1cclxuLmJsb2NrbGlrZS1hc2s6YWZ0ZXIsXHJcbi5ibG9ja2xpa2Utc2F5OmFmdGVyIHtcclxuICBjb250ZW50OiAnICc7XHJcbiAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gIHdpZHRoOiAwO1xyXG4gIGhlaWdodDogMDtcclxuICBsZWZ0OiAxNXB4O1xyXG4gIHJpZ2h0OiBhdXRvO1xyXG4gIHRvcDogYXV0bztcclxuICBib3R0b206IC0yOHB4O1xyXG4gIGJvcmRlcjogMTZweCBzb2xpZDtcclxuICBib3JkZXItY29sb3I6ICNmYWZhZmEgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgI2ZhZmFmYTtcclxufVxyXG5gXHJcblxyXG5leHBvcnQgY29uc3QgYXNrQ1NTID0gYFxyXG4uYmxvY2tsaWtlLWFzayBpbnB1dCB7XHJcbiAgZm9udC1mYW1pbHk6IEFyaWFsLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7XHJcbiAgZm9udC1zaXplOiAxNnB4O1xyXG4gIHBhZGRpbmc6IDJweDtcclxuICBtYXJnaW46IDJweDtcclxuICB3aWR0aDogNzUlO1xyXG59XHJcbi5ibG9ja2xpa2UtYXNrIGJ1dHRvbiB7XHJcbiAgZm9udC1zaXplOiAxNnB4O1xyXG4gIGxpbmUtaGVpZ2h0OiAxNnB4O1xyXG4gIGhlaWdodDogMjZweDtcclxuICBwYWRkaW5nOiAwIDVweDtcclxuICBtYXJnaW46IDA7XHJcbn1cclxuYFxyXG4iLCIvKipcclxuKiBFbmNhcHN1bGF0ZXMgdGhlIGZ1bmN0aW9uYWxpdHkgb2YgbWFuYWdpbmcgZWxlbWVudCBzdHlsZSBwcm9wZXJ0aWVzIGZvciB0aGUgZW50aXRpZXMuXHJcbiovXHJcblxyXG4vKipcclxuKiBhcHBseSAtIGFwcGx5IGNzc1J1bGVzIG9mIGFuIGVudGl0eSB0byBpdHMgRE9NIGVsZW1lbnQuXHJcbipcclxuKiBAcGFyYW0ge2Z1bmN0aW9ufSBlbnRpdHkgLSBhIFNwcml0ZSBvciBTdGFnZS5cclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5IChlbnRpdHkpIHtcclxuICBjb25zdCBjdXJFbnRpdHkgPSBlbnRpdHlcclxuICAvLyBTcHJpdGVzIGhhdmUgQ29zdHVtZXMsIFN0YWdlIGhhcyBCYWNrZHJvcCwgZmlndXJlIG91dCB3aGljaCBlbnRpdHkgaXQgaXMuXHJcbiAgY29uc3QgY3VyTG9vayA9IGVudGl0eS5iYWNrZHJvcCB8fCBlbnRpdHkuY29zdHVtZVxyXG4gIGNvbnN0IGN1ckxvb2tzID0gZW50aXR5LmJhY2tkcm9wcyB8fCBlbnRpdHkuY29zdHVtZXNcclxuXHJcbiAgY29uc3QgZWwgPSBlbnRpdHkuZWxlbWVudC5lbFxyXG5cclxuICAvLyByZW1vdmUgYW55IHN0eWxlIGFwcGxpZWQgYnkgYW55IGxvb2tcclxuICBpZiAoY3VyTG9va3MpIHtcclxuICAgIGN1ckxvb2tzLmZvckVhY2goKGIpID0+IHtcclxuICAgICAgYi5jc3NSdWxlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2FtZWxDYXNlZCA9IGl0ZW0ucHJvcC5yZXBsYWNlKC8tKFthLXpdKS9nLCAoZykgPT4gZ1sxXS50b1VwcGVyQ2FzZSgpKVxyXG4gICAgICAgIGVsLnN0eWxlW2NhbWVsQ2FzZWRdID0gJydcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvLyBhZGQgY3VycmVudCBsb29rIHN0eWxlc1xyXG4gIGlmIChjdXJMb29rKSB7XHJcbiAgICBjdXJMb29rLmNzc1J1bGVzLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgY29uc3QgY2FtZWxDYXNlZCA9IGl0ZW0ucHJvcC5yZXBsYWNlKC8tKFthLXpdKS9nLCAoZykgPT4gZ1sxXS50b1VwcGVyQ2FzZSgpKVxyXG4gICAgICBlbC5zdHlsZVtjYW1lbENhc2VkXSA9IGl0ZW0udmFsdWVcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvLyBBZGQgY3VyRW50aXR5IHN0eWxlcy4gTXVzdCBiZSBkb25lIGFmdGVyIGxvb2sgc3R5bGVzLlxyXG4gIGN1ckVudGl0eS5jc3NSdWxlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICBjb25zdCBjYW1lbENhc2VkID0gaXRlbS5wcm9wLnJlcGxhY2UoLy0oW2Etel0pL2csIChnKSA9PiBnWzFdLnRvVXBwZXJDYXNlKCkpXHJcbiAgICBlbC5zdHlsZVtjYW1lbENhc2VkXSA9IGl0ZW0udmFsdWVcclxuICB9KVxyXG59XHJcblxyXG4vKipcclxuKiByZWdpc3RlciAtIHJlZ2lzdGVyIGNzc1J1bGVzIG9mIGZvciBhbiBlbnRpdHkgYmFzZWQgb24gdXNlciBpbnB1dC5cclxuKiBOb3RlOiBBbGwgcnVsZXMgYXJlIHJlZ2lzdGVyZWQgZGFzaC1jYXNlIGEtbGEgY3NzLlxyXG4qIFRoaXMgaXMgcmVnYXJkbGVzcyBvZiBob3cgdGhleSBhcmUgc2V0IGFuZCB0aG91Z2ggdGhleSBhcmUgdXNlZCBjYW1lbENhc2UuXHJcbipcclxuKiBAcGFyYW0ge3N0cmluZ30gcHJvcCAtIHRoZSBjc3MgcHJvcGVydHkgKGUuZy4gY29sb3IpLiBBbHRlcm5hdGl2ZWx5IGFuIG9iamVjdCB3aXRoIGtleTogdmFsdWUgcGFpcnMuXHJcbiogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gdGhlIHZhbHVlIGZvciB0aGUgY3NzIHByb3BlcnR5IChlLmcuICNmZjg4MzMpXHJcbiogQHBhcmFtIHtmdW5jdGlvbn0gZW50aXR5IC0gYSBTcHJpdGUgb3IgU3RhZ2UuXHJcbiovXHJcbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlciAocHJvcCwgdmFsdWUsIGVudGl0eSkge1xyXG4gIGNvbnN0IGN1ckVudGl0eSA9IGVudGl0eVxyXG5cclxuICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgIGNvbnN0IGRhc2hlZCA9IHByb3AucmVwbGFjZSgvKFtBLVpdKS9nLCAoJDEpID0+IGAtJHskMS50b0xvd2VyQ2FzZSgpfWApXHJcbiAgICBjdXJFbnRpdHkuY3NzUnVsZXMucHVzaCh7IHByb3A6IGRhc2hlZCwgdmFsdWUgfSlcclxuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9wID09PSAnb2JqZWN0JyAmJiAhdmFsdWUpIHtcclxuICAgIE9iamVjdC5rZXlzKHByb3ApLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICBjb25zdCBkYXNoZWQgPSBrZXkucmVwbGFjZSgvKFtBLVpdKS9nLCAoJDEpID0+IGAtJHskMS50b0xvd2VyQ2FzZSgpfWApXHJcbiAgICAgIGN1ckVudGl0eS5jc3NSdWxlcy5wdXNoKHsgcHJvcDogZGFzaGVkLCB2YWx1ZTogcHJvcFtrZXldIH0pXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgcmV3cml0ZSBmcm9tICcuL3Jld3JpdGVyJ1xyXG5pbXBvcnQgKiBhcyBjc3MgZnJvbSAnLi9lbGVtZW50LWNzcydcclxuXHJcbi8qKlxyXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gZW50aXR5LlxyXG4gKiBBYnN0cmFjdCBmb3IgU3RhZ2UgYW5kIFNwcml0ZS5cclxuICogRG8gbm90IGluc3RhbnRpYXRlIG9iamVjdHMgZGlyZWN0bHkgZnJvbSB0aGlzIGNsYXNzLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW50aXR5IHtcclxuICAvKipcclxuICAqIGNvbnN0cnVjdG9yIC0gRW50aXR5IGlzIGFic3RyYWN0IGZvciBTdGFnZSBhbmQgU3ByaXRlLlxyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBwYWNlIC0gdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gcGFjZSBwYWNlZCBtZXRob2RzLlxyXG4gICovXHJcbiAgY29uc3RydWN0b3IgKHBhY2UpIHtcclxuICAgIEVudGl0eS5tZXNzYWdlTGlzdGVuZXJzID0gW11cclxuICAgIHRoaXMuaWQgPSB0aGlzLl9nZW5lcmF0ZVVVSUQoKVxyXG4gICAgdGhpcy5wYWNlID0gcGFjZVxyXG4gICAgdGhpcy5zb3VuZHMgPSBbXSAvLyB3aWxsIGhvbGQgYWxsIHNvdW5kcyBjdXJyZW50bHkgcGxheWVkIGJ5IGVudGl0eSwgaWYgYW55LlxyXG4gICAgLypcclxuICAgICogUGFjZWQgbWV0aG9kcyB3b3JrIGluIHRoZSBmb2xsb3dpbmcgbWFubmVyOlxyXG4gICAgKiAxLiBFdmVudCBNZXRob2QgZnVuY3Rpb25zIGFyZSByZXdyaXR0ZW4uXHJcbiAgICAqIDIuIEZvciBwYWNlZCBtZXRob2RzIHJld3JpdGVyIHdpbGwgYWRkIGFuIGF3YWl0IHRvIGEgcHJvbWlzZSBhZnRlciB0aGUgcGFjZWQgbWV0aG9kIGNhbGwuXHJcbiAgICAqIDMuIFRoZSBwcm9taXNlIHdpbGwgcmVzb2x2ZSBhZnRlciB7cGFjZX0gbWlsbGlzZWNvbmRzLlxyXG4gICAgKlxyXG4gICAgKiBUaGlzIGFsbG93cyB0aGUgcGFjZWQgbWV0aG9kIHRvIGhhbHQgZXhlY3V0aW9uIG9mIGFueSBjb2RlIGZvbGxvd2luZyBpdCB1bnRpbCBpdCBpcyBkb25lLlxyXG4gICAgKi9cclxuICAgIHRoaXMucGFjZWQgPSBbXHJcbiAgICAgICdnb1RvJyxcclxuICAgICAgJ21vdmUnLFxyXG4gICAgICAnY2hhbmdlWCcsXHJcbiAgICAgICdjaGFuZ2VZJyxcclxuICAgICAgJ3NldFgnLFxyXG4gICAgICAnc2V0WScsXHJcbiAgICAgICdnb1Rvd2FyZHMnLFxyXG4gICAgICAndHVyblJpZ2h0JyxcclxuICAgICAgJ3R1cm5MZWZ0JyxcclxuICAgICAgJ3BvaW50SW5EaXJlY3Rpb24nLFxyXG4gICAgICAncG9pbnRUb3dhcmRzJyxcclxuICAgICAgJ2NoYW5nZVNpemUnLFxyXG4gICAgICAnc2V0U2l6ZScsXHJcbiAgICAgICdzYXknLFxyXG4gICAgICAndGhpbmsnLFxyXG4gICAgICAncmVmcmVzaCdcclxuICAgIF1cclxuXHJcbiAgICAvKlxyXG4gICAgKiBXYWl0ZWQgbWV0aG9kcyB3b3JrIGluIHRoZSBmb2xsb3dpbmcgbWFubmVyOlxyXG4gICAgKiAxLiBFdmVudCBNZXRob2QgZnVuY3Rpb25zIGFyZSByZXdyaXR0ZW4uXHJcbiAgICAqIDIuIEZvciB3YWl0ZWQgbWV0aG9kcyByZXdyaXRlciB3aWxsIGFkZCBhbiBhd2FpdCB0byBhIHByb21pc2UgYWZ0ZXIgdGhlIHdhaXRlZCBtZXRob2QgY2FsbC5cclxuICAgICogMy4gVGhlIHByb21pc2UgaW5jbHVkZXMgYSBkb2N1bWVudCBsZXZlbCBldmVudCBsaXN0ZW5lci5cclxuICAgICogNC4gcmV3cml0ZXIgbW9kaWZpZXMgdGhlIHdhaXRlZCBtZXRob2QgY2FsbCwgaW5zZXJ0aW5nIGEgdHJpZ2dlcmluZ0lkIHBhcmFtZXRlci5cclxuICAgICogNC4gVGhlIGV2ZW50IGxpc3RlbmVyIGlzIHVuaXF1ZSB0byB0aGUgdHJpZ2dlcmluZ0lkLlxyXG4gICAgKiA1LiBXaGVuIHRoZSBtZXRob2QgY29tcGxldGVzIHJ1bm5pbmcgYW4gZXZlbnQgaXMgZGlzcGF0Y2hlZCByZXNvbHZpbmcgdGhlIHByb21pc2UuXHJcbiAgICAqXHJcbiAgICAqIFRoaXMgYWxsb3dzIHRoZSB3YWl0ZWQgbWV0aG9kIHRvIGhhbHQgZXhlY3V0aW9uIG9mIGFueSBjb2RlIGZvbGxvd2luZyBpdCB1bnRpbCBpdCBpcyBkb25lLlxyXG4gICAgKi9cclxuICAgIHRoaXMud2FpdGVkID0gW1xyXG4gICAgICAnd2FpdCcsXHJcbiAgICAgICdnbGlkZScsXHJcbiAgICAgICdzYXlXYWl0JyxcclxuICAgICAgJ3RoaW5rV2FpdCcsXHJcbiAgICAgICdwbGF5U291bmRVbnRpbERvbmUnLFxyXG4gICAgICAnYnJvYWRjYXN0TWVzc2FnZVdhaXQnXHJcbiAgICBdXHJcblxyXG4gICAgLypcclxuICAgICogd2FpdGVkUmV0dW5yZWQgbWV0aG9kcyB3b3JrIHNpbWlsYXJseSB0byB3YWl0ZWQgbWV0aG9kcyBvbmx5IHRoYXQgdGhleSBlbmFibGUgY2FwdHVyaW5nIGEgdmFsdWVcclxuICAgICogaW50byBhIGdsb2JhbGx5IGRlY2xhcmVkIHZhcmlhYmxlIChvciBhbiB1bmRlY2xhcmVkIG9uZSkuXHJcbiAgICAqIDEuIEV2ZW50IE1ldGhvZCBmdW5jdGlvbnMgYXJlIHJld3JpdHRlbi5cclxuICAgICogMi4gRm9yIHdhaXRlZFJldHVybmVkIG1ldGhvZHMgcmV3cml0ZXIgd2lsbCBhZGQgYW4gYXdhaXQgdG8gYSBwcm9taXNlIGFmdGVyIHRoZSB3YWl0ZWQgbWV0aG9kIGNhbGwuXHJcbiAgICAqIDMuIFRoZSBwcm9taXNlIGluY2x1ZGVzIGEgZG9jdW1lbnQgbGV2ZWwgZXZlbnQgbGlzdGVuZXIuXHJcbiAgICAqIDQuIHJld3JpdGVyIG1vZGlmaWVzIHRoZSB3YWl0ZWQgbWV0aG9kIGNhbGwsIGluc2VydGluZzpcclxuICAgICogICAtIHRoZSBuYW1lIG9mIHRoZSB2YXJpYWJsZSBpbnRvIHdoaWNoIGEgdmFsdWUgaXMgcmV0dXJuZWQuXHJcbiAgICAqICAgLSBhIHRyaWdnZXJpbmdJZCBwYXJhbWV0ZXIuXHJcbiAgICAqIDQuIFRoZSBldmVudCBsaXN0ZW5lciBpcyB1bmlxdWUgdG8gdGhlIHRyaWdnZXJpbmdJZC5cclxuICAgICogNS4gV2hlbiB0aGUgbWV0aG9kIGNvbXBsZXRlcyBydW5uaW5nIGFuIGV2ZW50IGlzIGRpc3BhdGNoZWQgcmVzb2x2aW5nIHRoZSBwcm9taXNlLlxyXG4gICAgKiA2LiBUaGUgdmFsdWUgcmV0dXJuZWQgaXMgdHJhbnNmZXJlZCBpbnRvIHRoZSB2YXJpYWJsZSB1c2luZyBldmFsLlxyXG4gICAgKlxyXG4gICAgKiBUaGlzIGFsbG93cyB0aGUgd2FpdGVkIG1ldGhvZCB0byBoYWx0IGV4ZWN1dGlvbiBvZiBhbnkgY29kZSBmb2xsb3dpbmcgaXQgdW50aWwgaXQgaXMgZG9uZS5cclxuICAgICogQXQgd2hpY2ggcG9pbnQgdGhlIHZhcmlhYmxlIGhhcyBcImNhcHR1cmVkXCIgdGhlIHZhbHVlLlxyXG4gICAgKi9cclxuICAgIHRoaXMud2FpdGVkUmV0dXJuZWQgPSBbXHJcbiAgICAgICdpbnZva2UnLFxyXG4gICAgICAnYXNrJ1xyXG4gICAgXVxyXG5cclxuICAgIC8qXHJcbiAgICAqIEV2ZW50IG1ldGhvZHMgKGV2ZW50ZWQpIGFyZSBjb250YWluZXJzIGZvciBmdW5jdGlvbnMgdG8gYmUgcmV3cml0dGVuLlxyXG4gICAgKiBXaGVuIGFuIGV2ZW50IG1ldGhvZCBpcyBuZXN0ZWQgaW5zaWRlIGFub3RoZXIgdGhlIGNvZGUgb2YgdGhlIGlubmVyIG1ldGhvZCBpcyBOT1QgcmV3cml0dGVuLlxyXG4gICAgKi9cclxuICAgIHRoaXMuZXZlbnRlZCA9IFtcclxuICAgICAgJ3doZW5GbGFnJyxcclxuICAgICAgJ3doZW5Mb2FkZWQnLFxyXG4gICAgICAnd2hlbkNsaWNrZWQnLFxyXG4gICAgICAnd2hlbktleVByZXNzZWQnLFxyXG4gICAgICAnd2hlbkV2ZW50JyxcclxuICAgICAgJ3doZW5SZWNlaXZlTWVzc2FnZScsXHJcbiAgICAgICd3aGVuQ2xvbmVkJ1xyXG4gICAgXVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBfZ2VuZXJhdGVVVUlEIC0gZ2VuZXJhdGVzIGEgdW5pcXVlIElELlxyXG4gICogU291cmNlOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEwNTAzNC9jcmVhdGUtZ3VpZC11dWlkLWluLWphdmFzY3JpcHRcclxuICAqXHJcbiAgKiBAcHJpdmF0ZVxyXG4gICogQHJldHVybiB7c3RyaW5nfSAtIGEgdW5pcXVlIGlkLlxyXG4gICovXHJcbiAgX2dlbmVyYXRlVVVJRCAoKSB7XHJcbiAgICBsZXQgZFxyXG4gICAgbGV0IHJcclxuXHJcbiAgICBkID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuXHJcbiAgICBpZiAod2luZG93LnBlcmZvcm1hbmNlICYmIHR5cGVvZiB3aW5kb3cucGVyZm9ybWFuY2Uubm93ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGQgKz0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpIC8vIHVzZSBoaWdoLXByZWNpc2lvbiB0aW1lciBpZiBhdmFpbGFibGVcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB1dWlkID0gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCAoYykgPT4ge1xyXG4gICAgICByID0gKGQgKyBNYXRoLnJhbmRvbSgpICogMTYpICUgMTYgfCAwIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbWl4ZWQtb3BlcmF0b3JzLCBuby1iaXR3aXNlXHJcbiAgICAgIGQgPSBNYXRoLmZsb29yKGQgLyAxNilcclxuICAgICAgcmV0dXJuIChjID09PSAneCcgPyByIDogKHIgJiAweDMgfCAweDgpKS50b1N0cmluZygxNikgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1taXhlZC1vcGVyYXRvcnMsIG5vLWJpdHdpc2VcclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIHV1aWRcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogX3JlbGVhc2VXYWl0ZWQgLSByZWxlYXNlcyBhIHdhaXRlZCBwcm9taXNlIGJ5IGRpc3BhdGNoaW5nIGFuIGV2ZW50LlxyXG4gICpcclxuICAqIEBwcml2YXRlXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gdHJpZ2dlcmluZ0lkIC0gdGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRoYXQgaW52b2tlZCB0aGUgY29kZSB0aGF0IHJlcXVlc3RlZCB0aGUgd2FpdC5cclxuICAqL1xyXG4gIF9yZWxlYXNlV2FpdGVkICh0cmlnZ2VyaW5nSWQpIHtcclxuICAgIGNvbnN0IGV2ZW50ID0gbmV3IHdpbmRvdy5DdXN0b21FdmVudChgYmxvY2tMaWtlLndhaXRlZC4ke3RyaWdnZXJpbmdJZH1gLCB7IGRldGFpbDogeyB2YWx1ZTogMCB9IH0pXHJcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBfc2V0VG9WYXIgLSBzZXRzIGEgZ2xvYmFsbHkgc2NvcGVkIHVzZXIgZGVmaW5lZCB2YXJpYWJsZSB3aG8ncyBuYW1lIGlzIHNwZWNpZmllZCBhcyBhIGEgc3RyaW5nXHJcbiAgKiB3aXRoIHRoZSB2YWx1ZSBwcm92aWRlZC5cclxuICAqXHJcbiAgKiBAcHJpdmF0ZVxyXG4gICogQHBhcmFtIHt2YXJTdHJpbmd9IHRleHQgLSB0aGUgbmFtZSBvZiB0aGUgdmFyaWFibGUgdG8gd2hpY2ggdmFsdWUgc2hvdWxkIGJlIHNldC5cclxuICAqIEBwYXJhbSB7YW55fSB2YWx1ZSAtIHRoZSB2YWx1ZSB0byBzZXQuXHJcbiAgKi9cclxuICBfc2V0VG9WYXIgKHZhclN0cmluZywgdmFsdWUpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGV2YWwoYCR7dmFyU3RyaW5nfSA9ICcke3ZhbHVlfSdgKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWV2YWxcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHRocm93ICgnQmxvY2tMaWtlLmpzIEVycm9yOiBWYXJpYWJsZXMgYWNjZXB0aW5nIGEgdmFsdWUgbXVzdCBiZSBkZWNsYXJlZCBpbiB0aGUgZ2xvYmFsIHNjb3BlLicpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdGhyb3ctbGl0ZXJhbFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBfZXhlYyAtIGFzeW5jaHJvbm91cyBmdW5jdGlvbiBleGVjdXRpb24uXHJcbiAgKiBUaGlzIGlzIHdoYXQgY3JlYXRlcyB0aGUgXCJwYWNlZFwiIGV4ZWN1dGlvbiBvZiB0aGUgdXNlciBzdXBwbGllZCBmdW5jdGlvbnMuXHJcbiAgKlxyXG4gICogQHByaXZhdGVcclxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgLSBhIGZ1bmN0aW9uIHRvIHJld3JpdGUgYW5kIGV4ZWN1dGUuXHJcbiAgKiBAcGFyYW0ge2FycmF5fSBhcmdzQXJyIC0gYW4gYXJyYXkgb2YgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGZ1bmN0aW9uLlxyXG4gICovXHJcbiAgX2V4ZWMgKGZ1bmMsIGFyZ3NBcnIpIHtcclxuICAgIGNvbnN0IG1lID0gdGhpc1xyXG4gICAgbWUudHJpZ2dlcmluZ0lkID0gdGhpcy5fZ2VuZXJhdGVVVUlEKClcclxuICAgIGNvbnN0IGYgPSByZXdyaXRlKGZ1bmMsIG1lKVxyXG4gICAgcmV0dXJuIGYuYXBwbHkobWUsIGFyZ3NBcnIpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGludm9rZSAtIGludm9rZSBhIGZ1bmN0aW9uLiBBbGxvd3MgcGFzc2luZyBhbiBhcmd1bWVudCBvciBhcnJheSBvZiBhcmd1bWVudHMuXHJcbiAgKiBGdW5jdGlvbiB3aWxsIGJlIFwicGFjZWRcIiBhbmQgY29kZSBleGVjdXRpb24gd2lsbCBiZSBcIndhaXRlZFwiIHVudGlsIGl0IGlzIGNvbXBsZXRlZC5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogc3ByaXRlLndoZW5GbGFnKCgpID0+IHtcclxuICAqICAgdGhpcy5pbnZva2UoanVtcCk7XHJcbiAgKiAgIHRoaXMuaW52b2tlKHRhbGssICdoaScpO1xyXG4gICogICB0aGlzLmludm9rZShwYXR0ZXJuLCBbNSwgNTAsIDEyXSk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jIC0gYSBmdW5jdGlvbiB0byByZXdyaXRlIGFuZCBleGVjdXRlLlxyXG4gICogQHBhcmFtIHthcnJheX0gYXJnc0FyciAtIGFuIGFycmF5IG9mIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBmdW5jdGlvbi4gQSBzaW5nbGUgdmFyaWFibGUgYWxzbyBhY2NlcHRlZC5cclxuICAqL1xyXG4gIGludm9rZSAoZnVuYywgYXJnc0FyciwgdGhlVmFyID0gbnVsbCwgdHJpZ2dlcmluZ0lkID0gbnVsbCkge1xyXG4gICAgLy8gdGhlVmFyIGFuZCB0cmlnZ2VyaW5nSWQgYXJlIG5vdCB1c2VyIHN1cHBsaWVkLCB0aGV5IGFyZSBpbnNlcnRlZCBieSByZXdyaXRlci5cclxuICAgIGxldCBhcmdzID0gYXJnc0FyclxyXG4gICAgIShhcmdzQXJyIGluc3RhbmNlb2YgQXJyYXkpID8gYXJncyA9IFthcmdzQXJyXSA6IG51bGxcclxuXHJcbiAgICB0aGlzLl9leGVjKGZ1bmMsIGFyZ3MpLnRoZW4oKHJlc3VsdCkgPT4ge1xyXG4gICAgICAvLyB0aGlzIGlzIHRoZSB3YWl0ZWQgbWV0aG9kIGxpc3RlbmVyLiByZWxlYXNlIGl0LlxyXG4gICAgICB0aGlzLl9yZWxlYXNlV2FpdGVkKHRyaWdnZXJpbmdJZClcclxuICAgICAgLy8gc2V0IHRoZSB1c2VyIGRlZmluZWQgdmFyaWFibGUgdG8gdGhlIGNhcHR1cmVkIHZhbHVlLlxyXG4gICAgICB0aGVWYXIgPyB0aGlzLl9zZXRUb1Zhcih0aGVWYXIsIHJlc3VsdCkgOiBudWxsXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiB3YWl0IC0gY3JlYXRlcyBhIHBhdXNlIGluIGV4ZWN1dGlvbi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogdGhpcy53YWl0KDUpO1xyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgdGltZSA9IDU7XHJcbiAgKiB0aGlzLndhaXQodGltZSAqIDAuOTUpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBzZWMgLSBudW1iZXIgb2Ygc2Vjb25kcyB0byB3YWl0LiBNdXN0IGJlIGFuIGFjdHVhbCBudW1iZXIuXHJcbiAgKi9cclxuICB3YWl0IChzZWMsIHRyaWdnZXJpbmdJZCA9IG51bGwpIHtcclxuICAgIC8vIHRyaWdnZXJpbmdJZCBpcyBub3QgdXNlciBzdXBwbGllZCwgaXQgaXMgaW5zZXJ0ZWQgYnkgcmV3cml0ZXIuXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5fcmVsZWFzZVdhaXRlZCh0cmlnZ2VyaW5nSWQpXHJcbiAgICB9LCBzZWMgKiAxMDAwKVxyXG4gIH1cclxuXHJcbiAgLyoqIEV2ZW50cyAqICovXHJcblxyXG4gIC8qKlxyXG4gICogd2hlbkxvYWRlZCAtIGludm9rZSB1c2VyIHN1cHBsaWVkIGZ1bmN0aW9uLlxyXG4gICogVG8gYmUgdXNlZCB3aXRoIGNvZGUgdGhhdCBuZWVkcyB0byBydW4gb25sb2FkLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5Mb2FkZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnNheSgnSSBhbSBhbGl2ZScpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyAtIGEgZnVuY3Rpb24gdG8gcmV3cml0ZSBhbmQgZXhlY3V0ZS5cclxuICAqL1xyXG4gIHdoZW5Mb2FkZWQgKGZ1bmMpIHtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLl9leGVjKGZ1bmMsIFtdKVxyXG4gICAgfSwgMClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogd2hlbkZsYWcgLSBhZGRzIGEgZmxhZyB0byBjb3ZlciB0aGUgc3RhZ2Ugd2l0aCBhbiBldmVudCBsaXN0ZW5lciBhdHRhY2hlZC5cclxuICAqIFdoZW4gdHJpZ2dlcmVkIHdpbGwgcmVtb3ZlIHRoZSBmbGFnIGRpdiBhbmQgaW52b2tlIHVzZXIgc3VwcGxpZWQgZnVuY3Rpb24uXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkZsYWcoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnNheSgnSSBhbSBhbGl2ZScpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyAtIGEgZnVuY3Rpb24gdG8gcmV3cml0ZSBhbmQgZXhlY3V0ZS5cclxuICAqL1xyXG4gIHdoZW5GbGFnIChmdW5jKSB7XHJcbiAgICBjb25zdCBtZSA9IHRoaXNcclxuXHJcbiAgICBpZiAobWUuZWxlbWVudCkge1xyXG4gICAgICBtZS5lbGVtZW50LmFkZEZsYWcodGhpcylcclxuXHJcbiAgICAgIHRoaXMuZWxlbWVudC5mbGFnLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgICBtZS5lbGVtZW50LnJlbW92ZUZsYWcobWUpXHJcbiAgICAgICAgbWUuX2V4ZWMoZnVuYywgW2VdKVxyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogd2hlbkNsaWNrZWQgLSBhZGRzIGEgY2xpY2sgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHNwcml0ZSBvciBzdGFnZS5cclxuICAqIFdoZW4gdHJpZ2dlcmVkIHdpbGwgaW52b2tlIHVzZXIgc3VwcGxpZWQgZnVuY3Rpb24uXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnNheSgnSSBhbSBhbGl2ZScpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyAtIGEgZnVuY3Rpb24gdG8gcmV3cml0ZSBhbmQgZXhlY3V0ZS5cclxuICAqL1xyXG4gIHdoZW5DbGlja2VkIChmdW5jKSB7XHJcbiAgICBjb25zdCBtZSA9IHRoaXNcclxuXHJcbiAgICBpZiAobWUuZWxlbWVudCkge1xyXG4gICAgICB0aGlzLmVsZW1lbnQuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgIG1lLl9leGVjKGZ1bmMsIFtlXSlcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHdoZW5LZXlQcmVzc2VkIC0gYWRkcyBhIGtleXByZXNzIGV2ZW50IGxpc3RlbmVyIHRvIGRvY3VtZW50LlxyXG4gICogV2hlbiB0cmlnZ2VyZWQgd2lsbCBpbnZva2UgdXNlciBzdXBwbGllZCBmdW5jdGlvbi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuS2V5UHJlc3NlZCgnICcsIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnNheSgnU3BhY2VwcmVzc2VkJyk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcktleSAtIHRoZSBrZXkgcHJlc3NlZC4gbWF5IGJlIHRoZSBjb2RlIG9yIHRoZSBjaGFyYWN0ZXIgaXRzZWxmIChBIG9yIDY1KVxyXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyAtIGEgZnVuY3Rpb24gdG8gcmV3cml0ZSBhbmQgZXhlY3V0ZS5cclxuICAqL1xyXG4gIHdoZW5LZXlQcmVzc2VkICh1c2VyS2V5LCBmdW5jKSB7XHJcbiAgICBjb25zdCBtZSA9IHRoaXNcclxuICAgIGxldCBjaGVja1xyXG4gICAgdHlwZW9mIHVzZXJLZXkgPT09ICdzdHJpbmcnID8gY2hlY2sgPSB1c2VyS2V5LnRvTG93ZXJDYXNlKCkgOiBjaGVjayA9IHVzZXJLZXlcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgICAgbGV0IG1hdGNoID0gZmFsc2VcclxuICAgICAgLy8gTWFrZSBzdXJlIGVhY2ggcHJvcGVydHkgaXMgc3VwcG9ydGVkIGJ5IGJyb3dzZXJzLlxyXG4gICAgICAvLyBOb3RlOiB1c2VyIG1heSB3cml0ZSBpbmNvbXBhdGlibGUgY29kZS5cclxuICAgICAgZS5jb2RlICYmIGUuY29kZS50b0xvd2VyQ2FzZSgpID09PSBjaGVjayA/IG1hdGNoID0gdHJ1ZSA6IG51bGxcclxuICAgICAgZS5rZXkgJiYgZS5rZXkudG9Mb3dlckNhc2UoKSA9PT0gY2hlY2sgPyBtYXRjaCA9IHRydWUgOiBudWxsXHJcbiAgICAgIGUua2V5Q29kZSA9PT0gY2hlY2sgPyBtYXRjaCA9IHRydWUgOiBudWxsXHJcbiAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgIG1lLl9leGVjKGZ1bmMsIFtlXSlcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogd2hlbkV2ZW50IC0gYWRkcyB0aGUgc3BlY2lmaWVkIGV2ZW50IGxpc3RlbmVyIHRvIHNwcml0ZS9zdGFnZS5cclxuICAqIFdoZW4gdHJpZ2dlcmVkIHdpbGwgaW52b2tlIHVzZXIgc3VwcGxpZWQgZnVuY3Rpb24uXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkV2ZW50KCdtb3VzZW92ZXInLCAoZSkgPT4ge1xyXG4gICogICBjb25zb2xlLmxvZyhlKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFN0ciAtIHRoZSBuYW1lZCBldmVudCAobW9zZW1vdmUgZXRjLikuXHJcbiAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jIC0gYSBmdW5jdGlvbiB0byByZXdyaXRlIGFuZCBleGVjdXRlLlxyXG4gICovXHJcbiAgd2hlbkV2ZW50IChldmVudFN0ciwgZnVuYykge1xyXG4gICAgY29uc3QgbWUgPSB0aGlzXHJcblxyXG4gICAgaWYgKG1lLmVsZW1lbnQpIHtcclxuICAgICAgbGV0IGF0dGFjaFRvID0gdGhpcy5lbGVtZW50LmVsXHJcbiAgICAgIGxldCBvcHRpb25zID0ge31cclxuICAgICAgJ2tleWRvd258a2V5dXB8a2V5cHJlc3MnLmluZGV4T2YoZXZlbnRTdHIpICE9PSAtMSA/IGF0dGFjaFRvID0gZG9jdW1lbnQgOiBudWxsXHJcbiAgICAgICd0b3VjaHN0YXJ0fHRvdWNobW92ZScuaW5kZXhPZihldmVudFN0cikgIT09IC0xID8gb3B0aW9ucyA9IHsgcGFzc2l2ZTogdHJ1ZSB9IDogbnVsbFxyXG5cclxuICAgICAgYXR0YWNoVG8uYWRkRXZlbnRMaXN0ZW5lcihldmVudFN0ciwgKGUpID0+IHtcclxuICAgICAgICBtZS5fZXhlYyhmdW5jLCBbZV0pXHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICB9LCBvcHRpb25zKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiB3aGVuUmVjZWl2ZU1lc3NhZ2UgLSBhZGRzIHRoZSBzcGVjaWZpZWQgZXZlbnQgbGlzdGVuZXIgdG8gZG9jdW1lbnQuXHJcbiAgKiBXaGVuIHRyaWdnZXJlZCB3aWxsIGludm9rZSB1c2VyIHN1cHBsaWVkIGZ1bmN0aW9uLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5SZWNlaXZlTWVzc2FnZSgnbW92ZScsIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLm1vdmUoLTEwKTtcclxuICAqIH0pXHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IG1zZyAtIHRoZSBuYW1lZCBtZXNzYWdlIChldmVudCk7XHJcbiAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jIC0gYSBmdW5jdGlvbiB0byByZXdyaXRlIGFuZCBleGVjdXRlLlxyXG4gICovXHJcbiAgd2hlblJlY2VpdmVNZXNzYWdlIChtc2csIGZ1bmMpIHtcclxuICAgIGNvbnN0IGxpc3RlbmVySWQgPSB0aGlzLl9nZW5lcmF0ZVVVSUQoKVxyXG4gICAgLy8gcmVnaXN0ZXIgYXMgYSBtZXNzYWdlIGxpc3RlbmVyLlxyXG4gICAgRW50aXR5Lm1lc3NhZ2VMaXN0ZW5lcnMucHVzaCh7IG1zZywgbGlzdGVuZXJJZCB9KVxyXG5cclxuICAgIC8vIGxpc3RlbiB0byBzcGVjaWZpZWQgbWVzc2FnZVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihtc2csIChlKSA9PiB7XHJcbiAgICAgIC8vIGV4ZWN1dGUgdGhlIGZ1bmMgYW5kIHRoZW5cclxuICAgICAgdGhpcy5fZXhlYyhmdW5jLCBbZV0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIC8vIGRpc3BhdGNoIGFuIGV2ZW50IHRoYXQgaXMgdW5pcXVlIHRvIHRoZSBsaXN0ZW5lciBhbmQgbWVzc2FnZSByZWNlaXZlZC5cclxuICAgICAgICBjb25zdCBtc2dJZCA9IGUuZGV0YWlsLm1zZ0lkXHJcbiAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgd2luZG93LkN1c3RvbUV2ZW50KCdibG9ja0xpa2UuZG9uZXdoZW5lZWNlaXZlbWVzc2FnZScsIHsgZGV0YWlsOiB7IG1zZ0lkLCBsaXN0ZW5lcklkIH0gfSlcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudClcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGJyb2FkY2FzdE1lc3NhZ2UgLSBkaXNwYXRjaGVzIGEgY3VzdG9tIGV2ZW50IHRoYXQgYWN0cyBhcyBhIGdsb2JhbCBtZXNzYWdlLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKlxyXG4gICogc3RhZ2Uud2hlbkNsaWNrZWQoZnVuY3Rpb24oKSB7XHJcbiAgKiAgc3RhZ2UuYnJvYWRjYXN0TWVzc2FnZSgnbW92ZScpXHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gbXNnIC0gdGhlIG5hbWVkIG1lc3NhZ2UgKGV2ZW50KVxyXG4gICovXHJcbiAgYnJvYWRjYXN0TWVzc2FnZSAobXNnKSB7XHJcbiAgICBjb25zdCBtc2dJZCA9IHRoaXMuX2dlbmVyYXRlVVVJRCgpXHJcbiAgICBjb25zdCBldmVudCA9IG5ldyB3aW5kb3cuQ3VzdG9tRXZlbnQobXNnLCB7IGRldGFpbDogeyBtc2dJZCB9IH0pXHJcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBicm9hZGNhc3RNZXNzYWdlV2FpdCAtIGRpc3BhdGNoZXMgYSBjdXN0b20gZXZlbnQgdGhhdCBhY3RzIGFzIGEgZ2xvYmFsIG1lc3NhZ2UuXHJcbiAgKiBXYWl0cyBmb3IgYWxsIHdoZW5SZWNlaXZlTWVzc2FnZSBsaXN0ZW5lcnMgdG8gY29tcGxldGUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKlxyXG4gICogc3ByaXRlLndoZW5SZWNlaXZlTWVzc2FnZSgnbW92ZScsIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLm1vdmUoLTEwKTtcclxuICAqICAgdGhpcy53YWl0KDUpO1xyXG4gICogfSlcclxuICAqXHJcbiAgKiBzdGFnZS53aGVuQ2xpY2tlZChmdW5jdGlvbigpIHtcclxuICAqICBzdGFnZS5icm9hZGNhc3RNZXNzYWdlV2FpdCgnbW92ZScpO1xyXG4gICogIHNwcml0ZS5zYXkoJ0FsbCBkb25lJyk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gbXNnIC0gdGhlIG5hbWVkIG1lc3NhZ2UgKGV2ZW50KVxyXG4gICovXHJcbiAgYnJvYWRjYXN0TWVzc2FnZVdhaXQgKG1zZywgdHJpZ2dlcmluZ0lkID0gbnVsbCkge1xyXG4gICAgLy8gdHJpZ2dlcmluZ0lkIGlzIG5vdCB1c2VyIHN1cHBsaWVkLCBpdCBpcyBpbnNlcnRlZCBieSByZXdyaXRlci5cclxuICAgIGNvbnN0IG1lID0gdGhpc1xyXG4gICAgY29uc3QgbXNnSWQgPSB0aGlzLl9nZW5lcmF0ZVVVSUQoKVxyXG4gICAgLy8gc2F2ZSByZWdpc3RlcmVkIGxpc3RlbmVycyBmb3IgdGhpcyBicm9hZGNhc3QuXHJcbiAgICBsZXQgbXlMaXN0ZW5lcnMgPSBFbnRpdHkubWVzc2FnZUxpc3RlbmVycy5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0ubXNnID09PSBtc2cpXHJcbiAgICAvLyBkaXNwYXRjaCB0aGUgbWVzc2FnZVxyXG4gICAgY29uc3QgZXZlbnQgPSBuZXcgd2luZG93LkN1c3RvbUV2ZW50KG1zZywgeyBkZXRhaWw6IHsgbXNnSWQgfSB9KVxyXG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudClcclxuXHJcbiAgICAvLyBsaXN0ZW4gdG8gdGhvc2Ugd2hvIHJlY2VpdmVkIHRoZSBtZXNzYWdlXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdibG9ja0xpa2UuZG9uZXdoZW5lZWNlaXZlbWVzc2FnZScsIGZ1bmN0aW9uIGJyb2FkY2FzdE1lc3NhZ2VXYWl0TGlzdGVuZXIgKGUpIHtcclxuICAgICAgLy8gaWYgZXZlbnQgaXMgZm9yIHRoaXMgbWVzc2FnZSByZW1vdmUgbGlzdGVuZXJJZCBmcm9tIGxpc3Qgb2YgbGlzdGVuZXJzLlxyXG4gICAgICAoZS5kZXRhaWwubXNnSWQgPT09IG1zZ0lkKSA/IG15TGlzdGVuZXJzID0gbXlMaXN0ZW5lcnMuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmxpc3RlbmVySWQgIT09IGUuZGV0YWlsLmxpc3RlbmVySWQpIDogbnVsbFxyXG4gICAgICAvLyBhbGwgbGlzdGVuZXJzIHJlc3BvbmRlZC5cclxuICAgICAgaWYgKCFteUxpc3RlbmVycy5sZW5ndGgpIHtcclxuICAgICAgICAvLyByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyXHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmxvY2tMaWtlLmRvbmV3aGVuZWVjZWl2ZW1lc3NhZ2UnLCBicm9hZGNhc3RNZXNzYWdlV2FpdExpc3RlbmVyKVxyXG4gICAgICAgIC8vIHJlbGVhc2UgdGhlIHdhaXRcclxuICAgICAgICBtZS5fcmVsZWFzZVdhaXRlZCh0cmlnZ2VyaW5nSWQpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvKiogU291bmQgKiAqL1xyXG5cclxuICAvKipcclxuICAqIHBsYXlTb3VuZCAtIHBsYXlzIGEgc291bmQgZmlsZSAobXAzLCB3YXYpXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnBsYXlTb3VuZCgnLi4vLi4vc291bmRzL2JsZWF0LndhdicpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIHRoZSB1cmwgb2YgdGhlIGZpbGUgdG8gcGxheS5cclxuICAqL1xyXG4gIHBsYXlTb3VuZCAodXJsKSB7XHJcbiAgICBjb25zdCBhdWRpbyA9IG5ldyB3aW5kb3cuQXVkaW8odXJsKVxyXG4gICAgYXVkaW8ucGxheSgpXHJcbiAgICB0aGlzLnNvdW5kcy5wdXNoKGF1ZGlvKVxyXG4gICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuc291bmRzID0gdGhpcy5zb3VuZHMuZmlsdGVyKChpdGVtKSA9PiBpdGVtICE9PSBhdWRpbylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHBsYXlTb3VuZExvb3AgLSBwbGF5cyBhIHNvdW5kIGZpbGUgKG1wMywgd2F2KSBhZ2FpbiBhbmQgYWdhaW5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMucGxheVNvdW5kTG9vcCgnLi4vLi4vc291bmRzL2JsZWF0LndhdicpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIHRoZSB1cmwgb2YgdGhlIGZpbGUgdG8gcGxheS5cclxuICAqL1xyXG4gIHBsYXlTb3VuZExvb3AgKHVybCkge1xyXG4gICAgY29uc3QgYXVkaW8gPSBuZXcgd2luZG93LkF1ZGlvKHVybClcclxuICAgIGF1ZGlvLnBsYXkoKVxyXG4gICAgdGhpcy5zb3VuZHMucHVzaChhdWRpbylcclxuICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgKCkgPT4ge1xyXG4gICAgICBhdWRpby5jdXJyZW50VGltZSA9IDBcclxuICAgICAgYXVkaW8ucGxheSgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBwbGF5U291bmRVbnRpbERvbmUgLSBwbGF5cyBhIHNvdW5kIGZpbGUgKG1wMywgd2F2KSB1bnRpbCBkb25lLlxyXG4gICogVGhpcyBpcyBzaW1pbGFyIHRvIHBsYXlTb3VuZCBhbmQgd2FpdCBmb3IgdGhlIGR1cmF0aW9uIG9mIHRoZSBzb3VuZC5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMucGxheVNvdW5kVW50aWxEb25lKCcuLi8uLi9zb3VuZHMvYmxlYXQud2F2Jyk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gdGhlIHVybCBvZiB0aGUgZmlsZSB0byBwbGF5LlxyXG4gICovXHJcbiAgcGxheVNvdW5kVW50aWxEb25lICh1cmwsIHRyaWdnZXJpbmdJZCA9IG51bGwpIHtcclxuICAgIC8vIHRyaWdnZXJpbmdJZCBpcyBub3QgdXNlciBzdXBwbGllZCwgaXQgaXMgaW5zZXJ0ZWQgYnkgcmV3cml0ZXIuXHJcbiAgICBjb25zdCBhdWRpbyA9IG5ldyB3aW5kb3cuQXVkaW8odXJsKVxyXG4gICAgYXVkaW8ucGxheSgpXHJcbiAgICB0aGlzLnNvdW5kcy5wdXNoKGF1ZGlvKVxyXG4gICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuc291bmRzID0gdGhpcy5zb3VuZHMuZmlsdGVyKChpdGVtKSA9PiBpdGVtICE9PSBhdWRpbylcclxuICAgICAgdGhpcy5fcmVsZWFzZVdhaXRlZCh0cmlnZ2VyaW5nSWQpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBzdG9wU291bmRzIC0gc3RvcHMgYWxsIHNvdW5kcyBwbGF5ZWQgYnkgc3ByaXRlIG9yIHN0YWdlLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5wbGF5U291bmQoJy4uLy4uL3NvdW5kcy9ibGVhdC53YXYnKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIHN0YWdlLndoZW5LZXlQcmVzc2VkKCdFc2NhcGUnLCAoKSA9PiB7XHJcbiAgKiAgIHRoaXMuc3RvcFNvdW5kcygpO1xyXG4gICogfSk7XHJcbiAgKi9cclxuICBzdG9wU291bmRzICgpIHtcclxuICAgIHRoaXMuc291bmRzLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgaXRlbS5wYXVzZSgpXHJcbiAgICB9KVxyXG4gICAgdGhpcy5zb3VuZHMgPSBbXVxyXG4gIH1cclxuXHJcbiAgLyogY3NzICovXHJcblxyXG4gIC8qKlxyXG4gICogY3NzIC0gYXBwbGllcyBhIENTUyBydWxlIHRvIHRoZSBzcHJpdGUgYW5kIGFsbCBjb3N0dW1lcy5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmNzcygnYmFja2dyb3VuZCcsICcjMDAwMGZmJyk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHByb3AgLSB0aGUgY3NzIHByb3BlcnR5IChlLmcuIGNvbG9yKS4gQWx0ZXJuYXRpdmVseSBhbiBvYmplY3Qgd2l0aCBrZXk6IHZhbHVlIHBhaXJzLlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gdGhlIHZhbHVlIGZvciB0aGUgY3NzIHByb3BlcnR5IChlLmcuICNmZjg4MzMpXHJcbiAgKi9cclxuICBjc3MgKHByb3AsIHZhbHVlID0gbnVsbCkge1xyXG4gICAgY3NzLnJlZ2lzdGVyKHByb3AsIHZhbHVlLCB0aGlzKVxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogYWRkQ2xhc3MgLSBhZGRzIGEgY3NzIGNsYXNzIHRvIHNwcml0ZSBhbmQgYWxsIGNvc3R1bWVzLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkQ2xhc3MoJ3JhaW5ib3cnKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIHRoZSBjc3MgY2xhc3MgbmFtZSB0byBhZGQuXHJcbiAgKi9cclxuICBhZGRDbGFzcyAobmFtZSkge1xyXG4gICAgIXRoaXMuaGFzQ2xhc3MobmFtZSkgPyB0aGlzLmNsYXNzZXMucHVzaChuYW1lKSA6IG51bGxcclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlbW92ZUNsYXNzIC0gcmVtb3ZlcyBhIGNzcyBjbGFzcyBmcm9tIHRoZSBzcHJpdGUgYW5kIGFsbCBjb3N0dW1lcy5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZENsYXNzKCdyYWluYm93Jyk7XHJcbiAgKiBzcHJpdGUucmVtb3ZlQ2xhc3MoJ3JhaW5ib3cnKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIHRoZSBjc3MgY2xhc3MgbmFtZSB0byByZW1vdmUuXHJcbiAgKi9cclxuICByZW1vdmVDbGFzcyAobmFtZSkge1xyXG4gICAgdGhpcy5jbGFzc2VzID0gdGhpcy5jbGFzc2VzLmZpbHRlcigoaXRlbSkgPT4gaXRlbSAhPT0gbmFtZSlcclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGhhc0NsYXNzIC0gaXMgdGhlIGNzcyBjbGFzcyBhcHBsaWVkIHRvIHRoZSBzcHJpdGUgYW5kIGFsbCBjb3N0dW1lcy5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMuaGFzQ2xhc3MoJ3JhaW5ib3cnKSA/IHRoaXMucmVtb3ZlQ2xhc3MoJ3JhaW5ib3cnKSA6IHRoaXMuYWRkQ2xhc3MoJ3JhaW5ib3cnKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gdGhlIGNzcyBjbGFzcyBuYW1lLlxyXG4gICogQHJldHVybiB7Ym9vbGVhbn0gLSBpcyB0aGUgY3NzIGNsYXNzIG5hbWUgb24gdGhlIGxpc3QuXHJcbiAgKi9cclxuICBoYXNDbGFzcyAobmFtZSkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2xhc3Nlcy5pbmRleE9mKG5hbWUpICE9PSAtMVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBjc3MgZnJvbSAnLi9lbGVtZW50LWNzcydcclxuXHJcbi8qKlxyXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBsb29rLlxyXG4gKiBBYnN0cmFjdCBmb3IgQ29zdHVtZSBhbmQgQmFja2Ryb3AuXHJcbiAqIERvIG5vdCBpbnN0YW50aWF0ZSBvYmplY3RzIGRpcmVjdGx5IGZyb20gdGhpcyBjbGFzcy5cclxuICpcclxuICogQHByaXZhdGVcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvb2sge1xyXG4gIC8qKlxyXG4gICogY29uc3RydWN0b3IgLSBMb29rIGlzIGFic3RyYWN0IGZvciBDb3N0dW1lIGFuZCBCYWNrZHJvcC5cclxuICAqL1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMuY3NzUnVsZXMgPSBbXVxyXG4gICAgdGhpcy5jbGFzc2VzID0gW11cclxuICB9XHJcblxyXG4gIC8qKiBMb29rcyAqICovXHJcblxyXG4gIC8qKlxyXG4gICogY3NzIC0gYXBwbGllcyBhIENTUyBydWxlIHRvIGEgQ29zdHVtZSBvciBCYWNrZHJvcC5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IGNvc3R1bWUgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoKTtcclxuICAqXHJcbiAgKiBjb3N0dW1lLmNzcygnZm9udC1zaXplJywgJzE2cHgnKTtcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IGJhY2tkcm9wID0gbmV3IGJsb2NrTGlrZS5CYWNrZHJvcCgpO1xyXG4gICpcclxuICAqIGJhY2tkcm9wLmNzcygnY3Vyc29yJywgJ3BvaW50ZXInKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcCAtIHRoZSBjc3MgcHJvcGVydHkgKGUuZy4gY29sb3IpXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSB0aGUgdmFsdWUgZm9yIHRoZSBjc3MgcHJvcGVydHkgKGUuZy4gI2ZmODgzMylcclxuICAqL1xyXG4gIGNzcyAocHJvcCwgdmFsdWUgPSBudWxsKSB7XHJcbiAgICBjc3MucmVnaXN0ZXIocHJvcCwgdmFsdWUsIHRoaXMpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGFkZENsYXNzIC0gYWRkcyBhIGNzcyBjbGFzcyB0byBjb3N0dW1lLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgY29zdHVtZSA9IG5ldyBibG9ja0xpa2UuQ29zdHVtZSgpO1xyXG4gICpcclxuICAqIGNvc3R1bWUuYWRkQ2xhc3MoJ3JhaW5ib3cnKTtcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IGJhY2tkcm9wID0gbmV3IGJsb2NrTGlrZS5CYWNrZHJvcCgpO1xyXG4gICpcclxuICAqIGJhY2tkcm9wLmFkZENsYXNzKCdyYWluYm93Jyk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSB0aGUgY3NzIGNsYXNzIG5hbWUgdG8gYWRkLlxyXG4gICovXHJcbiAgYWRkQ2xhc3MgKG5hbWUpIHtcclxuICAgICF0aGlzLmhhc0NsYXNzKG5hbWUpID8gdGhpcy5jbGFzc2VzLnB1c2gobmFtZSkgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlbW92ZUNsYXNzIC0gcmVtb3ZlcyBhIGNzcyBjbGFzcyBmcm9tIHRoZSBjb3N0dW1lLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgY29zdHVtZSA9IG5ldyBibG9ja0xpa2UuQ29zdHVtZSgpO1xyXG4gICpcclxuICAqIGNvc3R1bWUuaGFzQ2xhc3MoJ3JhaW5ib3cnKSA/IGNvc3R1bWUucmVtb3ZlQ2xhc3MoJ3JhaW5ib3cnKSA6IGNvc3R1bWUuYWRkQ2xhc3MoJ3JhaW5ib3cnKTtcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IGJhY2tkcm9wID0gbmV3IGJsb2NrTGlrZS5CYWNrZHJvcCgpO1xyXG4gICpcclxuICAqIGJhY2tkcm9wLmhhc0NsYXNzKCdyYWluYm93JykgPyBiYWNrZHJvcC5yZW1vdmVDbGFzcygncmFpbmJvdycpIDogYmFja2Ryb3AuYWRkQ2xhc3MoJ3JhaW5ib3cnKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIHRoZSBjc3MgY2xhc3MgbmFtZSB0byByZW1vdmUuXHJcbiAgKi9cclxuICByZW1vdmVDbGFzcyAobmFtZSkge1xyXG4gICAgdGhpcy5jbGFzc2VzID0gdGhpcy5jbGFzc2VzLmZpbHRlcigoaXRlbSkgPT4gaXRlbSAhPT0gbmFtZSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogaGFzQ2xhc3MgLSBpcyB0aGUgY3NzIGNsYXNzIGFwcGxpZWQgdG8gdGhlIGNvc3R1bWUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBjb3N0dW1lID0gbmV3IGJsb2NrTGlrZS5Db3N0dW1lKCk7XHJcbiAgKlxyXG4gICogY29zdHVtZS5oYXNDbGFzcygncmFpbmJvdycpID8gY29zdHVtZS5yZW1vdmVDbGFzcygncmFpbmJvdycpIDogY29zdHVtZS5hZGRDbGFzcygncmFpbmJvdycpO1xyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgYmFja2Ryb3AgPSBuZXcgYmxvY2tMaWtlLkJhY2tkcm9wKCk7XHJcbiAgKlxyXG4gICogYmFja2Ryb3AuaGFzQ2xhc3MoJ3JhaW5ib3cnKSA/IGJhY2tkcm9wLnJlbW92ZUNsYXNzKCdyYWluYm93JykgOiBiYWNrZHJvcC5hZGRDbGFzcygncmFpbmJvdycpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gdGhlIGNzcyBjbGFzcyBuYW1lLlxyXG4gICogQHJldHVybiB7Ym9vbGVhbn0gLSBpcyB0aGUgY3NzIGNsYXNzIG5hbWUgb24gdGhlIGxpc3QuXHJcbiAgKi9cclxuICBoYXNDbGFzcyAobmFtZSkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2xhc3Nlcy5pbmRleE9mKG5hbWUpICE9PSAtMVxyXG4gIH1cclxufVxyXG4iLCIvKipcclxuKiBwbGF0Zm9ybXMgLSBjb2xsZWN0aW9uIG9mIHRoaW5ncyB0byBlbnN1cmUgaXQgcGxheXMgbmljZWx5IHdpdGggY29kaW5nIHBsYXRmb3Jtcy5cclxuKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGxhdGZvcm1zICgpIHtcclxuICAvKipcclxuICAqIGNvZGVwZW4uaW9cclxuICAqIFBhY2VkIGFuZCBXYWl0ZWQgbWV0aG9kcyB0cmlnZ2VyIHRoZSBwcm90ZWN0aW9uIC0gaGVuY2Ugd2UgcHJvbG9uZyBpdC5cclxuICAqIGh0dHBzOi8vYmxvZy5jb2RlcGVuLmlvLzIwMTYvMDYvMDgvY2FuLWFkanVzdC1pbmZpbml0ZS1sb29wLXByb3RlY3Rpb24tdGltaW5nL1xyXG4gICovXHJcbiAgaWYgKHdpbmRvdy5DUCkge1xyXG4gICAgd2luZG93LkNQLlBlblRpbWVyLk1BWF9USU1FX0lOX0xPT1BfV09fRVhJVCA9IDYwMDAwXHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4qIEVuY2Fwc3VsYXRlcyB0aGUgZnVuY3Rpb25hbGl0eSBvZiByZXdyaXRpbmcgdXNlciBjb2RlIHRvIGFsbG93IGZvciBCbG9ja0xpa2UuanMgZmVhdHVyZXMuXHJcbiovXHJcblxyXG4vKipcclxuKiBjb3VudENoYXIgLSBjb3VudCBob3cgbWFueSB0aW1lcyBhIGdpdmVuIGNoYXJhY3RlciAob3Igc3RyaW5nKSBhcHBlYXJzIGluIGFub3RoZXIgc3RyaW5nLlxyXG4qIGhlbHBlciBmb3IgZXZlbnRlZCBza2lwcGluZyBhbmQgbWV0aG9kIHJld3JpdGluZy5cclxuKlxyXG4qIEBwYXJhbSB7c3RyaW5nfSBzdHIgLSBhIGxpbmUgb2YgY29kZS5cclxuKiBAcGFyYW0ge3N0cmluZ30gY2hhciAtIGEgc3RyaW5nIHRvIGxvb2sgZm9yLlxyXG4qXHJcbiogQHJldHVybiB7bnVtYmVyfSAtIHRoZSBudW1iZXIgb2YgdGltZXMgZm91bmQuXHJcbiovXHJcbmZ1bmN0aW9uIGNvdW50Q2hhciAoc3RyLCBjaGFyKSB7XHJcbiAgY29uc3QgcmVnRXhwID0gbmV3IFJlZ0V4cChgXFxcXCR7Y2hhcn1gLCAnZycpXHJcbiAgcmV0dXJuIChzdHIubWF0Y2gocmVnRXhwKSB8fCBbXSkubGVuZ3RoXHJcbn1cclxuXHJcbi8qKlxyXG4qIHJlcGxhY2VVc2VyU3RyaW5nV2l0aEJsYW5rcyAtIGZvciBhIGdpdmVuIGxpbmUgb2YgY29kZSwgcmVwbGFjZXMgYWxsIG9jY3VycmVuY2VzIG9mXHJcbiogdXNlciBwcm92aWRlZCBzdHJpbmdzIHdpdGggYSBzZXF1ZW5jZSBvZiBzcGFjZXMgb2YgdGhlIHNhbWUgbGVuZ3RoLlxyXG4qIGhlbHBlciBmb3IgZXZlbnRlZCBza2lwcGluZyBhbmQgbWV0aG9kIHJld3JpdGluZy5cclxuKlxyXG4qIEBwYXJhbSB7c3RyaW5nfSBsaW5lIC0gYSBsaW5lIG9mIGNvZGUuXHJcbiogQHJldHVybiB7c3RyaW5nfSAtIHRoZSBsaW5lIHdpdGhvdXQgc3RyaW5ncy5cclxuKi9cclxuZnVuY3Rpb24gcmVwbGFjZVVzZXJTdHJpbmdXaXRoQmxhbmtzIChsaW5lKSB7XHJcbiAgcmV0dXJuIGxpbmUucmVwbGFjZSgvXCIoLio/KVwifCcoLio/KSd8YCguKj8pYC9nLCAnICcpXHJcbn1cclxuXHJcbi8qKlxyXG4qIGlzTWV0aG9kSW5TdHJpbmcgLSBjaGVja3MgYSBzdHJpbmcgYWdhaW5zdCBhbiBhcnJheSBvZiBtZXRob2QgbmFtZXMuXHJcbipcclxuKiBAcGFyYW0ge3N0cmluZ30gc3RyIC0gYSBsaW5lIG9mIGNvZGUuXHJcbiogQHBhcmFtIHtBcnJheX0gYXJyIC0gYW4gYXJyYXkgb2YgbWV0aG9kIG5hbWVzLlxyXG4qXHJcbiogQHJldHVybiB7Ym9vbGVhbn0gLSBpcyB0aGUgbWV0aG9kIGluIHRoZSBzdHJpbmcuXHJcbiovXHJcbmZ1bmN0aW9uIGlzTWV0aG9kSW5TdHJpbmcgKGFyciwgc3RyKSB7XHJcbiAgcmV0dXJuIChhcnIuc29tZSgobWV0aG9kKSA9PiBzdHIuaW5kZXhPZihgLiR7bWV0aG9kfShgKSAhPT0gLTEpKVxyXG59XHJcblxyXG4vKipcclxuKiBpc1BhY2VkIC0gY2hlY2tzIGlmIGEgbGluZSBvZiBjb2RlIGluY2x1ZGVzIGEgcGFjZWQgbWV0aG9kLlxyXG4qXHJcbiogQHBhcmFtIHtzdHJpbmd9IGl0ZW0gLSBhIGxpbmUgb2YgY29kZS5cclxuKiBAcGFyYW0ge2VudGl0eX0gZW50aXR5IC0gdGhlIGVudGl0eSB0cmlnZ2VyaW5nIHRoZSBtZXRob2QuXHJcbipcclxuKiBAcmV0dXJuIHtzdHJpbmd9IC0gaXMgcGFjZWQgaW4gY29kZS5cclxuKi9cclxuZnVuY3Rpb24gaXNQYWNlZCAoaXRlbSwgZW50aXR5KSB7XHJcbiAgcmV0dXJuIGlzTWV0aG9kSW5TdHJpbmcoZW50aXR5LnBhY2VkLCBpdGVtKVxyXG59XHJcblxyXG4vKipcclxuKiBpc1dhaXRlZCAtIGNoZWNrcyBpZiBhIGxpbmUgb2YgY29kZSBpbmNsdWRlcyBhIHdhaXRlZCBtZXRob2QuXHJcbipcclxuKiBAcGFyYW0ge3N0cmluZ30gaXRlbSAtIGEgbGluZSBvZiBjb2RlLlxyXG4qIEBwYXJhbSB7ZW50aXR5fSBlbnRpdHkgLSB0aGUgZW50aXR5IHRyaWdnZXJpbmcgdGhlIG1ldGhvZC5cclxuKlxyXG4qIEByZXR1cm4ge3N0cmluZ30gLSBpcyB3YWl0ZWQgaW4gY29kZS5cclxuKi9cclxuZnVuY3Rpb24gaXNXYWl0ZWQgKGl0ZW0sIGVudGl0eSkge1xyXG4gIHJldHVybiBpc01ldGhvZEluU3RyaW5nKGVudGl0eS53YWl0ZWQsIGl0ZW0pXHJcbn1cclxuXHJcbi8qKlxyXG4qIGlzRXZlbnRlZCAtIGNoZWNrcyBpZiBhIGxpbmUgb2YgY29kZSBpbmNsdWRlcyBhbiBldmVudGVkIG1ldGhvZC5cclxuKlxyXG4qIEBwYXJhbSB7c3RyaW5nfSBpdGVtIC0gYSBsaW5lIG9mIGNvZGUuXHJcbiogQHBhcmFtIHtlbnRpdHl9IGVudGl0eSAtIHRoZSBlbnRpdHkgdHJpZ2dlcmluZyB0aGUgbWV0aG9kLlxyXG4qXHJcbiogQHJldHVybiB7c3RyaW5nfSAtIGlzIGV2ZW50ZWQgaW4gY29kZS5cclxuKi9cclxuZnVuY3Rpb24gaXNFdmVudGVkIChpdGVtLCBlbnRpdHkpIHtcclxuICByZXR1cm4gaXNNZXRob2RJblN0cmluZyhlbnRpdHkuZXZlbnRlZCwgaXRlbSlcclxufVxyXG5cclxuLyoqXHJcbiogd2hpY2hXYWl0ZWRSZXR1cm4gLSBjaGVja3MgaWYgYSBsaW5lIG9mIGNvZGUgaW5jbHVkZXMgYSB3YWl0ZWRSZXR1cm4gbWV0aG9kLlxyXG4qXHJcbiogQHBhcmFtIHtzdHJpbmd9IGl0ZW0gLSBhIGxpbmUgb2YgY29kZS5cclxuKiBAcGFyYW0ge2VudGl0eX0gZW50aXR5IC0gdGhlIGVudGl0eSB0cmlnZ2VyaW5nIHRoZSBtZXRob2QuXHJcbipcclxuKiBAcmV0dXJuIHtzdHJpbmd9IC0gdGhlIHdhaXRlZFJldHVybiBtZXRob2QgZm91bmQgb3IgbnVsbC5cclxuKi9cclxuZnVuY3Rpb24gd2hpY2hXYWl0ZWRSZXR1cm4gKGl0ZW0sIGVudGl0eSkge1xyXG4gIHJldHVybiBlbnRpdHkud2FpdGVkUmV0dXJuZWQuZmluZCgobWV0aG9kKSA9PiAoaXRlbS5pbmRleE9mKGAuJHttZXRob2R9KGApICE9PSAtMSA/IG1ldGhvZCA6IGZhbHNlKSlcclxufVxyXG5cclxuLyoqXHJcbiogaW5zZXJ0TG9vcFByb3RlY3Rpb24tIGluc2VydHMgYSB6ZXJvIHRpbWVkIGF3YWl0IGxpbmUgYWZ0ZXIgYSB3aGlsZSBkZWNlbGVyYXRpb24uXHJcbipcclxuKiBAcGFyYW0ge3N0cmluZ30gaXRlbSAtIGEgbGluZSBvZiBjb2RlLlxyXG4qIEBwYXJhbSB7ZW50aXR5fSBlbnRpdHkgLSB0aGUgZW50aXR5IHRyaWdnZXJpbmcgdGhlIG1ldGhvZC5cclxuKlxyXG4qIEByZXR1cm4ge3N0cmluZ30gLSBhIG1vZGlmaWVkIGxpbmUgb2YgY29kZS5cclxuKi9cclxuZnVuY3Rpb24gaW5zZXJ0TG9vcFByb3RlY3Rpb24gKGl0ZW0sIGVudGl0eSkge1xyXG4gIGNvbnN0IGNoZWNrID0gaXRlbS5yZXBsYWNlKC9cXHMrL2csICcnKVxyXG5cclxuICBjb25zdCByZWdFeHAgPSAvd2hpbGVcXChbXFxTXSpcXCl7fGZvclxcKFtcXFNdKlxcKXt8ZG9bXFxTXSp7L1xyXG4gIGNvbnN0IG1hdGNoZXMgPSByZWdFeHAuZXhlYyhjaGVjaylcclxuXHJcbiAgY29uc3QgY29kZSA9IGAke2l0ZW19XFxuIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAwKSk7YFxyXG4gIHJldHVybiBtYXRjaGVzID8gY29kZSA6IGl0ZW1cclxufVxyXG5cclxuLyoqXHJcbiogaW5zZXJ0UGFjZWQgLSBpbnNlcnRzIGEgdGltZWQgYXdhaXQgbGluZSBhZnRlciBhbnkgbWV0aG9kIHRoYXQgaXMgb24gdGhlIGxpc3Qgb2YgcGFjZWQgbWV0aG9kcy5cclxuKlxyXG4qIEBwYXJhbSB7c3RyaW5nfSBpdGVtIC0gYSBsaW5lIG9mIGNvZGUuXHJcbiogQHBhcmFtIHtlbnRpdHl9IGVudGl0eSAtIHRoZSBlbnRpdHkgdHJpZ2dlcmluZyB0aGUgbWV0aG9kLlxyXG4qXHJcbiogQHJldHVybiB7c3RyaW5nfSAtIGEgbW9kaWZpZWQgbGluZSBvZiBjb2RlLlxyXG4qL1xyXG5mdW5jdGlvbiBpbnNlcnRQYWNlZCAoaXRlbSwgZW50aXR5KSB7XHJcbiAgY29uc3QgY29kZSA9IGAke2l0ZW19XFxuIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAke2VudGl0eS5wYWNlfSkpO2BcclxuICByZXR1cm4gZW50aXR5LnBhY2UgJiYgaXNQYWNlZChyZXBsYWNlVXNlclN0cmluZ1dpdGhCbGFua3MoaXRlbSksIGVudGl0eSkgPyBjb2RlIDogaXRlbVxyXG59XHJcblxyXG4vKipcclxuKiBpbnNlcnRXYWl0ZWQgLSBpbnNlcnRzIHRoZSBcIm1lY2hhbmlzbVwiIHRoYXQgc3RvcHMgZXhlY3V0aW9uIGFuZCBhd2FpdHMgZm9yIHRoZSBtZXRob2QgdG8gZmluaXNoLlxyXG4qXHJcbiogQHBhcmFtIHtzdHJpbmd9IGl0ZW0gLSBhIGxpbmUgb2YgY29kZS5cclxuKiBAcGFyYW0ge2VudGl0eX0gZW50aXR5IC0gdGhlIGVudGl0eSB0cmlnZ2VyaW5nIHRoZSBtZXRob2QuXHJcbipcclxuKiBAcmV0dXJuIHtzdHJpbmd9IC0gYSBtb2RpZmllZCAobXVsdGkpbGluZSBvZiBjb2RlLlxyXG4qL1xyXG5mdW5jdGlvbiBpbnNlcnRXYWl0ZWQgKGl0ZW0sIGVudGl0eSkge1xyXG4gIGxldCBmb3VuZCA9IG51bGxcclxuICBsZXQgY29kZVxyXG5cclxuICAvLyBsb29rIGZvciB3YWl0ZWQgbWV0aG9kcy5cclxuICBmb3VuZCA9IGlzV2FpdGVkKHJlcGxhY2VVc2VyU3RyaW5nV2l0aEJsYW5rcyhpdGVtKSwgZW50aXR5KVxyXG5cclxuICAvLyBub3QgYSBub3JtYWwgXCJ3YWl0ZWRcIi4gbG9vayBmb3Igd2FpdGVkUmV0dXJuZWQuXHJcbiAgaWYgKCFmb3VuZCkge1xyXG4gICAgbGV0IHRoZVZhciA9IG51bGxcclxuXHJcbiAgICBmb3VuZCA9IHdoaWNoV2FpdGVkUmV0dXJuKHJlcGxhY2VVc2VyU3RyaW5nV2l0aEJsYW5rcyhpdGVtKSwgZW50aXR5KVxyXG5cclxuICAgIC8vIGNvZGUgZm9yIHdhaXRlZFJldHVyblxyXG4gICAgdGhlVmFyID0gaXRlbS5zdWJzdHIoMCwgaXRlbS5pbmRleE9mKCc9JykpXHJcbiAgICAgIC5yZXBsYWNlKCdsZXQnLCAnJylcclxuICAgICAgLnJlcGxhY2UoJ3ZhcicsICcnKVxyXG4gICAgICAucmVwbGFjZSgnY29uc3QnLCAnJylcclxuICAgICAgLnRyaW0oKVxyXG5cclxuICAgIGNvZGUgPSBgJHtpdGVtLnN1YnN0cmluZygwLCBpdGVtLmxhc3RJbmRleE9mKCcpJykpfSwgJyR7dGhlVmFyfScsICcke2VudGl0eS50cmlnZ2VyaW5nSWR9JylgXHJcblxyXG4gICAgLy8gaW52b2tlIGlzIFwiZm9yZ2l2aW5nXCIuIG1heSwgb3IgbWF5IG5vdCwgaGF2ZSB2YXJpYWJsZXMuXHJcbiAgICBmb3VuZCA9PT0gJ2ludm9rZScgJiYgKGl0ZW0uaW5kZXhPZignLCcpID09PSAtMSkgPyBjb2RlID0gYCR7aXRlbS5zdWJzdHJpbmcoMCwgaXRlbS5sYXN0SW5kZXhPZignKScpKX0sIFtdLCAnJHt0aGVWYXJ9JywgJyR7ZW50aXR5LnRyaWdnZXJpbmdJZH0nKWAgOiBudWxsXHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIGNvZGUgZm9yIFwibm9ybWFsXCIgd2FpdGVkXHJcbiAgICBjb2RlID0gYCR7aXRlbS5zdWJzdHJpbmcoMCwgaXRlbS5sYXN0SW5kZXhPZignKScpKX0sICcke2VudGl0eS50cmlnZ2VyaW5nSWR9JylgXHJcbiAgfVxyXG5cclxuICAvLyBlbnRpdHkudHJpZ2dlcmluZ0lkIGNyZWF0ZXMgYSB1bmlxdWUgY29udGV4dCB0byBjaGFpbiB0aGUgd2FpdGVkIG1ldGhvZHMuXHJcbiAgY29kZSA9IGAke2NvZGV9XFxuIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdibG9ja0xpa2Uud2FpdGVkLiR7ZW50aXR5LnRyaWdnZXJpbmdJZH0nLCBmdW5jdGlvbiB3YWl0ZWRMaXN0ZW5lcihlKSB7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmxvY2tMaWtlLndhaXRlZC4ke2VudGl0eS50cmlnZ2VyaW5nSWR9Jywgd2FpdGVkTGlzdGVuZXIpO1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtgXHJcblxyXG4gIHJldHVybiBmb3VuZCA/IGNvZGUgOiBpdGVtXHJcbn1cclxuXHJcbi8qKlxyXG4qIGluc2VydEFzeW5jIC0gQWRkcyBrZXl3b3JkIGFzeW5jIHRvIGZ1bmN0aW9uIGRlY2VsZXJhdGlvbiBpZiBub3QgcHJlc2VudFxyXG4qIFdpbGwgY2F0Y2g6XHJcbiogLSBhbGwgbmFtZWQgZnVuY3Rpb24gZGVjZWxlcmF0aW9ucyB3aXRoIGEgc3BhY2UgYWZ0ZXIgdGhlIGtleXdvcmQgJ2Z1bmN0aW9uJ1xyXG4qIC0gYW55dGhpbmcgdGhhdCBoYXMgYSBmYXQgYXJyb3cgd2l0aCBhbnkgb2Ygc2V2ZXJhbCB2YXJpYWJsZSBwYXR0ZXJucyBiZWZvcmUgaXQuXHJcbipcclxuKiBAcGFyYW0ge3N0cmluZ30gaXRlbSAtIGEgbGluZSBvZiBjb2RlLlxyXG4qIEByZXR1cm4ge3N0cmluZ30gLSBhIG1vZGlmaWVkIGxpbmUgb2YgY29kZS5cclxuKi9cclxuZnVuY3Rpb24gaW5zZXJ0QXN5bmMgKGl0ZW0pIHtcclxuICBjb25zdCBleGlzdCA9IGl0ZW0uaW5kZXhPZignYXN5bmMgJylcclxuXHJcbiAgLy8gZnVuY3Rpb24gZGVjbGFyYXRpb25cclxuICBsZXQgcmVnRXhwID0gL2Z1bmN0aW9uKFxccyo/W2EtekEtWl1cXHcqXFxzKj9cXCh8XFxzKj9cXCgpL1xyXG4gIGxldCBtYXRjaGVzID0gcmVnRXhwLmV4ZWMocmVwbGFjZVVzZXJTdHJpbmdXaXRoQmxhbmtzKGl0ZW0pKVxyXG5cclxuICAvLyBvciBhcnJvd1xyXG4gIGlmICghbWF0Y2hlcykge1xyXG4gICAgcmVnRXhwID0gLyhbYS16QS1aXVxcdyp8XFwoXFxzKj9bYS16QS1aXVxcdyooLFxccypbYS16QS1aXVxcdyopKlxccyo/XFwpKVxccyo/PT4vXHJcbiAgICBtYXRjaGVzID0gcmVnRXhwLmV4ZWMocmVwbGFjZVVzZXJTdHJpbmdXaXRoQmxhbmtzKGl0ZW0pKVxyXG4gIH1cclxuICByZXR1cm4gZXhpc3QgPT09IC0xICYmIG1hdGNoZXMgPyBgJHtpdGVtLnN1YnN0cmluZygwLCBtYXRjaGVzLmluZGV4KX1hc3luYyAke2l0ZW0uc3Vic3RyaW5nKG1hdGNoZXMuaW5kZXgsIGl0ZW0ubGVuZ3RoKX1gIDogaXRlbVxyXG59XHJcblxyXG4vKipcclxuKiBlbXB0eUxvb3BQcm90ZWN0aW9uIC0gZXhhbWluZXMgdGhlIGNvZGUgZm9yIHdoaWxlIGFuZCBmb3Igc3RhdGVtZW50cyB0aGF0IGFyZSBlbXB0eS5cclxuKiBOb3RlOiBzaW5jZSB3aGlsZSh0cnVlKXt9IGlzIGxpa2VseSB0byBiZSBjb2RlZCBieSB0aGUgdXNlciB0aGlzIHByZXZlbnRzIGluZmluaXRlIGxvb3BzLlxyXG4qXHJcbiogQHBhcmFtIHtzdHJpbmd9IGl0ZW0gLSBhIGxpbmUgb2YgY29kZS5cclxuKiBAcmV0dXJuIHtzdHJpbmd9IC0gYSBtb2RpZmllZCBsaW5lIG9mIGNvZGUuXHJcbiovXHJcbmZ1bmN0aW9uIGVtcHR5TG9vcFByb3RlY3Rpb24gKGZ1bmNTKSB7XHJcbiAgY29uc3QgY2hlY2sgPSBmdW5jUy5yZXBsYWNlKC9cXHMrL2csICcnKS5yZXBsYWNlKC9cXHI/XFxufFxcci9nLCAnJylcclxuXHJcbiAgY29uc3QgcmVnRXhwID0gL3doaWxlXFwoW1xcc1xcU10qXFwpe318Zm9yXFwoW1xcc1xcU10qXFwpe318ZG97fXdoaWxlXFwoW1xcc1xcU10qXFwpL1xyXG4gIGNvbnN0IG1hdGNoZXMgPSByZWdFeHAuZXhlYyhjaGVjaylcclxuXHJcbiAgcmV0dXJuICEhbWF0Y2hlc1xyXG59XHJcblxyXG4vKipcclxuKiByZW1vdmVPdXRlciAtIFJlbW92ZXMgdGhlIG91dGVyIGZ1bmN0aW9uIGRlZmluaXRpb24gYW5kIHJldHVybnMgdGhlIGZ1bmN0aW9uIGNvZGUgYm9keS5cclxuKlxyXG4qIEBwYXJhbSB7c3RyaW5nfSBmdW5jUyAtIHRoZSBmdW5jdGlvbiBiZWluZyByZXdyaXR0ZW4uXHJcbiogQHJldHVybiB7c3RyaW5nfSAtIHRoZSBib2R5IG9mIHRoZSBmdW5jdGlvbi5cclxuKi9cclxuZnVuY3Rpb24gcmVtb3ZlT3V0ZXIgKGZ1bmNTKSB7XHJcbiAgcmV0dXJuIGZ1bmNTLnN1YnN0cmluZyhmdW5jUy5pbmRleE9mKCd7JykgKyAxLCBmdW5jUy5sYXN0SW5kZXhPZignfScpKVxyXG59XHJcblxyXG4vKipcclxuKiByZW1vdmVDb21tZW50cyAtIFJlbW92ZXMgY29tbWVudHMgZnJvbSBjb2RlLlxyXG4qIGZyb206IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNTEyMzc3N1xyXG4qXHJcbiogQHBhcmFtIHtzdHJpbmd9IGZ1bmNTIC0gdGhlIGZ1bmN0aW9uIGJlaW5nIHJld3JpdHRlbi5cclxuKiBAcmV0dXJuIHtzdHJpbmd9IC0gdGhlIGZ1bmN0aW9uIHdpdGhvdXQgY29tbWVudHMuXHJcbiovXHJcbmZ1bmN0aW9uIHJlbW92ZUNvbW1lbnRzIChmdW5jUykge1xyXG4gIHJldHVybiBmdW5jUy5yZXBsYWNlKC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvfChbXlxcXFw6XXxeKVxcL1xcLy4qJC9nbSwgJycpXHJcbn1cclxuXHJcbi8qKlxyXG4qIGdldEV2ZW50T2JqZWN0VmFyTmFtZSAtIGV4dHJhY3RzIHRoZSB2YXJpYWJsZSBuYW1lIHRoYXQgaG9sZHMgdGhlIGV2ZW50IG9iamVjdC5cclxuKlxyXG4qIEBwYXJhbSB7c3RyaW5nfSBmdW5jUyAtIHRoZSBmdW5jdGlvbiBiZWluZyByZXdyaXR0ZW4uXHJcbiogQHJldHVybiB7c3RyaW5nfSAtIHRoZSB2YXJpYWJsZSBuYW1lLlxyXG4qL1xyXG5mdW5jdGlvbiBnZXRFdmVudE9iamVjdFZhck5hbWUgKGZ1bmNTKSB7XHJcbiAgcmV0dXJuIGZ1bmNTLnN1YnN0cmluZyhmdW5jUy5pbmRleE9mKCcoJykgKyAxLCBmdW5jUy5pbmRleE9mKCcpJykpXHJcbn1cclxuXHJcbi8qKlxyXG4qIHJld3JpdGUgLSByZXdyaXRlcyBhIGZ1bmN0aW9uIHRvIGFuIGFzeW5jIHZlcnNpb24gdGhhdCBpcyBcInBhY2VkXCIgdXNpbmcgYXdhaXRpbmcgZm9yIHByb21pc2VzLlxyXG4qIFRoaXMgYWxsb3dzIHRoZSB1c2VyIHRvIHdyaXRlIHNlcXVlbnRpYWwgc2ltcGxlIGNvZGUgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGluIGEgcGFjZWQgbWFubmVyLlxyXG4qXHJcbiogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyAtIGEgZnVuY3Rpb24gdG8gcmV3cml0ZVxyXG4qIEBwYXJhbSAtIHtPYmplY3R9IGVudGl0eSAtIGEgc3ByaXRlIG9yIHN0YWdlIG9iamVjdCB0byB3aGljaCB0aGUgZnVuY3Rpb24gYXBwbGllcy5cclxuKiBAcmV0dXJuIHtmdW5jdGlvbn0gLSBhbiBhc3luYyBtb2RpZmllZCBmdW5jdGlvbi5cclxuKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmV3cml0ZSAoZnVuYywgZW50aXR5KSB7XHJcbiAgbGV0IGNvZGUgPSBmdW5jLnRvU3RyaW5nKClcclxuICBjb25zdCB0aGVWYXIgPSBnZXRFdmVudE9iamVjdFZhck5hbWUoY29kZSlcclxuXHJcbiAgLy8gcmV3cml0ZSB0aGUgY29kZVxyXG4gIGlmIChlbXB0eUxvb3BQcm90ZWN0aW9uKGNvZGUpKSB7XHJcbiAgICBjb2RlID0gJ3Rocm93IFxcJ0Jsb2NrTGlrZS5qcyBFcnJvcjogRW1wdHkgbG9vcCBkZXRlY3RlZFxcJzsnXHJcbiAgfSBlbHNlIHtcclxuICAgIGNvZGUgPSByZW1vdmVDb21tZW50cyhyZW1vdmVPdXRlcihjb2RlKSlcclxuICAgIGNvZGUgPSBjb2RlLnNwbGl0KCdcXG4nKS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0udHJpbSgpLmxlbmd0aCAhPT0gMClcclxuXHJcbiAgICAvLyBjb3VudGVyIGZvciBvcGVuIHBhcmVudGhlc2VzLlxyXG4gICAgbGV0IGV2ZW50ZWRPcGVuUGFyZW4gPSAwXHJcbiAgICAvLyBsZXQgaGFzUGFjZWRDb2RlID0gZmFsc2VcclxuXHJcbiAgICBjb2RlID0gY29kZS5tYXAoKGl0ZW0pID0+IHtcclxuICAgICAgY29uc3QgdGVtcCA9IGl0ZW1cclxuICAgICAgbGV0IHJlc3VsdCA9IHRlbXBcclxuXHJcbiAgICAgIC8vIGludGVybmFsIGV2ZW50ZWQgbWV0aG9kcyBhcmUgc2tpcHBlZFxyXG4gICAgICBpZiAoaXNFdmVudGVkKHRlbXAsIGVudGl0eSkgfHwgZXZlbnRlZE9wZW5QYXJlbikge1xyXG4gICAgICAgIGV2ZW50ZWRPcGVuUGFyZW4gKz0gKGNvdW50Q2hhcihyZXBsYWNlVXNlclN0cmluZ1dpdGhCbGFua3ModGVtcCksICcoJykgLSBjb3VudENoYXIocmVwbGFjZVVzZXJTdHJpbmdXaXRoQmxhbmtzKHRlbXApLCAnKScpKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIChpc1BhY2VkKHRlbXAsIGVudGl0eSkpIGhhc1BhY2VkQ29kZSA9IHRydWVcclxuICAgICAgICAvLyBhIG1ldGhvZCBjYW4gYmUgb25lIG9mIHRoZSBmb2xsb3dpbmcgYnV0IG5vdCBtb3JlIHRoYW4gb25lXHJcbiAgICAgICAgcmVzdWx0ID09PSB0ZW1wID8gcmVzdWx0ID0gaW5zZXJ0UGFjZWQodGVtcCwgZW50aXR5KSA6IG51bGwgLy8gbW9yZSBsaWtlbHlcclxuICAgICAgICByZXN1bHQgPT09IHRlbXAgPyByZXN1bHQgPSBpbnNlcnRXYWl0ZWQodGVtcCwgZW50aXR5KSA6IG51bGwgLy8gbGVzcyBsaWtlbHlcclxuXHJcbiAgICAgICAgLy8gYW5kIG9ubHkgaWYgbm90IGEgbWV0aG9kIHdpbGwgYWRkIGFzeW5jIHRvIGZ1bmN0aW9uc1xyXG4gICAgICAgIHJlc3VsdCA9PT0gdGVtcCA/IHJlc3VsdCA9IGluc2VydEFzeW5jKHRlbXApIDogbnVsbFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpbnNlcnQgYSBwYWNlZCBwcm9taXNlIHJlc29sdmUgYXQgdGhlIHN0YXJ0IG9mIGEgbG9vcCBibG9jayAodW5kZXIgY2VydGFpbiBjb25kaXRpb25zKVxyXG4gICAgICAvLyB0aGlzIGNhdXNlcyB0aGUgY29kZSB0byBza2lwIGFuIGV2ZW50IGxvb3AgYW5kIHByZXZlbnRzIGVuZGxlc3MgbG9vcHNcclxuICAgICAgcmVzdWx0ID0gaW5zZXJ0TG9vcFByb3RlY3Rpb24ocmVzdWx0LCBlbnRpdHkpXHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICB9KVxyXG5cclxuICAgIGNvZGUgPSBjb2RlLmpvaW4oJ1xcbicpXHJcbiAgfVxyXG5cclxuICAvLyB0cmFuc2Zvcm0gdGhlIHRleHQgaW50byBhIGZ1bmN0aW9uXHJcbiAgY29uc3QgQXN5bmNGdW5jdGlvbiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihhc3luYyAoKSA9PiB7fSkuY29uc3RydWN0b3JcclxuICBsZXQgYWYgPSBuZXcgQXN5bmNGdW5jdGlvbihjb2RlKVxyXG5cclxuICAvLyBwYXNzIHRoZSBldmVudCBvYmplY3QgdG8gdGhlIGZ1bmN0aW9uIGlmIGV4aXN0cy5cclxuICB0aGVWYXIgPyBhZiA9IG5ldyBBc3luY0Z1bmN0aW9uKHRoZVZhciwgY29kZSkgOiBudWxsXHJcblxyXG4gIHdpbmRvdy5ibG9ja0xpa2UgJiYgd2luZG93LmJsb2NrTGlrZS5kZWJ1ZyA/IGNvbnNvbGUubG9nKGFmKSA6IG51bGwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXHJcblxyXG4gIHJldHVybiBhZlxyXG59XHJcbiIsImltcG9ydCAqIGFzIGNzcyBmcm9tICcuL2VsZW1lbnQtY3NzJ1xyXG5cclxuLyoqXHJcbiAqIENsYXNzIHJlcHJlc2VudGluZyB0aGUgVUkgRWxlbWVudCBvZiB0aGUgc3ByaXRlLlxyXG4gKiBFYWNoIFNwcml0ZSBoYXMgb25lLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3ByaXRlRWxlbWVudCB7XHJcbiAgLyoqXHJcbiAgKiBjb25zdHJ1Y3RvciAtIENyZWF0ZXMgYSBTcHJpdGUgRWxlbWVudC5cclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gdGhlIHNwcml0ZSBmb3Igd2hpY2ggdGhlIGVsZW1lbnQgaXMgY3JlYXRlZC5cclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzdGFnZSAtIHRoZSBzdGFnZSB0byB3aGljaCB0aGUgc3ByaXRlIGlzIGFkZGVkLlxyXG4gICovXHJcbiAgY29uc3RydWN0b3IgKHNwcml0ZSwgc3RhZ2UpIHtcclxuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuXHJcbiAgICBlbC5pZCA9IGAke3Nwcml0ZS5pZH1gXHJcbiAgICBlbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcclxuICAgIGVsLnN0eWxlLnRvdWNoQWN0aW9uID0gJ21hbmlwdWxhdGlvbidcclxuXHJcbiAgICBzdGFnZS5lbGVtZW50LmVsLmFwcGVuZENoaWxkKGVsKVxyXG5cclxuICAgIHRoaXMuZWwgPSBlbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiB1cGRhdGUgLSB1cGRhdGVzIHRoZSBET00gZWxlbWVudC4gVGhpcyBpcyBhbHdheXMgY2FsbGVkIGFmdGVyIHRoZSBjb25zdHJ1Y3Rvci5cclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gdGhlIHNwcml0ZSB0byB1cGRhdGUuXHJcbiAgKi9cclxuICB1cGRhdGUgKHNwcml0ZSkge1xyXG4gICAgY29uc3QgZWwgPSBzcHJpdGUuZWxlbWVudC5lbFxyXG4gICAgLy8gQ29udmVydCB0aGUgY2VudGVyIGJhc2VkIHggY29vcmRpbmF0ZSB0byBhIGxlZnQgYmFzZWQgb25lLlxyXG4gICAgY29uc3QgeCA9IHNwcml0ZS54IC0gKHNwcml0ZS53aWR0aCAvIDIpXHJcbiAgICAvLyBDb252ZXJ0IHRoZSBjZW50ZXIgYmFzZWQgeSBjb29yZGluYXRlIHRvIGEgbGVmdCBiYXNlZCBvbmUuXHJcbiAgICBjb25zdCB5ID0gKHNwcml0ZS55ICogLTEpIC0gKHNwcml0ZS5oZWlnaHQgLyAyKVxyXG5cclxuICAgIC8vIENvc3R1bWVcclxuICAgIGlmIChzcHJpdGUuY29zdHVtZSkge1xyXG4gICAgICBlbC5zdHlsZS53aWR0aCA9IGAke3Nwcml0ZS5jb3N0dW1lLnZpc2libGVXaWR0aH1weGBcclxuICAgICAgZWwuc3R5bGUuaGVpZ2h0ID0gYCR7c3ByaXRlLmNvc3R1bWUudmlzaWJsZUhlaWdodH1weGBcclxuICAgIH1cclxuXHJcbiAgICBlbC5zdHlsZS5sZWZ0ID0gYCR7KHNwcml0ZS5zdGFnZVdpZHRoIC8gMikgKyB4fXB4YFxyXG4gICAgZWwuc3R5bGUudG9wID0gYCR7KHNwcml0ZS5zdGFnZUhlaWdodCAvIDIpICsgeX1weGBcclxuICAgIGVsLnN0eWxlLnpJbmRleCA9IHNwcml0ZS56XHJcblxyXG4gICAgZWwuc3R5bGUudmlzaWJpbGl0eSA9IGAkeyhzcHJpdGUuc2hvd2luZyA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nKX1gXHJcblxyXG4gICAgLy8gTGVmdCBvciByaWdodCByb3RhdGlvblxyXG4gICAgLy8gRGlyZWN0aW9uIGRpdmlkZWQgYnkgMTgwIGFuZCBmbG9vcmVkIC0+IDEgb3IgMi5cclxuICAgIC8vIFN1YnRyYWN0IDEgLT4gMCBvciAxLlxyXG4gICAgLy8gTXVsdGlwbHkgYnkgLTEgLT4gMCBvciAtMS5cclxuICAgIC8vIENzcyB0cmFuc2Zvcm0gLT4gTm9uZSBvciBmdWxsIFguXHJcbiAgICBzcHJpdGUucm90YXRpb25TdHlsZSA9PT0gMSA/IGVsLnN0eWxlLnRyYW5zZm9ybSA9IGBzY2FsZVgoJHsoKE1hdGguZmxvb3Ioc3ByaXRlLmRpcmVjdGlvbiAvIDE4MCkgKiAyKSAtIDEpICogLTF9KWAgOiBudWxsXHJcblxyXG4gICAgLy8gRnVsbCByb3RhdGlvblxyXG4gICAgLy8gU3ByaXRlIFwibmV1dHJhbCBwb3NpdGlvblwiIGlzIDkwLiBDU1MgaXMgMC4gU3VidHJhY3QgOTAuXHJcbiAgICAvLyBOb3JtYWxpemUgdG8gMzYwLlxyXG4gICAgLy8gQ3NzIHJvdGF0ZSAtPiBOdW1iZXIgb2YgZGVncmVlcy5cclxuICAgIHNwcml0ZS5yb3RhdGlvblN0eWxlID09PSAwID8gZWwuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgkeygoc3ByaXRlLmRpcmVjdGlvbiAtIDkwKSArIDM2MCkgJSAzNjB9ZGVnKWAgOiBudWxsXHJcblxyXG4gICAgLy8gQ1NTIHJ1bGVzIGNsYXNzZXMgYW5kIHRoZSBiYWNrZ3JvdW5kIGNvbG9yLlxyXG4gICAgLy8gVGhlIGNvc3R1bWUgY29sb3Igc2V0dGluZyBvdmVycmlkZXMgYW55IENTUyBzZXR0aW5nLlxyXG5cclxuICAgIC8vIFRoZXJlIGlzIG5vIGNvbG9yIHByb3BlcnR5IHRvIGN1cnJlbnQgY29zdHVtZSAtIHNvIHJlc2V0IHRoZSBiYWNrZ3JvdW5kLWNvbG9yIHByb3BlcnR5IG9mIHRoZSBlbGVtZW50LlxyXG4gICAgIXNwcml0ZS5jb3N0dW1lIHx8ICFzcHJpdGUuY29zdHVtZS5jb2xvciA/IGVsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcnIDogbnVsbFxyXG5cclxuICAgIC8vIGFwcGx5IENTUyBydWxlcyAobWF5IGluY2x1ZGUgYmFja2dyb3VuZCBjb2xvcilcclxuICAgIGNzcy5hcHBseShzcHJpdGUpXHJcblxyXG4gICAgLy8gYXBwbHkgQ1NTIGNsYXNzZXNcclxuICAgIHNwcml0ZS5jb3N0dW1lID8gZWwuY2xhc3NOYW1lID0gc3ByaXRlLmNvc3R1bWUuY2xhc3Nlcy5jb25jYXQoc3ByaXRlLmNsYXNzZXMpLmpvaW4oJyAnKSA6IGVsLmNsYXNzTmFtZSA9IHNwcml0ZS5jbGFzc2VzLmpvaW4oJyAnKVxyXG5cclxuICAgIC8vIFRoZXJlIGlzIGEgY29sb3IgcHJvcGVydHkgdG8gY3VycmVudCBjb3N0dW1lIC0gc28gYXBwbHkgaXQgYW5kIG92ZXJyaWRlIENTUyBydWxlcy5cclxuICAgIHNwcml0ZS5jb3N0dW1lICYmIHNwcml0ZS5jb3N0dW1lLmNvbG9yID8gZWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gc3ByaXRlLmNvc3R1bWUuY29sb3IgOiBudWxsXHJcblxyXG4gICAgLy8gSW1hZ2UuXHJcbiAgICBpZiAoc3ByaXRlLmNvc3R1bWUgJiYgZWwuZmlyc3RDaGlsZCkgeyAvLyBoYXMgaW1hZ2UgZnJvbSBwcmV2aW91cyBjb3N0dW1lXHJcbiAgICAgIGlmICghc3ByaXRlLmNvc3R1bWUuaW1hZ2UpIHsgLy8gbmVlZHMgcmVtb3ZlZCBhcyB0aGVyZSBpcyBubyBpbWFnZSBpbiBjdXJyZW50IGNvc3R1bWUuXHJcbiAgICAgICAgZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZClcclxuICAgICAgfSBlbHNlIGlmIChzcHJpdGUuY29zdHVtZS5pbWFnZSAhPT0gdGhpcy5lbC5maXJzdENoaWxkLnNyYykgeyAvLyBuZWVkcyByZXBsYWNlZFxyXG4gICAgICAgIHRoaXMuZWwuZmlyc3RDaGlsZC5zcmMgPSBzcHJpdGUuY29zdHVtZS5pbWFnZVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHNwcml0ZS5jb3N0dW1lICYmIHNwcml0ZS5jb3N0dW1lLmltYWdlKSB7IC8vIG5lZWRzIGFuIGltYWdlIGluc2VydGVkLlxyXG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyB3aW5kb3cuSW1hZ2UoKVxyXG5cclxuICAgICAgaW1hZ2Uuc3R5bGUud2lkdGggPSAnMTAwJSdcclxuICAgICAgaW1hZ2Uuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnXHJcbiAgICAgIGltYWdlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICBpbWFnZS5zcmMgPSBzcHJpdGUuY29zdHVtZS5pbWFnZVxyXG4gICAgICBlbC5hcHBlbmRDaGlsZChpbWFnZSlcclxuICAgIH1cclxuXHJcbiAgICBlbC5maXJzdENoaWxkID8gZWwuZmlyc3RDaGlsZC5kcmFnZ2FibGUgPSBmYWxzZSA6IG51bGxcclxuXHJcbiAgICAvLyBJbm5lci4gTXVzdCBieSBkb25lIGFmdGVyIHRoZSBpbWFnZVxyXG4gICAgc3ByaXRlLmNvc3R1bWUgJiYgc3ByaXRlLmNvc3R1bWUuaW5uZXJIVE1MID8gZWwuaW5uZXJIVE1MID0gc3ByaXRlLmNvc3R1bWUuaW5uZXJIVE1MIDogbnVsbFxyXG5cclxuICAgIC8vIFRleHQgVUkgZ29lcyB3aGVyZSBzcHJpdGUgZ29lcy5cclxuICAgIHNwcml0ZS50ZXh0dWkgPyBzcHJpdGUudGV4dHVpLnVwZGF0ZShzcHJpdGUpIDogbnVsbFxyXG5cclxuICAgIHRoaXMuZWwgPSBlbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBkZWxldGUgLSBkZWxldGVzIHRoZSBET00gZWxlbWVudC5cclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gdGhlIHNwcml0ZSB0byBkZWxldGUuXHJcbiAgKi9cclxuICBkZWxldGUgKHNwcml0ZSkge1xyXG4gICAgY29uc3QgZWwgPSBzcHJpdGUuZWxlbWVudC5lbFxyXG5cclxuICAgIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpXHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBhZGRGbGFnIC0gcHV0cyB0aGUgZmxhZyBkaXYgaW5mcm9udCBvZiBldmVyeXRoaW5nIChzaG93cyBpdCkuXHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHNwcml0ZSAtIHRoZSBzcHJpdGUgdGhhdCBcInJlcXVlc3RlZFwiIHRoZSBmbGFnLlxyXG4gICovXHJcbiAgYWRkRmxhZyAoc3ByaXRlKSB7XHJcbiAgICBjb25zdCBlbCA9IHNwcml0ZS5lbGVtZW50LmZsYWdcclxuXHJcbiAgICBlbC5zdHlsZS56SW5kZXggPSAxMDAwXHJcbiAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiByZW1vdmVGbGFnIC0gcHV0cyB0aGUgZmxhZyBkaXYgYXQgdGhlIGJhY2sgKGhpZGVzIGl0KS5cclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gdGhlIHNwcml0ZSB0aGF0IFwicmVxdWVzdGVkXCIgdGhlIGZsYWcuXHJcbiAgKi9cclxuICByZW1vdmVGbGFnIChzcHJpdGUpIHtcclxuICAgIGNvbnN0IGVsID0gc3ByaXRlLmVsZW1lbnQuZmxhZ1xyXG5cclxuICAgIGVsLnN0eWxlLnpJbmRleCA9IC0xXHJcbiAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBFbnRpdHkgZnJvbSAnLi9lbnRpdHknXHJcblxyXG5pbXBvcnQgU3RhZ2VTdXJmYWNlIGZyb20gJy4vc3RhZ2Utc3VyZmFjZSdcclxuaW1wb3J0IFNwcml0ZUVsZW1lbnQgZnJvbSAnLi9zcHJpdGUtZWxlbWVudCdcclxuaW1wb3J0IENvc3R1bWUgZnJvbSAnLi9jb3N0dW1lJ1xyXG5pbXBvcnQgVGV4dFVpRWxlbWVudCBmcm9tICcuL3RleHQtdWktZWxlbWVudCdcclxuXHJcbmltcG9ydCBjb2xsaXNpb25EZXRlY3RvciBmcm9tICcuL2NvbGxpc2lvbi1kZXRlY3RvcidcclxuXHJcbi8qKlxyXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBTcHJpdGUuXHJcbiAqIFNwcml0ZXMgY2FuIGJlIGFkZGVkIHRvIHRoZSBTdGFnZS5cclxuICogQGV4dGVuZHMgRW50aXR5XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoe1xyXG4gKiAgIGNvc3R1bWU6IG5ldyBibG9ja0xpa2UuQ29zdHVtZSh7XHJcbiAqICAgICB3aWR0aDogNTAsXHJcbiAqICAgICBoZWlnaHQ6IDUwLFxyXG4gKiAgICAgY29sb3I6ICcjQTJEQUZGJyxcclxuICogICAgIGltYWdlOiAnaHR0cHM6Ly93d3cuYmxvY2tsaWtlLm9yZy9pbWFnZXMvc2hlZXBfc3RlcC5wbmcnXHJcbiAqICAgfSlcclxuICogfSk7XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSh7XHJcbiAqICAgICB3aWR0aDogNTAsXHJcbiAqICAgICBoZWlnaHQ6IDUwLFxyXG4gKiAgICAgY29sb3I6ICcjQTJEQUZGJyxcclxuICogICAgIGltYWdlOiAnaHR0cHM6Ly93d3cuYmxvY2tsaWtlLm9yZy9pbWFnZXMvc2hlZXBfc3RlcC5wbmcnXHJcbiAqIH0pO1xyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBsZXQgY29uZmV0dGkgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgnaHR0cHM6Ly93d3cuYmxvY2tsaWtlLm9yZy9pbWFnZXMvY29uZmV0dGkuc3ZnJyk7XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGxldCBiYXJlWmVyb1NpemVkU3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUobnVsbCk7XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcHJpdGUgZXh0ZW5kcyBFbnRpdHkge1xyXG4gIC8qKlxyXG4gICogY29uc3RydWN0b3IgLSBDcmVhdGVzIGEgU3ByaXRlIHRvIGJlIGFkZGVkIHRvIFN0YWdlLlxyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gb3B0aW9ucyBmb3IgdGhlIHNwcml0ZSBhbmQvb3Igb3B0aW9ucyBwYXNzZWQgdG8gY29zdHVtZS5cclxuICAqIEFsdGVybmF0aXZlbHkgYW4gaW1hZ2UgVVJMLiBJZiBhIFVSTCBpcyBwcm92aWRlZCBkZWZhdWx0IGNvc3R1bWUgd2lsbCBiZSBzaXplZCB0byBpbWFnZS5cclxuICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLnBhY2UgLSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB3YWl0IGZvciBlYWNoIHBhY2VkIG1ldGhvZC5cclxuICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNvc3R1bWUgLSBBIGRlZmF1bHQgQ29zdHVtZS5cclxuICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLndpZHRoIC0gdGhlIGNvc3R1bWUgd2lkdGggaW4gcGl4ZWxzLiBEZWZhdWx0IGlzIDEwMC5cclxuICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmhlaWdodCAtIHRoZSBjb3N0dW1lIGhlaWdodCBpbiBwaXhlbHMuIERlZmF1bHQgaXMgMTAwLlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuaW1hZ2UgLSBhIFVSTCAob3IgZGF0YSBVUkwpIGZvciB0aGUgY29zdHVtZSBpbWFnZS5cclxuICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNvbG9yIC0gYSBjc3MgY29sb3Igc3RyaW5nICgnI2ZmMDAwMCcsICdyZWQnKS5cclxuICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zIC0gYSBVUkwgKG9yIGRhdGEgVVJMKSBmb3IgdGhlIGNvc3R1bWUgaW1hZ2UuXHJcbiAgKi9cclxuICBjb25zdHJ1Y3RvciAob3B0aW9ucyA9IHt9KSB7XHJcbiAgICBjb25zdCBzaGVlcHkgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFGOEFBQUJlQ0FZQUFBQkZFTWhRQUFBQUJtSkxSMFFBL3dEL0FQK2d2YWVUQUFBUnNrbEVRVlI0MnUxZEIxUlUxeFpGUVpvVUVSVkZSYkZqVndRTEtvcWdCanZnVnhHajJHTXZzV3VJMFVSaTc3MlhiemYyWG1KdjJGdnN4dDRWWVJvRGMvNCtUM1R4RVdiZU5KcXoxN3BybUpuM0htLzJ1L2ZjYzArN1ptWW1tR0JDMWtReEt5dXJSWFoyZGsvd0tzSHJNMnRyNjJYNHZKU0pHaU1pUjQ0Y0hVQzRyRStmUG9xb3FDaTZmLzgrWGJ4NGtRWU9IQmlIQnlERDk5MlRIRzZGMWlaWHJsekxIUjBkZCtGMUNkNEg4V1ZNVEdxUHBnNE9EakltUFNWY3ZYcVZuSnljcERndUJNM0gxdGIyVmZueTVTV1RKazJpQlFzVzBJUUpFNmhreVpJU2ZQNEUzMWN4MFNrZWxpRHQ5YjU5KzBnZERodzRRSmFXbHAvUTVLdFdyVklsLzE2bFV0SGN1WE1UV0Z4OVQySXFOMXBiYzNQeitUbHo1andMT1gwVDdUcEV4UzU4L2dlYUg1cUZtdk1iQlFZR1NrZ0RFaElTdVBjbnpKbzFTNlh1dUxGang4WmpGSjNQNnFTWFJTL2JuRDE3OW9UQ2hRdkxPbmJzbURCeDRrUkJES0FIMHJCaHc2aFJvMFlLOU9vNEd4dWI5eFlXRnIvaG5GekpybEU5Yjk2OHg5NjhlYU9KZTRxSmlhR3laY3NLRDBFZEZBckZGeEZWTVN1U2JnMGlmMGRUZ3ZDNHk1Y3ZheVJqMjdadFZLTkdEUW1MRFp3ZnhnOEJvMk0veS9tbFM1ZXFTQ1MyYnQwcTZyaVFrSkJZL0krZnNocnhCU0JPN3BRb1VVSjYrdlJwMGhhYk4yOG1lM3Q3QlloL0V4d2NMSk5LcGZUcDB5ZlI1My84K0ZIVWNhTkdqVXJBdlk3TFNzUzdRWHc4UnE5U2NHL1dGWU1IRHladmIyOVNLcFZrTEVSSFIxT2VQSG00OTFmS0NzVGJvOGMvYnQrK3ZTSStQbDVuVWxnaktWU29FSjA3ZDQ2TWpZTUhENm93Mzd6RHZlZkoxTXhEaTFudDYrc3IxelRaYWNLalI0OG9kKzdjbEZibzBLR0RIQTlnZG1ibXZqbklsejk5K2xSdk1xNWR1MFpGaXhaTk0vSlpHUUQ1N3pNcjhkbEEvSU5seTVZWmhJejM3OThUeEJmRnhzYW1DZmtzSWxrVlpyR1orSHVjZVUyQ05nWXRNckVOUUd1QjVvWG1pbVp1bEpVa1drdmN6QUlRZWdFOTRqbFV2MWk4dm9COTVBQytHOFY2ZC9KbHY0dUxpOVNRazJQTm1qVUo2bVdha00rS1FiWnMyVlQ0SGVWdGJLelg0KzhFMS96NXBFSE5Ha2s2aDRYSXcwT0Q1ZlZxVjQ5eEsrUWFZMjFsRllmaitQZ0VHMnZyTjFaV2x0dnh2cjYrcER2QktEVVRSRWZEQUNYdjJiT25jc21TSmJScDB5Wmh5YjVod3dZYVAzNDgrZnY3UzNHY0VnL2pRYUl1bmgxcTRlbnAwNmVMMHNNbEVnbFBjalJpeEFpcVc3Y09aTHNUOFkvQmVvQktGQzlPNGVIaGRQandZZHE3ZHkvbHo1K2ZIajU4bU9xMWVHUzhmUG1TV0JYVkIwZU9IT0dSRm0xaFlSNFgxS3loOHR5aHpVUWY3cWJhWXA5ZHBWdm45dEhlVFV0cFVPL09Ta3ZMSEhIb3JFTjBKYjRWcnk0OVBUMFZHemR1cExpNE9MVTMrKzdkTzRxTWpDUThKQVhPdXd5VFFUeUxpdFNHTkpNNWZQaHdxb1hlakFkSHVSd2RxVVdUQUpvMThSYzZzWGNkM2I5MG1DNGUzVWFiVnN5bXptR3R5Y0hlbmp3OXExS1BIajBJSzF0aDBaUjBFbWM5bmxmR0x2bnk0c2Qzb1hKbFBlang0OGZmL0crZWYwNmVQS2wydGN2ZlFiTlNPdGpieGUvZXVGZ3Q2YW0xUFp1V2NPZVJhaTJyUWQ0TUxHWVVDeGN1RkZROGJmWGtidDI2S2RGclZLZE9uZnJtKzdObnoxTHAwcVhJR2IyN1UyZ3dMWncrbnE2ZjNrMEo3MjZyL1RFZkhsMmdVWU43a1NVZWxMVzFGUlV1VkJBUElRLzVZcVI0VmZNa21DdW9hV00vZW5UMWIxSzl2ME8vRHU4bmpDQitJUHYzNzZjelo4N1FpaFVyeUs5K1BjcnQ1RVR0MnJXbGxOWWMvSHNiTkdoQTluWTVWVmRQN3RTSmVHNlhqKzhnYy9Qc1NtM21BWjRrRjhQZUltZlZUaDlNbXphTjhBQnB6NTQ5WHo5NysvWXRSb2FqUUl6c3hYV2RmdFRmTzllUVhVNWJtajBwUWhnWlcxYk5vWjNyRjlIemYwNTljeXlMZ2FIOXU1TnY3UnJrNVZtWmdsc0UwcEpaRStqMTNiUFUyTDhlbGZYd0lPNWdiSGErZWZNbXJWbXpoaXBYcWtRVzV1YTBmZTBDbllubk5yaDNsNFNjTmpaSHhSdGVySzBqb2M1SkRhRWFNbGF2WGsyWWtPbjI3ZHZDZTdiVEZIY3ZvdGVQK2pLa01jblJQK2YyNjN3TkhoMnJGMDZoZ1BwMXFFQitGMEZjMWE3cFJZRUI5Y2k3YWtXOTdvODdCZHV2UUdsTnNkd0hRTnpJMVUxbXVtRGt5SkZVcWxRcFFSeGR1blNKb0RuUXV3ZFJlaitBOXEyYlUzajdZTDJ2azd6VjhxNUtjeWIvcXZQNUwyNmZvbng1bldVV0Z0a25pRFlCZ1BqWGl4WXRVaGxhWmVPSm1sWEUwYU5IQys5OWZldFNtNkFtUXMvVGh5UVdQNDRPOW5wZkoza3I1SnFmRG01ZG9kTzVMRXFyVmlvbmh3VFp3eHFmS09ZeFJBYUJJSm14ZE9iejU4OEw0b2Mxb2djUEhwQ0xTejdxM1RWTUwrSjQ5TEE2K3ZMMmFZT1NYN0o0VWZwcjlWeWR4RmpiNEtaS2pPeTdTUlptbXJuSEpQc3E2Y1JvRERSdjNwekdqQmtqL0gzcjFpMHFXTkFWWWlPRTR0LytveE5KejI2ZEZNai85T1N5UWNudkZCcEVQY0xiYW4zZStGRURWTkR0b3ptS1FodlZNZ2dPNUZodFZVcHR3UXVmcEhvL2o0Qmk3dTZDQ0lwN2ZVdnJIOHVUWlhGM040UEwvS2dqZndtVCtiVlR1MFNmTSsyUGtTcElEem00cksyZHZkZmVmaFVXUnlwS0J6eDc5Z3p1UFE5cTBxZytTWjVmRmYxaitkaXlwVXZRaElpZkRVNCt0Nkg5dTFIQkFpNTBiUGRhdGNjOXVYR2MvdE15VUpIWTQrdHBiMnkzdDMvR0s3NzBBdnRndmIyOXFFSzVNcUo2R3krMi9PdlY0b21ORks5dUdvVjhsdC84WUdHbklWOGZiMkVoeU9ZRkhoVW45NjJuVlFzbVU2dW1EZVdzVHRyYTJteGxMNTB1SmdSWDJHM2lOSmtPakEyWlRDYVlEWEF2MUsxakd6cXlZL1UzeEw2NWQ0NW1SSTZCUHA1SElOOFE2cXFtOXZqNk1XRmRZbWRuR3dNN1RUelBNVENid0xGdmN4ZnZKK0o5QlgwTVozNmxTNWVPcGd5QzY5ZXZVL2Z1M1JCQmtFc3dxaFYxSzB5d0pGSitFQTZMSVhsN1ZxVGxjLzgwdUhxcHJ2MDJzajlaV1ZwZU1JYXBPTlRQeis4VFpURHdTR1NOYU8zYXRaVFQxcGFPNzFtbnRxZXpJYTV5QlErcVhhTWEzWWs2b0JmWlBMb2FONmhMRThjT0U5N3YzN0tjMXhNdmpVRitlTk9tVFdNb2cyTFhybDNrNSt1amtURFdlbGdrY0d2U3NKN094UE1FKytVNjNOaU04ZjVoRk9Xd3NJZ1h2V2pTQW0zcTE2OGZuVkhKbnpkdkh1WUF6VHAzNFlJRnZoSVdVTjlIWi9KNWNaV1VmSjVZK1hPWWxsbU5kRE0wK2JXS0ZTdjJLYU9TenlZSnRvQnFJdTNBWHl1b1RNbGk1QVdEbURiNmVmTEdrM3d6bUtYaFFLR0dmclZKK3VLYThIbkY4cVUvNnFSS2FvcW5nZmRKbmxISkQrL1VrUmJQL0NQTkp0ZlVXdXVXUDhTQXF5NkdKdDhDWGlTOWJmZkdRc01BZjBIdXBqZjVFY1A2SmxoYVdrUWFmTVpGek9PdUdUTm1xRElpK2RXeCtEcHpZRk82azgrTExDZEhoLzhhUmVPcFU2ZE9ocFQ3TmFwNzAra0RHOU9kL0xWTHBzRWw2YmpiR09UbjRhUUJkcU5sTk5TcVdVTll6cWMzK2V4U2RNcmx5QnBQWTJQa05FMkJ5VGMybzVGZnA3YVBZR3BJYi9KM2JWaEVWU3BYZ2hmT0pnNEt5akpENTI5eDc1ZXloejg1T1A2RkoyUzJ2NlExd3RxSDB0TFprZWxPL3NyNWs0UjdZUmNyWEtJeW04K09jUWVEc1E5RFVWOEVKRWsrZlBnZ0xPMDVISnQ5ci9pY3MvclNwZWRIUkVRSTRTTHBUZjZVOFNOb3dJRCtYME5qRVBncnd3aTRZdlk1czlGQWFTUFcxc2NLRkNpUUFNc2RCUVFFQ0dFVmJPd3l0cU1sTmF4Y3VSS3V1V1lHSVhEOTBobFV3Q1V2YkVVMmdyMWVtM09IOU9zbVJPWWxEU1dzVXFXS0JIek5Nd2p2a1B1VDJUN2RyMTgvZXZMa1NZYVErUndwWE1TdGtFSElieEhvLzlWc29LM2p2VkVEWDlxeVpjdi8zZHUvLy80clpNb2tCc3JxSGtLUElYUUNJa2FlRm9rSDJvQkhYRDZFQm5KRW03N2tzNk1kaXlVYTJDdWNMaDNiTHZvOGRuRTZPamdJWHJma1dMZHVIY0gvL1V4RHhtVHFqaXljSE9YajR5UFhKcjhwTGRHcjEwODB1RThYblFoZk1HMmNFTUQ2eFc2emNma3NRZng4Y2RyenE2WXdFWTdWckZTeFFxcjNWNkZDaFZqTWl6MjBaaDdoZkZzUVlTeFBEMDFHTEM1Y3VDQUV5YkluUzF2eVEwT2FVZlZxbFlRVktvZUUrRlQzRk96K2JLOW4wdXZVckNZRVNhbTdSZ09ZdEtkTW1aTHEvWEVVSGpyd1U2Mkl4NlFhaW1oZldXcVJ4QmtKVFpzMG9WQkVxR2xMUHZkc2p1bnMyQzVJaU9uOEV0akVJNGtmUW1URUVMV1JFMXZYekVOeW5MUGFURWFPYUlic2wzRWN2MWp1blJIVkc4c3g4WmtCWE1qQzBkR0IvdngxYUpxcGx4d0hpbFV0TFY2OFdPUDlJZGxQQnRFelVxeEtPYlpGaXhaeXlrVFlzV09INEdCZk5PTjNveFAvOXY1NWlDbDMrSk83aTdvM2RuY2lMK0dzR081dE9PT0M0K1F6R3pnaGdoTXBXR3N4RnZFc2xtcGhibWplckJtSlRWM2xFSFBNbjYvRmtCK0diSk1ZeXFSWXYzNjlrQWd4cEY5WGpRa1YyamFXL3lFdGZoQUN1WGlsTHhhc0tTWW16NWxyc3Qrdm56eDVzb295TVE0ZE9pVE1BWnlKRXYzNGtrR0laNWNoTDhUYzNZdVNMczRsZEFpRnh1QXBESTlYbVZIa0pBY25YSEFQTFZiVWpRNXRXNmtYOFJ6MjUxbTVBcFVvVVR6RlBDNHhTRXlHY0ZZYm9ZWW5GR2ZNMmdWcENSN3V5UDhTakg4L3RtMGw1R05wU3p5cm9IbWNjNU9QVHkwU1V6NG1KYkRsRjl5cU5LMTA2eUJhSVpxeUdEZ3RsWlBza1A5S1AzVU9GWkxSeENTc0lhZFdlSEJzejlKbm9mbjgrWFBXeE9TYUp0dVdxRjJUNWNobjhHam1PSjhpUlQ0SFVGVkU0QzB2cG5paHhBR3U5eTRlRWh3elUzOGZDVzJtcWhCKzZPVlZqWTRlUGFyMy8rYmNCaVIvM05aRWZnajh0Vm1TL0tRcnpwMDdkL0xDUjBqQVNCb0V4WTFMQ0tCZWp4QU5aeWdNR2pSSUNYRStSV05nTE1wZGlTSS92V3o0aGdablZySzFsa1VUK3lhTVljZnk4UERnK1B4QVRlU1h4RXBNS3FiM21DQU9WNjVjb2NTcWhEazFrVy9MeFJ6a2N2V1dCWDJxUVgxdmdBaVRZcktORkd0R2ZzcEZIZFFac1V6UVBMbHpqNzl6NXc2Yk83amlTRUZSNUdPSVRPM2J0MitLcVNpOHdEQ0pITTFnOTJaWVdCajdjYVhnYzVvMnBueGZWMWZYMkpSSVpyZVlDWnJCbVpSY1Z3SWhKTGNTYXhHSjk2T3c1NFZyNVNURnZYdjNCT3VjQ2VLQTRpQ3N1bmJTeFhmN283dTd1eVNweVpScjMyUVY5VEl0Z0lybDhWZ2RqOWNwTkp4N1A4cXlmR1c3WGJ0MkprYTF3Snc1YzNoVnUxblhrQkV2ek5TS0V5ZE9DQm9PVm1rbVJyWEE5dTNidWU3eVJkMHpJeXdzaGlKQ1RUcDE2dFEwS3h5WFZjQlJGWENjUDllci9DSjYveExNM0VwREdKaStKM0FKTTFnTEh1cGQveEt5Nno1dmMyR0NlTEJoRGhWdUwra2RxSW1Mbk1wb29ZSVpIZGlCZ21YK1lVT1FmM0wzN3QwbVJyVlROVkU3MDNLaS9tVytVZmFGSjEwVHhBTWVRVTRQOVRkRWlIakVnQUVEbENaS3hlSFZxMWRjZlVRcHhvd3NCaDFSQUNQR1JLczRqQnMzTGdFaE9BY05sWlRpeXFaUnJtbHNnbnB3cEFMdjF3TE92QTJXRWdSMTh5NzdQazFRajltelo2c3dSMTQxYkkxMlM4dXhyVnExa3Bub1RSMmNxd3dIUEVlbTFUSjBPbTV1VGdmVnRIM1M5d291RFYrbVRCa0pielZsbEswZTRCeVlhdXI5MzRJajQxRDBWYzRwVkdaRzNNQXlMNGVQY3pWdEV6N2p4WXNYWDlJK1QybFRLVlpYK0xOYzR4aVg3eG5zV09KZE10RGJGZUNEaTE3WXBzbE9NNXk1Z28yNjVGbkZyY2lCVXB4WXdkdC9jRmE3dW83MSt2VnJ3bllqTE4rbDRJSDN5bXFUNWx2OVlQSWRoL3hjaGJvd2s4d0dqcWxFUVQ5ZW5mTGVLeXBrMlV2d1FGU2MvdE82ZFdzbHlseEtPY2tCcXVSMVVOQ2JOWEN6OUFKdXBDY3ZveEZxRXA4WnNoYkZnQVBHWUpmaENMTTVhSnpFTmhkdEFkcFVOTjR4dXFSWkJrSWxqSUFvbG4zOEVJNGZQNTVpUkJ0L3hwYlJ6cDA3RXlvV0VxcFhDVnVoNmdvT1NNTC9GR0lzRFd5TmpNTjF6NXNaYVU4cm8wM0U4SGh0NDJyWmFQRWMvWUNJWnlrM1ZDR1hjUVZZWjJkbjZ0Ky9QK25ybUdHNWkrQlRybTBUZi9mdVhZTVJ6N3NlOFZvR3Y4WGRMSk9DeTV4d3FmS09pY09VRys4di9qTW5DQ1NQQjlKRnRXT3hnRWl3M1pqd3hrRTJ5MjdjdUdFUTRua3ZMOXhuc0ZrV1JXTitBTmhUVm1Nd2JrcmdWSHJPaWdmeFc3NHNabkM5WDFqazZTcCtPREp2NXN5WnFzU1l5aUN6TEk2cXZGT2NtNXViak1NUHhWUW9aMmQweTVZdEZTQ0lSVUxmNVBJWWszNFhUampyMnJXcmtqZEJFQXNlTVY1ZVhqS01vTGU0VENPejd3UXNtdnJCWFBFVzFsSUYxTGw0TGx6RWFtdFVWSlN3WVJqdjdNdzdDV0h1NFBsQ2ptTlhhNGoyOWNBSU9NWUpmYmlla2pjZVMybDA4VjVjdkJrWktxbHdTbjRDanArZnJpcGpPb0o3Y0NCNjdueE0xcmNUZS9ibkRSenhZS0JQNzBtY08reTB1R1lObkxzS3BIN0M5ZUo1ODh0eTVjcEprSEVqd2NLUTdleXNKVDBCOGFQeGQyRXpFNHl6RERIN3ZIbEFVSktKUHlnamFqTC9BMTVFeHkrTTQ0TGZBQUFBQUVsRlRrU3VRbUNDJ1xyXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XHJcbiAgICAgIHBhY2U6IDMzXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGFjdHVhbCA9IHt9XHJcbiAgICB0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgPyBhY3R1YWwgPSB7IC4uLmRlZmF1bHRzLCAuLi5vcHRpb25zIH0gOiBhY3R1YWwgPSBkZWZhdWx0c1xyXG5cclxuICAgIHN1cGVyKGFjdHVhbC5wYWNlKVxyXG5cclxuICAgIC8vIGNvc3R1bWVzXHJcbiAgICB0aGlzLmNvc3R1bWVzID0gW11cclxuXHJcbiAgICAvKlxyXG4gICAgKiBhbHRlcm5hdGUgb3B0aW9ucyAgLSBpbWFnZSB1cmwuXHJcbiAgICAqIHVzZXIgY2FuIHNlbmQgYSB1cmwgaW5zdGVhZCBvZiBhbiBvcHRpb24gb2JqZWN0LlxyXG4gICAgKiB0aGlzIHdpbGwgYmUgdHJlYXRlZCBhcyBhIGNvc3R1bWUgaW1hZ2UgdXJsLlxyXG4gICAgKiB0aGUgaW1hZ2Ugd2lsbCBiZSBzZXQgdGhlIHNwcml0ZSBjb3N0dW1lLlxyXG4gICAgKiB3aGVuIHRoZSBpbWFnZSBpcyBsb2FkZWQsIGNvc3R1bWUgd2lkdGggYW5kIGhlaWdodCB3aWxsIGJlIHNldCB0byBhY3R1YWwgaW1hZ2Ugd2lkdGggYW5kIGhlaWdodC5cclxuICAgICogc3ByaXRlIHdpbGwgYmUgcmVmcmVzaGVkLlxyXG4gICAgKi9cclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgYWN0dWFsLmNvc3R1bWUgPSBuZXcgQ29zdHVtZSh7IGltYWdlOiBvcHRpb25zLCB3aWR0aDogMCwgaGVpZ2h0OiAwIH0pXHJcbiAgICAgIGNvbnN0IGltYWdlID0gbmV3IHdpbmRvdy5JbWFnZSgpXHJcblxyXG4gICAgICBjb25zdCBtZSA9IGFjdHVhbC5jb3N0dW1lXHJcbiAgICAgIGltYWdlLnNyYyA9IG9wdGlvbnNcclxuXHJcbiAgICAgIGltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICAgICAgbWUub3JpZ2luYWxXaWR0aCA9IGltYWdlLndpZHRoXHJcbiAgICAgICAgbWUub3JpZ2luYWxIZWlnaHQgPSBpbWFnZS5oZWlnaHRcclxuICAgICAgICBtZS53aWR0aCA9IG1lLm9yaWdpbmFsV2lkdGhcclxuICAgICAgICBtZS5oZWlnaHQgPSBtZS5vcmlnaW5hbEhlaWdodFxyXG5cclxuICAgICAgICB0aGlzLnJlZnJlc2goKVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAqIGFsdGVybmF0ZSBvcHRpb25zIC0gcGFzc2luZyBjdXN0b21lIG9wdGlvbnMgdG8gc3ByaXRlLlxyXG4gICAgKiBpZiBjb3N0dW1lIGlzIG5vdCBkZWZpbmVkIGJ5IHVzZXIsIGl0IHdpbGwgYmUgY3JlYXRlZC5cclxuICAgICogd2hlbiBubyBpbWFnZSBpcyBzZXQsIHNoZWVweSBpcyBkZWZhdWx0LlxyXG4gICAgKlxyXG4gICAgKiBhbHRlcm5hdGUgb3B0aW9ucyAtIG51bGwuXHJcbiAgICAqIHVzZXIgY2FuIHBhc3MgbnVsbCBpbnN0ZWFkIG9mIGFuIG9wdGlvbiBvYmplY3QuXHJcbiAgICAqIHRoaXMgaXMgc2FtZSBhcyBzZXR0aW5nIGEgY29zdHVtZSBhcyBudWxsLlxyXG4gICAgKiB0aGUgc3ByaXRlIHdpbGwgaGF2ZSBubyBjb3N0dW1lcyBhbmQgbm8gc2l6ZS5cclxuICAgICovXHJcbiAgICBpZiAodHlwZW9mIGFjdHVhbC5jb3N0dW1lID09PSAndW5kZWZpbmVkJyAmJiBvcHRpb25zICE9PSBudWxsKSB7XHJcbiAgICAgIGNvbnN0IGNvc3R1bWVPcHRpb25zID0ge31cclxuICAgICAgYWN0dWFsLndpZHRoID8gY29zdHVtZU9wdGlvbnMud2lkdGggPSBhY3R1YWwud2lkdGggOiBudWxsXHJcbiAgICAgIGFjdHVhbC5oZWlnaHQgPyBjb3N0dW1lT3B0aW9ucy5oZWlnaHQgPSBhY3R1YWwuaGVpZ2h0IDogbnVsbFxyXG4gICAgICBhY3R1YWwuY29sb3IgPyBjb3N0dW1lT3B0aW9ucy5jb2xvciA9IGFjdHVhbC5jb2xvciA6IG51bGw7XHJcbiAgICAgICh0eXBlb2YgYWN0dWFsLmltYWdlICE9PSAndW5kZWZpbmVkJykgPyBjb3N0dW1lT3B0aW9ucy5pbWFnZSA9IGFjdHVhbC5pbWFnZSA6IGNvc3R1bWVPcHRpb25zLmltYWdlID0gc2hlZXB5XHJcblxyXG4gICAgICBhY3R1YWwuY29zdHVtZSA9IG5ldyBDb3N0dW1lKGNvc3R1bWVPcHRpb25zKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNldCBjb3N0dW1lXHJcbiAgICBhY3R1YWwuY29zdHVtZSA/IHRoaXMuY29zdHVtZSA9IGFjdHVhbC5jb3N0dW1lIDogbnVsbFxyXG4gICAgdGhpcy5jb3N0dW1lID8gdGhpcy5jb3N0dW1lcy5wdXNoKHRoaXMuY29zdHVtZSkgOiBudWxsXHJcblxyXG4gICAgLy8gc2V0IHdpZHRoXHJcbiAgICB0aGlzLmNvc3R1bWUgPyB0aGlzLndpZHRoID0gdGhpcy5jb3N0dW1lLnZpc2libGVXaWR0aCA6IHRoaXMud2lkdGggPSAwXHJcbiAgICB0aGlzLmNvc3R1bWUgPyB0aGlzLmhlaWdodCA9IHRoaXMuY29zdHVtZS52aXNpYmxlSGVpZ2h0IDogdGhpcy5oZWlnaHQgPSAwXHJcblxyXG4gICAgdGhpcy54ID0gMFxyXG4gICAgdGhpcy55ID0gMFxyXG4gICAgdGhpcy56ID0gMFxyXG5cclxuICAgIHRoaXMucHJldlggPSAwXHJcbiAgICB0aGlzLnByZXZZID0gMFxyXG5cclxuICAgIHRoaXMuc2hvd2luZyA9IHRydWVcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gOTBcclxuICAgIHRoaXMubWFnbmlmaWNhdGlvbiA9IDEwMFxyXG5cclxuICAgIHRoaXMucm90YXRpb25TdHlsZSA9IDBcclxuXHJcbiAgICB0aGlzLnRleHR1aSA9IG51bGxcclxuXHJcbiAgICB0aGlzLmRyYXdpbmcgPSBmYWxzZVxyXG4gICAgdGhpcy5wZW5Db2xvciA9ICcjMjIyMjIyJ1xyXG4gICAgdGhpcy5wZW5TaXplID0gMVxyXG5cclxuICAgIHRoaXMuY3NzUnVsZXMgPSBbXVxyXG4gICAgdGhpcy5jbGFzc2VzID0gW11cclxuXHJcbiAgICB0aGlzLmNvbGxpc2lvbkRldGVjdG9yID0gY29sbGlzaW9uRGV0ZWN0b3JcclxuICB9XHJcblxyXG4gIC8qKiBTZXR1cCBBY3Rpb25zICogKi9cclxuXHJcbiAgLyoqXHJcbiAgKiBhZGRUbyAtIEFkZHMgdGhlIHNwcml0ZSB0byB0aGUgc3RhZ2VcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3RhZ2UgLSB3aGljaCBzdGFnZSB0byBhZGQgdGhlIHNwcml0ZSB0b28uXHJcbiAgKi9cclxuICBhZGRUbyAoc3RhZ2UpIHtcclxuICAgIHRoaXMuc3RhZ2VXaWR0aCA9IHN0YWdlLndpZHRoXHJcbiAgICB0aGlzLnN0YWdlSGVpZ2h0ID0gc3RhZ2UuaGVpZ2h0XHJcblxyXG4gICAgdGhpcy5lbGVtZW50ID0gbmV3IFNwcml0ZUVsZW1lbnQodGhpcywgc3RhZ2UpXHJcbiAgICB0aGlzLnN1cmZhY2UgPSBuZXcgU3RhZ2VTdXJmYWNlKHN0YWdlKVxyXG5cclxuICAgIHRoaXMuZWxlbWVudC5mbGFnID0gc3RhZ2UuZWxlbWVudC5mbGFnXHJcbiAgICB0aGlzLmFnYWluc3RCYWNrZHJvcCA9IHN0YWdlLmVsZW1lbnQuYmFja2Ryb3BDb250YWluZXJcclxuXHJcbiAgICBzdGFnZS5zcHJpdGVzLnB1c2godGhpcylcclxuICAgIHRoaXMueiA9IHN0YWdlLnNwcml0ZXMubGVuZ3RoXHJcblxyXG4gICAgdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBjbG9uZSAtIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGUgc3ByaXRlIGFuZCB0cmlnZ2VycyBhbiBldmVudC5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIGxldCBjbG9uZSA9IHRoaXMuY2xvbmUoKTtcclxuICAqICAgY2xvbmUubW92ZSgxMDApO1xyXG4gICogICBjbG9uZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKi9cclxuICBjbG9uZSAoKSB7XHJcbiAgICAvLyBtYWtlIGEgbmV3IHNwcml0ZS5cclxuICAgIGNvbnN0IHNwcml0ZSA9IG5ldyBTcHJpdGUoKVxyXG4gICAgLy8gc2F2ZSBpZC5cclxuICAgIGNvbnN0IGlkID0gc3ByaXRlLmlkXHJcbiAgICAvLyBhbmQgYXNzaWduIHByb3BlcnRpZXMuXHJcbiAgICBjb25zdCBjbG9uZSA9IE9iamVjdC5hc3NpZ24oc3ByaXRlLCB0aGlzKVxyXG4gICAgLy8gcmVhc3NpZ24gdGhlIHVuaXF1ZSBpZC5cclxuICAgIGNsb25lLmlkID0gaWRcclxuXHJcbiAgICAvLyByZW1vdmUgRE9NIGVsZW1lbnRzXHJcbiAgICBjbG9uZS5lbGVtZW50ID0gbnVsbFxyXG4gICAgY2xvbmUuc3VyZmFjZSA9IG51bGxcclxuXHJcbiAgICAvLyBkZXRhY2ggYXJyYXlzXHJcbiAgICBjbG9uZS5jc3NSdWxlcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5jc3NSdWxlcykpXHJcbiAgICBjbG9uZS5jbGFzc2VzID0gdGhpcy5jbGFzc2VzLnNsaWNlKClcclxuXHJcbiAgICAvLyBmaWd1cmUgb3V0IHdoYXQgdGhlIGN1cnJlbnQgY29zdHVtZSBpcy5cclxuICAgIGNvbnN0IGN1cnJlbnRDb3N0dW1lSW5kZXggPSB0aGlzLmNvc3R1bWVzLmluZGV4T2YodGhpcy5jb3N0dW1lKVxyXG5cclxuICAgIC8vIGZpbGwgdGhlIGNvc3R1bWVzIGFycmF5IHdpdGggbmV3IGNvc3R1bWVzIGFuZCBhc3NpZ24gcHJvcGVydGllcy5cclxuICAgIGNsb25lLmNvc3R1bWVzID0gdGhpcy5jb3N0dW1lcy5tYXAoKGl0ZW0pID0+IHtcclxuICAgICAgY29uc3QgY29zdHVtZSA9IG5ldyBDb3N0dW1lKClcclxuICAgICAgY29uc3Qgb2JqID0gT2JqZWN0LmFzc2lnbihjb3N0dW1lLCBpdGVtKVxyXG5cclxuICAgICAgLy8gZGV0YWNoIGFycmF5c1xyXG4gICAgICBvYmouY3NzUnVsZXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0uY3NzUnVsZXMpKVxyXG4gICAgICBvYmouY2xhc3NlcyA9IGl0ZW0uY2xhc3Nlcy5zbGljZSgpXHJcblxyXG4gICAgICByZXR1cm4gb2JqXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIHNldCB0aGUgY3VycmVudCBjb3N0dW1lLlxyXG4gICAgY2xvbmUuY29zdHVtZSA9IGNsb25lLmNvc3R1bWVzW2N1cnJlbnRDb3N0dW1lSW5kZXhdXHJcblxyXG4gICAgLy8gYW5ub3VuY2UgYSBjbG9uZVxyXG4gICAgY29uc3QgZXZlbnQgPSBuZXcgd2luZG93LkN1c3RvbUV2ZW50KGBibG9ja0xpa2Uuc3ByaXRlY2xvbmVkLiR7dGhpcy5pZH1gLCB7IGRldGFpbDogY2xvbmUgfSlcclxuICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpXHJcblxyXG4gICAgcmV0dXJuIGNsb25lXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlbW92ZUZyb20gLSBSZW1vdmVzIGEgc3ByaXRlIGZyb20gdGhlIHN0YWdlLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLnJlbW92ZUZyb20oc3RhZ2UpO1xyXG4gICpcclxuICAqL1xyXG4gIHJlbW92ZUZyb20gKHN0YWdlKSB7XHJcbiAgICBjb25zdCBjdXJTdGFnZSA9IHN0YWdlXHJcblxyXG4gICAgY3VyU3RhZ2Uuc3ByaXRlcyA9IHN0YWdlLnNwcml0ZXMuZmlsdGVyKChpdGVtKSA9PiBpdGVtICE9PSB0aGlzKVxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50ID0gdGhpcy5lbGVtZW50LmRlbGV0ZSh0aGlzKSA6IG51bGxcclxuICB9XHJcblxyXG4gIC8qKiBFdmVudHMgKiAqL1xyXG5cclxuICAvKipcclxuICAqIHdoZW5DbG9uZWQgLSBBZGRzIGEgZG9jdW1lbnQgbGV2ZWwgZXZlbnQgbGlzdGVuZXIgdHJpZ2dlcmVkIGJ5IGEgY3VzdG9tIGV2ZW50LlxyXG4gICogVGhlIGN1c3RvbSBldmVudCBpcyB0cmlnZ2VyZWQgYnkgdGhlIGNsb25lKCkgbWV0aG9kLlxyXG4gICogV2hlbiB0cmlnZ2VyZWQgd2lsbCBpbnZva2UgdXNlciBzdXBwbGllZCBmdW5jdGlvbi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMuY2xvbmUoKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIHNwcml0ZS53aGVuQ2xvbmVkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5hZGRUbyhzdGFnZSk7XHJcbiAgKiAgIHRoaXMuZ2xpZGUoNSwgMTAwLCAwKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgLSBhIGZ1bmN0aW9uIHRvIHJld3JpdGUgYW5kIGV4ZWN1dGUuXHJcbiAgKi9cclxuICB3aGVuQ2xvbmVkIChmdW5jKSB7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGBibG9ja0xpa2Uuc3ByaXRlY2xvbmVkLiR7dGhpcy5pZH1gLCAoZSkgPT4ge1xyXG4gICAgICBlLmRldGFpbC5fZXhlYyhmdW5jLCBbXSlcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qKiBNb3Rpb24gKiAqL1xyXG5cclxuICAvKipcclxuICAqIF9tb3Rpb24gLSBNb3ZlcyB0aGUgc3ByaXRlIHRvIHNwZWNpZmllZCBsb2NhdGlvbiAoeCwgeSkuXHJcbiAgKiBBbGwgdXNlciBtb3Rpb24gbWV0aG9kcyB0cmFuc2xhdGVkIHRvIHRoaXMgbW90aW9uLlxyXG4gICpcclxuICAqIEBwcml2YXRlXHJcbiAgKiBAcGFyYW0ge251bWJlcn0geCAtIHRoZSB4IGNvb3JkaW5hdGUgZm9yIHRoZSBjZW50ZXIgb2YgdGhlIHNwcml0ZSAoMCBpcyBjZW50ZXIgc2NyZWVuKS5cclxuICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gdGhlIHkgY29vcmRpbmF0ZSBmb3IgdGhlIGNlbnRlciBvZiB0aGUgc3ByaXRlICgwIGlzIGNlbnRlciBzY3JlZW4pLlxyXG4gICovXHJcbiAgX21vdGlvbiAoeCwgeSkge1xyXG4gICAgdGhpcy5wcmV2WCA9IHRoaXMueFxyXG4gICAgdGhpcy5wcmV2WSA9IHRoaXMueVxyXG4gICAgdGhpcy54ID0geFxyXG4gICAgdGhpcy55ID0geVxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuICAgIHRoaXMuc3VyZmFjZSA/IHRoaXMuc3VyZmFjZS5kcmF3KHRoaXMpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBnbGlkZSAtIE1vdmVzIHRoZSBzcHJpdGUgZm9yIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIHNlY29uZHMgc28gaXQgYXJyaXZlcyBhdCBzcGVjaWZpZWQgbG9jYXRpb24gd2hlbiB0aW1lIGlzIHVwLlxyXG4gICogUHJvdmlkZXMgc21vb3RoIG1vdmVtZW50LlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLmdsaWRlKDMsIDEwMCwgMTAwKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICBsZXQgdGltZSA9IDU7XHJcbiAgKiAgIHRoaXMuZ2xpZGUodGltZSwgMTAwLCAxMDApO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IHNlYyAtIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGUgd2hvbGUgbW92ZW1lbnQgd2lsbCBsYXN0IChhbmQgd2lsbCBoYWx0IGZ1cnRoZXIgZXhlY3V0aW9uIGZvcikuXHJcbiAgKiBAcGFyYW0ge251bWJlcn0geCAtIHRoZSB4IGNvb3JkaW5hdGUuXHJcbiAgKiBAcGFyYW0ge251bWJlcn0geSAtIHRoZSB5IGNvb3JkaW5hdGUuXHJcbiAgKi9cclxuICBnbGlkZSAoc2VjLCB4LCB5LCB0cmlnZ2VyaW5nSWQgPSBudWxsKSB7XHJcbiAgICBsZXQgaSA9IDBcclxuICAgIGNvbnN0IG1lID0gdGhpc1xyXG4gICAgLy8gZGl2aWRlIHRoZSB4IGFuZCB5IGRpZmZlcmVuY2UgaW50byBzdGVwc1xyXG4gICAgY29uc3QgZnJhbWVzUGVyU2Vjb25kID0gMTAwMCAvIHRoaXMucGFjZVxyXG4gICAgY29uc3Qgc3RlcFggPSAoeCAtIHRoaXMueCkgLyAoc2VjICogZnJhbWVzUGVyU2Vjb25kKVxyXG4gICAgY29uc3Qgc3RlcFkgPSAoeSAtIHRoaXMueSkgLyAoc2VjICogZnJhbWVzUGVyU2Vjb25kKVxyXG4gICAgY29uc3QgaW50ID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICBpICs9IDFcclxuICAgICAgbWUuX21vdGlvbihtZS54ICsgc3RlcFgsIG1lLnkgKyBzdGVwWSlcclxuICAgICAgaWYgKGkgLyBmcmFtZXNQZXJTZWNvbmQgPj0gc2VjKSB7XHJcbiAgICAgICAgLy8gIGNsZWFyIHRoZSBpbnRlcnZhbCBhbmQgZml4IGFueSBcImRyaWZ0XCJcclxuICAgICAgICBjbGVhckludGVydmFsKGludClcclxuICAgICAgICBtZS5fbW90aW9uKHgsIHkpXHJcbiAgICAgICAgbWUuX3JlbGVhc2VXYWl0ZWQodHJpZ2dlcmluZ0lkKVxyXG4gICAgICB9XHJcbiAgICB9LCB0aGlzLnBhY2UpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIG1vdmUgLSBNb3ZlcyB0aGUgc3ByaXRlIGEgc3BlY2lmaWVkIG51bWJlciBvZiBwaXhlbHMgaW4gdGhlIGRpcmVjdGlvbiBpdCBpcyBwb2ludGluZy5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMubW92ZSgxMDAsIDEwMCk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gcGl4ZWxzIC0gbnVtYmVyIG9mIHBpeGVscyB0byBtb3ZlLlxyXG4gICovXHJcbiAgbW92ZSAocGl4ZWxzKSB7XHJcbiAgICAvKipcclxuICAgICogdG9SYWQgLSBjb252ZXJ0cyBhIGRlZ3JlZSB0byByYWRpYW5zLlxyXG4gICAgKlxyXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZGVnIC0gbnVtYmVyIG9mIGRlZ3JlZXMuXHJcbiAgICAqIEByZXR1cm4ge251bWJlcn0gLSBkZWdyZWVzIGNvbnZlcnRlZCB0byByYWRpYW5zLlxyXG4gICAgKi9cclxuICAgIGZ1bmN0aW9uIHRvUmFkIChkZWcpIHtcclxuICAgICAgcmV0dXJuIGRlZyAqIChNYXRoLlBJIC8gMTgwKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGR4ID0gTWF0aC5yb3VuZChNYXRoLmNvcyh0b1JhZCh0aGlzLmRpcmVjdGlvbiAtIDkwKSkgKiBwaXhlbHMpXHJcbiAgICBjb25zdCBkeSA9IE1hdGgucm91bmQoTWF0aC5zaW4odG9SYWQodGhpcy5kaXJlY3Rpb24gKyA5MCkpICogcGl4ZWxzKVxyXG5cclxuICAgIHRoaXMuX21vdGlvbih0aGlzLnggKyBkeCwgdGhpcy55ICsgZHkpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGdvVG8gLSBNb3ZlcyB0aGUgc3ByaXRlIHRvIHNwZWNpZmllZCBsb2NhdGlvbi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMuZ29UbygxMDAsIDEwMCk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0geCAtIHRoZSB4IGNvb3JkaW5hdGUuXHJcbiAgKiBAcGFyYW0ge251bWJlcn0geSAtIHRoZSB5IGNvb3JkaW5hdGUuXHJcbiAgKi9cclxuICBnb1RvICh4LCB5KSB7XHJcbiAgICB0aGlzLl9tb3Rpb24oeCwgeSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogZ29Ub3dhcmRzIC0gTW92ZXMgdGhlIHNwcml0ZSB0b3dhcmRzIGFub3RoZXIgc3ByaXRlLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqIGxldCBvdGhlclNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIG90aGVyU3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIG90aGVyU3ByaXRlLm1vdmUoMTAwKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMuZ29Ub3dhcmRzKG90aGVyU3ByaXRlKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzcHJpdGUgLSB0aGUgc3ByaXRlIHRvIG1vdmUgdG8uXHJcbiAgKi9cclxuICBnb1Rvd2FyZHMgKHNwcml0ZSkge1xyXG4gICAgdGhpcy5fbW90aW9uKHNwcml0ZS54LCBzcHJpdGUueSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc2V0WCAtIFBsYWNlcyB0aGUgc3ByaXRlIGF0IHRoZSBzcGVjaWZpZWQgeCBwb3NpdGlvbi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMuc2V0WCgxMDApO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IHggLSB0aGUgeCBjb29yZGluYXRlXHJcbiAgKi9cclxuICBzZXRYICh4KSB7XHJcbiAgICB0aGlzLl9tb3Rpb24oeCwgdGhpcy55KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBzZXRZIC0gUGxhY2VzIHRoZSBzcHJpdGUgYXQgdGhlIHNwZWNpZmllZCB5IHBvc2l0aW9uLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5zZXRZKDEwMCk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0geSAtIHRoZSB5IGNvb3JkaW5hdGUuXHJcbiAgKi9cclxuICBzZXRZICh5KSB7XHJcbiAgICB0aGlzLl9tb3Rpb24odGhpcy54LCB5KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBjaGFuZ2VYIC0gTW92ZXMgdGhlIHNwcml0ZSBvbiB0aGUgeCBheGlzIGEgc3BlY2lmaWVkIG51bWJlciBvZiBwaXhlbHMuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLmNoYW5nZVgoMTAwKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBwaXhlbHMgLSBudW1iZXIgb2YgcGl4ZWxzIHRvIG1vdmUuXHJcbiAgKi9cclxuICBjaGFuZ2VYIChwaXhlbHMpIHtcclxuICAgIHRoaXMuX21vdGlvbih0aGlzLnggKyBwaXhlbHMsIHRoaXMueSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogY2hhbmdlWSAtIE1vdmVzIHRoZSBzcHJpdGUgb24gdGhlIHkgYXhpcyBhIHNwZWNpZmllZCBudW1iZXIgb2YgcGl4ZWxzLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5jaGFuZ2VZKDEwMCk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gcGl4ZWxzIC0gbnVtYmVyIG9mIHBpeGVscyB0byBtb3ZlLlxyXG4gICovXHJcbiAgY2hhbmdlWSAocGl4ZWxzKSB7XHJcbiAgICB0aGlzLl9tb3Rpb24odGhpcy54LCB0aGlzLnkgKyBwaXhlbHMpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHBvaW50SW5EaXJlY3Rpb24gLSBQb2ludHMgdGhlIHNwcml0ZSBpbiBhIHNwZWNpZmllZCBkaXJlY3Rpb24uXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnBvaW50SW5EaXJlY3Rpb24oNDUpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IGRlZyAtIGRpcmVjdGlvbiB0byBwb2ludCB0by5cclxuICAqL1xyXG4gIHBvaW50SW5EaXJlY3Rpb24gKGRlZykge1xyXG4gICAgZGVnID4gMCA/IHRoaXMuZGlyZWN0aW9uID0gZGVnICUgMzYwIDogdGhpcy5kaXJlY3Rpb24gPSAoZGVnICsgKDM2MCAqIDEwKSkgJSAzNjBcclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcblxyXG4gICAgdGhpcy5jb2xsaXNpb25EZXRlY3Rvci5yZWZyZXNoU3ByaXRlQml0bWFwQ2FjaGUoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBwb2ludFRvd2FyZHMgLSBQb2ludCB0aGUgc3ByaXRlIHRvd2FyZHMgYW5vdGhlciBzcHJpdGUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICogbGV0IG90aGVyU3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogb3RoZXJTcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogb3RoZXJTcHJpdGUuZ29UbygxMDAsIDEwMCk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnBvaW50VG93YXJkcyhvdGhlclNwcml0ZSk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gdGhlIHNwcml0ZSB0byBtb3ZlIHRvLlxyXG4gICovXHJcbiAgcG9pbnRUb3dhcmRzIChzcHJpdGUpIHtcclxuICAgIC8qKlxyXG4gICAgKiBjb21wdXRlRGlyZWN0aW9uVG8gLSBmaW5kcyB0aGUgZGlyZWN0aW9uIGZyb20gc3ByaXRlJ3MgY3VycmVudCBsb2NhdGlvbiB0byBhIHNwZWNpZmllZCBzZXQgb2YgY29vcmRpbmF0ZXMuXHJcbiAgICAqXHJcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBmcm9tWCAtIHRoZSB4IGNvb3JkaW5hdGVcclxuICAgICogQHBhcmFtIHtudW1iZXJ9IGZyb21ZIC0gdGhlIHkgY29vcmRpbmF0ZVxyXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdG9YIC0gdGhlIHggY29vcmRpbmF0ZVxyXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdG9ZIC0gdGhlIHkgY29vcmRpbmF0ZVxyXG4gICAgKiBAcmV0dXJuIHtudW1iZXJ9IC0gZGlyZWN0aW9uIGluIGRlZ3JlZXMuXHJcbiAgICAqL1xyXG4gICAgZnVuY3Rpb24gY29tcHV0ZURpcmVjdGlvblRvIChmcm9tWCwgZnJvbVksIHRvWCwgdG9ZKSB7XHJcbiAgICAgIC8qKlxyXG4gICAgICAqIHRvRGVnIC0gQ29udmVydHMgcmFkaWFucyB0byBkZWdyZWVzLlxyXG4gICAgICAqXHJcbiAgICAgICogQHBhcmFtIHtudW1iZXJ9IHJhZCAtIG51bWJlciBvZiByYWRpYW5zLlxyXG4gICAgICAqIEByZXR1cm4ge251bWJlcn0gLSByYWRpYW5zIGNvbnZlcnRlZCB0byBkZWdyZWVzLlxyXG4gICAgICAqL1xyXG4gICAgICBmdW5jdGlvbiB0b0RlZyAocmFkKSB7XHJcbiAgICAgICAgcmV0dXJuIHJhZCAqICgxODAgLyBNYXRoLlBJKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyAxKSBGaW5kIHRoZSBhbmdsZSBpbiByYWQsIGNvbnZlcnQgdG8gZGVnICg5MCB0byAtOTApLlxyXG4gICAgICAvLyAyKSBGaW5kIHRoZSBzaWduIG9mIHRoZSBkZWx0YSBvbiB5IGF4aXMgKDEsIC0xKS4gU2hpZnQgdG8gKDAsIC0yKS4gTXVsdGlwbHkgYnkgOTAuICgwLCAxODApXHJcbiAgICAgIC8vIEFkZCAxKSBhbmQgMilcclxuICAgICAgLy8gTm9ybWFsaXplIHRvIDM2MFxyXG5cclxuICAgICAgbGV0IHJlc3VsdCA9ICh0b0RlZyhNYXRoLmF0YW4oKGZyb21YIC0gdG9YKSAvIChmcm9tWSAtIHRvWSkpKSArICg5MCAqIChNYXRoLnNpZ24oZnJvbVkgLSB0b1kpICsgMSkpICsgMzYwKSAlIDM2MDtcclxuICAgICAgKGZyb21ZIC0gdG9ZKSA9PT0gMCA/IHJlc3VsdCArPSA5MCA6IG51bGwgLy8gbWFrZSBzdXJlIHdlIGZpeCBhdGFuIGxpbSAoZGl2aXNpb24gYnkgemVybykuXHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBjb21wdXRlRGlyZWN0aW9uVG8odGhpcy54LCB0aGlzLnksIHNwcml0ZS54LCBzcHJpdGUueSlcclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgICB0aGlzLmNvbGxpc2lvbkRldGVjdG9yLnJlZnJlc2hTcHJpdGVCaXRtYXBDYWNoZSgpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHR1cm5SaWdodCAtIFR1cm5zIHRoZSBzcHJpdGUgaW4gYSBzcGVjaWZpZWQgbnVtYmVyIG9mIGRlZ3JlZXMgdG8gdGhlIHJpZ2h0IChjbG9ja3dpc2UpXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnR1cm5SaWdodCg0NSk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gZGVnIC0gbnVtYmVyIG9mIGRlZ3JlZXMgdG8gdHVybi5cclxuICAqL1xyXG4gIHR1cm5SaWdodCAoZGVnKSB7XHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9ICh0aGlzLmRpcmVjdGlvbiArIGRlZykgJSAzNjBcclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgICB0aGlzLmNvbGxpc2lvbkRldGVjdG9yLnJlZnJlc2hTcHJpdGVCaXRtYXBDYWNoZSgpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHR1cm5MZWZ0IC0gVHVybnMgdGhlIHNwcml0ZSBpbiBhIHNwZWNpZmllZCBudW1iZXIgb2YgZGVncmVlcyB0byB0aGUgbGVmdCAoY291bnRlci1jbG9ja3dpc2UpXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnR1cm5MZWZ0KDQ1KTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBkZWcgLSBudW1iZXIgb2YgZGVncmVlcyB0byB0dXJuLlxyXG4gICovXHJcbiAgdHVybkxlZnQgKGRlZykge1xyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSAoKHRoaXMuZGlyZWN0aW9uICsgMzYwKSAtIGRlZykgJSAzNjBcclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgICB0aGlzLmNvbGxpc2lvbkRldGVjdG9yLnJlZnJlc2hTcHJpdGVCaXRtYXBDYWNoZSgpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHNldFJvdGF0aW9uU3R5bGUgLSBTZXRzIG9uZSBvZiB0aHJlZSBwb3NzaWJsZSByb3RhdGlvbiBzdHlsZXM6XHJcbiAgKiAgIC0gJ25vJyAvIDIgLSB0aGUgc3ByaXRlcyBjaGFuZ2VzIHRoZSBkaXJlY3Rpb24gaW4gd2hpY2ggaXQgcG9pbnRzIHdpdGhvdXQgY2hhbmdpbmcgdGhlIHNwcml0ZXMgYXBwZWFyYW5jZS5cclxuICAqICAgLSAnbGVmdC1yaWdodCcgLyAxIC0gdGhlIHNwcml0ZSB3aWxsIGZsaXAgaG9yaXpvbnRhbGx5IHdoZW4gZGlyZWN0aW9uIGlzIGJldHdlZW4gMTgwIGFuZCAzNjAuXHJcbiAgKiAgIC0gJ2FsbCcgLyAwIC0gdGhlIHNwcml0ZSB3aWxsIHJvdGF0ZSBhcm91bmQgaXRzIGNlbnRlclxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLnNldFJvdGF0aW9uU3R5bGUoJ2xlZnQtcmlnaHQnKTtcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogc3ByaXRlLnNldFJvdGF0aW9uU3R5bGUoMSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IGRlZyAtIG51bWJlciBvZiBkZWdyZWVzIHRvIHR1cm4uXHJcbiAgKi9cclxuICBzZXRSb3RhdGlvblN0eWxlIChzdHlsZSkge1xyXG4gICAgbGV0IGN1clN0eWxlID0gc3R5bGVcclxuXHJcbiAgICBzdHlsZSA9PT0gJ25vJyA/IGN1clN0eWxlID0gMiA6IG51bGxcclxuICAgIHN0eWxlID09PSAnbGVmdC1yaWdodCcgPyBjdXJTdHlsZSA9IDEgOiBudWxsXHJcbiAgICBzdHlsZSA9PT0gJ2FsbCcgPyBjdXJTdHlsZSA9IDAgOiBudWxsXHJcblxyXG4gICAgdGhpcy5yb3RhdGlvblN0eWxlID0gY3VyU3R5bGVcclxuICB9XHJcblxyXG4gIC8qKiBMb29rcyAqICovXHJcblxyXG4gIC8qKlxyXG4gICogX3JlZnJlc2hDb3N0dW1lIC0gU2V0cyB0aGUgY29zdHVtZSBhbmQgc3ByaXRlIHdpZHRoIGFuZCBoaWdodCB0aGVuIHJlZnJlc2hlcyBlbGVtZW50LlxyXG4gICpcclxuICAqIEBwcml2YXRlXHJcbiAgKi9cclxuICBfcmVmcmVzaENvc3R1bWUgKCkge1xyXG4gICAgaWYgKHRoaXMuY29zdHVtZSkge1xyXG4gICAgICB0aGlzLndpZHRoID0gdGhpcy5jb3N0dW1lLnZpc2libGVXaWR0aFxyXG4gICAgICB0aGlzLmhlaWdodCA9IHRoaXMuY29zdHVtZS52aXNpYmxlSGVpZ2h0XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuXHJcbiAgICB0aGlzLmNvbGxpc2lvbkRldGVjdG9yLnJlZnJlc2hTcHJpdGVCaXRtYXBDYWNoZSgpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGFkZENvc3R1bWUgLSBBZGRzIGEgY29zdHVtZSB0byB0aGUgc3ByaXRlXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICogbGV0IGNvc3R1bWUgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLmFkZENvc3R1bWUoY29zdHVtZSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IGNvc3R1bWUgLSB0aGUgY29zdHVtZSB0byBhZGQuXHJcbiAgKi9cclxuICBhZGRDb3N0dW1lIChjb3N0dW1lKSB7XHJcbiAgICB0aGlzLmNvc3R1bWVzLnB1c2goY29zdHVtZSlcclxuXHJcbiAgICAvLyBpZiBcImJhcmVcIiBzZXQgdGhlIGFkZGVkIGFzIGFjdGl2ZS5cclxuICAgIGlmICghdGhpcy5jb3N0dW1lKSB7XHJcbiAgICAgIHRoaXMuY29zdHVtZSA9IHRoaXMuY29zdHVtZXNbMF1cclxuICAgICAgdGhpcy53aWR0aCA9IHRoaXMuY29zdHVtZS52aXNpYmxlV2lkdGhcclxuICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmNvc3R1bWUudmlzaWJsZUhlaWdodFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHN3aXRjaENvc3R1bWVUbyAtIFN3aXRjaGVzIHRvIHNwZWNpZmllZCBjb3N0dW1lLiBJZiBub3QgZm91bmQgZmFpbHMgc2lsZW50bHkuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICogbGV0IGNvc3R1bWUgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLmFkZENvc3R1bWUoY29zdHVtZSk7XHJcbiAgKiBzcHJpdGUuc3dpdGNoQ29zdHVtZVRvKGNvc3R1bWUpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBiYWNrZHJvcCAtIHRoZSBjb3N0dW1lIHRvIHN3aXRjaCB0b28uXHJcbiAgKi9cclxuICBzd2l0Y2hDb3N0dW1lVG8gKGNvc3R1bWUpIHtcclxuICAgIGNvbnN0IGN1cnJlbnRDb3N0dW1lSW5kZXggPSB0aGlzLmNvc3R1bWVzLmluZGV4T2YoY29zdHVtZSlcclxuICAgIGN1cnJlbnRDb3N0dW1lSW5kZXggIT09IC0xID8gdGhpcy5jb3N0dW1lID0gdGhpcy5jb3N0dW1lc1tjdXJyZW50Q29zdHVtZUluZGV4XSA6IG51bGxcclxuXHJcbiAgICB0aGlzLl9yZWZyZXNoQ29zdHVtZSgpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHN3aXRjaENvc3R1bWVUb051bSAtIFN3aXRjaGVzIHRvIHNwZWNpZmllZCBjb3N0dW1lIGJ5IG51bWJlciBvZiBjdXJyZW50ICgwIGlzIGZpcnN0KS4gSWYgbm90IGZvdW5kIGZhaWxzIHNpbGVudGx5LlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqIGxldCBjb3N0dW1lID0gbmV3IGJsb2NrTGlrZS5Db3N0dW1lKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS5hZGRDb3N0dW1lKGNvc3R1bWUpO1xyXG4gICogc3ByaXRlLnN3aXRjaENvc3R1bWVUb051bSgxKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSB0aGUgY29zdHVtZSB0byBzd2l0Y2ggdG9vLlxyXG4gICovXHJcbiAgc3dpdGNoQ29zdHVtZVRvTnVtIChpbmRleCkge1xyXG4gICAgdGhpcy5zd2l0Y2hDb3N0dW1lVG8odGhpcy5jb3N0dW1lc1tpbmRleF0pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIG5leHRDb3N0dW1lIC0gU3dpdGNoZXMgdG8gdGhlIG5leHQgY29zdHVtZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKiBsZXQgY29zdHVtZSA9IG5ldyBibG9ja0xpa2UuQ29zdHVtZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuYWRkQ29zdHVtZShjb3N0dW1lKTtcclxuICAqIHNwcml0ZS5uZXh0Q29zdHVtZSgpO1xyXG4gICpcclxuICAqL1xyXG4gIG5leHRDb3N0dW1lICgpIHtcclxuICAgIGNvbnN0IGN1cnJlbnRDb3N0dW1lSW5kZXggPSB0aGlzLmNvc3R1bWVzLmluZGV4T2YodGhpcy5jb3N0dW1lKVxyXG4gICAgdGhpcy5jb3N0dW1lID0gdGhpcy5jb3N0dW1lc1soY3VycmVudENvc3R1bWVJbmRleCArIDEpICUgdGhpcy5jb3N0dW1lcy5sZW5ndGhdXHJcblxyXG4gICAgdGhpcy5fcmVmcmVzaENvc3R1bWUoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiByZW1vdmVDb3N0dW1lIC0gUmVtb3ZlcyBhIGNvc3R1bWUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICogbGV0IGNvc3R1bWUgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLmFkZENvc3R1bWUoY29zdHVtZSk7XHJcbiAgKiBzcHJpdGUucmVtb3ZlQ29zdHVtZShjb3N0dW1lKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gY29zdHVtZSAtIHRoZSBjb3N0dW1lIHRvIHJlbW92ZS5cclxuICAqL1xyXG4gIHJlbW92ZUNvc3R1bWUgKGNvc3R1bWUpIHtcclxuICAgIGlmICh0aGlzLmNvc3R1bWVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgY29uc3QgY3VycmVudENvc3R1bWVJbmRleCA9IHRoaXMuY29zdHVtZXMuaW5kZXhPZihjb3N0dW1lKVxyXG4gICAgICB0aGlzLmNvc3R1bWUgPT09IGNvc3R1bWUgPyB0aGlzLmNvc3R1bWUgPSB0aGlzLmNvc3R1bWVzWyhjdXJyZW50Q29zdHVtZUluZGV4ICsgMSkgJSB0aGlzLmNvc3R1bWVzLmxlbmd0aF0gOiBudWxsXHJcbiAgICAgIHRoaXMuY29zdHVtZXMgPSB0aGlzLmNvc3R1bWVzLmZpbHRlcigoaXRlbSkgPT4gaXRlbSAhPT0gY29zdHVtZSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuY29zdHVtZXMgPSBbXVxyXG4gICAgICB0aGlzLmNvc3R1bWUgPSBudWxsXHJcbiAgICB9XHJcbiAgICB0aGlzLl9yZWZyZXNoQ29zdHVtZSgpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlbW92ZUNvc3R1bWVOdW0gLSBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgY29zdHVtZSBieSBudW1iZXIgb2YgY3VycmVudCAoMCBpcyBmaXJzdCkuXHJcbiAgKiBJZiB0aGVyZSBpcyBvbmx5IG9uZSBjb3N0dW1lLCB3aWxsIGZhaWwgYW5kIGVtaXQgYSBjb25zb2xlIG1lc3NhZ2UuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICogbGV0IGNvc3R1bWUgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLmFkZENvc3R1bWUoY29zdHVtZSk7XHJcbiAgKiBzcHJpdGUucmVtb3ZlQ29zdHVtZU51bSgxKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSB0aGUgY29zdHVtZSB0byByZW1vdmUuXHJcbiAgKi9cclxuICByZW1vdmVDb3N0dW1lTnVtIChpbmRleCkge1xyXG4gICAgdGhpcy5yZW1vdmVDb3N0dW1lKHRoaXMuY29zdHVtZXNbaW5kZXhdKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBzaG93IC0gU2hvd3MgdGhlIHNwcml0ZS4gQnkgZGVmYXVsdCBzcHJpdGVzIGFyZSBzaG93bi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS5oaWRlKCk7XHJcbiAgKiBzcHJpdGUuc2hvdygpO1xyXG4gICpcclxuICAqL1xyXG4gIHNob3cgKCkge1xyXG4gICAgdGhpcy5zaG93aW5nID0gdHJ1ZVxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogaGlkZSAtIEhpZGVzIHRoZSBzcHJpdGUuIEJ5IGRlZmF1bHQgc3ByaXRlcyBhcmUgc2hvd24uXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuaGlkZSgpO1xyXG4gICpcclxuICAqL1xyXG4gIGhpZGUgKCkge1xyXG4gICAgdGhpcy5zaG93aW5nID0gZmFsc2VcclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlZnJlc2ggLSBGb3JjZXMgYSBzcHJpdGUgcmVmcmVzaC5cclxuICAqIE5vdGU6IHNlcnZpY2UgbWV0aG9kIHRvIGJlIHVzZWQgaWYgY29zdHVtZSB3YXMgbWFuaXB1bGF0ZWQgZGlyZWN0bHkuXHJcbiAgKi9cclxuICByZWZyZXNoICgpIHtcclxuICAgIGNvbnN0IG1lID0gdGhpc1xyXG4gICAgLy8gd2FpdCBhIHNlYy4uLlxyXG4gICAgLy8gVE9ETzogVGhpcyBpcyB0byBhY2NvbW9kYXRlIGR5bmFtaWMgaW1hZ2UgcmVzaXplLiBOb3QgaWRlYWwuIFNob3VsZCBiZSBldmVudCBkcml2ZW4uXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgLy8gaW4gY2FzZSBjb3N0dW1lIHdhcyByZXNpemVkIGZvcmNlIGEgcmVzZXQgb2Ygc2l6ZS5cclxuICAgICAgbWUuc2V0U2l6ZShtZS5tYWduaWZpY2F0aW9uKVxyXG4gICAgICAvLyB0aGVuIHJlZnJlc2ggdGhlIERPTS5cclxuICAgICAgbWUuZWxlbWVudCA/IG1lLmVsZW1lbnQudXBkYXRlKG1lKSA6IG51bGxcclxuICAgICAgdGhpcy5jb2xsaXNpb25EZXRlY3Rvci5yZWZyZXNoU3ByaXRlQml0bWFwQ2FjaGUoKVxyXG4gICAgfSwgdGhpcy5wYWNlKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiByZXNpemVUb0ltYWdlIC0gc2V0cyB0aGUgd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgc3ByaXRlIHRvIHRoYXQgb2YgdGhlIGltYWdlIGZpbGUgb2YgY3VycmVudCBjb3N0dW1lLlxyXG4gICogTm90ZTogc2VydmljZSBtZXRob2QuIFNpbWlsYXIgdG8gY2FsbGluZyByZXNpemVUb0ltYWdlKCkgb24gY29zdHVtZSBhbmQgdGhlbiByZWZyZXNoKCkgb24gc3ByaXRlLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBjb25zdCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZShudWxsKTtcclxuICAqXHJcbiAgKiBjb25zdCBhbmdyeVNoZWVwID0gbmV3IGJsb2NrTGlrZS5Db3N0dW1lKHtcclxuICAqICAgaW1hZ2U6ICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iL2QvZGIvRW1vamlvbmVfMUY0MTEuc3ZnLzIwMHB4LUVtb2ppb25lXzFGNDExLnN2Zy5wbmcnLFxyXG4gICogfSk7XHJcbiAgKiBhbmdyeVNoZWVwLmFkZFRvKHNwcml0ZSk7XHJcbiAgKlxyXG4gICogc3ByaXRlLnJlc2l6ZVRvSW1hZ2UoKTtcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKi9cclxuICByZXNpemVUb0ltYWdlICgpIHtcclxuICAgIGlmICh0aGlzLmNvc3R1bWUpIHtcclxuICAgICAgdGhpcy5jb3N0dW1lLnJlc2l6ZVRvSW1hZ2UoKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVmcmVzaCgpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGlubmVyIC0gUGxhY2VzIGFuIEhUTUwgZWxlbWVudCBpbnNpZGUgdGhlIGN1cnJlbnQgY29zdHVtZSBvZiB0aGUgc3ByaXRlLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLmlubmVyKCc8cCBjbGFzcz1cImJpZyBjZW50ZXJlZCByYWluYm93XCI+Oik8L3A+Jyk7XHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIHNwcml0ZS5pbm5lcignSSBsaWtlIHRleHQgb25seScpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBlbCAtIHRoZSBET00gZWxlbWVudC5cclxuICAqL1xyXG4gIGlubmVyIChodG1sKSB7XHJcbiAgICB0aGlzLmNvc3R1bWUuaW5uZXIoaHRtbClcclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGluc2VydCAtIFBsYWNlcyBhIERPTSBlbGVtZW50IGluc2lkZSB0aGUgY3VycmVudCBjb3N0dW1lIG9mIHRoZSBzcHJpdGUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuaW5zZXJ0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdteS1odG1sLWNyZWF0aW9uJykpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBlbCAtIHRoZSBET00gZWxlbWVudC5cclxuICAqL1xyXG4gIGluc2VydCAoZWwpIHtcclxuICAgIHRoaXMuY29zdHVtZS5pbnNlcnQoZWwpXHJcbiAgICB0aGlzLmVsZW1lbnQgPyB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBfcmVmcmVzaFNpemUgLSBTZXRzIHRoZSBzcHJpdGUgd2lkdGggYW5kIGhpZ2h0IGluIHJlbGF0aW9uIHRvIG9yaWdpbmFsIHRoZW4gcmVmcmVzaGVzIGVsZW1lbnQuXHJcbiAgKlxyXG4gICogQHByaXZhdGVcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBjb3N0dW1lIC0gdGhlIGNvc3R1bWUgdG8gYWRkLlxyXG4gICovXHJcbiAgX3JlZnJlc2hTaXplICgpIHtcclxuICAgIC8qKlxyXG4gICAgKiBkZWNpbWFsUm91bmQgLSByb3VuZHMgYSBudW1iZXIgdG9vIGRlY2ltYWwgcG9pbnRzLlxyXG4gICAgKlxyXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSB0aGUgdmFsdWUgdG8gcm91bmQuXHJcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBwb2ludHMgLSBob3cgbWFueSBkZWNpbWFsIHBvaW50cyB0byBsZWF2ZS5cclxuICAgICovXHJcbiAgICBmdW5jdGlvbiBkZWNpbWFsUm91bmQgKHZhbHVlLCBwb2ludHMpIHtcclxuICAgICAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUgKiAoMTAgKiogcG9pbnRzKSkgLyAoMTAgKiogcG9pbnRzKVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmNvc3R1bWUpIHtcclxuICAgICAgdGhpcy53aWR0aCA9IGRlY2ltYWxSb3VuZCh0aGlzLmNvc3R1bWUud2lkdGggKiAodGhpcy5tYWduaWZpY2F0aW9uIC8gMTAwKSwgMilcclxuICAgICAgdGhpcy5oZWlnaHQgPSBkZWNpbWFsUm91bmQodGhpcy5jb3N0dW1lLmhlaWdodCAqICh0aGlzLm1hZ25pZmljYXRpb24gLyAxMDApLCAyKVxyXG5cclxuICAgICAgdGhpcy5jb3N0dW1lcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY29zdHVtZSA9IGl0ZW1cclxuICAgICAgICBjb3N0dW1lLnZpc2libGVXaWR0aCA9IGRlY2ltYWxSb3VuZChjb3N0dW1lLndpZHRoICogKHRoaXMubWFnbmlmaWNhdGlvbiAvIDEwMCksIDIpXHJcbiAgICAgICAgY29zdHVtZS52aXNpYmxlSGVpZ2h0ID0gZGVjaW1hbFJvdW5kKGNvc3R1bWUuaGVpZ2h0ICogKHRoaXMubWFnbmlmaWNhdGlvbiAvIDEwMCksIDIpXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICB0aGlzLmNvc3R1bWUudmlzaWJsZVdpZHRoID0gdGhpcy53aWR0aFxyXG4gICAgICB0aGlzLmNvc3R1bWUudmlzaWJsZUhlaWdodCA9IHRoaXMuaGVpZ2h0XHJcblxyXG4gICAgICB0aGlzLmVsZW1lbnQgPyB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMpIDogbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY29sbGlzaW9uRGV0ZWN0b3IucmVmcmVzaFNwcml0ZUJpdG1hcENhY2hlKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogY2hhbmdlU2l6ZSAtIENoYW5nZXMgdGhlIHNpemUgb2YgdGhlIHNwcml0ZSBieSBzcGVjaWZpZWQgcGVyY2VudGFnZSBudW1iZXIuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuY2hhbmdlU2l6ZSg1MCk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IGNoYW5nZSAtIHRoZSBwZXJjZW50YWdlIGNoYW5nZS5cclxuICAqL1xyXG4gIGNoYW5nZVNpemUgKGNoYW5nZSkge1xyXG4gICAgdGhpcy5tYWduaWZpY2F0aW9uICs9IGNoYW5nZVxyXG5cclxuICAgIHRoaXMuX3JlZnJlc2hTaXplKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc2V0U2l6ZSAtIFNldHMgdGhlIHNpemUgb2YgdGhlIHNwcml0ZSB0byB0aGUgc3BlY2lmaWVkIHBlcmNlbnRhZ2UgbnVtYmVyLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLnNldFNpemUoMTUwKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gcGVyY2VudCAtIHRoZSBwZXJjZW50YWdlIHRvIHNldC5cclxuICAqL1xyXG4gIHNldFNpemUgKHBlcmNlbnQpIHtcclxuICAgIHRoaXMubWFnbmlmaWNhdGlvbiA9IHBlcmNlbnRcclxuXHJcbiAgICB0aGlzLl9yZWZyZXNoU2l6ZSgpXHJcbiAgfVxyXG5cclxuICAvKiogVGV4dCBVSSAqICovXHJcblxyXG4gIC8qKlxyXG4gICogdGhpbmsgLSBDcmVhdGVzIGEgXCJ0aGluayBidWJibGVcIiBvdmVyIHRoZSBzcHJpdGUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUudGhpbmsoJ0kgdGhpbmsgdGhlcmVmb3JlIEkgYW0uJyk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSB0aGUgdGV4dCBpbnNpZGUgdGhlIGJ1YmJsZS5cclxuICAqL1xyXG4gIHRoaW5rICh0ZXh0KSB7XHJcbiAgICBpZiAodGhpcy5lbGVtZW50KSB7XHJcbiAgICAgIHRoaXMudGV4dHVpID8gdGhpcy50ZXh0dWkgPSB0aGlzLnRleHR1aS5kZWxldGUodGhpcykgOiBudWxsXHJcbiAgICAgIHR5cGVvZiB0ZXh0ICE9PSAndW5kZWZpbmVkJyAmJiB0ZXh0LnRvU3RyaW5nKCkgPyB0aGlzLnRleHR1aSA9IG5ldyBUZXh0VWlFbGVtZW50KHRoaXMsICd0aGluaycsIHRleHQpIDogbnVsbFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiB0aGlua1dhaXQgLSBDcmVhdGVzIGEgXCJ0aGluayBidWJibGVcIiBvdmVyIHRoZSBzcHJpdGUgZm9yIGEgc3BlY2lmaWVkIG51bWJlciBvZiBzZWNvbmRzLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLnRoaW5rV2FpdCgnSSB0aGluayB0aGVyZWZvcmUgSSBhbS4nLCAzKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIHRoZSB0ZXh0IGluc2lkZSB0aGUgYnViYmxlLlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IHNlYyAtIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0byB3YWl0LlxyXG4gICovXHJcbiAgdGhpbmtXYWl0ICh0ZXh0LCBzZWMsIHRyaWdnZXJpbmdJZCA9IG51bGwpIHtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLnRoaW5rKCcnKVxyXG4gICAgICB0aGlzLl9yZWxlYXNlV2FpdGVkKHRyaWdnZXJpbmdJZClcclxuICAgIH0sIHNlYyAqIDEwMDApXHJcbiAgICB0aGlzLnRoaW5rKHRleHQpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHNheSAtIENyZWF0ZXMgYSBcInNwZWVjaCBidWJibGVcIiBvdmVyIHRoZSBzcHJpdGUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuc2F5KCdJdCBpcyBub3QgdGhlIGNvbnNjaW91c25lc3Mgb2YgbWVuIHRoYXQgZGV0ZXJtaW5lcyB0aGVpciBiZWluZywgYnV0LCBvbiB0aGUgY29udHJhcnksIHRoZWlyIHNvY2lhbCBiZWluZyB0aGF0IGRldGVybWluZXMgdGhlaXIgY29uc2Npb3VzbmVzcy4nKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIHRoZSB0ZXh0IGluc2lkZSB0aGUgYnViYmxlLlxyXG4gICovXHJcbiAgc2F5ICh0ZXh0KSB7XHJcbiAgICBpZiAodGhpcy5lbGVtZW50KSB7XHJcbiAgICAgIHRoaXMudGV4dHVpID8gdGhpcy50ZXh0dWkgPSB0aGlzLnRleHR1aS5kZWxldGUodGhpcykgOiBudWxsXHJcbiAgICAgIHR5cGVvZiB0ZXh0ICE9PSAndW5kZWZpbmVkJyAmJiB0ZXh0LnRvU3RyaW5nKCkgPyB0aGlzLnRleHR1aSA9IG5ldyBUZXh0VWlFbGVtZW50KHRoaXMsICdzYXknLCB0ZXh0KSA6IG51bGxcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc2F5V2FpdCAtIENyZWF0ZXMgYSBcInNwZWVjaCBidWJibGVcIiBvdmVyIHRoZSBzcHJpdGUgZm9yIGEgc3BlY2lmaWVkIG51bWJlciBvZiBzZWNvbmRzLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLnNheVdhaXQoJ0l0IGlzIG5vdCB0aGUgY29uc2Npb3VzbmVzcyBvZiBtZW4gdGhhdCBkZXRlcm1pbmVzIHRoZWlyIGJlaW5nLCBidXQsIG9uIHRoZSBjb250cmFyeSwgdGhlaXIgc29jaWFsIGJlaW5nIHRoYXQgZGV0ZXJtaW5lcyB0aGVpciBjb25zY2lvdXNuZXNzLicsIDMpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gdGhlIHRleHQgaW5zaWRlIHRoZSBidWJibGUuXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gc2VjIC0gdGhlIG51bWJlciBvZiBzZWNvbmRzIHRvIHdhaXQuXHJcbiAgKi9cclxuICBzYXlXYWl0ICh0ZXh0LCBzZWMsIHRyaWdnZXJpbmdJZCA9IG51bGwpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjbGFzcy1tZXRob2RzLXVzZS10aGlzXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5zYXkoJycpXHJcbiAgICAgIHRoaXMuX3JlbGVhc2VXYWl0ZWQodHJpZ2dlcmluZ0lkKVxyXG4gICAgfSwgc2VjICogMTAwMClcclxuICAgIHRoaXMuc2F5KHRleHQpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGFzayAtIENyZWF0ZXMgYW4gXCJhc2sgYnViYmxlXCIgb3ZlciB0aGUgc3ByaXRlLlxyXG4gICogQWxsb3dzIGZvciBhbiBpbnB1dCBib3ggdG8gYmUgZGlzcGxheWVkIHRvIHRoZSB1c2VyIGFuZFxyXG4gICogY2FwdHVyZSB1c2VyIGlucHV0IGludG8gdGhlIHZhcmlhYmxlIHNwZWNpZmllZCBieSB0aGUgdXNlci5cclxuICAqIE5vdGUgLSB2YXJpYWJsZSBmb3IgYW5zd2VyIG11c3QgYmUgZGVjbGFyZWQgaW4gZ2xvYmFsIHNjb3BlLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiAvL2dvb2Q6XHJcbiAgKiBsZXQgYW5zd2VyO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgYW5zd2VyID0gdGhpcy5hc2soJ0lzIHRoZSBkZXN0aW55IG9mIG1hbmtpbmQgZGVjaWRlZCBieSBtYXRlcmlhbCBjb21wdXRhdGlvbj8nKTtcclxuICAqICAgdGhpcy5zYXkoYW5zd2VyKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIC8vIGJhZDpcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIGxldCBhbnN3ZXI7XHJcbiAgKiAgIGFuc3dlciA9IHRoaXMuYXNrKCdJcyB0aGUgZGVzdGlueSBvZiBtYW5raW5kIGRlY2lkZWQgYnkgbWF0ZXJpYWwgY29tcHV0YXRpb24/Jyk7XHJcbiAgKiAgIHRoaXMuc2F5KGFuc3dlcik7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIHRoZSB0ZXh0IG9mIHRoZSBxdWVzdGlvblxyXG4gICpcclxuICAqL1xyXG4gIGFzayAodGV4dCwgdGhlVmFyID0gbnVsbCwgdHJpZ2dlcmluZ0lkID0gbnVsbCkge1xyXG4gICAgY29uc3QgbWUgPSB0aGlzXHJcbiAgICBtZS5hc2tJZCA9IHRoaXMuX2dlbmVyYXRlVVVJRCgpXHJcblxyXG4gICAgaWYgKHRoaXMuZWxlbWVudCkge1xyXG4gICAgICB0aGlzLnRleHR1aSA/IHRoaXMudGV4dHVpID0gdGhpcy50ZXh0dWkuZGVsZXRlKHRoaXMpIDogbnVsbFxyXG4gICAgICB0eXBlb2YgdGV4dCAhPT0gJ3VuZGVmaW5lZCcgJiYgdGV4dC50b1N0cmluZygpID8gdGhpcy50ZXh0dWkgPSBuZXcgVGV4dFVpRWxlbWVudChtZSwgJ2FzaycsIHRleHQpIDogbnVsbFxyXG5cclxuICAgICAgLy8gdGhpcyB3aWxsIHdhaXQgZm9yIHVzZXIgaW5wdXRcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihgYmxvY2tMaWtlLmFzay4ke3RoaXMuaWR9LiR7bWUuYXNrSWR9YCwgZnVuY3Rpb24gYXNrTGlzdGVuZXIgKGUpIHtcclxuICAgICAgICAvLyByZW1vdmUgaXQuXHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihgYmxvY2tMaWtlLmFzay4ke21lLmlkfS4ke21lLmFza0lkfWAsIGFza0xpc3RlbmVyKVxyXG4gICAgICAgIC8vIHRoaXMgaXMgdGhlIHdhaXRlZCBtZXRob2QgbGlzdGVuZXIuIHJlbGVhc2UgaXQuXHJcbiAgICAgICAgbWUuX3JlbGVhc2VXYWl0ZWQodHJpZ2dlcmluZ0lkKVxyXG4gICAgICAgIC8vIHNldCB0aGUgdXNlciBkZWZpbmVkIHZhcmlhYmxlIHRvIHRoZSBjYXB0dXJlZCB2YWx1ZS5cclxuICAgICAgICB0aGVWYXIgPyBtZS5fc2V0VG9WYXIodGhlVmFyLCBlLmRldGFpbC52YWx1ZSkgOiBudWxsXHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBVSS5cclxuICAgICAgICBtZS50ZXh0dWkgPyBtZS50ZXh0dWkgPSBtZS50ZXh0dWkuZGVsZXRlKG1lKSA6IG51bGxcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQZW4gKiAqL1xyXG5cclxuICAvKipcclxuICAqIHBlbkNsZWFyIC0gQ2xlYXJzIHRoZSBkcmF3aW5nIHN1cmZhY2UuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnBlbkNsZWFyKCk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKi9cclxuICBwZW5DbGVhciAoKSB7XHJcbiAgICB0aGlzLnN1cmZhY2UuY2xlYXIodGhpcylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogcGVuRG93biAtIFwiQWN0aXZhdGVzXCIgZHJhd2luZyBieSBzZXR0aW5nIHJlcXVpcmVkIHZhbHVlcy5cclxuICAqIFdoZW4gYWN0aXZhdGVkIHNwcml0ZSBtb3Rpb24gd2lsbCBjcmVhdGUgdGhlIGRyYXdpbmcgb24gdGhlIHN0YWdlJ3MgY2FudmFzLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5wZW5Eb3duKCk7XHJcbiAgKiAgIHRoaXMubW92ZSgxMDApO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICovXHJcbiAgcGVuRG93biAoKSB7XHJcbiAgICB0aGlzLmRyYXdpbmcgPSB0cnVlXHJcbiAgICB0aGlzLnByZXZYID0gdGhpcy54XHJcbiAgICB0aGlzLnByZXZZID0gdGhpcy55XHJcbiAgICB0aGlzLnN1cmZhY2UuZHJhdyh0aGlzKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBwZW5VcCAtIFwiRGVhY3RpdmF0ZXNcIiBkcmF3aW5nIGJ5IHNldHRpbmcgcmVxdWlyZWQgdmFsdWVzLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5wZW5Eb3duKCk7XHJcbiAgKiAgIHRoaXMubW92ZSgxMDApO1xyXG4gICogICB0aGlzLnBlblVwKCk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKi9cclxuICBwZW5VcCAoKSB7XHJcbiAgICB0aGlzLmRyYXdpbmcgPSBmYWxzZVxyXG4gICAgdGhpcy5zdXJmYWNlLmRyYXcodGhpcylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc2V0UGVuQ29sb3IgLSBTZXRzIHRoZSBjb2xvciBvZiB0aGUgcGVuLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLnNldFBlbkNvbG9yKCcjZmYwMDAwJylcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogc3ByaXRlLnNldFBlbkNvbG9yKCdyZWQnKVxyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvclN0cmluZyAtIGEgdmFsaWQgY29sb3IgZGVmaW5pdGlvbiBmb3IgY2FudmFzIHN0cm9rZVN0eWxlLlxyXG4gICovXHJcbiAgc2V0UGVuQ29sb3IgKGNvbG9yU3RyaW5nKSB7XHJcbiAgICB0aGlzLnBlbkNvbG9yID0gY29sb3JTdHJpbmdcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc2V0UGVuU2l6ZSAtIFNldHMgdGhlIHNpemUgb2YgdGhlIHBlbi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS5zZXRQZW5TaXplKDEwKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gcGl4ZWxzIC0gYSBudW1iZXIgZm9yIGNhbnZhcyBsaW5lV2lkdGguXHJcbiAgKi9cclxuICBzZXRQZW5TaXplIChwaXhlbHMpIHtcclxuICAgIHRoaXMucGVuU2l6ZSA9IHBpeGVsc1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBjaGFuZ2VQZW5TaXplIC0gQ2hhbmdlcyB0aGUgc2l6ZSBvZiB0aGUgcGVuLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5jaGFuZ2VQZW5TaXplKDEwKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFuZ2UgLSB0aGUgY2hhbmdlIGluIHBpeGVscy5cclxuICAqL1xyXG4gIGNoYW5nZVBlblNpemUgKGNoYW5nZSkge1xyXG4gICAgdGhpcy5wZW5TaXplICs9IGNoYW5nZVxyXG4gIH1cclxuXHJcbiAgLyogU2Vuc2luZyAqL1xyXG5cclxuICAvKipcclxuICAqIGRpc3RhbmNlVG8gLSBSZXR1cm5zIHRoZSBkaXN0YW5jZSB0byBhIHBvaW50IG9uIHRoZSBzY3JlZW4uXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2Uoe3NlbnNpbmc6IHRydWV9KTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKlxyXG4gICogc3RhZ2Uud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogIHNwcml0ZS5zYXkodGhpcy5kaXN0YW5jZVRvKHRoaXMubW91c2VYLCB0aGlzLm1vdXNlWSkpXHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5vdGhlclNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBvdGhlclNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKlxyXG4gICogc3RhZ2Uud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogIHNwcml0ZS5zYXkodGhpcy5kaXN0YW5jZVRvKG90aGVyU3ByaXRlLngsIG90aGVyU3ByaXRlLnkpKVxyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IHggLSB0aGUgeCBjb29yZGluYXRlLlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IHkgLSB0aGUgeSBjb29yZGluYXRlLlxyXG4gICogQHJldHVybiB7bnVtYmVyfSAtIGRpc3RhbmNlIGluIHBpeGVscyB0byBwb3NpdGlvbiBvbiBzY3JlZW4gKG5vdCByb3VuZGVkKS5cclxuICAqL1xyXG4gIGRpc3RhbmNlVG8gKHgsIHkpIHtcclxuICAgIGNvbnN0IGR4ID0gdGhpcy54IC0geFxyXG4gICAgY29uc3QgZHkgPSB0aGlzLnkgLSB5XHJcblxyXG4gICAgcmV0dXJuIE1hdGguc3FydCgoZHggKiBkeCkgKyAoZHkgKiBkeSkpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHRvdWNoaW5nRWRnZSAtIENoZWNrcyBpcyB0aGlzIHNwcml0ZSB0b3VjaGVzIHRoZSBlZGdlIG9mIHRoZSBzdGFnZSBhbmQgcmV0dXJucyB0aGUgZWRnZSB0b3VjaGVkLlxyXG4gICpcclxuICAqIE5vdGVzOlxyXG4gICogMS4gVGhpcyBpcyBiYXNlZCBvbiByZWN0YW5ndWxhciBjb2xsaXNpb24gZGV0ZWN0aW9uLlxyXG4gICogMi4gdGhpcyBjb21wYXJlcyBhIG5haXZlIHJlY3RhbmdsZSwgc28gaWYgdGhlIHNwcml0ZSBpcyByb3RhdGVkIHRvdWNoaW5nIG1pZ2h0IGJlIHNlbnNlZCBlYXJseSBvciBsYXRlLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICB3aGlsZSh0aGlzLnggPCBzdGFnZS53aWR0aCAvIDIpIHtcclxuICAqICAgIHRoaXMubW92ZSgxMClcclxuICAqICAgIHRoaXMuc2F5KHRoaXMudG91Y2hpbmdFZGdlKCkpO1xyXG4gICogICB9XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gdGhlIHNpZGUgb2YgdGhlIHN0YWdlIHRoYXQgaXMgdG91Y2hlZCAobnVsbCwgdG9wLCBib3R0b20sIGxlZnQsIHJpZ2h0KVxyXG4gICovXHJcbiAgdG91Y2hpbmdFZGdlICgpIHtcclxuICAgIC8vIGNvbnN0IHN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpXHJcbiAgICBjb25zdCBjb2xsaWRlZCA9IHRoaXMuY29sbGlzaW9uRGV0ZWN0b3IuaXNTcHJpdGVUb3VjaGluZ0VkZ2Uoe1xyXG4gICAgICBpbWFnZTogdGhpcy5jb3N0dW1lLmltYWdlLFxyXG4gICAgICB4OiB0aGlzLngsXHJcbiAgICAgIHk6IHRoaXMueSxcclxuICAgICAgdzogdGhpcy53aWR0aCxcclxuICAgICAgaDogdGhpcy5oZWlnaHRcclxuICAgIH0pXHJcbiAgICAvLyBjb25zb2xlLmxvZyhgUHJvY2VzcyBUaW1lOiAke3BlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lfWApXHJcblxyXG4gICAgcmV0dXJuIGNvbGxpZGVkXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGlzVG91Y2hpbmdFZGdlIC0gQ2hlY2tzIGlzIHRoaXMgc3ByaXRlIHRvdWNoZXMgdGhlIGVkZ2UuXHJcbiAgKlxyXG4gICogTm90ZXM6XHJcbiAgKiAxLiBUaGlzIGlzIGJhc2VkIG9uIHJlY3Rhbmd1bGFyIGNvbGxpc2lvbiBkZXRlY3Rpb24uXHJcbiAgKiAyLiB0aGlzIGNvbXBhcmVzIGEgbmFpdmUgcmVjdGFuZ2xlLCBzbyBpZiB0aGUgc3ByaXRlIGlzIHJvdGF0ZWQgdG91Y2hpbmcgbWlnaHQgYmUgc2Vuc2VkIGVhcmx5IG9yIGxhdGUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogIHdoaWxlKHRoaXMueCA8IHN0YWdlLndpZHRoIC8gMikge1xyXG4gICogICAgdGhpcy5tb3ZlKDEwKVxyXG4gICogICAgdGhpcy5zYXkodGhpcy5pc1RvdWNoaW5nRWRnZSgpKTtcclxuICAqICAgfVxyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHJldHVybiB7Ym9vbGVhbn0gLSBpcyB0aGUgc3ByaXRlIHRvdWNoaW5nIHRoZSBlZGdlLlxyXG4gICovXHJcbiAgaXNUb3VjaGluZ0VkZ2UgKCkge1xyXG4gICAgcmV0dXJuICEhdGhpcy50b3VjaGluZ0VkZ2UoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiB0b3VjaGluZyAtIENoZWNrcyBpcyB0aGlzIHNwcml0ZSB0b3VjaGVzIGFub3RoZXIgYW5kIHJldHVybnMgYXQgd2hhdCBzaWRlIGl0IHRvdWNoZXMuXHJcbiAgKlxyXG4gICogTm90ZXM6XHJcbiAgKiAxLiB0aGlzIGNvbXBhcmVzIGEgbmFpdmUgcmVjdGFuZ2xlLCBzbyBpZiB0aGUgc3ByaXRlIGlzIHJvdGF0ZWQgdG91Y2hpbmcgbWlnaHQgYmUgc2Vuc2VkIGVhcmx5IG9yIGxhdGUuXHJcbiAgKiAyLiBpZiB0aGUgc3ByaXRlIGhhcyBnb25lIFwiaW50b1wiIHRoZSBvdGhlciB0aGUgc2lkZSBcInBlbmV0cmF0ZWQgbW9yZVwiIHdpbGwgYmUgcmV0dXJuZWQuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICogbGV0IG90aGVyU3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogb3RoZXJTcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogb3RoZXJTcHJpdGUubW92ZSgyMDApO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICB3aGlsZSghdGhpcy50b3VjaGluZyhvdGhlclNwcml0ZSkpIHtcclxuICAqICAgIHRoaXMubW92ZSgxMCk7XHJcbiAgKiAgICB0aGlzLnNheSh0aGlzLnRvdWNoaW5nKG90aGVyU3ByaXRlKSlcclxuICAqICAgfVxyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHNwcml0ZSAtIHRoZSBzcHJpdGUgdG8gY2hlY2sgaWYgdG91Y2hpbmcuXHJcbiAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gdGhlIHNpZGUgb2YgdGhlIHNwcml0ZSB0aGF0IGlzIHRvdWNoZWQgKG51bGwsIHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodClcclxuICAqL1xyXG4gIHRvdWNoaW5nIChzcHJpdGUpIHtcclxuICAgIC8vIGNvbnN0IHN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpXHJcbiAgICBjb25zdCBjb2xsaWRlZCA9IHRoaXMuY29sbGlzaW9uRGV0ZWN0b3IuZG9TcHJpdGVzT3ZlcmxhcChcclxuICAgICAge1xyXG4gICAgICAgIGltYWdlOiB0aGlzLmNvc3R1bWUuaW1hZ2UsXHJcbiAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICB3OiB0aGlzLndpZHRoLFxyXG4gICAgICAgIGg6IHRoaXMuaGVpZ2h0XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBpbWFnZTogc3ByaXRlLmNvc3R1bWUuaW1hZ2UsXHJcbiAgICAgICAgeDogc3ByaXRlLngsXHJcbiAgICAgICAgeTogc3ByaXRlLnksXHJcbiAgICAgICAgdzogc3ByaXRlLndpZHRoLFxyXG4gICAgICAgIGg6IHNwcml0ZS5oZWlnaHRcclxuICAgICAgfVxyXG4gICAgKVxyXG4gICAgLy8gY29uc29sZS5sb2coYFByb2Nlc3MgVGltZTogJHtwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZX1gKVxyXG5cclxuICAgIHJldHVybiBjb2xsaWRlZFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBpc1RvdWNoaW5nIC0gQ2hlY2tzIGlzIHRoaXMgc3ByaXRlIHRvdWNoZXMgYW5vdGhlci5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKiBsZXQgb3RoZXJTcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBvdGhlclNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBvdGhlclNwcml0ZS5tb3ZlKDIwMCk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogIHdoaWxlKCF0aGlzLmlzVG91Y2hpbmcob3RoZXJTcHJpdGUpKSB7XHJcbiAgKiAgICB0aGlzLm1vdmUoMTApO1xyXG4gICogICB9XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gc3ByaXRlIC0gdGhlIHNwcml0ZSB0byBjaGVjayBpZiB0b3VjaGluZy5cclxuICAqIEByZXR1cm4ge2Jvb2xlYW59IC0gaXMgdGhlIHNwcml0ZSB0b3VjaGluZyB0aGUgc3BlY2lmaWVkIHNwcml0ZS5cclxuICAqL1xyXG4gIGlzVG91Y2hpbmcgKHNwcml0ZSkge1xyXG4gICAgcmV0dXJuICEhdGhpcy50b3VjaGluZyhzcHJpdGUpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHRvdWNoaW5nQmFja2Ryb3BDb2xvciAtIFJldHVybnMgdGhlIGhleCB2YWx1ZSB0byBhbGwgcGl4ZWxzIGluIGJhY2tkcm9wIGFyZWEgY292ZXJlZCBieSB0aGUgc3ByaXRlIHJlY3RhbmdsZS5cclxuICAqXHJcbiAgKiBOb3RlczpcclxuICAqIDEuIFRoaXMgaXMgYmFzZWQgb24gcmVjdGFuZ3VsYXIgY29sbGlzaW9uIGRldGVjdGlvbi5cclxuICAqIDIuIFRoaXMgY29tcGFyZXMgYSBuYWl2ZSByZWN0YW5nbGUsIHNvIGlmIHRoZSBzcHJpdGUgaXMgcm90YXRlZCB0b3VjaGluZyBtaWdodCBiZSBzZW5zZWQgZWFybHkgb3IgbGF0ZS5cclxuICAqIDMuIFRoZSBiYWNrZHJvcCBpbWFnZSBtdXN0IGJlIGEgbG9jYWwgaW1hZ2Ugc2VydmVkIGZyb20gc2FtZSBvcmlnaW4uXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB3aGlsZSh0cnVlKXtcclxuICAqICAgICBsZXQgdG91Y2hlZENvbG9ycyA9IHRoaXMudG91Y2hpbmdCYWNrZHJvcENvbG9yKCk7XHJcbiAgKiAgICAgdGhpcy5zYXkodG91Y2hlZENvbG9ycyk7XHJcbiAgKiAgICAgdGhpcy5tb3ZlKDUpO1xyXG4gICogICB9XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcmV0dXJuIHthcnJheX0gLSBjb2xvcnMgKHN0cmluZ3MpIHRvdWNoZWQuXHJcbiAgKi9cclxuICB0b3VjaGluZ0JhY2tkcm9wQ29sb3IgKCkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gW11cclxuXHJcbiAgICAvKipcclxuICAgICogcmdiVG9IZXggLSBjb252ZXJ0cyBhIGNvbG9yIGRlZmluZWQgYnkgUkdCIHZhbHVlcyBpbnRvIGEgb24gZGVmaW5lZCBhcyBhIGhleCBzdHJpbmcuXHJcbiAgICAqXHJcbiAgICAqIEZyb206IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzgvcmdiLXRvLWhleC1hbmQtaGV4LXRvLXJnYlxyXG4gICAgKlxyXG4gICAgKiBAcGFyYW0ge251bWJlcn0gciAtIHRoZSByZWQgdmFsdWUgKDAgdG8gMjU1KS5cclxuICAgICogQHBhcmFtIHtudW1iZXJ9IGcgLSB0aGUgZ3JlZW4gdmFsdWUgKDAgdG8gMjU1KS5cclxuICAgICogQHBhcmFtIHtudW1iZXJ9IGIgLSAgdGhlIGJsdWUgdmFsdWUgKDAgdG8gMjU1KS5cclxuICAgICogQHJldHVybiB7c3RyaW5nfSAtIGhleCBjb2xvciBzdHJpbmcuXHJcbiAgICAqL1xyXG4gICAgZnVuY3Rpb24gcmdiVG9IZXggKHIsIGcsIGIpIHtcclxuICAgICAgcmV0dXJuIGAjJHsoKDEgPDwgMjQpICsgKHIgPDwgMTYpICsgKGcgPDwgOCkgKyBiKS50b1N0cmluZygxNikuc2xpY2UoMSl9YCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWJpdHdpc2VcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBiYWNrZHJvcENvbnRleHQgPSB0aGlzLmFnYWluc3RCYWNrZHJvcC5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBiYWNrZHJvcENvbnRleHQuZ2V0SW1hZ2VEYXRhKCgodGhpcy5zdGFnZVdpZHRoIC8gMikgLSAodGhpcy53aWR0aCAvIDIpKSArIHRoaXMueCwgKCh0aGlzLnN0YWdlSGVpZ2h0IC8gMikgLSAodGhpcy5oZWlnaHQgLyAyKSkgLSB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KS5kYXRhXHJcblxyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpICs9IDQpIHtcclxuICAgICAgICBkYXRhW2kgKyAzXSAhPT0gMCA/IHJlc3VsdC5wdXNoKHJnYlRvSGV4KGRhdGFbaV0sIGRhdGFbaSArIDFdLCBkYXRhW2kgKyAyXSkpIDogbnVsbFxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdCbG9ja0xpa2UuanMgTm90aWNlOiBpc1RvdWNoaW5nQmFja2Ryb3BDb2xvcigpIGluZ25vcmVkLiBCYWNrZHJvcCBpbWFnZSBjYW4gbm90IGJlIGxvY2F0ZWQgYXQgYSByZW1vdGUgb3JpZ2luLicpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQocmVzdWx0KSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogaXNUb3VjaGluZ0JhY2tkcm9wQ29sb3IgLSBjb21wYXJlcyBhIGdpdmVuIGhleCB2YWx1ZSB0byBhbGwgcGl4ZWxzIGluIGJhY2tkcm9wIGFyZWEgY292ZXJlZCBieSB0aGUgc3ByaXRlIHJlY3RhbmdsZS5cclxuICAqIElmIGEgbWF0Y2ggaXMgZm91bmQgdGhlIGNvbG9yIGlzIHJldHVybmVkLlxyXG4gICpcclxuICAqIE5vdGVzOlxyXG4gICogMS4gVGhpcyBpcyBiYXNlZCBvbiByZWN0YW5ndWxhciBjb2xsaXNpb24gZGV0ZWN0aW9uLlxyXG4gICogMi4gVGhpcyBjb21wYXJlcyBhIG5haXZlIHJlY3RhbmdsZSwgc28gaWYgdGhlIHNwcml0ZSBpcyByb3RhdGVkIHRvdWNoaW5nIG1pZ2h0IGJlIHNlbnNlZCBlYXJseSBvciBsYXRlLlxyXG4gICogMy4gVGhlIGJhY2tkcm9wIGltYWdlIG11c3QgYmUgYSBsb2NhbCBpbWFnZSBzZXJ2ZWQgZnJvbSBzYW1lIG9yaWdpbi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIGxldCBtb3ZpbmcgPSB0cnVlO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgd2hpbGUobW92aW5nKXtcclxuICAqICAgICB0aGlzLmlzVG91Y2hpbmdCYWNrZHJvcENvbG9yKCcjZmYwMDAwJykgPyBtb3ZpbmcgPSBmYWxzZSA6IG1vdmluZyA9IHRydWU7XHJcbiAgKiAgICAgdGhpcy5tb3ZlKDUpO1xyXG4gICogICB9XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gYmFja2Ryb3BDb2xvciAtIHRoZSBjb2xvciB0byBldmFsdWF0ZS5cclxuICAqIEByZXR1cm4ge2Jvb2xlYW59IC0gZG9lcyB0aGUgc3ByaXRlIHRvdWNoIHRoZSBjb2xvci5cclxuICAqL1xyXG4gIGlzVG91Y2hpbmdCYWNrZHJvcENvbG9yIChiYWNrZHJvcENvbG9yKSB7XHJcbiAgICBjb25zdCBoZXhBcnIgPSB0aGlzLnRvdWNoaW5nQmFja2Ryb3BDb2xvcihiYWNrZHJvcENvbG9yKVxyXG5cclxuICAgIHJldHVybiBoZXhBcnIuaW5jbHVkZXMoYmFja2Ryb3BDb2xvcilcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgY3NzIGZyb20gJy4vZWxlbWVudC1jc3MnXHJcblxyXG4vKipcclxuICogQ2xhc3MgcmVwcmVzZW50aW5nIHRoZSBVSSBFbGVtZW50IG9mIHRoZSBzdGFnZS5cclxuICogRWFjaCBTdGFnZSBoYXMgb25lLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhZ2VFbGVtZW50IHtcclxuICAvKipcclxuICAqIGNvbnN0cnVjdG9yIC0gQ3JlYXRlcyBhIFN0YWdlIEVsZW1lbnQuXHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSB0aGUgc3RhZ2UgZm9yIHdoaWNoIHRoZSBlbGVtZW50IGlzIGNyZWF0ZWQuXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3RhZ2UgLSB0aGUgc3RhZ2UgY3JlYXRlZC5cclxuICAqL1xyXG4gIGNvbnN0cnVjdG9yIChvcHRpb25zLCBzdGFnZSkge1xyXG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG5cclxuICAgIC8qKlxyXG4gICAgKiBjcmVhdGVEaXYgLSBjcmVhdGVzIGEgZGl2IGF0IHNwZWNpZmllZCB6SW5kZXguXHJcbiAgICAqXHJcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB6SW5kZXggLSBkZXNpcmVkIHBsYWNlIGluIFwic3RhY2tcIlxyXG4gICAgKiBAcmV0dXJuIHtvYmplY3R9IC0gYSBzdGFnZSB3aWRlL2hpZ2ggRE9NIGVsZW1lbnQuXHJcbiAgICAqL1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlRGl2ICh6SW5kZXgpIHtcclxuICAgICAgY29uc3Qgc2VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuXHJcbiAgICAgIHNlbC5zdHlsZS53aWR0aCA9IGAke29wdGlvbnMud2lkdGh9cHhgXHJcbiAgICAgIHNlbC5zdHlsZS5oZWlnaHQgPSBgJHtvcHRpb25zLmhlaWdodH1weGBcclxuICAgICAgc2VsLnN0eWxlLnpJbmRleCA9IHpJbmRleFxyXG4gICAgICBzZWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgIHNlbC5zdHlsZS50b3VjaEFjdGlvbiA9ICdtYW5pcHVsYXRpb24nXHJcblxyXG4gICAgICByZXR1cm4gc2VsXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAqIGNyZWF0ZUNhbnZhcyAtIGNyZWF0ZXMgYSBjYW52YXMgYXQgc3BlY2lmaWVkIHpJbmRleC5cclxuICAgICpcclxuICAgICogQHBhcmFtIHtudW1iZXJ9IHpJbmRleCAtIGRlc2lyZWQgcGxhY2UgaW4gXCJzdGFja1wiXHJcbiAgICAqIEByZXR1cm4ge29iamVjdH0gLSBhIHN0YWdlIHdpZGUvaGlnaCBET00gZWxlbWVudC5cclxuICAgICovXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVDYW52YXMgKHpJbmRleCkge1xyXG4gICAgICBjb25zdCBjZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxyXG5cclxuICAgICAgY2VsLndpZHRoID0gb3B0aW9ucy53aWR0aFxyXG4gICAgICBjZWwuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHRcclxuICAgICAgY2VsLnN0eWxlLnpJbmRleCA9IHpJbmRleFxyXG4gICAgICBjZWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgIGNlbC5zdHlsZS5sZWZ0ID0gJzBweCdcclxuICAgICAgY2VsLnN0eWxlLnRvcCA9ICcwcHgnXHJcblxyXG4gICAgICByZXR1cm4gY2VsXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAqIGNyZWF0ZUZsYWcgLSBjcmVhdGVzIGEgXCJmbGFnXCIgZGl2LlxyXG4gICAgKlxyXG4gICAgKiBAcmV0dXJuIHtvYmplY3R9IC0gYSBzdGFnZSB3aWRlL2hpZ2ggRE9NIGVsZW1lbnQgd2l0aCBmbGFnIGF0IGNlbnRlcnMuXHJcbiAgICAqL1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlRmxhZyAoKSB7XHJcbiAgICAgIGNvbnN0IGZsYWdTaXplID0gMTMwXHJcbiAgICAgIGNvbnN0IGZlbCA9IGNyZWF0ZURpdigtMSlcclxuXHJcbiAgICAgIGNvbnN0IGZlbGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG5cclxuICAgICAgLy8gQ29udmVydCB0aGUgY2VudGVyIGJhc2VkIHggY29vcmRpbmF0ZSB0byBhIGxlZnQgYmFzZWQgb25lLlxyXG4gICAgICBjb25zdCB4ID0gLShmbGFnU2l6ZSAvIDIpXHJcbiAgICAgIC8vIENvbnZlcnQgdGhlIGNlbnRlciBiYXNlZCB5IGNvb3JkaW5hdGUgdG8gYSBsZWZ0IGJhc2VkIG9uZS5cclxuICAgICAgY29uc3QgeSA9IC0oZmxhZ1NpemUgLyAyKVxyXG5cclxuICAgICAgLy8gbG9va3NcclxuICAgICAgZmVsaXRlbS5zdHlsZS53aWR0aCA9IGAke2ZsYWdTaXplfXB4YFxyXG4gICAgICBmZWxpdGVtLnN0eWxlLmhlaWdodCA9IGAke2ZsYWdTaXplfXB4YFxyXG4gICAgICBmZWxpdGVtLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICBmZWxpdGVtLmlubmVySFRNTCA9ICcmIzk4NzM7J1xyXG5cclxuICAgICAgZmVsaXRlbS5zdHlsZS5sZWZ0ID0gYCR7KG9wdGlvbnMud2lkdGggLyAyKSArIHh9cHhgXHJcbiAgICAgIGZlbGl0ZW0uc3R5bGUudG9wID0gYCR7KG9wdGlvbnMuaGVpZ2h0IC8gMikgKyB5fXB4YFxyXG4gICAgICBmZWxpdGVtLmNsYXNzTmFtZSA9ICdibG9ja2xpa2UtZmxhZydcclxuXHJcbiAgICAgIGZlbC5hcHBlbmRDaGlsZChmZWxpdGVtKVxyXG4gICAgICBmZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG5cclxuICAgICAgcmV0dXJuIGZlbFxyXG4gICAgfVxyXG5cclxuICAgIGVsLmlkID0gYCR7c3RhZ2UuaWR9YFxyXG5cclxuICAgIGVsLnN0eWxlLndpZHRoID0gYCR7b3B0aW9ucy53aWR0aH1weGBcclxuICAgIGVsLnN0eWxlLmhlaWdodCA9IGAke29wdGlvbnMuaGVpZ2h0fXB4YFxyXG5cclxuICAgIGVsLnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJ1xyXG4gICAgZWwuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnXHJcbiAgICBlbC5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nXHJcblxyXG4gICAgb3B0aW9ucy5wYXJlbnQuYXBwZW5kQ2hpbGQoZWwpXHJcblxyXG4gICAgdGhpcy5iYWNrZHJvcENvbnRhaW5lciA9IGNyZWF0ZUNhbnZhcygwKVxyXG4gICAgdGhpcy5iYWNrZHJvcENvbnRhaW5lci5pZCA9IGAke3N0YWdlLmlkfS1iYWNrZHJvcGBcclxuICAgIHRoaXMuYmFja2Ryb3BDb250YWluZXIuY2xhc3NOYW1lID0gJ2Jsb2NrbGlrZS1wYW5lbC1iYWNrZHJvcCdcclxuICAgIGVsLmFwcGVuZENoaWxkKHRoaXMuYmFja2Ryb3BDb250YWluZXIpXHJcblxyXG4gICAgdGhpcy5jYW52YXMgPSBjcmVhdGVDYW52YXMoMClcclxuICAgIHRoaXMuY2FudmFzLmlkID0gYCR7c3RhZ2UuaWR9LXN1cmZhY2VgXHJcbiAgICB0aGlzLmNhbnZhcy5jbGFzc05hbWUgPSAnYmxvY2tsaWtlLXBhbmVsLXN1cmZhY2UnXHJcbiAgICBlbC5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcylcclxuXHJcbiAgICB0aGlzLmZsYWcgPSBjcmVhdGVGbGFnKClcclxuICAgIHRoaXMuZmxhZy5pZCA9IGAke3N0YWdlLmlkfS1mbGFnYFxyXG4gICAgdGhpcy5mbGFnLmNsYXNzTmFtZSA9ICdibG9ja2xpa2UtcGFuZWwtZmxhZydcclxuICAgIGVsLmFwcGVuZENoaWxkKHRoaXMuZmxhZylcclxuXHJcbiAgICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcblxyXG4gICAgdGhpcy5lbCA9IGVsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHVwZGF0ZSAtIHVwZGF0ZXMgdGhlIERPTSBlbGVtZW50LlxyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzdGFnZSAtIHRoZSBzdGFnZSB0byB1cGRhdGUuXHJcbiAgKi9cclxuICB1cGRhdGUgKHN0YWdlKSB7XHJcbiAgICBjb25zdCBlbCA9IHN0YWdlLmVsZW1lbnQuZWxcclxuICAgIGNvbnN0IGJhY2tkcm9wQ29udGV4dCA9IHN0YWdlLmVsZW1lbnQuYmFja2Ryb3BDb250YWluZXIuZ2V0Q29udGV4dCgnMmQnKVxyXG5cclxuICAgIGxldCBtYXJnaW5UQiA9IDBcclxuICAgIGlmIChzdGFnZS5lbGVtZW50LmVsLnBhcmVudEVsZW1lbnQudGFnTmFtZSA9PT0gJ0JPRFknKSB7XHJcbiAgICAgIG1hcmdpblRCID0gTWF0aC5mbG9vcigod2luZG93LmlubmVySGVpZ2h0IC0gc3RhZ2UuaGVpZ2h0KSAvIDIpXHJcbiAgICAgIG1hcmdpblRCIDwgMCA/IG1hcmdpblRCID0gMCA6IG51bGxcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBjb2xvciAtIGZpbGwgdGhlIGNhbnZhcyB3aXRoIHRoZSBjb2xvciBzZXQsIG9yIGNsZWFyIGl0XHJcbiAgICBpZiAoc3RhZ2UuYmFja2Ryb3AgJiYgc3RhZ2UuYmFja2Ryb3AuY29sb3IpIHtcclxuICAgICAgYmFja2Ryb3BDb250ZXh0LnJlY3QoMCwgMCwgc3RhZ2Uud2lkdGgsIHN0YWdlLmhlaWdodClcclxuICAgICAgYmFja2Ryb3BDb250ZXh0LmZpbGxTdHlsZSA9IHN0YWdlLmJhY2tkcm9wLmNvbG9yXHJcbiAgICAgIGJhY2tkcm9wQ29udGV4dC5maWxsKClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGJhY2tkcm9wQ29udGV4dC5jbGVhclJlY3QoMCwgMCwgc3RhZ2Uud2lkdGgsIHN0YWdlLmhlaWdodClcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBpbWFnZSAtIGRyYXcgdGhlIGltYWdlIG9uIGNhbnZhc1xyXG4gICAgaWYgKHN0YWdlLmJhY2tkcm9wICYmIHN0YWdlLmJhY2tkcm9wLmltYWdlKSB7XHJcbiAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpXHJcbiAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgYmFja2Ryb3BDb250ZXh0LmRyYXdJbWFnZShpbWcsIDAsIDAsIHN0YWdlLndpZHRoLCBzdGFnZS5oZWlnaHQpXHJcbiAgICAgIH1cclxuICAgICAgaW1nLnNyYyA9IHN0YWdlLmJhY2tkcm9wLmltYWdlXHJcbiAgICB9XHJcblxyXG4gICAgLy8gem9vbSBhbmQgcGxhY2VtZW50XHJcbiAgICBlbC5zdHlsZS50cmFuc2Zvcm0gPSBgc2NhbGUoJHtzdGFnZS5tYWduaWZpY2F0aW9uIC8gMTAwfSlgXHJcbiAgICBlbC5zdHlsZS5tYXJnaW4gPSBgJHttYXJnaW5UQn1weCBhdXRvYFxyXG5cclxuICAgIC8vIGNzcyBydWxlc1xyXG4gICAgY3NzLmFwcGx5KHN0YWdlKVxyXG5cclxuICAgIC8vIGNzcyBjbGFzc2VzXHJcbiAgICBzdGFnZS5iYWNrZHJvcCA/IGVsLmNsYXNzTmFtZSA9IHN0YWdlLmJhY2tkcm9wLmNsYXNzZXMuY29uY2F0KHN0YWdlLmNsYXNzZXMpLmpvaW4oJyAnKSA6IGVsLmNsYXNzTmFtZSA9IHN0YWdlLmNsYXNzZXMuam9pbignICcpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGRlbGV0ZSAtIGRlbGV0ZXMgdGhlIERPTSBlbGVtZW50XHJcbiAgKi9cclxuICBkZWxldGUgKHN0YWdlKSB7XHJcbiAgICBjb25zdCBlbCA9IHN0YWdlLmVsZW1lbnQuZWxcclxuXHJcbiAgICBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKVxyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogYWRkRmxhZyAtIHB1dHMgdGhlIGZsYWcgZGl2IGluZnJvbnQgb2YgZXZlcnl0aGluZyAoc2hvd3MgaXQpXHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHN0YWdlIC0gdGhlIHN0YWdlIHRoYXQgXCJyZXF1ZXN0ZWRcIiB0aGUgZmxhZy5cclxuICAqL1xyXG4gIGFkZEZsYWcgKHN0YWdlKSB7XHJcbiAgICBjb25zdCBlbCA9IHN0YWdlLmVsZW1lbnQuZmxhZ1xyXG5cclxuICAgIGVsLnN0eWxlLnpJbmRleCA9IDEwMDBcclxuICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlbW92ZUZsYWcgLSBwdXRzIHRoZSBmbGFnIGRpdiBhdCB0aGUgYmFjayAoaGlkZXMgaXQpXHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHN0YWdlIC0gdGhlIHN0YWdlIHRoYXQgXCJyZXF1ZXN0ZWRcIiB0aGUgZmxhZy5cclxuICAqL1xyXG4gIHJlbW92ZUZsYWcgKHN0YWdlKSB7XHJcbiAgICBjb25zdCBlbCA9IHN0YWdlLmVsZW1lbnQuZmxhZ1xyXG5cclxuICAgIGVsLnN0eWxlLnpJbmRleCA9IC0xXHJcbiAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4qIEVuY2Fwc3VsYXRlcyB0aGUgc3RhZ2Ugc2Vuc2luZyBmdW5jdGlvbmFsaXR5LlxyXG4qL1xyXG5cclxuLyoqXHJcbiogZW5hYmxlIC0gRW5hYmxlcyBzZW5zaW5nIG9mIGRvY3VtZW50IGxldmVsIGV2ZW50cyAoa2V5ZG93biwgbW91c2Vtb3ZlLCBtb3VzZWRvd24sIHRvdWNobW92ZSlcclxuKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZW5hYmxlIChzdGFnZSkge1xyXG4gIGNvbnN0IG1lID0gc3RhZ2VcclxuICBtZS5zZW5zaW5nID0gdHJ1ZVxyXG5cclxuICAvKipcclxuICAqIGRlY2ltYWxSb3VuZCAtIHJvdW5kcyBhIG51bWJlciB0b28gZGVjaW1hbCBwb2ludHMuXHJcbiAgKlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gdGhlIHZhbHVlIHRvIHJvdW5kLlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IHBvaW50cyAtIGhvdyBtYW55IGRlY2ltYWwgcG9pbnRzIHRvIGxlYXZlLlxyXG4gICovXHJcbiAgZnVuY3Rpb24gZGVjaW1hbFJvdW5kICh2YWx1ZSwgcG9pbnRzKSB7XHJcbiAgICByZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSAqICgxMCAqKiBwb2ludHMpKSAvICgxMCAqKiBwb2ludHMpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGNvbXB1dGVYIC0gQ29tcHV0ZXMgY2VudGVyZWQgeCBiYXNlZCBvbiB4IGV4dHJhY3RlZCBmcm9tIGV2ZW50LlxyXG4gICovXHJcbiAgZnVuY3Rpb24gY29tcHV0ZVggKHgpIHtcclxuICAgIGNvbnN0IG1hZyA9IG1lLm1hZ25pZmljYXRpb24gLyAxMDBcclxuICAgIHJldHVybiBkZWNpbWFsUm91bmQoKHggLSAobWUuZWxlbWVudC5lbC5vZmZzZXRMZWZ0KSAtIChtZS53aWR0aCAvIDIpKSAvIG1hZywgMilcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogY29tcHV0ZVkgLSBDb21wdXRlcyBjZW50ZXJlZCB5IGJhc2VkIG9uIHkgZXh0cmFjdGVkIGZyb20gZXZlbnQuXHJcbiAgKi9cclxuICBmdW5jdGlvbiBjb21wdXRlWSAoeSkge1xyXG4gICAgY29uc3QgbWFnID0gbWUubWFnbmlmaWNhdGlvbiAvIDEwMFxyXG4gICAgcmV0dXJuIGRlY2ltYWxSb3VuZCgoLXkgKyBtZS5lbGVtZW50LmVsLm9mZnNldFRvcCArIChtZS5oZWlnaHQgLyAyKSkgLyBtYWcsIDIpXHJcbiAgfVxyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgIGUua2V5ICYmIG1lLmtleXNLZXkuaW5kZXhPZihlLmtleS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEgPyBtZS5rZXlzS2V5LnB1c2goZS5rZXkudG9Mb3dlckNhc2UoKSkgOiBudWxsXHJcbiAgICBlLmNvZGUgJiYgbWUua2V5c0NvZGUuaW5kZXhPZihlLmNvZGUudG9Mb3dlckNhc2UoKSkgPT09IC0xID8gbWUua2V5c0NvZGUucHVzaChlLmNvZGUudG9Mb3dlckNhc2UoKSkgOiBudWxsXHJcbiAgICBtZS5rZXlzS2V5Q29kZS5pbmRleE9mKGUua2V5Q29kZSkgPT09IC0xID8gbWUua2V5c0tleUNvZGUucHVzaChlLmtleUNvZGUpIDogbnVsbFxyXG4gIH0pXHJcblxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcclxuICAgIGUua2V5ID8gbWUua2V5c0tleSA9IG1lLmtleXNLZXkuZmlsdGVyKChpdGVtKSA9PiBpdGVtICE9PSBlLmtleS50b0xvd2VyQ2FzZSgpKSA6IG51bGxcclxuICAgIGUuY29kZSA/IG1lLmtleXNDb2RlID0gbWUua2V5c0NvZGUuZmlsdGVyKChpdGVtKSA9PiBpdGVtICE9PSBlLmNvZGUudG9Mb3dlckNhc2UoKSkgOiBudWxsXHJcbiAgICBtZS5rZXlzS2V5Q29kZSA9IG1lLmtleXNLZXlDb2RlLmZpbHRlcigoaXRlbSkgPT4gaXRlbSAhPT0gZS5rZXlDb2RlKVxyXG4gIH0pXHJcblxyXG4gIG1lLmVsZW1lbnQuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHtcclxuICAgIG1lLm1vdXNlWCA9IGNvbXB1dGVYKGUuY2xpZW50WClcclxuICAgIG1lLm1vdXNlWSA9IGNvbXB1dGVZKGUuY2xpZW50WSlcclxuICB9KVxyXG5cclxuICBtZS5lbGVtZW50LmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIChlKSA9PiB7XHJcbiAgICBtZS5tb3VzZVggPSBjb21wdXRlWChlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgpXHJcbiAgICBtZS5tb3VzZVkgPSBjb21wdXRlWShlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkpXHJcbiAgfSwgeyBwYXNzaXZlOiB0cnVlIH0pXHJcblxyXG4gIG1lLmVsZW1lbnQuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKCkgPT4ge1xyXG4gICAgbWUubW91c2VEb3duID0gdHJ1ZVxyXG4gIH0pXHJcbiAgbWUuZWxlbWVudC5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKCkgPT4ge1xyXG4gICAgbWUubW91c2VEb3duID0gZmFsc2VcclxuICB9KVxyXG5cclxuICBtZS5lbGVtZW50LmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCAoZSkgPT4ge1xyXG4gICAgbWUubW91c2VYID0gY29tcHV0ZVgoZS50b3VjaGVzWzBdLmNsaWVudFgpXHJcbiAgICBtZS5tb3VzZVkgPSBjb21wdXRlWShlLnRvdWNoZXNbMF0uY2xpZW50WSlcclxuICAgIG1lLm1vdXNlRG93biA9IHRydWVcclxuICB9LCB7IHBhc3NpdmU6IHRydWUgfSlcclxuXHJcbiAgbWUuZWxlbWVudC5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsICgpID0+IHtcclxuICAgIG1lLm1vdXNlRG93biA9IGZhbHNlXHJcbiAgICBtZS5tb3VzZVggPSBudWxsXHJcbiAgICBtZS5tb3VzZVkgPSBudWxsXHJcbiAgfSlcclxufVxyXG4iLCIvKipcclxuICogQ2xhc3MgcmVwcmVzZW50aW5nIHRoZSBzdGFnZSBzdXJmYWNlIG9uIHdoaWNoIHNwcml0ZXMgZHJhdy5cclxuICogRWFjaCBTdGFnZSBoYXMgb25lLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhZ2VTdXJmYWNlIHtcclxuICAvKipcclxuICAqIGNvbnN0cnVjdG9yIC0gQ3JlYXRlcyBhIFN0YWdlLlxyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzdGFnZSAtIHRoZSBzdGFnZSBvbiB3aGljaCB0aGUgc3ByaXRlIGlzIGRyYXdpbmcuXHJcbiAgKi9cclxuICBjb25zdHJ1Y3RvciAoc3RhZ2UpIHtcclxuICAgIHRoaXMuY29udGV4dCA9IHN0YWdlLmVsZW1lbnQuY29udGV4dFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBkcmF3IC0gZHJhd3MgYSBsaW5lIFwiYmVoaW5kXCIgYSBtb3Zpbmcgc3ByaXRlLlxyXG4gICogTm90ZTogc3ByaXRlIGFsd2F5cyBoYXMgY3VycmVudCBhbmQgcHJldmlvdXMgeCx5IHZhbHVlcyB0byBhbGxvdyBkcmF3aW5nIHRvIHByZXZpb3VzIGxvY2F0aW9uLlxyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzcHJpdGUgLSB0aGUgc3ByaXRlIGRyYXdpbmcgdGhlIGxpbmUuXHJcbiAgKi9cclxuICBkcmF3IChzcHJpdGUpIHtcclxuICAgIGlmIChzcHJpdGUuZHJhd2luZykge1xyXG4gICAgICB0aGlzLmNvbnRleHQuYmVnaW5QYXRoKClcclxuICAgICAgdGhpcy5jb250ZXh0Lm1vdmVUbygoc3ByaXRlLnN0YWdlV2lkdGggLyAyKSArIHNwcml0ZS54LCAoc3ByaXRlLnN0YWdlSGVpZ2h0IC8gMikgKyAoc3ByaXRlLnkgKiAtMSkpXHJcbiAgICAgIHRoaXMuY29udGV4dC5saW5lVG8oKHNwcml0ZS5zdGFnZVdpZHRoIC8gMikgKyBzcHJpdGUucHJldlgsIChzcHJpdGUuc3RhZ2VIZWlnaHQgLyAyKSArIChzcHJpdGUucHJldlkgKiAtMSkpXHJcbiAgICAgIHRoaXMuY29udGV4dC5saW5lV2lkdGggPSBzcHJpdGUucGVuU2l6ZVxyXG4gICAgICB0aGlzLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBzcHJpdGUucGVuQ29sb3JcclxuICAgICAgdGhpcy5jb250ZXh0LnN0cm9rZSgpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGNsZWFyIC0gY2xlYXJzIHRoZSBjYW52YXNcclxuICAqL1xyXG4gIGNsZWFyIChzcHJpdGUpIHtcclxuICAgIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgc3ByaXRlLnN0YWdlV2lkdGgsIHNwcml0ZS5zdGFnZUhlaWdodClcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEVudGl0eSBmcm9tICcuL2VudGl0eSdcclxuXHJcbmltcG9ydCBTdGFnZUVsZW1lbnQgZnJvbSAnLi9zdGFnZS1lbGVtZW50J1xyXG5pbXBvcnQgU3RhZ2VTdXJmYWNlIGZyb20gJy4vc3RhZ2Utc3VyZmFjZSdcclxuaW1wb3J0IFNwcml0ZUVsZW1lbnQgZnJvbSAnLi9zcHJpdGUtZWxlbWVudCdcclxuaW1wb3J0IGNvbGxpc2lvbkRldGVjdG9yIGZyb20gJy4vY29sbGlzaW9uLWRldGVjdG9yJ1xyXG5cclxuaW1wb3J0IHNlbnNpbmcgZnJvbSAnLi9zdGFnZS1zZW5zaW5nJ1xyXG5cclxuLyoqXHJcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIFN0YWdlLlxyXG4gKiBAZXh0ZW5kcyBFbnRpdHlcclxuICpcclxuICogQGV4YW1wbGVcclxuICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKHtcclxuICogICB3aWR0aDogNjAwLFxyXG4gKiAgIGhlaWdodDogNDAwLFxyXG4gKiAgIHBhY2U6IDE2LFxyXG4gKiAgIHNlbnNpbmc6IHRydWUsXHJcbiAqICAgcGFyZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhZ2Utd3JhcCcpLFxyXG4gKiAgIGJhY2tkcm9wOiBuZXcgYmxvY2tMaWtlLkJhY2tkcm9wKHtjb2xvcjogJyNGRkI2QzEnfSlcclxuICogfSk7XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFnZSBleHRlbmRzIEVudGl0eSB7XHJcbiAgLyoqXHJcbiAgKiBjb25zdHJ1Y3RvciAtIENyZWF0ZXMgYSBTdGFnZS5cclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHRoZSBTdGFnZS5cclxuICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLndpZHRoIC0gVGhlIHN0YWdlIHdpZHRoIGluIHBpeGVscy4gRGVmYXVsdCBpcyBmdWxsIHdpbmRvdy5cclxuICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmhlaWdodCAtIFRoZSBzdGFnZSBoZWlnaHQgaW4gcGl4ZWxzLiBEZWZhdWx0IGlzIGZ1bGwgd2luZG93LlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMucGFjZSAtIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgZm9yIGVhY2ggcGFjZWQgbWV0aG9kLiAgV2lsbCBkaXNhYmxlIHBhY2luZyB3aGVuIHNldCB0byB6ZXJvLlxyXG4gICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMucGFyZW50IC0gVGhlIERPTSBlbGVtZW50IGludG8gd2hpY2ggdGhlIHN0YWdlIHdpbGwgYmUgaW5zZXJ0ZWQuIERlZmF1bHQgaXMgdGhlIGJvZHkuXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5iYWNrZHJvcCAtIEEgZGVmYXVsdCBCYWNrZHJvcC5cclxuICAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5zZW5zaW5nIC0gRW5hYmxlcyBzZW5zaW5nIG9mIG1vdXNlIGxvY2F0aW9uIGFuZCB3aGF0IGtleXMgcHJlc3NlZC5cclxuICAqIElmIHRydWUsIHdpbGwgY29uc3RhbnRseSB1cGRhdGUgc3RhZ2UgcHJvcGVydGllczogbW91c2VYLCBtb3VzZVksIGtleXNLZXlDb2RlLCBrZXlzS2V5Q29kZSBhbmQga2V5c0NvZGUgYmFzZWQgb24gdXNlciBpbnB1dC5cclxuICAqL1xyXG4gIGNvbnN0cnVjdG9yIChvcHRpb25zID0ge30pIHtcclxuICAgIGNvbnN0IGRlZmF1bHRzID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGgsXHJcbiAgICAgIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0LFxyXG4gICAgICBwYXJlbnQ6IGRvY3VtZW50LmJvZHksXHJcbiAgICAgIHBhY2U6IDMzLFxyXG4gICAgICBiYWNrZHJvcDogbnVsbFxyXG4gICAgfVxyXG4gICAgY29uc3QgYWN0dWFsID0geyAuLi5kZWZhdWx0cywgLi4ub3B0aW9ucyB9XHJcblxyXG4gICAgc3VwZXIoYWN0dWFsLnBhY2UpXHJcblxyXG4gICAgLy8gYmFja2Ryb3BzXHJcbiAgICB0aGlzLmJhY2tkcm9wcyA9IFtdXHJcblxyXG4gICAgaWYgKGFjdHVhbC5iYWNrZHJvcCkge1xyXG4gICAgICB0aGlzLmJhY2tkcm9wID0gYWN0dWFsLmJhY2tkcm9wXHJcbiAgICAgIHRoaXMuYmFja2Ryb3BzLnB1c2godGhpcy5iYWNrZHJvcClcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmVsZW1lbnQgPSBuZXcgU3RhZ2VFbGVtZW50KGFjdHVhbCwgdGhpcylcclxuICAgIHRoaXMud2lkdGggPSBhY3R1YWwud2lkdGhcclxuICAgIHRoaXMuaGVpZ2h0ID0gYWN0dWFsLmhlaWdodFxyXG5cclxuICAgIHRoaXMua2V5c0NvZGUgPSBbXVxyXG4gICAgdGhpcy5rZXlzS2V5ID0gW11cclxuICAgIHRoaXMua2V5c0tleUNvZGUgPSBbXVxyXG5cclxuICAgIHRoaXMuc3ByaXRlcyA9IFtdXHJcblxyXG4gICAgdGhpcy5tYWduaWZpY2F0aW9uID0gMTAwXHJcblxyXG4gICAgdGhpcy5jc3NSdWxlcyA9IFtdXHJcbiAgICB0aGlzLmNsYXNzZXMgPSBbXVxyXG5cclxuICAgIHRoaXMubW91c2VEb3duID0gbnVsbFxyXG4gICAgdGhpcy5tb3VzZVggPSBudWxsXHJcbiAgICB0aGlzLm1vdXNlWSA9IG51bGxcclxuXHJcbiAgICBhY3R1YWwuc2Vuc2luZyA/IHNlbnNpbmcodGhpcykgOiBudWxsXHJcblxyXG4gICAgdGhpcy5jb2xsaXNpb25EZXRlY3RvciA9IGNvbGxpc2lvbkRldGVjdG9yLmluaXQodGhpcylcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGRlbGV0ZSAtIERlbGV0ZXMgdGhlIHN0YWdlIGVsZW1lbnQuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqXHJcbiAgKiBzdGFnZS5kZWxldGUoKTtcclxuICAqL1xyXG4gIGRlbGV0ZSAoKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLmVsZW1lbnQuZGVsZXRlKHRoaXMpXHJcbiAgfVxyXG5cclxuICAvKiogU2V0dXAgQWN0aW9ucyAqICovXHJcblxyXG4gIC8qKlxyXG4gICogYWRkU3ByaXRlIC0gQWRkcyBhIHNwcml0ZSB0byB0aGUgc3RhZ2VcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3RhZ2UuYWRkU3ByaXRlKHNwcml0ZSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHNwcml0ZSAtIHRoZSBzcHJpdGUgdG8gYWRkLlxyXG4gICovXHJcbiAgYWRkU3ByaXRlIChzcHJpdGUpIHtcclxuICAgIGNvbnN0IGN1clNwcml0ZSA9IHNwcml0ZVxyXG5cclxuICAgIGN1clNwcml0ZS5lbGVtZW50ID0gbmV3IFNwcml0ZUVsZW1lbnQoc3ByaXRlLCB0aGlzKVxyXG4gICAgY3VyU3ByaXRlLnN1cmZhY2UgPSBuZXcgU3RhZ2VTdXJmYWNlKHRoaXMpXHJcblxyXG4gICAgY3VyU3ByaXRlLmVsZW1lbnQuZmxhZyA9IHRoaXMuZWxlbWVudC5mbGFnXHJcbiAgICBjdXJTcHJpdGUuYWdhaW5zdEJhY2tkcm9wID0gdGhpcy5lbGVtZW50LmJhY2tkcm9wQ29udGFpbmVyXHJcblxyXG4gICAgY3VyU3ByaXRlLnN0YWdlV2lkdGggPSB0aGlzLndpZHRoXHJcbiAgICBjdXJTcHJpdGUuc3RhZ2VIZWlnaHQgPSB0aGlzLmhlaWdodFxyXG5cclxuICAgIHRoaXMuc3ByaXRlcy5wdXNoKGN1clNwcml0ZSlcclxuICAgIGN1clNwcml0ZS56ID0gdGhpcy5zcHJpdGVzLmxlbmd0aFxyXG5cclxuICAgIHNwcml0ZS5lbGVtZW50LnVwZGF0ZShjdXJTcHJpdGUpXHJcblxyXG4gICAgdGhpcy5jb2xsaXNpb25EZXRlY3Rvci5yZWZyZXNoU3ByaXRlQml0bWFwQ2FjaGUoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiByZW1vdmVTcHJpdGUgLSBSZW1vdmVzIGEgc3ByaXRlIGZyb20gdGhlIHN0YWdlXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHN0YWdlLmFkZFNwcml0ZShzcHJpdGUpO1xyXG4gICogc3RhZ2UucmVtb3ZlU3ByaXRlKHNwcml0ZSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHNwcml0ZSAtIHRoZSBzcHJpdGUgdG8gYWRkLlxyXG4gICovXHJcbiAgcmVtb3ZlU3ByaXRlIChzcHJpdGUpIHtcclxuICAgIGNvbnN0IGN1clNwcml0ZSA9IHNwcml0ZVxyXG4gICAgdGhpcy5zcHJpdGVzID0gdGhpcy5zcHJpdGVzLmZpbHRlcigoaXRlbSkgPT4gaXRlbSAhPT0gc3ByaXRlKVxyXG4gICAgY3VyU3ByaXRlLmVsZW1lbnQgPyBjdXJTcHJpdGUuZWxlbWVudCA9IGN1clNwcml0ZS5lbGVtZW50LmRlbGV0ZShjdXJTcHJpdGUpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqIGxvb2tzICogKi9cclxuXHJcbiAgLyoqXHJcbiAgKiBhZGRCYWNrZHJvcCAtIEFkZHMgYSBiYWNrZHJvcCB0byB0aGUgc3RhZ2VcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IGJhY2tkcm9wID0gbmV3IGJsb2NrTGlrZS5CYWNrZHJvcCgpO1xyXG4gICpcclxuICAqIHN0YWdlLmFkZEJhY2tkcm9wKGJhY2tkcm9wKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gYmFja2Ryb3AgLSB0aGUgYmFja2Ryb3AgdG8gYWRkLlxyXG4gICovXHJcbiAgYWRkQmFja2Ryb3AgKGJhY2tkcm9wKSB7XHJcbiAgICB0aGlzLmJhY2tkcm9wcy5wdXNoKGJhY2tkcm9wKVxyXG4gICAgLy8gaWYgXCJiYXJlXCIgc2V0IHRoZSBhZGRlZCBhcyBhY3RpdmVcclxuICAgICF0aGlzLmJhY2tkcm9wID8gdGhpcy5iYWNrZHJvcCA9IHRoaXMuYmFja2Ryb3BzWzBdIDogbnVsbFxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc3dpdGNoQmFja2Ryb3BUbyAtIFN3aXRjaGVzIHRvIHNwZWNpZmllZCBiYWNrZHJvcC4gSWYgbm90IGZvdW5kIGZhaWxzIHNpbGVudGx5LlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgYmFja2Ryb3AgPSBuZXcgYmxvY2tMaWtlLkJhY2tkcm9wKCk7XHJcbiAgKlxyXG4gICogc3RhZ2UuYWRkQmFja2Ryb3AoYmFja2Ryb3ApO1xyXG4gICogc3RhZ2Uuc3dpdGNoQmFja2Ryb3BUbyhiYWNrZHJvcCk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IGJhY2tkcm9wIC0gdGhlIGJhY2tkcm9wIHRvIHN3aXRjaCB0b28uXHJcbiAgKi9cclxuICBzd2l0Y2hCYWNrZHJvcFRvIChiYWNrZHJvcCkge1xyXG4gICAgY29uc3QgY3VycmVudEJhY2tkcm9wSW5kZXggPSB0aGlzLmJhY2tkcm9wcy5pbmRleE9mKGJhY2tkcm9wKVxyXG4gICAgY3VycmVudEJhY2tkcm9wSW5kZXggIT09IC0xID8gdGhpcy5iYWNrZHJvcCA9IHRoaXMuYmFja2Ryb3BzW2N1cnJlbnRCYWNrZHJvcEluZGV4XSA6IG51bGxcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQgPyB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBzd2l0Y2hCYWNrZHJvcFRvTnVtIC0gU3dpdGNoZXMgdG8gc3BlY2lmaWVkIGJhY2tkcm9wIGJ5IG51bWJlciBvZiBjdXJyZW50ICgwIGlzIGZpcnN0KS4gSWYgbm90IGZvdW5kIGZhaWxzIHNpbGVudGx5LlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgYmFja2Ryb3AgPSBuZXcgYmxvY2tMaWtlLkJhY2tkcm9wKCk7XHJcbiAgKlxyXG4gICogc3RhZ2UuYWRkQmFja2Ryb3AoYmFja2Ryb3ApO1xyXG4gICogc3RhZ2Uuc3dpdGNoQmFja2Ryb3BUb051bSgxKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSB0aGUgYmFja2Ryb3AgdG8gc3dpdGNoIHRvby5cclxuICAqL1xyXG4gIHN3aXRjaEJhY2tkcm9wVG9OdW0gKGluZGV4KSB7XHJcbiAgICB0aGlzLnN3aXRjaEJhY2tkcm9wVG8odGhpcy5iYWNrZHJvcHNbaW5kZXhdKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBuZXh0QmFja2Ryb3AgLSBTd2l0Y2hlcyB0byB0aGUgbmV4dCBiYWNrZHJvcC5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IGJhY2tkcm9wID0gbmV3IGJsb2NrTGlrZS5CYWNrZHJvcCgpO1xyXG4gICpcclxuICAqIHN0YWdlLmFkZEJhY2tkcm9wKGJhY2tkcm9wKTtcclxuICAqIHN0YWdlLm5leHRCYWNrZHJvcCgpO1xyXG4gICovXHJcbiAgbmV4dEJhY2tkcm9wICgpIHtcclxuICAgIGNvbnN0IGN1cnJlbnRCYWNrZHJvcEluZGV4ID0gdGhpcy5iYWNrZHJvcHMuaW5kZXhPZih0aGlzLmJhY2tkcm9wKVxyXG4gICAgdGhpcy5iYWNrZHJvcCA9IHRoaXMuYmFja2Ryb3BzWyhjdXJyZW50QmFja2Ryb3BJbmRleCArIDEpICUgdGhpcy5iYWNrZHJvcHMubGVuZ3RoXVxyXG5cclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlbW92ZUJhY2tkcm9wIC0gUmVtb3ZlcyBhIGJhY2tkcm9wLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgYmFja2Ryb3AgPSBuZXcgYmxvY2tMaWtlLkJhY2tkcm9wKCk7XHJcbiAgKlxyXG4gICogc3RhZ2UuYWRkQmFja2Ryb3AoYmFja2Ryb3ApO1xyXG4gICogc3RhZ2UucmVtb3ZlQmFja2Ryb3AoYmFja2Ryb3ApO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBiYWNrZHJvcCAtIHRoZSBiYWNrZHJvcCB0byByZW1vdmUuXHJcbiAgKi9cclxuICByZW1vdmVCYWNrZHJvcCAoYmFja2Ryb3ApIHtcclxuICAgIGlmICh0aGlzLmJhY2tkcm9wcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRCYWNrZHJvcEluZGV4ID0gdGhpcy5iYWNrZHJvcHMuaW5kZXhPZihiYWNrZHJvcClcclxuICAgICAgdGhpcy5iYWNrZHJvcCA9PT0gYmFja2Ryb3AgPyB0aGlzLmJhY2tkcm9wID0gdGhpcy5iYWNrZHJvcHNbKGN1cnJlbnRCYWNrZHJvcEluZGV4ICsgMSkgJSB0aGlzLmJhY2tkcm9wcy5sZW5ndGhdIDogbnVsbFxyXG4gICAgICB0aGlzLmJhY2tkcm9wcyA9IHRoaXMuYmFja2Ryb3BzLmZpbHRlcigoaXRlbSkgPT4gaXRlbSAhPT0gYmFja2Ryb3ApXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmJhY2tkcm9wcyA9IFtdXHJcbiAgICAgIHRoaXMuYmFja2Ryb3AgPSBudWxsXHJcbiAgICB9XHJcbiAgICB0aGlzLmVsZW1lbnQgPyB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiByZW1vdmVCYWNrZHJvcE51bSAtIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBiYWNrZHJvcCBieSBudW1iZXIgb2YgY3VycmVudCAoMCBpcyBmaXJzdCkuXHJcbiAgKiBJZiB0aGVyZSBpcyBvbmx5IG9uZSBiYWNrZHJvcCwgd2lsbCBmYWlsIGFuZCBlbWl0IGEgY29uc29sZSBtZXNzYWdlLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgYmFja2Ryb3AgPSBuZXcgYmxvY2tMaWtlLkJhY2tkcm9wKCk7XHJcbiAgKlxyXG4gICogc3RhZ2UuYWRkQmFja2Ryb3AoYmFja2Ryb3ApO1xyXG4gICogc3RhZ2UucmVtb3ZlQmFja2Ryb3BOdW0oMSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gdGhlIGJhY2tkcm9wIHRvIHJlbW92ZS5cclxuICAqL1xyXG4gIHJlbW92ZUJhY2tkcm9wTnVtIChpbmRleCkge1xyXG4gICAgdGhpcy5yZW1vdmVCYWNrZHJvcCh0aGlzLmJhY2tkcm9wc1tpbmRleF0pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlZnJlc2ggLSBGb3JjZXMgYSBzcHJpdGUgcmVmcmVzaC5cclxuICAqIE5vdGU6IHNlcnZpY2UgbWV0aG9kIHRvIGJlIHVzZWQgaWYgY29zdHVtZSB3YXMgbWFuaXB1bGF0ZWQgZGlyZWN0bHkuXHJcbiAgKi9cclxuICByZWZyZXNoICgpIHtcclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHpvb20gLSB6b29tcyB0aGUgc3RhZ2UgdG8gdGhlIHNwZWNpZmllZCBwZXJjZW50YWdlIG51bWJlci5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICpcclxuICAqIHN0YWdlLnpvb20oMTUwKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gcGVyY2VudCAtIHRoZSBwZXJjZW50YWdlIHRvIHNldC5cclxuICAqL1xyXG4gIHpvb20gKHBlcmNlbnQpIHtcclxuICAgIHRoaXMubWFnbmlmaWNhdGlvbiA9IHBlcmNlbnRcclxuICAgIHRoaXMuZWxlbWVudC51cGRhdGUodGhpcylcclxuICB9XHJcblxyXG4gIC8qKiBTcHJpdGVzICogKi9cclxuXHJcbiAgLyoqXHJcbiAgKiBfcmVmcmVzaFNwcml0ZXMgLSBSZWZyZXNoIHRoZSBET00gZWxlbWVudCBvZiBhbGwgc3ByaXRlcyBjdXJyZW50bHkgb24gc3RhZ2UuXHJcbiAgKlxyXG4gICogQHByaXZhdGVcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIHRoZSBiYWNrZHJvcCB0byBzd2l0Y2ggdG9vLlxyXG4gICovXHJcbiAgX3JlZnJlc2hTcHJpdGVzICgpIHtcclxuICAgIGxldCBpID0gMFxyXG4gICAgdGhpcy5zcHJpdGVzLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgY29uc3Qgc3ByaXRlID0gaXRlbVxyXG4gICAgICBpICs9IDFcclxuICAgICAgc3ByaXRlLnogPSBpXHJcbiAgICAgIHNwcml0ZS5lbGVtZW50ID8gc3ByaXRlLmVsZW1lbnQudXBkYXRlKHNwcml0ZSkgOiBudWxsXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBzZW5kU3ByaXRlQmFja3dhcmRzIC0gTW92ZXMgdGhlIHNwcml0ZSBvbmUgcGxhY2UgZG93biB0aGUgXCJwaWxlXCIuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHN0YWdlLmFkZFNwcml0ZShzcHJpdGUpO1xyXG4gICogc3RhZ2Uud2hlbkZsYWcoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnNlbmRTcHJpdGVCYWNrd2FyZHMoc3ByaXRlKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzcHJpdGUgLSB0aGUgc3ByaXRlIHRvIG1vdmUuXHJcbiAgKi9cclxuICBzZW5kU3ByaXRlQmFja3dhcmRzIChzcHJpdGUpIHtcclxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zcHJpdGVzLmluZGV4T2Yoc3ByaXRlKVxyXG4gICAgaWYgKGluZGV4ID4gMCkge1xyXG4gICAgICB0aGlzLnNwcml0ZXNbaW5kZXhdID0gdGhpcy5zcHJpdGVzW2luZGV4IC0gMV0gLy8gbW92ZSBvbmUgdXBcclxuICAgICAgdGhpcy5zcHJpdGVzW2luZGV4IC0gMV0gPSBzcHJpdGUgLy8gbWUgc3ViamVjdCBkb3duXHJcbiAgICB9XHJcbiAgICB0aGlzLl9yZWZyZXNoU3ByaXRlcygpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHNlbmRTcHJpdGVGb3J3YXJkIC0gTW92ZXMgdGhlIHNwcml0ZSBvbmUgcGxhY2UgdXAgaW4gdGhlIFwicGlsZVwiLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzdGFnZS5hZGRTcHJpdGUoc3ByaXRlKTtcclxuICAqIHN0YWdlLndoZW5GbGFnKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5zZW5kU3ByaXRlRm9yd2FyZChzcHJpdGUpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHNwcml0ZSAtIHRoZSBzcHJpdGUgdG8gbW92ZS5cclxuICAqL1xyXG4gIHNlbmRTcHJpdGVGb3J3YXJkIChzcHJpdGUpIHtcclxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zcHJpdGVzLmluZGV4T2Yoc3ByaXRlKVxyXG4gICAgaWYgKGluZGV4IDwgdGhpcy5zcHJpdGVzLmxlbmd0aCAtIDEgJiYgaW5kZXggIT09IC0xKSB7XHJcbiAgICAgIHRoaXMuc3ByaXRlc1tpbmRleF0gPSB0aGlzLnNwcml0ZXNbaW5kZXggKyAxXSAvLyBtb3ZlIG9uZSBkb3duXHJcbiAgICAgIHRoaXMuc3ByaXRlc1tpbmRleCArIDFdID0gc3ByaXRlIC8vIG1lIHN1YmplY3QgdXBcclxuICAgIH1cclxuICAgIHRoaXMuX3JlZnJlc2hTcHJpdGVzKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc2VuZFNwcml0ZVRvRnJvbnQgLSBCcmluZ3MgdGhlIHNwcml0ZSB0byB0aGUgZnJvbnQgb2YgdGhlIFwicGlsZVwiXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHN0YWdlLmFkZFNwcml0ZShzcHJpdGUpO1xyXG4gICogc3RhZ2Uud2hlbkZsYWcoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnNlbmRTcHJpdGVUb0Zyb250KHNwcml0ZSk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gdGhlIHNwcml0ZSB0byBtb3ZlLlxyXG4gICovXHJcbiAgc2VuZFNwcml0ZVRvRnJvbnQgKHNwcml0ZSkge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnNwcml0ZXMuaW5kZXhPZihzcHJpdGUpXHJcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgIHRoaXMuc3ByaXRlcy5zcGxpY2UoaW5kZXgsIDEpXHJcbiAgICAgIHRoaXMuc3ByaXRlcy5wdXNoKHNwcml0ZSlcclxuICAgIH1cclxuICAgIHRoaXMuX3JlZnJlc2hTcHJpdGVzKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc2VuZFNwcml0ZVRvQmFjayAtIFNlbmRzIHRoZSBzcHJpdGUgdG8gdGhlIGJhY2sgb2YgdGhlIFwicGlsZVwiXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHN0YWdlLmFkZFNwcml0ZShzcHJpdGUpO1xyXG4gICogc3RhZ2Uud2hlbkZsYWcoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnNlbmRTcHJpdGVUb0JhY2soc3ByaXRlKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzcHJpdGUgLSB0aGUgc3ByaXRlIHRvIG1vdmUuXHJcbiAgKi9cclxuICBzZW5kU3ByaXRlVG9CYWNrIChzcHJpdGUpIHtcclxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zcHJpdGVzLmluZGV4T2Yoc3ByaXRlKVxyXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICB0aGlzLnNwcml0ZXMuc3BsaWNlKGluZGV4LCAxKVxyXG4gICAgICB0aGlzLnNwcml0ZXMudW5zaGlmdChzcHJpdGUpXHJcbiAgICB9XHJcbiAgICB0aGlzLl9yZWZyZXNoU3ByaXRlcygpXHJcbiAgfVxyXG5cclxuICAvKiBzZW5zaW5nICovXHJcblxyXG4gIC8qKlxyXG4gICogaXNLZXlQcmVzc2VkIC0gQ2hlY2tzIGlmIGEga2V5IGlzIHByZXNzZWQuIFN0YWdlIHNlbnNpbmcgbXVzdCBiZSBlbmFibGVkLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLnNheShzdGFnZS5pc0tleVByZXNzZWQoJ2EnKSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHVzZXJLZXkgLSB0aGUga2V5IHByZXNzZWQuIE1heSBiZSB0aGUgY29kZSBvciB0aGUgY2hhcmFjdGVyIGl0c2VsZiAoQSBvciA2NSlcclxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgLSBhIGZ1bmN0aW9uIHRvIHJld3JpdGUgYW5kIGV4ZWN1dGUuXHJcbiAgKi9cclxuICBpc0tleVByZXNzZWQgKHVzZXJLZXkpIHtcclxuICAgIGxldCBtYXRjaCA9IGZhbHNlXHJcbiAgICBsZXQgY2hlY2tcclxuXHJcbiAgICB0eXBlb2YgdXNlcktleSA9PT0gJ3N0cmluZycgPyBjaGVjayA9IHVzZXJLZXkudG9Mb3dlckNhc2UoKSA6IGNoZWNrID0gdXNlcktleVxyXG4gICAgLy8gTWFrZSBzdXJlIGVhY2ggcHJvcGVydHkgaXMgc3VwcG9ydGVkIGJ5IGJyb3dzZXJzLlxyXG4gICAgLy8gTm90ZTogdXNlciBtYXkgd3JpdGUgaW5jb21wYXRpYmxlIGNvZGUuXHJcbiAgICB0aGlzLmtleXNLZXkuaW5kZXhPZihjaGVjaykgIT09IC0xID8gbWF0Y2ggPSB0cnVlIDogbnVsbFxyXG4gICAgdGhpcy5rZXlzQ29kZS5pbmRleE9mKGNoZWNrKSAhPT0gLTEgPyBtYXRjaCA9IHRydWUgOiBudWxsXHJcbiAgICB0aGlzLmtleXNLZXlDb2RlLmluZGV4T2YoY2hlY2spICE9PSAtMSA/IG1hdGNoID0gdHJ1ZSA6IG51bGxcclxuXHJcbiAgICAhdGhpcy5zZW5zaW5nID8gY29uc29sZS5sb2coJ0Jsb2NrTGlrZS5qcyBOb3RpY2U6IGlzS2V5UHJlc3NlZCgpIGluZ25vcmVkLiBTdGFnZSBzZW5zaW5nIG5vdCBlbmFibGVkLicpIDogbnVsbCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcclxuXHJcbiAgICByZXR1cm4gbWF0Y2hcclxuICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqIENsYXNzIHJlcHJlc2VudGluZyB0aGUgVUkgRWxlbWVudHMgYXR0YWNoZWQgdG8gYSBzcHJpdGUuXHJcbiAqIEVhY2ggU3ByaXRlIG1heSBoYXZlIG9uZS5cclxuICogQHByaXZhdGVcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHRVaUVsZW1lbnQge1xyXG4gIC8qKlxyXG4gICogY29uc3RydWN0b3IgLSBDcmVhdGVzIGEgdWkgZWxlbWVudCB0aGF0IFwiYXR0YWhjZXNcIiB0byBhIHNwcml0ZS5cclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gdGhlIHNwcml0ZSB0byB3aGljaCB0aGUgdWkgaXMgYXR0YWNoZWQuXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIHdoYXQgdWkgdG8gY3JlYXRlIChzYXkgYnViYmxlLCB0aGluayBidWJibGUgb3IgYXNrIGJveClcclxuICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gIHdoYXQgdGhlIHRleHQgc2FpZC90aG91Z2h0L2FzayB3aWxsIGJlLlxyXG4gICogQHBhcmFtIHtvYmplY3R9IGFza0lkIC0gdGhlIGFzayBib3ggaWRlbnRpZmllciAodXNlZCB0byBtYW5hZ2UgZXZlbnRzKS5cclxuICAqL1xyXG4gIGNvbnN0cnVjdG9yIChzcHJpdGUsIHR5cGUsIHRleHQpIHtcclxuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgIC8qKlxyXG4gICAgKiBhc2tJbnB1dCAtIGVuY2Fwc3VsYXRlIHRoZSBmdW5jdGlvbmFsaXR5IG9mIHRoZSBpbnB1dCBmaWVsZCB1c2VkIHRvIGNhcHR1cmUgdXNlciBpbnB1dCB3aXRoIGFzaygpLlxyXG4gICAgKlxyXG4gICAgKiBAcmV0dXJuIHtvYmplY3R9IC0gdGhlIGlucHV0IGRvbSBlbGVtZW50LlxyXG4gICAgKi9cclxuICAgIGZ1bmN0aW9uIGFza0lucHV0ICgpIHtcclxuICAgICAgLyoqXHJcbiAgICAgICogc2VuZEFuc3dlciAtIGRpc3BhdGNoZXMgYW4gZXZlbnQgd2hlbiB0aGUgdXNlciBoYXMgc3VibWl0dGVkIHRoZSBpbnB1dC5cclxuICAgICAgKi9cclxuICAgICAgZnVuY3Rpb24gc2VuZEFuc3dlciAodmFsdWUpIHtcclxuICAgICAgICBjb25zdCBldmVudCA9IG5ldyB3aW5kb3cuQ3VzdG9tRXZlbnQoYGJsb2NrTGlrZS5hc2suJHtzcHJpdGUuaWR9LiR7c3ByaXRlLmFza0lkfWAsIHsgZGV0YWlsOiB7IHZhbHVlLCBhc2tJZDogc3ByaXRlLmFza0lkIH0gfSlcclxuICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JylcclxuICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgIHNlbmRBbnN3ZXIoaW5wdXQudmFsdWUpXHJcbiAgICAgICAgICBpbnB1dC52YWx1ZSA9ICcnXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICBlbC5hcHBlbmRDaGlsZChpbnB1dClcclxuXHJcbiAgICAgIGNvbnN0IHN1Ym1pdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXHJcbiAgICAgIHN1Ym1pdC5pbm5lckhUTUwgPSAnJiN4MjcxMydcclxuICAgICAgc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHNlbmRBbnN3ZXIoaW5wdXQudmFsdWUpXHJcbiAgICAgICAgaW5wdXQudmFsdWUgPSAnJ1xyXG4gICAgICB9KVxyXG4gICAgICBlbC5hcHBlbmRDaGlsZChzdWJtaXQpXHJcblxyXG4gICAgICByZXR1cm4gaW5wdXRcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnRleHQgPSB0ZXh0LnRvU3RyaW5nKClcclxuICAgIHRoaXMudHlwZSA9IHR5cGVcclxuXHJcbiAgICAvLyBDb252ZXJ0IHRoZSBjZW50ZXIgYmFzZWQgeCBjb29yZGluYXRlIHRvIGEgbGVmdCBiYXNlZCBvbmUuXHJcbiAgICBjb25zdCB4ID0gc3ByaXRlLnggLSAoc3ByaXRlLndpZHRoIC8gMilcclxuICAgIC8vIENvbnZlcnQgdGhlIGNlbnRlciBiYXNlZCB5IGNvb3JkaW5hdGUgdG8gYSBsZWZ0IGJhc2VkIG9uZS5cclxuICAgIGNvbnN0IHkgPSAoc3ByaXRlLnkgKiAtMSkgLSAoc3ByaXRlLmhlaWdodCAvIDIpXHJcblxyXG4gICAgZWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICBlbC5pbm5lckhUTUwgPSBgJHt0ZXh0fTxiciAvPmBcclxuXHJcbiAgICAvLyBsb29rc1xyXG4gICAgLy8gVE9ETzogbWFrZSB0aGlzIG5pY2VyLi4uXHJcbiAgICBlbC5zdHlsZS5sZWZ0ID0gYCR7KHNwcml0ZS5zdGFnZVdpZHRoIC8gMikgKyB4ICsgKHNwcml0ZS53aWR0aCAqIDAuNil9cHhgXHJcbiAgICBlbC5zdHlsZS50b3AgPSBgJHsoKHNwcml0ZS5zdGFnZUhlaWdodCAvIDIpICsgeSkgLSA4MCAtIChNYXRoLmZsb29yKHRoaXMudGV4dC5sZW5ndGggLyAzMCkgKiAxNil9cHhgXHJcblxyXG4gICAgZWwuc3R5bGUuekluZGV4ID0gc3ByaXRlLnpcclxuICAgIGVsLmNsYXNzTmFtZSA9IGBibG9ja2xpa2UtJHt0eXBlfWBcclxuXHJcbiAgICBsZXQgaWVsID0gbnVsbFxyXG4gICAgaWYgKHR5cGUgPT09ICdhc2snKSB7XHJcbiAgICAgIGllbCA9IGFza0lucHV0KHNwcml0ZSwgZWwpXHJcbiAgICAgIGVsLnN0eWxlLnRvcCA9IGAkeygoc3ByaXRlLnN0YWdlSGVpZ2h0IC8gMikgKyB5KSAtIDExMCAtIChNYXRoLmZsb29yKHRoaXMudGV4dC5sZW5ndGggLyAzMCkgKiAxNil9cHhgXHJcbiAgICB9XHJcblxyXG4gICAgc3ByaXRlLmVsZW1lbnQuZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWwsIHNwcml0ZS5lbGVtZW50LmVsKVxyXG4gICAgaWVsID8gaWVsLmZvY3VzKCkgOiBudWxsXHJcblxyXG4gICAgZWwuc3R5bGUudmlzaWJpbGl0eSA9IGAkeyhzcHJpdGUuc2hvd2luZyA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nKX1gXHJcblxyXG4gICAgdGhpcy5lbCA9IGVsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHVwZGF0ZSAtIHVwZGF0ZWQgdGhlIERPTSBlbGVtZW50IChtb3ZlcyB3aXRoIHNwcml0ZSkuXHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHNwcml0ZSAtIHRoZSBzcHJpdGUgdG8gd2hpY2ggdGhlIHVpIGlzIGF0dGFjaGVkLlxyXG4gICovXHJcbiAgdXBkYXRlIChzcHJpdGUpIHtcclxuICAgIGNvbnN0IGVsID0gc3ByaXRlLnRleHR1aS5lbFxyXG5cclxuICAgIC8vIENvbnZlcnQgdGhlIGNlbnRlciBiYXNlZCB4IGNvb3JkaW5hdGUgdG8gYSBsZWZ0IGJhc2VkIG9uZS5cclxuICAgIGNvbnN0IHggPSBzcHJpdGUueCAtIChzcHJpdGUud2lkdGggLyAyKVxyXG4gICAgLy8gQ29udmVydCB0aGUgY2VudGVyIGJhc2VkIHkgY29vcmRpbmF0ZSB0byBhIGxlZnQgYmFzZWQgb25lLlxyXG4gICAgY29uc3QgeSA9IChzcHJpdGUueSAqIC0xKSAtIChzcHJpdGUuaGVpZ2h0IC8gMilcclxuXHJcbiAgICAvLyBsb29rc1xyXG4gICAgLy8gVE9ETzogbWFrZSB0aGlzIG5pY2VyLi4uXHJcbiAgICBlbC5zdHlsZS5sZWZ0ID0gYCR7KHNwcml0ZS5zdGFnZVdpZHRoIC8gMikgKyB4ICsgKHNwcml0ZS53aWR0aCAqIDAuNil9cHhgXHJcbiAgICBlbC5zdHlsZS50b3AgPSBgJHsoKHNwcml0ZS5zdGFnZUhlaWdodCAvIDIpICsgeSkgLSA4MCAtIChNYXRoLmZsb29yKHRoaXMudGV4dC5sZW5ndGggLyAzMCkgKiAxNil9cHhgXHJcblxyXG4gICAgaWYgKHNwcml0ZS50ZXh0dWkudHlwZSA9PT0gJ2FzaycpIHtcclxuICAgICAgZWwuc3R5bGUudG9wID0gYCR7KChzcHJpdGUuc3RhZ2VIZWlnaHQgLyAyKSArIHkpIC0gMTEwIC0gKE1hdGguZmxvb3IodGhpcy50ZXh0Lmxlbmd0aCAvIDMwKSAqIDE2KX1weGBcclxuICAgIH1cclxuXHJcbiAgICBlbC5zdHlsZS52aXNpYmlsaXR5ID0gYCR7KHNwcml0ZS5zaG93aW5nID8gJ3Zpc2libGUnIDogJ2hpZGRlbicpfWBcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogZGVsZXRlIC0gZGVsZXRlcyB0aGUgRE9NIGVsZW1lbnQgKGhpZGVzIGl0KS5cclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gdGhlIHNwcml0ZSB0byB3aGljaCB0aGUgdWkgaXMgYXR0YWNoZWQuXHJcbiAgKi9cclxuICBkZWxldGUgKHNwcml0ZSkge1xyXG4gICAgY29uc3QgZWwgPSBzcHJpdGUudGV4dHVpLmVsXHJcblxyXG4gICAgZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbClcclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLyoqXHJcbiogQmxvY2tMaWtlLmpzXHJcbipcclxuKiBCbG9ja0xpa2UuanMgaXMgYW4gZWR1Y2F0aW9uYWwgSmF2YVNjcmlwdCBsaWJyYXJ5LlxyXG4qIEl0IGJyaWRnZXMgdGhlIGdhcCBiZXR3ZWVuIGJsb2NrLWJhc2VkIGFuZCB0ZXh0LWJhc2VkIHByb2dyYW1taW5nLlxyXG4qXHJcbiogQmxvY2tMaWtlLmpzIGlzIGRlc2lnbmVkIGZvbGxvd2luZyBTY3JhdGNoIGNvbmNlcHRzLCBtZXRob2RzIGFuZCBwYXR0ZXJucy5cclxuKiBUaGUgc2NyZWVuIGlzIGEgY2VudGVyZWQgc3RhZ2UuIEludGVyYWN0aW9uIGlzIHdpdGggU3ByaXRlcy5cclxuKiBDb2RlIGlzIGV4ZWN1dGVkIGluIGEgXCJwYWNlZFwiIG1hbm5lci5cclxuKiBTY3JhdGNoIGJsb2NrIGNvZGUgYW5kIEJsb2NrTGlrZS5qcyB0ZXh0IGNvZGUgYXJlIG1lYW50IHRvIGJlXHJcbiogYXMgbGl0ZXJhbGx5IHNpbWlsYXIgYXMgcG9zc2libGUuXHJcbipcclxuKiBCbG9ja0xpa2UuanMgaXMgd3JpdHRlbiBpbiBFUzYvRVM3IGZsYXZvcmVkIEphdmFTY3JpcHQuXHJcbiogSXQgaXMgZW52aXJvbm1lbnQgaW5kZXBlbmRlbnQuXHJcbiogSXQgY2FuIGJlIHVzZWQgYW55d2hlcmUgbW9kZXJuIEphdmFTY3JpcHQgcnVucy5cclxuKlxyXG4qIEBhdXRob3IgWWFyb24gKFJvbikgSWxhblxyXG4qIEBlbWFpbCBibG9ja2xpa2VAcm9uaWxhbi5jb21cclxuKlxyXG4qIENvcHlyaWdodCAyMDE4XHJcbiogRmFicmlxdcOpIGF1IENhbmFkYSA6IE1hZGUgaW4gQ2FuYWRhXHJcbiovXHJcblxyXG5pbXBvcnQgKiBhcyBzdHlsZXMgZnJvbSAnLi9kb2N1bWVudC1jc3MnXHJcbmltcG9ydCBwbGF0Zm9ybXMgZnJvbSAnLi9wbGF0Zm9ybXMnXHJcblxyXG5pbXBvcnQgU3RhZ2UgZnJvbSAnLi9zdGFnZScgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG5pbXBvcnQgQmFja2Ryb3AgZnJvbSAnLi9iYWNrZHJvcCcgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG5pbXBvcnQgU3ByaXRlIGZyb20gJy4vc3ByaXRlJyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbmltcG9ydCBDb3N0dW1lIGZyb20gJy4vY29zdHVtZScgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG5cclxuZXhwb3J0IHsgU3RhZ2UgfVxyXG5leHBvcnQgeyBCYWNrZHJvcCB9XHJcbmV4cG9ydCB7IFNwcml0ZSB9XHJcbmV4cG9ydCB7IENvc3R1bWUgfTtcclxuXHJcbihmdW5jdGlvbiBpbml0ICgpIHtcclxuICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcclxuXHJcbiAgc3R5bGUudHlwZSA9ICd0ZXh0L2NzcydcclxuICBzdHlsZS5pbm5lckhUTUwgPSBgXHJcbiAgICAke3N0eWxlcy5kZWZhdWx0Q1NTfVxcblxcbiBcclxuICAgICR7c3R5bGVzLnVpQ1NTfVxcblxcbiBcclxuICAgICR7c3R5bGVzLnRoaW5rQ1NTfVxcblxcbiBcclxuICAgICR7c3R5bGVzLnNheUNTU30gXFxuXFxuIFxyXG4gICAgJHtzdHlsZXMuYXNrQ1NTfWBcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzdHlsZSlcclxuXHJcbiAgcGxhdGZvcm1zKClcclxufSgpKVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=