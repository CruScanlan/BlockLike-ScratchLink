/**
 * Class representing the stage surface on which sprites draw.
 * Each Stage has one.
 * @private
 */
export default class StageSurface {
    /**
    * constructor - Creates a Stage.
    *
    * @param {object} stage - the stage on which the sprite is drawing.
    */
    constructor(stage: object);
    context: any;
    /**
    * draw - draws a line "behind" a moving sprite.
    * Note: sprite always has current and previous x,y values to allow drawing to previous location.
    *
    * @param {object} sprite - the sprite drawing the line.
    */
    draw(sprite: object): void;
    /**
    * clear - clears the canvas
    */
    clear(sprite: any): void;
}
