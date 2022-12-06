//@ts-check
/** @type {HTMLCanvasElement} */ //@ts-ignore canvas is an HTMLCanvasElement
const canvas = document.getElementById("game-canvas");
/** @type {CanvasRenderingContext2D} */ //@ts-ignore canvas is an HTMLCanvasElement
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

const MOVE_UP = "up";
const MOVE_DOWN = "down";
const MOVE_LEFT = "left";
const MOVE_RIGHT = "right";

let game = {
	gridSize: 20,
	refreshRate: 500, // milliseconds
};

class Player {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {game} game
	 */
	constructor(x, y, ctx, game) {
		this.x = x;
		this.y = y;
		this.game = game;
		this.ctx = ctx;

		this.currentDirection = MOVE_DOWN;
		this.head = new Segment(this.x, this.y, "yellow", this.ctx);
		this.segments = [];

		this.lastUpdate = 0;
		this.wireUpEvents();
	}

	/**
	 * @param {number} elapsedTime
	 */
	update(elapsedTime) {
		this.lastUpdate += elapsedTime;
		if (this.lastUpdate < this.game.refreshRate) return;

		this.lastUpdate = 0;

		switch (this.currentDirection) {
			case MOVE_DOWN:
				this.head.y += this.game.gridSize;
				break;
			case MOVE_UP:
				this.head.y -= this.game.gridSize;
				break;
			case MOVE_RIGHT:
				this.head.x += this.game.gridSize;
				break;
			case MOVE_LEFT:
				this.head.x -= this.game.gridSize;
				break;
		}
	}

	draw() {
		this.head.draw();
		this.segments.forEach((s) => {
			s.draw();
		});
	}

	wireUpEvents() {
		document.addEventListener("keydown", (e) => {
			// console.log(e.code);
			switch (e.code) {
				case "ArrowUp":
					this.currentDirection = MOVE_UP;
					break;
				case "ArrowDown":
					this.currentDirection = MOVE_DOWN;
					break;
				case "ArrowRight":
					this.currentDirection = MOVE_RIGHT;
					break;
				case "ArrowLeft":
					this.currentDirection = MOVE_LEFT;
					break;
			}
		});
	}
}

class Segment {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} color
	 * @param {CanvasRenderingContext2D} ctx
	 */
	constructor(x, y, color, ctx) {
		this.x = x;
		this.y = y;
		this.w = game.gridSize;
		this.h = this.w;
		this.color = color;
		this.ctx = ctx;
	}

	update() {}

	draw() {
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(this.x, this.y, this.w, this.h);
	}
}

// Food notes
// Should obey our grid restrictions
// when you run into your snake grows - randomize these
// 		red food + 1 segment
//		blue food + 2 segments
//		gold food + 3 segments
// start with circles
// spawn in random grid
// 		within the boundaries of the grid
//		only spawn on empty grid spots
// How many food spawn?
//  	Make it configurable?
//		At least 2

class Food {
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	constructor(ctx) {
		this.ctx = ctx;
		this.x = 0;
		this.y = 0;
		this.radius = game.gridSize / 2;
		this.color = "red";
		this.growBy = 1;
		this.isEaten = false;
	}

	update() {}

	draw() {
		this.ctx.beginPath();
		this.ctx.fillStyle = this.color;
		this.ctx.arc(
			this.x + this.radius,
			this.y + this.radius,
			this.radius,
			0,
			Math.PI * 2
		);
		this.ctx.closePath();
	}
}

// Other Things we can run into  - Ideas
// Bomb
// Makes your faster

let p1 = new Player(5 * game.gridSize, 5 * game.gridSize, ctx, game);
let f1 = new Food(ctx);

let currentTime = 0;

function gameLoop(timestamp) {
	let elapsedTime = timestamp - currentTime;
	currentTime = timestamp;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	p1.update(elapsedTime);
	p1.draw();

	f1.draw();

	requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
