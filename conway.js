/**
 * The game object. For simplicity and easy namespacing, all the code is kept inside.
 * @type {conway}
 */
let conway = (function () {

    const STATE_DEAD = 0;
    const STATE_ALIVE = 1;
    const COLOR_GROUND = '#ffffff';
    const COLOR_CELL = '#222222';
    let cycleCounter = 0;

    // Metadata for external view
    this.numberOfCells = undefined;
    this.renderTime = undefined;
    let canvas, canvasCtx, width, height, scaling, startTime, time, requestId;
    let board = new Array(0);

    /**
     *
     * @param selector
     * @returns {HTMLElement}
     */
    function getDomElement(selector) {
        return document.getElementById(selector);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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
     * Draws the board to the canvas.
     */
    function drawBoard() {
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                if (board[x][y].state === STATE_ALIVE) {
                    canvasCtx.fillStyle = COLOR_CELL;
                } else {
                    canvasCtx.fillStyle = COLOR_GROUND;
                }
                canvasCtx.fillRect(x * scaling,y * scaling, scaling, scaling);
            }
        }
    }

    async function animate() {
        time = Date.now();
        if (startTime === undefined) {
            startTime = time;
        }
        let elapsedSeconds = (Date.now() - startTime) / 1000;
        console.log(elapsedSeconds + ": cycle()…");
        cycle();
        elapsedSeconds = (Date.now() - startTime) / 1000;
        console.log(elapsedSeconds + ": drawBoard()…");
        drawBoard();
        if (elapsedSeconds < 20) {
            requestId = requestAnimationFrame(animate);
        }
    }

    /**
     *
     */
    function cycle() {
        // Deep-copy the old board
        let newBoard = JSON.parse(JSON.stringify(board));

        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                let currentCell = board[x][y];
                let newBoardCurrentCell = newBoard[x][y];
                let neighbourCounter = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        // Make sure we're not checking ourselves.
                        if (i !== 0 || j !== 0) {
                            if (x + i >= 0 &&
                                x + i < board.length &&
                                y + j >= 0 &&
                                y + j < board[x].length
                            ) {
                                if (board[x+i][y+j].state === STATE_ALIVE) {
                                    neighbourCounter++;
                                }
                            }
                        }
                    }
                }
                if (currentCell.state === STATE_DEAD && neighbourCounter === 3) {
                    newBoardCurrentCell.state = STATE_ALIVE;
                } else if (currentCell.state === STATE_ALIVE ) {
                    if (neighbourCounter < 2 || neighbourCounter > 3) {
                        newBoardCurrentCell.state = STATE_DEAD;
                    }
                }
            }
        }

        // Swap the old board for the new
        board = newBoard;
    }

    async function testAnim() {
        time = Date.now();
        if (startTime === undefined) {
            startTime = time;
        }

        let elapsedSeconds = (time - startTime) / 1000;
        cycle();
        drawBoard();

        await sleep(50);
        if (cycleCounter < 20000) {
            cycleCounter++;
            requestAnimationFrame(testAnim)
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
                let state = Math.random();
                state = state >= 0.90 ? 1 : 0;
                board[i].push(new Cell(state));
            }
        }
    }

    /**
     * Initializes the game.
     * @param x The x coordinate for the board.
     * @param y The y coordinate for the board.
     * @param w Number of cells on the x-axis.
     * @param h Number of cells on the y-axis.
     * @param paramScaling Optional scaling parameter. For example a value of 2 will scale the board to twice the size.
     */
    this.init = (x, y, w, h, paramScaling) => {
        width = w;
        height = h;
        scaling = paramScaling ? paramScaling : 1;
        canvas = getDomElement('canvasBoard');
        canvas.width = width * scaling;
        canvas.height = height * scaling;
        canvasCtx = canvas.getContext('2d');
        let counter = getDomElement('counter');
        counter.textContent = width * height;
        initBoardArray(width, height);
        requestAnimationFrame(testAnim);
    }
});
