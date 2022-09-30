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
export default class Stage extends Entity {
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
    constructor(options?: {
        width: number;
        height: number;
        pace: number;
        parent: object;
        backdrop: object;
        sensing: boolean;
    });
    backdrops: any[];
    backdrop: any;
    element: StageElement;
    width: number;
    height: number;
    keysCode: any[];
    keysKey: any[];
    keysKeyCode: any[];
    sprites: any[];
    magnification: number;
    cssRules: any[];
    classes: any[];
    mouseDown: any;
    mouseX: any;
    mouseY: any;
    /**
    * delete - Deletes the stage element.
    *
    * @example
    * let stage = new blockLike.Stage();
    *
    * stage.delete();
    */
    delete(): void;
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
    addSprite(sprite: object): void;
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
    removeSprite(sprite: object): void;
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
    addBackdrop(backdrop: object): void;
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
    switchBackdropTo(backdrop: object): void;
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
    switchBackdropToNum(index: number): void;
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
    nextBackdrop(): void;
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
    removeBackdrop(backdrop: object): void;
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
    removeBackdropNum(index: number): void;
    /**
    * refresh - Forces a sprite refresh.
    * Note: service method to be used if costume was manipulated directly.
    */
    refresh(): void;
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
    zoom(percent: number): void;
    /** Sprites * */
    /**
    * _refreshSprites - Refresh the DOM element of all sprites currently on stage.
    *
    * @private
    * @param {number} index - the backdrop to switch too.
    */
    private _refreshSprites;
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
    sendSpriteBackwards(sprite: object): void;
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
    sendSpriteForward(sprite: object): void;
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
    sendSpriteToFront(sprite: object): void;
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
    sendSpriteToBack(sprite: object): void;
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
    isKeyPressed(userKey: string): boolean;
}
import Entity from "./entity";
import StageElement from "./stage-element";
