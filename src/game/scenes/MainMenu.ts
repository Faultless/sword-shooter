import { GameObjects, Scene } from "phaser";

export class MainMenu extends Scene {
  background: GameObjects.Rectangle;
  logo: GameObjects.Image;
  title: GameObjects.Text;

  constructor() {
    super("MainMenu");
  }

  create() {
    this.background = this.add.rectangle(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
    );
    this.background.setOrigin(0, 0);
    this.background.setScale(
      this.cameras.main.width / this.background.width,
      this.cameras.main.height / this.background.height,
    );

    this.logo = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100,
      "logo",
    );

    this.title = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      "Thundergeon",
      {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      },
    ).setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}
