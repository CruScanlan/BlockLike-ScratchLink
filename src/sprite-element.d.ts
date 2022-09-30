/**
 * Class representing the UI Element of the sprite.
 * Each Sprite has one.
 * @private
 */
export default class SpriteElement {
    /**
    * constructor - Creates a Sprite Element.
    *
    * @param {object} sprite - the sprite for which the element is created.
    * @param {object} stage - the stage to which the sprite is added.
    */
    constructor(sprite: object, stage: object);
    el: HTMLDivElement;
    /**
    * update - updates the DOM element. This is always called after the constructor.
    *
    * @param {object} sprite - the sprite to update.
    */
    update(sprite: object): void;
    /**
    * delete - deletes the DOM element.
    *
    * @param {object} sprite - the sprite to delete.
    */
    delete(sprite: object): any;
    /**
    * addFlag - puts the flag div infront of everything (shows it).
    *
    * @param {object} sprite - the sprite that "requested" the flag.
    */
    addFlag(sprite: object): void;
    /**
    * removeFlag - puts the flag div at the back (hides it).
    *
    * @param {object} sprite - the sprite that "requested" the flag.
    */
    removeFlag(sprite: object): void;
}
