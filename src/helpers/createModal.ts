/**
 * @description Builds and returns a floating custom modal frame.
 * @returns Phaser.GameObjects.Container
 */
const createModal = (
  scene: Phaser.Scene,
  closeModal: Function,
): Phaser.GameObjects.Container => {
  const container = scene.add.container(
    scene.scale.width / 2,
    scene.scale.height / 2,
  );
  const background = new Phaser.GameObjects.Rectangle(
    scene,
    -scene.scale.width / 2 + 20,
    -scene.scale.height / 2 + 20,
    scene.scale.width - 40,
    scene.scale.height - 40,
    0xff0000,
    0.75,
  ).setOrigin(0).setInteractive();

  const title = new Phaser.GameObjects.Text(scene, 0, -200, "LOOT", {
    fontSize: "40px",
    color: "#fff",
  });
  const closeBtn = new Phaser.GameObjects.Text(scene, 200, -200, "X", {
    fontSize: "24px",
    color: "#fff",
  }).setOrigin(0.5).setInteractive().on("pointerdown", closeModal);

  container.add([background, title, closeBtn]);
  return container;
};

export default createModal;
