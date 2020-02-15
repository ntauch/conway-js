/**
 * The game object. For simplicity and easy namespacing, all the code is kept inside.
 * @type {conway}
 */
let conway = (function () {

        const STATE_DEAD = 0;
        const STATE_ALIVE = 1;
        const COLOR_GROUND = '#5b5b5b';
        const COLOR_CELL = 'rgba(213,71,75,0.73)';
        let cycleCounter = 0;
        let generationCounter = undefined;
        let cyclesPerSecondCounter = undefined;
        let cyclesPerSecondAverageCounter = undefined;
        let canvas, canvasCtx, width, height, scaling, startTime, time, lastCycleTime;
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
            state = undefined;
            lastState = undefined;
            constructor(state) {
                this.state = state;
            }
        }

        function recursiveDeepCopy(o) {
            let newO,
                i;

            if (typeof o !== 'object') {
                return o;
            }
            if (!o) {
                return o;
            }

            if ('[object Array]' === Object.prototype.toString.apply(o)) {
                newO = [];
                for (i = 0; i < o.length; i += 1) {
                    newO[i] = recursiveDeepCopy(o[i]);
                }
                return newO;
            }

            newO = {};
            for (i in o) {
                if (o.hasOwnProperty(i)) {
                    newO[i] = recursiveDeepCopy(o[i]);
                }
            }
            return newO;
        }

        /**
         * Draws the board to the canvas.
         */
        function drawBoard() {
            let livingCellCounter = 0;
            for (let x = 0; x < board.length; x++) {
                for (let y = 0; y < board[x].length; y++) {
                    if (board[x][y].state === STATE_ALIVE) {
                        livingCellCounter++;
                        canvasCtx.fillStyle = COLOR_CELL;
                    } else {
                        canvasCtx.fillStyle = COLOR_GROUND;
                    }
                    // For optimization purposes, only draw when state has changed.
                    if (board[x][y].lastState !== board[x][y].state) {
                        canvasCtx.fillRect(x * scaling, y * scaling, scaling, scaling);
                    }
                }
            }
            let counter = getDomElement('cellCounter');
            counter.textContent = livingCellCounter;
        }

        /**
         *
         */
        function cycle() {
            // Deep-copy the old board
            //let newBoard = JSON.parse(JSON.stringify(board));
            let newBoard = recursiveDeepCopy(board);

            for (let x = 0; x < board.length; x++) {
                for (let y = 0; y < board[x].length; y++) {
                    let currentCell = board[x][y];
                    let boardXLength = board.length;
                    let boardYLength = board[x].length;
                    let newBoardCurrentCell = newBoard[x][y];
                    let neighbourCounter = 0;
                    /**
                     * We need to check the surrounding neighbours from x - 1 to x + 1 and y - 1 to y + 1.
                     * A lot if implementations do this very inefficiently by hardcoding each of these cases,
                     * while it is much easier to use two for-loops.
                     */
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            // Make sure we're not checking ourselves
                            if (i !== 0 || j !== 0) {
                                let localX = x + i;
                                let localY = y + j;

                                // Edge detection
                                if (localX === -1) {
                                    localX = boardXLength - 1;
                                } else if (localX === boardXLength) {
                                    localX = 0;
                                }

                                if (localY === -1) {
                                    localY = boardYLength - 1;
                                } else if (localY === boardYLength) {
                                    localY = 0;
                                }
                                if (board[localX][localY].state === STATE_ALIVE) {
                                    neighbourCounter++;
                                }
                            }
                        }
                    }
                    newBoardCurrentCell.lastState = newBoardCurrentCell.state;
                    if (currentCell.state === STATE_DEAD && neighbourCounter === 3) {
                        newBoardCurrentCell.state = STATE_ALIVE;
                    } else if (currentCell.state === STATE_ALIVE) {
                        if (neighbourCounter < 2 || neighbourCounter > 3) {
                            newBoardCurrentCell.state = STATE_DEAD;
                        }
                    }
                }
            }

            // Swap the old board for the new
            board = newBoard;
        }

        async function animate() {
            lastCycleTime = time;
            time = Date.now();
            lastCycleTime = Number.parseFloat((60 / ((time - lastCycleTime) / 1000)) / 60).toPrecision(3);
            cyclesPerSecondCounter.textContent = lastCycleTime;
            generationCounter.textContent = cycleCounter;
            if (startTime === undefined) {
                startTime = time;
            }

            let elapsedSeconds = (time - startTime) / 1000;
            cyclesPerSecondAverageCounter.textContent = Number.parseFloat(cycleCounter / elapsedSeconds).toPrecision(3);

            cycle();
            drawBoard();

            //await sleep(0);
            if (cycleCounter < 20000) {
                cycleCounter++;
                requestAnimationFrame(animate)
            }
        }

        /**
         *
         * @param x
         * @param y
         */
        function initBoardArray(x, y) {
            for (let i = 0; i < x; i++) {
                board.push(new Array(0));
                for (let j = 0; j < y; j++) {
                    let state = Math.random();
                    state = state >= 0.90 ? STATE_ALIVE : STATE_DEAD;
                    board[i].push(new Cell(state));
                }
            }
        }

        /**
         * Initializes the game.
         * @param params Object with the following properties:
         *        int boardWidth: The width of the game board in pixels (default 100).
         *        int boardHeight: The height of the game board in pixels (default 100).
         *        int scaling: The pixel scaling to increase visibility of the cells (default 2).
         *        string canvasSelector: DOM-selector for the canvas element.
         *        string amountOfFields: DOM-selector for the total amount of fields on the board.
         *        string livingCellsCounter: DOM-selector for the living cell counter.
         *        string generationCounter: DOM-selector for the generation counter.
         */
        this.init = (params) => {
            width = params.boardWidth ? params.boardWidth : 100;
            height = params.boardHeight ? params.boardWidth : 100;
            scaling = params.scaling  ? params.scaling : 2;
            canvas = getDomElement(params.canvasSelector);
            canvas.width = width * scaling;
            canvas.height = height * scaling;
            canvasCtx = canvas.getContext('2d');
            let counter = getDomElement(params.amountOfFields);
            counter.textContent = width * height;
            generationCounter = getDomElement(params.generationCounter);
            cyclesPerSecondAverageCounter = getDomElement(params.cyclesPerSecondAverageCounter);
            cyclesPerSecondCounter = getDomElement(params.cyclesPerSecondCounter);
            initBoardArray(width, height);
            requestAnimationFrame(animate);
        }
    }

);
