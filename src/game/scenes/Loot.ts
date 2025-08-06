import createModal from "../../helpers/createModal";

class Loot extends Phaser.Scene {
  constructor() {
    super("Loot");
  }

  create() {
    const modal = createModal(this, () => {
      this.scene.stop();
      this.scene.resume("Game");
    });

    modal.setScale(1);
  }
}

export default Loot;
