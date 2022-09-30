/**
 * Class representing the UI Elements attached to a sprite.
 * Each Sprite may have one.
 * @private
 */
export default class TextUiElement {
    /**
    * constructor - Creates a ui element that "attahces" to a sprite.
    *
    * @param {object} sprite - the sprite to which the ui is attached.
    * @param {string} type - what ui to create (say bubble, think bubble or ask box)
    * @param {string} text -  what the text said/thought/ask will be.
    * @param {object} askId - the ask box identifier (used to manage events).
    */
    constructor(sprite: object, type: string, text: string);
    text: string;
    type: string;
    el: HTMLDivElement;
    /**
    * update - updated the DOM element (moves with sprite).
    *
    * @param {object} sprite - the sprite to which the ui is attached.
    */
    update(sprite: object): void;
    /**
    * delete - deletes the DOM element (hides it).
    *
    * @param {object} sprite - the sprite to which the ui is attached.
    */
    delete(sprite: object): any;
}
