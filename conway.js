/**
 * The game object. For simplicity and easy namespacing, all the code is kept inside.
 * @type {conway}
 */
let conway = (function () {

    const STATE_DEAD = 0;
    const STATE_ALIVE = 1;
    const COLOR_GROUND = '#ffffff';
    const COLOR_CELL = '#333333';

    let canvas, canvasCtx;
    let board = new Array(0);

    /**
     * Class declaration for individual cells.
     * @param state accepts { "STATE_DEAD" | "STATE_ALIVE" }
     *
     */
    class Cell {
        constructor(state) {
            this.state = state;
        }
    }

    /**
     * Draws board to canvas.
     */
    function drawBoard() {
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                if (board[x][y].state === STATE_ALIVE) {
                    canvasCtx.fillStyle = COLOR_CELL;
                } else {
                    canvasCtx.fillStyle = COLOR_GROUND;
                }
                    canvasCtx.fillRect(x,y,1,1);
            }
        }
    }

    /**
     *
     * @param x
     * @param y
     */
    function initBoardArray(x,y) {
        for (let i = 0; i < x; i++) {
            board.push(new Array(0));
            for (let j = 0; j < y; j++) {
                board[i].push(new Cell(STATE_DEAD));
            }
        }
    }

    /**
     * Initializes the game.
     * @param x The x coordinate for the board.
     * @param y The y coordinate for the board.
     * @param width The width of the board.
     * @param height The height of the board.
     */
    this.init = (x, y, width, height) => {
        canvas = document.getElementById('canvasBoard');
        canvas.width = width;
        canvas.height = height;
        canvasCtx = canvas.getContext('2d');
        canvasCtx.fillStyle = '#6eff08';
        canvasCtx.fillRect(x, y, width, height);
        initBoardArray(width,height);
        drawBoard();
    }
});
