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
      'whenCloned',
      'addEventListener'
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
  return funcS.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, (match, p1) => {
    // If this is a '//' comment and it has a preceding character
    if (p1 !== undefined) {
      // return the preceding character
      return p1
    }
    // If it's a '/* */' comment or a '//' comment at the start of a line, remove it
    return ''
  })
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

function insertGamepadEventListenerAsync (item) {
  return item.replace(/addEventListener\(([^,]+),\s*\(\s*([^)]*)\s*\)\s*=>\s*\{/g, function (match, event, args) {
    // Wrap the original body in an async arrow function
    return `addEventListener(${event}, async (${args}) => {`
  })
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
      if ((isEvented(temp, entity) && !temp.includes('addEventListener')) || eventedOpenParen) {
        eventedOpenParen += (countChar(replaceUserStringWithBlanks(temp), '(') - countChar(replaceUserStringWithBlanks(temp), ')'))
      } else {
        // if (isPaced(temp, entity)) hasPacedCode = true
        // a method can be one of the following but not more than one
        result === temp ? result = insertPaced(temp, entity) : null // more likely
        result === temp ? result = insertWaited(temp, entity) : null // less likely

        // and only if not a method will add async to functions
        result === temp ? result = insertAsync(temp) : null
        result === temp ? result = insertGamepadEventListenerAsync(temp) : null
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
    if (!sprite.showing || !this.showing) return false // If either sprite is not showing, the cannot collide

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkM7QUFDN0MsNkNBQTZDO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRCxVQUFVLFNBQVM7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBLElBQUksa0RBQVk7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEIsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLFFBQVE7QUFDdEIsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLFFBQVE7QUFDdEIsY0FBYyxRQUFRO0FBQ3RCLGNBQWMsUUFBUTtBQUN0QixjQUFjLFFBQVE7QUFDdEIsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsUUFBUTtBQUN4QixpQkFBaUIsUUFBUTtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsUUFBUTtBQUN0QixjQUFjLFFBQVE7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLHdEQUFhO0FBQ3RGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLHdEQUFhO0FBQ3RGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksUUFBUTtBQUNwQjtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLHdEQUFhO0FBQ3RGO0FBQ0E7QUFDQSxpREFBaUQsUUFBUSxHQUFHLFNBQVM7QUFDckU7QUFDQSxzREFBc0QsTUFBTSxHQUFHLFNBQVM7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLGNBQWM7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxRQUFRO0FBQ3BCLGFBQWEsUUFBUTtB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFVBQVU7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDeGFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZTtBQUNmO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEIsWUFBWSxRQUFRO0FBQ3BCLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLFFBQVE7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOERBQThELFVBQVUsR0FBRyxhQUFhLEtBQUssVUFBVSw4QkFBOEI7QUFDckk7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsS0FBSztBQUMzQjtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsbURBQW1EO0FBQzFFLHNCQUFzQiwrRUFBK0U7QUFDckc7QUFDQTtBQUNBLGdDQUFnQyxLQUFLO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdGQUFnRjtBQUN4RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLHdDQUF3QztBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLG1EQUFtRDtBQUMxRSxzQkFBc0IsK0VBQStFO0FBQ3JHO0FBQ0E7QUFDQSx3QkFBd0IsZ0ZBQWdGO0FBQ3hHO0FBQ0E7QUFDQSw2QkFBNkIsd0NBQXdDO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztVQ3ZIQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ3dDO0FBQ0w7QUFDbkM7QUFDMkI7QUFDTTtBQUNKO0FBQ0U7QUFDL0I7QUFDZ0I7QUFDRztBQUNGO0FBQ0U7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxxREFBaUIsQ0FBQztBQUN4QixNQUFNLGdEQUFZLENBQUM7QUFDbkIsTUFBTSxtREFBZSxDQUFDO0FBQ3RCLE1BQU0saURBQWEsRUFBRTtBQUNyQixNQUFNLGlEQUFhLENBQUM7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsRUFBRSx1REFBUztBQUNYLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvYmFja2Ryb3AuanMiLCJ3ZWJwYWNrOi8vYmxvY2tMaWtlLy4vc3JjL2NvbGxpc2lvbi1kZXRlY3Rvci5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvY29zdHVtZS5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvZG9jdW1lbnQtY3NzLmpzIiwid2VicGFjazovL2Jsb2NrTGlrZS8uL3NyYy9lbGVtZW50LWNzcy5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvZW50aXR5LmpzIiwid2VicGFjazovL2Jsb2NrTGlrZS8uL3NyYy9sb29rLmpzIiwid2VicGFjazovL2Jsb2NrTGlrZS8uL3NyYy9wbGF0Zm9ybXMuanMiLCJ3ZWJwYWNrOi8vYmxvY2tMaWtlLy4vc3JjL3Jld3JpdGVyLmpzIiwid2VicGFjazovL2Jsb2NrTGlrZS8uL3NyYy9zcHJpdGUtZWxlbWVudC5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvc3ByaXRlLmpzIiwid2VicGFjazovL2Jsb2NrTGlrZS8uL3NyYy9zdGFnZS1lbGVtZW50LmpzIiwid2VicGFjazovL2Jsb2NrTGlrZS8uL3NyYy9zdGFnZS1zZW5zaW5nLmpzIiwid2VicGFjazovL2Jsb2NrTGlrZS8uL3NyYy9zdGFnZS1zdXJmYWNlLmpzIiwid2VicGFjazovL2Jsb2NrTGlrZS8uL3NyYy9zdGFnZS5qcyIsIndlYnBhY2s6Ly9ibG9ja0xpa2UvLi9zcmMvdGV4dC11aS1lbGVtZW50LmpzIiwid2VicGFjazovL2Jsb2NrTGlrZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ibG9ja0xpa2Uvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Jsb2NrTGlrZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2Jsb2NrTGlrZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Jsb2NrTGlrZS8uL3NyYy9saWIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvb2sgZnJvbSAnLi9sb29rJ1xyXG5cclxuLyoqXHJcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIEJhY2tkcm9wLlxyXG4gKiBCYWNrZHJvcHMgY2FuIGJlIGFkZGVkIHRvIHRoZSBTdGFnZS5cclxuICogQGV4dGVuZHMgTG9va1xyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBsZXQgYmFja2Ryb3AgPSBuZXcgYmxvY2tMaWtlLkJhY2tkcm9wKCk7XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGxldCBiYWNrZHJvcCA9IG5ldyBibG9ja0xpa2UuQmFja2Ryb3Aoe1xyXG4gKiAgIGltYWdlOiAnaHR0cHM6Ly93d3cuYmxvY2tsaWtlLm9yZy9pbWFnZXMvYmFja2Ryb3Auc3ZnJ1xyXG4gKiB9KTtcclxuICpcclxuICogQGV4YW1wbGVcclxuICogbGV0IGJhY2tkcm9wID0gbmV3IGJsb2NrTGlrZS5CYWNrZHJvcCh7XHJcbiAqICAgY29sb3I6ICcjQTJEQUZGJ1xyXG4gKiB9KTtcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhY2tkcm9wIGV4dGVuZHMgTG9vayB7XHJcbiAgLyoqXHJcbiAgKiBjb25zdHJ1Y3RvciAtIENyZWF0ZXMgYSBCYWNrZHJvcCB0byBiZSB1c2VkIGJ5IFN0YWdlIG9iamVjdHMuXHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSBvcHRpb25zIGZvciB0aGUgYmFja2Ryb3AuXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5pbWFnZSAtIGEgVVJJIChvciBkYXRhIFVSSSkgZm9yIHRoZSBiYWNrZHJvcCBpbWFnZS5cclxuICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNvbG9yIC0gYSBjc3MgY29sb3Igc3RyaW5nICgnI2ZmMDAwMCcsICdyZWQnKVxyXG4gICovXHJcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMgPSB7fSkge1xyXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7fVxyXG4gICAgY29uc3QgYWN0dWFsID0geyAuLi5kZWZhdWx0cywgLi4ub3B0aW9ucyB9XHJcblxyXG4gICAgc3VwZXIoKVxyXG5cclxuICAgIHRoaXMuaW1hZ2UgPSBhY3R1YWwuaW1hZ2VcclxuICAgIHRoaXMuY29sb3IgPSBhY3R1YWwuY29sb3JcclxuXHJcbiAgICAvLyBwcmVsb2FkXHJcbiAgICBpZiAodGhpcy5pbWFnZSkge1xyXG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyB3aW5kb3cuSW1hZ2UoKVxyXG4gICAgICBpbWFnZS5zcmMgPSB0aGlzLmltYWdlXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogU2V0dXAgQWN0aW9ucyAqICovXHJcblxyXG4gIC8qKlxyXG4gICogYWRkVG8gLSBBZGRzIHRoZSBiYWNrZHJvcCB0byB0aGUgc3RhZ2VcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IGJhY2tkcm9wID0gbmV3IGJsb2NrTGlrZS5CYWNrZHJvcCgpO1xyXG4gICpcclxuICAqIGJhY2tkcm9wLmFkZFRvKHN0YWdlKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3RhZ2UgLSB3aGljaCBzdGFnZSB0byBhZGQgdGhlIGJhY2tkcm9wIHRvby5cclxuICAqL1xyXG4gIGFkZFRvIChzdGFnZSkge1xyXG4gICAgY29uc3QgY3VyU3RhZ2UgPSBzdGFnZVxyXG4gICAgc3RhZ2UuYmFja2Ryb3BzLnB1c2godGhpcylcclxuICAgIC8vIGlmIFwiYmFyZVwiIHNldCB0aGUgYWRkZWQgYXMgYWN0aXZlXHJcbiAgICAhc3RhZ2UuYmFja2Ryb3AgPyBjdXJTdGFnZS5iYWNrZHJvcCA9IHN0YWdlLmJhY2tkcm9wc1swXSA6IG51bGxcclxuICAgIHN0YWdlLmVsZW1lbnQgPyBzdGFnZS5lbGVtZW50LnVwZGF0ZShzdGFnZSkgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlbW92ZUZyb20gLSBSZW1vdmVzIHRoZSBiYWNrZHJvcCB0byB0aGUgc3RhZ2VcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IGJhY2tkcm9wID0gbmV3IGJsb2NrTGlrZS5CYWNrZHJvcCgpO1xyXG4gICpcclxuICAqIGJhY2tkcm9wLmFkZFRvKHN0YWdlKTtcclxuICAqIGJhY2tkcm9wLnJlbW92ZUZyb20oc3RhZ2UpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzdGFnZSAtIHdoaWNoIHN0YWdlIHRvIHJlbW92ZSB0aGUgYmFja2Ryb3AgZnJvbS5cclxuICAqL1xyXG4gIHJlbW92ZUZyb20gKHN0YWdlKSB7XHJcbiAgICBzdGFnZS5yZW1vdmVCYWNrZHJvcCh0aGlzKVxyXG4gIH1cclxufVxyXG4iLCJjbGFzcyBDb2xsaXNvbkRldGVjdG9yIHtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICB0aGlzLnN0YWdlID0gbnVsbFxyXG4gICAgdGhpcy5jdXJyZW50U3ByaXRlQml0bWFwcyA9IHt9XHJcblxyXG4gICAgdGhpcy5jb2xsaXNpb25DYW52YXNTaXplMSA9IHtcclxuICAgICAgdzogMCxcclxuICAgICAgaDogMFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTIgPSB7XHJcbiAgICAgIHc6IDAsXHJcbiAgICAgIGg6IDBcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNvbGxpc29uQ2FudmFzRWxlbWVudDEgPSBudWxsXHJcbiAgICB0aGlzLmNvbGxpc29uQ2FudmFzQ29udGV4dDEgPSBudWxsXHJcbiAgICB0aGlzLmNvbGxpc29uQ2FudmFzRWxlbWVudDIgPSBudWxsXHJcbiAgICB0aGlzLmNvbGxpc29uQ2FudmFzQ29udGV4dDIgPSBudWxsXHJcblxyXG4gICAgdGhpcy5lZGdlQ2FudmFzU2l6ZSA9IHtcclxuICAgICAgdzogMCxcclxuICAgICAgaDogMFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZWRnZUNhbnZhc0VsZW1lbnQgPSBudWxsXHJcbiAgICB0aGlzLmVkZ2VDYW52YXNDb250ZXh0ID0gbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtTdGFnZX0gc3RhZ2VcclxuICAgKiBAcmV0dXJuc1xyXG4gICAqL1xyXG4gIGluaXQgKHN0YWdlKSB7XHJcbiAgICB0aGlzLnN0YWdlID0gc3RhZ2VcclxuXHJcbiAgICB0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUxID0ge1xyXG4gICAgICB3OiB0aGlzLnN0YWdlLndpZHRoLFxyXG4gICAgICBoOiB0aGlzLnN0YWdlLmhlaWdodFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTIgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTEpKVxyXG5cclxuICAgIHRoaXMuZWRnZUNhbnZhc1NpemUgPSB7IC8vIDJweCBiaWdnZXIgc28gd2UgY2FuIGNoZWNrIHRoZSBlZGdlIGZvciB2aXNpYmxlIHBpeGVsc1xyXG4gICAgICB3OiB0aGlzLnN0YWdlLndpZHRoICsgMixcclxuICAgICAgaDogdGhpcy5zdGFnZS5oZWlnaHQgKyAyXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY3JlYXRlQ29sbGlzaW9uQ2FudmFzMSA9ICgpID0+IHtcclxuICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxyXG5cclxuICAgICAgZWwuaWQgPSAnY29sbGlzaW9uQ2FudmFzMSdcclxuICAgICAgZWwud2lkdGggPSB0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUxLndcclxuICAgICAgZWwuaGVpZ2h0ID0gdGhpcy5jb2xsaXNpb25DYW52YXNTaXplMS5oXHJcbiAgICAgIGVsLnN0eWxlLnpJbmRleCA9IDBcclxuICAgICAgZWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgIGVsLnN0eWxlLmxlZnQgPSAnMHB4J1xyXG4gICAgICBlbC5zdHlsZS50b3AgPSB0aGlzLnN0YWdlLmhlaWdodFxyXG5cclxuICAgICAgdGhpcy5jb2xsaXNvbkNhbnZhc0VsZW1lbnQxID0gZWxcclxuICAgICAgdGhpcy5jb2xsaXNvbkNhbnZhc0NvbnRleHQxID0gdGhpcy5jb2xsaXNvbkNhbnZhc0VsZW1lbnQxLmdldENvbnRleHQoJzJkJylcclxuXHJcbiAgICAgIHJldHVybiBlbFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNyZWF0ZUNvbGxpc2lvbkNhbnZhczIgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcclxuXHJcbiAgICAgIGVsLmlkID0gJ2NvbGxpc2lvbkNhbnZhczInXHJcbiAgICAgIGVsLndpZHRoID0gdGhpcy5jb2xsaXNpb25DYW52YXNTaXplMi53XHJcbiAgICAgIGVsLmhlaWdodCA9IHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTIuaFxyXG4gICAgICBlbC5zdHlsZS56SW5kZXggPSAwXHJcbiAgICAgIGVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICBlbC5zdHlsZS5sZWZ0ID0gJzBweCdcclxuICAgICAgZWwuc3R5bGUudG9wID0gdGhpcy5zdGFnZS5oZWlnaHRcclxuXHJcbiAgICAgIHRoaXMuY29sbGlzb25DYW52YXNFbGVtZW50MiA9IGVsXHJcbiAgICAgIHRoaXMuY29sbGlzb25DYW52YXNDb250ZXh0MiA9IHRoaXMuY29sbGlzb25DYW52YXNFbGVtZW50Mi5nZXRDb250ZXh0KCcyZCcpXHJcblxyXG4gICAgICByZXR1cm4gZWxcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjcmVhdGVFZGdlQ2FudmFzID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcblxyXG4gICAgICBlbC5pZCA9ICdlZGdlQ2FudmFzJ1xyXG4gICAgICBlbC53aWR0aCA9IHRoaXMuZWRnZUNhbnZhc1NpemUud1xyXG4gICAgICBlbC5oZWlnaHQgPSB0aGlzLmVkZ2VDYW52YXNTaXplLmhcclxuICAgICAgZWwuc3R5bGUuekluZGV4ID0gMFxyXG4gICAgICBlbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcclxuICAgICAgZWwuc3R5bGUubGVmdCA9ICcwcHgnXHJcbiAgICAgIGVsLnN0eWxlLnRvcCA9IHRoaXMuc3RhZ2UuaGVpZ2h0XHJcblxyXG4gICAgICB0aGlzLmVkZ2VDYW52YXNFbGVtZW50ID0gZWxcclxuICAgICAgdGhpcy5lZGdlQ2FudmFzQ29udGV4dCA9IHRoaXMuZWRnZUNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dCgnMmQnLCB7IHdpbGxSZWFkRnJlcXVlbnRseTogdHJ1ZSB9KVxyXG5cclxuICAgICAgcmV0dXJuIGVsXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lTlMoJyonLCAnYm9keScpWzBdXHJcbiAgICBib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbidcclxuXHJcbiAgICBib2R5LmFwcGVuZENoaWxkKGNyZWF0ZUNvbGxpc2lvbkNhbnZhczEoKSlcclxuICAgIGJvZHkuYXBwZW5kQ2hpbGQoY3JlYXRlQ29sbGlzaW9uQ2FudmFzMigpKVxyXG4gICAgYm9keS5hcHBlbmRDaGlsZChjcmVhdGVFZGdlQ2FudmFzKCkpXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIGFzeW5jIHJlZnJlc2hTcHJpdGVCaXRtYXBDYWNoZSAoKSB7XHJcbiAgICBjb25zdCBzcHJpdGVzID0gdGhpcy5zdGFnZS5zcHJpdGVzXHJcbiAgICB0aGlzLmN1cnJlbnRTcHJpdGVCaXRtYXBzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNwcml0ZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3Qgc3ByaXRlID0gc3ByaXRlc1tpXVxyXG4gICAgICBjb25zdCBpbWFnZVVybCA9IHNwcml0ZS5jb3N0dW1lLmltYWdlXHJcbiAgICAgIGlmIChpbWFnZVVybCA9PT0gJycpIGNvbnRpbnVlIC8vIG5vIGNvc3R1bWUgZm9yIHNwcml0ZVxyXG4gICAgICBjb25zdCBpbWFnZSA9IGF3YWl0IHRoaXMubG9hZEltYWdlRnJvbVVybChpbWFnZVVybClcclxuXHJcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcblxyXG4gICAgICBjYW52YXMud2lkdGggPSBzcHJpdGUud2lkdGhcclxuICAgICAgY2FudmFzLmhlaWdodCA9IHNwcml0ZS5oZWlnaHRcclxuICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcclxuXHJcbiAgICAgIGNvbnN0IHJhdGlvID0gaW1hZ2Uud2lkdGggLyBpbWFnZS5oZWlnaHRcclxuICAgICAgbGV0IGRyYXdXaWR0aCA9IGltYWdlLndpZHRoXHJcbiAgICAgIGxldCBkcmF3SGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0XHJcbiAgICAgIGlmIChpbWFnZS53aWR0aCAvIHNwcml0ZS53aWR0aCA+IGltYWdlLmhlaWdodCAvIHNwcml0ZS5oZWlnaHQpIHtcclxuICAgICAgICBkcmF3V2lkdGggPSBzcHJpdGUud2lkdGhcclxuICAgICAgICBkcmF3SGVpZ2h0ID0gc3ByaXRlLndpZHRoIC8gcmF0aW9cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkcmF3V2lkdGggPSBzcHJpdGUuaGVpZ2h0ICogcmF0aW9cclxuICAgICAgICBkcmF3SGVpZ2h0ID0gc3ByaXRlLmhlaWdodFxyXG4gICAgICB9XHJcblxyXG4gICAgICBjdHgudHJhbnNsYXRlKGNhbnZhcy53aWR0aCAvIDIsIGNhbnZhcy5oZWlnaHQgLyAyKVxyXG4gICAgICBjdHgucm90YXRlKChzcHJpdGUuZGlyZWN0aW9uIC0gOTApICogTWF0aC5QSSAvIDE4MClcclxuICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZSwgLWRyYXdXaWR0aCAvIDIsIC1kcmF3SGVpZ2h0IC8gMiwgZHJhd1dpZHRoLCBkcmF3SGVpZ2h0KVxyXG4gICAgICBjb25zdCBiaXRtYXBEYXRhID0gY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJylcclxuXHJcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZUltYWdlRnJvbUJpdG1hcChcclxuICAgICAgICBpbWFnZVVybCxcclxuICAgICAgICBiaXRtYXBEYXRhLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHc6IHNwcml0ZS53aWR0aCxcclxuICAgICAgICAgIGg6IHNwcml0ZS5oZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICAvLyBjb25zb2xlLmxvZygnR2VuZXJhdGVkIEJpdG1hcHMnLCB0aGlzLmN1cnJlbnRTcHJpdGVCaXRtYXBzKVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2F2ZUltYWdlRnJvbUJpdG1hcCAodXJsLCBiaXRtYXBEYXRhLCBzaXplRGF0YSkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICBjb25zdCBpbWFnZURhdGEgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICBpbWFnZURhdGEuc3JjID0gYml0bWFwRGF0YVxyXG4gICAgICBpbWFnZURhdGEub25sb2FkID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNwcml0ZUJpdG1hcHNbdXJsXSA9IHtcclxuICAgICAgICAgIGRhdGE6IGF3YWl0IGNyZWF0ZUltYWdlQml0bWFwKGltYWdlRGF0YSksXHJcbiAgICAgICAgICAuLi5zaXplRGF0YVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXNvbHZlKClcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGFzeW5jIGxvYWRJbWFnZUZyb21VcmwgKHVybCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpXHJcbiAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSgnY3Jvc3NPcmlnaW4nLCAnYW5vbnltb3VzJylcclxuICAgICAgaW1hZ2Uuc3JjID0gdXJsXHJcbiAgICAgIGltYWdlLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICByZXNvbHZlKGltYWdlKVxyXG4gICAgICB9XHJcbiAgICAgIGltYWdlLm9uZXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKClcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGRvU3ByaXRlc092ZXJsYXAgKHNwcml0ZURhdGExLCBzcHJpdGVEYXRhMikge1xyXG4gICAgY29uc3Qgc3ByaXRlQml0bWFwMSA9IHRoaXMuY3VycmVudFNwcml0ZUJpdG1hcHNbc3ByaXRlRGF0YTEuaW1hZ2VdXHJcbiAgICBjb25zdCBzcHJpdGVCaXRtYXAyID0gdGhpcy5jdXJyZW50U3ByaXRlQml0bWFwc1tzcHJpdGVEYXRhMi5pbWFnZV1cclxuXHJcbiAgICBpZiAoIXNwcml0ZUJpdG1hcDEgfHwgIXNwcml0ZUJpdG1hcDEuZGF0YSB8fCAhc3ByaXRlQml0bWFwMiB8fCAhc3ByaXRlQml0bWFwMi5kYXRhKSByZXR1cm4gZmFsc2UgLy8gZG9lcyBub3QgaGF2ZSBpbWFnZSBkYXRhXHJcblxyXG4gICAgc3ByaXRlRGF0YTEueCA9IHNwcml0ZURhdGExLnggLSAoc3ByaXRlRGF0YTEudyAvIDIpXHJcbiAgICBzcHJpdGVEYXRhMS55ID0gKHNwcml0ZURhdGExLnkgKiAtMSkgLSAoc3ByaXRlRGF0YTEuaCAvIDIpXHJcblxyXG4gICAgc3ByaXRlRGF0YTIueCA9IHNwcml0ZURhdGEyLnggLSAoc3ByaXRlRGF0YTIudyAvIDIpXHJcbiAgICBzcHJpdGVEYXRhMi55ID0gKHNwcml0ZURhdGEyLnkgKiAtMSkgLSAoc3ByaXRlRGF0YTIuaCAvIDIpXHJcblxyXG4gICAgLy8gY2hlY2sgaWYgdGhleSBvdmVybGFwXHJcbiAgICBpZiAoXHJcbiAgICAgIHNwcml0ZURhdGExLnggPiBzcHJpdGVEYXRhMi54ICsgc3ByaXRlRGF0YTIudyB8fFxyXG4gICAgICBzcHJpdGVEYXRhMS54ICsgc3ByaXRlRGF0YTEudyA8IHNwcml0ZURhdGEyLnggfHxcclxuICAgICAgc3ByaXRlRGF0YTEueSA+IHNwcml0ZURhdGEyLnkgKyBzcHJpdGVEYXRhMi5oIHx8XHJcbiAgICAgIHNwcml0ZURhdGExLnkgKyBzcHJpdGVEYXRhMS5oIDwgc3ByaXRlRGF0YTIueVxyXG4gICAgKSByZXR1cm4gZmFsc2UgLy8gbm8gb3ZlcmxhcFxyXG5cclxuICAgIC8vIHNpemUgb2Ygb3ZlcmxhcHBpbmcgYXJlYVxyXG4gICAgLy8gZmluZCBsZWZ0IGVkZ2VcclxuICAgIGNvbnN0IGF4ID0gc3ByaXRlRGF0YTEueCA8IHNwcml0ZURhdGEyLnggPyBzcHJpdGVEYXRhMi54IDogc3ByaXRlRGF0YTEueFxyXG4gICAgLy8gZmluZCByaWdodCBlZGdlIGNhbGN1bGF0ZSB3aWR0aFxyXG4gICAgbGV0IGF3ID0gc3ByaXRlRGF0YTEueCArIHNwcml0ZURhdGExLncgPCBzcHJpdGVEYXRhMi54ICsgc3ByaXRlRGF0YTIudyA/IChzcHJpdGVEYXRhMS54ICsgc3ByaXRlRGF0YTEudykgLSBheCA6IChzcHJpdGVEYXRhMi54ICsgc3ByaXRlRGF0YTIudykgLSBheFxyXG4gICAgLy8gZG8gdGhlIHNhbWUgZm9yIHRvcCBhbmQgYm90dG9tXHJcbiAgICBjb25zdCBheSA9IHNwcml0ZURhdGExLnkgPCBzcHJpdGVEYXRhMi55ID8gc3ByaXRlRGF0YTIueSA6IHNwcml0ZURhdGExLnlcclxuICAgIGxldCBhaCA9IHNwcml0ZURhdGExLnkgKyBzcHJpdGVEYXRhMS5oIDwgc3ByaXRlRGF0YTIueSArIHNwcml0ZURhdGEyLmggPyAoc3ByaXRlRGF0YTEueSArIHNwcml0ZURhdGExLmgpIC0gYXkgOiAoc3ByaXRlRGF0YTIueSArIHNwcml0ZURhdGEyLmgpIC0gYXlcclxuXHJcbiAgICBpZiAoYXcgPCAxIHx8IGFoIDwgMSkgcmV0dXJuIGZhbHNlIC8vIG5vIG92ZXJsYXAsIG9uIGVkZ2VcclxuXHJcbiAgICB0aGlzLmNvbGxpc29uQ2FudmFzQ29udGV4dDEuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTEudywgdGhpcy5jb2xsaXNpb25DYW52YXNTaXplMS5oKVxyXG4gICAgdGhpcy5jb2xsaXNvbkNhbnZhc0NvbnRleHQyLmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUyLncsIHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTIuaClcclxuXHJcbiAgICAvLyByZXNpemVcclxuICAgIHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTEgPSBPYmplY3QuYXNzaWduKHt9LCB7XHJcbiAgICAgIHc6IGF3LFxyXG4gICAgICBoOiBhaFxyXG4gICAgfSlcclxuICAgIHRoaXMuY29sbGlzb25DYW52YXNFbGVtZW50MS53aWR0aCA9IGF3XHJcbiAgICB0aGlzLmNvbGxpc29uQ2FudmFzRWxlbWVudDEuaGVpZ2h0ID0gYWhcclxuICAgIHRoaXMuY29sbGlzb25DYW52YXNDb250ZXh0MSA9IHRoaXMuY29sbGlzb25DYW52YXNFbGVtZW50MS5nZXRDb250ZXh0KCcyZCcpXHJcblxyXG4gICAgLy8gZHJhdyB0aGUgZmlyc3QgaW1hZ2UgcmVsYXRpdmUgdG8gdGhlIG92ZXJsYXAgYXJlYVxyXG4gICAgdGhpcy5jb2xsaXNvbkNhbnZhc0NvbnRleHQxLmRyYXdJbWFnZShzcHJpdGVCaXRtYXAxLmRhdGEsIHNwcml0ZURhdGExLnggLSBheCwgc3ByaXRlRGF0YTEueSAtIGF5KVxyXG4gICAgLy8gb25seSBwaXhlbHMgd2lsbCByZW1haW4gaWYgYm90aCBpbWFnZXMgYXJlIG5vdCB0cmFzcGFyZW50XHJcbiAgICB0aGlzLmNvbGxpc29uQ2FudmFzQ29udGV4dDEuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLWluJ1xyXG4gICAgdGhpcy5jb2xsaXNvbkNhbnZhc0NvbnRleHQxLmRyYXdJbWFnZShzcHJpdGVCaXRtYXAyLmRhdGEsIHNwcml0ZURhdGEyLnggLSBheCwgc3ByaXRlRGF0YTIueSAtIGF5KVxyXG5cclxuICAgIC8vIG5vdyBkcmF3IG92ZXIgaXRzIHNlbGYgdG8gYW1wbGlmeSBhbnkgcGl4ZWxzIHRoYXQgaGF2ZSBsb3cgYWxwaGFcclxuICAgIHRoaXMuY29sbGlzb25DYW52YXNDb250ZXh0MS5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDMyOyBpKyspIHtcclxuICAgICAgdGhpcy5jb2xsaXNvbkNhbnZhc0NvbnRleHQxLmRyYXdJbWFnZSh0aGlzLmNvbGxpc29uQ2FudmFzRWxlbWVudDEsIDAsIDApXHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2V0IGNhbnZhcyAyIHNpemVcclxuICAgIHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTIgPSBPYmplY3QuYXNzaWduKHt9LCB7XHJcbiAgICAgIHc6IE1hdGgubWF4KDEsIE1hdGguZmxvb3IoYXcgLyA4KSksXHJcbiAgICAgIGg6IE1hdGgubWF4KDEsIE1hdGguZmxvb3IoYWggLyA4KSlcclxuICAgIH0pXHJcblxyXG4gICAgbGV0IHJ3ID0gdGhpcy5jb2xsaXNpb25DYW52YXNTaXplMi53XHJcbiAgICBsZXQgcmggPSB0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUyLmhcclxuICAgIHRoaXMuY29sbGlzb25DYW52YXNFbGVtZW50Mi53aWR0aCA9IHJ3XHJcbiAgICB0aGlzLmNvbGxpc29uQ2FudmFzRWxlbWVudDIuaGVpZ2h0ID0gcmhcclxuICAgIHRoaXMuY29sbGlzb25DYW52YXNDb250ZXh0MiA9IHRoaXMuY29sbGlzb25DYW52YXNFbGVtZW50Mi5nZXRDb250ZXh0KCcyZCcpXHJcblxyXG4gICAgd2hpbGUgKHJ3ID4gOCAmJiByaCA+IDgpIHtcclxuICAgICAgLy8gZHJhdyB0aGUgbWFzayBpbWFnZSBzZXZlcmFsIHRpbWVzXHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzI7IGkrKykge1xyXG4gICAgICAgIHRoaXMuY29sbGlzb25DYW52YXNDb250ZXh0Mi5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICB0aGlzLmNvbGxpc29uQ2FudmFzRWxlbWVudDEsXHJcbiAgICAgICAgICAwLCAwLCBhdywgYWgsXHJcbiAgICAgICAgICBNYXRoLnJhbmRvbSgpLFxyXG4gICAgICAgICAgTWF0aC5yYW5kb20oKSxcclxuICAgICAgICAgIHJ3LCByaFxyXG4gICAgICAgIClcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gY2xlYXIgbWFpbiBjYW52YXNcclxuICAgICAgdGhpcy5jb2xsaXNvbkNhbnZhc0NvbnRleHQxLmNsZWFyUmVjdCgwLCAwLCBhdywgYWgpXHJcblxyXG4gICAgICAvLyBzZXQgdGhlIG5ldyBzaXplXHJcbiAgICAgIGF3ID0gcndcclxuICAgICAgYWggPSByaFxyXG5cclxuICAgICAgLy8gZHJhdyB0aGUgc21hbGwgY29weSBvbnRvIG9yaWdpbmFsXHJcbiAgICAgIHRoaXMuY29sbGlzb25DYW52YXNDb250ZXh0MS5kcmF3SW1hZ2UodGhpcy5jb2xsaXNvbkNhbnZhc0VsZW1lbnQyLCAwLCAwKVxyXG5cclxuICAgICAgdGhpcy5jb2xsaXNvbkNhbnZhc0NvbnRleHQyLmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNvbGxpc2lvbkNhbnZhc1NpemUyLncsIHRoaXMuY29sbGlzaW9uQ2FudmFzU2l6ZTIuaClcclxuXHJcbiAgICAgIHJ3ID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihhdyAvIDgpKVxyXG4gICAgICByaCA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IoYWggLyA4KSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5jaGVja0NvbGxpc29uUGl4ZWxzKGF3LCBhaClcclxuICB9XHJcblxyXG4gIGNoZWNrQ29sbGlzb25QaXhlbHMgKHcsIGgpIHtcclxuICAgIGNvbnN0IGltYWdlRGF0YSA9IG5ldyBVaW50MzJBcnJheSh0aGlzLmNvbGxpc29uQ2FudmFzQ29udGV4dDEuZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpLmRhdGEuYnVmZmVyKVxyXG4gICAgbGV0IGkgPSAwXHJcbiAgICAvLyBpZiBhbnkgcGl4ZWwgaXMgbm90IHplcm8gdGhlbiB0aGVyZSBtdXN0IGJlIGFuIG92ZXJsYXBcclxuICAgIHdoaWxlIChpIDwgaW1hZ2VEYXRhLmxlbmd0aCkge1xyXG4gICAgICBpZiAoaW1hZ2VEYXRhW2krK10gIT09IDApIHJldHVybiB0cnVlXHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcblxyXG4gIGlzU3ByaXRlVG91Y2hpbmdFZGdlIChzcHJpdGVEYXRhKSB7XHJcbiAgICBjb25zdCBzcHJpdGVCaXRtYXAgPSB0aGlzLmN1cnJlbnRTcHJpdGVCaXRtYXBzW3Nwcml0ZURhdGEuaW1hZ2VdXHJcbiAgICBpZiAoIXNwcml0ZUJpdG1hcCB8fCAhc3ByaXRlQml0bWFwLmRhdGEpIHtcclxuICAgICAgcmV0dXJuIG51bGwgLy8gZG9lcyBub3QgaGF2ZSBpbWFnZSBkYXRhXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKFxyXG4gICAgICAhKFxyXG4gICAgICAgIChzcHJpdGVEYXRhLngpICsgKHNwcml0ZURhdGEudyAvIDIpID4gdGhpcy5lZGdlQ2FudmFzU2l6ZS53IC8gMiB8fFxyXG4gICAgICAgIChzcHJpdGVEYXRhLngpIC0gKHNwcml0ZURhdGEudyAvIDIpIDwgLTEgKiAodGhpcy5lZGdlQ2FudmFzU2l6ZS53IC8gMikgfHxcclxuICAgICAgICAoc3ByaXRlRGF0YS55KSArIChzcHJpdGVEYXRhLmggLyAyKSA+IHRoaXMuZWRnZUNhbnZhc1NpemUuaCAvIDIgfHxcclxuICAgICAgICAoc3ByaXRlRGF0YS55KSAtIChzcHJpdGVEYXRhLmggLyAyKSA8IC0xICogKHRoaXMuZWRnZUNhbnZhc1NpemUuaCAvIDIpXHJcbiAgICAgIClcclxuICAgICkgcmV0dXJuIG51bGwgLy8gYm91bmRpbmcgYm94IG5vdCB0b3VjaGluZyBlZGdlXHJcblxyXG4gICAgLy8gaWYgYm91bmRpbmcgYm94IGlzIGFsbCB0aGUgd2F5IG91dCBvZiBjYW52YXMgYW5kIGhhcyBza2lwcGVkIHRoZSBlZGdlIGRldGVjdCB0aGVuIHRyZWF0IGFzIHRvdWNoaW5nXHJcbiAgICBpZiAoc3ByaXRlRGF0YS54IC0gc3ByaXRlRGF0YS53ID4gdGhpcy5lZGdlQ2FudmFzU2l6ZS53IC8gMikgcmV0dXJuICdyaWdodCdcclxuICAgIGlmIChzcHJpdGVEYXRhLnggKyBzcHJpdGVEYXRhLncgPCAtMSAqICh0aGlzLmVkZ2VDYW52YXNTaXplLncgLyAyKSkgcmV0dXJuICdsZWZ0J1xyXG4gICAgaWYgKHNwcml0ZURhdGEueSAtIHNwcml0ZURhdGEuaCA+IHRoaXMuZWRnZUNhbnZhc1NpemUuaCAvIDIpIHJldHVybiAndG9wJ1xyXG4gICAgaWYgKHNwcml0ZURhdGEueSArIHNwcml0ZURhdGEuaCA8IC0xICogKHRoaXMuZWRnZUNhbnZhc1NpemUuaCAvIDIpKSByZXR1cm4gJ2JvdHRvbSdcclxuXHJcbiAgICBzcHJpdGVEYXRhLnggPSAodGhpcy5lZGdlQ2FudmFzU2l6ZS53IC8gMikgKyAoc3ByaXRlRGF0YS54IC0gKHNwcml0ZURhdGEudyAvIDIpKVxyXG4gICAgc3ByaXRlRGF0YS55ID0gKHRoaXMuZWRnZUNhbnZhc1NpemUuaCAvIDIpICsgKChzcHJpdGVEYXRhLnkgKiAtMSkgLSAoc3ByaXRlRGF0YS5oIC8gMikpXHJcblxyXG4gICAgdGhpcy5lZGdlQ2FudmFzQ29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5lZGdlQ2FudmFzU2l6ZS53LCB0aGlzLmVkZ2VDYW52YXNTaXplLmgpXHJcbiAgICB0aGlzLmVkZ2VDYW52YXNDb250ZXh0LmRyYXdJbWFnZShzcHJpdGVCaXRtYXAuZGF0YSwgc3ByaXRlRGF0YS54ICsgMSwgc3ByaXRlRGF0YS55ICsgMSkgLy8gKzEgYmVjYXVzZSB0aGUgY2FudmFzIGlzIDEgcGl4ZWwgYmlnZ2VyIG9uIGVhY2ggZWRnZSBhbmQgZHJhd3MgZnJvbSB0b3AgbGVmdFxyXG5cclxuICAgIGlmICh0aGlzLmNoZWNrRWRnZUFyZWFIYXNQaXhlbHMoMCwgMCwgdGhpcy5lZGdlQ2FudmFzU2l6ZS53LCAxKSkgcmV0dXJuICd0b3AnXHJcbiAgICBpZiAodGhpcy5jaGVja0VkZ2VBcmVhSGFzUGl4ZWxzKDAsIHRoaXMuZWRnZUNhbnZhc1NpemUuaCAtIDEsIHRoaXMuZWRnZUNhbnZhc1NpemUudywgMSkpIHJldHVybiAnYm90dG9tJ1xyXG4gICAgaWYgKHRoaXMuY2hlY2tFZGdlQXJlYUhhc1BpeGVscygwLCAwLCAxLCB0aGlzLmVkZ2VDYW52YXNTaXplLmgpKSByZXR1cm4gJ2xlZnQnXHJcbiAgICBpZiAodGhpcy5jaGVja0VkZ2VBcmVhSGFzUGl4ZWxzKHRoaXMuZWRnZUNhbnZhc1NpemUudyAtIDEsIDAsIDEsIHRoaXMuZWRnZUNhbnZhc1NpemUuaCkpIHJldHVybiAncmlnaHQnXHJcblxyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIGNoZWNrRWRnZUFyZWFIYXNQaXhlbHMgKHN4LCBzeSwgc3csIHNoKSB7XHJcbiAgICBjb25zdCBpbWFnZURhdGEgPSBuZXcgVWludDMyQXJyYXkodGhpcy5lZGdlQ2FudmFzQ29udGV4dC5nZXRJbWFnZURhdGEoc3gsIHN5LCBzdywgc2gpLmRhdGEuYnVmZmVyKVxyXG4gICAgbGV0IGkgPSAwXHJcbiAgICB3aGlsZSAoaSA8IGltYWdlRGF0YS5sZW5ndGgpIHtcclxuICAgICAgaWYgKGltYWdlRGF0YVtpKytdICE9PSAwKSByZXR1cm4gdHJ1ZVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBuZXcgQ29sbGlzb25EZXRlY3RvcigpXHJcbiIsImltcG9ydCBMb29rIGZyb20gJy4vbG9vaydcclxuXHJcbi8qKlxyXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBDb3N0dW1lLlxyXG4gKiBDb3N0dW1lcyBjYW4gYmUgYWRkZWQgdG8gYSBTcHJpdGUuXHJcbiAqIEBleHRlbmRzIExvb2tcclxuICpcclxuICogQGV4YW1wbGVcclxuICogbGV0IGNvc3R1bWUgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoKTtcclxuICpcclxuICogQGV4YW1wbGVcclxuICogbGV0IGNvc3R1bWUgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoe1xyXG4gKiAgIHdpZHRoOiA1MCxcclxuICogICBoZWlnaHQ6IDUwLFxyXG4gKiAgIGNvbG9yOiAnI0EyREFGRicsXHJcbiAqICAgaW1hZ2U6ICdodHRwczovL3d3dy5ibG9ja2xpa2Uub3JnL2ltYWdlcy9zaGVlcF9zdGVwLnBuZydcclxuICogfSk7XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb3N0dW1lIGV4dGVuZHMgTG9vayB7XHJcbiAgLyoqXHJcbiAgKiBjb25zdHJ1Y3RvciAtIENyZWF0ZXMgYSBDb3N0dW1lIHRvIGJlIHVzZWQgYnkgU3ByaXRlIG9iamVjdHMuLlxyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gb3B0aW9ucyBmb3IgdGhlIGNvc3R1bWUuXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy53aWR0aCAtIHRoZSBjb3N0dW1lIHdpZHRoIGluIHBpeGVscy4gRGVmYXVsdCBpcyAxMDAuXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5oZWlnaHQgLSB0aGUgY29zdHVtZSBoZWlnaHQgaW4gcGl4ZWxzLiBEZWZhdWx0IGlzIDEwMC5cclxuICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmltYWdlIC0gYSBVUkkgKG9yIGRhdGEgVVJJKSBmb3IgdGhlIGNvc3R1bWUgaW1hZ2UuXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jb2xvciAtIGEgY3NzIGNvbG9yIHN0cmluZyAoJyNmZjAwMDAnLCAncmVkJylcclxuICAqL1xyXG4gIGNvbnN0cnVjdG9yIChvcHRpb25zID0ge30pIHtcclxuICAgIGNvbnN0IGRlZmF1bHRzID0ge1xyXG4gICAgICB3aWR0aDogMTAwLFxyXG4gICAgICBoZWlnaHQ6IDEwMCxcclxuICAgICAgY29sb3I6IG51bGxcclxuICAgIH1cclxuICAgIGNvbnN0IGFjdHVhbCA9IHsgLi4uZGVmYXVsdHMsIC4uLm9wdGlvbnMgfVxyXG5cclxuICAgIHN1cGVyKClcclxuXHJcbiAgICB0aGlzLndpZHRoID0gYWN0dWFsLndpZHRoXHJcbiAgICB0aGlzLmhlaWdodCA9IGFjdHVhbC5oZWlnaHRcclxuICAgIHRoaXMudmlzaWJsZVdpZHRoID0gYWN0dWFsLndpZHRoXHJcbiAgICB0aGlzLnZpc2libGVIZWlnaHQgPSBhY3R1YWwuaGVpZ2h0XHJcblxyXG4gICAgdGhpcy5pbWFnZSA9IGFjdHVhbC5pbWFnZVxyXG4gICAgdGhpcy5jb2xvciA9IGFjdHVhbC5jb2xvclxyXG5cclxuICAgIC8vIHByZWxvYWRcclxuICAgIGlmICh0aGlzLmltYWdlKSB7XHJcbiAgICAgIGNvbnN0IGltYWdlID0gbmV3IHdpbmRvdy5JbWFnZSgpXHJcbiAgICAgIGltYWdlLnNyYyA9IHRoaXMuaW1hZ2VcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmlubmVySFRNTCA9ICcnXHJcbiAgfVxyXG5cclxuICAvKiogU2V0dXAgQWN0aW9ucyAqICovXHJcblxyXG4gIC8qKlxyXG4gICogYWRkVG8gLSBBZGRzIHRoZSBjb3N0dW1lIHRvIHRoZSBzcHJpdGVcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKiBsZXQgY29zdHVtZSA9IG5ldyBibG9ja0xpa2UuQ29zdHVtZSgpO1xyXG4gICpcclxuICAqIGNvc3R1bWUuYWRkVG8oc3ByaXRlKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gd2hpY2ggc3ByaXRlIHRvIGFkZCB0aGUgY29zdHVtZSB0b28uXHJcbiAgKi9cclxuICBhZGRUbyAoc3ByaXRlKSB7XHJcbiAgICBjb25zdCBjdXJTcHJpdGUgPSBzcHJpdGVcclxuICAgIHNwcml0ZS5jb3N0dW1lcy5wdXNoKHRoaXMpXHJcblxyXG4gICAgLy8gaWYgXCJiYXJlXCIgc2V0IHRoZSBhZGRlZCBhcyBhY3RpdmUuXHJcbiAgICBpZiAoIXNwcml0ZS5jb3N0dW1lKSB7XHJcbiAgICAgIGN1clNwcml0ZS5jb3N0dW1lID0gc3ByaXRlLmNvc3R1bWVzWzBdXHJcbiAgICAgIGN1clNwcml0ZS53aWR0aCA9IHNwcml0ZS5jb3N0dW1lLnZpc2libGVXaWR0aFxyXG4gICAgICBjdXJTcHJpdGUuaGVpZ2h0ID0gc3ByaXRlLmNvc3R1bWUudmlzaWJsZUhlaWdodFxyXG4gICAgfVxyXG5cclxuICAgIHNwcml0ZS5lbGVtZW50ID8gc3ByaXRlLmVsZW1lbnQudXBkYXRlKHNwcml0ZSkgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlbW92ZUZyb20gLSBSZW1vdmVzIHRoZSBjb3N0dW1lIGZyb20gdG8gdGhlIHNwcml0ZVxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqIGxldCBjb3N0dW1lID0gbmV3IGJsb2NrTGlrZS5Db3N0dW1lKCk7XHJcbiAgKlxyXG4gICogY29zdHVtZS5hZGRUbyhzcHJpdGUpO1xyXG4gICogY29zdHVtZS5yZW1vdmVGcm9tKHNwcml0ZSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHNwcml0ZSAtIHdoaWNoIHNwcml0ZSB0byByZW1vdmUgdGhlIGNvc3R1bWUgZnJvbS5cclxuICAqL1xyXG4gIHJlbW92ZUZyb20gKHNwcml0ZSkge1xyXG4gICAgc3ByaXRlLnJlbW92ZUNvc3R1bWUodGhpcylcclxuICB9XHJcblxyXG4gIC8qKiBMb29rcyAqICovXHJcblxyXG4gIC8qKlxyXG4gICogcmVzaXplVG9JbWFnZSAtIHNldHMgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIGNvc3R1bWUgdG8gdGhhdCBvZiB0aGUgaW1hZ2UgZmlsZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IGNvc3R1bWUgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoe1xyXG4gICogICBpbWFnZTogJ2h0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvZC9kMy9TaGVlcF9pbl9ncmF5LnN2ZydcclxuICAqIH0pO1xyXG4gICpcclxuICAqIGNvc3R1bWUucmVzaXplVG9JbWFnZSgpO1xyXG4gICovXHJcbiAgcmVzaXplVG9JbWFnZSAoKSB7XHJcbiAgICAvLyByZWdpc3RlciB0aGUgaW1hZ2Ugc2l6ZSBmcm9tIHRoZSBmaWxlXHJcbiAgICBpZiAodGhpcy5pbWFnZSkge1xyXG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyB3aW5kb3cuSW1hZ2UoKVxyXG4gICAgICBjb25zdCBtZSA9IHRoaXNcclxuXHJcbiAgICAgIGltYWdlLnNyYyA9IHRoaXMuaW1hZ2VcclxuXHJcbiAgICAgIGltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICAgICAgbWUud2lkdGggPSBpbWFnZS53aWR0aFxyXG4gICAgICAgIG1lLmhlaWdodCA9IGltYWdlLmhlaWdodFxyXG4gICAgICAgIG1lLnZpc2libGVXaWR0aCA9IG1lLndpZHRoXHJcbiAgICAgICAgbWUudmlzaWJsZUhlaWdodCA9IG1lLmhlaWdodFxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBpbm5lciAtIFBsYWNlcyBhbiBIVE1MIGVsZW1lbnQgaW5zaWRlIHRoZSBjb3N0dW1lLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgY29zdHVtZSA9IG5ldyBibG9ja0xpa2UuQ29zdHVtZSgpO1xyXG4gICpcclxuICAqIGNvc3R1bWUuaW5uZXIoJzxwIGNsYXNzPVwiYmlnIGNlbnRlcmVkIHJhaW5ib3dcIj46KTwvcD4nKTtcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogY29zdHVtZS5pbm5lcignSSBsaWtlIHRleHQgb25seScpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIC0gdGhlIGh0bWwgdG8gaW5zZXJ0LlxyXG4gICovXHJcbiAgaW5uZXIgKGh0bWwpIHtcclxuICAgIHRoaXMuaW5uZXJIVE1MID0gaHRtbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBpbnNlcnQgLSBQbGFjZXMgYSBET00gZWxlbWVudCBpbnNpZGUgdGhlIGNvc3R1bWUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBjb3N0dW1lID0gbmV3IGJsb2NrTGlrZS5Db3N0dW1lKCk7XHJcbiAgKlxyXG4gICogY29zdHVtZS5pbnNlcnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ215LWh0bWwtY3JlYXRpb24nKSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IGVsIC0gdGhlIERPTSBlbGVtZW50LlxyXG4gICovXHJcbiAgaW5zZXJ0IChlbCkge1xyXG4gICAgY29uc3QgaWVsID0gZWwuY2xvbmVOb2RlKHRydWUpXHJcbiAgICBpZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICAgIGllbC5zdHlsZS52aXNpYmlsaXR5ID0gJ2luaGVyaXQnXHJcblxyXG4gICAgdGhpcy5pbWFnZSA9IG51bGxcclxuICAgIHRoaXMuY29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICB0aGlzLmlubmVySFRNTCA9IGllbC5vdXRlckhUTUxcclxuICB9XHJcbn1cclxuIiwiLyoqXHJcbiogQ29sbGVjdGlvbiBvZiBjc3Mgc3RyaW5ncyB0byBiZSBpbmplY3RlZCB0byB0aGUgaGVhZCBzZWN0aW9uIG9mIGEgcGFnZS5cclxuKiBAcHJpdmF0ZVxyXG4qL1xyXG5leHBvcnQgY29uc3QgZGVmYXVsdENTUyA9IGBcclxuKiB7IFxyXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XHJcbiAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xyXG4gIC13ZWJraXQtdG91Y2gtY2FsbG91dDpub25lOyAgICAgICAgICAgICAgICAvKiBwcmV2ZW50IGNhbGxvdXQgdG8gY29weSBpbWFnZSwgZXRjIHdoZW4gdGFwIHRvIGhvbGQgKi9cclxuICAtd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6cmdiYSgwLDAsMCwwKTsgLyogcHJldmVudCB0YXAgaGlnaGxpZ2h0IGNvbG9yIC8gc2hhZG93ICovXHJcbn1cclxuaHRtbCwgYm9keXtcclxuICBtYXJnaW46MDtcclxuICBwYWRkaW5nOjA7XHJcbn1cclxuYFxyXG5cclxuZXhwb3J0IGNvbnN0IHVpQ1NTID0gYFxyXG4uYmxvY2tsaWtlLWZsYWcge1xyXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcclxuICBmb250LWZhbWlseTogQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZjtcclxuICBmb250LXNpemU6IDY1cHg7XHJcbiAgbGluZS1oZWlnaHQ6IDY1cHg7XHJcbiAgcGFkZGluZzogMzJweDtcclxuICBjb2xvcjogIzIyMjtcclxuICBiYWNrZ3JvdW5kOiAjZmFmYWZhO1xyXG4gIGJvcmRlcjogMnB4IHNvbGlkICM2NjY7XHJcbiAgYm9yZGVyLXJhZGl1czogNjVweDtcclxufVxyXG5gXHJcblxyXG5leHBvcnQgY29uc3QgdGhpbmtDU1MgPSBgXHJcbi5ibG9ja2xpa2UtdGhpbmsge1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICBtaW4td2lkdGg6IDYwcHg7XHJcbiAgbWF4LXdpZHRoOiAyMDBweDtcclxuICBsZWZ0OiAyMDBweDtcclxuICBwYWRkaW5nOiAxMHB4O1xyXG4gIGZvbnQtZmFtaWx5OiBBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmO1xyXG4gIGZvbnQtc2l6ZTogMTZweDtcclxuICBtaW4taGVpZ2h0OiAxNnB4O1xyXG4gIGxpbmUtaGVpZ2h0OiAxNnB4O1xyXG4gIHRleHQtYWxpZ246IGxlZnQ7XHJcbiAgY29sb3I6ICMyMjI7XHJcbiAgYmFja2dyb3VuZDogI2ZhZmFmYTtcclxuICBib3JkZXI6IDJweCBzb2xpZCAjNDQ0O1xyXG4gIGJvcmRlci1yYWRpdXM6IDIwcHg7XHJcbn1cclxuLmJsb2NrbGlrZS10aGluazpiZWZvcmUge1xyXG4gIHBvc2l0aW9uOmFic29sdXRlO1xyXG4gIGJvdHRvbTogLTMwcHg7XHJcbiAgbGVmdDogMHB4O1xyXG4gIHdpZHRoOiAzMHB4O1xyXG4gIGhlaWdodDogMzBweDtcclxuICBiYWNrZ3JvdW5kOiAjZmFmYWZhO1xyXG4gIGJvcmRlcjogMnB4IHNvbGlkICM0NDQ7XHJcbiAgYm9yZGVyLXJhZGl1czogMjBweDtcclxuICBjb250ZW50OiBcIlwiO1xyXG59XHJcbi5ibG9ja2xpa2UtdGhpbms6YWZ0ZXIge1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICBib3R0b206IC00NXB4O1xyXG4gIGxlZnQ6IDBweDtcclxuICB3aWR0aDogMTVweDtcclxuICBoZWlnaHQ6IDE1cHg7XHJcbiAgYmFja2dyb3VuZDogI2ZhZmFmYTtcclxuICBib3JkZXI6IDJweCBzb2xpZCAjNDQ0O1xyXG4gIGJvcmRlci1yYWRpdXM6IDE1cHg7XHJcbiAgY29udGVudDogXCJcIjtcclxufVxyXG5gXHJcblxyXG5leHBvcnQgY29uc3Qgc2F5Q1NTID0gYFxyXG4uYmxvY2tsaWtlLWFzayxcclxuLmJsb2NrbGlrZS1zYXkge1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XHJcbiAgbWluLXdpZHRoOiA2MHB4O1xyXG4gIG1heC13aWR0aDogMjAwcHg7XHJcbiAgcGFkZGluZzogMTBweDtcclxuICBmb250LWZhbWlseTogQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZjtcclxuICBmb250LXNpemU6IDE2cHg7XHJcbiAgbWluLWhlaWdodDogMTZweDtcclxuICBsaW5lLWhlaWdodDogMTZweDtcclxuICB0ZXh0LWFsaWduOiBsZWZ0O1xyXG4gIGJhY2tncm91bmQtY29sb3I6ICNmYWZhZmE7XHJcbiAgYm9yZGVyOiAycHggc29saWQgIzQ0NDtcclxuICBib3JkZXItcmFkaXVzOiAyMHB4O1xyXG59XHJcbi5ibG9ja2xpa2UtYXNrOmJlZm9yZSxcclxuLmJsb2NrbGlrZS1zYXk6YmVmb3JlIHtcclxuICBjb250ZW50OiAnICc7XHJcbiAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gIHdpZHRoOiAwO1xyXG4gIGhlaWdodDogMDtcclxuICBsZWZ0OiAxM3B4O1xyXG4gIHJpZ2h0OiBhdXRvO1xyXG4gIHRvcDogYXV0bztcclxuICBib3R0b206IC0zM3B4O1xyXG4gIGJvcmRlcjogMTZweCBzb2xpZDtcclxuICBib3JkZXItY29sb3I6ICM0NDQgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgIzQ0NDtcclxufVxyXG4uYmxvY2tsaWtlLWFzazphZnRlcixcclxuLmJsb2NrbGlrZS1zYXk6YWZ0ZXIge1xyXG4gIGNvbnRlbnQ6ICcgJztcclxuICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgd2lkdGg6IDA7XHJcbiAgaGVpZ2h0OiAwO1xyXG4gIGxlZnQ6IDE1cHg7XHJcbiAgcmlnaHQ6IGF1dG87XHJcbiAgdG9wOiBhdXRvO1xyXG4gIGJvdHRvbTogLTI4cHg7XHJcbiAgYm9yZGVyOiAxNnB4IHNvbGlkO1xyXG4gIGJvcmRlci1jb2xvcjogI2ZhZmFmYSB0cmFuc3BhcmVudCB0cmFuc3BhcmVudCAjZmFmYWZhO1xyXG59XHJcbmBcclxuXHJcbmV4cG9ydCBjb25zdCBhc2tDU1MgPSBgXHJcbi5ibG9ja2xpa2UtYXNrIGlucHV0IHtcclxuICBmb250LWZhbWlseTogQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZjtcclxuICBmb250LXNpemU6IDE2cHg7XHJcbiAgcGFkZGluZzogMnB4O1xyXG4gIG1hcmdpbjogMnB4O1xyXG4gIHdpZHRoOiA3NSU7XHJcbn1cclxuLmJsb2NrbGlrZS1hc2sgYnV0dG9uIHtcclxuICBmb250LXNpemU6IDE2cHg7XHJcbiAgbGluZS1oZWlnaHQ6IDE2cHg7XHJcbiAgaGVpZ2h0OiAyNnB4O1xyXG4gIHBhZGRpbmc6IDAgNXB4O1xyXG4gIG1hcmdpbjogMDtcclxufVxyXG5gXHJcbiIsIi8qKlxyXG4qIEVuY2Fwc3VsYXRlcyB0aGUgZnVuY3Rpb25hbGl0eSBvZiBtYW5hZ2luZyBlbGVtZW50IHN0eWxlIHByb3BlcnRpZXMgZm9yIHRoZSBlbnRpdGllcy5cclxuKi9cclxuXHJcbi8qKlxyXG4qIGFwcGx5IC0gYXBwbHkgY3NzUnVsZXMgb2YgYW4gZW50aXR5IHRvIGl0cyBET00gZWxlbWVudC5cclxuKlxyXG4qIEBwYXJhbSB7ZnVuY3Rpb259IGVudGl0eSAtIGEgU3ByaXRlIG9yIFN0YWdlLlxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gYXBwbHkgKGVudGl0eSkge1xyXG4gIGNvbnN0IGN1ckVudGl0eSA9IGVudGl0eVxyXG4gIC8vIFNwcml0ZXMgaGF2ZSBDb3N0dW1lcywgU3RhZ2UgaGFzIEJhY2tkcm9wLCBmaWd1cmUgb3V0IHdoaWNoIGVudGl0eSBpdCBpcy5cclxuICBjb25zdCBjdXJMb29rID0gZW50aXR5LmJhY2tkcm9wIHx8IGVudGl0eS5jb3N0dW1lXHJcbiAgY29uc3QgY3VyTG9va3MgPSBlbnRpdHkuYmFja2Ryb3BzIHx8IGVudGl0eS5jb3N0dW1lc1xyXG5cclxuICBjb25zdCBlbCA9IGVudGl0eS5lbGVtZW50LmVsXHJcblxyXG4gIC8vIHJlbW92ZSBhbnkgc3R5bGUgYXBwbGllZCBieSBhbnkgbG9va1xyXG4gIGlmIChjdXJMb29rcykge1xyXG4gICAgY3VyTG9va3MuZm9yRWFjaCgoYikgPT4ge1xyXG4gICAgICBiLmNzc1J1bGVzLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICBjb25zdCBjYW1lbENhc2VkID0gaXRlbS5wcm9wLnJlcGxhY2UoLy0oW2Etel0pL2csIChnKSA9PiBnWzFdLnRvVXBwZXJDYXNlKCkpXHJcbiAgICAgICAgZWwuc3R5bGVbY2FtZWxDYXNlZF0gPSAnJ1xyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8vIGFkZCBjdXJyZW50IGxvb2sgc3R5bGVzXHJcbiAgaWYgKGN1ckxvb2spIHtcclxuICAgIGN1ckxvb2suY3NzUnVsZXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICBjb25zdCBjYW1lbENhc2VkID0gaXRlbS5wcm9wLnJlcGxhY2UoLy0oW2Etel0pL2csIChnKSA9PiBnWzFdLnRvVXBwZXJDYXNlKCkpXHJcbiAgICAgIGVsLnN0eWxlW2NhbWVsQ2FzZWRdID0gaXRlbS52YWx1ZVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8vIEFkZCBjdXJFbnRpdHkgc3R5bGVzLiBNdXN0IGJlIGRvbmUgYWZ0ZXIgbG9vayBzdHlsZXMuXHJcbiAgY3VyRW50aXR5LmNzc1J1bGVzLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgIGNvbnN0IGNhbWVsQ2FzZWQgPSBpdGVtLnByb3AucmVwbGFjZSgvLShbYS16XSkvZywgKGcpID0+IGdbMV0udG9VcHBlckNhc2UoKSlcclxuICAgIGVsLnN0eWxlW2NhbWVsQ2FzZWRdID0gaXRlbS52YWx1ZVxyXG4gIH0pXHJcbn1cclxuXHJcbi8qKlxyXG4qIHJlZ2lzdGVyIC0gcmVnaXN0ZXIgY3NzUnVsZXMgb2YgZm9yIGFuIGVudGl0eSBiYXNlZCBvbiB1c2VyIGlucHV0LlxyXG4qIE5vdGU6IEFsbCBydWxlcyBhcmUgcmVnaXN0ZXJlZCBkYXNoLWNhc2UgYS1sYSBjc3MuXHJcbiogVGhpcyBpcyByZWdhcmRsZXNzIG9mIGhvdyB0aGV5IGFyZSBzZXQgYW5kIHRob3VnaCB0aGV5IGFyZSB1c2VkIGNhbWVsQ2FzZS5cclxuKlxyXG4qIEBwYXJhbSB7c3RyaW5nfSBwcm9wIC0gdGhlIGNzcyBwcm9wZXJ0eSAoZS5nLiBjb2xvcikuIEFsdGVybmF0aXZlbHkgYW4gb2JqZWN0IHdpdGgga2V5OiB2YWx1ZSBwYWlycy5cclxuKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSB0aGUgdmFsdWUgZm9yIHRoZSBjc3MgcHJvcGVydHkgKGUuZy4gI2ZmODgzMylcclxuKiBAcGFyYW0ge2Z1bmN0aW9ufSBlbnRpdHkgLSBhIFNwcml0ZSBvciBTdGFnZS5cclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyIChwcm9wLCB2YWx1ZSwgZW50aXR5KSB7XHJcbiAgY29uc3QgY3VyRW50aXR5ID0gZW50aXR5XHJcblxyXG4gIGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgY29uc3QgZGFzaGVkID0gcHJvcC5yZXBsYWNlKC8oW0EtWl0pL2csICgkMSkgPT4gYC0keyQxLnRvTG93ZXJDYXNlKCl9YClcclxuICAgIGN1ckVudGl0eS5jc3NSdWxlcy5wdXNoKHsgcHJvcDogZGFzaGVkLCB2YWx1ZSB9KVxyXG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb3AgPT09ICdvYmplY3QnICYmICF2YWx1ZSkge1xyXG4gICAgT2JqZWN0LmtleXMocHJvcCkuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgIGNvbnN0IGRhc2hlZCA9IGtleS5yZXBsYWNlKC8oW0EtWl0pL2csICgkMSkgPT4gYC0keyQxLnRvTG93ZXJDYXNlKCl9YClcclxuICAgICAgY3VyRW50aXR5LmNzc1J1bGVzLnB1c2goeyBwcm9wOiBkYXNoZWQsIHZhbHVlOiBwcm9wW2tleV0gfSlcclxuICAgIH0pXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCByZXdyaXRlIGZyb20gJy4vcmV3cml0ZXInXHJcbmltcG9ydCAqIGFzIGNzcyBmcm9tICcuL2VsZW1lbnQtY3NzJ1xyXG5cclxuLyoqXHJcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiBlbnRpdHkuXHJcbiAqIEFic3RyYWN0IGZvciBTdGFnZSBhbmQgU3ByaXRlLlxyXG4gKiBEbyBub3QgaW5zdGFudGlhdGUgb2JqZWN0cyBkaXJlY3RseSBmcm9tIHRoaXMgY2xhc3MuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbnRpdHkge1xyXG4gIC8qKlxyXG4gICogY29uc3RydWN0b3IgLSBFbnRpdHkgaXMgYWJzdHJhY3QgZm9yIFN0YWdlIGFuZCBTcHJpdGUuXHJcbiAgKlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IHBhY2UgLSB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBwYWNlIHBhY2VkIG1ldGhvZHMuXHJcbiAgKi9cclxuICBjb25zdHJ1Y3RvciAocGFjZSkge1xyXG4gICAgRW50aXR5Lm1lc3NhZ2VMaXN0ZW5lcnMgPSBbXVxyXG4gICAgdGhpcy5pZCA9IHRoaXMuX2dlbmVyYXRlVVVJRCgpXHJcbiAgICB0aGlzLnBhY2UgPSBwYWNlXHJcbiAgICB0aGlzLnNvdW5kcyA9IFtdIC8vIHdpbGwgaG9sZCBhbGwgc291bmRzIGN1cnJlbnRseSBwbGF5ZWQgYnkgZW50aXR5LCBpZiBhbnkuXHJcbiAgICAvKlxyXG4gICAgKiBQYWNlZCBtZXRob2RzIHdvcmsgaW4gdGhlIGZvbGxvd2luZyBtYW5uZXI6XHJcbiAgICAqIDEuIEV2ZW50IE1ldGhvZCBmdW5jdGlvbnMgYXJlIHJld3JpdHRlbi5cclxuICAgICogMi4gRm9yIHBhY2VkIG1ldGhvZHMgcmV3cml0ZXIgd2lsbCBhZGQgYW4gYXdhaXQgdG8gYSBwcm9taXNlIGFmdGVyIHRoZSBwYWNlZCBtZXRob2QgY2FsbC5cclxuICAgICogMy4gVGhlIHByb21pc2Ugd2lsbCByZXNvbHZlIGFmdGVyIHtwYWNlfSBtaWxsaXNlY29uZHMuXHJcbiAgICAqXHJcbiAgICAqIFRoaXMgYWxsb3dzIHRoZSBwYWNlZCBtZXRob2QgdG8gaGFsdCBleGVjdXRpb24gb2YgYW55IGNvZGUgZm9sbG93aW5nIGl0IHVudGlsIGl0IGlzIGRvbmUuXHJcbiAgICAqL1xyXG4gICAgdGhpcy5wYWNlZCA9IFtcclxuICAgICAgJ2dvVG8nLFxyXG4gICAgICAnbW92ZScsXHJcbiAgICAgICdjaGFuZ2VYJyxcclxuICAgICAgJ2NoYW5nZVknLFxyXG4gICAgICAnc2V0WCcsXHJcbiAgICAgICdzZXRZJyxcclxuICAgICAgJ2dvVG93YXJkcycsXHJcbiAgICAgICd0dXJuUmlnaHQnLFxyXG4gICAgICAndHVybkxlZnQnLFxyXG4gICAgICAncG9pbnRJbkRpcmVjdGlvbicsXHJcbiAgICAgICdwb2ludFRvd2FyZHMnLFxyXG4gICAgICAnY2hhbmdlU2l6ZScsXHJcbiAgICAgICdzZXRTaXplJyxcclxuICAgICAgJ3NheScsXHJcbiAgICAgICd0aGluaycsXHJcbiAgICAgICdyZWZyZXNoJ1xyXG4gICAgXVxyXG5cclxuICAgIC8qXHJcbiAgICAqIFdhaXRlZCBtZXRob2RzIHdvcmsgaW4gdGhlIGZvbGxvd2luZyBtYW5uZXI6XHJcbiAgICAqIDEuIEV2ZW50IE1ldGhvZCBmdW5jdGlvbnMgYXJlIHJld3JpdHRlbi5cclxuICAgICogMi4gRm9yIHdhaXRlZCBtZXRob2RzIHJld3JpdGVyIHdpbGwgYWRkIGFuIGF3YWl0IHRvIGEgcHJvbWlzZSBhZnRlciB0aGUgd2FpdGVkIG1ldGhvZCBjYWxsLlxyXG4gICAgKiAzLiBUaGUgcHJvbWlzZSBpbmNsdWRlcyBhIGRvY3VtZW50IGxldmVsIGV2ZW50IGxpc3RlbmVyLlxyXG4gICAgKiA0LiByZXdyaXRlciBtb2RpZmllcyB0aGUgd2FpdGVkIG1ldGhvZCBjYWxsLCBpbnNlcnRpbmcgYSB0cmlnZ2VyaW5nSWQgcGFyYW1ldGVyLlxyXG4gICAgKiA0LiBUaGUgZXZlbnQgbGlzdGVuZXIgaXMgdW5pcXVlIHRvIHRoZSB0cmlnZ2VyaW5nSWQuXHJcbiAgICAqIDUuIFdoZW4gdGhlIG1ldGhvZCBjb21wbGV0ZXMgcnVubmluZyBhbiBldmVudCBpcyBkaXNwYXRjaGVkIHJlc29sdmluZyB0aGUgcHJvbWlzZS5cclxuICAgICpcclxuICAgICogVGhpcyBhbGxvd3MgdGhlIHdhaXRlZCBtZXRob2QgdG8gaGFsdCBleGVjdXRpb24gb2YgYW55IGNvZGUgZm9sbG93aW5nIGl0IHVudGlsIGl0IGlzIGRvbmUuXHJcbiAgICAqL1xyXG4gICAgdGhpcy53YWl0ZWQgPSBbXHJcbiAgICAgICd3YWl0JyxcclxuICAgICAgJ2dsaWRlJyxcclxuICAgICAgJ3NheVdhaXQnLFxyXG4gICAgICAndGhpbmtXYWl0JyxcclxuICAgICAgJ3BsYXlTb3VuZFVudGlsRG9uZScsXHJcbiAgICAgICdicm9hZGNhc3RNZXNzYWdlV2FpdCdcclxuICAgIF1cclxuXHJcbiAgICAvKlxyXG4gICAgKiB3YWl0ZWRSZXR1bnJlZCBtZXRob2RzIHdvcmsgc2ltaWxhcmx5IHRvIHdhaXRlZCBtZXRob2RzIG9ubHkgdGhhdCB0aGV5IGVuYWJsZSBjYXB0dXJpbmcgYSB2YWx1ZVxyXG4gICAgKiBpbnRvIGEgZ2xvYmFsbHkgZGVjbGFyZWQgdmFyaWFibGUgKG9yIGFuIHVuZGVjbGFyZWQgb25lKS5cclxuICAgICogMS4gRXZlbnQgTWV0aG9kIGZ1bmN0aW9ucyBhcmUgcmV3cml0dGVuLlxyXG4gICAgKiAyLiBGb3Igd2FpdGVkUmV0dXJuZWQgbWV0aG9kcyByZXdyaXRlciB3aWxsIGFkZCBhbiBhd2FpdCB0byBhIHByb21pc2UgYWZ0ZXIgdGhlIHdhaXRlZCBtZXRob2QgY2FsbC5cclxuICAgICogMy4gVGhlIHByb21pc2UgaW5jbHVkZXMgYSBkb2N1bWVudCBsZXZlbCBldmVudCBsaXN0ZW5lci5cclxuICAgICogNC4gcmV3cml0ZXIgbW9kaWZpZXMgdGhlIHdhaXRlZCBtZXRob2QgY2FsbCwgaW5zZXJ0aW5nOlxyXG4gICAgKiAgIC0gdGhlIG5hbWUgb2YgdGhlIHZhcmlhYmxlIGludG8gd2hpY2ggYSB2YWx1ZSBpcyByZXR1cm5lZC5cclxuICAgICogICAtIGEgdHJpZ2dlcmluZ0lkIHBhcmFtZXRlci5cclxuICAgICogNC4gVGhlIGV2ZW50IGxpc3RlbmVyIGlzIHVuaXF1ZSB0byB0aGUgdHJpZ2dlcmluZ0lkLlxyXG4gICAgKiA1LiBXaGVuIHRoZSBtZXRob2QgY29tcGxldGVzIHJ1bm5pbmcgYW4gZXZlbnQgaXMgZGlzcGF0Y2hlZCByZXNvbHZpbmcgdGhlIHByb21pc2UuXHJcbiAgICAqIDYuIFRoZSB2YWx1ZSByZXR1cm5lZCBpcyB0cmFuc2ZlcmVkIGludG8gdGhlIHZhcmlhYmxlIHVzaW5nIGV2YWwuXHJcbiAgICAqXHJcbiAgICAqIFRoaXMgYWxsb3dzIHRoZSB3YWl0ZWQgbWV0aG9kIHRvIGhhbHQgZXhlY3V0aW9uIG9mIGFueSBjb2RlIGZvbGxvd2luZyBpdCB1bnRpbCBpdCBpcyBkb25lLlxyXG4gICAgKiBBdCB3aGljaCBwb2ludCB0aGUgdmFyaWFibGUgaGFzIFwiY2FwdHVyZWRcIiB0aGUgdmFsdWUuXHJcbiAgICAqL1xyXG4gICAgdGhpcy53YWl0ZWRSZXR1cm5lZCA9IFtcclxuICAgICAgJ2ludm9rZScsXHJcbiAgICAgICdhc2snXHJcbiAgICBdXHJcblxyXG4gICAgLypcclxuICAgICogRXZlbnQgbWV0aG9kcyAoZXZlbnRlZCkgYXJlIGNvbnRhaW5lcnMgZm9yIGZ1bmN0aW9ucyB0byBiZSByZXdyaXR0ZW4uXHJcbiAgICAqIFdoZW4gYW4gZXZlbnQgbWV0aG9kIGlzIG5lc3RlZCBpbnNpZGUgYW5vdGhlciB0aGUgY29kZSBvZiB0aGUgaW5uZXIgbWV0aG9kIGlzIE5PVCByZXdyaXR0ZW4uXHJcbiAgICAqL1xyXG4gICAgdGhpcy5ldmVudGVkID0gW1xyXG4gICAgICAnd2hlbkZsYWcnLFxyXG4gICAgICAnd2hlbkxvYWRlZCcsXHJcbiAgICAgICd3aGVuQ2xpY2tlZCcsXHJcbiAgICAgICd3aGVuS2V5UHJlc3NlZCcsXHJcbiAgICAgICd3aGVuRXZlbnQnLFxyXG4gICAgICAnd2hlblJlY2VpdmVNZXNzYWdlJyxcclxuICAgICAgJ3doZW5DbG9uZWQnLFxyXG4gICAgICAnYWRkRXZlbnRMaXN0ZW5lcidcclxuICAgIF1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogX2dlbmVyYXRlVVVJRCAtIGdlbmVyYXRlcyBhIHVuaXF1ZSBJRC5cclxuICAqIFNvdXJjZTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDUwMzQvY3JlYXRlLWd1aWQtdXVpZC1pbi1qYXZhc2NyaXB0XHJcbiAgKlxyXG4gICogQHByaXZhdGVcclxuICAqIEByZXR1cm4ge3N0cmluZ30gLSBhIHVuaXF1ZSBpZC5cclxuICAqL1xyXG4gIF9nZW5lcmF0ZVVVSUQgKCkge1xyXG4gICAgbGV0IGRcclxuICAgIGxldCByXHJcblxyXG4gICAgZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcblxyXG4gICAgaWYgKHdpbmRvdy5wZXJmb3JtYW5jZSAmJiB0eXBlb2Ygd2luZG93LnBlcmZvcm1hbmNlLm5vdyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBkICs9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSAvLyB1c2UgaGlnaC1wcmVjaXNpb24gdGltZXIgaWYgYXZhaWxhYmxlXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdXVpZCA9ICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgKGMpID0+IHtcclxuICAgICAgciA9IChkICsgTWF0aC5yYW5kb20oKSAqIDE2KSAlIDE2IHwgMCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW1peGVkLW9wZXJhdG9ycywgbm8tYml0d2lzZVxyXG4gICAgICBkID0gTWF0aC5mbG9vcihkIC8gMTYpXHJcbiAgICAgIHJldHVybiAoYyA9PT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KSkudG9TdHJpbmcoMTYpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbWl4ZWQtb3BlcmF0b3JzLCBuby1iaXR3aXNlXHJcbiAgICB9KVxyXG5cclxuICAgIHJldHVybiB1dWlkXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIF9yZWxlYXNlV2FpdGVkIC0gcmVsZWFzZXMgYSB3YWl0ZWQgcHJvbWlzZSBieSBkaXNwYXRjaGluZyBhbiBldmVudC5cclxuICAqXHJcbiAgKiBAcHJpdmF0ZVxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHRyaWdnZXJpbmdJZCAtIHRoZSBuYW1lIG9mIHRoZSBldmVudCB0aGF0IGludm9rZWQgdGhlIGNvZGUgdGhhdCByZXF1ZXN0ZWQgdGhlIHdhaXQuXHJcbiAgKi9cclxuICBfcmVsZWFzZVdhaXRlZCAodHJpZ2dlcmluZ0lkKSB7XHJcbiAgICBjb25zdCBldmVudCA9IG5ldyB3aW5kb3cuQ3VzdG9tRXZlbnQoYGJsb2NrTGlrZS53YWl0ZWQuJHt0cmlnZ2VyaW5nSWR9YCwgeyBkZXRhaWw6IHsgdmFsdWU6IDAgfSB9KVxyXG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogX3NldFRvVmFyIC0gc2V0cyBhIGdsb2JhbGx5IHNjb3BlZCB1c2VyIGRlZmluZWQgdmFyaWFibGUgd2hvJ3MgbmFtZSBpcyBzcGVjaWZpZWQgYXMgYSBhIHN0cmluZ1xyXG4gICogd2l0aCB0aGUgdmFsdWUgcHJvdmlkZWQuXHJcbiAgKlxyXG4gICogQHByaXZhdGVcclxuICAqIEBwYXJhbSB7dmFyU3RyaW5nfSB0ZXh0IC0gdGhlIG5hbWUgb2YgdGhlIHZhcmlhYmxlIHRvIHdoaWNoIHZhbHVlIHNob3VsZCBiZSBzZXQuXHJcbiAgKiBAcGFyYW0ge2FueX0gdmFsdWUgLSB0aGUgdmFsdWUgdG8gc2V0LlxyXG4gICovXHJcbiAgX3NldFRvVmFyICh2YXJTdHJpbmcsIHZhbHVlKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBldmFsKGAke3ZhclN0cmluZ30gPSAnJHt2YWx1ZX0nYCkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1ldmFsXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICB0aHJvdyAoJ0Jsb2NrTGlrZS5qcyBFcnJvcjogVmFyaWFibGVzIGFjY2VwdGluZyBhIHZhbHVlIG11c3QgYmUgZGVjbGFyZWQgaW4gdGhlIGdsb2JhbCBzY29wZS4nKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXRocm93LWxpdGVyYWxcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogX2V4ZWMgLSBhc3luY2hyb25vdXMgZnVuY3Rpb24gZXhlY3V0aW9uLlxyXG4gICogVGhpcyBpcyB3aGF0IGNyZWF0ZXMgdGhlIFwicGFjZWRcIiBleGVjdXRpb24gb2YgdGhlIHVzZXIgc3VwcGxpZWQgZnVuY3Rpb25zLlxyXG4gICpcclxuICAqIEBwcml2YXRlXHJcbiAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jIC0gYSBmdW5jdGlvbiB0byByZXdyaXRlIGFuZCBleGVjdXRlLlxyXG4gICogQHBhcmFtIHthcnJheX0gYXJnc0FyciAtIGFuIGFycmF5IG9mIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBmdW5jdGlvbi5cclxuICAqL1xyXG4gIF9leGVjIChmdW5jLCBhcmdzQXJyKSB7XHJcbiAgICBjb25zdCBtZSA9IHRoaXNcclxuICAgIG1lLnRyaWdnZXJpbmdJZCA9IHRoaXMuX2dlbmVyYXRlVVVJRCgpXHJcbiAgICBjb25zdCBmID0gcmV3cml0ZShmdW5jLCBtZSlcclxuICAgIHJldHVybiBmLmFwcGx5KG1lLCBhcmdzQXJyKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBpbnZva2UgLSBpbnZva2UgYSBmdW5jdGlvbi4gQWxsb3dzIHBhc3NpbmcgYW4gYXJndW1lbnQgb3IgYXJyYXkgb2YgYXJndW1lbnRzLlxyXG4gICogRnVuY3Rpb24gd2lsbCBiZSBcInBhY2VkXCIgYW5kIGNvZGUgZXhlY3V0aW9uIHdpbGwgYmUgXCJ3YWl0ZWRcIiB1bnRpbCBpdCBpcyBjb21wbGV0ZWQuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIHNwcml0ZS53aGVuRmxhZygoKSA9PiB7XHJcbiAgKiAgIHRoaXMuaW52b2tlKGp1bXApO1xyXG4gICogICB0aGlzLmludm9rZSh0YWxrLCAnaGknKTtcclxuICAqICAgdGhpcy5pbnZva2UocGF0dGVybiwgWzUsIDUwLCAxMl0pO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyAtIGEgZnVuY3Rpb24gdG8gcmV3cml0ZSBhbmQgZXhlY3V0ZS5cclxuICAqIEBwYXJhbSB7YXJyYXl9IGFyZ3NBcnIgLSBhbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgZnVuY3Rpb24uIEEgc2luZ2xlIHZhcmlhYmxlIGFsc28gYWNjZXB0ZWQuXHJcbiAgKi9cclxuICBpbnZva2UgKGZ1bmMsIGFyZ3NBcnIsIHRoZVZhciA9IG51bGwsIHRyaWdnZXJpbmdJZCA9IG51bGwpIHtcclxuICAgIC8vIHRoZVZhciBhbmQgdHJpZ2dlcmluZ0lkIGFyZSBub3QgdXNlciBzdXBwbGllZCwgdGhleSBhcmUgaW5zZXJ0ZWQgYnkgcmV3cml0ZXIuXHJcbiAgICBsZXQgYXJncyA9IGFyZ3NBcnJcclxuICAgICEoYXJnc0FyciBpbnN0YW5jZW9mIEFycmF5KSA/IGFyZ3MgPSBbYXJnc0Fycl0gOiBudWxsXHJcblxyXG4gICAgdGhpcy5fZXhlYyhmdW5jLCBhcmdzKS50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgLy8gdGhpcyBpcyB0aGUgd2FpdGVkIG1ldGhvZCBsaXN0ZW5lci4gcmVsZWFzZSBpdC5cclxuICAgICAgdGhpcy5fcmVsZWFzZVdhaXRlZCh0cmlnZ2VyaW5nSWQpXHJcbiAgICAgIC8vIHNldCB0aGUgdXNlciBkZWZpbmVkIHZhcmlhYmxlIHRvIHRoZSBjYXB0dXJlZCB2YWx1ZS5cclxuICAgICAgdGhlVmFyID8gdGhpcy5fc2V0VG9WYXIodGhlVmFyLCByZXN1bHQpIDogbnVsbFxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogd2FpdCAtIGNyZWF0ZXMgYSBwYXVzZSBpbiBleGVjdXRpb24uXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIHRoaXMud2FpdCg1KTtcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHRpbWUgPSA1O1xyXG4gICogdGhpcy53YWl0KHRpbWUgKiAwLjk1KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gc2VjIC0gbnVtYmVyIG9mIHNlY29uZHMgdG8gd2FpdC4gTXVzdCBiZSBhbiBhY3R1YWwgbnVtYmVyLlxyXG4gICovXHJcbiAgd2FpdCAoc2VjLCB0cmlnZ2VyaW5nSWQgPSBudWxsKSB7XHJcbiAgICAvLyB0cmlnZ2VyaW5nSWQgaXMgbm90IHVzZXIgc3VwcGxpZWQsIGl0IGlzIGluc2VydGVkIGJ5IHJld3JpdGVyLlxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuX3JlbGVhc2VXYWl0ZWQodHJpZ2dlcmluZ0lkKVxyXG4gICAgfSwgc2VjICogMTAwMClcclxuICB9XHJcblxyXG4gIC8qKiBFdmVudHMgKiAqL1xyXG5cclxuICAvKipcclxuICAqIHdoZW5Mb2FkZWQgLSBpbnZva2UgdXNlciBzdXBwbGllZCBmdW5jdGlvbi5cclxuICAqIFRvIGJlIHVzZWQgd2l0aCBjb2RlIHRoYXQgbmVlZHMgdG8gcnVuIG9ubG9hZC5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuTG9hZGVkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5zYXkoJ0kgYW0gYWxpdmUnKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgLSBhIGZ1bmN0aW9uIHRvIHJld3JpdGUgYW5kIGV4ZWN1dGUuXHJcbiAgKi9cclxuICB3aGVuTG9hZGVkIChmdW5jKSB7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5fZXhlYyhmdW5jLCBbXSlcclxuICAgIH0sIDApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHdoZW5GbGFnIC0gYWRkcyBhIGZsYWcgdG8gY292ZXIgdGhlIHN0YWdlIHdpdGggYW4gZXZlbnQgbGlzdGVuZXIgYXR0YWNoZWQuXHJcbiAgKiBXaGVuIHRyaWdnZXJlZCB3aWxsIHJlbW92ZSB0aGUgZmxhZyBkaXYgYW5kIGludm9rZSB1c2VyIHN1cHBsaWVkIGZ1bmN0aW9uLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5GbGFnKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5zYXkoJ0kgYW0gYWxpdmUnKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgLSBhIGZ1bmN0aW9uIHRvIHJld3JpdGUgYW5kIGV4ZWN1dGUuXHJcbiAgKi9cclxuICB3aGVuRmxhZyAoZnVuYykge1xyXG4gICAgY29uc3QgbWUgPSB0aGlzXHJcblxyXG4gICAgaWYgKG1lLmVsZW1lbnQpIHtcclxuICAgICAgbWUuZWxlbWVudC5hZGRGbGFnKHRoaXMpXHJcblxyXG4gICAgICB0aGlzLmVsZW1lbnQuZmxhZy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgICAgbWUuZWxlbWVudC5yZW1vdmVGbGFnKG1lKVxyXG4gICAgICAgIG1lLl9leGVjKGZ1bmMsIFtlXSlcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHdoZW5DbGlja2VkIC0gYWRkcyBhIGNsaWNrIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBzcHJpdGUgb3Igc3RhZ2UuXHJcbiAgKiBXaGVuIHRyaWdnZXJlZCB3aWxsIGludm9rZSB1c2VyIHN1cHBsaWVkIGZ1bmN0aW9uLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5zYXkoJ0kgYW0gYWxpdmUnKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgLSBhIGZ1bmN0aW9uIHRvIHJld3JpdGUgYW5kIGV4ZWN1dGUuXHJcbiAgKi9cclxuICB3aGVuQ2xpY2tlZCAoZnVuYykge1xyXG4gICAgY29uc3QgbWUgPSB0aGlzXHJcblxyXG4gICAgaWYgKG1lLmVsZW1lbnQpIHtcclxuICAgICAgdGhpcy5lbGVtZW50LmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgICBtZS5fZXhlYyhmdW5jLCBbZV0pXHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiB3aGVuS2V5UHJlc3NlZCAtIGFkZHMgYSBrZXlwcmVzcyBldmVudCBsaXN0ZW5lciB0byBkb2N1bWVudC5cclxuICAqIFdoZW4gdHJpZ2dlcmVkIHdpbGwgaW52b2tlIHVzZXIgc3VwcGxpZWQgZnVuY3Rpb24uXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbktleVByZXNzZWQoJyAnLCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5zYXkoJ1NwYWNlcHJlc3NlZCcpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHVzZXJLZXkgLSB0aGUga2V5IHByZXNzZWQuIG1heSBiZSB0aGUgY29kZSBvciB0aGUgY2hhcmFjdGVyIGl0c2VsZiAoQSBvciA2NSlcclxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgLSBhIGZ1bmN0aW9uIHRvIHJld3JpdGUgYW5kIGV4ZWN1dGUuXHJcbiAgKi9cclxuICB3aGVuS2V5UHJlc3NlZCAodXNlcktleSwgZnVuYykge1xyXG4gICAgY29uc3QgbWUgPSB0aGlzXHJcbiAgICBsZXQgY2hlY2tcclxuICAgIHR5cGVvZiB1c2VyS2V5ID09PSAnc3RyaW5nJyA/IGNoZWNrID0gdXNlcktleS50b0xvd2VyQ2FzZSgpIDogY2hlY2sgPSB1c2VyS2V5XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgIGxldCBtYXRjaCA9IGZhbHNlXHJcbiAgICAgIC8vIE1ha2Ugc3VyZSBlYWNoIHByb3BlcnR5IGlzIHN1cHBvcnRlZCBieSBicm93c2Vycy5cclxuICAgICAgLy8gTm90ZTogdXNlciBtYXkgd3JpdGUgaW5jb21wYXRpYmxlIGNvZGUuXHJcbiAgICAgIGUuY29kZSAmJiBlLmNvZGUudG9Mb3dlckNhc2UoKSA9PT0gY2hlY2sgPyBtYXRjaCA9IHRydWUgOiBudWxsXHJcbiAgICAgIGUua2V5ICYmIGUua2V5LnRvTG93ZXJDYXNlKCkgPT09IGNoZWNrID8gbWF0Y2ggPSB0cnVlIDogbnVsbFxyXG4gICAgICBlLmtleUNvZGUgPT09IGNoZWNrID8gbWF0Y2ggPSB0cnVlIDogbnVsbFxyXG4gICAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICBtZS5fZXhlYyhmdW5jLCBbZV0pXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHdoZW5FdmVudCAtIGFkZHMgdGhlIHNwZWNpZmllZCBldmVudCBsaXN0ZW5lciB0byBzcHJpdGUvc3RhZ2UuXHJcbiAgKiBXaGVuIHRyaWdnZXJlZCB3aWxsIGludm9rZSB1c2VyIHN1cHBsaWVkIGZ1bmN0aW9uLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5FdmVudCgnbW91c2VvdmVyJywgKGUpID0+IHtcclxuICAqICAgY29uc29sZS5sb2coZSk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRTdHIgLSB0aGUgbmFtZWQgZXZlbnQgKG1vc2Vtb3ZlIGV0Yy4pLlxyXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyAtIGEgZnVuY3Rpb24gdG8gcmV3cml0ZSBhbmQgZXhlY3V0ZS5cclxuICAqL1xyXG4gIHdoZW5FdmVudCAoZXZlbnRTdHIsIGZ1bmMpIHtcclxuICAgIGNvbnN0IG1lID0gdGhpc1xyXG5cclxuICAgIGlmIChtZS5lbGVtZW50KSB7XHJcbiAgICAgIGxldCBhdHRhY2hUbyA9IHRoaXMuZWxlbWVudC5lbFxyXG4gICAgICBsZXQgb3B0aW9ucyA9IHt9XHJcbiAgICAgICdrZXlkb3dufGtleXVwfGtleXByZXNzJy5pbmRleE9mKGV2ZW50U3RyKSAhPT0gLTEgPyBhdHRhY2hUbyA9IGRvY3VtZW50IDogbnVsbFxyXG4gICAgICAndG91Y2hzdGFydHx0b3VjaG1vdmUnLmluZGV4T2YoZXZlbnRTdHIpICE9PSAtMSA/IG9wdGlvbnMgPSB7IHBhc3NpdmU6IHRydWUgfSA6IG51bGxcclxuXHJcbiAgICAgIGF0dGFjaFRvLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRTdHIsIChlKSA9PiB7XHJcbiAgICAgICAgbWUuX2V4ZWMoZnVuYywgW2VdKVxyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgfSwgb3B0aW9ucylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogd2hlblJlY2VpdmVNZXNzYWdlIC0gYWRkcyB0aGUgc3BlY2lmaWVkIGV2ZW50IGxpc3RlbmVyIHRvIGRvY3VtZW50LlxyXG4gICogV2hlbiB0cmlnZ2VyZWQgd2lsbCBpbnZva2UgdXNlciBzdXBwbGllZCBmdW5jdGlvbi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuUmVjZWl2ZU1lc3NhZ2UoJ21vdmUnLCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5tb3ZlKC0xMCk7XHJcbiAgKiB9KVxyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSBtc2cgLSB0aGUgbmFtZWQgbWVzc2FnZSAoZXZlbnQpO1xyXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyAtIGEgZnVuY3Rpb24gdG8gcmV3cml0ZSBhbmQgZXhlY3V0ZS5cclxuICAqL1xyXG4gIHdoZW5SZWNlaXZlTWVzc2FnZSAobXNnLCBmdW5jKSB7XHJcbiAgICBjb25zdCBsaXN0ZW5lcklkID0gdGhpcy5fZ2VuZXJhdGVVVUlEKClcclxuICAgIC8vIHJlZ2lzdGVyIGFzIGEgbWVzc2FnZSBsaXN0ZW5lci5cclxuICAgIEVudGl0eS5tZXNzYWdlTGlzdGVuZXJzLnB1c2goeyBtc2csIGxpc3RlbmVySWQgfSlcclxuXHJcbiAgICAvLyBsaXN0ZW4gdG8gc3BlY2lmaWVkIG1lc3NhZ2VcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIobXNnLCAoZSkgPT4ge1xyXG4gICAgICAvLyBleGVjdXRlIHRoZSBmdW5jIGFuZCB0aGVuXHJcbiAgICAgIHRoaXMuX2V4ZWMoZnVuYywgW2VdKS50aGVuKCgpID0+IHtcclxuICAgICAgICAvLyBkaXNwYXRjaCBhbiBldmVudCB0aGF0IGlzIHVuaXF1ZSB0byB0aGUgbGlzdGVuZXIgYW5kIG1lc3NhZ2UgcmVjZWl2ZWQuXHJcbiAgICAgICAgY29uc3QgbXNnSWQgPSBlLmRldGFpbC5tc2dJZFxyXG4gICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IHdpbmRvdy5DdXN0b21FdmVudCgnYmxvY2tMaWtlLmRvbmV3aGVuZWVjZWl2ZW1lc3NhZ2UnLCB7IGRldGFpbDogeyBtc2dJZCwgbGlzdGVuZXJJZCB9IH0pXHJcblxyXG4gICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBicm9hZGNhc3RNZXNzYWdlIC0gZGlzcGF0Y2hlcyBhIGN1c3RvbSBldmVudCB0aGF0IGFjdHMgYXMgYSBnbG9iYWwgbWVzc2FnZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICpcclxuICAqIHN0YWdlLndoZW5DbGlja2VkKGZ1bmN0aW9uKCkge1xyXG4gICogIHN0YWdlLmJyb2FkY2FzdE1lc3NhZ2UoJ21vdmUnKVxyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IG1zZyAtIHRoZSBuYW1lZCBtZXNzYWdlIChldmVudClcclxuICAqL1xyXG4gIGJyb2FkY2FzdE1lc3NhZ2UgKG1zZykge1xyXG4gICAgY29uc3QgbXNnSWQgPSB0aGlzLl9nZW5lcmF0ZVVVSUQoKVxyXG4gICAgY29uc3QgZXZlbnQgPSBuZXcgd2luZG93LkN1c3RvbUV2ZW50KG1zZywgeyBkZXRhaWw6IHsgbXNnSWQgfSB9KVxyXG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogYnJvYWRjYXN0TWVzc2FnZVdhaXQgLSBkaXNwYXRjaGVzIGEgY3VzdG9tIGV2ZW50IHRoYXQgYWN0cyBhcyBhIGdsb2JhbCBtZXNzYWdlLlxyXG4gICogV2FpdHMgZm9yIGFsbCB3aGVuUmVjZWl2ZU1lc3NhZ2UgbGlzdGVuZXJzIHRvIGNvbXBsZXRlLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICpcclxuICAqIHNwcml0ZS53aGVuUmVjZWl2ZU1lc3NhZ2UoJ21vdmUnLCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5tb3ZlKC0xMCk7XHJcbiAgKiAgIHRoaXMud2FpdCg1KTtcclxuICAqIH0pXHJcbiAgKlxyXG4gICogc3RhZ2Uud2hlbkNsaWNrZWQoZnVuY3Rpb24oKSB7XHJcbiAgKiAgc3RhZ2UuYnJvYWRjYXN0TWVzc2FnZVdhaXQoJ21vdmUnKTtcclxuICAqICBzcHJpdGUuc2F5KCdBbGwgZG9uZScpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IG1zZyAtIHRoZSBuYW1lZCBtZXNzYWdlIChldmVudClcclxuICAqL1xyXG4gIGJyb2FkY2FzdE1lc3NhZ2VXYWl0IChtc2csIHRyaWdnZXJpbmdJZCA9IG51bGwpIHtcclxuICAgIC8vIHRyaWdnZXJpbmdJZCBpcyBub3QgdXNlciBzdXBwbGllZCwgaXQgaXMgaW5zZXJ0ZWQgYnkgcmV3cml0ZXIuXHJcbiAgICBjb25zdCBtZSA9IHRoaXNcclxuICAgIGNvbnN0IG1zZ0lkID0gdGhpcy5fZ2VuZXJhdGVVVUlEKClcclxuICAgIC8vIHNhdmUgcmVnaXN0ZXJlZCBsaXN0ZW5lcnMgZm9yIHRoaXMgYnJvYWRjYXN0LlxyXG4gICAgbGV0IG15TGlzdGVuZXJzID0gRW50aXR5Lm1lc3NhZ2VMaXN0ZW5lcnMuZmlsdGVyKChpdGVtKSA9PiBpdGVtLm1zZyA9PT0gbXNnKVxyXG4gICAgLy8gZGlzcGF0Y2ggdGhlIG1lc3NhZ2VcclxuICAgIGNvbnN0IGV2ZW50ID0gbmV3IHdpbmRvdy5DdXN0b21FdmVudChtc2csIHsgZGV0YWlsOiB7IG1zZ0lkIH0gfSlcclxuICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpXHJcblxyXG4gICAgLy8gbGlzdGVuIHRvIHRob3NlIHdobyByZWNlaXZlZCB0aGUgbWVzc2FnZVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYmxvY2tMaWtlLmRvbmV3aGVuZWVjZWl2ZW1lc3NhZ2UnLCBmdW5jdGlvbiBicm9hZGNhc3RNZXNzYWdlV2FpdExpc3RlbmVyIChlKSB7XHJcbiAgICAgIC8vIGlmIGV2ZW50IGlzIGZvciB0aGlzIG1lc3NhZ2UgcmVtb3ZlIGxpc3RlbmVySWQgZnJvbSBsaXN0IG9mIGxpc3RlbmVycy5cclxuICAgICAgKGUuZGV0YWlsLm1zZ0lkID09PSBtc2dJZCkgPyBteUxpc3RlbmVycyA9IG15TGlzdGVuZXJzLmZpbHRlcigoaXRlbSkgPT4gaXRlbS5saXN0ZW5lcklkICE9PSBlLmRldGFpbC5saXN0ZW5lcklkKSA6IG51bGxcclxuICAgICAgLy8gYWxsIGxpc3RlbmVycyByZXNwb25kZWQuXHJcbiAgICAgIGlmICghbXlMaXN0ZW5lcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lclxyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Jsb2NrTGlrZS5kb25ld2hlbmVlY2VpdmVtZXNzYWdlJywgYnJvYWRjYXN0TWVzc2FnZVdhaXRMaXN0ZW5lcilcclxuICAgICAgICAvLyByZWxlYXNlIHRoZSB3YWl0XHJcbiAgICAgICAgbWUuX3JlbGVhc2VXYWl0ZWQodHJpZ2dlcmluZ0lkKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqIFNvdW5kICogKi9cclxuXHJcbiAgLyoqXHJcbiAgKiBwbGF5U291bmQgLSBwbGF5cyBhIHNvdW5kIGZpbGUgKG1wMywgd2F2KVxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5wbGF5U291bmQoJy4uLy4uL3NvdW5kcy9ibGVhdC53YXYnKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSB0aGUgdXJsIG9mIHRoZSBmaWxlIHRvIHBsYXkuXHJcbiAgKi9cclxuICBwbGF5U291bmQgKHVybCkge1xyXG4gICAgY29uc3QgYXVkaW8gPSBuZXcgd2luZG93LkF1ZGlvKHVybClcclxuICAgIGF1ZGlvLnBsYXkoKVxyXG4gICAgdGhpcy5zb3VuZHMucHVzaChhdWRpbylcclxuICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnNvdW5kcyA9IHRoaXMuc291bmRzLmZpbHRlcigoaXRlbSkgPT4gaXRlbSAhPT0gYXVkaW8pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBwbGF5U291bmRMb29wIC0gcGxheXMgYSBzb3VuZCBmaWxlIChtcDMsIHdhdikgYWdhaW4gYW5kIGFnYWluXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnBsYXlTb3VuZExvb3AoJy4uLy4uL3NvdW5kcy9ibGVhdC53YXYnKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSB0aGUgdXJsIG9mIHRoZSBmaWxlIHRvIHBsYXkuXHJcbiAgKi9cclxuICBwbGF5U291bmRMb29wICh1cmwpIHtcclxuICAgIGNvbnN0IGF1ZGlvID0gbmV3IHdpbmRvdy5BdWRpbyh1cmwpXHJcbiAgICBhdWRpby5wbGF5KClcclxuICAgIHRoaXMuc291bmRzLnB1c2goYXVkaW8pXHJcbiAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsICgpID0+IHtcclxuICAgICAgYXVkaW8uY3VycmVudFRpbWUgPSAwXHJcbiAgICAgIGF1ZGlvLnBsYXkoKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogcGxheVNvdW5kVW50aWxEb25lIC0gcGxheXMgYSBzb3VuZCBmaWxlIChtcDMsIHdhdikgdW50aWwgZG9uZS5cclxuICAqIFRoaXMgaXMgc2ltaWxhciB0byBwbGF5U291bmQgYW5kIHdhaXQgZm9yIHRoZSBkdXJhdGlvbiBvZiB0aGUgc291bmQuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnBsYXlTb3VuZFVudGlsRG9uZSgnLi4vLi4vc291bmRzL2JsZWF0LndhdicpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIHRoZSB1cmwgb2YgdGhlIGZpbGUgdG8gcGxheS5cclxuICAqL1xyXG4gIHBsYXlTb3VuZFVudGlsRG9uZSAodXJsLCB0cmlnZ2VyaW5nSWQgPSBudWxsKSB7XHJcbiAgICAvLyB0cmlnZ2VyaW5nSWQgaXMgbm90IHVzZXIgc3VwcGxpZWQsIGl0IGlzIGluc2VydGVkIGJ5IHJld3JpdGVyLlxyXG4gICAgY29uc3QgYXVkaW8gPSBuZXcgd2luZG93LkF1ZGlvKHVybClcclxuICAgIGF1ZGlvLnBsYXkoKVxyXG4gICAgdGhpcy5zb3VuZHMucHVzaChhdWRpbylcclxuICAgIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnNvdW5kcyA9IHRoaXMuc291bmRzLmZpbHRlcigoaXRlbSkgPT4gaXRlbSAhPT0gYXVkaW8pXHJcbiAgICAgIHRoaXMuX3JlbGVhc2VXYWl0ZWQodHJpZ2dlcmluZ0lkKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc3RvcFNvdW5kcyAtIHN0b3BzIGFsbCBzb3VuZHMgcGxheWVkIGJ5IHNwcml0ZSBvciBzdGFnZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMucGxheVNvdW5kKCcuLi8uLi9zb3VuZHMvYmxlYXQud2F2Jyk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBzdGFnZS53aGVuS2V5UHJlc3NlZCgnRXNjYXBlJywgKCkgPT4ge1xyXG4gICogICB0aGlzLnN0b3BTb3VuZHMoKTtcclxuICAqIH0pO1xyXG4gICovXHJcbiAgc3RvcFNvdW5kcyAoKSB7XHJcbiAgICB0aGlzLnNvdW5kcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgIGl0ZW0ucGF1c2UoKVxyXG4gICAgfSlcclxuICAgIHRoaXMuc291bmRzID0gW11cclxuICB9XHJcblxyXG4gIC8qIGNzcyAqL1xyXG5cclxuICAvKipcclxuICAqIGNzcyAtIGFwcGxpZXMgYSBDU1MgcnVsZSB0byB0aGUgc3ByaXRlIGFuZCBhbGwgY29zdHVtZXMuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5jc3MoJ2JhY2tncm91bmQnLCAnIzAwMDBmZicpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wIC0gdGhlIGNzcyBwcm9wZXJ0eSAoZS5nLiBjb2xvcikuIEFsdGVybmF0aXZlbHkgYW4gb2JqZWN0IHdpdGgga2V5OiB2YWx1ZSBwYWlycy5cclxuICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIHRoZSB2YWx1ZSBmb3IgdGhlIGNzcyBwcm9wZXJ0eSAoZS5nLiAjZmY4ODMzKVxyXG4gICovXHJcbiAgY3NzIChwcm9wLCB2YWx1ZSA9IG51bGwpIHtcclxuICAgIGNzcy5yZWdpc3Rlcihwcm9wLCB2YWx1ZSwgdGhpcylcclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGFkZENsYXNzIC0gYWRkcyBhIGNzcyBjbGFzcyB0byBzcHJpdGUgYW5kIGFsbCBjb3N0dW1lcy5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZENsYXNzKCdyYWluYm93Jyk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSB0aGUgY3NzIGNsYXNzIG5hbWUgdG8gYWRkLlxyXG4gICovXHJcbiAgYWRkQ2xhc3MgKG5hbWUpIHtcclxuICAgICF0aGlzLmhhc0NsYXNzKG5hbWUpID8gdGhpcy5jbGFzc2VzLnB1c2gobmFtZSkgOiBudWxsXHJcbiAgICB0aGlzLmVsZW1lbnQgPyB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiByZW1vdmVDbGFzcyAtIHJlbW92ZXMgYSBjc3MgY2xhc3MgZnJvbSB0aGUgc3ByaXRlIGFuZCBhbGwgY29zdHVtZXMuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRDbGFzcygncmFpbmJvdycpO1xyXG4gICogc3ByaXRlLnJlbW92ZUNsYXNzKCdyYWluYm93Jyk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSB0aGUgY3NzIGNsYXNzIG5hbWUgdG8gcmVtb3ZlLlxyXG4gICovXHJcbiAgcmVtb3ZlQ2xhc3MgKG5hbWUpIHtcclxuICAgIHRoaXMuY2xhc3NlcyA9IHRoaXMuY2xhc3Nlcy5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gIT09IG5hbWUpXHJcbiAgICB0aGlzLmVsZW1lbnQgPyB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBoYXNDbGFzcyAtIGlzIHRoZSBjc3MgY2xhc3MgYXBwbGllZCB0byB0aGUgc3ByaXRlIGFuZCBhbGwgY29zdHVtZXMuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLmhhc0NsYXNzKCdyYWluYm93JykgPyB0aGlzLnJlbW92ZUNsYXNzKCdyYWluYm93JykgOiB0aGlzLmFkZENsYXNzKCdyYWluYm93Jyk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIHRoZSBjc3MgY2xhc3MgbmFtZS5cclxuICAqIEByZXR1cm4ge2Jvb2xlYW59IC0gaXMgdGhlIGNzcyBjbGFzcyBuYW1lIG9uIHRoZSBsaXN0LlxyXG4gICovXHJcbiAgaGFzQ2xhc3MgKG5hbWUpIHtcclxuICAgIHJldHVybiB0aGlzLmNsYXNzZXMuaW5kZXhPZihuYW1lKSAhPT0gLTFcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgY3NzIGZyb20gJy4vZWxlbWVudC1jc3MnXHJcblxyXG4vKipcclxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgbG9vay5cclxuICogQWJzdHJhY3QgZm9yIENvc3R1bWUgYW5kIEJhY2tkcm9wLlxyXG4gKiBEbyBub3QgaW5zdGFudGlhdGUgb2JqZWN0cyBkaXJlY3RseSBmcm9tIHRoaXMgY2xhc3MuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb29rIHtcclxuICAvKipcclxuICAqIGNvbnN0cnVjdG9yIC0gTG9vayBpcyBhYnN0cmFjdCBmb3IgQ29zdHVtZSBhbmQgQmFja2Ryb3AuXHJcbiAgKi9cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICB0aGlzLmNzc1J1bGVzID0gW11cclxuICAgIHRoaXMuY2xhc3NlcyA9IFtdXHJcbiAgfVxyXG5cclxuICAvKiogTG9va3MgKiAqL1xyXG5cclxuICAvKipcclxuICAqIGNzcyAtIGFwcGxpZXMgYSBDU1MgcnVsZSB0byBhIENvc3R1bWUgb3IgQmFja2Ryb3AuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBjb3N0dW1lID0gbmV3IGJsb2NrTGlrZS5Db3N0dW1lKCk7XHJcbiAgKlxyXG4gICogY29zdHVtZS5jc3MoJ2ZvbnQtc2l6ZScsICcxNnB4Jyk7XHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBiYWNrZHJvcCA9IG5ldyBibG9ja0xpa2UuQmFja2Ryb3AoKTtcclxuICAqXHJcbiAgKiBiYWNrZHJvcC5jc3MoJ2N1cnNvcicsICdwb2ludGVyJyk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHByb3AgLSB0aGUgY3NzIHByb3BlcnR5IChlLmcuIGNvbG9yKVxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gdGhlIHZhbHVlIGZvciB0aGUgY3NzIHByb3BlcnR5IChlLmcuICNmZjg4MzMpXHJcbiAgKi9cclxuICBjc3MgKHByb3AsIHZhbHVlID0gbnVsbCkge1xyXG4gICAgY3NzLnJlZ2lzdGVyKHByb3AsIHZhbHVlLCB0aGlzKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBhZGRDbGFzcyAtIGFkZHMgYSBjc3MgY2xhc3MgdG8gY29zdHVtZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IGNvc3R1bWUgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoKTtcclxuICAqXHJcbiAgKiBjb3N0dW1lLmFkZENsYXNzKCdyYWluYm93Jyk7XHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBiYWNrZHJvcCA9IG5ldyBibG9ja0xpa2UuQmFja2Ryb3AoKTtcclxuICAqXHJcbiAgKiBiYWNrZHJvcC5hZGRDbGFzcygncmFpbmJvdycpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gdGhlIGNzcyBjbGFzcyBuYW1lIHRvIGFkZC5cclxuICAqL1xyXG4gIGFkZENsYXNzIChuYW1lKSB7XHJcbiAgICAhdGhpcy5oYXNDbGFzcyhuYW1lKSA/IHRoaXMuY2xhc3Nlcy5wdXNoKG5hbWUpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiByZW1vdmVDbGFzcyAtIHJlbW92ZXMgYSBjc3MgY2xhc3MgZnJvbSB0aGUgY29zdHVtZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IGNvc3R1bWUgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoKTtcclxuICAqXHJcbiAgKiBjb3N0dW1lLmhhc0NsYXNzKCdyYWluYm93JykgPyBjb3N0dW1lLnJlbW92ZUNsYXNzKCdyYWluYm93JykgOiBjb3N0dW1lLmFkZENsYXNzKCdyYWluYm93Jyk7XHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBiYWNrZHJvcCA9IG5ldyBibG9ja0xpa2UuQmFja2Ryb3AoKTtcclxuICAqXHJcbiAgKiBiYWNrZHJvcC5oYXNDbGFzcygncmFpbmJvdycpID8gYmFja2Ryb3AucmVtb3ZlQ2xhc3MoJ3JhaW5ib3cnKSA6IGJhY2tkcm9wLmFkZENsYXNzKCdyYWluYm93Jyk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSB0aGUgY3NzIGNsYXNzIG5hbWUgdG8gcmVtb3ZlLlxyXG4gICovXHJcbiAgcmVtb3ZlQ2xhc3MgKG5hbWUpIHtcclxuICAgIHRoaXMuY2xhc3NlcyA9IHRoaXMuY2xhc3Nlcy5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gIT09IG5hbWUpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGhhc0NsYXNzIC0gaXMgdGhlIGNzcyBjbGFzcyBhcHBsaWVkIHRvIHRoZSBjb3N0dW1lLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgY29zdHVtZSA9IG5ldyBibG9ja0xpa2UuQ29zdHVtZSgpO1xyXG4gICpcclxuICAqIGNvc3R1bWUuaGFzQ2xhc3MoJ3JhaW5ib3cnKSA/IGNvc3R1bWUucmVtb3ZlQ2xhc3MoJ3JhaW5ib3cnKSA6IGNvc3R1bWUuYWRkQ2xhc3MoJ3JhaW5ib3cnKTtcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IGJhY2tkcm9wID0gbmV3IGJsb2NrTGlrZS5CYWNrZHJvcCgpO1xyXG4gICpcclxuICAqIGJhY2tkcm9wLmhhc0NsYXNzKCdyYWluYm93JykgPyBiYWNrZHJvcC5yZW1vdmVDbGFzcygncmFpbmJvdycpIDogYmFja2Ryb3AuYWRkQ2xhc3MoJ3JhaW5ib3cnKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIHRoZSBjc3MgY2xhc3MgbmFtZS5cclxuICAqIEByZXR1cm4ge2Jvb2xlYW59IC0gaXMgdGhlIGNzcyBjbGFzcyBuYW1lIG9uIHRoZSBsaXN0LlxyXG4gICovXHJcbiAgaGFzQ2xhc3MgKG5hbWUpIHtcclxuICAgIHJldHVybiB0aGlzLmNsYXNzZXMuaW5kZXhPZihuYW1lKSAhPT0gLTFcclxuICB9XHJcbn1cclxuIiwiLyoqXHJcbiogcGxhdGZvcm1zIC0gY29sbGVjdGlvbiBvZiB0aGluZ3MgdG8gZW5zdXJlIGl0IHBsYXlzIG5pY2VseSB3aXRoIGNvZGluZyBwbGF0Zm9ybXMuXHJcbiovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBsYXRmb3JtcyAoKSB7XHJcbiAgLyoqXHJcbiAgKiBjb2RlcGVuLmlvXHJcbiAgKiBQYWNlZCBhbmQgV2FpdGVkIG1ldGhvZHMgdHJpZ2dlciB0aGUgcHJvdGVjdGlvbiAtIGhlbmNlIHdlIHByb2xvbmcgaXQuXHJcbiAgKiBodHRwczovL2Jsb2cuY29kZXBlbi5pby8yMDE2LzA2LzA4L2Nhbi1hZGp1c3QtaW5maW5pdGUtbG9vcC1wcm90ZWN0aW9uLXRpbWluZy9cclxuICAqL1xyXG4gIGlmICh3aW5kb3cuQ1ApIHtcclxuICAgIHdpbmRvdy5DUC5QZW5UaW1lci5NQVhfVElNRV9JTl9MT09QX1dPX0VYSVQgPSA2MDAwMFxyXG4gIH1cclxufVxyXG4iLCIvKipcclxuKiBFbmNhcHN1bGF0ZXMgdGhlIGZ1bmN0aW9uYWxpdHkgb2YgcmV3cml0aW5nIHVzZXIgY29kZSB0byBhbGxvdyBmb3IgQmxvY2tMaWtlLmpzIGZlYXR1cmVzLlxyXG4qL1xyXG5cclxuLyoqXHJcbiogY291bnRDaGFyIC0gY291bnQgaG93IG1hbnkgdGltZXMgYSBnaXZlbiBjaGFyYWN0ZXIgKG9yIHN0cmluZykgYXBwZWFycyBpbiBhbm90aGVyIHN0cmluZy5cclxuKiBoZWxwZXIgZm9yIGV2ZW50ZWQgc2tpcHBpbmcgYW5kIG1ldGhvZCByZXdyaXRpbmcuXHJcbipcclxuKiBAcGFyYW0ge3N0cmluZ30gc3RyIC0gYSBsaW5lIG9mIGNvZGUuXHJcbiogQHBhcmFtIHtzdHJpbmd9IGNoYXIgLSBhIHN0cmluZyB0byBsb29rIGZvci5cclxuKlxyXG4qIEByZXR1cm4ge251bWJlcn0gLSB0aGUgbnVtYmVyIG9mIHRpbWVzIGZvdW5kLlxyXG4qL1xyXG5mdW5jdGlvbiBjb3VudENoYXIgKHN0ciwgY2hhcikge1xyXG4gIGNvbnN0IHJlZ0V4cCA9IG5ldyBSZWdFeHAoYFxcXFwke2NoYXJ9YCwgJ2cnKVxyXG4gIHJldHVybiAoc3RyLm1hdGNoKHJlZ0V4cCkgfHwgW10pLmxlbmd0aFxyXG59XHJcblxyXG4vKipcclxuKiByZXBsYWNlVXNlclN0cmluZ1dpdGhCbGFua3MgLSBmb3IgYSBnaXZlbiBsaW5lIG9mIGNvZGUsIHJlcGxhY2VzIGFsbCBvY2N1cnJlbmNlcyBvZlxyXG4qIHVzZXIgcHJvdmlkZWQgc3RyaW5ncyB3aXRoIGEgc2VxdWVuY2Ugb2Ygc3BhY2VzIG9mIHRoZSBzYW1lIGxlbmd0aC5cclxuKiBoZWxwZXIgZm9yIGV2ZW50ZWQgc2tpcHBpbmcgYW5kIG1ldGhvZCByZXdyaXRpbmcuXHJcbipcclxuKiBAcGFyYW0ge3N0cmluZ30gbGluZSAtIGEgbGluZSBvZiBjb2RlLlxyXG4qIEByZXR1cm4ge3N0cmluZ30gLSB0aGUgbGluZSB3aXRob3V0IHN0cmluZ3MuXHJcbiovXHJcbmZ1bmN0aW9uIHJlcGxhY2VVc2VyU3RyaW5nV2l0aEJsYW5rcyAobGluZSkge1xyXG4gIHJldHVybiBsaW5lLnJlcGxhY2UoL1wiKC4qPylcInwnKC4qPyknfGAoLio/KWAvZywgJyAnKVxyXG59XHJcblxyXG4vKipcclxuKiBpc01ldGhvZEluU3RyaW5nIC0gY2hlY2tzIGEgc3RyaW5nIGFnYWluc3QgYW4gYXJyYXkgb2YgbWV0aG9kIG5hbWVzLlxyXG4qXHJcbiogQHBhcmFtIHtzdHJpbmd9IHN0ciAtIGEgbGluZSBvZiBjb2RlLlxyXG4qIEBwYXJhbSB7QXJyYXl9IGFyciAtIGFuIGFycmF5IG9mIG1ldGhvZCBuYW1lcy5cclxuKlxyXG4qIEByZXR1cm4ge2Jvb2xlYW59IC0gaXMgdGhlIG1ldGhvZCBpbiB0aGUgc3RyaW5nLlxyXG4qL1xyXG5mdW5jdGlvbiBpc01ldGhvZEluU3RyaW5nIChhcnIsIHN0cikge1xyXG4gIHJldHVybiAoYXJyLnNvbWUoKG1ldGhvZCkgPT4gc3RyLmluZGV4T2YoYC4ke21ldGhvZH0oYCkgIT09IC0xKSlcclxufVxyXG5cclxuLyoqXHJcbiogaXNQYWNlZCAtIGNoZWNrcyBpZiBhIGxpbmUgb2YgY29kZSBpbmNsdWRlcyBhIHBhY2VkIG1ldGhvZC5cclxuKlxyXG4qIEBwYXJhbSB7c3RyaW5nfSBpdGVtIC0gYSBsaW5lIG9mIGNvZGUuXHJcbiogQHBhcmFtIHtlbnRpdHl9IGVudGl0eSAtIHRoZSBlbnRpdHkgdHJpZ2dlcmluZyB0aGUgbWV0aG9kLlxyXG4qXHJcbiogQHJldHVybiB7c3RyaW5nfSAtIGlzIHBhY2VkIGluIGNvZGUuXHJcbiovXHJcbmZ1bmN0aW9uIGlzUGFjZWQgKGl0ZW0sIGVudGl0eSkge1xyXG4gIHJldHVybiBpc01ldGhvZEluU3RyaW5nKGVudGl0eS5wYWNlZCwgaXRlbSlcclxufVxyXG5cclxuLyoqXHJcbiogaXNXYWl0ZWQgLSBjaGVja3MgaWYgYSBsaW5lIG9mIGNvZGUgaW5jbHVkZXMgYSB3YWl0ZWQgbWV0aG9kLlxyXG4qXHJcbiogQHBhcmFtIHtzdHJpbmd9IGl0ZW0gLSBhIGxpbmUgb2YgY29kZS5cclxuKiBAcGFyYW0ge2VudGl0eX0gZW50aXR5IC0gdGhlIGVudGl0eSB0cmlnZ2VyaW5nIHRoZSBtZXRob2QuXHJcbipcclxuKiBAcmV0dXJuIHtzdHJpbmd9IC0gaXMgd2FpdGVkIGluIGNvZGUuXHJcbiovXHJcbmZ1bmN0aW9uIGlzV2FpdGVkIChpdGVtLCBlbnRpdHkpIHtcclxuICByZXR1cm4gaXNNZXRob2RJblN0cmluZyhlbnRpdHkud2FpdGVkLCBpdGVtKVxyXG59XHJcblxyXG4vKipcclxuKiBpc0V2ZW50ZWQgLSBjaGVja3MgaWYgYSBsaW5lIG9mIGNvZGUgaW5jbHVkZXMgYW4gZXZlbnRlZCBtZXRob2QuXHJcbipcclxuKiBAcGFyYW0ge3N0cmluZ30gaXRlbSAtIGEgbGluZSBvZiBjb2RlLlxyXG4qIEBwYXJhbSB7ZW50aXR5fSBlbnRpdHkgLSB0aGUgZW50aXR5IHRyaWdnZXJpbmcgdGhlIG1ldGhvZC5cclxuKlxyXG4qIEByZXR1cm4ge3N0cmluZ30gLSBpcyBldmVudGVkIGluIGNvZGUuXHJcbiovXHJcbmZ1bmN0aW9uIGlzRXZlbnRlZCAoaXRlbSwgZW50aXR5KSB7XHJcbiAgcmV0dXJuIGlzTWV0aG9kSW5TdHJpbmcoZW50aXR5LmV2ZW50ZWQsIGl0ZW0pXHJcbn1cclxuXHJcbi8qKlxyXG4qIHdoaWNoV2FpdGVkUmV0dXJuIC0gY2hlY2tzIGlmIGEgbGluZSBvZiBjb2RlIGluY2x1ZGVzIGEgd2FpdGVkUmV0dXJuIG1ldGhvZC5cclxuKlxyXG4qIEBwYXJhbSB7c3RyaW5nfSBpdGVtIC0gYSBsaW5lIG9mIGNvZGUuXHJcbiogQHBhcmFtIHtlbnRpdHl9IGVudGl0eSAtIHRoZSBlbnRpdHkgdHJpZ2dlcmluZyB0aGUgbWV0aG9kLlxyXG4qXHJcbiogQHJldHVybiB7c3RyaW5nfSAtIHRoZSB3YWl0ZWRSZXR1cm4gbWV0aG9kIGZvdW5kIG9yIG51bGwuXHJcbiovXHJcbmZ1bmN0aW9uIHdoaWNoV2FpdGVkUmV0dXJuIChpdGVtLCBlbnRpdHkpIHtcclxuICByZXR1cm4gZW50aXR5LndhaXRlZFJldHVybmVkLmZpbmQoKG1ldGhvZCkgPT4gKGl0ZW0uaW5kZXhPZihgLiR7bWV0aG9kfShgKSAhPT0gLTEgPyBtZXRob2QgOiBmYWxzZSkpXHJcbn1cclxuXHJcbi8qKlxyXG4qIGluc2VydExvb3BQcm90ZWN0aW9uLSBpbnNlcnRzIGEgemVybyB0aW1lZCBhd2FpdCBsaW5lIGFmdGVyIGEgd2hpbGUgZGVjZWxlcmF0aW9uLlxyXG4qXHJcbiogQHBhcmFtIHtzdHJpbmd9IGl0ZW0gLSBhIGxpbmUgb2YgY29kZS5cclxuKiBAcGFyYW0ge2VudGl0eX0gZW50aXR5IC0gdGhlIGVudGl0eSB0cmlnZ2VyaW5nIHRoZSBtZXRob2QuXHJcbipcclxuKiBAcmV0dXJuIHtzdHJpbmd9IC0gYSBtb2RpZmllZCBsaW5lIG9mIGNvZGUuXHJcbiovXHJcbmZ1bmN0aW9uIGluc2VydExvb3BQcm90ZWN0aW9uIChpdGVtLCBlbnRpdHkpIHtcclxuICBjb25zdCBjaGVjayA9IGl0ZW0ucmVwbGFjZSgvXFxzKy9nLCAnJylcclxuXHJcbiAgY29uc3QgcmVnRXhwID0gL3doaWxlXFwoW1xcU10qXFwpe3xmb3JcXChbXFxTXSpcXCl7fGRvW1xcU10qey9cclxuICBjb25zdCBtYXRjaGVzID0gcmVnRXhwLmV4ZWMoY2hlY2spXHJcblxyXG4gIGNvbnN0IGNvZGUgPSBgJHtpdGVtfVxcbiBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMCkpO2BcclxuICByZXR1cm4gbWF0Y2hlcyA/IGNvZGUgOiBpdGVtXHJcbn1cclxuXHJcbi8qKlxyXG4qIGluc2VydFBhY2VkIC0gaW5zZXJ0cyBhIHRpbWVkIGF3YWl0IGxpbmUgYWZ0ZXIgYW55IG1ldGhvZCB0aGF0IGlzIG9uIHRoZSBsaXN0IG9mIHBhY2VkIG1ldGhvZHMuXHJcbipcclxuKiBAcGFyYW0ge3N0cmluZ30gaXRlbSAtIGEgbGluZSBvZiBjb2RlLlxyXG4qIEBwYXJhbSB7ZW50aXR5fSBlbnRpdHkgLSB0aGUgZW50aXR5IHRyaWdnZXJpbmcgdGhlIG1ldGhvZC5cclxuKlxyXG4qIEByZXR1cm4ge3N0cmluZ30gLSBhIG1vZGlmaWVkIGxpbmUgb2YgY29kZS5cclxuKi9cclxuZnVuY3Rpb24gaW5zZXJ0UGFjZWQgKGl0ZW0sIGVudGl0eSkge1xyXG4gIGNvbnN0IGNvZGUgPSBgJHtpdGVtfVxcbiBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgJHtlbnRpdHkucGFjZX0pKTtgXHJcbiAgcmV0dXJuIGVudGl0eS5wYWNlICYmIGlzUGFjZWQocmVwbGFjZVVzZXJTdHJpbmdXaXRoQmxhbmtzKGl0ZW0pLCBlbnRpdHkpID8gY29kZSA6IGl0ZW1cclxufVxyXG5cclxuLyoqXHJcbiogaW5zZXJ0V2FpdGVkIC0gaW5zZXJ0cyB0aGUgXCJtZWNoYW5pc21cIiB0aGF0IHN0b3BzIGV4ZWN1dGlvbiBhbmQgYXdhaXRzIGZvciB0aGUgbWV0aG9kIHRvIGZpbmlzaC5cclxuKlxyXG4qIEBwYXJhbSB7c3RyaW5nfSBpdGVtIC0gYSBsaW5lIG9mIGNvZGUuXHJcbiogQHBhcmFtIHtlbnRpdHl9IGVudGl0eSAtIHRoZSBlbnRpdHkgdHJpZ2dlcmluZyB0aGUgbWV0aG9kLlxyXG4qXHJcbiogQHJldHVybiB7c3RyaW5nfSAtIGEgbW9kaWZpZWQgKG11bHRpKWxpbmUgb2YgY29kZS5cclxuKi9cclxuZnVuY3Rpb24gaW5zZXJ0V2FpdGVkIChpdGVtLCBlbnRpdHkpIHtcclxuICBsZXQgZm91bmQgPSBudWxsXHJcbiAgbGV0IGNvZGVcclxuXHJcbiAgLy8gbG9vayBmb3Igd2FpdGVkIG1ldGhvZHMuXHJcbiAgZm91bmQgPSBpc1dhaXRlZChyZXBsYWNlVXNlclN0cmluZ1dpdGhCbGFua3MoaXRlbSksIGVudGl0eSlcclxuXHJcbiAgLy8gbm90IGEgbm9ybWFsIFwid2FpdGVkXCIuIGxvb2sgZm9yIHdhaXRlZFJldHVybmVkLlxyXG4gIGlmICghZm91bmQpIHtcclxuICAgIGxldCB0aGVWYXIgPSBudWxsXHJcblxyXG4gICAgZm91bmQgPSB3aGljaFdhaXRlZFJldHVybihyZXBsYWNlVXNlclN0cmluZ1dpdGhCbGFua3MoaXRlbSksIGVudGl0eSlcclxuXHJcbiAgICAvLyBjb2RlIGZvciB3YWl0ZWRSZXR1cm5cclxuICAgIHRoZVZhciA9IGl0ZW0uc3Vic3RyKDAsIGl0ZW0uaW5kZXhPZignPScpKVxyXG4gICAgICAucmVwbGFjZSgnbGV0JywgJycpXHJcbiAgICAgIC5yZXBsYWNlKCd2YXInLCAnJylcclxuICAgICAgLnJlcGxhY2UoJ2NvbnN0JywgJycpXHJcbiAgICAgIC50cmltKClcclxuXHJcbiAgICBjb2RlID0gYCR7aXRlbS5zdWJzdHJpbmcoMCwgaXRlbS5sYXN0SW5kZXhPZignKScpKX0sICcke3RoZVZhcn0nLCAnJHtlbnRpdHkudHJpZ2dlcmluZ0lkfScpYFxyXG5cclxuICAgIC8vIGludm9rZSBpcyBcImZvcmdpdmluZ1wiLiBtYXksIG9yIG1heSBub3QsIGhhdmUgdmFyaWFibGVzLlxyXG4gICAgZm91bmQgPT09ICdpbnZva2UnICYmIChpdGVtLmluZGV4T2YoJywnKSA9PT0gLTEpID8gY29kZSA9IGAke2l0ZW0uc3Vic3RyaW5nKDAsIGl0ZW0ubGFzdEluZGV4T2YoJyknKSl9LCBbXSwgJyR7dGhlVmFyfScsICcke2VudGl0eS50cmlnZ2VyaW5nSWR9JylgIDogbnVsbFxyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBjb2RlIGZvciBcIm5vcm1hbFwiIHdhaXRlZFxyXG4gICAgY29kZSA9IGAke2l0ZW0uc3Vic3RyaW5nKDAsIGl0ZW0ubGFzdEluZGV4T2YoJyknKSl9LCAnJHtlbnRpdHkudHJpZ2dlcmluZ0lkfScpYFxyXG4gIH1cclxuXHJcbiAgLy8gZW50aXR5LnRyaWdnZXJpbmdJZCBjcmVhdGVzIGEgdW5pcXVlIGNvbnRleHQgdG8gY2hhaW4gdGhlIHdhaXRlZCBtZXRob2RzLlxyXG4gIGNvZGUgPSBgJHtjb2RlfVxcbiBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYmxvY2tMaWtlLndhaXRlZC4ke2VudGl0eS50cmlnZ2VyaW5nSWR9JywgZnVuY3Rpb24gd2FpdGVkTGlzdGVuZXIoZSkge1xyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Jsb2NrTGlrZS53YWl0ZWQuJHtlbnRpdHkudHJpZ2dlcmluZ0lkfScsIHdhaXRlZExpc3RlbmVyKTtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7YFxyXG5cclxuICByZXR1cm4gZm91bmQgPyBjb2RlIDogaXRlbVxyXG59XHJcblxyXG4vKipcclxuKiBpbnNlcnRBc3luYyAtIEFkZHMga2V5d29yZCBhc3luYyB0byBmdW5jdGlvbiBkZWNlbGVyYXRpb24gaWYgbm90IHByZXNlbnRcclxuKiBXaWxsIGNhdGNoOlxyXG4qIC0gYWxsIG5hbWVkIGZ1bmN0aW9uIGRlY2VsZXJhdGlvbnMgd2l0aCBhIHNwYWNlIGFmdGVyIHRoZSBrZXl3b3JkICdmdW5jdGlvbidcclxuKiAtIGFueXRoaW5nIHRoYXQgaGFzIGEgZmF0IGFycm93IHdpdGggYW55IG9mIHNldmVyYWwgdmFyaWFibGUgcGF0dGVybnMgYmVmb3JlIGl0LlxyXG4qXHJcbiogQHBhcmFtIHtzdHJpbmd9IGl0ZW0gLSBhIGxpbmUgb2YgY29kZS5cclxuKiBAcmV0dXJuIHtzdHJpbmd9IC0gYSBtb2RpZmllZCBsaW5lIG9mIGNvZGUuXHJcbiovXHJcbmZ1bmN0aW9uIGluc2VydEFzeW5jIChpdGVtKSB7XHJcbiAgY29uc3QgZXhpc3QgPSBpdGVtLmluZGV4T2YoJ2FzeW5jICcpXHJcblxyXG4gIC8vIGZ1bmN0aW9uIGRlY2xhcmF0aW9uXHJcbiAgbGV0IHJlZ0V4cCA9IC9mdW5jdGlvbihcXHMqP1thLXpBLVpdXFx3Klxccyo/XFwofFxccyo/XFwoKS9cclxuICBsZXQgbWF0Y2hlcyA9IHJlZ0V4cC5leGVjKHJlcGxhY2VVc2VyU3RyaW5nV2l0aEJsYW5rcyhpdGVtKSlcclxuXHJcbiAgLy8gb3IgYXJyb3dcclxuICBpZiAoIW1hdGNoZXMpIHtcclxuICAgIHJlZ0V4cCA9IC8oW2EtekEtWl1cXHcqfFxcKFxccyo/W2EtekEtWl1cXHcqKCxcXHMqW2EtekEtWl1cXHcqKSpcXHMqP1xcKSlcXHMqPz0+L1xyXG4gICAgbWF0Y2hlcyA9IHJlZ0V4cC5leGVjKHJlcGxhY2VVc2VyU3RyaW5nV2l0aEJsYW5rcyhpdGVtKSlcclxuICB9XHJcblxyXG4gIHJldHVybiBleGlzdCA9PT0gLTEgJiYgbWF0Y2hlcyA/IGAke2l0ZW0uc3Vic3RyaW5nKDAsIG1hdGNoZXMuaW5kZXgpfWFzeW5jICR7aXRlbS5zdWJzdHJpbmcobWF0Y2hlcy5pbmRleCwgaXRlbS5sZW5ndGgpfWAgOiBpdGVtXHJcbn1cclxuXHJcbi8qKlxyXG4qIGVtcHR5TG9vcFByb3RlY3Rpb24gLSBleGFtaW5lcyB0aGUgY29kZSBmb3Igd2hpbGUgYW5kIGZvciBzdGF0ZW1lbnRzIHRoYXQgYXJlIGVtcHR5LlxyXG4qIE5vdGU6IHNpbmNlIHdoaWxlKHRydWUpe30gaXMgbGlrZWx5IHRvIGJlIGNvZGVkIGJ5IHRoZSB1c2VyIHRoaXMgcHJldmVudHMgaW5maW5pdGUgbG9vcHMuXHJcbipcclxuKiBAcGFyYW0ge3N0cmluZ30gaXRlbSAtIGEgbGluZSBvZiBjb2RlLlxyXG4qIEByZXR1cm4ge3N0cmluZ30gLSBhIG1vZGlmaWVkIGxpbmUgb2YgY29kZS5cclxuKi9cclxuZnVuY3Rpb24gZW1wdHlMb29wUHJvdGVjdGlvbiAoZnVuY1MpIHtcclxuICBjb25zdCBjaGVjayA9IGZ1bmNTLnJlcGxhY2UoL1xccysvZywgJycpLnJlcGxhY2UoL1xccj9cXG58XFxyL2csICcnKVxyXG5cclxuICBjb25zdCByZWdFeHAgPSAvd2hpbGVcXChbXFxzXFxTXSpcXCl7fXxmb3JcXChbXFxzXFxTXSpcXCl7fXxkb3t9d2hpbGVcXChbXFxzXFxTXSpcXCkvXHJcbiAgY29uc3QgbWF0Y2hlcyA9IHJlZ0V4cC5leGVjKGNoZWNrKVxyXG5cclxuICByZXR1cm4gISFtYXRjaGVzXHJcbn1cclxuXHJcbi8qKlxyXG4qIHJlbW92ZU91dGVyIC0gUmVtb3ZlcyB0aGUgb3V0ZXIgZnVuY3Rpb24gZGVmaW5pdGlvbiBhbmQgcmV0dXJucyB0aGUgZnVuY3Rpb24gY29kZSBib2R5LlxyXG4qXHJcbiogQHBhcmFtIHtzdHJpbmd9IGZ1bmNTIC0gdGhlIGZ1bmN0aW9uIGJlaW5nIHJld3JpdHRlbi5cclxuKiBAcmV0dXJuIHtzdHJpbmd9IC0gdGhlIGJvZHkgb2YgdGhlIGZ1bmN0aW9uLlxyXG4qL1xyXG5mdW5jdGlvbiByZW1vdmVPdXRlciAoZnVuY1MpIHtcclxuICByZXR1cm4gZnVuY1Muc3Vic3RyaW5nKGZ1bmNTLmluZGV4T2YoJ3snKSArIDEsIGZ1bmNTLmxhc3RJbmRleE9mKCd9JykpXHJcbn1cclxuXHJcbi8qKlxyXG4qIHJlbW92ZUNvbW1lbnRzIC0gUmVtb3ZlcyBjb21tZW50cyBmcm9tIGNvZGUuXHJcbiogZnJvbTogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE1MTIzNzc3XHJcbipcclxuKiBAcGFyYW0ge3N0cmluZ30gZnVuY1MgLSB0aGUgZnVuY3Rpb24gYmVpbmcgcmV3cml0dGVuLlxyXG4qIEByZXR1cm4ge3N0cmluZ30gLSB0aGUgZnVuY3Rpb24gd2l0aG91dCBjb21tZW50cy5cclxuKi9cclxuZnVuY3Rpb24gcmVtb3ZlQ29tbWVudHMgKGZ1bmNTKSB7XHJcbiAgcmV0dXJuIGZ1bmNTLnJlcGxhY2UoL1xcL1xcKltcXHNcXFNdKj9cXCpcXC98KFteXFxcXDpdfF4pXFwvXFwvLiokL2dtLCAobWF0Y2gsIHAxKSA9PiB7XHJcbiAgICAvLyBJZiB0aGlzIGlzIGEgJy8vJyBjb21tZW50IGFuZCBpdCBoYXMgYSBwcmVjZWRpbmcgY2hhcmFjdGVyXHJcbiAgICBpZiAocDEgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAvLyByZXR1cm4gdGhlIHByZWNlZGluZyBjaGFyYWN0ZXJcclxuICAgICAgcmV0dXJuIHAxXHJcbiAgICB9XHJcbiAgICAvLyBJZiBpdCdzIGEgJy8qICovJyBjb21tZW50IG9yIGEgJy8vJyBjb21tZW50IGF0IHRoZSBzdGFydCBvZiBhIGxpbmUsIHJlbW92ZSBpdFxyXG4gICAgcmV0dXJuICcnXHJcbiAgfSlcclxufVxyXG5cclxuLyoqXHJcbiogZ2V0RXZlbnRPYmplY3RWYXJOYW1lIC0gZXh0cmFjdHMgdGhlIHZhcmlhYmxlIG5hbWUgdGhhdCBob2xkcyB0aGUgZXZlbnQgb2JqZWN0LlxyXG4qXHJcbiogQHBhcmFtIHtzdHJpbmd9IGZ1bmNTIC0gdGhlIGZ1bmN0aW9uIGJlaW5nIHJld3JpdHRlbi5cclxuKiBAcmV0dXJuIHtzdHJpbmd9IC0gdGhlIHZhcmlhYmxlIG5hbWUuXHJcbiovXHJcbmZ1bmN0aW9uIGdldEV2ZW50T2JqZWN0VmFyTmFtZSAoZnVuY1MpIHtcclxuICByZXR1cm4gZnVuY1Muc3Vic3RyaW5nKGZ1bmNTLmluZGV4T2YoJygnKSArIDEsIGZ1bmNTLmluZGV4T2YoJyknKSlcclxufVxyXG5cclxuZnVuY3Rpb24gaW5zZXJ0R2FtZXBhZEV2ZW50TGlzdGVuZXJBc3luYyAoaXRlbSkge1xyXG4gIHJldHVybiBpdGVtLnJlcGxhY2UoL2FkZEV2ZW50TGlzdGVuZXJcXCgoW14sXSspLFxccypcXChcXHMqKFteKV0qKVxccypcXClcXHMqPT5cXHMqXFx7L2csIGZ1bmN0aW9uIChtYXRjaCwgZXZlbnQsIGFyZ3MpIHtcclxuICAgIC8vIFdyYXAgdGhlIG9yaWdpbmFsIGJvZHkgaW4gYW4gYXN5bmMgYXJyb3cgZnVuY3Rpb25cclxuICAgIHJldHVybiBgYWRkRXZlbnRMaXN0ZW5lcigke2V2ZW50fSwgYXN5bmMgKCR7YXJnc30pID0+IHtgXHJcbiAgfSlcclxufVxyXG5cclxuLyoqXHJcbiogcmV3cml0ZSAtIHJld3JpdGVzIGEgZnVuY3Rpb24gdG8gYW4gYXN5bmMgdmVyc2lvbiB0aGF0IGlzIFwicGFjZWRcIiB1c2luZyBhd2FpdGluZyBmb3IgcHJvbWlzZXMuXHJcbiogVGhpcyBhbGxvd3MgdGhlIHVzZXIgdG8gd3JpdGUgc2VxdWVudGlhbCBzaW1wbGUgY29kZSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgaW4gYSBwYWNlZCBtYW5uZXIuXHJcbipcclxuKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jIC0gYSBmdW5jdGlvbiB0byByZXdyaXRlXHJcbiogQHBhcmFtIC0ge09iamVjdH0gZW50aXR5IC0gYSBzcHJpdGUgb3Igc3RhZ2Ugb2JqZWN0IHRvIHdoaWNoIHRoZSBmdW5jdGlvbiBhcHBsaWVzLlxyXG4qIEByZXR1cm4ge2Z1bmN0aW9ufSAtIGFuIGFzeW5jIG1vZGlmaWVkIGZ1bmN0aW9uLlxyXG4qL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXdyaXRlIChmdW5jLCBlbnRpdHkpIHtcclxuICBsZXQgY29kZSA9IGZ1bmMudG9TdHJpbmcoKVxyXG4gIGNvbnN0IHRoZVZhciA9IGdldEV2ZW50T2JqZWN0VmFyTmFtZShjb2RlKVxyXG5cclxuICAvLyByZXdyaXRlIHRoZSBjb2RlXHJcbiAgaWYgKGVtcHR5TG9vcFByb3RlY3Rpb24oY29kZSkpIHtcclxuICAgIGNvZGUgPSAndGhyb3cgXFwnQmxvY2tMaWtlLmpzIEVycm9yOiBFbXB0eSBsb29wIGRldGVjdGVkXFwnOydcclxuICB9IGVsc2Uge1xyXG4gICAgY29kZSA9IHJlbW92ZUNvbW1lbnRzKHJlbW92ZU91dGVyKGNvZGUpKVxyXG4gICAgY29kZSA9IGNvZGUuc3BsaXQoJ1xcbicpLmZpbHRlcigoaXRlbSkgPT4gaXRlbS50cmltKCkubGVuZ3RoICE9PSAwKVxyXG5cclxuICAgIC8vIGNvdW50ZXIgZm9yIG9wZW4gcGFyZW50aGVzZXMuXHJcbiAgICBsZXQgZXZlbnRlZE9wZW5QYXJlbiA9IDBcclxuICAgIC8vIGxldCBoYXNQYWNlZENvZGUgPSBmYWxzZVxyXG5cclxuICAgIGNvZGUgPSBjb2RlLm1hcCgoaXRlbSkgPT4ge1xyXG4gICAgICBjb25zdCB0ZW1wID0gaXRlbVxyXG4gICAgICBsZXQgcmVzdWx0ID0gdGVtcFxyXG5cclxuICAgICAgLy8gaW50ZXJuYWwgZXZlbnRlZCBtZXRob2RzIGFyZSBza2lwcGVkXHJcbiAgICAgIGlmICgoaXNFdmVudGVkKHRlbXAsIGVudGl0eSkgJiYgIXRlbXAuaW5jbHVkZXMoJ2FkZEV2ZW50TGlzdGVuZXInKSkgfHwgZXZlbnRlZE9wZW5QYXJlbikge1xyXG4gICAgICAgIGV2ZW50ZWRPcGVuUGFyZW4gKz0gKGNvdW50Q2hhcihyZXBsYWNlVXNlclN0cmluZ1dpdGhCbGFua3ModGVtcCksICcoJykgLSBjb3VudENoYXIocmVwbGFjZVVzZXJTdHJpbmdXaXRoQmxhbmtzKHRlbXApLCAnKScpKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIChpc1BhY2VkKHRlbXAsIGVudGl0eSkpIGhhc1BhY2VkQ29kZSA9IHRydWVcclxuICAgICAgICAvLyBhIG1ldGhvZCBjYW4gYmUgb25lIG9mIHRoZSBmb2xsb3dpbmcgYnV0IG5vdCBtb3JlIHRoYW4gb25lXHJcbiAgICAgICAgcmVzdWx0ID09PSB0ZW1wID8gcmVzdWx0ID0gaW5zZXJ0UGFjZWQodGVtcCwgZW50aXR5KSA6IG51bGwgLy8gbW9yZSBsaWtlbHlcclxuICAgICAgICByZXN1bHQgPT09IHRlbXAgPyByZXN1bHQgPSBpbnNlcnRXYWl0ZWQodGVtcCwgZW50aXR5KSA6IG51bGwgLy8gbGVzcyBsaWtlbHlcclxuXHJcbiAgICAgICAgLy8gYW5kIG9ubHkgaWYgbm90IGEgbWV0aG9kIHdpbGwgYWRkIGFzeW5jIHRvIGZ1bmN0aW9uc1xyXG4gICAgICAgIHJlc3VsdCA9PT0gdGVtcCA/IHJlc3VsdCA9IGluc2VydEFzeW5jKHRlbXApIDogbnVsbFxyXG4gICAgICAgIHJlc3VsdCA9PT0gdGVtcCA/IHJlc3VsdCA9IGluc2VydEdhbWVwYWRFdmVudExpc3RlbmVyQXN5bmModGVtcCkgOiBudWxsXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGluc2VydCBhIHBhY2VkIHByb21pc2UgcmVzb2x2ZSBhdCB0aGUgc3RhcnQgb2YgYSBsb29wIGJsb2NrICh1bmRlciBjZXJ0YWluIGNvbmRpdGlvbnMpXHJcbiAgICAgIC8vIHRoaXMgY2F1c2VzIHRoZSBjb2RlIHRvIHNraXAgYW4gZXZlbnQgbG9vcCBhbmQgcHJldmVudHMgZW5kbGVzcyBsb29wc1xyXG4gICAgICByZXN1bHQgPSBpbnNlcnRMb29wUHJvdGVjdGlvbihyZXN1bHQsIGVudGl0eSlcclxuXHJcbiAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH0pXHJcblxyXG4gICAgY29kZSA9IGNvZGUuam9pbignXFxuJylcclxuICB9XHJcblxyXG4gIC8vIHRyYW5zZm9ybSB0aGUgdGV4dCBpbnRvIGEgZnVuY3Rpb25cclxuICBjb25zdCBBc3luY0Z1bmN0aW9uID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGFzeW5jICgpID0+IHt9KS5jb25zdHJ1Y3RvclxyXG4gIGxldCBhZiA9IG5ldyBBc3luY0Z1bmN0aW9uKGNvZGUpXHJcblxyXG4gIC8vIHBhc3MgdGhlIGV2ZW50IG9iamVjdCB0byB0aGUgZnVuY3Rpb24gaWYgZXhpc3RzLlxyXG4gIHRoZVZhciA/IGFmID0gbmV3IEFzeW5jRnVuY3Rpb24odGhlVmFyLCBjb2RlKSA6IG51bGxcclxuXHJcbiAgd2luZG93LmJsb2NrTGlrZSAmJiB3aW5kb3cuYmxvY2tMaWtlLmRlYnVnID8gY29uc29sZS5sb2coYWYpIDogbnVsbCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcclxuXHJcbiAgcmV0dXJuIGFmXHJcbn1cclxuIiwiaW1wb3J0ICogYXMgY3NzIGZyb20gJy4vZWxlbWVudC1jc3MnXHJcblxyXG4vKipcclxuICogQ2xhc3MgcmVwcmVzZW50aW5nIHRoZSBVSSBFbGVtZW50IG9mIHRoZSBzcHJpdGUuXHJcbiAqIEVhY2ggU3ByaXRlIGhhcyBvbmUuXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcHJpdGVFbGVtZW50IHtcclxuICAvKipcclxuICAqIGNvbnN0cnVjdG9yIC0gQ3JlYXRlcyBhIFNwcml0ZSBFbGVtZW50LlxyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzcHJpdGUgLSB0aGUgc3ByaXRlIGZvciB3aGljaCB0aGUgZWxlbWVudCBpcyBjcmVhdGVkLlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHN0YWdlIC0gdGhlIHN0YWdlIHRvIHdoaWNoIHRoZSBzcHJpdGUgaXMgYWRkZWQuXHJcbiAgKi9cclxuICBjb25zdHJ1Y3RvciAoc3ByaXRlLCBzdGFnZSkge1xyXG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG5cclxuICAgIGVsLmlkID0gYCR7c3ByaXRlLmlkfWBcclxuICAgIGVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgZWwuc3R5bGUudG91Y2hBY3Rpb24gPSAnbWFuaXB1bGF0aW9uJ1xyXG5cclxuICAgIHN0YWdlLmVsZW1lbnQuZWwuYXBwZW5kQ2hpbGQoZWwpXHJcblxyXG4gICAgdGhpcy5lbCA9IGVsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHVwZGF0ZSAtIHVwZGF0ZXMgdGhlIERPTSBlbGVtZW50LiBUaGlzIGlzIGFsd2F5cyBjYWxsZWQgYWZ0ZXIgdGhlIGNvbnN0cnVjdG9yLlxyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzcHJpdGUgLSB0aGUgc3ByaXRlIHRvIHVwZGF0ZS5cclxuICAqL1xyXG4gIHVwZGF0ZSAoc3ByaXRlKSB7XHJcbiAgICBjb25zdCBlbCA9IHNwcml0ZS5lbGVtZW50LmVsXHJcbiAgICAvLyBDb252ZXJ0IHRoZSBjZW50ZXIgYmFzZWQgeCBjb29yZGluYXRlIHRvIGEgbGVmdCBiYXNlZCBvbmUuXHJcbiAgICBjb25zdCB4ID0gc3ByaXRlLnggLSAoc3ByaXRlLndpZHRoIC8gMilcclxuICAgIC8vIENvbnZlcnQgdGhlIGNlbnRlciBiYXNlZCB5IGNvb3JkaW5hdGUgdG8gYSBsZWZ0IGJhc2VkIG9uZS5cclxuICAgIGNvbnN0IHkgPSAoc3ByaXRlLnkgKiAtMSkgLSAoc3ByaXRlLmhlaWdodCAvIDIpXHJcblxyXG4gICAgLy8gQ29zdHVtZVxyXG4gICAgaWYgKHNwcml0ZS5jb3N0dW1lKSB7XHJcbiAgICAgIGVsLnN0eWxlLndpZHRoID0gYCR7c3ByaXRlLmNvc3R1bWUudmlzaWJsZVdpZHRofXB4YFxyXG4gICAgICBlbC5zdHlsZS5oZWlnaHQgPSBgJHtzcHJpdGUuY29zdHVtZS52aXNpYmxlSGVpZ2h0fXB4YFxyXG4gICAgfVxyXG5cclxuICAgIGVsLnN0eWxlLmxlZnQgPSBgJHsoc3ByaXRlLnN0YWdlV2lkdGggLyAyKSArIHh9cHhgXHJcbiAgICBlbC5zdHlsZS50b3AgPSBgJHsoc3ByaXRlLnN0YWdlSGVpZ2h0IC8gMikgKyB5fXB4YFxyXG4gICAgZWwuc3R5bGUuekluZGV4ID0gc3ByaXRlLnpcclxuXHJcbiAgICBlbC5zdHlsZS52aXNpYmlsaXR5ID0gYCR7KHNwcml0ZS5zaG93aW5nID8gJ3Zpc2libGUnIDogJ2hpZGRlbicpfWBcclxuXHJcbiAgICAvLyBMZWZ0IG9yIHJpZ2h0IHJvdGF0aW9uXHJcbiAgICAvLyBEaXJlY3Rpb24gZGl2aWRlZCBieSAxODAgYW5kIGZsb29yZWQgLT4gMSBvciAyLlxyXG4gICAgLy8gU3VidHJhY3QgMSAtPiAwIG9yIDEuXHJcbiAgICAvLyBNdWx0aXBseSBieSAtMSAtPiAwIG9yIC0xLlxyXG4gICAgLy8gQ3NzIHRyYW5zZm9ybSAtPiBOb25lIG9yIGZ1bGwgWC5cclxuICAgIHNwcml0ZS5yb3RhdGlvblN0eWxlID09PSAxID8gZWwuc3R5bGUudHJhbnNmb3JtID0gYHNjYWxlWCgkeygoTWF0aC5mbG9vcihzcHJpdGUuZGlyZWN0aW9uIC8gMTgwKSAqIDIpIC0gMSkgKiAtMX0pYCA6IG51bGxcclxuXHJcbiAgICAvLyBGdWxsIHJvdGF0aW9uXHJcbiAgICAvLyBTcHJpdGUgXCJuZXV0cmFsIHBvc2l0aW9uXCIgaXMgOTAuIENTUyBpcyAwLiBTdWJ0cmFjdCA5MC5cclxuICAgIC8vIE5vcm1hbGl6ZSB0byAzNjAuXHJcbiAgICAvLyBDc3Mgcm90YXRlIC0+IE51bWJlciBvZiBkZWdyZWVzLlxyXG4gICAgc3ByaXRlLnJvdGF0aW9uU3R5bGUgPT09IDAgPyBlbC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7KChzcHJpdGUuZGlyZWN0aW9uIC0gOTApICsgMzYwKSAlIDM2MH1kZWcpYCA6IG51bGxcclxuXHJcbiAgICAvLyBDU1MgcnVsZXMgY2xhc3NlcyBhbmQgdGhlIGJhY2tncm91bmQgY29sb3IuXHJcbiAgICAvLyBUaGUgY29zdHVtZSBjb2xvciBzZXR0aW5nIG92ZXJyaWRlcyBhbnkgQ1NTIHNldHRpbmcuXHJcblxyXG4gICAgLy8gVGhlcmUgaXMgbm8gY29sb3IgcHJvcGVydHkgdG8gY3VycmVudCBjb3N0dW1lIC0gc28gcmVzZXQgdGhlIGJhY2tncm91bmQtY29sb3IgcHJvcGVydHkgb2YgdGhlIGVsZW1lbnQuXHJcbiAgICAhc3ByaXRlLmNvc3R1bWUgfHwgIXNwcml0ZS5jb3N0dW1lLmNvbG9yID8gZWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJycgOiBudWxsXHJcblxyXG4gICAgLy8gYXBwbHkgQ1NTIHJ1bGVzIChtYXkgaW5jbHVkZSBiYWNrZ3JvdW5kIGNvbG9yKVxyXG4gICAgY3NzLmFwcGx5KHNwcml0ZSlcclxuXHJcbiAgICAvLyBhcHBseSBDU1MgY2xhc3Nlc1xyXG4gICAgc3ByaXRlLmNvc3R1bWUgPyBlbC5jbGFzc05hbWUgPSBzcHJpdGUuY29zdHVtZS5jbGFzc2VzLmNvbmNhdChzcHJpdGUuY2xhc3Nlcykuam9pbignICcpIDogZWwuY2xhc3NOYW1lID0gc3ByaXRlLmNsYXNzZXMuam9pbignICcpXHJcblxyXG4gICAgLy8gVGhlcmUgaXMgYSBjb2xvciBwcm9wZXJ0eSB0byBjdXJyZW50IGNvc3R1bWUgLSBzbyBhcHBseSBpdCBhbmQgb3ZlcnJpZGUgQ1NTIHJ1bGVzLlxyXG4gICAgc3ByaXRlLmNvc3R1bWUgJiYgc3ByaXRlLmNvc3R1bWUuY29sb3IgPyBlbC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBzcHJpdGUuY29zdHVtZS5jb2xvciA6IG51bGxcclxuXHJcbiAgICAvLyBJbWFnZS5cclxuICAgIGlmIChzcHJpdGUuY29zdHVtZSAmJiBlbC5maXJzdENoaWxkKSB7IC8vIGhhcyBpbWFnZSBmcm9tIHByZXZpb3VzIGNvc3R1bWVcclxuICAgICAgaWYgKCFzcHJpdGUuY29zdHVtZS5pbWFnZSkgeyAvLyBuZWVkcyByZW1vdmVkIGFzIHRoZXJlIGlzIG5vIGltYWdlIGluIGN1cnJlbnQgY29zdHVtZS5cclxuICAgICAgICBlbC5yZW1vdmVDaGlsZChlbC5maXJzdENoaWxkKVxyXG4gICAgICB9IGVsc2UgaWYgKHNwcml0ZS5jb3N0dW1lLmltYWdlICE9PSB0aGlzLmVsLmZpcnN0Q2hpbGQuc3JjKSB7IC8vIG5lZWRzIHJlcGxhY2VkXHJcbiAgICAgICAgdGhpcy5lbC5maXJzdENoaWxkLnNyYyA9IHNwcml0ZS5jb3N0dW1lLmltYWdlXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoc3ByaXRlLmNvc3R1bWUgJiYgc3ByaXRlLmNvc3R1bWUuaW1hZ2UpIHsgLy8gbmVlZHMgYW4gaW1hZ2UgaW5zZXJ0ZWQuXHJcbiAgICAgIGNvbnN0IGltYWdlID0gbmV3IHdpbmRvdy5JbWFnZSgpXHJcblxyXG4gICAgICBpbWFnZS5zdHlsZS53aWR0aCA9ICcxMDAlJ1xyXG4gICAgICBpbWFnZS5zdHlsZS5oZWlnaHQgPSAnMTAwJSdcclxuICAgICAgaW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgIGltYWdlLnNyYyA9IHNwcml0ZS5jb3N0dW1lLmltYWdlXHJcbiAgICAgIGVsLmFwcGVuZENoaWxkKGltYWdlKVxyXG4gICAgfVxyXG5cclxuICAgIGVsLmZpcnN0Q2hpbGQgPyBlbC5maXJzdENoaWxkLmRyYWdnYWJsZSA9IGZhbHNlIDogbnVsbFxyXG5cclxuICAgIC8vIElubmVyLiBNdXN0IGJ5IGRvbmUgYWZ0ZXIgdGhlIGltYWdlXHJcbiAgICBzcHJpdGUuY29zdHVtZSAmJiBzcHJpdGUuY29zdHVtZS5pbm5lckhUTUwgPyBlbC5pbm5lckhUTUwgPSBzcHJpdGUuY29zdHVtZS5pbm5lckhUTUwgOiBudWxsXHJcblxyXG4gICAgLy8gVGV4dCBVSSBnb2VzIHdoZXJlIHNwcml0ZSBnb2VzLlxyXG4gICAgc3ByaXRlLnRleHR1aSA/IHNwcml0ZS50ZXh0dWkudXBkYXRlKHNwcml0ZSkgOiBudWxsXHJcblxyXG4gICAgdGhpcy5lbCA9IGVsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGRlbGV0ZSAtIGRlbGV0ZXMgdGhlIERPTSBlbGVtZW50LlxyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzcHJpdGUgLSB0aGUgc3ByaXRlIHRvIGRlbGV0ZS5cclxuICAqL1xyXG4gIGRlbGV0ZSAoc3ByaXRlKSB7XHJcbiAgICBjb25zdCBlbCA9IHNwcml0ZS5lbGVtZW50LmVsXHJcblxyXG4gICAgZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbClcclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGFkZEZsYWcgLSBwdXRzIHRoZSBmbGFnIGRpdiBpbmZyb250IG9mIGV2ZXJ5dGhpbmcgKHNob3dzIGl0KS5cclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gdGhlIHNwcml0ZSB0aGF0IFwicmVxdWVzdGVkXCIgdGhlIGZsYWcuXHJcbiAgKi9cclxuICBhZGRGbGFnIChzcHJpdGUpIHtcclxuICAgIGNvbnN0IGVsID0gc3ByaXRlLmVsZW1lbnQuZmxhZ1xyXG5cclxuICAgIGVsLnN0eWxlLnpJbmRleCA9IDEwMDBcclxuICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlbW92ZUZsYWcgLSBwdXRzIHRoZSBmbGFnIGRpdiBhdCB0aGUgYmFjayAoaGlkZXMgaXQpLlxyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzcHJpdGUgLSB0aGUgc3ByaXRlIHRoYXQgXCJyZXF1ZXN0ZWRcIiB0aGUgZmxhZy5cclxuICAqL1xyXG4gIHJlbW92ZUZsYWcgKHNwcml0ZSkge1xyXG4gICAgY29uc3QgZWwgPSBzcHJpdGUuZWxlbWVudC5mbGFnXHJcblxyXG4gICAgZWwuc3R5bGUuekluZGV4ID0gLTFcclxuICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEVudGl0eSBmcm9tICcuL2VudGl0eSdcclxuXHJcbmltcG9ydCBTdGFnZVN1cmZhY2UgZnJvbSAnLi9zdGFnZS1zdXJmYWNlJ1xyXG5pbXBvcnQgU3ByaXRlRWxlbWVudCBmcm9tICcuL3Nwcml0ZS1lbGVtZW50J1xyXG5pbXBvcnQgQ29zdHVtZSBmcm9tICcuL2Nvc3R1bWUnXHJcbmltcG9ydCBUZXh0VWlFbGVtZW50IGZyb20gJy4vdGV4dC11aS1lbGVtZW50J1xyXG5cclxuaW1wb3J0IGNvbGxpc2lvbkRldGVjdG9yIGZyb20gJy4vY29sbGlzaW9uLWRldGVjdG9yJ1xyXG5cclxuLyoqXHJcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIFNwcml0ZS5cclxuICogU3ByaXRlcyBjYW4gYmUgYWRkZWQgdG8gdGhlIFN0YWdlLlxyXG4gKiBAZXh0ZW5kcyBFbnRpdHlcclxuICpcclxuICogQGV4YW1wbGVcclxuICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSh7XHJcbiAqICAgY29zdHVtZTogbmV3IGJsb2NrTGlrZS5Db3N0dW1lKHtcclxuICogICAgIHdpZHRoOiA1MCxcclxuICogICAgIGhlaWdodDogNTAsXHJcbiAqICAgICBjb2xvcjogJyNBMkRBRkYnLFxyXG4gKiAgICAgaW1hZ2U6ICdodHRwczovL3d3dy5ibG9ja2xpa2Uub3JnL2ltYWdlcy9zaGVlcF9zdGVwLnBuZydcclxuICogICB9KVxyXG4gKiB9KTtcclxuICpcclxuICogQGV4YW1wbGVcclxuICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKHtcclxuICogICAgIHdpZHRoOiA1MCxcclxuICogICAgIGhlaWdodDogNTAsXHJcbiAqICAgICBjb2xvcjogJyNBMkRBRkYnLFxyXG4gKiAgICAgaW1hZ2U6ICdodHRwczovL3d3dy5ibG9ja2xpa2Uub3JnL2ltYWdlcy9zaGVlcF9zdGVwLnBuZydcclxuICogfSk7XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGxldCBjb25mZXR0aSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCdodHRwczovL3d3dy5ibG9ja2xpa2Uub3JnL2ltYWdlcy9jb25mZXR0aS5zdmcnKTtcclxuICpcclxuICogQGV4YW1wbGVcclxuICogbGV0IGJhcmVaZXJvU2l6ZWRTcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZShudWxsKTtcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwcml0ZSBleHRlbmRzIEVudGl0eSB7XHJcbiAgLyoqXHJcbiAgKiBjb25zdHJ1Y3RvciAtIENyZWF0ZXMgYSBTcHJpdGUgdG8gYmUgYWRkZWQgdG8gU3RhZ2UuXHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSBvcHRpb25zIGZvciB0aGUgc3ByaXRlIGFuZC9vciBvcHRpb25zIHBhc3NlZCB0byBjb3N0dW1lLlxyXG4gICogQWx0ZXJuYXRpdmVseSBhbiBpbWFnZSBVUkwuIElmIGEgVVJMIGlzIHByb3ZpZGVkIGRlZmF1bHQgY29zdHVtZSB3aWxsIGJlIHNpemVkIHRvIGltYWdlLlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMucGFjZSAtIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgZm9yIGVhY2ggcGFjZWQgbWV0aG9kLlxyXG4gICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY29zdHVtZSAtIEEgZGVmYXVsdCBDb3N0dW1lLlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMud2lkdGggLSB0aGUgY29zdHVtZSB3aWR0aCBpbiBwaXhlbHMuIERlZmF1bHQgaXMgMTAwLlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuaGVpZ2h0IC0gdGhlIGNvc3R1bWUgaGVpZ2h0IGluIHBpeGVscy4gRGVmYXVsdCBpcyAxMDAuXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5pbWFnZSAtIGEgVVJMIChvciBkYXRhIFVSTCkgZm9yIHRoZSBjb3N0dW1lIGltYWdlLlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY29sb3IgLSBhIGNzcyBjb2xvciBzdHJpbmcgKCcjZmYwMDAwJywgJ3JlZCcpLlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMgLSBhIFVSTCAob3IgZGF0YSBVUkwpIGZvciB0aGUgY29zdHVtZSBpbWFnZS5cclxuICAqL1xyXG4gIGNvbnN0cnVjdG9yIChvcHRpb25zID0ge30pIHtcclxuICAgIGNvbnN0IHNoZWVweSA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUY4QUFBQmVDQVlBQUFCRkVNaFFBQUFBQm1KTFIwUUEvd0QvQVArZ3ZhZVRBQUFSc2tsRVFWUjQydTFkQjFSVTF4WkZRWm9VRVJWRlJiRmpWd1FMS29xZ0JqdmdWeEdqMkdNdnNXdUkwVVJpNzcyWGJ6ZjJYbUp2MkZ2c3h0NFZZUm9EYy80K1QzVHhFV2JlTkpxejE3cHJtSm4zSG0vMnUvZmNjMCs3Wm1ZbW1HQkMxa1F4S3l1clJYWjJkay93S3NIck0ydHI2Mlg0dkpTSkdpTWlSNDRjSFVDNHJFK2ZQb3FvcUNpNmYvOCtYYng0a1FZT0hCaUhCeUREOTkyVEhHNkYxaVpYcmx6TEhSMGRkK0YxQ2Q0SDhXVk1UR3FQcGc0T0RqSW1QU1ZjdlhxVm5KeWNwRGd1Qk0zSDF0YjJWZm55NVNXVEprMmlCUXNXMElRSkU2aGt5WklTZlA0RTMxY3gwU2tlbGlEdDliNTkrMGdkRGh3NFFKYVdscC9RNUt0V3JWSWwvMTZsVXRIY3VYTVRXRng5VDJJcU4xcGJjM1B6K1RsejVqd0xPWDBUN1RwRXhTNTgvZ2VhSDVxRm12TWJCUVlHU2tnREVoSVN1UGNuekpvMVM2WHV1TEZqeDhaakZKM1A2cVNYUlMvYm5EMTc5b1RDaFF2TE9uYnNtREJ4NGtSQkRLQUgwckJodzZoUm8wWUs5T280R3h1Yjl4WVdGci9obkZ6SnJsRTliOTY4eDk2OGVhT0plNHFKaWFHeVpjc0tEMEVkRkFyRkZ4RlZNU3VTYmcwaWYwZFRndkM0eTVjdmF5UmoyN1p0VktOR0RRbUxEWndmeGc4Qm8yTS95L21sUzVlcVNDUzJidDBxNnJpUWtKQlkvSStmc2hyeEJTQk83cFFvVVVKNit2UnAwaGFiTjI4bWUzdDdCWWgvRXh3Y0xKTktwZlRwMHlmUjUzLzgrRkhVY2FOR2pVckF2WTdMU3NTN1FYdzhScTlTY0cvV0ZZTUhEeVp2YjI5U0twVmtMRVJIUjFPZVBIbTQ5MWZLQ3NUYm84Yy9idCsrdlNJK1BsNW5VbGdqS1ZTb0VKMDdkNDZNallNSEQ2b3czN3pEdmVmSjFNeERpMW50NitzcjF6VFphY0tqUjQ4b2QrN2NsRmJvMEtHREhBOWdkbWJtdmpuSWx6OTkrbFJ2TXE1ZHUwWkZpeFpOTS9KWkdRRDU3ek1yOGRsQS9JTmx5NVlaaEl6Mzc5OFR4QmZGeHNhbUNma3NJbGtWWnJHWitIdWNlVTJDTmdZdE1yRU5RR3VCNW9YbWltWnVsSlVrV2t2Y3pBSVFlZ0U5NGpsVXYxaTh2b0I5NUFDK0c4VjZkL0psdjR1TGk5U1FrMlBObWpVSjZtV2FrTStLUWJaczJWVDRIZVZ0Ykt6WDQrOEUxL3o1cEVITkdrazZoNFhJdzBPRDVmVnFWNDl4SytRYVkyMWxGWWZqK1BnRUcydnJOMVpXbHR2eHZyNitwRHZCS0RVVFJFZkRBQ1h2MmJPbmNzbVNKYlJwMHlaaHliNWh3d1lhUDM0OCtmdjdTM0djRWcvalFhSXVuaDFxNGVucDA2ZUwwc01sRWdsUGNqUml4QWlxVzdjT1pMc1Q4WS9CZW9CS0ZDOU80ZUhoZFBqd1lkcTdkeS9sejUrZkhqNThtT3ExZUdTOGZQbVNXQlhWQjBlT0hPR1JGbTFoWVI0WDFLeWg4dHloelVRZjdxYmFZcDlkcFZ2bjl0SGVUVXRwVU8vT1NrdkxISEhvckVOMEpiNFZyeTQ5UFQwVkd6ZHVwTGk0T0xVMysrN2RPNHFNakNROEpBWE91d3lUUVR5TGl0U0dOSk01ZlBod3FvWGVqQWRIdVJ3ZHFVV1RBSm8xOFJjNnNYY2QzYjkwbUM0ZTNVYWJWc3ltem1HdHljSGVuanc5cTFLUEhqMElLMXRoMFpSMEVtYzlubGZHTHZueTRzZDNvWEpsUGVqeDQ4ZmYvRytlZjA2ZVBLbDJ0Y3ZmUWJOU090amJ4ZS9ldUZndDZhbTFQWnVXY09lUmFpMnJRZDRNTEdZVUN4Y3VGRlE4YmZYa2J0MjZLZEZyVktkT25mcm0rN05uejFMcDBxWElHYjI3VTJnd0xadytucTZmM2swSjcyNnIvVEVmSGwyZ1VZTjdrU1VlbExXMUZSVXVWQkFQSVEvNVlxUjRWZk1rbUN1b2FXTS9lblQxYjFLOXYwTy9EdThuakNCK0lQdjM3NmN6Wjg3UWloVXJ5SzkrUGNydDVFVHQycldsbE5ZYy9Ic2JOR2hBOW5ZNVZWZFA3dFNKZUc2WGorOGdjL1BzU20zbUFaNGtGOFBlSW1mVlRoOU1temFOOEFCcHo1NDlYejk3Ky9ZdFJvYWpRSXpzeFhXZGZ0VGZPOWVRWFU1Ym1qMHBRaGdaVzFiTm9aM3JGOUh6ZjA1OWN5eUxnYUg5dTVOdjdScms1Vm1aZ2xzRTBwSlpFK2oxM2JQVTJMOGVsZlh3SU81Z2JIYStlZk1tclZtemhpcFhxa1FXNXVhMGZlMENuWW5uTnJoM2w0U2NOalpIeFJ0ZXJLMGpvYzVKRGFFYU1sYXZYazJZa09uMjdkdkNlN2JURkhjdm90ZVAraktrTWNuUlArZjI2M3dOSGgyckYwNmhnUHAxcUVCK0YwRmMxYTdwUllFQjljaTdha1c5N284N0JkdXZRR2xOc2R3SFFOekkxVTFtdW1Ea3lKRlVxbFFwUVJ4ZHVuU0pvRG5RdXdkUmVqK0E5cTJiVTNqN1lMMnZrN3pWOHE1S2N5Yi9xdlA1TDI2Zm9ueDVuV1VXRnRrbmlEWUJnUGpYaXhZdFVobGFaZU9KbWxYRTBhTkhDKzk5ZmV0U202QW1Rcy9UaHlRV1A0NE85bnBmSjNrcjVKcWZEbTVkb2RPNUxFcXJWaW9uaHdUWnd4cWZLT1l4UkFhQklKbXhkT2J6NTg4TDRvYzFvZ2NQSHBDTFN6N3EzVFZNTCtKNDlMQTYrdkwyYVlPU1g3SjRVZnByOVZ5ZHhGamI0S1pLak95N1NSWm1tcm5ISlBzcTZjUm9ERFJ2M3B6R2pCa2ovSDNyMWkwcVdOQVZZaU9FNHQvK294Tkp6MjZkRk1qLzlPU3lRY252RkJwRVBjTGJhbjNlK0ZFRFZORHRvem1LUWh2Vk1nZ081Rmh0VlVwdHdRdWZwSG8vajRCaTd1NkNDSXA3ZlV2ckg4dVRaWEYzTjRQTC9LZ2pmd21UK2JWVHUwU2ZNKzJQa1NwSUR6bTRySzJkdmRmZWZoVVdSeXBLQnp4NzlnenVQUTlxMHFnK1NaNWZGZjFqK2RpeXBVdlFoSWlmRFU0K3Q2SDl1MUhCQWk1MGJQZGF0Y2M5dVhHYy90TXlVSkhZNCt0cGIyeTN0My9HSzc3MEF2dGd2YjI5cUVLNU1xSjZHeSsyL092VjRvbU5GSzl1R29WOGx0LzhZR0duSVY4ZmIyRWh5T1lGSGhVbjk2Mm5WUXNtVTZ1bURlV3NUdHJhMm14bEw1MHVKZ1JYMkczaU5Ka09qQTJaVENhWURYQXYxSzFqR3pxeVkvVTN4TDY1ZDQ1bVJJNkJQcDVISU44UTZxcW05dmo2TVdGZFltZG5Hd003VFR6UE1UQ2J3TEZ2Y3hmdkorSjlCWDBNWjM2bFM1ZU9wZ3lDNjlldlUvZnUzUkJCa0Vzd3FoVjFLMHl3SkZKK0VBNkxJWGw3VnFUbGMvODB1SHFwcnYwMnNqOVpXVnBlTUlhcE9OVFB6KzhUWlREd1NHU05hTzNhdFpUVDFwYU83MW1udHFleklhNXlCUStxWGFNYTNZazZvQmZaUExvYU42aExFOGNPRTk3djM3S2MxeE12alVGK2VOT21UV01vZzJMWHJsM2s1K3Vqa1REV2VsZ2tjR3ZTc0o3T3hQTUUrK1U2M05pTThmNWhGT1d3c0lnWHZXalNBbTNxMTY4Zm5WSEpuemR2SHVZQXpUcDM0WUlGdmhJV1VOOUhaL0o1Y1pXVWZKNVkrWE9ZbGxtTmRETTArYldLRlN2MkthT1N6eVlKdG9CcUl1M0FYeXVvVE1saTVBV0RtRGI2ZWZMR2szd3ptS1hoUUtHR2ZyVkordUthOEhuRjhxVS82cVJLYW9xbmdmZEpubEhKRCsvVWtSYlAvQ1BOSnRmVVd1dVdQOFNBcXk2R0p0OENYaVM5YmZmR1FzTUFmMEh1cGpmNUVjUDZKbGhhV2tRYWZNWkZ6T091R1RObXFESWkrZFd4K0RwellGTzZrOCtMTENkSGgvOGFSZU9wVTZkT2hwVDdOYXA3MCtrREc5T2QvTFZMcHNFbDZiamJHT1RuNGFRQmRxTmxOTlNxV1VOWXpxYzMrZXhTZE1ybHlCcFBZMlBrTkUyQnlUYzJvNUZmcDdhUFlHcEliL0ozYlZoRVZTcFhnaGZPSmc0S3lqSkQ1Mjl4NzVleWh6ODVPUDZGSjJTMnY2UTF3dHFIMHRMWmtlbE8vc3I1azRSN1lSY3JYS0l5bTgrT2NRZURzUTlEVVY4RUpFaytmUGdnTE8wNUhKdDlyL2ljcy9yU3BlZEhSRVFJNFNMcFRmNlU4U05vd0lEK1gwTmpFUGdyd3dpNFl2WTVzOUZBYVNQVzFzY0tGQ2lRQU1zZEJRUUVDR0VWYk93eXRxTWxOYXhjdVJLdXVXWUdJWEQ5MGhsVXdDVXZiRVUyZ3IxZW0zT0g5T3NtUk9ZbERTV3NVcVdLQkh6Tk13anZrUHVUMlQ3ZHIxOC9ldkxrU1lhUStSd3BYTVN0a0VISWJ4SG8vOVZzb0szanZWRURYOXF5WmN2LzNkdS8vLzRyWk1va0JzcnFIa0tQSVhRQ0lrYWVGb2tIMm9CSFhENkVCbkpFbTc3a3M2TWRpeVVhMkN1Y0xoM2JMdm84ZG5FNk9qZ0lYcmZrV0xkdUhjSC8vVXhEeG1UcWppeWNIT1hqNHlQWEpyOHBMZEdyMTA4MHVFOFhuUWhmTUcyY0VNRDZ4VzZ6Y2Zrc1FmeDhjZHJ6cTZZd0VZN1ZyRlN4UXFyM1Y2RkNoVmpNaXoyMFpoN2hmRnNRWVN4UEQwMUdMQzVjdUNBRXliSW5TMXZ5UTBPYVVmVnFsWVFWS29lRStGVDNGT3orYks5bjB1dlVyQ1lFU2FtN1JnT1l0S2RNbVpMcS9YRVVIanJ3VTYySXg2UWFpbWhmV1dxUnhCa0pUWnMwb1ZCRXFHbExQdmRzanVuczJDNUlpT244RXRqRUk0a2ZRbVRFRUxXUkUxdlh6RU55bkxQYVRFYU9hSWJzbDNFY3YxanVuUkhWRzhzeDhaa0JYTWpDMGRHQi92eDFhSnFwbHh3SGlsVXRMVjY4V09QOUlkbFBCdEV6VXF4S09iWkZpeFp5eWtUWXNXT0g0R0JmTk9OM294UC85djU1aUNsMytKTzdpN28zZG5jaUwrR3NHTzV0T09PQzQrUXpHemdoZ2hNcFdHc3hGdkVzbG1waGJtamVyQm1KVFYzbEVIUE1uNi9Ga0IrR2JKTVl5cVJZdjM2OWtBZ3hwRjlYalFrVjJqYVcveUV0ZmhBQ3VYaWxMeGFzS1NZbXo1bHJzdCt2bnp4NXNvb3lNUTRkT2lUTUFaeUpFdjM0a2tHSVo1Y2hMOFRjM1l1U0xzNGxkQWlGeHVBcERJOVhtVkhrSkFjblhIQVBMVmJValE1dFc2a1g4UnoyNTFtNUFwVW9VVHpGUEM0eFNFeUdjRllib1lZbkZHZk0yZ1ZwQ1I3dXlQOFNqSDgvdG0wbDVHTnBTenlyb0htY2M1T1BUeTBTVXo0bUpiRGxGOXlxTksxMDZ5QmFJWnF5R0RndGxaUHNrUDlLUDNVT0ZaTFJ4Q1NzSWFkV2VIQnN6OUpub2ZuOCtYUFd4T1NhSnR1V3FGMlQ1Y2huOEdqbU9KOGlSVDRIVUZWRTRDMHZwbmloeEFHdTl5NGVFaHd6VTM4ZkNXMm1xaEIrNk9WVmpZNGVQYXIzLytiY0JpUi8zTlpFZmdqOHRWbVMvS1FyenAwN2QvTENSMGpBU0JvRXhZMUxDS0JlanhBTlp5Z01HalJJQ1hFK1JXTmdMTXBkaVNJL3ZXejRoZ1puVnJLMWxrVVQreWFNWWNmeThQRGcrUHhBVGVTWHhFcE1LcWIzbUNBT1Y2NWNvY1NxaERrMWtXL0x4UnprY3ZXV0JYMnFRWDF2Z0FpVFlyS05GR3RHZnNwRkhkUVpzVXpRUExsemo3OXo1dzZiTzdqaVNFRlI1R09JVE8zYnQyK0txU2k4d0RDSkhNMWc5MlpZV0JqN2NhWGdjNW8ycG54ZlYxZlgySlJJWnJlWUNackJtWlJjVndJaEpMY1NheEdKOTZPdzU0VnI1U1RGdlh2M0JPdWNDZUtBNGlDc3VuYlN4WGY3bzd1N3V5U3B5WlJyMzJRVjlUSXRnSXJsOFZnZGo5Y3BOSng3UDhxeWZHVzdYYnQySmthMXdKdzVjM2hWdTFuWGtCRXZ6TlNLRXlkT0NCb09WbWttUnJYQTl1M2J1ZTd5UmQwekl5d3NoaUpDVFRwMTZ0UTBLeHlYVmNCUkZYQ2NQOWVyL0NKNi94TE0zRXBER0ppK0ozQUpNMWdMSHVwZC94S3k2ejV2YzJHQ2VMQmhEaFZ1TCtrZHFJbUxuTXBvb1lJWkhkaUJnbVgrWVVPUWYzTDM3dDBtUnJWVE5WRTcwM0tpL21XK1VmYUZKMTBUeEFNZVFVNFA5VGRFaUhqRWdBRURsQ1pLeGVIVnExZGNmVVFweG93c0JoMVJBQ1BHUktzNGpCczNMZ0VoT0FjTmxaVGl5cVpScm1sc2ducHdwQUx2MXdMT3ZBMldFZ1IxOHk3N1BrMVFqOW16WjZzd1IxNDFiSTEyUzh1eHJWcTFrcG5vVFIyY3F3d0hQRWVtMVRKME9tNXVUZ2ZWdEgzUzl3b3VEVittVEJrSmJ6VmxsSzBlNEJ5WWF1cjkzNElqNDFEMFZjNHBWR1pHM01BeUw0ZVBjelZ0RXo3anhZc1hYOUkrVDJsVEtWWlgrTE5jNHhpWDd4bnNXT0pkTXREYkZlQ0RpMTdZcHNsT001eTVnbzI2NUZuRnJjaUJVcHhZd2R0L2NGYTd1bzcxK3ZWcnduWWpMTitsNElIM3ltcVQ1bHY5WVBJZGgveGNoYm93azh3R2pxbEVRVDllbmZMZUt5cGsyVXZ3UUZTYy90TzZkV3NseWx4S09ja0JxdVIxVU5DYk5YQ3o5QUp1cENjdm94RnFFcDhac2hiRmdBUEdZSmZoQ0xNNWFKekVOaGR0QWRwVU5ONHh1cVJaQmtJbGpJQW9sbjM4RUk0ZlA1NWlSQnQveHBiUnpwMDdFeW9XRXFwWENWdWg2Z29PU01ML0ZHSXNEV3lOak1OMXo1c1phVThybzAzRThIaHQ0MnJaYVBFYy9ZQ0laeWszVkNHWGNRVllaMmRuNnQrL1ArbnJtR0c1aStCVHJtMFRmL2Z1WFlNUno3c2U4Vm9HdjhYZExKT0N5NXh3cWZLT2ljT1VHKzh2L2pNbkNDU1BCOUpGdFdPeGdFaXczWmp3eGtFMnkyN2N1R0VRNG5rdkw5eG5zRmtXUldOK0FOaFRWbU13YmtyZ1ZIck9pZ2Z4Vzc0c1puQzlYMWprNlNwK09ESnY1c3lacXNTWXlpQ3pMSTZxdkZPY201dWJqTU1QeFZRb1oyZDB5NVl0RlNDSVJVTGY1UElZazM0WFRqanIycldya2pkQkVBc2VNVjVlWGpLTW9MZTRUQ096N3dRc212ckJYUEVXMWxJRjFMbDRMbHpFYW10VVZKU3dZUmp2N013N0NXSHU0UGxDam1OWGE0ajI5Y0FJT01ZSmZiaWVramNlUzJsMDhWNWN2QmtaS3Fsd1NuNENqcCtmcmlwak9vSjdjQ0I2N254TTFyY1RlL2JuRFJ6eFlLQlA3MG1jTyt5MHVHWU5uTHNLcEg3QzllSjU4OHR5NWNwSmtIRWp3Y0tRN2V5c0pUMEI4YVB4ZDJFekU0eXpEREg3dkhsQVVKS0pQeWdqYWpML0ExNUV4eStNNDRMZkFBQUFBRWxGVGtTdVFtQ0MnXHJcbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcclxuICAgICAgcGFjZTogMzNcclxuICAgIH1cclxuXHJcbiAgICBsZXQgYWN0dWFsID0ge31cclxuICAgIHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyA/IGFjdHVhbCA9IHsgLi4uZGVmYXVsdHMsIC4uLm9wdGlvbnMgfSA6IGFjdHVhbCA9IGRlZmF1bHRzXHJcblxyXG4gICAgc3VwZXIoYWN0dWFsLnBhY2UpXHJcblxyXG4gICAgLy8gY29zdHVtZXNcclxuICAgIHRoaXMuY29zdHVtZXMgPSBbXVxyXG5cclxuICAgIC8qXHJcbiAgICAqIGFsdGVybmF0ZSBvcHRpb25zICAtIGltYWdlIHVybC5cclxuICAgICogdXNlciBjYW4gc2VuZCBhIHVybCBpbnN0ZWFkIG9mIGFuIG9wdGlvbiBvYmplY3QuXHJcbiAgICAqIHRoaXMgd2lsbCBiZSB0cmVhdGVkIGFzIGEgY29zdHVtZSBpbWFnZSB1cmwuXHJcbiAgICAqIHRoZSBpbWFnZSB3aWxsIGJlIHNldCB0aGUgc3ByaXRlIGNvc3R1bWUuXHJcbiAgICAqIHdoZW4gdGhlIGltYWdlIGlzIGxvYWRlZCwgY29zdHVtZSB3aWR0aCBhbmQgaGVpZ2h0IHdpbGwgYmUgc2V0IHRvIGFjdHVhbCBpbWFnZSB3aWR0aCBhbmQgaGVpZ2h0LlxyXG4gICAgKiBzcHJpdGUgd2lsbCBiZSByZWZyZXNoZWQuXHJcbiAgICAqL1xyXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xyXG4gICAgICBhY3R1YWwuY29zdHVtZSA9IG5ldyBDb3N0dW1lKHsgaW1hZ2U6IG9wdGlvbnMsIHdpZHRoOiAwLCBoZWlnaHQ6IDAgfSlcclxuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgd2luZG93LkltYWdlKClcclxuXHJcbiAgICAgIGNvbnN0IG1lID0gYWN0dWFsLmNvc3R1bWVcclxuICAgICAgaW1hZ2Uuc3JjID0gb3B0aW9uc1xyXG5cclxuICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcclxuICAgICAgICBtZS5vcmlnaW5hbFdpZHRoID0gaW1hZ2Uud2lkdGhcclxuICAgICAgICBtZS5vcmlnaW5hbEhlaWdodCA9IGltYWdlLmhlaWdodFxyXG4gICAgICAgIG1lLndpZHRoID0gbWUub3JpZ2luYWxXaWR0aFxyXG4gICAgICAgIG1lLmhlaWdodCA9IG1lLm9yaWdpbmFsSGVpZ2h0XHJcblxyXG4gICAgICAgIHRoaXMucmVmcmVzaCgpXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICogYWx0ZXJuYXRlIG9wdGlvbnMgLSBwYXNzaW5nIGN1c3RvbWUgb3B0aW9ucyB0byBzcHJpdGUuXHJcbiAgICAqIGlmIGNvc3R1bWUgaXMgbm90IGRlZmluZWQgYnkgdXNlciwgaXQgd2lsbCBiZSBjcmVhdGVkLlxyXG4gICAgKiB3aGVuIG5vIGltYWdlIGlzIHNldCwgc2hlZXB5IGlzIGRlZmF1bHQuXHJcbiAgICAqXHJcbiAgICAqIGFsdGVybmF0ZSBvcHRpb25zIC0gbnVsbC5cclxuICAgICogdXNlciBjYW4gcGFzcyBudWxsIGluc3RlYWQgb2YgYW4gb3B0aW9uIG9iamVjdC5cclxuICAgICogdGhpcyBpcyBzYW1lIGFzIHNldHRpbmcgYSBjb3N0dW1lIGFzIG51bGwuXHJcbiAgICAqIHRoZSBzcHJpdGUgd2lsbCBoYXZlIG5vIGNvc3R1bWVzIGFuZCBubyBzaXplLlxyXG4gICAgKi9cclxuICAgIGlmICh0eXBlb2YgYWN0dWFsLmNvc3R1bWUgPT09ICd1bmRlZmluZWQnICYmIG9wdGlvbnMgIT09IG51bGwpIHtcclxuICAgICAgY29uc3QgY29zdHVtZU9wdGlvbnMgPSB7fVxyXG4gICAgICBhY3R1YWwud2lkdGggPyBjb3N0dW1lT3B0aW9ucy53aWR0aCA9IGFjdHVhbC53aWR0aCA6IG51bGxcclxuICAgICAgYWN0dWFsLmhlaWdodCA/IGNvc3R1bWVPcHRpb25zLmhlaWdodCA9IGFjdHVhbC5oZWlnaHQgOiBudWxsXHJcbiAgICAgIGFjdHVhbC5jb2xvciA/IGNvc3R1bWVPcHRpb25zLmNvbG9yID0gYWN0dWFsLmNvbG9yIDogbnVsbDtcclxuICAgICAgKHR5cGVvZiBhY3R1YWwuaW1hZ2UgIT09ICd1bmRlZmluZWQnKSA/IGNvc3R1bWVPcHRpb25zLmltYWdlID0gYWN0dWFsLmltYWdlIDogY29zdHVtZU9wdGlvbnMuaW1hZ2UgPSBzaGVlcHlcclxuXHJcbiAgICAgIGFjdHVhbC5jb3N0dW1lID0gbmV3IENvc3R1bWUoY29zdHVtZU9wdGlvbnMpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2V0IGNvc3R1bWVcclxuICAgIGFjdHVhbC5jb3N0dW1lID8gdGhpcy5jb3N0dW1lID0gYWN0dWFsLmNvc3R1bWUgOiBudWxsXHJcbiAgICB0aGlzLmNvc3R1bWUgPyB0aGlzLmNvc3R1bWVzLnB1c2godGhpcy5jb3N0dW1lKSA6IG51bGxcclxuXHJcbiAgICAvLyBzZXQgd2lkdGhcclxuICAgIHRoaXMuY29zdHVtZSA/IHRoaXMud2lkdGggPSB0aGlzLmNvc3R1bWUudmlzaWJsZVdpZHRoIDogdGhpcy53aWR0aCA9IDBcclxuICAgIHRoaXMuY29zdHVtZSA/IHRoaXMuaGVpZ2h0ID0gdGhpcy5jb3N0dW1lLnZpc2libGVIZWlnaHQgOiB0aGlzLmhlaWdodCA9IDBcclxuXHJcbiAgICB0aGlzLnggPSAwXHJcbiAgICB0aGlzLnkgPSAwXHJcbiAgICB0aGlzLnogPSAwXHJcblxyXG4gICAgdGhpcy5wcmV2WCA9IDBcclxuICAgIHRoaXMucHJldlkgPSAwXHJcblxyXG4gICAgdGhpcy5zaG93aW5nID0gdHJ1ZVxyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSA5MFxyXG4gICAgdGhpcy5tYWduaWZpY2F0aW9uID0gMTAwXHJcblxyXG4gICAgdGhpcy5yb3RhdGlvblN0eWxlID0gMFxyXG5cclxuICAgIHRoaXMudGV4dHVpID0gbnVsbFxyXG5cclxuICAgIHRoaXMuZHJhd2luZyA9IGZhbHNlXHJcbiAgICB0aGlzLnBlbkNvbG9yID0gJyMyMjIyMjInXHJcbiAgICB0aGlzLnBlblNpemUgPSAxXHJcblxyXG4gICAgdGhpcy5jc3NSdWxlcyA9IFtdXHJcbiAgICB0aGlzLmNsYXNzZXMgPSBbXVxyXG5cclxuICAgIHRoaXMuY29sbGlzaW9uRGV0ZWN0b3IgPSBjb2xsaXNpb25EZXRlY3RvclxyXG4gIH1cclxuXHJcbiAgLyoqIFNldHVwIEFjdGlvbnMgKiAqL1xyXG5cclxuICAvKipcclxuICAqIGFkZFRvIC0gQWRkcyB0aGUgc3ByaXRlIHRvIHRoZSBzdGFnZVxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzdGFnZSAtIHdoaWNoIHN0YWdlIHRvIGFkZCB0aGUgc3ByaXRlIHRvby5cclxuICAqL1xyXG4gIGFkZFRvIChzdGFnZSkge1xyXG4gICAgdGhpcy5zdGFnZVdpZHRoID0gc3RhZ2Uud2lkdGhcclxuICAgIHRoaXMuc3RhZ2VIZWlnaHQgPSBzdGFnZS5oZWlnaHRcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQgPSBuZXcgU3ByaXRlRWxlbWVudCh0aGlzLCBzdGFnZSlcclxuICAgIHRoaXMuc3VyZmFjZSA9IG5ldyBTdGFnZVN1cmZhY2Uoc3RhZ2UpXHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmZsYWcgPSBzdGFnZS5lbGVtZW50LmZsYWdcclxuICAgIHRoaXMuYWdhaW5zdEJhY2tkcm9wID0gc3RhZ2UuZWxlbWVudC5iYWNrZHJvcENvbnRhaW5lclxyXG5cclxuICAgIHN0YWdlLnNwcml0ZXMucHVzaCh0aGlzKVxyXG4gICAgdGhpcy56ID0gc3RhZ2Uuc3ByaXRlcy5sZW5ndGhcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGNsb25lIC0gQ3JlYXRlcyBhIGNsb25lIG9mIHRoZSBzcHJpdGUgYW5kIHRyaWdnZXJzIGFuIGV2ZW50LlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgbGV0IGNsb25lID0gdGhpcy5jbG9uZSgpO1xyXG4gICogICBjbG9uZS5tb3ZlKDEwMCk7XHJcbiAgKiAgIGNsb25lLmFkZFRvKHN0YWdlKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqL1xyXG4gIGNsb25lICgpIHtcclxuICAgIC8vIG1ha2UgYSBuZXcgc3ByaXRlLlxyXG4gICAgY29uc3Qgc3ByaXRlID0gbmV3IFNwcml0ZSgpXHJcbiAgICAvLyBzYXZlIGlkLlxyXG4gICAgY29uc3QgaWQgPSBzcHJpdGUuaWRcclxuICAgIC8vIGFuZCBhc3NpZ24gcHJvcGVydGllcy5cclxuICAgIGNvbnN0IGNsb25lID0gT2JqZWN0LmFzc2lnbihzcHJpdGUsIHRoaXMpXHJcbiAgICAvLyByZWFzc2lnbiB0aGUgdW5pcXVlIGlkLlxyXG4gICAgY2xvbmUuaWQgPSBpZFxyXG5cclxuICAgIC8vIHJlbW92ZSBET00gZWxlbWVudHNcclxuICAgIGNsb25lLmVsZW1lbnQgPSBudWxsXHJcbiAgICBjbG9uZS5zdXJmYWNlID0gbnVsbFxyXG5cclxuICAgIC8vIGRldGFjaCBhcnJheXNcclxuICAgIGNsb25lLmNzc1J1bGVzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmNzc1J1bGVzKSlcclxuICAgIGNsb25lLmNsYXNzZXMgPSB0aGlzLmNsYXNzZXMuc2xpY2UoKVxyXG5cclxuICAgIC8vIGZpZ3VyZSBvdXQgd2hhdCB0aGUgY3VycmVudCBjb3N0dW1lIGlzLlxyXG4gICAgY29uc3QgY3VycmVudENvc3R1bWVJbmRleCA9IHRoaXMuY29zdHVtZXMuaW5kZXhPZih0aGlzLmNvc3R1bWUpXHJcblxyXG4gICAgLy8gZmlsbCB0aGUgY29zdHVtZXMgYXJyYXkgd2l0aCBuZXcgY29zdHVtZXMgYW5kIGFzc2lnbiBwcm9wZXJ0aWVzLlxyXG4gICAgY2xvbmUuY29zdHVtZXMgPSB0aGlzLmNvc3R1bWVzLm1hcCgoaXRlbSkgPT4ge1xyXG4gICAgICBjb25zdCBjb3N0dW1lID0gbmV3IENvc3R1bWUoKVxyXG4gICAgICBjb25zdCBvYmogPSBPYmplY3QuYXNzaWduKGNvc3R1bWUsIGl0ZW0pXHJcblxyXG4gICAgICAvLyBkZXRhY2ggYXJyYXlzXHJcbiAgICAgIG9iai5jc3NSdWxlcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbS5jc3NSdWxlcykpXHJcbiAgICAgIG9iai5jbGFzc2VzID0gaXRlbS5jbGFzc2VzLnNsaWNlKClcclxuXHJcbiAgICAgIHJldHVybiBvYmpcclxuICAgIH0pXHJcblxyXG4gICAgLy8gc2V0IHRoZSBjdXJyZW50IGNvc3R1bWUuXHJcbiAgICBjbG9uZS5jb3N0dW1lID0gY2xvbmUuY29zdHVtZXNbY3VycmVudENvc3R1bWVJbmRleF1cclxuXHJcbiAgICAvLyBhbm5vdW5jZSBhIGNsb25lXHJcbiAgICBjb25zdCBldmVudCA9IG5ldyB3aW5kb3cuQ3VzdG9tRXZlbnQoYGJsb2NrTGlrZS5zcHJpdGVjbG9uZWQuJHt0aGlzLmlkfWAsIHsgZGV0YWlsOiBjbG9uZSB9KVxyXG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudClcclxuXHJcbiAgICByZXR1cm4gY2xvbmVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogcmVtb3ZlRnJvbSAtIFJlbW92ZXMgYSBzcHJpdGUgZnJvbSB0aGUgc3RhZ2UuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUucmVtb3ZlRnJvbShzdGFnZSk7XHJcbiAgKlxyXG4gICovXHJcbiAgcmVtb3ZlRnJvbSAoc3RhZ2UpIHtcclxuICAgIGNvbnN0IGN1clN0YWdlID0gc3RhZ2VcclxuXHJcbiAgICBjdXJTdGFnZS5zcHJpdGVzID0gc3RhZ2Uuc3ByaXRlcy5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gIT09IHRoaXMpXHJcbiAgICB0aGlzLmVsZW1lbnQgPyB0aGlzLmVsZW1lbnQgPSB0aGlzLmVsZW1lbnQuZGVsZXRlKHRoaXMpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqIEV2ZW50cyAqICovXHJcblxyXG4gIC8qKlxyXG4gICogd2hlbkNsb25lZCAtIEFkZHMgYSBkb2N1bWVudCBsZXZlbCBldmVudCBsaXN0ZW5lciB0cmlnZ2VyZWQgYnkgYSBjdXN0b20gZXZlbnQuXHJcbiAgKiBUaGUgY3VzdG9tIGV2ZW50IGlzIHRyaWdnZXJlZCBieSB0aGUgY2xvbmUoKSBtZXRob2QuXHJcbiAgKiBXaGVuIHRyaWdnZXJlZCB3aWxsIGludm9rZSB1c2VyIHN1cHBsaWVkIGZ1bmN0aW9uLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5jbG9uZSgpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogc3ByaXRlLndoZW5DbG9uZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLmFkZFRvKHN0YWdlKTtcclxuICAqICAgdGhpcy5nbGlkZSg1LCAxMDAsIDApO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyAtIGEgZnVuY3Rpb24gdG8gcmV3cml0ZSBhbmQgZXhlY3V0ZS5cclxuICAqL1xyXG4gIHdoZW5DbG9uZWQgKGZ1bmMpIHtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoYGJsb2NrTGlrZS5zcHJpdGVjbG9uZWQuJHt0aGlzLmlkfWAsIChlKSA9PiB7XHJcbiAgICAgIGUuZGV0YWlsLl9leGVjKGZ1bmMsIFtdKVxyXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqIE1vdGlvbiAqICovXHJcblxyXG4gIC8qKlxyXG4gICogX21vdGlvbiAtIE1vdmVzIHRoZSBzcHJpdGUgdG8gc3BlY2lmaWVkIGxvY2F0aW9uICh4LCB5KS5cclxuICAqIEFsbCB1c2VyIG1vdGlvbiBtZXRob2RzIHRyYW5zbGF0ZWQgdG8gdGhpcyBtb3Rpb24uXHJcbiAgKlxyXG4gICogQHByaXZhdGVcclxuICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gdGhlIHggY29vcmRpbmF0ZSBmb3IgdGhlIGNlbnRlciBvZiB0aGUgc3ByaXRlICgwIGlzIGNlbnRlciBzY3JlZW4pLlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IHkgLSB0aGUgeSBjb29yZGluYXRlIGZvciB0aGUgY2VudGVyIG9mIHRoZSBzcHJpdGUgKDAgaXMgY2VudGVyIHNjcmVlbikuXHJcbiAgKi9cclxuICBfbW90aW9uICh4LCB5KSB7XHJcbiAgICB0aGlzLnByZXZYID0gdGhpcy54XHJcbiAgICB0aGlzLnByZXZZID0gdGhpcy55XHJcbiAgICB0aGlzLnggPSB4XHJcbiAgICB0aGlzLnkgPSB5XHJcbiAgICB0aGlzLmVsZW1lbnQgPyB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMpIDogbnVsbFxyXG4gICAgdGhpcy5zdXJmYWNlID8gdGhpcy5zdXJmYWNlLmRyYXcodGhpcykgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGdsaWRlIC0gTW92ZXMgdGhlIHNwcml0ZSBmb3IgdGhlIHNwZWNpZmllZCBudW1iZXIgb2Ygc2Vjb25kcyBzbyBpdCBhcnJpdmVzIGF0IHNwZWNpZmllZCBsb2NhdGlvbiB3aGVuIHRpbWUgaXMgdXAuXHJcbiAgKiBQcm92aWRlcyBzbW9vdGggbW92ZW1lbnQuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMuZ2xpZGUoMywgMTAwLCAxMDApO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIGxldCB0aW1lID0gNTtcclxuICAqICAgdGhpcy5nbGlkZSh0aW1lLCAxMDAsIDEwMCk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gc2VjIC0gdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoZSB3aG9sZSBtb3ZlbWVudCB3aWxsIGxhc3QgKGFuZCB3aWxsIGhhbHQgZnVydGhlciBleGVjdXRpb24gZm9yKS5cclxuICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gdGhlIHggY29vcmRpbmF0ZS5cclxuICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gdGhlIHkgY29vcmRpbmF0ZS5cclxuICAqL1xyXG4gIGdsaWRlIChzZWMsIHgsIHksIHRyaWdnZXJpbmdJZCA9IG51bGwpIHtcclxuICAgIGxldCBpID0gMFxyXG4gICAgY29uc3QgbWUgPSB0aGlzXHJcbiAgICAvLyBkaXZpZGUgdGhlIHggYW5kIHkgZGlmZmVyZW5jZSBpbnRvIHN0ZXBzXHJcbiAgICBjb25zdCBmcmFtZXNQZXJTZWNvbmQgPSAxMDAwIC8gdGhpcy5wYWNlXHJcbiAgICBjb25zdCBzdGVwWCA9ICh4IC0gdGhpcy54KSAvIChzZWMgKiBmcmFtZXNQZXJTZWNvbmQpXHJcbiAgICBjb25zdCBzdGVwWSA9ICh5IC0gdGhpcy55KSAvIChzZWMgKiBmcmFtZXNQZXJTZWNvbmQpXHJcbiAgICBjb25zdCBpbnQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgIGkgKz0gMVxyXG4gICAgICBtZS5fbW90aW9uKG1lLnggKyBzdGVwWCwgbWUueSArIHN0ZXBZKVxyXG4gICAgICBpZiAoaSAvIGZyYW1lc1BlclNlY29uZCA+PSBzZWMpIHtcclxuICAgICAgICAvLyAgY2xlYXIgdGhlIGludGVydmFsIGFuZCBmaXggYW55IFwiZHJpZnRcIlxyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50KVxyXG4gICAgICAgIG1lLl9tb3Rpb24oeCwgeSlcclxuICAgICAgICBtZS5fcmVsZWFzZVdhaXRlZCh0cmlnZ2VyaW5nSWQpXHJcbiAgICAgIH1cclxuICAgIH0sIHRoaXMucGFjZSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogbW92ZSAtIE1vdmVzIHRoZSBzcHJpdGUgYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHBpeGVscyBpbiB0aGUgZGlyZWN0aW9uIGl0IGlzIHBvaW50aW5nLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5tb3ZlKDEwMCwgMTAwKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBwaXhlbHMgLSBudW1iZXIgb2YgcGl4ZWxzIHRvIG1vdmUuXHJcbiAgKi9cclxuICBtb3ZlIChwaXhlbHMpIHtcclxuICAgIC8qKlxyXG4gICAgKiB0b1JhZCAtIGNvbnZlcnRzIGEgZGVncmVlIHRvIHJhZGlhbnMuXHJcbiAgICAqXHJcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBkZWcgLSBudW1iZXIgb2YgZGVncmVlcy5cclxuICAgICogQHJldHVybiB7bnVtYmVyfSAtIGRlZ3JlZXMgY29udmVydGVkIHRvIHJhZGlhbnMuXHJcbiAgICAqL1xyXG4gICAgZnVuY3Rpb24gdG9SYWQgKGRlZykge1xyXG4gICAgICByZXR1cm4gZGVnICogKE1hdGguUEkgLyAxODApXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZHggPSBNYXRoLnJvdW5kKE1hdGguY29zKHRvUmFkKHRoaXMuZGlyZWN0aW9uIC0gOTApKSAqIHBpeGVscylcclxuICAgIGNvbnN0IGR5ID0gTWF0aC5yb3VuZChNYXRoLnNpbih0b1JhZCh0aGlzLmRpcmVjdGlvbiArIDkwKSkgKiBwaXhlbHMpXHJcblxyXG4gICAgdGhpcy5fbW90aW9uKHRoaXMueCArIGR4LCB0aGlzLnkgKyBkeSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogZ29UbyAtIE1vdmVzIHRoZSBzcHJpdGUgdG8gc3BlY2lmaWVkIGxvY2F0aW9uLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5nb1RvKDEwMCwgMTAwKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gdGhlIHggY29vcmRpbmF0ZS5cclxuICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gdGhlIHkgY29vcmRpbmF0ZS5cclxuICAqL1xyXG4gIGdvVG8gKHgsIHkpIHtcclxuICAgIHRoaXMuX21vdGlvbih4LCB5KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBnb1Rvd2FyZHMgLSBNb3ZlcyB0aGUgc3ByaXRlIHRvd2FyZHMgYW5vdGhlciBzcHJpdGUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICogbGV0IG90aGVyU3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogb3RoZXJTcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogb3RoZXJTcHJpdGUubW92ZSgxMDApO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5nb1Rvd2FyZHMob3RoZXJTcHJpdGUpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHNwcml0ZSAtIHRoZSBzcHJpdGUgdG8gbW92ZSB0by5cclxuICAqL1xyXG4gIGdvVG93YXJkcyAoc3ByaXRlKSB7XHJcbiAgICB0aGlzLl9tb3Rpb24oc3ByaXRlLngsIHNwcml0ZS55KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBzZXRYIC0gUGxhY2VzIHRoZSBzcHJpdGUgYXQgdGhlIHNwZWNpZmllZCB4IHBvc2l0aW9uLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgdGhpcy5zZXRYKDEwMCk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0geCAtIHRoZSB4IGNvb3JkaW5hdGVcclxuICAqL1xyXG4gIHNldFggKHgpIHtcclxuICAgIHRoaXMuX21vdGlvbih4LCB0aGlzLnkpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHNldFkgLSBQbGFjZXMgdGhlIHNwcml0ZSBhdCB0aGUgc3BlY2lmaWVkIHkgcG9zaXRpb24uXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnNldFkoMTAwKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gdGhlIHkgY29vcmRpbmF0ZS5cclxuICAqL1xyXG4gIHNldFkgKHkpIHtcclxuICAgIHRoaXMuX21vdGlvbih0aGlzLngsIHkpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGNoYW5nZVggLSBNb3ZlcyB0aGUgc3ByaXRlIG9uIHRoZSB4IGF4aXMgYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHBpeGVscy5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMuY2hhbmdlWCgxMDApO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IHBpeGVscyAtIG51bWJlciBvZiBwaXhlbHMgdG8gbW92ZS5cclxuICAqL1xyXG4gIGNoYW5nZVggKHBpeGVscykge1xyXG4gICAgdGhpcy5fbW90aW9uKHRoaXMueCArIHBpeGVscywgdGhpcy55KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBjaGFuZ2VZIC0gTW92ZXMgdGhlIHNwcml0ZSBvbiB0aGUgeSBheGlzIGEgc3BlY2lmaWVkIG51bWJlciBvZiBwaXhlbHMuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLmNoYW5nZVkoMTAwKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBwaXhlbHMgLSBudW1iZXIgb2YgcGl4ZWxzIHRvIG1vdmUuXHJcbiAgKi9cclxuICBjaGFuZ2VZIChwaXhlbHMpIHtcclxuICAgIHRoaXMuX21vdGlvbih0aGlzLngsIHRoaXMueSArIHBpeGVscylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogcG9pbnRJbkRpcmVjdGlvbiAtIFBvaW50cyB0aGUgc3ByaXRlIGluIGEgc3BlY2lmaWVkIGRpcmVjdGlvbi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMucG9pbnRJbkRpcmVjdGlvbig0NSk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gZGVnIC0gZGlyZWN0aW9uIHRvIHBvaW50IHRvLlxyXG4gICovXHJcbiAgcG9pbnRJbkRpcmVjdGlvbiAoZGVnKSB7XHJcbiAgICBkZWcgPiAwID8gdGhpcy5kaXJlY3Rpb24gPSBkZWcgJSAzNjAgOiB0aGlzLmRpcmVjdGlvbiA9IChkZWcgKyAoMzYwICogMTApKSAlIDM2MFxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuXHJcbiAgICB0aGlzLmNvbGxpc2lvbkRldGVjdG9yLnJlZnJlc2hTcHJpdGVCaXRtYXBDYWNoZSgpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHBvaW50VG93YXJkcyAtIFBvaW50IHRoZSBzcHJpdGUgdG93YXJkcyBhbm90aGVyIHNwcml0ZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKiBsZXQgb3RoZXJTcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBvdGhlclNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBvdGhlclNwcml0ZS5nb1RvKDEwMCwgMTAwKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMucG9pbnRUb3dhcmRzKG90aGVyU3ByaXRlKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzcHJpdGUgLSB0aGUgc3ByaXRlIHRvIG1vdmUgdG8uXHJcbiAgKi9cclxuICBwb2ludFRvd2FyZHMgKHNwcml0ZSkge1xyXG4gICAgLyoqXHJcbiAgICAqIGNvbXB1dGVEaXJlY3Rpb25UbyAtIGZpbmRzIHRoZSBkaXJlY3Rpb24gZnJvbSBzcHJpdGUncyBjdXJyZW50IGxvY2F0aW9uIHRvIGEgc3BlY2lmaWVkIHNldCBvZiBjb29yZGluYXRlcy5cclxuICAgICpcclxuICAgICogQHBhcmFtIHtudW1iZXJ9IGZyb21YIC0gdGhlIHggY29vcmRpbmF0ZVxyXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZnJvbVkgLSB0aGUgeSBjb29yZGluYXRlXHJcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB0b1ggLSB0aGUgeCBjb29yZGluYXRlXHJcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB0b1kgLSB0aGUgeSBjb29yZGluYXRlXHJcbiAgICAqIEByZXR1cm4ge251bWJlcn0gLSBkaXJlY3Rpb24gaW4gZGVncmVlcy5cclxuICAgICovXHJcbiAgICBmdW5jdGlvbiBjb21wdXRlRGlyZWN0aW9uVG8gKGZyb21YLCBmcm9tWSwgdG9YLCB0b1kpIHtcclxuICAgICAgLyoqXHJcbiAgICAgICogdG9EZWcgLSBDb252ZXJ0cyByYWRpYW5zIHRvIGRlZ3JlZXMuXHJcbiAgICAgICpcclxuICAgICAgKiBAcGFyYW0ge251bWJlcn0gcmFkIC0gbnVtYmVyIG9mIHJhZGlhbnMuXHJcbiAgICAgICogQHJldHVybiB7bnVtYmVyfSAtIHJhZGlhbnMgY29udmVydGVkIHRvIGRlZ3JlZXMuXHJcbiAgICAgICovXHJcbiAgICAgIGZ1bmN0aW9uIHRvRGVnIChyYWQpIHtcclxuICAgICAgICByZXR1cm4gcmFkICogKDE4MCAvIE1hdGguUEkpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIDEpIEZpbmQgdGhlIGFuZ2xlIGluIHJhZCwgY29udmVydCB0byBkZWcgKDkwIHRvIC05MCkuXHJcbiAgICAgIC8vIDIpIEZpbmQgdGhlIHNpZ24gb2YgdGhlIGRlbHRhIG9uIHkgYXhpcyAoMSwgLTEpLiBTaGlmdCB0byAoMCwgLTIpLiBNdWx0aXBseSBieSA5MC4gKDAsIDE4MClcclxuICAgICAgLy8gQWRkIDEpIGFuZCAyKVxyXG4gICAgICAvLyBOb3JtYWxpemUgdG8gMzYwXHJcblxyXG4gICAgICBsZXQgcmVzdWx0ID0gKHRvRGVnKE1hdGguYXRhbigoZnJvbVggLSB0b1gpIC8gKGZyb21ZIC0gdG9ZKSkpICsgKDkwICogKE1hdGguc2lnbihmcm9tWSAtIHRvWSkgKyAxKSkgKyAzNjApICUgMzYwO1xyXG4gICAgICAoZnJvbVkgLSB0b1kpID09PSAwID8gcmVzdWx0ICs9IDkwIDogbnVsbCAvLyBtYWtlIHN1cmUgd2UgZml4IGF0YW4gbGltIChkaXZpc2lvbiBieSB6ZXJvKS5cclxuXHJcbiAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9IGNvbXB1dGVEaXJlY3Rpb25Ubyh0aGlzLngsIHRoaXMueSwgc3ByaXRlLngsIHNwcml0ZS55KVxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuICAgIHRoaXMuY29sbGlzaW9uRGV0ZWN0b3IucmVmcmVzaFNwcml0ZUJpdG1hcENhY2hlKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogdHVyblJpZ2h0IC0gVHVybnMgdGhlIHNwcml0ZSBpbiBhIHNwZWNpZmllZCBudW1iZXIgb2YgZGVncmVlcyB0byB0aGUgcmlnaHQgKGNsb2Nrd2lzZSlcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMudHVyblJpZ2h0KDQ1KTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBkZWcgLSBudW1iZXIgb2YgZGVncmVlcyB0byB0dXJuLlxyXG4gICovXHJcbiAgdHVyblJpZ2h0IChkZWcpIHtcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gKHRoaXMuZGlyZWN0aW9uICsgZGVnKSAlIDM2MFxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuICAgIHRoaXMuY29sbGlzaW9uRGV0ZWN0b3IucmVmcmVzaFNwcml0ZUJpdG1hcENhY2hlKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogdHVybkxlZnQgLSBUdXJucyB0aGUgc3ByaXRlIGluIGEgc3BlY2lmaWVkIG51bWJlciBvZiBkZWdyZWVzIHRvIHRoZSBsZWZ0IChjb3VudGVyLWNsb2Nrd2lzZSlcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMudHVybkxlZnQoNDUpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IGRlZyAtIG51bWJlciBvZiBkZWdyZWVzIHRvIHR1cm4uXHJcbiAgKi9cclxuICB0dXJuTGVmdCAoZGVnKSB7XHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9ICgodGhpcy5kaXJlY3Rpb24gKyAzNjApIC0gZGVnKSAlIDM2MFxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuICAgIHRoaXMuY29sbGlzaW9uRGV0ZWN0b3IucmVmcmVzaFNwcml0ZUJpdG1hcENhY2hlKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc2V0Um90YXRpb25TdHlsZSAtIFNldHMgb25lIG9mIHRocmVlIHBvc3NpYmxlIHJvdGF0aW9uIHN0eWxlczpcclxuICAqICAgLSAnbm8nIC8gMiAtIHRoZSBzcHJpdGVzIGNoYW5nZXMgdGhlIGRpcmVjdGlvbiBpbiB3aGljaCBpdCBwb2ludHMgd2l0aG91dCBjaGFuZ2luZyB0aGUgc3ByaXRlcyBhcHBlYXJhbmNlLlxyXG4gICogICAtICdsZWZ0LXJpZ2h0JyAvIDEgLSB0aGUgc3ByaXRlIHdpbGwgZmxpcCBob3Jpem9udGFsbHkgd2hlbiBkaXJlY3Rpb24gaXMgYmV0d2VlbiAxODAgYW5kIDM2MC5cclxuICAqICAgLSAnYWxsJyAvIDAgLSB0aGUgc3ByaXRlIHdpbGwgcm90YXRlIGFyb3VuZCBpdHMgY2VudGVyXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuc2V0Um90YXRpb25TdHlsZSgnbGVmdC1yaWdodCcpO1xyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBzcHJpdGUuc2V0Um90YXRpb25TdHlsZSgxKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gZGVnIC0gbnVtYmVyIG9mIGRlZ3JlZXMgdG8gdHVybi5cclxuICAqL1xyXG4gIHNldFJvdGF0aW9uU3R5bGUgKHN0eWxlKSB7XHJcbiAgICBsZXQgY3VyU3R5bGUgPSBzdHlsZVxyXG5cclxuICAgIHN0eWxlID09PSAnbm8nID8gY3VyU3R5bGUgPSAyIDogbnVsbFxyXG4gICAgc3R5bGUgPT09ICdsZWZ0LXJpZ2h0JyA/IGN1clN0eWxlID0gMSA6IG51bGxcclxuICAgIHN0eWxlID09PSAnYWxsJyA/IGN1clN0eWxlID0gMCA6IG51bGxcclxuXHJcbiAgICB0aGlzLnJvdGF0aW9uU3R5bGUgPSBjdXJTdHlsZVxyXG4gIH1cclxuXHJcbiAgLyoqIExvb2tzICogKi9cclxuXHJcbiAgLyoqXHJcbiAgKiBfcmVmcmVzaENvc3R1bWUgLSBTZXRzIHRoZSBjb3N0dW1lIGFuZCBzcHJpdGUgd2lkdGggYW5kIGhpZ2h0IHRoZW4gcmVmcmVzaGVzIGVsZW1lbnQuXHJcbiAgKlxyXG4gICogQHByaXZhdGVcclxuICAqL1xyXG4gIF9yZWZyZXNoQ29zdHVtZSAoKSB7XHJcbiAgICBpZiAodGhpcy5jb3N0dW1lKSB7XHJcbiAgICAgIHRoaXMud2lkdGggPSB0aGlzLmNvc3R1bWUudmlzaWJsZVdpZHRoXHJcbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jb3N0dW1lLnZpc2libGVIZWlnaHRcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmVsZW1lbnQgPyB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMpIDogbnVsbFxyXG5cclxuICAgIHRoaXMuY29sbGlzaW9uRGV0ZWN0b3IucmVmcmVzaFNwcml0ZUJpdG1hcENhY2hlKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogYWRkQ29zdHVtZSAtIEFkZHMgYSBjb3N0dW1lIHRvIHRoZSBzcHJpdGVcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKiBsZXQgY29zdHVtZSA9IG5ldyBibG9ja0xpa2UuQ29zdHVtZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuYWRkQ29zdHVtZShjb3N0dW1lKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gY29zdHVtZSAtIHRoZSBjb3N0dW1lIHRvIGFkZC5cclxuICAqL1xyXG4gIGFkZENvc3R1bWUgKGNvc3R1bWUpIHtcclxuICAgIHRoaXMuY29zdHVtZXMucHVzaChjb3N0dW1lKVxyXG5cclxuICAgIC8vIGlmIFwiYmFyZVwiIHNldCB0aGUgYWRkZWQgYXMgYWN0aXZlLlxyXG4gICAgaWYgKCF0aGlzLmNvc3R1bWUpIHtcclxuICAgICAgdGhpcy5jb3N0dW1lID0gdGhpcy5jb3N0dW1lc1swXVxyXG4gICAgICB0aGlzLndpZHRoID0gdGhpcy5jb3N0dW1lLnZpc2libGVXaWR0aFxyXG4gICAgICB0aGlzLmhlaWdodCA9IHRoaXMuY29zdHVtZS52aXNpYmxlSGVpZ2h0XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc3dpdGNoQ29zdHVtZVRvIC0gU3dpdGNoZXMgdG8gc3BlY2lmaWVkIGNvc3R1bWUuIElmIG5vdCBmb3VuZCBmYWlscyBzaWxlbnRseS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKiBsZXQgY29zdHVtZSA9IG5ldyBibG9ja0xpa2UuQ29zdHVtZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuYWRkQ29zdHVtZShjb3N0dW1lKTtcclxuICAqIHNwcml0ZS5zd2l0Y2hDb3N0dW1lVG8oY29zdHVtZSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IGJhY2tkcm9wIC0gdGhlIGNvc3R1bWUgdG8gc3dpdGNoIHRvby5cclxuICAqL1xyXG4gIHN3aXRjaENvc3R1bWVUbyAoY29zdHVtZSkge1xyXG4gICAgY29uc3QgY3VycmVudENvc3R1bWVJbmRleCA9IHRoaXMuY29zdHVtZXMuaW5kZXhPZihjb3N0dW1lKVxyXG4gICAgY3VycmVudENvc3R1bWVJbmRleCAhPT0gLTEgPyB0aGlzLmNvc3R1bWUgPSB0aGlzLmNvc3R1bWVzW2N1cnJlbnRDb3N0dW1lSW5kZXhdIDogbnVsbFxyXG5cclxuICAgIHRoaXMuX3JlZnJlc2hDb3N0dW1lKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc3dpdGNoQ29zdHVtZVRvTnVtIC0gU3dpdGNoZXMgdG8gc3BlY2lmaWVkIGNvc3R1bWUgYnkgbnVtYmVyIG9mIGN1cnJlbnQgKDAgaXMgZmlyc3QpLiBJZiBub3QgZm91bmQgZmFpbHMgc2lsZW50bHkuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICogbGV0IGNvc3R1bWUgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLmFkZENvc3R1bWUoY29zdHVtZSk7XHJcbiAgKiBzcHJpdGUuc3dpdGNoQ29zdHVtZVRvTnVtKDEpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIHRoZSBjb3N0dW1lIHRvIHN3aXRjaCB0b28uXHJcbiAgKi9cclxuICBzd2l0Y2hDb3N0dW1lVG9OdW0gKGluZGV4KSB7XHJcbiAgICB0aGlzLnN3aXRjaENvc3R1bWVUbyh0aGlzLmNvc3R1bWVzW2luZGV4XSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogbmV4dENvc3R1bWUgLSBTd2l0Y2hlcyB0byB0aGUgbmV4dCBjb3N0dW1lLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqIGxldCBjb3N0dW1lID0gbmV3IGJsb2NrTGlrZS5Db3N0dW1lKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS5hZGRDb3N0dW1lKGNvc3R1bWUpO1xyXG4gICogc3ByaXRlLm5leHRDb3N0dW1lKCk7XHJcbiAgKlxyXG4gICovXHJcbiAgbmV4dENvc3R1bWUgKCkge1xyXG4gICAgY29uc3QgY3VycmVudENvc3R1bWVJbmRleCA9IHRoaXMuY29zdHVtZXMuaW5kZXhPZih0aGlzLmNvc3R1bWUpXHJcbiAgICB0aGlzLmNvc3R1bWUgPSB0aGlzLmNvc3R1bWVzWyhjdXJyZW50Q29zdHVtZUluZGV4ICsgMSkgJSB0aGlzLmNvc3R1bWVzLmxlbmd0aF1cclxuXHJcbiAgICB0aGlzLl9yZWZyZXNoQ29zdHVtZSgpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlbW92ZUNvc3R1bWUgLSBSZW1vdmVzIGEgY29zdHVtZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKiBsZXQgY29zdHVtZSA9IG5ldyBibG9ja0xpa2UuQ29zdHVtZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuYWRkQ29zdHVtZShjb3N0dW1lKTtcclxuICAqIHNwcml0ZS5yZW1vdmVDb3N0dW1lKGNvc3R1bWUpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBjb3N0dW1lIC0gdGhlIGNvc3R1bWUgdG8gcmVtb3ZlLlxyXG4gICovXHJcbiAgcmVtb3ZlQ29zdHVtZSAoY29zdHVtZSkge1xyXG4gICAgaWYgKHRoaXMuY29zdHVtZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICBjb25zdCBjdXJyZW50Q29zdHVtZUluZGV4ID0gdGhpcy5jb3N0dW1lcy5pbmRleE9mKGNvc3R1bWUpXHJcbiAgICAgIHRoaXMuY29zdHVtZSA9PT0gY29zdHVtZSA/IHRoaXMuY29zdHVtZSA9IHRoaXMuY29zdHVtZXNbKGN1cnJlbnRDb3N0dW1lSW5kZXggKyAxKSAlIHRoaXMuY29zdHVtZXMubGVuZ3RoXSA6IG51bGxcclxuICAgICAgdGhpcy5jb3N0dW1lcyA9IHRoaXMuY29zdHVtZXMuZmlsdGVyKChpdGVtKSA9PiBpdGVtICE9PSBjb3N0dW1lKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5jb3N0dW1lcyA9IFtdXHJcbiAgICAgIHRoaXMuY29zdHVtZSA9IG51bGxcclxuICAgIH1cclxuICAgIHRoaXMuX3JlZnJlc2hDb3N0dW1lKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogcmVtb3ZlQ29zdHVtZU51bSAtIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBjb3N0dW1lIGJ5IG51bWJlciBvZiBjdXJyZW50ICgwIGlzIGZpcnN0KS5cclxuICAqIElmIHRoZXJlIGlzIG9ubHkgb25lIGNvc3R1bWUsIHdpbGwgZmFpbCBhbmQgZW1pdCBhIGNvbnNvbGUgbWVzc2FnZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKiBsZXQgY29zdHVtZSA9IG5ldyBibG9ja0xpa2UuQ29zdHVtZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuYWRkQ29zdHVtZShjb3N0dW1lKTtcclxuICAqIHNwcml0ZS5yZW1vdmVDb3N0dW1lTnVtKDEpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIHRoZSBjb3N0dW1lIHRvIHJlbW92ZS5cclxuICAqL1xyXG4gIHJlbW92ZUNvc3R1bWVOdW0gKGluZGV4KSB7XHJcbiAgICB0aGlzLnJlbW92ZUNvc3R1bWUodGhpcy5jb3N0dW1lc1tpbmRleF0pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHNob3cgLSBTaG93cyB0aGUgc3ByaXRlLiBCeSBkZWZhdWx0IHNwcml0ZXMgYXJlIHNob3duLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLmhpZGUoKTtcclxuICAqIHNwcml0ZS5zaG93KCk7XHJcbiAgKlxyXG4gICovXHJcbiAgc2hvdyAoKSB7XHJcbiAgICB0aGlzLnNob3dpbmcgPSB0cnVlXHJcbiAgICB0aGlzLmVsZW1lbnQgPyB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBoaWRlIC0gSGlkZXMgdGhlIHNwcml0ZS4gQnkgZGVmYXVsdCBzcHJpdGVzIGFyZSBzaG93bi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS5oaWRlKCk7XHJcbiAgKlxyXG4gICovXHJcbiAgaGlkZSAoKSB7XHJcbiAgICB0aGlzLnNob3dpbmcgPSBmYWxzZVxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogcmVmcmVzaCAtIEZvcmNlcyBhIHNwcml0ZSByZWZyZXNoLlxyXG4gICogTm90ZTogc2VydmljZSBtZXRob2QgdG8gYmUgdXNlZCBpZiBjb3N0dW1lIHdhcyBtYW5pcHVsYXRlZCBkaXJlY3RseS5cclxuICAqL1xyXG4gIHJlZnJlc2ggKCkge1xyXG4gICAgY29uc3QgbWUgPSB0aGlzXHJcbiAgICAvLyB3YWl0IGEgc2VjLi4uXHJcbiAgICAvLyBUT0RPOiBUaGlzIGlzIHRvIGFjY29tb2RhdGUgZHluYW1pYyBpbWFnZSByZXNpemUuIE5vdCBpZGVhbC4gU2hvdWxkIGJlIGV2ZW50IGRyaXZlbi5cclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAvLyBpbiBjYXNlIGNvc3R1bWUgd2FzIHJlc2l6ZWQgZm9yY2UgYSByZXNldCBvZiBzaXplLlxyXG4gICAgICBtZS5zZXRTaXplKG1lLm1hZ25pZmljYXRpb24pXHJcbiAgICAgIC8vIHRoZW4gcmVmcmVzaCB0aGUgRE9NLlxyXG4gICAgICBtZS5lbGVtZW50ID8gbWUuZWxlbWVudC51cGRhdGUobWUpIDogbnVsbFxyXG4gICAgICB0aGlzLmNvbGxpc2lvbkRldGVjdG9yLnJlZnJlc2hTcHJpdGVCaXRtYXBDYWNoZSgpXHJcbiAgICB9LCB0aGlzLnBhY2UpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlc2l6ZVRvSW1hZ2UgLSBzZXRzIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSBzcHJpdGUgdG8gdGhhdCBvZiB0aGUgaW1hZ2UgZmlsZSBvZiBjdXJyZW50IGNvc3R1bWUuXHJcbiAgKiBOb3RlOiBzZXJ2aWNlIG1ldGhvZC4gU2ltaWxhciB0byBjYWxsaW5nIHJlc2l6ZVRvSW1hZ2UoKSBvbiBjb3N0dW1lIGFuZCB0aGVuIHJlZnJlc2goKSBvbiBzcHJpdGUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGNvbnN0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKG51bGwpO1xyXG4gICpcclxuICAqIGNvbnN0IGFuZ3J5U2hlZXAgPSBuZXcgYmxvY2tMaWtlLkNvc3R1bWUoe1xyXG4gICogICBpbWFnZTogJ2h0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvZC9kYi9FbW9qaW9uZV8xRjQxMS5zdmcvMjAwcHgtRW1vamlvbmVfMUY0MTEuc3ZnLnBuZycsXHJcbiAgKiB9KTtcclxuICAqIGFuZ3J5U2hlZXAuYWRkVG8oc3ByaXRlKTtcclxuICAqXHJcbiAgKiBzcHJpdGUucmVzaXplVG9JbWFnZSgpO1xyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqL1xyXG4gIHJlc2l6ZVRvSW1hZ2UgKCkge1xyXG4gICAgaWYgKHRoaXMuY29zdHVtZSkge1xyXG4gICAgICB0aGlzLmNvc3R1bWUucmVzaXplVG9JbWFnZSgpXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZWZyZXNoKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogaW5uZXIgLSBQbGFjZXMgYW4gSFRNTCBlbGVtZW50IGluc2lkZSB0aGUgY3VycmVudCBjb3N0dW1lIG9mIHRoZSBzcHJpdGUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuaW5uZXIoJzxwIGNsYXNzPVwiYmlnIGNlbnRlcmVkIHJhaW5ib3dcIj46KTwvcD4nKTtcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogc3ByaXRlLmlubmVyKCdJIGxpa2UgdGV4dCBvbmx5Jyk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IGVsIC0gdGhlIERPTSBlbGVtZW50LlxyXG4gICovXHJcbiAgaW5uZXIgKGh0bWwpIHtcclxuICAgIHRoaXMuY29zdHVtZS5pbm5lcihodG1sKVxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogaW5zZXJ0IC0gUGxhY2VzIGEgRE9NIGVsZW1lbnQgaW5zaWRlIHRoZSBjdXJyZW50IGNvc3R1bWUgb2YgdGhlIHNwcml0ZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS5pbnNlcnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ215LWh0bWwtY3JlYXRpb24nKSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IGVsIC0gdGhlIERPTSBlbGVtZW50LlxyXG4gICovXHJcbiAgaW5zZXJ0IChlbCkge1xyXG4gICAgdGhpcy5jb3N0dW1lLmluc2VydChlbClcclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIF9yZWZyZXNoU2l6ZSAtIFNldHMgdGhlIHNwcml0ZSB3aWR0aCBhbmQgaGlnaHQgaW4gcmVsYXRpb24gdG8gb3JpZ2luYWwgdGhlbiByZWZyZXNoZXMgZWxlbWVudC5cclxuICAqXHJcbiAgKiBAcHJpdmF0ZVxyXG4gICogQHBhcmFtIHtvYmplY3R9IGNvc3R1bWUgLSB0aGUgY29zdHVtZSB0byBhZGQuXHJcbiAgKi9cclxuICBfcmVmcmVzaFNpemUgKCkge1xyXG4gICAgLyoqXHJcbiAgICAqIGRlY2ltYWxSb3VuZCAtIHJvdW5kcyBhIG51bWJlciB0b28gZGVjaW1hbCBwb2ludHMuXHJcbiAgICAqXHJcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIHRoZSB2YWx1ZSB0byByb3VuZC5cclxuICAgICogQHBhcmFtIHtudW1iZXJ9IHBvaW50cyAtIGhvdyBtYW55IGRlY2ltYWwgcG9pbnRzIHRvIGxlYXZlLlxyXG4gICAgKi9cclxuICAgIGZ1bmN0aW9uIGRlY2ltYWxSb3VuZCAodmFsdWUsIHBvaW50cykge1xyXG4gICAgICByZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSAqICgxMCAqKiBwb2ludHMpKSAvICgxMCAqKiBwb2ludHMpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuY29zdHVtZSkge1xyXG4gICAgICB0aGlzLndpZHRoID0gZGVjaW1hbFJvdW5kKHRoaXMuY29zdHVtZS53aWR0aCAqICh0aGlzLm1hZ25pZmljYXRpb24gLyAxMDApLCAyKVxyXG4gICAgICB0aGlzLmhlaWdodCA9IGRlY2ltYWxSb3VuZCh0aGlzLmNvc3R1bWUuaGVpZ2h0ICogKHRoaXMubWFnbmlmaWNhdGlvbiAvIDEwMCksIDIpXHJcblxyXG4gICAgICB0aGlzLmNvc3R1bWVzLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICBjb25zdCBjb3N0dW1lID0gaXRlbVxyXG4gICAgICAgIGNvc3R1bWUudmlzaWJsZVdpZHRoID0gZGVjaW1hbFJvdW5kKGNvc3R1bWUud2lkdGggKiAodGhpcy5tYWduaWZpY2F0aW9uIC8gMTAwKSwgMilcclxuICAgICAgICBjb3N0dW1lLnZpc2libGVIZWlnaHQgPSBkZWNpbWFsUm91bmQoY29zdHVtZS5oZWlnaHQgKiAodGhpcy5tYWduaWZpY2F0aW9uIC8gMTAwKSwgMilcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuY29zdHVtZS52aXNpYmxlV2lkdGggPSB0aGlzLndpZHRoXHJcbiAgICAgIHRoaXMuY29zdHVtZS52aXNpYmxlSGVpZ2h0ID0gdGhpcy5oZWlnaHRcclxuXHJcbiAgICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jb2xsaXNpb25EZXRlY3Rvci5yZWZyZXNoU3ByaXRlQml0bWFwQ2FjaGUoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBjaGFuZ2VTaXplIC0gQ2hhbmdlcyB0aGUgc2l6ZSBvZiB0aGUgc3ByaXRlIGJ5IHNwZWNpZmllZCBwZXJjZW50YWdlIG51bWJlci5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS5jaGFuZ2VTaXplKDUwKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gY2hhbmdlIC0gdGhlIHBlcmNlbnRhZ2UgY2hhbmdlLlxyXG4gICovXHJcbiAgY2hhbmdlU2l6ZSAoY2hhbmdlKSB7XHJcbiAgICB0aGlzLm1hZ25pZmljYXRpb24gKz0gY2hhbmdlXHJcblxyXG4gICAgdGhpcy5fcmVmcmVzaFNpemUoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBzZXRTaXplIC0gU2V0cyB0aGUgc2l6ZSBvZiB0aGUgc3ByaXRlIHRvIHRoZSBzcGVjaWZpZWQgcGVyY2VudGFnZSBudW1iZXIuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuc2V0U2l6ZSgxNTApO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBwZXJjZW50IC0gdGhlIHBlcmNlbnRhZ2UgdG8gc2V0LlxyXG4gICovXHJcbiAgc2V0U2l6ZSAocGVyY2VudCkge1xyXG4gICAgdGhpcy5tYWduaWZpY2F0aW9uID0gcGVyY2VudFxyXG5cclxuICAgIHRoaXMuX3JlZnJlc2hTaXplKClcclxuICB9XHJcblxyXG4gIC8qKiBUZXh0IFVJICogKi9cclxuXHJcbiAgLyoqXHJcbiAgKiB0aGluayAtIENyZWF0ZXMgYSBcInRoaW5rIGJ1YmJsZVwiIG92ZXIgdGhlIHNwcml0ZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS50aGluaygnSSB0aGluayB0aGVyZWZvcmUgSSBhbS4nKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIHRoZSB0ZXh0IGluc2lkZSB0aGUgYnViYmxlLlxyXG4gICovXHJcbiAgdGhpbmsgKHRleHQpIHtcclxuICAgIGlmICh0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgdGhpcy50ZXh0dWkgPyB0aGlzLnRleHR1aSA9IHRoaXMudGV4dHVpLmRlbGV0ZSh0aGlzKSA6IG51bGxcclxuICAgICAgdHlwZW9mIHRleHQgIT09ICd1bmRlZmluZWQnICYmIHRleHQudG9TdHJpbmcoKSA/IHRoaXMudGV4dHVpID0gbmV3IFRleHRVaUVsZW1lbnQodGhpcywgJ3RoaW5rJywgdGV4dCkgOiBudWxsXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHRoaW5rV2FpdCAtIENyZWF0ZXMgYSBcInRoaW5rIGJ1YmJsZVwiIG92ZXIgdGhlIHNwcml0ZSBmb3IgYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHNlY29uZHMuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUudGhpbmtXYWl0KCdJIHRoaW5rIHRoZXJlZm9yZSBJIGFtLicsIDMpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gdGhlIHRleHQgaW5zaWRlIHRoZSBidWJibGUuXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gc2VjIC0gdGhlIG51bWJlciBvZiBzZWNvbmRzIHRvIHdhaXQuXHJcbiAgKi9cclxuICB0aGlua1dhaXQgKHRleHQsIHNlYywgdHJpZ2dlcmluZ0lkID0gbnVsbCkge1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMudGhpbmsoJycpXHJcbiAgICAgIHRoaXMuX3JlbGVhc2VXYWl0ZWQodHJpZ2dlcmluZ0lkKVxyXG4gICAgfSwgc2VjICogMTAwMClcclxuICAgIHRoaXMudGhpbmsodGV4dClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc2F5IC0gQ3JlYXRlcyBhIFwic3BlZWNoIGJ1YmJsZVwiIG92ZXIgdGhlIHNwcml0ZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS5zYXkoJ0l0IGlzIG5vdCB0aGUgY29uc2Npb3VzbmVzcyBvZiBtZW4gdGhhdCBkZXRlcm1pbmVzIHRoZWlyIGJlaW5nLCBidXQsIG9uIHRoZSBjb250cmFyeSwgdGhlaXIgc29jaWFsIGJlaW5nIHRoYXQgZGV0ZXJtaW5lcyB0aGVpciBjb25zY2lvdXNuZXNzLicpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gdGhlIHRleHQgaW5zaWRlIHRoZSBidWJibGUuXHJcbiAgKi9cclxuICBzYXkgKHRleHQpIHtcclxuICAgIGlmICh0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgdGhpcy50ZXh0dWkgPyB0aGlzLnRleHR1aSA9IHRoaXMudGV4dHVpLmRlbGV0ZSh0aGlzKSA6IG51bGxcclxuICAgICAgdHlwZW9mIHRleHQgIT09ICd1bmRlZmluZWQnICYmIHRleHQudG9TdHJpbmcoKSA/IHRoaXMudGV4dHVpID0gbmV3IFRleHRVaUVsZW1lbnQodGhpcywgJ3NheScsIHRleHQpIDogbnVsbFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBzYXlXYWl0IC0gQ3JlYXRlcyBhIFwic3BlZWNoIGJ1YmJsZVwiIG92ZXIgdGhlIHNwcml0ZSBmb3IgYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHNlY29uZHMuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuc2F5V2FpdCgnSXQgaXMgbm90IHRoZSBjb25zY2lvdXNuZXNzIG9mIG1lbiB0aGF0IGRldGVybWluZXMgdGhlaXIgYmVpbmcsIGJ1dCwgb24gdGhlIGNvbnRyYXJ5LCB0aGVpciBzb2NpYWwgYmVpbmcgdGhhdCBkZXRlcm1pbmVzIHRoZWlyIGNvbnNjaW91c25lc3MuJywgMyk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSB0aGUgdGV4dCBpbnNpZGUgdGhlIGJ1YmJsZS5cclxuICAqIEBwYXJhbSB7bnVtYmVyfSBzZWMgLSB0aGUgbnVtYmVyIG9mIHNlY29uZHMgdG8gd2FpdC5cclxuICAqL1xyXG4gIHNheVdhaXQgKHRleHQsIHNlYywgdHJpZ2dlcmluZ0lkID0gbnVsbCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLnNheSgnJylcclxuICAgICAgdGhpcy5fcmVsZWFzZVdhaXRlZCh0cmlnZ2VyaW5nSWQpXHJcbiAgICB9LCBzZWMgKiAxMDAwKVxyXG4gICAgdGhpcy5zYXkodGV4dClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogYXNrIC0gQ3JlYXRlcyBhbiBcImFzayBidWJibGVcIiBvdmVyIHRoZSBzcHJpdGUuXHJcbiAgKiBBbGxvd3MgZm9yIGFuIGlucHV0IGJveCB0byBiZSBkaXNwbGF5ZWQgdG8gdGhlIHVzZXIgYW5kXHJcbiAgKiBjYXB0dXJlIHVzZXIgaW5wdXQgaW50byB0aGUgdmFyaWFibGUgc3BlY2lmaWVkIGJ5IHRoZSB1c2VyLlxyXG4gICogTm90ZSAtIHZhcmlhYmxlIGZvciBhbnN3ZXIgbXVzdCBiZSBkZWNsYXJlZCBpbiBnbG9iYWwgc2NvcGUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIC8vZ29vZDpcclxuICAqIGxldCBhbnN3ZXI7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICBhbnN3ZXIgPSB0aGlzLmFzaygnSXMgdGhlIGRlc3Rpbnkgb2YgbWFua2luZCBkZWNpZGVkIGJ5IG1hdGVyaWFsIGNvbXB1dGF0aW9uPycpO1xyXG4gICogICB0aGlzLnNheShhbnN3ZXIpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogLy8gYmFkOlxyXG4gICogc3ByaXRlLndoZW5DbGlja2VkKCBmdW5jdGlvbigpIHtcclxuICAqICAgbGV0IGFuc3dlcjtcclxuICAqICAgYW5zd2VyID0gdGhpcy5hc2soJ0lzIHRoZSBkZXN0aW55IG9mIG1hbmtpbmQgZGVjaWRlZCBieSBtYXRlcmlhbCBjb21wdXRhdGlvbj8nKTtcclxuICAqICAgdGhpcy5zYXkoYW5zd2VyKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gdGhlIHRleHQgb2YgdGhlIHF1ZXN0aW9uXHJcbiAgKlxyXG4gICovXHJcbiAgYXNrICh0ZXh0LCB0aGVWYXIgPSBudWxsLCB0cmlnZ2VyaW5nSWQgPSBudWxsKSB7XHJcbiAgICBjb25zdCBtZSA9IHRoaXNcclxuICAgIG1lLmFza0lkID0gdGhpcy5fZ2VuZXJhdGVVVUlEKClcclxuXHJcbiAgICBpZiAodGhpcy5lbGVtZW50KSB7XHJcbiAgICAgIHRoaXMudGV4dHVpID8gdGhpcy50ZXh0dWkgPSB0aGlzLnRleHR1aS5kZWxldGUodGhpcykgOiBudWxsXHJcbiAgICAgIHR5cGVvZiB0ZXh0ICE9PSAndW5kZWZpbmVkJyAmJiB0ZXh0LnRvU3RyaW5nKCkgPyB0aGlzLnRleHR1aSA9IG5ldyBUZXh0VWlFbGVtZW50KG1lLCAnYXNrJywgdGV4dCkgOiBudWxsXHJcblxyXG4gICAgICAvLyB0aGlzIHdpbGwgd2FpdCBmb3IgdXNlciBpbnB1dFxyXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGBibG9ja0xpa2UuYXNrLiR7dGhpcy5pZH0uJHttZS5hc2tJZH1gLCBmdW5jdGlvbiBhc2tMaXN0ZW5lciAoZSkge1xyXG4gICAgICAgIC8vIHJlbW92ZSBpdC5cclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGBibG9ja0xpa2UuYXNrLiR7bWUuaWR9LiR7bWUuYXNrSWR9YCwgYXNrTGlzdGVuZXIpXHJcbiAgICAgICAgLy8gdGhpcyBpcyB0aGUgd2FpdGVkIG1ldGhvZCBsaXN0ZW5lci4gcmVsZWFzZSBpdC5cclxuICAgICAgICBtZS5fcmVsZWFzZVdhaXRlZCh0cmlnZ2VyaW5nSWQpXHJcbiAgICAgICAgLy8gc2V0IHRoZSB1c2VyIGRlZmluZWQgdmFyaWFibGUgdG8gdGhlIGNhcHR1cmVkIHZhbHVlLlxyXG4gICAgICAgIHRoZVZhciA/IG1lLl9zZXRUb1Zhcih0aGVWYXIsIGUuZGV0YWlsLnZhbHVlKSA6IG51bGxcclxuICAgICAgICAvLyByZW1vdmUgdGhlIFVJLlxyXG4gICAgICAgIG1lLnRleHR1aSA/IG1lLnRleHR1aSA9IG1lLnRleHR1aS5kZWxldGUobWUpIDogbnVsbFxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFBlbiAqICovXHJcblxyXG4gIC8qKlxyXG4gICogcGVuQ2xlYXIgLSBDbGVhcnMgdGhlIGRyYXdpbmcgc3VyZmFjZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMucGVuQ2xlYXIoKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqL1xyXG4gIHBlbkNsZWFyICgpIHtcclxuICAgIHRoaXMuc3VyZmFjZS5jbGVhcih0aGlzKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBwZW5Eb3duIC0gXCJBY3RpdmF0ZXNcIiBkcmF3aW5nIGJ5IHNldHRpbmcgcmVxdWlyZWQgdmFsdWVzLlxyXG4gICogV2hlbiBhY3RpdmF0ZWQgc3ByaXRlIG1vdGlvbiB3aWxsIGNyZWF0ZSB0aGUgZHJhd2luZyBvbiB0aGUgc3RhZ2UncyBjYW52YXMuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnBlbkRvd24oKTtcclxuICAqICAgdGhpcy5tb3ZlKDEwMCk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKi9cclxuICBwZW5Eb3duICgpIHtcclxuICAgIHRoaXMuZHJhd2luZyA9IHRydWVcclxuICAgIHRoaXMucHJldlggPSB0aGlzLnhcclxuICAgIHRoaXMucHJldlkgPSB0aGlzLnlcclxuICAgIHRoaXMuc3VyZmFjZS5kcmF3KHRoaXMpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHBlblVwIC0gXCJEZWFjdGl2YXRlc1wiIGRyYXdpbmcgYnkgc2V0dGluZyByZXF1aXJlZCB2YWx1ZXMuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnBlbkRvd24oKTtcclxuICAqICAgdGhpcy5tb3ZlKDEwMCk7XHJcbiAgKiAgIHRoaXMucGVuVXAoKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqL1xyXG4gIHBlblVwICgpIHtcclxuICAgIHRoaXMuZHJhd2luZyA9IGZhbHNlXHJcbiAgICB0aGlzLnN1cmZhY2UuZHJhdyh0aGlzKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBzZXRQZW5Db2xvciAtIFNldHMgdGhlIGNvbG9yIG9mIHRoZSBwZW4uXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuc2V0UGVuQ29sb3IoJyNmZjAwMDAnKVxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBzcHJpdGUuc2V0UGVuQ29sb3IoJ3JlZCcpXHJcbiAgKlxyXG4gICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yU3RyaW5nIC0gYSB2YWxpZCBjb2xvciBkZWZpbml0aW9uIGZvciBjYW52YXMgc3Ryb2tlU3R5bGUuXHJcbiAgKi9cclxuICBzZXRQZW5Db2xvciAoY29sb3JTdHJpbmcpIHtcclxuICAgIHRoaXMucGVuQ29sb3IgPSBjb2xvclN0cmluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBzZXRQZW5TaXplIC0gU2V0cyB0aGUgc2l6ZSBvZiB0aGUgcGVuLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogc3ByaXRlLnNldFBlblNpemUoMTApO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBwaXhlbHMgLSBhIG51bWJlciBmb3IgY2FudmFzIGxpbmVXaWR0aC5cclxuICAqL1xyXG4gIHNldFBlblNpemUgKHBpeGVscykge1xyXG4gICAgdGhpcy5wZW5TaXplID0gcGl4ZWxzXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGNoYW5nZVBlblNpemUgLSBDaGFuZ2VzIHRoZSBzaXplIG9mIHRoZSBwZW4uXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLmNoYW5nZVBlblNpemUoMTApO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IGNoYW5nZSAtIHRoZSBjaGFuZ2UgaW4gcGl4ZWxzLlxyXG4gICovXHJcbiAgY2hhbmdlUGVuU2l6ZSAoY2hhbmdlKSB7XHJcbiAgICB0aGlzLnBlblNpemUgKz0gY2hhbmdlXHJcbiAgfVxyXG5cclxuICAvKiBTZW5zaW5nICovXHJcblxyXG4gIC8qKlxyXG4gICogZGlzdGFuY2VUbyAtIFJldHVybnMgdGhlIGRpc3RhbmNlIHRvIGEgcG9pbnQgb24gdGhlIHNjcmVlbi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSh7c2Vuc2luZzogdHJ1ZX0pO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqXHJcbiAgKiBzdGFnZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgc3ByaXRlLnNheSh0aGlzLmRpc3RhbmNlVG8odGhpcy5tb3VzZVgsIHRoaXMubW91c2VZKSlcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLm90aGVyU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIG90aGVyU3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqXHJcbiAgKiBzdGFnZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgc3ByaXRlLnNheSh0aGlzLmRpc3RhbmNlVG8ob3RoZXJTcHJpdGUueCwgb3RoZXJTcHJpdGUueSkpXHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0geCAtIHRoZSB4IGNvb3JkaW5hdGUuXHJcbiAgKiBAcGFyYW0ge251bWJlcn0geSAtIHRoZSB5IGNvb3JkaW5hdGUuXHJcbiAgKiBAcmV0dXJuIHtudW1iZXJ9IC0gZGlzdGFuY2UgaW4gcGl4ZWxzIHRvIHBvc2l0aW9uIG9uIHNjcmVlbiAobm90IHJvdW5kZWQpLlxyXG4gICovXHJcbiAgZGlzdGFuY2VUbyAoeCwgeSkge1xyXG4gICAgY29uc3QgZHggPSB0aGlzLnggLSB4XHJcbiAgICBjb25zdCBkeSA9IHRoaXMueSAtIHlcclxuXHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KChkeCAqIGR4KSArIChkeSAqIGR5KSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogdG91Y2hpbmdFZGdlIC0gQ2hlY2tzIGlzIHRoaXMgc3ByaXRlIHRvdWNoZXMgdGhlIGVkZ2Ugb2YgdGhlIHN0YWdlIGFuZCByZXR1cm5zIHRoZSBlZGdlIHRvdWNoZWQuXHJcbiAgKlxyXG4gICogTm90ZXM6XHJcbiAgKiAxLiBUaGlzIGlzIGJhc2VkIG9uIHJlY3Rhbmd1bGFyIGNvbGxpc2lvbiBkZXRlY3Rpb24uXHJcbiAgKiAyLiB0aGlzIGNvbXBhcmVzIGEgbmFpdmUgcmVjdGFuZ2xlLCBzbyBpZiB0aGUgc3ByaXRlIGlzIHJvdGF0ZWQgdG91Y2hpbmcgbWlnaHQgYmUgc2Vuc2VkIGVhcmx5IG9yIGxhdGUuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogIHdoaWxlKHRoaXMueCA8IHN0YWdlLndpZHRoIC8gMikge1xyXG4gICogICAgdGhpcy5tb3ZlKDEwKVxyXG4gICogICAgdGhpcy5zYXkodGhpcy50b3VjaGluZ0VkZ2UoKSk7XHJcbiAgKiAgIH1cclxuICAqIH0pO1xyXG4gICpcclxuICAqIEByZXR1cm4ge3N0cmluZ30gLSB0aGUgc2lkZSBvZiB0aGUgc3RhZ2UgdGhhdCBpcyB0b3VjaGVkIChudWxsLCB0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHQpXHJcbiAgKi9cclxuICB0b3VjaGluZ0VkZ2UgKCkge1xyXG4gICAgLy8gY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KClcclxuICAgIGNvbnN0IGNvbGxpZGVkID0gdGhpcy5jb2xsaXNpb25EZXRlY3Rvci5pc1Nwcml0ZVRvdWNoaW5nRWRnZSh7XHJcbiAgICAgIGltYWdlOiB0aGlzLmNvc3R1bWUuaW1hZ2UsXHJcbiAgICAgIHg6IHRoaXMueCxcclxuICAgICAgeTogdGhpcy55LFxyXG4gICAgICB3OiB0aGlzLndpZHRoLFxyXG4gICAgICBoOiB0aGlzLmhlaWdodFxyXG4gICAgfSlcclxuICAgIC8vIGNvbnNvbGUubG9nKGBQcm9jZXNzIFRpbWU6ICR7cGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFRpbWV9YClcclxuXHJcbiAgICByZXR1cm4gY29sbGlkZWRcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogaXNUb3VjaGluZ0VkZ2UgLSBDaGVja3MgaXMgdGhpcyBzcHJpdGUgdG91Y2hlcyB0aGUgZWRnZS5cclxuICAqXHJcbiAgKiBOb3RlczpcclxuICAqIDEuIFRoaXMgaXMgYmFzZWQgb24gcmVjdGFuZ3VsYXIgY29sbGlzaW9uIGRldGVjdGlvbi5cclxuICAqIDIuIHRoaXMgY29tcGFyZXMgYSBuYWl2ZSByZWN0YW5nbGUsIHNvIGlmIHRoZSBzcHJpdGUgaXMgcm90YXRlZCB0b3VjaGluZyBtaWdodCBiZSBzZW5zZWQgZWFybHkgb3IgbGF0ZS5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgd2hpbGUodGhpcy54IDwgc3RhZ2Uud2lkdGggLyAyKSB7XHJcbiAgKiAgICB0aGlzLm1vdmUoMTApXHJcbiAgKiAgICB0aGlzLnNheSh0aGlzLmlzVG91Y2hpbmdFZGdlKCkpO1xyXG4gICogICB9XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcmV0dXJuIHtib29sZWFufSAtIGlzIHRoZSBzcHJpdGUgdG91Y2hpbmcgdGhlIGVkZ2UuXHJcbiAgKi9cclxuICBpc1RvdWNoaW5nRWRnZSAoKSB7XHJcbiAgICByZXR1cm4gISF0aGlzLnRvdWNoaW5nRWRnZSgpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHRvdWNoaW5nIC0gQ2hlY2tzIGlzIHRoaXMgc3ByaXRlIHRvdWNoZXMgYW5vdGhlciBhbmQgcmV0dXJucyBhdCB3aGF0IHNpZGUgaXQgdG91Y2hlcy5cclxuICAqXHJcbiAgKiBOb3RlczpcclxuICAqIDEuIHRoaXMgY29tcGFyZXMgYSBuYWl2ZSByZWN0YW5nbGUsIHNvIGlmIHRoZSBzcHJpdGUgaXMgcm90YXRlZCB0b3VjaGluZyBtaWdodCBiZSBzZW5zZWQgZWFybHkgb3IgbGF0ZS5cclxuICAqIDIuIGlmIHRoZSBzcHJpdGUgaGFzIGdvbmUgXCJpbnRvXCIgdGhlIG90aGVyIHRoZSBzaWRlIFwicGVuZXRyYXRlZCBtb3JlXCIgd2lsbCBiZSByZXR1cm5lZC5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKiBsZXQgb3RoZXJTcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBvdGhlclNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBvdGhlclNwcml0ZS5tb3ZlKDIwMCk7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogIHdoaWxlKCF0aGlzLnRvdWNoaW5nKG90aGVyU3ByaXRlKSkge1xyXG4gICogICAgdGhpcy5tb3ZlKDEwKTtcclxuICAqICAgIHRoaXMuc2F5KHRoaXMudG91Y2hpbmcob3RoZXJTcHJpdGUpKVxyXG4gICogICB9XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gc3ByaXRlIC0gdGhlIHNwcml0ZSB0byBjaGVjayBpZiB0b3VjaGluZy5cclxuICAqIEByZXR1cm4ge3N0cmluZ30gLSB0aGUgc2lkZSBvZiB0aGUgc3ByaXRlIHRoYXQgaXMgdG91Y2hlZCAobnVsbCwgdG9wLCBib3R0b20sIGxlZnQsIHJpZ2h0KVxyXG4gICovXHJcbiAgdG91Y2hpbmcgKHNwcml0ZSkge1xyXG4gICAgLy8gY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KClcclxuICAgIGlmICghc3ByaXRlLnNob3dpbmcgfHwgIXRoaXMuc2hvd2luZykgcmV0dXJuIGZhbHNlIC8vIElmIGVpdGhlciBzcHJpdGUgaXMgbm90IHNob3dpbmcsIHRoZSBjYW5ub3QgY29sbGlkZVxyXG5cclxuICAgIGNvbnN0IGNvbGxpZGVkID0gdGhpcy5jb2xsaXNpb25EZXRlY3Rvci5kb1Nwcml0ZXNPdmVybGFwKFxyXG4gICAgICB7XHJcbiAgICAgICAgaW1hZ2U6IHRoaXMuY29zdHVtZS5pbWFnZSxcclxuICAgICAgICB4OiB0aGlzLngsXHJcbiAgICAgICAgeTogdGhpcy55LFxyXG4gICAgICAgIHc6IHRoaXMud2lkdGgsXHJcbiAgICAgICAgaDogdGhpcy5oZWlnaHRcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGltYWdlOiBzcHJpdGUuY29zdHVtZS5pbWFnZSxcclxuICAgICAgICB4OiBzcHJpdGUueCxcclxuICAgICAgICB5OiBzcHJpdGUueSxcclxuICAgICAgICB3OiBzcHJpdGUud2lkdGgsXHJcbiAgICAgICAgaDogc3ByaXRlLmhlaWdodFxyXG4gICAgICB9XHJcbiAgICApXHJcbiAgICAvLyBjb25zb2xlLmxvZyhgUHJvY2VzcyBUaW1lOiAke3BlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lfWApXHJcblxyXG4gICAgcmV0dXJuIGNvbGxpZGVkXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGlzVG91Y2hpbmcgLSBDaGVja3MgaXMgdGhpcyBzcHJpdGUgdG91Y2hlcyBhbm90aGVyLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqIGxldCBvdGhlclNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIG90aGVyU3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIG90aGVyU3ByaXRlLm1vdmUoMjAwKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgd2hpbGUoIXRoaXMuaXNUb3VjaGluZyhvdGhlclNwcml0ZSkpIHtcclxuICAqICAgIHRoaXMubW92ZSgxMCk7XHJcbiAgKiAgIH1cclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSBzcHJpdGUgLSB0aGUgc3ByaXRlIHRvIGNoZWNrIGlmIHRvdWNoaW5nLlxyXG4gICogQHJldHVybiB7Ym9vbGVhbn0gLSBpcyB0aGUgc3ByaXRlIHRvdWNoaW5nIHRoZSBzcGVjaWZpZWQgc3ByaXRlLlxyXG4gICovXHJcbiAgaXNUb3VjaGluZyAoc3ByaXRlKSB7XHJcbiAgICByZXR1cm4gISF0aGlzLnRvdWNoaW5nKHNwcml0ZSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogdG91Y2hpbmdCYWNrZHJvcENvbG9yIC0gUmV0dXJucyB0aGUgaGV4IHZhbHVlIHRvIGFsbCBwaXhlbHMgaW4gYmFja2Ryb3AgYXJlYSBjb3ZlcmVkIGJ5IHRoZSBzcHJpdGUgcmVjdGFuZ2xlLlxyXG4gICpcclxuICAqIE5vdGVzOlxyXG4gICogMS4gVGhpcyBpcyBiYXNlZCBvbiByZWN0YW5ndWxhciBjb2xsaXNpb24gZGV0ZWN0aW9uLlxyXG4gICogMi4gVGhpcyBjb21wYXJlcyBhIG5haXZlIHJlY3RhbmdsZSwgc28gaWYgdGhlIHNwcml0ZSBpcyByb3RhdGVkIHRvdWNoaW5nIG1pZ2h0IGJlIHNlbnNlZCBlYXJseSBvciBsYXRlLlxyXG4gICogMy4gVGhlIGJhY2tkcm9wIGltYWdlIG11c3QgYmUgYSBsb2NhbCBpbWFnZSBzZXJ2ZWQgZnJvbSBzYW1lIG9yaWdpbi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3ByaXRlLmFkZFRvKHN0YWdlKTtcclxuICAqIHNwcml0ZS53aGVuQ2xpY2tlZCggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHdoaWxlKHRydWUpe1xyXG4gICogICAgIGxldCB0b3VjaGVkQ29sb3JzID0gdGhpcy50b3VjaGluZ0JhY2tkcm9wQ29sb3IoKTtcclxuICAqICAgICB0aGlzLnNheSh0b3VjaGVkQ29sb3JzKTtcclxuICAqICAgICB0aGlzLm1vdmUoNSk7XHJcbiAgKiAgIH1cclxuICAqIH0pO1xyXG4gICpcclxuICAqIEByZXR1cm4ge2FycmF5fSAtIGNvbG9ycyAoc3RyaW5ncykgdG91Y2hlZC5cclxuICAqL1xyXG4gIHRvdWNoaW5nQmFja2Ryb3BDb2xvciAoKSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBbXVxyXG5cclxuICAgIC8qKlxyXG4gICAgKiByZ2JUb0hleCAtIGNvbnZlcnRzIGEgY29sb3IgZGVmaW5lZCBieSBSR0IgdmFsdWVzIGludG8gYSBvbiBkZWZpbmVkIGFzIGEgaGV4IHN0cmluZy5cclxuICAgICpcclxuICAgICogRnJvbTogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiXHJcbiAgICAqXHJcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSByIC0gdGhlIHJlZCB2YWx1ZSAoMCB0byAyNTUpLlxyXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZyAtIHRoZSBncmVlbiB2YWx1ZSAoMCB0byAyNTUpLlxyXG4gICAgKiBAcGFyYW0ge251bWJlcn0gYiAtICB0aGUgYmx1ZSB2YWx1ZSAoMCB0byAyNTUpLlxyXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gaGV4IGNvbG9yIHN0cmluZy5cclxuICAgICovXHJcbiAgICBmdW5jdGlvbiByZ2JUb0hleCAociwgZywgYikge1xyXG4gICAgICByZXR1cm4gYCMkeygoMSA8PCAyNCkgKyAociA8PCAxNikgKyAoZyA8PCA4KSArIGIpLnRvU3RyaW5nKDE2KS5zbGljZSgxKX1gIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tYml0d2lzZVxyXG4gICAgfVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGJhY2tkcm9wQ29udGV4dCA9IHRoaXMuYWdhaW5zdEJhY2tkcm9wLmdldENvbnRleHQoJzJkJylcclxuICAgICAgY29uc3QgZGF0YSA9IGJhY2tkcm9wQ29udGV4dC5nZXRJbWFnZURhdGEoKCh0aGlzLnN0YWdlV2lkdGggLyAyKSAtICh0aGlzLndpZHRoIC8gMikpICsgdGhpcy54LCAoKHRoaXMuc3RhZ2VIZWlnaHQgLyAyKSAtICh0aGlzLmhlaWdodCAvIDIpKSAtIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpLmRhdGFcclxuXHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkgKz0gNCkge1xyXG4gICAgICAgIGRhdGFbaSArIDNdICE9PSAwID8gcmVzdWx0LnB1c2gocmdiVG9IZXgoZGF0YVtpXSwgZGF0YVtpICsgMV0sIGRhdGFbaSArIDJdKSkgOiBudWxsXHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5sb2coJ0Jsb2NrTGlrZS5qcyBOb3RpY2U6IGlzVG91Y2hpbmdCYWNrZHJvcENvbG9yKCkgaW5nbm9yZWQuIEJhY2tkcm9wIGltYWdlIGNhbiBub3QgYmUgbG9jYXRlZCBhdCBhIHJlbW90ZSBvcmlnaW4uJykgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChyZXN1bHQpKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBpc1RvdWNoaW5nQmFja2Ryb3BDb2xvciAtIGNvbXBhcmVzIGEgZ2l2ZW4gaGV4IHZhbHVlIHRvIGFsbCBwaXhlbHMgaW4gYmFja2Ryb3AgYXJlYSBjb3ZlcmVkIGJ5IHRoZSBzcHJpdGUgcmVjdGFuZ2xlLlxyXG4gICogSWYgYSBtYXRjaCBpcyBmb3VuZCB0aGUgY29sb3IgaXMgcmV0dXJuZWQuXHJcbiAgKlxyXG4gICogTm90ZXM6XHJcbiAgKiAxLiBUaGlzIGlzIGJhc2VkIG9uIHJlY3Rhbmd1bGFyIGNvbGxpc2lvbiBkZXRlY3Rpb24uXHJcbiAgKiAyLiBUaGlzIGNvbXBhcmVzIGEgbmFpdmUgcmVjdGFuZ2xlLCBzbyBpZiB0aGUgc3ByaXRlIGlzIHJvdGF0ZWQgdG91Y2hpbmcgbWlnaHQgYmUgc2Vuc2VkIGVhcmx5IG9yIGxhdGUuXHJcbiAgKiAzLiBUaGUgYmFja2Ryb3AgaW1hZ2UgbXVzdCBiZSBhIGxvY2FsIGltYWdlIHNlcnZlZCBmcm9tIHNhbWUgb3JpZ2luLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzcHJpdGUuYWRkVG8oc3RhZ2UpO1xyXG4gICogbGV0IG1vdmluZyA9IHRydWU7XHJcbiAgKiBzcHJpdGUud2hlbkNsaWNrZWQoIGZ1bmN0aW9uKCkge1xyXG4gICogICB3aGlsZShtb3Zpbmcpe1xyXG4gICogICAgIHRoaXMuaXNUb3VjaGluZ0JhY2tkcm9wQ29sb3IoJyNmZjAwMDAnKSA/IG1vdmluZyA9IGZhbHNlIDogbW92aW5nID0gdHJ1ZTtcclxuICAqICAgICB0aGlzLm1vdmUoNSk7XHJcbiAgKiAgIH1cclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7c3RyaW5nfSBiYWNrZHJvcENvbG9yIC0gdGhlIGNvbG9yIHRvIGV2YWx1YXRlLlxyXG4gICogQHJldHVybiB7Ym9vbGVhbn0gLSBkb2VzIHRoZSBzcHJpdGUgdG91Y2ggdGhlIGNvbG9yLlxyXG4gICovXHJcbiAgaXNUb3VjaGluZ0JhY2tkcm9wQ29sb3IgKGJhY2tkcm9wQ29sb3IpIHtcclxuICAgIGNvbnN0IGhleEFyciA9IHRoaXMudG91Y2hpbmdCYWNrZHJvcENvbG9yKGJhY2tkcm9wQ29sb3IpXHJcblxyXG4gICAgcmV0dXJuIGhleEFyci5pbmNsdWRlcyhiYWNrZHJvcENvbG9yKVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBjc3MgZnJvbSAnLi9lbGVtZW50LWNzcydcclxuXHJcbi8qKlxyXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgdGhlIFVJIEVsZW1lbnQgb2YgdGhlIHN0YWdlLlxyXG4gKiBFYWNoIFN0YWdlIGhhcyBvbmUuXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFnZUVsZW1lbnQge1xyXG4gIC8qKlxyXG4gICogY29uc3RydWN0b3IgLSBDcmVhdGVzIGEgU3RhZ2UgRWxlbWVudC5cclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIHRoZSBzdGFnZSBmb3Igd2hpY2ggdGhlIGVsZW1lbnQgaXMgY3JlYXRlZC5cclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzdGFnZSAtIHRoZSBzdGFnZSBjcmVhdGVkLlxyXG4gICovXHJcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMsIHN0YWdlKSB7XHJcbiAgICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcblxyXG4gICAgLyoqXHJcbiAgICAqIGNyZWF0ZURpdiAtIGNyZWF0ZXMgYSBkaXYgYXQgc3BlY2lmaWVkIHpJbmRleC5cclxuICAgICpcclxuICAgICogQHBhcmFtIHtudW1iZXJ9IHpJbmRleCAtIGRlc2lyZWQgcGxhY2UgaW4gXCJzdGFja1wiXHJcbiAgICAqIEByZXR1cm4ge29iamVjdH0gLSBhIHN0YWdlIHdpZGUvaGlnaCBET00gZWxlbWVudC5cclxuICAgICovXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVEaXYgKHpJbmRleCkge1xyXG4gICAgICBjb25zdCBzZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG5cclxuICAgICAgc2VsLnN0eWxlLndpZHRoID0gYCR7b3B0aW9ucy53aWR0aH1weGBcclxuICAgICAgc2VsLnN0eWxlLmhlaWdodCA9IGAke29wdGlvbnMuaGVpZ2h0fXB4YFxyXG4gICAgICBzZWwuc3R5bGUuekluZGV4ID0gekluZGV4XHJcbiAgICAgIHNlbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcclxuICAgICAgc2VsLnN0eWxlLnRvdWNoQWN0aW9uID0gJ21hbmlwdWxhdGlvbidcclxuXHJcbiAgICAgIHJldHVybiBzZWxcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICogY3JlYXRlQ2FudmFzIC0gY3JlYXRlcyBhIGNhbnZhcyBhdCBzcGVjaWZpZWQgekluZGV4LlxyXG4gICAgKlxyXG4gICAgKiBAcGFyYW0ge251bWJlcn0gekluZGV4IC0gZGVzaXJlZCBwbGFjZSBpbiBcInN0YWNrXCJcclxuICAgICogQHJldHVybiB7b2JqZWN0fSAtIGEgc3RhZ2Ugd2lkZS9oaWdoIERPTSBlbGVtZW50LlxyXG4gICAgKi9cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNhbnZhcyAoekluZGV4KSB7XHJcbiAgICAgIGNvbnN0IGNlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcblxyXG4gICAgICBjZWwud2lkdGggPSBvcHRpb25zLndpZHRoXHJcbiAgICAgIGNlbC5oZWlnaHQgPSBvcHRpb25zLmhlaWdodFxyXG4gICAgICBjZWwuc3R5bGUuekluZGV4ID0gekluZGV4XHJcbiAgICAgIGNlbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcclxuICAgICAgY2VsLnN0eWxlLmxlZnQgPSAnMHB4J1xyXG4gICAgICBjZWwuc3R5bGUudG9wID0gJzBweCdcclxuXHJcbiAgICAgIHJldHVybiBjZWxcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICogY3JlYXRlRmxhZyAtIGNyZWF0ZXMgYSBcImZsYWdcIiBkaXYuXHJcbiAgICAqXHJcbiAgICAqIEByZXR1cm4ge29iamVjdH0gLSBhIHN0YWdlIHdpZGUvaGlnaCBET00gZWxlbWVudCB3aXRoIGZsYWcgYXQgY2VudGVycy5cclxuICAgICovXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVGbGFnICgpIHtcclxuICAgICAgY29uc3QgZmxhZ1NpemUgPSAxMzBcclxuICAgICAgY29uc3QgZmVsID0gY3JlYXRlRGl2KC0xKVxyXG5cclxuICAgICAgY29uc3QgZmVsaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcblxyXG4gICAgICAvLyBDb252ZXJ0IHRoZSBjZW50ZXIgYmFzZWQgeCBjb29yZGluYXRlIHRvIGEgbGVmdCBiYXNlZCBvbmUuXHJcbiAgICAgIGNvbnN0IHggPSAtKGZsYWdTaXplIC8gMilcclxuICAgICAgLy8gQ29udmVydCB0aGUgY2VudGVyIGJhc2VkIHkgY29vcmRpbmF0ZSB0byBhIGxlZnQgYmFzZWQgb25lLlxyXG4gICAgICBjb25zdCB5ID0gLShmbGFnU2l6ZSAvIDIpXHJcblxyXG4gICAgICAvLyBsb29rc1xyXG4gICAgICBmZWxpdGVtLnN0eWxlLndpZHRoID0gYCR7ZmxhZ1NpemV9cHhgXHJcbiAgICAgIGZlbGl0ZW0uc3R5bGUuaGVpZ2h0ID0gYCR7ZmxhZ1NpemV9cHhgXHJcbiAgICAgIGZlbGl0ZW0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgIGZlbGl0ZW0uaW5uZXJIVE1MID0gJyYjOTg3MzsnXHJcblxyXG4gICAgICBmZWxpdGVtLnN0eWxlLmxlZnQgPSBgJHsob3B0aW9ucy53aWR0aCAvIDIpICsgeH1weGBcclxuICAgICAgZmVsaXRlbS5zdHlsZS50b3AgPSBgJHsob3B0aW9ucy5oZWlnaHQgLyAyKSArIHl9cHhgXHJcbiAgICAgIGZlbGl0ZW0uY2xhc3NOYW1lID0gJ2Jsb2NrbGlrZS1mbGFnJ1xyXG5cclxuICAgICAgZmVsLmFwcGVuZENoaWxkKGZlbGl0ZW0pXHJcbiAgICAgIGZlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcblxyXG4gICAgICByZXR1cm4gZmVsXHJcbiAgICB9XHJcblxyXG4gICAgZWwuaWQgPSBgJHtzdGFnZS5pZH1gXHJcblxyXG4gICAgZWwuc3R5bGUud2lkdGggPSBgJHtvcHRpb25zLndpZHRofXB4YFxyXG4gICAgZWwuc3R5bGUuaGVpZ2h0ID0gYCR7b3B0aW9ucy5oZWlnaHR9cHhgXHJcblxyXG4gICAgZWwuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnXHJcbiAgICBlbC5zdHlsZS5ib3hTaXppbmcgPSAnYm9yZGVyLWJveCdcclxuICAgIGVsLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbidcclxuXHJcbiAgICBvcHRpb25zLnBhcmVudC5hcHBlbmRDaGlsZChlbClcclxuXHJcbiAgICB0aGlzLmJhY2tkcm9wQ29udGFpbmVyID0gY3JlYXRlQ2FudmFzKDApXHJcbiAgICB0aGlzLmJhY2tkcm9wQ29udGFpbmVyLmlkID0gYCR7c3RhZ2UuaWR9LWJhY2tkcm9wYFxyXG4gICAgdGhpcy5iYWNrZHJvcENvbnRhaW5lci5jbGFzc05hbWUgPSAnYmxvY2tsaWtlLXBhbmVsLWJhY2tkcm9wJ1xyXG4gICAgZWwuYXBwZW5kQ2hpbGQodGhpcy5iYWNrZHJvcENvbnRhaW5lcilcclxuXHJcbiAgICB0aGlzLmNhbnZhcyA9IGNyZWF0ZUNhbnZhcygwKVxyXG4gICAgdGhpcy5jYW52YXMuaWQgPSBgJHtzdGFnZS5pZH0tc3VyZmFjZWBcclxuICAgIHRoaXMuY2FudmFzLmNsYXNzTmFtZSA9ICdibG9ja2xpa2UtcGFuZWwtc3VyZmFjZSdcclxuICAgIGVsLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKVxyXG5cclxuICAgIHRoaXMuZmxhZyA9IGNyZWF0ZUZsYWcoKVxyXG4gICAgdGhpcy5mbGFnLmlkID0gYCR7c3RhZ2UuaWR9LWZsYWdgXHJcbiAgICB0aGlzLmZsYWcuY2xhc3NOYW1lID0gJ2Jsb2NrbGlrZS1wYW5lbC1mbGFnJ1xyXG4gICAgZWwuYXBwZW5kQ2hpbGQodGhpcy5mbGFnKVxyXG5cclxuICAgIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJylcclxuXHJcbiAgICB0aGlzLmVsID0gZWxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogdXBkYXRlIC0gdXBkYXRlcyB0aGUgRE9NIGVsZW1lbnQuXHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHN0YWdlIC0gdGhlIHN0YWdlIHRvIHVwZGF0ZS5cclxuICAqL1xyXG4gIHVwZGF0ZSAoc3RhZ2UpIHtcclxuICAgIGNvbnN0IGVsID0gc3RhZ2UuZWxlbWVudC5lbFxyXG4gICAgY29uc3QgYmFja2Ryb3BDb250ZXh0ID0gc3RhZ2UuZWxlbWVudC5iYWNrZHJvcENvbnRhaW5lci5nZXRDb250ZXh0KCcyZCcpXHJcblxyXG4gICAgbGV0IG1hcmdpblRCID0gMFxyXG4gICAgaWYgKHN0YWdlLmVsZW1lbnQuZWwucGFyZW50RWxlbWVudC50YWdOYW1lID09PSAnQk9EWScpIHtcclxuICAgICAgbWFyZ2luVEIgPSBNYXRoLmZsb29yKCh3aW5kb3cuaW5uZXJIZWlnaHQgLSBzdGFnZS5oZWlnaHQpIC8gMilcclxuICAgICAgbWFyZ2luVEIgPCAwID8gbWFyZ2luVEIgPSAwIDogbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIGNvbG9yIC0gZmlsbCB0aGUgY2FudmFzIHdpdGggdGhlIGNvbG9yIHNldCwgb3IgY2xlYXIgaXRcclxuICAgIGlmIChzdGFnZS5iYWNrZHJvcCAmJiBzdGFnZS5iYWNrZHJvcC5jb2xvcikge1xyXG4gICAgICBiYWNrZHJvcENvbnRleHQucmVjdCgwLCAwLCBzdGFnZS53aWR0aCwgc3RhZ2UuaGVpZ2h0KVxyXG4gICAgICBiYWNrZHJvcENvbnRleHQuZmlsbFN0eWxlID0gc3RhZ2UuYmFja2Ryb3AuY29sb3JcclxuICAgICAgYmFja2Ryb3BDb250ZXh0LmZpbGwoKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYmFja2Ryb3BDb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBzdGFnZS53aWR0aCwgc3RhZ2UuaGVpZ2h0KVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIGltYWdlIC0gZHJhdyB0aGUgaW1hZ2Ugb24gY2FudmFzXHJcbiAgICBpZiAoc3RhZ2UuYmFja2Ryb3AgJiYgc3RhZ2UuYmFja2Ryb3AuaW1hZ2UpIHtcclxuICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKClcclxuICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICBiYWNrZHJvcENvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCwgc3RhZ2Uud2lkdGgsIHN0YWdlLmhlaWdodClcclxuICAgICAgfVxyXG4gICAgICBpbWcuc3JjID0gc3RhZ2UuYmFja2Ryb3AuaW1hZ2VcclxuICAgIH1cclxuXHJcbiAgICAvLyB6b29tIGFuZCBwbGFjZW1lbnRcclxuICAgIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGBzY2FsZSgke3N0YWdlLm1hZ25pZmljYXRpb24gLyAxMDB9KWBcclxuICAgIGVsLnN0eWxlLm1hcmdpbiA9IGAke21hcmdpblRCfXB4IGF1dG9gXHJcblxyXG4gICAgLy8gY3NzIHJ1bGVzXHJcbiAgICBjc3MuYXBwbHkoc3RhZ2UpXHJcblxyXG4gICAgLy8gY3NzIGNsYXNzZXNcclxuICAgIHN0YWdlLmJhY2tkcm9wID8gZWwuY2xhc3NOYW1lID0gc3RhZ2UuYmFja2Ryb3AuY2xhc3Nlcy5jb25jYXQoc3RhZ2UuY2xhc3Nlcykuam9pbignICcpIDogZWwuY2xhc3NOYW1lID0gc3RhZ2UuY2xhc3Nlcy5qb2luKCcgJylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogZGVsZXRlIC0gZGVsZXRlcyB0aGUgRE9NIGVsZW1lbnRcclxuICAqL1xyXG4gIGRlbGV0ZSAoc3RhZ2UpIHtcclxuICAgIGNvbnN0IGVsID0gc3RhZ2UuZWxlbWVudC5lbFxyXG5cclxuICAgIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpXHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBhZGRGbGFnIC0gcHV0cyB0aGUgZmxhZyBkaXYgaW5mcm9udCBvZiBldmVyeXRoaW5nIChzaG93cyBpdClcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3RhZ2UgLSB0aGUgc3RhZ2UgdGhhdCBcInJlcXVlc3RlZFwiIHRoZSBmbGFnLlxyXG4gICovXHJcbiAgYWRkRmxhZyAoc3RhZ2UpIHtcclxuICAgIGNvbnN0IGVsID0gc3RhZ2UuZWxlbWVudC5mbGFnXHJcblxyXG4gICAgZWwuc3R5bGUuekluZGV4ID0gMTAwMFxyXG4gICAgZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogcmVtb3ZlRmxhZyAtIHB1dHMgdGhlIGZsYWcgZGl2IGF0IHRoZSBiYWNrIChoaWRlcyBpdClcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3RhZ2UgLSB0aGUgc3RhZ2UgdGhhdCBcInJlcXVlc3RlZFwiIHRoZSBmbGFnLlxyXG4gICovXHJcbiAgcmVtb3ZlRmxhZyAoc3RhZ2UpIHtcclxuICAgIGNvbnN0IGVsID0gc3RhZ2UuZWxlbWVudC5mbGFnXHJcblxyXG4gICAgZWwuc3R5bGUuekluZGV4ID0gLTFcclxuICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICB9XHJcbn1cclxuIiwiLyoqXHJcbiogRW5jYXBzdWxhdGVzIHRoZSBzdGFnZSBzZW5zaW5nIGZ1bmN0aW9uYWxpdHkuXHJcbiovXHJcblxyXG4vKipcclxuKiBlbmFibGUgLSBFbmFibGVzIHNlbnNpbmcgb2YgZG9jdW1lbnQgbGV2ZWwgZXZlbnRzIChrZXlkb3duLCBtb3VzZW1vdmUsIG1vdXNlZG93biwgdG91Y2htb3ZlKVxyXG4qL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBlbmFibGUgKHN0YWdlKSB7XHJcbiAgY29uc3QgbWUgPSBzdGFnZVxyXG4gIG1lLnNlbnNpbmcgPSB0cnVlXHJcblxyXG4gIC8qKlxyXG4gICogZGVjaW1hbFJvdW5kIC0gcm91bmRzIGEgbnVtYmVyIHRvbyBkZWNpbWFsIHBvaW50cy5cclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSB0aGUgdmFsdWUgdG8gcm91bmQuXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gcG9pbnRzIC0gaG93IG1hbnkgZGVjaW1hbCBwb2ludHMgdG8gbGVhdmUuXHJcbiAgKi9cclxuICBmdW5jdGlvbiBkZWNpbWFsUm91bmQgKHZhbHVlLCBwb2ludHMpIHtcclxuICAgIHJldHVybiBNYXRoLnJvdW5kKHZhbHVlICogKDEwICoqIHBvaW50cykpIC8gKDEwICoqIHBvaW50cylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogY29tcHV0ZVggLSBDb21wdXRlcyBjZW50ZXJlZCB4IGJhc2VkIG9uIHggZXh0cmFjdGVkIGZyb20gZXZlbnQuXHJcbiAgKi9cclxuICBmdW5jdGlvbiBjb21wdXRlWCAoeCkge1xyXG4gICAgY29uc3QgbWFnID0gbWUubWFnbmlmaWNhdGlvbiAvIDEwMFxyXG4gICAgcmV0dXJuIGRlY2ltYWxSb3VuZCgoeCAtIChtZS5lbGVtZW50LmVsLm9mZnNldExlZnQpIC0gKG1lLndpZHRoIC8gMikpIC8gbWFnLCAyKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBjb21wdXRlWSAtIENvbXB1dGVzIGNlbnRlcmVkIHkgYmFzZWQgb24geSBleHRyYWN0ZWQgZnJvbSBldmVudC5cclxuICAqL1xyXG4gIGZ1bmN0aW9uIGNvbXB1dGVZICh5KSB7XHJcbiAgICBjb25zdCBtYWcgPSBtZS5tYWduaWZpY2F0aW9uIC8gMTAwXHJcbiAgICByZXR1cm4gZGVjaW1hbFJvdW5kKCgteSArIG1lLmVsZW1lbnQuZWwub2Zmc2V0VG9wICsgKG1lLmhlaWdodCAvIDIpKSAvIG1hZywgMilcclxuICB9XHJcblxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgZS5rZXkgJiYgbWUua2V5c0tleS5pbmRleE9mKGUua2V5LnRvTG93ZXJDYXNlKCkpID09PSAtMSA/IG1lLmtleXNLZXkucHVzaChlLmtleS50b0xvd2VyQ2FzZSgpKSA6IG51bGxcclxuICAgIGUuY29kZSAmJiBtZS5rZXlzQ29kZS5pbmRleE9mKGUuY29kZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEgPyBtZS5rZXlzQ29kZS5wdXNoKGUuY29kZS50b0xvd2VyQ2FzZSgpKSA6IG51bGxcclxuICAgIG1lLmtleXNLZXlDb2RlLmluZGV4T2YoZS5rZXlDb2RlKSA9PT0gLTEgPyBtZS5rZXlzS2V5Q29kZS5wdXNoKGUua2V5Q29kZSkgOiBudWxsXHJcbiAgfSlcclxuXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xyXG4gICAgZS5rZXkgPyBtZS5rZXlzS2V5ID0gbWUua2V5c0tleS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gIT09IGUua2V5LnRvTG93ZXJDYXNlKCkpIDogbnVsbFxyXG4gICAgZS5jb2RlID8gbWUua2V5c0NvZGUgPSBtZS5rZXlzQ29kZS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gIT09IGUuY29kZS50b0xvd2VyQ2FzZSgpKSA6IG51bGxcclxuICAgIG1lLmtleXNLZXlDb2RlID0gbWUua2V5c0tleUNvZGUuZmlsdGVyKChpdGVtKSA9PiBpdGVtICE9PSBlLmtleUNvZGUpXHJcbiAgfSlcclxuXHJcbiAgbWUuZWxlbWVudC5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xyXG4gICAgbWUubW91c2VYID0gY29tcHV0ZVgoZS5jbGllbnRYKVxyXG4gICAgbWUubW91c2VZID0gY29tcHV0ZVkoZS5jbGllbnRZKVxyXG4gIH0pXHJcblxyXG4gIG1lLmVsZW1lbnQuZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgKGUpID0+IHtcclxuICAgIG1lLm1vdXNlWCA9IGNvbXB1dGVYKGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WClcclxuICAgIG1lLm1vdXNlWSA9IGNvbXB1dGVZKGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSlcclxuICB9LCB7IHBhc3NpdmU6IHRydWUgfSlcclxuXHJcbiAgbWUuZWxlbWVudC5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoKSA9PiB7XHJcbiAgICBtZS5tb3VzZURvd24gPSB0cnVlXHJcbiAgfSlcclxuICBtZS5lbGVtZW50LmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoKSA9PiB7XHJcbiAgICBtZS5tb3VzZURvd24gPSBmYWxzZVxyXG4gIH0pXHJcblxyXG4gIG1lLmVsZW1lbnQuZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIChlKSA9PiB7XHJcbiAgICBtZS5tb3VzZVggPSBjb21wdXRlWChlLnRvdWNoZXNbMF0uY2xpZW50WClcclxuICAgIG1lLm1vdXNlWSA9IGNvbXB1dGVZKGUudG91Y2hlc1swXS5jbGllbnRZKVxyXG4gICAgbWUubW91c2VEb3duID0gdHJ1ZVxyXG4gIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KVxyXG5cclxuICBtZS5lbGVtZW50LmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgKCkgPT4ge1xyXG4gICAgbWUubW91c2VEb3duID0gZmFsc2VcclxuICAgIG1lLm1vdXNlWCA9IG51bGxcclxuICAgIG1lLm1vdXNlWSA9IG51bGxcclxuICB9KVxyXG59XHJcbiIsIi8qKlxyXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgdGhlIHN0YWdlIHN1cmZhY2Ugb24gd2hpY2ggc3ByaXRlcyBkcmF3LlxyXG4gKiBFYWNoIFN0YWdlIGhhcyBvbmUuXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFnZVN1cmZhY2Uge1xyXG4gIC8qKlxyXG4gICogY29uc3RydWN0b3IgLSBDcmVhdGVzIGEgU3RhZ2UuXHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHN0YWdlIC0gdGhlIHN0YWdlIG9uIHdoaWNoIHRoZSBzcHJpdGUgaXMgZHJhd2luZy5cclxuICAqL1xyXG4gIGNvbnN0cnVjdG9yIChzdGFnZSkge1xyXG4gICAgdGhpcy5jb250ZXh0ID0gc3RhZ2UuZWxlbWVudC5jb250ZXh0XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIGRyYXcgLSBkcmF3cyBhIGxpbmUgXCJiZWhpbmRcIiBhIG1vdmluZyBzcHJpdGUuXHJcbiAgKiBOb3RlOiBzcHJpdGUgYWx3YXlzIGhhcyBjdXJyZW50IGFuZCBwcmV2aW91cyB4LHkgdmFsdWVzIHRvIGFsbG93IGRyYXdpbmcgdG8gcHJldmlvdXMgbG9jYXRpb24uXHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHNwcml0ZSAtIHRoZSBzcHJpdGUgZHJhd2luZyB0aGUgbGluZS5cclxuICAqL1xyXG4gIGRyYXcgKHNwcml0ZSkge1xyXG4gICAgaWYgKHNwcml0ZS5kcmF3aW5nKSB7XHJcbiAgICAgIHRoaXMuY29udGV4dC5iZWdpblBhdGgoKVxyXG4gICAgICB0aGlzLmNvbnRleHQubW92ZVRvKChzcHJpdGUuc3RhZ2VXaWR0aCAvIDIpICsgc3ByaXRlLngsIChzcHJpdGUuc3RhZ2VIZWlnaHQgLyAyKSArIChzcHJpdGUueSAqIC0xKSlcclxuICAgICAgdGhpcy5jb250ZXh0LmxpbmVUbygoc3ByaXRlLnN0YWdlV2lkdGggLyAyKSArIHNwcml0ZS5wcmV2WCwgKHNwcml0ZS5zdGFnZUhlaWdodCAvIDIpICsgKHNwcml0ZS5wcmV2WSAqIC0xKSlcclxuICAgICAgdGhpcy5jb250ZXh0LmxpbmVXaWR0aCA9IHNwcml0ZS5wZW5TaXplXHJcbiAgICAgIHRoaXMuY29udGV4dC5zdHJva2VTdHlsZSA9IHNwcml0ZS5wZW5Db2xvclxyXG4gICAgICB0aGlzLmNvbnRleHQuc3Ryb2tlKClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogY2xlYXIgLSBjbGVhcnMgdGhlIGNhbnZhc1xyXG4gICovXHJcbiAgY2xlYXIgKHNwcml0ZSkge1xyXG4gICAgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBzcHJpdGUuc3RhZ2VXaWR0aCwgc3ByaXRlLnN0YWdlSGVpZ2h0KVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgRW50aXR5IGZyb20gJy4vZW50aXR5J1xyXG5cclxuaW1wb3J0IFN0YWdlRWxlbWVudCBmcm9tICcuL3N0YWdlLWVsZW1lbnQnXHJcbmltcG9ydCBTdGFnZVN1cmZhY2UgZnJvbSAnLi9zdGFnZS1zdXJmYWNlJ1xyXG5pbXBvcnQgU3ByaXRlRWxlbWVudCBmcm9tICcuL3Nwcml0ZS1lbGVtZW50J1xyXG5pbXBvcnQgY29sbGlzaW9uRGV0ZWN0b3IgZnJvbSAnLi9jb2xsaXNpb24tZGV0ZWN0b3InXHJcblxyXG5pbXBvcnQgc2Vuc2luZyBmcm9tICcuL3N0YWdlLXNlbnNpbmcnXHJcblxyXG4vKipcclxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgU3RhZ2UuXHJcbiAqIEBleHRlbmRzIEVudGl0eVxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2Uoe1xyXG4gKiAgIHdpZHRoOiA2MDAsXHJcbiAqICAgaGVpZ2h0OiA0MDAsXHJcbiAqICAgcGFjZTogMTYsXHJcbiAqICAgc2Vuc2luZzogdHJ1ZSxcclxuICogICBwYXJlbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFnZS13cmFwJyksXHJcbiAqICAgYmFja2Ryb3A6IG5ldyBibG9ja0xpa2UuQmFja2Ryb3Aoe2NvbG9yOiAnI0ZGQjZDMSd9KVxyXG4gKiB9KTtcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YWdlIGV4dGVuZHMgRW50aXR5IHtcclxuICAvKipcclxuICAqIGNvbnN0cnVjdG9yIC0gQ3JlYXRlcyBhIFN0YWdlLlxyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIFN0YWdlLlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMud2lkdGggLSBUaGUgc3RhZ2Ugd2lkdGggaW4gcGl4ZWxzLiBEZWZhdWx0IGlzIGZ1bGwgd2luZG93LlxyXG4gICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuaGVpZ2h0IC0gVGhlIHN0YWdlIGhlaWdodCBpbiBwaXhlbHMuIERlZmF1bHQgaXMgZnVsbCB3aW5kb3cuXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5wYWNlIC0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gd2FpdCBmb3IgZWFjaCBwYWNlZCBtZXRob2QuICBXaWxsIGRpc2FibGUgcGFjaW5nIHdoZW4gc2V0IHRvIHplcm8uXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5wYXJlbnQgLSBUaGUgRE9NIGVsZW1lbnQgaW50byB3aGljaCB0aGUgc3RhZ2Ugd2lsbCBiZSBpbnNlcnRlZC4gRGVmYXVsdCBpcyB0aGUgYm9keS5cclxuICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmJhY2tkcm9wIC0gQSBkZWZhdWx0IEJhY2tkcm9wLlxyXG4gICogQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnNlbnNpbmcgLSBFbmFibGVzIHNlbnNpbmcgb2YgbW91c2UgbG9jYXRpb24gYW5kIHdoYXQga2V5cyBwcmVzc2VkLlxyXG4gICogSWYgdHJ1ZSwgd2lsbCBjb25zdGFudGx5IHVwZGF0ZSBzdGFnZSBwcm9wZXJ0aWVzOiBtb3VzZVgsIG1vdXNlWSwga2V5c0tleUNvZGUsIGtleXNLZXlDb2RlIGFuZCBrZXlzQ29kZSBiYXNlZCBvbiB1c2VyIGlucHV0LlxyXG4gICovXHJcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMgPSB7fSkge1xyXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQsXHJcbiAgICAgIHBhcmVudDogZG9jdW1lbnQuYm9keSxcclxuICAgICAgcGFjZTogMzMsXHJcbiAgICAgIGJhY2tkcm9wOiBudWxsXHJcbiAgICB9XHJcbiAgICBjb25zdCBhY3R1YWwgPSB7IC4uLmRlZmF1bHRzLCAuLi5vcHRpb25zIH1cclxuXHJcbiAgICBzdXBlcihhY3R1YWwucGFjZSlcclxuXHJcbiAgICAvLyBiYWNrZHJvcHNcclxuICAgIHRoaXMuYmFja2Ryb3BzID0gW11cclxuXHJcbiAgICBpZiAoYWN0dWFsLmJhY2tkcm9wKSB7XHJcbiAgICAgIHRoaXMuYmFja2Ryb3AgPSBhY3R1YWwuYmFja2Ryb3BcclxuICAgICAgdGhpcy5iYWNrZHJvcHMucHVzaCh0aGlzLmJhY2tkcm9wKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZWxlbWVudCA9IG5ldyBTdGFnZUVsZW1lbnQoYWN0dWFsLCB0aGlzKVxyXG4gICAgdGhpcy53aWR0aCA9IGFjdHVhbC53aWR0aFxyXG4gICAgdGhpcy5oZWlnaHQgPSBhY3R1YWwuaGVpZ2h0XHJcblxyXG4gICAgdGhpcy5rZXlzQ29kZSA9IFtdXHJcbiAgICB0aGlzLmtleXNLZXkgPSBbXVxyXG4gICAgdGhpcy5rZXlzS2V5Q29kZSA9IFtdXHJcblxyXG4gICAgdGhpcy5zcHJpdGVzID0gW11cclxuXHJcbiAgICB0aGlzLm1hZ25pZmljYXRpb24gPSAxMDBcclxuXHJcbiAgICB0aGlzLmNzc1J1bGVzID0gW11cclxuICAgIHRoaXMuY2xhc3NlcyA9IFtdXHJcblxyXG4gICAgdGhpcy5tb3VzZURvd24gPSBudWxsXHJcbiAgICB0aGlzLm1vdXNlWCA9IG51bGxcclxuICAgIHRoaXMubW91c2VZID0gbnVsbFxyXG5cclxuICAgIGFjdHVhbC5zZW5zaW5nID8gc2Vuc2luZyh0aGlzKSA6IG51bGxcclxuXHJcbiAgICB0aGlzLmNvbGxpc2lvbkRldGVjdG9yID0gY29sbGlzaW9uRGV0ZWN0b3IuaW5pdCh0aGlzKVxyXG5cclxuICAgIHRoaXMuZWxlbWVudC51cGRhdGUodGhpcylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogZGVsZXRlIC0gRGVsZXRlcyB0aGUgc3RhZ2UgZWxlbWVudC5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICpcclxuICAqIHN0YWdlLmRlbGV0ZSgpO1xyXG4gICovXHJcbiAgZGVsZXRlICgpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuZWxlbWVudC5kZWxldGUodGhpcylcclxuICB9XHJcblxyXG4gIC8qKiBTZXR1cCBBY3Rpb25zICogKi9cclxuXHJcbiAgLyoqXHJcbiAgKiBhZGRTcHJpdGUgLSBBZGRzIGEgc3ByaXRlIHRvIHRoZSBzdGFnZVxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgc3ByaXRlID0gbmV3IGJsb2NrTGlrZS5TcHJpdGUoKTtcclxuICAqXHJcbiAgKiBzdGFnZS5hZGRTcHJpdGUoc3ByaXRlKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gdGhlIHNwcml0ZSB0byBhZGQuXHJcbiAgKi9cclxuICBhZGRTcHJpdGUgKHNwcml0ZSkge1xyXG4gICAgY29uc3QgY3VyU3ByaXRlID0gc3ByaXRlXHJcblxyXG4gICAgY3VyU3ByaXRlLmVsZW1lbnQgPSBuZXcgU3ByaXRlRWxlbWVudChzcHJpdGUsIHRoaXMpXHJcbiAgICBjdXJTcHJpdGUuc3VyZmFjZSA9IG5ldyBTdGFnZVN1cmZhY2UodGhpcylcclxuXHJcbiAgICBjdXJTcHJpdGUuZWxlbWVudC5mbGFnID0gdGhpcy5lbGVtZW50LmZsYWdcclxuICAgIGN1clNwcml0ZS5hZ2FpbnN0QmFja2Ryb3AgPSB0aGlzLmVsZW1lbnQuYmFja2Ryb3BDb250YWluZXJcclxuXHJcbiAgICBjdXJTcHJpdGUuc3RhZ2VXaWR0aCA9IHRoaXMud2lkdGhcclxuICAgIGN1clNwcml0ZS5zdGFnZUhlaWdodCA9IHRoaXMuaGVpZ2h0XHJcblxyXG4gICAgdGhpcy5zcHJpdGVzLnB1c2goY3VyU3ByaXRlKVxyXG4gICAgY3VyU3ByaXRlLnogPSB0aGlzLnNwcml0ZXMubGVuZ3RoXHJcblxyXG4gICAgc3ByaXRlLmVsZW1lbnQudXBkYXRlKGN1clNwcml0ZSlcclxuXHJcbiAgICB0aGlzLmNvbGxpc2lvbkRldGVjdG9yLnJlZnJlc2hTcHJpdGVCaXRtYXBDYWNoZSgpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlbW92ZVNwcml0ZSAtIFJlbW92ZXMgYSBzcHJpdGUgZnJvbSB0aGUgc3RhZ2VcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3RhZ2UuYWRkU3ByaXRlKHNwcml0ZSk7XHJcbiAgKiBzdGFnZS5yZW1vdmVTcHJpdGUoc3ByaXRlKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gdGhlIHNwcml0ZSB0byBhZGQuXHJcbiAgKi9cclxuICByZW1vdmVTcHJpdGUgKHNwcml0ZSkge1xyXG4gICAgY29uc3QgY3VyU3ByaXRlID0gc3ByaXRlXHJcbiAgICB0aGlzLnNwcml0ZXMgPSB0aGlzLnNwcml0ZXMuZmlsdGVyKChpdGVtKSA9PiBpdGVtICE9PSBzcHJpdGUpXHJcbiAgICBjdXJTcHJpdGUuZWxlbWVudCA/IGN1clNwcml0ZS5lbGVtZW50ID0gY3VyU3ByaXRlLmVsZW1lbnQuZGVsZXRlKGN1clNwcml0ZSkgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKiogbG9va3MgKiAqL1xyXG5cclxuICAvKipcclxuICAqIGFkZEJhY2tkcm9wIC0gQWRkcyBhIGJhY2tkcm9wIHRvIHRoZSBzdGFnZVxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgYmFja2Ryb3AgPSBuZXcgYmxvY2tMaWtlLkJhY2tkcm9wKCk7XHJcbiAgKlxyXG4gICogc3RhZ2UuYWRkQmFja2Ryb3AoYmFja2Ryb3ApO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBiYWNrZHJvcCAtIHRoZSBiYWNrZHJvcCB0byBhZGQuXHJcbiAgKi9cclxuICBhZGRCYWNrZHJvcCAoYmFja2Ryb3ApIHtcclxuICAgIHRoaXMuYmFja2Ryb3BzLnB1c2goYmFja2Ryb3ApXHJcbiAgICAvLyBpZiBcImJhcmVcIiBzZXQgdGhlIGFkZGVkIGFzIGFjdGl2ZVxyXG4gICAgIXRoaXMuYmFja2Ryb3AgPyB0aGlzLmJhY2tkcm9wID0gdGhpcy5iYWNrZHJvcHNbMF0gOiBudWxsXHJcbiAgICB0aGlzLmVsZW1lbnQgPyB0aGlzLmVsZW1lbnQudXBkYXRlKHRoaXMpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBzd2l0Y2hCYWNrZHJvcFRvIC0gU3dpdGNoZXMgdG8gc3BlY2lmaWVkIGJhY2tkcm9wLiBJZiBub3QgZm91bmQgZmFpbHMgc2lsZW50bHkuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBiYWNrZHJvcCA9IG5ldyBibG9ja0xpa2UuQmFja2Ryb3AoKTtcclxuICAqXHJcbiAgKiBzdGFnZS5hZGRCYWNrZHJvcChiYWNrZHJvcCk7XHJcbiAgKiBzdGFnZS5zd2l0Y2hCYWNrZHJvcFRvKGJhY2tkcm9wKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gYmFja2Ryb3AgLSB0aGUgYmFja2Ryb3AgdG8gc3dpdGNoIHRvby5cclxuICAqL1xyXG4gIHN3aXRjaEJhY2tkcm9wVG8gKGJhY2tkcm9wKSB7XHJcbiAgICBjb25zdCBjdXJyZW50QmFja2Ryb3BJbmRleCA9IHRoaXMuYmFja2Ryb3BzLmluZGV4T2YoYmFja2Ryb3ApXHJcbiAgICBjdXJyZW50QmFja2Ryb3BJbmRleCAhPT0gLTEgPyB0aGlzLmJhY2tkcm9wID0gdGhpcy5iYWNrZHJvcHNbY3VycmVudEJhY2tkcm9wSW5kZXhdIDogbnVsbFxyXG5cclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHN3aXRjaEJhY2tkcm9wVG9OdW0gLSBTd2l0Y2hlcyB0byBzcGVjaWZpZWQgYmFja2Ryb3AgYnkgbnVtYmVyIG9mIGN1cnJlbnQgKDAgaXMgZmlyc3QpLiBJZiBub3QgZm91bmQgZmFpbHMgc2lsZW50bHkuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBiYWNrZHJvcCA9IG5ldyBibG9ja0xpa2UuQmFja2Ryb3AoKTtcclxuICAqXHJcbiAgKiBzdGFnZS5hZGRCYWNrZHJvcChiYWNrZHJvcCk7XHJcbiAgKiBzdGFnZS5zd2l0Y2hCYWNrZHJvcFRvTnVtKDEpO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIHRoZSBiYWNrZHJvcCB0byBzd2l0Y2ggdG9vLlxyXG4gICovXHJcbiAgc3dpdGNoQmFja2Ryb3BUb051bSAoaW5kZXgpIHtcclxuICAgIHRoaXMuc3dpdGNoQmFja2Ryb3BUbyh0aGlzLmJhY2tkcm9wc1tpbmRleF0pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIG5leHRCYWNrZHJvcCAtIFN3aXRjaGVzIHRvIHRoZSBuZXh0IGJhY2tkcm9wLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKiBsZXQgYmFja2Ryb3AgPSBuZXcgYmxvY2tMaWtlLkJhY2tkcm9wKCk7XHJcbiAgKlxyXG4gICogc3RhZ2UuYWRkQmFja2Ryb3AoYmFja2Ryb3ApO1xyXG4gICogc3RhZ2UubmV4dEJhY2tkcm9wKCk7XHJcbiAgKi9cclxuICBuZXh0QmFja2Ryb3AgKCkge1xyXG4gICAgY29uc3QgY3VycmVudEJhY2tkcm9wSW5kZXggPSB0aGlzLmJhY2tkcm9wcy5pbmRleE9mKHRoaXMuYmFja2Ryb3ApXHJcbiAgICB0aGlzLmJhY2tkcm9wID0gdGhpcy5iYWNrZHJvcHNbKGN1cnJlbnRCYWNrZHJvcEluZGV4ICsgMSkgJSB0aGlzLmJhY2tkcm9wcy5sZW5ndGhdXHJcblxyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogcmVtb3ZlQmFja2Ryb3AgLSBSZW1vdmVzIGEgYmFja2Ryb3AuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBiYWNrZHJvcCA9IG5ldyBibG9ja0xpa2UuQmFja2Ryb3AoKTtcclxuICAqXHJcbiAgKiBzdGFnZS5hZGRCYWNrZHJvcChiYWNrZHJvcCk7XHJcbiAgKiBzdGFnZS5yZW1vdmVCYWNrZHJvcChiYWNrZHJvcCk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IGJhY2tkcm9wIC0gdGhlIGJhY2tkcm9wIHRvIHJlbW92ZS5cclxuICAqL1xyXG4gIHJlbW92ZUJhY2tkcm9wIChiYWNrZHJvcCkge1xyXG4gICAgaWYgKHRoaXMuYmFja2Ryb3BzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgY29uc3QgY3VycmVudEJhY2tkcm9wSW5kZXggPSB0aGlzLmJhY2tkcm9wcy5pbmRleE9mKGJhY2tkcm9wKVxyXG4gICAgICB0aGlzLmJhY2tkcm9wID09PSBiYWNrZHJvcCA/IHRoaXMuYmFja2Ryb3AgPSB0aGlzLmJhY2tkcm9wc1soY3VycmVudEJhY2tkcm9wSW5kZXggKyAxKSAlIHRoaXMuYmFja2Ryb3BzLmxlbmd0aF0gOiBudWxsXHJcbiAgICAgIHRoaXMuYmFja2Ryb3BzID0gdGhpcy5iYWNrZHJvcHMuZmlsdGVyKChpdGVtKSA9PiBpdGVtICE9PSBiYWNrZHJvcClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYmFja2Ryb3BzID0gW11cclxuICAgICAgdGhpcy5iYWNrZHJvcCA9IG51bGxcclxuICAgIH1cclxuICAgIHRoaXMuZWxlbWVudCA/IHRoaXMuZWxlbWVudC51cGRhdGUodGhpcykgOiBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHJlbW92ZUJhY2tkcm9wTnVtIC0gUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGJhY2tkcm9wIGJ5IG51bWJlciBvZiBjdXJyZW50ICgwIGlzIGZpcnN0KS5cclxuICAqIElmIHRoZXJlIGlzIG9ubHkgb25lIGJhY2tkcm9wLCB3aWxsIGZhaWwgYW5kIGVtaXQgYSBjb25zb2xlIG1lc3NhZ2UuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBiYWNrZHJvcCA9IG5ldyBibG9ja0xpa2UuQmFja2Ryb3AoKTtcclxuICAqXHJcbiAgKiBzdGFnZS5hZGRCYWNrZHJvcChiYWNrZHJvcCk7XHJcbiAgKiBzdGFnZS5yZW1vdmVCYWNrZHJvcE51bSgxKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSB0aGUgYmFja2Ryb3AgdG8gcmVtb3ZlLlxyXG4gICovXHJcbiAgcmVtb3ZlQmFja2Ryb3BOdW0gKGluZGV4KSB7XHJcbiAgICB0aGlzLnJlbW92ZUJhY2tkcm9wKHRoaXMuYmFja2Ryb3BzW2luZGV4XSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogcmVmcmVzaCAtIEZvcmNlcyBhIHNwcml0ZSByZWZyZXNoLlxyXG4gICogTm90ZTogc2VydmljZSBtZXRob2QgdG8gYmUgdXNlZCBpZiBjb3N0dW1lIHdhcyBtYW5pcHVsYXRlZCBkaXJlY3RseS5cclxuICAqL1xyXG4gIHJlZnJlc2ggKCkge1xyXG4gICAgdGhpcy5lbGVtZW50ID8gdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKSA6IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogem9vbSAtIHpvb21zIHRoZSBzdGFnZSB0byB0aGUgc3BlY2lmaWVkIHBlcmNlbnRhZ2UgbnVtYmVyLlxyXG4gICpcclxuICAqIEBleGFtcGxlXHJcbiAgKiBsZXQgc3RhZ2UgPSBuZXcgYmxvY2tMaWtlLlN0YWdlKCk7XHJcbiAgKlxyXG4gICogc3RhZ2Uuem9vbSgxNTApO1xyXG4gICpcclxuICAqIEBwYXJhbSB7bnVtYmVyfSBwZXJjZW50IC0gdGhlIHBlcmNlbnRhZ2UgdG8gc2V0LlxyXG4gICovXHJcbiAgem9vbSAocGVyY2VudCkge1xyXG4gICAgdGhpcy5tYWduaWZpY2F0aW9uID0gcGVyY2VudFxyXG4gICAgdGhpcy5lbGVtZW50LnVwZGF0ZSh0aGlzKVxyXG4gIH1cclxuXHJcbiAgLyoqIFNwcml0ZXMgKiAqL1xyXG5cclxuICAvKipcclxuICAqIF9yZWZyZXNoU3ByaXRlcyAtIFJlZnJlc2ggdGhlIERPTSBlbGVtZW50IG9mIGFsbCBzcHJpdGVzIGN1cnJlbnRseSBvbiBzdGFnZS5cclxuICAqXHJcbiAgKiBAcHJpdmF0ZVxyXG4gICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gdGhlIGJhY2tkcm9wIHRvIHN3aXRjaCB0b28uXHJcbiAgKi9cclxuICBfcmVmcmVzaFNwcml0ZXMgKCkge1xyXG4gICAgbGV0IGkgPSAwXHJcbiAgICB0aGlzLnNwcml0ZXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICBjb25zdCBzcHJpdGUgPSBpdGVtXHJcbiAgICAgIGkgKz0gMVxyXG4gICAgICBzcHJpdGUueiA9IGlcclxuICAgICAgc3ByaXRlLmVsZW1lbnQgPyBzcHJpdGUuZWxlbWVudC51cGRhdGUoc3ByaXRlKSA6IG51bGxcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIHNlbmRTcHJpdGVCYWNrd2FyZHMgLSBNb3ZlcyB0aGUgc3ByaXRlIG9uZSBwbGFjZSBkb3duIHRoZSBcInBpbGVcIi5cclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3RhZ2UuYWRkU3ByaXRlKHNwcml0ZSk7XHJcbiAgKiBzdGFnZS53aGVuRmxhZyggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMuc2VuZFNwcml0ZUJhY2t3YXJkcyhzcHJpdGUpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHNwcml0ZSAtIHRoZSBzcHJpdGUgdG8gbW92ZS5cclxuICAqL1xyXG4gIHNlbmRTcHJpdGVCYWNrd2FyZHMgKHNwcml0ZSkge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnNwcml0ZXMuaW5kZXhPZihzcHJpdGUpXHJcbiAgICBpZiAoaW5kZXggPiAwKSB7XHJcbiAgICAgIHRoaXMuc3ByaXRlc1tpbmRleF0gPSB0aGlzLnNwcml0ZXNbaW5kZXggLSAxXSAvLyBtb3ZlIG9uZSB1cFxyXG4gICAgICB0aGlzLnNwcml0ZXNbaW5kZXggLSAxXSA9IHNwcml0ZSAvLyBtZSBzdWJqZWN0IGRvd25cclxuICAgIH1cclxuICAgIHRoaXMuX3JlZnJlc2hTcHJpdGVzKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogc2VuZFNwcml0ZUZvcndhcmQgLSBNb3ZlcyB0aGUgc3ByaXRlIG9uZSBwbGFjZSB1cCBpbiB0aGUgXCJwaWxlXCIuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHN0YWdlLmFkZFNwcml0ZShzcHJpdGUpO1xyXG4gICogc3RhZ2Uud2hlbkZsYWcoIGZ1bmN0aW9uKCkge1xyXG4gICogICB0aGlzLnNlbmRTcHJpdGVGb3J3YXJkKHNwcml0ZSk7XHJcbiAgKiB9KTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gdGhlIHNwcml0ZSB0byBtb3ZlLlxyXG4gICovXHJcbiAgc2VuZFNwcml0ZUZvcndhcmQgKHNwcml0ZSkge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnNwcml0ZXMuaW5kZXhPZihzcHJpdGUpXHJcbiAgICBpZiAoaW5kZXggPCB0aGlzLnNwcml0ZXMubGVuZ3RoIC0gMSAmJiBpbmRleCAhPT0gLTEpIHtcclxuICAgICAgdGhpcy5zcHJpdGVzW2luZGV4XSA9IHRoaXMuc3ByaXRlc1tpbmRleCArIDFdIC8vIG1vdmUgb25lIGRvd25cclxuICAgICAgdGhpcy5zcHJpdGVzW2luZGV4ICsgMV0gPSBzcHJpdGUgLy8gbWUgc3ViamVjdCB1cFxyXG4gICAgfVxyXG4gICAgdGhpcy5fcmVmcmVzaFNwcml0ZXMoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBzZW5kU3ByaXRlVG9Gcm9udCAtIEJyaW5ncyB0aGUgc3ByaXRlIHRvIHRoZSBmcm9udCBvZiB0aGUgXCJwaWxlXCJcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3RhZ2UuYWRkU3ByaXRlKHNwcml0ZSk7XHJcbiAgKiBzdGFnZS53aGVuRmxhZyggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMuc2VuZFNwcml0ZVRvRnJvbnQoc3ByaXRlKTtcclxuICAqIH0pO1xyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzcHJpdGUgLSB0aGUgc3ByaXRlIHRvIG1vdmUuXHJcbiAgKi9cclxuICBzZW5kU3ByaXRlVG9Gcm9udCAoc3ByaXRlKSB7XHJcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuc3ByaXRlcy5pbmRleE9mKHNwcml0ZSlcclxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgdGhpcy5zcHJpdGVzLnNwbGljZShpbmRleCwgMSlcclxuICAgICAgdGhpcy5zcHJpdGVzLnB1c2goc3ByaXRlKVxyXG4gICAgfVxyXG4gICAgdGhpcy5fcmVmcmVzaFNwcml0ZXMoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBzZW5kU3ByaXRlVG9CYWNrIC0gU2VuZHMgdGhlIHNwcml0ZSB0byB0aGUgYmFjayBvZiB0aGUgXCJwaWxlXCJcclxuICAqXHJcbiAgKiBAZXhhbXBsZVxyXG4gICogbGV0IHN0YWdlID0gbmV3IGJsb2NrTGlrZS5TdGFnZSgpO1xyXG4gICogbGV0IHNwcml0ZSA9IG5ldyBibG9ja0xpa2UuU3ByaXRlKCk7XHJcbiAgKlxyXG4gICogc3RhZ2UuYWRkU3ByaXRlKHNwcml0ZSk7XHJcbiAgKiBzdGFnZS53aGVuRmxhZyggZnVuY3Rpb24oKSB7XHJcbiAgKiAgIHRoaXMuc2VuZFNwcml0ZVRvQmFjayhzcHJpdGUpO1xyXG4gICogfSk7XHJcbiAgKlxyXG4gICogQHBhcmFtIHtvYmplY3R9IHNwcml0ZSAtIHRoZSBzcHJpdGUgdG8gbW92ZS5cclxuICAqL1xyXG4gIHNlbmRTcHJpdGVUb0JhY2sgKHNwcml0ZSkge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnNwcml0ZXMuaW5kZXhPZihzcHJpdGUpXHJcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgIHRoaXMuc3ByaXRlcy5zcGxpY2UoaW5kZXgsIDEpXHJcbiAgICAgIHRoaXMuc3ByaXRlcy51bnNoaWZ0KHNwcml0ZSlcclxuICAgIH1cclxuICAgIHRoaXMuX3JlZnJlc2hTcHJpdGVzKClcclxuICB9XHJcblxyXG4gIC8qIHNlbnNpbmcgKi9cclxuXHJcbiAgLyoqXHJcbiAgKiBpc0tleVByZXNzZWQgLSBDaGVja3MgaWYgYSBrZXkgaXMgcHJlc3NlZC4gU3RhZ2Ugc2Vuc2luZyBtdXN0IGJlIGVuYWJsZWQuXHJcbiAgKlxyXG4gICogQGV4YW1wbGVcclxuICAqIGxldCBzdGFnZSA9IG5ldyBibG9ja0xpa2UuU3RhZ2UoKTtcclxuICAqIGxldCBzcHJpdGUgPSBuZXcgYmxvY2tMaWtlLlNwcml0ZSgpO1xyXG4gICpcclxuICAqIHNwcml0ZS5hZGRUbyhzdGFnZSk7XHJcbiAgKiBzcHJpdGUuc2F5KHN0YWdlLmlzS2V5UHJlc3NlZCgnYScpKTtcclxuICAqXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcktleSAtIHRoZSBrZXkgcHJlc3NlZC4gTWF5IGJlIHRoZSBjb2RlIG9yIHRoZSBjaGFyYWN0ZXIgaXRzZWxmIChBIG9yIDY1KVxyXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyAtIGEgZnVuY3Rpb24gdG8gcmV3cml0ZSBhbmQgZXhlY3V0ZS5cclxuICAqL1xyXG4gIGlzS2V5UHJlc3NlZCAodXNlcktleSkge1xyXG4gICAgbGV0IG1hdGNoID0gZmFsc2VcclxuICAgIGxldCBjaGVja1xyXG5cclxuICAgIHR5cGVvZiB1c2VyS2V5ID09PSAnc3RyaW5nJyA/IGNoZWNrID0gdXNlcktleS50b0xvd2VyQ2FzZSgpIDogY2hlY2sgPSB1c2VyS2V5XHJcbiAgICAvLyBNYWtlIHN1cmUgZWFjaCBwcm9wZXJ0eSBpcyBzdXBwb3J0ZWQgYnkgYnJvd3NlcnMuXHJcbiAgICAvLyBOb3RlOiB1c2VyIG1heSB3cml0ZSBpbmNvbXBhdGlibGUgY29kZS5cclxuICAgIHRoaXMua2V5c0tleS5pbmRleE9mKGNoZWNrKSAhPT0gLTEgPyBtYXRjaCA9IHRydWUgOiBudWxsXHJcbiAgICB0aGlzLmtleXNDb2RlLmluZGV4T2YoY2hlY2spICE9PSAtMSA/IG1hdGNoID0gdHJ1ZSA6IG51bGxcclxuICAgIHRoaXMua2V5c0tleUNvZGUuaW5kZXhPZihjaGVjaykgIT09IC0xID8gbWF0Y2ggPSB0cnVlIDogbnVsbFxyXG5cclxuICAgICF0aGlzLnNlbnNpbmcgPyBjb25zb2xlLmxvZygnQmxvY2tMaWtlLmpzIE5vdGljZTogaXNLZXlQcmVzc2VkKCkgaW5nbm9yZWQuIFN0YWdlIHNlbnNpbmcgbm90IGVuYWJsZWQuJykgOiBudWxsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxyXG5cclxuICAgIHJldHVybiBtYXRjaFxyXG4gIH1cclxufVxyXG4iLCIvKipcclxuICogQ2xhc3MgcmVwcmVzZW50aW5nIHRoZSBVSSBFbGVtZW50cyBhdHRhY2hlZCB0byBhIHNwcml0ZS5cclxuICogRWFjaCBTcHJpdGUgbWF5IGhhdmUgb25lLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGV4dFVpRWxlbWVudCB7XHJcbiAgLyoqXHJcbiAgKiBjb25zdHJ1Y3RvciAtIENyZWF0ZXMgYSB1aSBlbGVtZW50IHRoYXQgXCJhdHRhaGNlc1wiIHRvIGEgc3ByaXRlLlxyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzcHJpdGUgLSB0aGUgc3ByaXRlIHRvIHdoaWNoIHRoZSB1aSBpcyBhdHRhY2hlZC5cclxuICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gd2hhdCB1aSB0byBjcmVhdGUgKHNheSBidWJibGUsIHRoaW5rIGJ1YmJsZSBvciBhc2sgYm94KVxyXG4gICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSAgd2hhdCB0aGUgdGV4dCBzYWlkL3Rob3VnaHQvYXNrIHdpbGwgYmUuXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gYXNrSWQgLSB0aGUgYXNrIGJveCBpZGVudGlmaWVyICh1c2VkIHRvIG1hbmFnZSBldmVudHMpLlxyXG4gICovXHJcbiAgY29uc3RydWN0b3IgKHNwcml0ZSwgdHlwZSwgdGV4dCkge1xyXG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgLyoqXHJcbiAgICAqIGFza0lucHV0IC0gZW5jYXBzdWxhdGUgdGhlIGZ1bmN0aW9uYWxpdHkgb2YgdGhlIGlucHV0IGZpZWxkIHVzZWQgdG8gY2FwdHVyZSB1c2VyIGlucHV0IHdpdGggYXNrKCkuXHJcbiAgICAqXHJcbiAgICAqIEByZXR1cm4ge29iamVjdH0gLSB0aGUgaW5wdXQgZG9tIGVsZW1lbnQuXHJcbiAgICAqL1xyXG4gICAgZnVuY3Rpb24gYXNrSW5wdXQgKCkge1xyXG4gICAgICAvKipcclxuICAgICAgKiBzZW5kQW5zd2VyIC0gZGlzcGF0Y2hlcyBhbiBldmVudCB3aGVuIHRoZSB1c2VyIGhhcyBzdWJtaXR0ZWQgdGhlIGlucHV0LlxyXG4gICAgICAqL1xyXG4gICAgICBmdW5jdGlvbiBzZW5kQW5zd2VyICh2YWx1ZSkge1xyXG4gICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IHdpbmRvdy5DdXN0b21FdmVudChgYmxvY2tMaWtlLmFzay4ke3Nwcml0ZS5pZH0uJHtzcHJpdGUuYXNrSWR9YCwgeyBkZXRhaWw6IHsgdmFsdWUsIGFza0lkOiBzcHJpdGUuYXNrSWQgfSB9KVxyXG4gICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKVxyXG4gICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgc2VuZEFuc3dlcihpbnB1dC52YWx1ZSlcclxuICAgICAgICAgIGlucHV0LnZhbHVlID0gJydcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICAgIGVsLmFwcGVuZENoaWxkKGlucHV0KVxyXG5cclxuICAgICAgY29uc3Qgc3VibWl0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcclxuICAgICAgc3VibWl0LmlubmVySFRNTCA9ICcmI3gyNzEzJ1xyXG4gICAgICBzdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgc2VuZEFuc3dlcihpbnB1dC52YWx1ZSlcclxuICAgICAgICBpbnB1dC52YWx1ZSA9ICcnXHJcbiAgICAgIH0pXHJcbiAgICAgIGVsLmFwcGVuZENoaWxkKHN1Ym1pdClcclxuXHJcbiAgICAgIHJldHVybiBpbnB1dFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudGV4dCA9IHRleHQudG9TdHJpbmcoKVxyXG4gICAgdGhpcy50eXBlID0gdHlwZVxyXG5cclxuICAgIC8vIENvbnZlcnQgdGhlIGNlbnRlciBiYXNlZCB4IGNvb3JkaW5hdGUgdG8gYSBsZWZ0IGJhc2VkIG9uZS5cclxuICAgIGNvbnN0IHggPSBzcHJpdGUueCAtIChzcHJpdGUud2lkdGggLyAyKVxyXG4gICAgLy8gQ29udmVydCB0aGUgY2VudGVyIGJhc2VkIHkgY29vcmRpbmF0ZSB0byBhIGxlZnQgYmFzZWQgb25lLlxyXG4gICAgY29uc3QgeSA9IChzcHJpdGUueSAqIC0xKSAtIChzcHJpdGUuaGVpZ2h0IC8gMilcclxuXHJcbiAgICBlbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcclxuICAgIGVsLmlubmVySFRNTCA9IGAke3RleHR9PGJyIC8+YFxyXG5cclxuICAgIC8vIGxvb2tzXHJcbiAgICAvLyBUT0RPOiBtYWtlIHRoaXMgbmljZXIuLi5cclxuICAgIGVsLnN0eWxlLmxlZnQgPSBgJHsoc3ByaXRlLnN0YWdlV2lkdGggLyAyKSArIHggKyAoc3ByaXRlLndpZHRoICogMC42KX1weGBcclxuICAgIGVsLnN0eWxlLnRvcCA9IGAkeygoc3ByaXRlLnN0YWdlSGVpZ2h0IC8gMikgKyB5KSAtIDgwIC0gKE1hdGguZmxvb3IodGhpcy50ZXh0Lmxlbmd0aCAvIDMwKSAqIDE2KX1weGBcclxuXHJcbiAgICBlbC5zdHlsZS56SW5kZXggPSBzcHJpdGUuelxyXG4gICAgZWwuY2xhc3NOYW1lID0gYGJsb2NrbGlrZS0ke3R5cGV9YFxyXG5cclxuICAgIGxldCBpZWwgPSBudWxsXHJcbiAgICBpZiAodHlwZSA9PT0gJ2FzaycpIHtcclxuICAgICAgaWVsID0gYXNrSW5wdXQoc3ByaXRlLCBlbClcclxuICAgICAgZWwuc3R5bGUudG9wID0gYCR7KChzcHJpdGUuc3RhZ2VIZWlnaHQgLyAyKSArIHkpIC0gMTEwIC0gKE1hdGguZmxvb3IodGhpcy50ZXh0Lmxlbmd0aCAvIDMwKSAqIDE2KX1weGBcclxuICAgIH1cclxuXHJcbiAgICBzcHJpdGUuZWxlbWVudC5lbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbCwgc3ByaXRlLmVsZW1lbnQuZWwpXHJcbiAgICBpZWwgPyBpZWwuZm9jdXMoKSA6IG51bGxcclxuXHJcbiAgICBlbC5zdHlsZS52aXNpYmlsaXR5ID0gYCR7KHNwcml0ZS5zaG93aW5nID8gJ3Zpc2libGUnIDogJ2hpZGRlbicpfWBcclxuXHJcbiAgICB0aGlzLmVsID0gZWxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogdXBkYXRlIC0gdXBkYXRlZCB0aGUgRE9NIGVsZW1lbnQgKG1vdmVzIHdpdGggc3ByaXRlKS5cclxuICAqXHJcbiAgKiBAcGFyYW0ge29iamVjdH0gc3ByaXRlIC0gdGhlIHNwcml0ZSB0byB3aGljaCB0aGUgdWkgaXMgYXR0YWNoZWQuXHJcbiAgKi9cclxuICB1cGRhdGUgKHNwcml0ZSkge1xyXG4gICAgY29uc3QgZWwgPSBzcHJpdGUudGV4dHVpLmVsXHJcblxyXG4gICAgLy8gQ29udmVydCB0aGUgY2VudGVyIGJhc2VkIHggY29vcmRpbmF0ZSB0byBhIGxlZnQgYmFzZWQgb25lLlxyXG4gICAgY29uc3QgeCA9IHNwcml0ZS54IC0gKHNwcml0ZS53aWR0aCAvIDIpXHJcbiAgICAvLyBDb252ZXJ0IHRoZSBjZW50ZXIgYmFzZWQgeSBjb29yZGluYXRlIHRvIGEgbGVmdCBiYXNlZCBvbmUuXHJcbiAgICBjb25zdCB5ID0gKHNwcml0ZS55ICogLTEpIC0gKHNwcml0ZS5oZWlnaHQgLyAyKVxyXG5cclxuICAgIC8vIGxvb2tzXHJcbiAgICAvLyBUT0RPOiBtYWtlIHRoaXMgbmljZXIuLi5cclxuICAgIGVsLnN0eWxlLmxlZnQgPSBgJHsoc3ByaXRlLnN0YWdlV2lkdGggLyAyKSArIHggKyAoc3ByaXRlLndpZHRoICogMC42KX1weGBcclxuICAgIGVsLnN0eWxlLnRvcCA9IGAkeygoc3ByaXRlLnN0YWdlSGVpZ2h0IC8gMikgKyB5KSAtIDgwIC0gKE1hdGguZmxvb3IodGhpcy50ZXh0Lmxlbmd0aCAvIDMwKSAqIDE2KX1weGBcclxuXHJcbiAgICBpZiAoc3ByaXRlLnRleHR1aS50eXBlID09PSAnYXNrJykge1xyXG4gICAgICBlbC5zdHlsZS50b3AgPSBgJHsoKHNwcml0ZS5zdGFnZUhlaWdodCAvIDIpICsgeSkgLSAxMTAgLSAoTWF0aC5mbG9vcih0aGlzLnRleHQubGVuZ3RoIC8gMzApICogMTYpfXB4YFxyXG4gICAgfVxyXG5cclxuICAgIGVsLnN0eWxlLnZpc2liaWxpdHkgPSBgJHsoc3ByaXRlLnNob3dpbmcgPyAndmlzaWJsZScgOiAnaGlkZGVuJyl9YFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBkZWxldGUgLSBkZWxldGVzIHRoZSBET00gZWxlbWVudCAoaGlkZXMgaXQpLlxyXG4gICpcclxuICAqIEBwYXJhbSB7b2JqZWN0fSBzcHJpdGUgLSB0aGUgc3ByaXRlIHRvIHdoaWNoIHRoZSB1aSBpcyBhdHRhY2hlZC5cclxuICAqL1xyXG4gIGRlbGV0ZSAoc3ByaXRlKSB7XHJcbiAgICBjb25zdCBlbCA9IHNwcml0ZS50ZXh0dWkuZWxcclxuXHJcbiAgICBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKVxyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvKipcclxuKiBCbG9ja0xpa2UuanNcclxuKlxyXG4qIEJsb2NrTGlrZS5qcyBpcyBhbiBlZHVjYXRpb25hbCBKYXZhU2NyaXB0IGxpYnJhcnkuXHJcbiogSXQgYnJpZGdlcyB0aGUgZ2FwIGJldHdlZW4gYmxvY2stYmFzZWQgYW5kIHRleHQtYmFzZWQgcHJvZ3JhbW1pbmcuXHJcbipcclxuKiBCbG9ja0xpa2UuanMgaXMgZGVzaWduZWQgZm9sbG93aW5nIFNjcmF0Y2ggY29uY2VwdHMsIG1ldGhvZHMgYW5kIHBhdHRlcm5zLlxyXG4qIFRoZSBzY3JlZW4gaXMgYSBjZW50ZXJlZCBzdGFnZS4gSW50ZXJhY3Rpb24gaXMgd2l0aCBTcHJpdGVzLlxyXG4qIENvZGUgaXMgZXhlY3V0ZWQgaW4gYSBcInBhY2VkXCIgbWFubmVyLlxyXG4qIFNjcmF0Y2ggYmxvY2sgY29kZSBhbmQgQmxvY2tMaWtlLmpzIHRleHQgY29kZSBhcmUgbWVhbnQgdG8gYmVcclxuKiBhcyBsaXRlcmFsbHkgc2ltaWxhciBhcyBwb3NzaWJsZS5cclxuKlxyXG4qIEJsb2NrTGlrZS5qcyBpcyB3cml0dGVuIGluIEVTNi9FUzcgZmxhdm9yZWQgSmF2YVNjcmlwdC5cclxuKiBJdCBpcyBlbnZpcm9ubWVudCBpbmRlcGVuZGVudC5cclxuKiBJdCBjYW4gYmUgdXNlZCBhbnl3aGVyZSBtb2Rlcm4gSmF2YVNjcmlwdCBydW5zLlxyXG4qXHJcbiogQGF1dGhvciBZYXJvbiAoUm9uKSBJbGFuXHJcbiogQGVtYWlsIGJsb2NrbGlrZUByb25pbGFuLmNvbVxyXG4qXHJcbiogQ29weXJpZ2h0IDIwMThcclxuKiBGYWJyaXF1w6kgYXUgQ2FuYWRhIDogTWFkZSBpbiBDYW5hZGFcclxuKi9cclxuXHJcbmltcG9ydCAqIGFzIHN0eWxlcyBmcm9tICcuL2RvY3VtZW50LWNzcydcclxuaW1wb3J0IHBsYXRmb3JtcyBmcm9tICcuL3BsYXRmb3JtcydcclxuXHJcbmltcG9ydCBTdGFnZSBmcm9tICcuL3N0YWdlJyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbmltcG9ydCBCYWNrZHJvcCBmcm9tICcuL2JhY2tkcm9wJyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbmltcG9ydCBTcHJpdGUgZnJvbSAnLi9zcHJpdGUnIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuaW1wb3J0IENvc3R1bWUgZnJvbSAnLi9jb3N0dW1lJyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcblxyXG5leHBvcnQgeyBTdGFnZSB9XHJcbmV4cG9ydCB7IEJhY2tkcm9wIH1cclxuZXhwb3J0IHsgU3ByaXRlIH1cclxuZXhwb3J0IHsgQ29zdHVtZSB9O1xyXG5cclxuKGZ1bmN0aW9uIGluaXQgKCkge1xyXG4gIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxyXG5cclxuICBzdHlsZS50eXBlID0gJ3RleHQvY3NzJ1xyXG4gIHN0eWxlLmlubmVySFRNTCA9IGBcclxuICAgICR7c3R5bGVzLmRlZmF1bHRDU1N9XFxuXFxuIFxyXG4gICAgJHtzdHlsZXMudWlDU1N9XFxuXFxuIFxyXG4gICAgJHtzdHlsZXMudGhpbmtDU1N9XFxuXFxuIFxyXG4gICAgJHtzdHlsZXMuc2F5Q1NTfSBcXG5cXG4gXHJcbiAgICAke3N0eWxlcy5hc2tDU1N9YFxyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHN0eWxlKVxyXG5cclxuICBwbGF0Zm9ybXMoKVxyXG59KCkpXHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==