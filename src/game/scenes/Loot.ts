import createModal from "../../helpers/createModal";
import { Game } from "./Game";

class Loot extends Phaser.Scene {
  options: any[];

  constructor() {
    super("Loot");
  }

  create() {
    const modal = createModal(this, () => {
      this.scene.stop();
      this.scene.resume("Game");
    }, "Power Scroll Found!");

    const option1 = this.add.container(-250, 50, [
      this.add.rectangle(50, 50, 200, 350, 0xffffff),
      this.add.sprite(40, 20, "bigger_bolt"),
    ]).setSize(200, 350).setInteractive().on(
      "pointerdown",
      this.chooseOption1,
      this,
    );
    const option2 = this.add.container(50, 50, [
      this.add.rectangle(50, 50, 200, 350, 0xffffff),
      this.add.sprite(40, 20, "more_bolts"),
    ]).setSize(200, 350).setInteractive().on(
      "pointerdown",
      this.chooseOption2,
      this,
    );

    modal.add([option1, option2]);
    modal.setScale(1);
  }

  chooseOption1() {
    (this.scene.get("Game") as Game).player.upgradePower("bigger_bolt");
    this.scene.stop();
    this.scene.resume("Game");
  }

  chooseOption2() {
    (this.scene.get("Game") as Game).player.upgradePower("more_bolts");
    this.scene.stop();
    this.scene.resume("Game");
  }
}

export default Loot;
