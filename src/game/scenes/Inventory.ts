class Inventory extends Phaser.Scene {
  constructor() {
    super({ key: "Inventory" });
  }

  create() {
    const bg = this.add.rectangle(
      -this.scale.width / 2 + 20,
      -this.scale.height / 2 + 20,
      this.scale.width - 40,
      this.scale.height - 40,
      0x000000,
      0.75,
    );
    bg.setOrigin(0);
    bg.setInteractive();

    const modal = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2,
    );

    const title = this.add.text(0, -200, "INVENTORY", { fontSize: "40px" })
      .setOrigin(0.5);

    const closeBtn = this.add.text(150, -200, "X", {
      fontSize: "24px",
      color: "#FF0000",
    }).setOrigin(0.5).setInteractive().on("pointerdown", () => {
      this.scene.stop();
      this.scene.resume("Game");
    });

    modal.add([bg, title, closeBtn]);

    modal.setScale(0);

    this.tweens.add({
      targets: modal,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: "Back.easeOut",
    });
  }
}

export default Inventory;
