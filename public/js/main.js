/* eslint-disable no-invalid-this */
/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

window.onload = () => {
  this.scene = new Scene();

  // Set Google Assistant Canvas Action at scene level
  this.scene.action = new Action(scene);
  // Call setCallbacks to register interactive canvas
  this.scene.action.setCallbacks();
};

/**
 * Represent Triangle scene
 */
class Scene {
  /**
   * Initializes the game with visual components.
   */
  constructor() {
    const view = document.getElementById('view');
    const graphics = new PIXI.Graphics();

    // set up fps monitoring
    const stats = new Stats();
    view.getElementsByClassName('stats')[0].appendChild(stats.domElement);

    // initialize rendering and set correct sizing
    this.ratio = window.devicePixelRatio;
    this.renderer = PIXI.autoDetectRenderer({
      transparent: true,
      antialias: true,
      resolution: this.ratio,
      width: view.clientWidth,
      height: view.clientHeight,
    });
    this.element = this.renderer.view;
    this.element.style.width = `${this.renderer.width / this.ratio}px`;
    this.element.style.height = `${(this.renderer.height / this.ratio)}px`;
    view.appendChild(this.element);

    // center stage and normalize scaling for all resolutions
    this.stage = new PIXI.Container();
    this.stage.position.set(view.clientWidth / 2, view.clientHeight / 2);
    this.stage.scale.set(Math.max(this.renderer.width,
      this.renderer.height) / 1024);

    // load a sprite from a svg file
    // this.sprite = PIXI.Sprite.from('triangle.svg');
    // this.sprite.anchor.set(0.5);
    // this.sprite.tint = 0x00FF00; // green
    // this.sprite.spin = true;
    // this.stage.addChild(this.sprite);

    // // toggle spin on touch events of the triangle
    // this.sprite.interactive = true;
    // this.sprite.buttonMode = true;
    // this.sprite.on('pointerdown', () => {
    //   this.sprite.spin = !this.sprite.spin;
    // });

    Section.amount = 6;
    Section.graphics = graphics;
    Section.width = view.clientWidth / this.ratio;
    Section.height = view.clientHeight / this.ratio;
    Section.solvedSection = 3;
    Section.selectedIndex = 3;

    new Section(0, 0xdd0022);
    new Section(1, 0xee7700);
    new Section(2, 0xffbb00);
    new Section(3, 0x00aa22);
    new Section(4, 0x3366cc);
    new Section(5, 0x9900bb);

    this.stage.addChild(graphics);

    let last = performance.now();
    // frame-by-frame animation function
    const frame = () => {
      stats.begin();

      // calculate time differences for smooth animations
      const now = performance.now();
      const delta = now - last;

      // rotate the triangle only if spin is true
      // if (this.sprite.spin) {
      //   this.sprite.rotation += delta / 1000;
      // }

      last = now;

      this.renderer.render(this.stage);
      stats.end();
      requestAnimationFrame(frame);
    };
    frame();
    // this.createRestartGameButton();
  }

  /**
   * Restart game button to showcase sendTextQuery.
   */
  createRestartGameButton() {
    const textureButton = PIXI.Texture
      .fromImage('./restart_game_btn_enabled.png');
    this.button = new PIXI.Sprite(textureButton);
    this.button.textureButton = textureButton;
    this.button.textureButtonDisabled = PIXI.Texture
      .fromImage('./restart_game_btn_disabled.png');
    const that = this;
    const onButtonDown = function () {
      console.log(`Request in flight`);
      that.button.texture = that.button.textureButtonDisabled;
      that.sprite.spin = false;
      that.action.canvas.sendTextQuery('Restart game')
        .then((res) => {
          if (res.toUpperCase() === 'SUCCESS') {
            console.log(`Request in flight: ${res}`);
            that.button.texture = that.button.textureButtonDisabled;
            that.sprite.spin = false;
          } else {
            console.log(`Request in flight: ${res}`);
          }
        });
    };

    this.button.buttonMode = true;
    this.button.anchor.set(0.5);
    this.button.x = 0;
    this.button.y = 100;
    this.button.interactive = true;
    this.button.buttonMode = true;
    this.button.on('pointerdown', onButtonDown);
    this.stage.addChild(this.button);
  }
}

class Section {
  static amount;
  static selectedIndex;
  static solvedSection;
  static graphics;
  static width;
  static height;

  index;
  color;

  constructor(index, color) {
    this.index = index;
    this.color = color;

    this.draw();
  }

  draw() {
    let deltaWidth;
    let offsetX;
    const offsetY = -Section.height / 2;

    if (Section.selectedIndex) {
      const basicWidth = (Section.width / Section.amount) / 20;
      deltaWidth = this.index !== Section.selectedIndex ? basicWidth : Section.width * 19 / 20 + basicWidth;
      offsetX = this.index <= Section.selectedIndex ? -Section.width / 2 + basicWidth * this.index : Section.width / 2 - basicWidth * (Section.amount - this.index);
    } else {
      deltaWidth = Section.width / Section.amount;
      offsetX = -Section.width / 2 + deltaWidth * this.index;
    }

    Section.graphics.beginFill(this.color, Section.solvedSection > this.index ? 1 : 0.2);
    Section.graphics.drawRect(offsetX, offsetY, deltaWidth, Section.height);
  }
}