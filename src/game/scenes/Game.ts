import { Scene } from "phaser";
import Enemy from "../enemy";
import Player from "../player";
import HUD from "../hud";
import Boss from "../boss";

const MAX_ENEMIES = 75;
export const BULLET_SPEED = 800;
export const ENEMY_SPEED = 100;

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Rectangle;
  msg_text: Phaser.GameObjects.Text;
  player: Player;
  boss: Boss;
  enemySpawnCooldown: any;
  enemies: Phaser.GameObjects.Group;
  loots: Phaser.Physics.Arcade.StaticGroup;
  enemyCount: number = 0;
  killedEnemies: number = 0;
  backgroundMusic: any;
  wallLayer: Phaser.Tilemaps.TilemapLayer;
  spawnLayer: Phaser.Tilemaps.TilemapLayer;
  hud: HUD;
  scaleFactor: number;
  chargeCD = 500;
  private readonly range = 100;
  private readonly speed = 50; // movement speed in px/sec
  private startPositions: Phaser.Math.Vector2[] = [];

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

    this.background = this.add.rectangle(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
    );
    this.background.setOrigin(0, 0);
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
    this.scaleFactor = Math.max(scaleX, scaleY);

    floorLayer?.setScale(this.scaleFactor);
    this.wallLayer?.setScale(this.scaleFactor);
    this.spawnLayer?.setScale(this.scaleFactor);

    this.physics.world.setBounds(
      0,
      0,
      map.widthInPixels * this.scaleFactor,
      map.heightInPixels * this.scaleFactor,
    );

    this.wallLayer?.setCollisionByProperty({ collides: true });

    // Spawn Boss
    // x, y should come from spawnLayer
    this.boss = new Boss(this, 1800, 150, this.scaleFactor);

    // Create player
    this.player = new Player(
      this,
      1400,
      150,
      this.scaleFactor,
    );

    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: true,
    });

    this.physics.add.collider(this.boss, this.wallLayer!);
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
    this.spawnLayer.forEachTile((tile) => {
      if (tile.properties.spawn === true) {
        if (this.enemyCount < MAX_ENEMIES) {
          this.enemyCount++;
          const enemy = this.enemies.get().setActive(true).setVisible(true);
          if (enemy) {
            let x = tile.pixelX * this.scaleFactor,
              y = tile.pixelY * this.scaleFactor;
            enemy.spawn(x, y);
            this.startPositions.push(new Phaser.Math.Vector2(x, y));

            this.setRandomVelocity(enemy);
          }
        }
      }
    });
  }

  update(_time: number, delta: number) {
    this.player.update();
    this.chargeCD -= delta;
    if (
      Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.boss.x,
        this.boss.y,
      ) < 300 &&
      this.chargeCD <= 0
    ) {
      this.chargeCD = 5000;
      this.boss.charge(this.player);
    }

    this.enemies.getChildren().forEach(
      (e: Phaser.Physics.Arcade.Sprite, i: number) => {
        const start = this.startPositions[i];
        const dist = Phaser.Math.Distance.Between(start.x, start.y, e.x, e.y);
        if (dist > this.range) {
          this.setRandomVelocity(e);
        }

        if (Phaser.Math.Between(0, 100) < 1) {
          this.setRandomVelocity(e);
        }
      },
    );

    if (this.enemies.countActive(true) === 0) {
      this.scene.start("Win", {
        enemiesKilled: this.enemyCount,
        coinsCollected: this.player.inventory.gold,
      });

      this.enemyCount = 0;
    }
  }

  private setRandomVelocity(sprite: Phaser.Physics.Arcade.Sprite) {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    sprite.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed,
    );
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
