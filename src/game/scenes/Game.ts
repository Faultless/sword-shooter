import { Scene } from "phaser";
import Enemy from "../enemy";
import Player from "../player";

const MAX_ENEMIES = 1;
export const BULLET_SPEED = 800;
export const ENEMY_SPEED = 100;

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  private player: Player;
  enemySpawnCooldown: any;
  enemies: Phaser.GameObjects.Group;
  loots: Phaser.Physics.Arcade.StaticGroup;
  enemyCount: number = 0;
  killedEnemies: number = 0;
  backgroundMusic: any;

  constructor() {
    super("Game");
  }

  create() {
    // load music loop
    this.backgroundMusic = this.sound.add("bgm", {
      loop: true,
      volume: 0.5,
    });

    this.backgroundMusic.play();

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

    // Create Map
    const map = this.make.tilemap({ key: "dungeonMap" });
    const tileset = map.addTilesetImage("dungeon", "dungeonTiles");

    const floorLayer = map.createLayer("Floors", tileset!);
    const wallLayer = map.createLayer("Walls", tileset!);

    const scaleX = this.cameras.main.width / map.widthInPixels;
    const scaleY = this.cameras.main.height / map.heightInPixels;
    const scale = Math.max(scaleX, scaleY);

    floorLayer?.setScale(scale);
    wallLayer?.setScale(scale);

    this.physics.world.setBounds(
      0,
      0,
      map.widthInPixels * scale,
      map.heightInPixels * scale,
    );

    wallLayer?.setCollisionByProperty({ collides: true });

    // Create player
    this.player = new Player(
      this,
      400,
      300,
      scale,
    );
    // this.physics.add.collider(this.player, wallLayer!);

    this.input.keyboard?.on(
      "keydown-Z",
      () => this.player.attack(this.enemies),
    );
    this.input.keyboard?.on("keydown-I", () => this.showInventory());

    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: true,
    });

    this.loots = this.physics.add.staticGroup();

    this.enemySpawnCooldown = 0;

    this.physics.add.collider(this.player, this.enemies, () => {
      this.backgroundMusic.stop();
      this.scene.start("GameOver");
    });

    this.physics.add.overlap(
      this.player,
      this.loots,
      this.collectLoot,
      undefined,
      this,
    );
  }

  update(_time: number, delta: number) {
    this.player.update();

    if (this.enemySpawnCooldown > 0) {
      this.enemySpawnCooldown -= delta;
    }

    if (this.enemySpawnCooldown <= 0) {
      if (this.enemyCount <= MAX_ENEMIES) {
        this.enemyCount++;
        const enemy = this.enemies.get().setActive(true).setVisible(true);
        if (enemy) {
          enemy.spawn(this.player);
          this.enemySpawnCooldown = 500;
        }
      }
    }
  }

  showInventory() {
    this.scene.pause();
    this.scene.launch("Inventory");
  }

  collectLoot(_player: any, loot: any) {
    loot.destroy();
    this.scene.pause();
    this.scene.launch("Loot");
  }
}
