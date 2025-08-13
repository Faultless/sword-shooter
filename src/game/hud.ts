class HUD extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.cameras.main;
    super(scene, 0, 0);

    this.setSize(width, height);
    this.setDepth(10);

    this.setScrollFactor(0, 0, true);

    const attackContainer = new Phaser.GameObjects.Container(
      this.scene,
      width - 100,
      height - 100,
    );

    const attackBtn = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      50,
      50,
      0xffffff,
      0.6,
    );

    const attackTextTop = new Phaser.GameObjects.Text(
      this.scene,
      -30,
      -55,
      "Attack",
      {
        fontSize: "17px",
        color: "#fff",
      },
    ).setOrigin(0, 0);

    const attackText = new Phaser.GameObjects.Text(
      this.scene,
      attackBtn.x,
      attackBtn.y,
      "Z",
      {
        fontSize: "24px",
        color: "#fff",
      },
    );
    attackText.setOrigin(0.5, 0.5);

    const movementContainer = new Phaser.GameObjects.Container(
      this.scene,
      100,
      this.height - 150,
      ["W", "A", "S", "D"].map((key, i) => {
        const rect = new Phaser.GameObjects.Rectangle(
          this.scene,
          i * 30,
          45,
          25,
          25,
          0xffffff,
          0.6,
        );

        return [
          rect,
          new Phaser.GameObjects.Text(this.scene, rect.x, rect.y, key, {
            fontSize: "24px",
            color: "#fff",
          }).setOrigin(0.5),
        ];
      }).flat(),
    );

    movementContainer.add(
      new Phaser.GameObjects.Text(this.scene, 5, 5, "Movement", {
        fontSize: "17px",
        color: "#fff",
      }),
    );

    attackContainer.add([attackBtn, attackText, attackTextTop]);

    this.add([attackContainer, movementContainer]);

    scene.add.existing(this);
  }
}

export default HUD;
