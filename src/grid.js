"use strict";

// Types of tiles within the reactor grid.
const Tile = {
    EMPTY: {
        name: "Empty Tile",
        description: "Does nothing.",
        color: "#bbb",
    },
    FUEL: {
        name: "Fuel Cell",
        description: "Reacts with neutrons.",
        color: "#83cc14",
        interact(n, col, row) {
            // Randomly absorb neutrons.
            if (Math.random() < FUEL_ABSORB_CHANCE) {
                n.dead = true;

                // Spawn more neutrons.
                const count = Math.floor(random(
                    FUEL_MIN_NEUTRONS,
                    FUEL_MAX_NEUTRONS + 1
                ));
                for (let i = 0; i < count; ++i) {
                    const { x, y } = randomInsideTile(col, row);
                    neutrons.push(new Neutron(x, y));
                }
            }
        },
    },
    MODERATOR: {
        name: "Moderator",
        description: "Slows down neutrons.",
        color: "#eee",
        interact(n) {
            // Slow down neutrons.
            n.vel.limit(NEUTRON_THERMAL_SPEED);
        },
    },
    SHIELDING: {
        name: "Shielding",
        description: "Absorbs neutrons.",
        color: "#888",
        interact(n) {
            if (Math.random() < SHIELDING_ABSORB_CHANCE) {
                n.dead = true;
            }
        },
    },
    HORIZONTAL_REFLECTOR: {
        name: "Reflector",
        description: "Reflects neutrons in the horizontal direction.",
        color: "#ffbf3f",
        interact(n) {
            // Randomly reflect neutrons.
            const r = Math.random();
            if (r < REFLECTION_CHANCE) {
                n.vel.x *= -1;
            } else if (r < REFLECTION_CHANCE + REFLECTOR_ABSORB_CHANCE) {
                n.dead = true;
            }
        },
    },
    VERTICAL_REFLECTOR: {
        name: "Reflector",
        description: "Reflects neutrons in the vertical direction.",
        color: "#77cfd6",
        interact(n) {
            // Randomly reflect neutrons.
            const r = Math.random();
            if (r < REFLECTION_CHANCE) {
                n.vel.y *= -1;
            } else if (r < REFLECTION_CHANCE + REFLECTOR_ABSORB_CHANCE) {
                n.dead = true;
            }
        },
    },
    CONTROL_ROD: {
        name: "Control Rod",
        description: "Absorbs neutrons only when toggled.",
        color() {
            // Change color based on control rod state.
            if (controlRods) {
                return "#aa61aa";
            } else {
                return "#3f97f4";
            }
        },
        interact(n) {
            // Absorb neutrons when toggled.
            if (controlRods && Math.random() < CONTROL_ROD_ABSORB_CHANCE) {
                n.dead = true;
            }
        },
    },
};

// A 2D grid of tiles.
class Grid {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.grid = new Array(cols * rows).fill(Tile.EMPTY);

        // Calculate offset.
        this.width = cols * TILE_SIZE;
        this.height = rows * TILE_SIZE;
        this.offsetX = (width - this.width) / 2;
        this.offsetY = (height - this.height) / 2;

        // Graphics context.
        this.ctx = createGraphics(this.width, this.height);
        this.ctx.stroke('#111');
        this.redraw();
    }

    clear() {
        this.grid.fill(Tile.EMPTY);
        this.redraw();
    }

    display() {
        image(this.ctx, this.offsetX, this.offsetY);
    }

    get(col, row) {
        return this.grid[row * this.cols + col];
    }

    redraw() {
        for (let row = 0; row < this.rows; ++row) {
            for (let col = 0; col < this.cols; ++col) {
                // Fill color based on tile type.
                const tile = this.get(col, row);
                if (typeof tile.color === 'function') {
                    this.ctx.fill(tile.color());
                } else {
                    this.ctx.fill(tile.color);
                }

                // Draw the tile at the correct position.
                const x = col * TILE_SIZE;
                const y = row * TILE_SIZE;
                this.ctx.square(x, y, TILE_SIZE);
            }
        }
    }

    set(col, row, tile) {
        this.grid[row * this.cols + col] = tile;
    }
}
