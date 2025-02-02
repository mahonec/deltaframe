'use strict'

/**
 * Abstract the use of requestAnimationFrame and setTimeout under one name so that Deltaframe itself does 
 * not have to worry about which one to use.
 * 
 * This also uses the requestAnimationFrame and cancelAnimationFrame that are supported by the user's browser 
 * and forces setTimeout if desired.
 * 
 * @since 0.1.0
 */
export default class RequestAnimationFrame {

  /**
   * A reference to the id returned by requestAnimationFrame or setTimeout so 
   * that we can cancel their operation when needed.
   * 
   * @since 0.1.0
   * 
   * @property {number}
   */
  id: number = 0;

  /**
   * Keeps track of whether the loop is already running or not so it's not accidently 
   * restarted.
   * 
   * @since 0.1.0
   * 
   * @property {boolean}
   * 
   * @default false
   */
  running: boolean = false;

  /**
   * The function that should be run on every update of the loop.
   * 
   * @since 0.1.0
   * 
   * @property {Function}
   * 
   * @default ()=>{}
   */
  fn: Function = () => { };

  /**
   * Indicates whether setTImeout is being used instead of requestAnimationFrame.
   * 
   * @since 0.1.0
   * 
   * @property {boolean}
   * 
   * @default false
   */
  private usingSetTimeout: boolean = false;

  constructor() {

    /**
     * Use the version of requestAnimationFrame that is supported by the user's browser and if none are 
     * supported, use setTimeout instead.
     * 
     * @property {RequestAnimationFrame|setTimeout}
     */
    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (f) { return setTimeout(f, 1000 / 60) };

    /**
     * Use the version of cancelAnimationFrame that is supported by the user's browser and if none are supported, 
     * then setTimeout was used and so we use clearTimeout instead.
     * 
     * @property {cancelAnimationFrame}
     */
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || function (this: RequestAnimationFrame) { clearTimeout(this.id) }

  }

  /**
   * Start the operation of the requestAnimationFrame or setTimeout loop.
   * 
   * @since 0.1.0
   * 
   * @param {Function} fn The function to run every update of the loop.
   * @param {boolean} forceSetTimeout Indicates whether setTimeout should be used even if the user's browser supports requestAnimationFrame.
   */
  start(fn: Function, forceSetTimeout: boolean) {

    if (this.running) return;

    this.running = true;

    this.fn = fn;

    if (forceSetTimeout) {

      this.usingSetTimeout = true;

      this.updateTimeout();

    }
    else {

      window.requestAnimationFrame((time) => this.updateRAF(time));

    }

  }

  /**
   * Call requestAnimationFrame recursively so that the loop keeps going and
   * also send the timestamps over to Deltaframe.
   * 
   * @since 0.1.0
   * 
   * @param {number} timestamp The timestamp from the most recent requestAnimationFrame request.
   */
  updateRAF(timestamp: number) {

    this.running = true;

    this.fn(timestamp);

    this.id = window.requestAnimationFrame((time) => this.updateRAF(time));

  }

  /**
   * Call setTimeout recursively so that the loop keeps going and also send
   * the timestamps over to Deltaframe.
   * 
   * @since 0.1.0
   */
  updateTimeout() {

    let timestamp = window.performance.now();

    this.fn(timestamp);

    this.id = window.setTimeout(() => this.updateTimeout(), 1000 / 60);

  }

  /**
   * Restart the requestAnimation or setTimeout loop.
   * 
   * @since 0.1.0
   */
  restart() {

    if (this.usingSetTimeout) window.clearTimeout(this.id);

    else window.cancelAnimationFrame(this.id);

    this.id = 0;

    this.running = false;

    if (this.usingSetTimeout) this.updateTimeout();

    else window.requestAnimationFrame((time) => this.updateRAF(time));

    this.running = true;

  }

  /**
   * Stop the loop by calling cancelAnimationFrame or clearTimeout.
   * 
   * @since 0.1.0
   */
  stop() {

    if (this.usingSetTimeout) window.clearTimeout(this.id);

    else window.cancelAnimationFrame(this.id);

    this.id = 0;

    this.running = false;

    this.fn = () => { };

    return;

  }

}