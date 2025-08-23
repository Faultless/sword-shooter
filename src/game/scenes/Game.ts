import { Scene } from "phaser";
import Enemy from "../enemy";
import Player from "../player";
import HUD from "../hud";
import Boss from "../boss";
import TilemapState, { TileState } from "../../helpers/tilemapState";
import DialogueBubble, { Orientation } from "../DialogueBubble";

const MAX_ENEMIES = 125;
export const BULLET_SPEED = 800;
export const ENEMY_SPEED = 100;

const DIALOGUES = [
  {
    avatar: "hero",
    dialogue: `
Ow.. Where the hell am I? Feels like a truck ran me over..
Is this.. some kind of dungeon cell? It's giving me the creeps.. 
`,
  },
  { avatar: "hero", dialogue: "!! What was that noise??" },
  { avatar: "enemy", dialogue: "*AUUUGH*" },
  { avatar: "hero", dialogue: "I have to get the hell out of here. Fast." },
];

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
  damageLayer: Phaser.Tilemaps.TilemapLayer;
  hud: HUD;
  scaleFactor: number;
  chargeCD = 500;
  introDialogue: DialogueBubble;
  private readonly range = 100;
  private readonly speed = 50; // movement speed in px/sec
  private startPositions: Phaser.Math.Vector2[] = [];
  private tilemapState!: TilemapState;
  private currentStoryIdx = 0;

  constructor() {
    super("Game");
  }

  create() {
    this.introScene();

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
    this.background.setDepth(-1);

    // Create Map
    const map = this.make.tilemap({ key: "dungeonMap" });
    const tileset = map.addTilesetImage("dungeon", "dungeonTiles");
    const damageTileset = map.addTilesetImage("damage", "damageTiles");

    this.damageLayer = map.createLayer("Damage", damageTileset!)!;
    const floorLayer = map.createLayer("Floors", tileset!);
    this.wallLayer = map.createLayer("Walls", tileset!)!;
    this.spawnLayer = map.createLayer("Spawn", tileset!)!;

    const scaleX = this.cameras.main.width / map.widthInPixels;
    const scaleY = this.cameras.main.height / map.heightInPixels;
    this.scaleFactor = Math.max(scaleX, scaleY);

    this.damageLayer?.setScale(this.scaleFactor);
    floorLayer?.setScale(this.scaleFactor);
    this.wallLayer?.setScale(this.scaleFactor);
    this.spawnLayer?.setScale(this.scaleFactor);

    this.damageLayer?.fill(0);
    this.damageLayer?.setDepth(2);
    this.tilemapState = new TilemapState(
      this.damageLayer?.width ?? 16 / 16,
      this.damageLayer?.height ?? 16 / 16,
    );

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
      100,
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
      () => {
        const worldX = this.player.x + 60;
        const worldY = this.player.y;
        const tile = this.damageLayer.getTileAtWorldXY(worldX, worldY);
        if (!tile) return;

        const { x, y } = tile;
        this.tilemapState.damageTile(y, x); // row=y, col=x
        this.updateTileVisual(x, y);
        this.player.attack(this.enemies, this.boss);
      },
    );
    this.input.keyboard?.on("keydown-I", () => this.showInventory());
    this.input.keyboard?.on(
      "keydown-E",
      () => {
        if (this.currentStoryIdx === DIALOGUES.length - 1) {
          this.introDialogue.destroy();
          return;
        }
        this.goNext(++this.currentStoryIdx);
      },
    );
    this.input.keyboard?.on("keydown-Q", () => {
      if (this.currentStoryIdx === 0) return;
      this.goNext(--this.currentStoryIdx);
    });

    this.loots = this.physics.add.staticGroup();

    this.enemySpawnCooldown = 0;

    this.physics.add.collider(
      this.player,
      this.boss,
      () => {
        this.player.hit(2);
      },
      () => !this.player.isHit,
      this,
    );

    this.physics.add.collider(
      this.player,
      this.enemies,
      () => {
        this.player.hit();
      },
      () => !this.player.isHit,
      this,
    );

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

  goNext(idx: number) {
    this.introDialogue.setAvatar(DIALOGUES[idx].avatar);
    this.introDialogue.setDialogue(DIALOGUES[idx].dialogue);
  }

  introScene() {
    this.introDialogue = new DialogueBubble(
      this,
      0,
      this.cameras.main.height,
      this.cameras.main.width,
      this.cameras.main.height,
      Orientation.LEFT,
      // this.goNext.bind(this),
    );

    this.introDialogue.setDialogue(DIALOGUES[0].dialogue);
    this.introDialogue.setAvatar(DIALOGUES[0].avatar);

    this.introDialogue.nextBtn.setDepth(1001);
    this.introDialogue.setDepth(999);
    this.introDialogue.setInteractive().on(
      "pointerdown",
      () => console.log("hi"),
    );

    this.add.existing(this.introDialogue);
  }

  /** Update the tile’s appearance based on its damage state */
  private updateTileVisual(col: number, row: number) {
    const state = this.tilemapState.getTileState(row, col);
    if (state === null) return;

    // Map states to tileset indices (you define these in your tileset image)
    const stateToTileIndex: Record<TileState, number> = {
      0: 499, // undamaged tile graphic
      1: 500, // slightly damaged
      2: 501, // very damaged
      3: 502, // destroyed
    };

    const tileIndex = stateToTileIndex[state];
    this.damageLayer.putTileAt(tileIndex, col, row);
  }

  update(_time: number, delta: number) {
    this.player.update();
    this.chargeCD -= delta;

    const playerTile = this.tilemapState.getTileState(
      Math.round(this.player.x / this.scaleFactor / 16),
      Math.round(this.player.y / this.scaleFactor / 16),
    );
    if (playerTile === 3) this.player.die();

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
