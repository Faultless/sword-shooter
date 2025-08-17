export const createHitArea = (
  scene: Phaser.Scene,
  originator: Phaser.Physics.Arcade.Sprite,
  target: Phaser.Physics.Arcade.Sprite,
  width: number,
  height: number,
  color: number,
  duration: number,
): Phaser.GameObjects.Rectangle => {
  const area = new Phaser.GameObjects.Rectangle(
    scene,
    originator.x,
    originator.y,
    width,
    0,
    color,
  );

  scene.add.existing(area);

  area.setDepth(0);
  area.setRotation(target.rotation);
  console.log("Area!", area);

  return area;
};
