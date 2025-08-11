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
    });

    const option1 = this.add.container(0, 50, [
      this.add.rectangle(0, 50, 200, 350, 0xffffff),
      this.add.sprite(10, 10, "bigger_bolt"),
    ]).setSize(200, 350).setInteractive().on(
      "pointerdown",
      this.chooseLoot,
      this,
    );
    const option2 = this.add.container(250, 50, [
      this.add.rectangle(0, 50, 200, 350, 0xffffff),
      this.add.sprite(10, 10, "more_bolts"),
    ]).setSize(200, 350).setInteractive().on(
      "pointerdown",
      this.chooseLoot,
      this,
    );

    modal.add([option1, option2]);
    modal.setScale(1);
  }

  chooseLoot() {
    (this.scene.get("Game") as Game).player.upgradePower();
    this.scene.stop();
    this.scene.resume("Game");
  }
}

export default Loot;
