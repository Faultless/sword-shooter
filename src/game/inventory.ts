class Inventory extends Phaser.GameObjects.Container {
  gold: number = 0;
  items: Record<string, any>[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene);
  }
}

export default Inventory;
