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
export default class Sprite extends Entity {
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
    constructor(options?: {
        pace: number;
        costume: object;
        width: number;
        height: number;
        image: string;
        color: string;
    });
    costumes: any[];
    costume: any;
    width: any;
    height: any;
    x: number;
    y: number;
    z: number;
    prevX: number;
    prevY: number;
    showing: boolean;
    direction: number;
    magnification: number;
    rotationStyle: number;
    textui: any;
    drawing: boolean;
    penColor: string;
    penSize: number;
    cssRules: any[];
    classes: any[];
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
    addTo(stage: object): void;
    stageWidth: any;
    stageHeight: any;
    element: any;
    surface: StageSurface;
    againstBackdrop: any;
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
    clone(): Sprite;
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
    removeFrom(stage: any): void;
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
    whenCloned(func: Function): void;
    /** Motion * */
    /**
    * _motion - Moves the sprite to specified location (x, y).
    * All user motion methods translated to this motion.
    *
    * @private
    * @param {number} x - the x coordinate for the center of the sprite (0 is center screen).
    * @param {number} y - the y coordinate for the center of the sprite (0 is center screen).
    */
    private _motion;
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
    glide(sec: number, x: number, y: number, triggeringId?: any): void;
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
    move(pixels: number): void;
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
    goTo(x: number, y: number): void;
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
    goTowards(sprite: object): void;
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
    setX(x: number): void;
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
    setY(y: number): void;
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
    changeX(pixels: number): void;
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
    changeY(pixels: number): void;
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
    pointInDirection(deg: number): void;
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
    pointTowards(sprite: object): void;
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
    turnRight(deg: number): void;
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
    turnLeft(deg: number): void;
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
    setRotationStyle(style: any): void;
    /** Looks * */
    /**
    * _refreshCostume - Sets the costume and sprite width and hight then refreshes element.
    *
    * @private
    */
    private _refreshCostume;
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
    addCostume(costume: object): void;
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
    switchCostumeTo(costume: any): void;
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
    switchCostumeToNum(index: number): void;
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
    nextCostume(): void;
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
    removeCostume(costume: object): void;
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
    removeCostumeNum(index: number): void;
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
    show(): void;
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
    hide(): void;
    /**
    * refresh - Forces a sprite refresh.
    * Note: service method to be used if costume was manipulated directly.
    */
    refresh(): void;
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
    resizeToImage(): void;
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
    inner(html: any): void;
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
    insert(el: object): void;
    /**
    * _refreshSize - Sets the sprite width and hight in relation to original then refreshes element.
    *
    * @private
    * @param {object} costume - the costume to add.
    */
    private _refreshSize;
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
    changeSize(change: number): void;
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
    setSize(percent: number): void;
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
    think(text: string): void;
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
    thinkWait(text: string, sec: number, triggeringId?: any): void;
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
    say(text: string): void;
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
    sayWait(text: string, sec: number, triggeringId?: any): void;
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
    ask(text: string, theVar?: any, triggeringId?: any): void;
    askId: string;
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
    penClear(): void;
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
    penDown(): void;
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
    penUp(): void;
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
    setPenColor(colorString: string): void;
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
    setPenSize(pixels: number): void;
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
    changePenSize(change: number): void;
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
    distanceTo(x: number, y: number): number;
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
    touchingEdge(): string;
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
    isTouchingEdge(): boolean;
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
    touching(sprite: string): string;
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
    isTouching(sprite: string): boolean;
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
    touchingBackdropColor(): any[];
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
    isTouchingBackdropColor(backdropColor: string): boolean;
}
import Entity from "./entity";
import StageSurface from "./stage-surface";
