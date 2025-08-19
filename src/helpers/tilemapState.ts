export type TileState = 0 | 1 | 2 | 3;

class TilemapState {
  private grid: TileState[][];

  constructor(public rows: number, public cols: number) {
    this.grid = Array.from(
      { length: rows },
      () => Array<TileState>(cols).fill(0),
    );
  }

  getTileState(row: number, col: number): TileState | null {
    if (!this.isValid(row, col)) return null;
    return this.grid[row][col];
  }

  setTileState(row: number, col: number, state: TileState): void {
    if (!this.isValid(row, col)) return;
    this.grid[row][col] = state;
  }

  damageTile(row: number, col: number): void {
    if (!this.isValid(row, col)) return;
    const current = this.grid[row][col];
    if (current < 3) {
      this.grid[row][col] = (current + 1) as TileState;
    }
  }

  getMatrix(): ReadonlyArray<ReadonlyArray<TileState>> {
    return this.grid;
  }

  private isValid(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }
}

export default TilemapState;
