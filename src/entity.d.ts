/**
 * Class representing an entity.
 * Abstract for Stage and Sprite.
 * Do not instantiate objects directly from this class.
 *
 * @private
 */
export default class Entity {
    /**
    * constructor - Entity is abstract for Stage and Sprite.
    *
    * @param {number} pace - the number of milliseconds to pace paced methods.
    */
    constructor(pace: number);
    id: string;
    pace: number;
    sounds: any[];
    paced: string[];
    waited: string[];
    waitedReturned: string[];
    evented: string[];
    /**
    * _generateUUID - generates a unique ID.
    * Source: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    *
    * @private
    * @return {string} - a unique id.
    */
    private _generateUUID;
    /**
    * _releaseWaited - releases a waited promise by dispatching an event.
    *
    * @private
    * @param {string} triggeringId - the name of the event that invoked the code that requested the wait.
    */
    private _releaseWaited;
    /**
    * _setToVar - sets a globally scoped user defined variable who's name is specified as a a string
    * with the value provided.
    *
    * @private
    * @param {varString} text - the name of the variable to which value should be set.
    * @param {any} value - the value to set.
    */
    private _setToVar;
    /**
    * _exec - asynchronous function execution.
    * This is what creates the "paced" execution of the user supplied functions.
    *
    * @private
    * @param {function} func - a function to rewrite and execute.
    * @param {array} argsArr - an array of arguments to pass to the function.
    */
    private _exec;
    triggeringId: string;
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
    invoke(func: Function, argsArr: any[], theVar?: any, triggeringId?: any): void;
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
    wait(sec: number, triggeringId?: any): void;
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
    whenLoaded(func: Function): void;
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
    whenFlag(func: Function): void;
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
    whenClicked(func: Function): void;
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
    whenKeyPressed(userKey: string, func: Function): void;
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
    whenEvent(eventStr: string, func: Function): void;
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
    whenReceiveMessage(msg: string, func: Function): void;
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
    broadcastMessage(msg: string): void;
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
    broadcastMessageWait(msg: string, triggeringId?: any): void;
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
    playSound(url: string): void;
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
    playSoundLoop(url: string): void;
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
    playSoundUntilDone(url: string, triggeringId?: any): void;
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
    stopSounds(): void;
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
    css(prop: string, value?: string): void;
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
    addClass(name: string): void;
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
    removeClass(name: string): void;
    classes: any;
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
    hasClass(name: string): boolean;
}
