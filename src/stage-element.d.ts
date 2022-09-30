/**
 * Class representing the UI Element of the stage.
 * Each Stage has one.
 * @private
 */
export default class StageElement {
    /**
    * constructor - Creates a Stage Element.
    *
    * @param {object} options - the stage for which the element is created.
    * @param {object} stage - the stage created.
    */
    constructor(options: object, stage: object);
    backdropContainer: any;
    canvas: any;
    flag: any;
    context: any;
    el: HTMLDivElement;
    /**
    * update - updates the DOM element.
    *
    * @param {object} stage - the stage to update.
    */
    update(stage: object): void;
    /**
    * delete - deletes the DOM element
    */
    delete(stage: any): any;
    /**
    * addFlag - puts the flag div infront of everything (shows it)
    *
    * @param {object} stage - the stage that "requested" the flag.
    */
    addFlag(stage: object): void;
    /**
    * removeFlag - puts the flag div at the back (hides it)
    *
    * @param {object} stage - the stage that "requested" the flag.
    */
    removeFlag(stage: object): void;
}
