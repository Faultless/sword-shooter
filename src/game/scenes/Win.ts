import { Scene } from "phaser";

export class Win extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameover_text: Phaser.GameObjects.Text;
  stats: { coinsCollected: number; enemiesKilled: number };

  constructor() {
    super("Win");
  }

  init(data: { coinsCollected: number; enemiesKilled: number }) {
    this.stats = data;
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xff0000);

    this.background = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "background",
    );
    this.background.setOrigin(0.5, 0.5);
    this.background.setScale(
      this.cameras.main.width / this.background.width,
      this.cameras.main.height / this.background.height,
    );
    this.background.setAlpha(0.5);

    this.gameover_text = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      `Level Completed!

Coins Collected: ${this.stats.coinsCollected}
Enemies Killed: ${this.stats.enemiesKilled}
`,
      {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      },
    );
    this.gameover_text.setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("MainMenu");
    });
  }
}
