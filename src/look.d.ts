/**
 * Class representing a look.
 * Abstract for Costume and Backdrop.
 * Do not instantiate objects directly from this class.
 *
 * @private
 */
export default class Look {
    cssRules: any[];
    classes: any[];
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
    css(prop: string, value?: string): void;
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
    addClass(name: string): void;
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
    removeClass(name: string): void;
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
    hasClass(name: string): boolean;
}
