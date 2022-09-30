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
export default class Backdrop extends Look {
    /**
    * constructor - Creates a Backdrop to be used by Stage objects.
    *
    * @param {object} options - options for the backdrop.
    * @param {string} options.image - a URI (or data URI) for the backdrop image.
    * @param {string} options.color - a css color string ('#ff0000', 'red')
    */
    constructor(options?: {
        image: string;
        color: string;
    });
    image: string;
    color: string;
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
    addTo(stage: object): void;
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
    removeFrom(stage: object): void;
}
import Look from "./look";
