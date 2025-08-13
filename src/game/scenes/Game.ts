import { Scene } from "phaser";
import Enemy from "../enemy";
import Player from "../player";
import HUD from "../hud";

const MAX_ENEMIES = 2;
export const BULLET_SPEED = 800;
export const ENEMY_SPEED = 100;

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  player: Player;
  enemySpawnCooldown: any;
  enemies: Phaser.GameObjects.Group;
  loots: Phaser.Physics.Arcade.StaticGroup;
  enemyCount: number = 0;
  killedEnemies: number = 0;
  backgroundMusic: any;
  wallLayer: Phaser.Tilemaps.TilemapLayer;
  spawnLayer: Phaser.Tilemaps.TilemapLayer;
  hud: HUD;

  constructor() {
    super("Game");
  }

  create() {
    this.hud = new HUD(this);

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
    this.background.setScrollFactor(0);

    // Create Map
    const map = this.make.tilemap({ key: "dungeonMap" });
    const tileset = map.addTilesetImage("dungeon", "dungeonTiles");

    const floorLayer = map.createLayer("Floors", tileset!);
    this.wallLayer = map.createLayer("Walls", tileset!)!;
    this.spawnLayer = map.createLayer("Spawn", tileset!)!;

    const scaleX = this.cameras.main.width / map.widthInPixels;
    const scaleY = this.cameras.main.height / map.heightInPixels;
    const scale = Math.max(scaleX, scaleY);

    floorLayer?.setScale(scale);
    this.wallLayer?.setScale(scale);
    this.spawnLayer?.setScale(scale);

    this.physics.world.setBounds(
      0,
      0,
      map.widthInPixels * scale,
      map.heightInPixels * scale,
    );

    this.wallLayer?.setCollisionByProperty({ collides: true });

    // Create player
    this.player = new Player(
      this,
      400,
      300,
      scale,
    );

    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: true,
    });

    this.physics.add.collider(this.player, this.wallLayer!);
    this.physics.add.collider(this.enemies, this.wallLayer!);

    this.cameras.main.startFollow(this.player, true);

    this.input.keyboard?.on(
      "keydown-Z",
      () => this.player.attack(this.enemies),
    );
    this.input.keyboard?.on("keydown-I", () => this.showInventory());

    this.loots = this.physics.add.staticGroup();

    this.enemySpawnCooldown = 0;

    this.physics.add.collider(this.player, this.enemies, () => {
      this.backgroundMusic.stop();
      this.player.play("player_death");

      this.player.once("animationcomplete-player_death", () => {
        this.scene.start("GameOver");
        this.enemyCount = 0;
      });
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
          let x = 0, y = 0;
          while (
            this.wallLayer.getTileAtWorldXY(x, y) ||
            Phaser.Math.Within(x, this.player.x, 100) ||
            Phaser.Math.Within(y, this.player.y, 100)
          ) {
            x = this.cameras.main.width * Math.random(),
              y = this.cameras.main.height * Math.random();
          }

          enemy.spawn(x, y);
          this.enemySpawnCooldown = 500;
        }
      }
    }

    if (this.enemies.countActive(true) === 0) {
      this.scene.start("Win", {
        enemiesKilled: this.enemyCount,
        coinsCollected: this.player.inventory.gold,
      });

      this.enemyCount = 0;
    }
  }

  showInventory() {
    this.scene.pause();
    this.scene.launch("Inventory");
  }

  collectLoot(player: Player, loot: any) {
    player.lootCoins(loot.coins ?? 1);
    console.log("loot", loot.getData("name"));
    if (loot.getData("name") !== "coin") {
      this.scene.pause();
      this.scene.launch("Loot");
    }

    loot.destroy();
  }
}
