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
        let canvas, canvasCtx, width, height, scaling, startTime, time, lastCycleTime, cellCounter, activeGrid, previousGrid, sleepPerCycle;
        let gridA = new Array(0);
        let gridB = new Array(0);

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
            //state = undefined;
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
         * Draws the grid to the canvas.
         */
        function drawGrid() {
            let livingCellCounter = 0;
            for (let x = 0; x < activeGrid.length; x++) {
                for (let y = 0; y < activeGrid[x].length; y++) {
                    if (activeGrid[x][y].state === STATE_ALIVE) {
                        livingCellCounter++;
                        canvasCtx.fillStyle = COLOR_CELL;
                    } else {
                        canvasCtx.fillStyle = COLOR_GROUND;
                    }
                    // For optimization purposes, only draw when state has changed.
                    if (activeGrid[x][y].state !== previousGrid[x][y].state) {
                        canvasCtx.fillRect(x * scaling, y * scaling, scaling, scaling);
                    }
                }
            }
            cellCounter.textContent = livingCellCounter;
        }

        function switchGrids() {
            if (gridA.active) {
                gridA.active = false;
                gridB.active = true;
                activeGrid = gridB;
                previousGrid = gridA;
            } else {
                gridA.active = true;
                gridB.active = false;
                activeGrid = gridA;
                previousGrid = gridB;
            }
        }

        /**
         *
         */
        function cycle() {

            switchGrids();

            for (let x = 0; x < previousGrid.length; x++) {
                for (let y = 0; y < previousGrid[x].length; y++) {
                    let previousCell = previousGrid[x][y];
                    let gridXLength = previousGrid.length;
                    let gridYLength = previousGrid[x].length;
                    let newGridCurrentCell = activeGrid[x][y];
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
                                    localX = gridXLength - 1;
                                } else if (localX === gridXLength) {
                                    localX = 0;
                                }

                                if (localY === -1) {
                                    localY = gridYLength - 1;
                                } else if (localY === gridYLength) {
                                    localY = 0;
                                }
                                if (previousGrid[localX][localY].state === STATE_ALIVE) {
                                    neighbourCounter++;
                                }
                            }
                        }
                    }
                    if (previousCell.state === STATE_DEAD && neighbourCounter === 3) {
                        newGridCurrentCell.state = STATE_ALIVE;
                    } else if (previousCell.state === STATE_ALIVE) {
                        if (neighbourCounter < 2 || neighbourCounter > 3) {
                            newGridCurrentCell.state = STATE_DEAD;
                        } else  {
                            newGridCurrentCell.state = STATE_ALIVE;
                        }
                    }
                    else {
                        newGridCurrentCell.state = STATE_DEAD;
                    }
                }
            }
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
            drawGrid();

            await sleep(sleepPerCycle);
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
        function initGridArray(x, y) {
            for (let i = 0; i < x; i++) {
                gridA.push(new Array(0));
                for (let j = 0; j < y; j++) {
                    let state = Math.random();
                    state = state >= 0.90 ? STATE_ALIVE : STATE_DEAD;
                    gridA[i].push(new Cell(state));
                }
            }
            gridA.active = false;
            gridA.name = 'gridA';
            gridB = recursiveDeepCopy(gridA);
            gridA.active = true;
            gridB.name = 'gridB';
        }

        /**
         * Initializes the game.
         * @param params Object with the following properties:
         *        int gridWidth: The width of the game grid in pixels (default 100).
         *        int gridHeight: The height of the game grid in pixels (default 100).
         *        int scaling: The pixel scaling to increase visibility of the cells (default 2).
         *        string canvasSelector: DOM-selector for the canvas element.
         *        string amountOfFields: DOM-selector for the total amount of fields on the grid.
         *        string livingCellsCounter: DOM-selector for the living cell counter.
         *        string generationCounter: DOM-selector for the generation counter.
         */
        this.init = (params) => {
            width = params.gridWidth ? params.gridWidth : 100;
            height = params.gridHeight ? params.gridHeight : 100;
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
            cellCounter = getDomElement('cellCounter');
            sleepPerCycle = params.sleepPerCycle ? params.sleepPerCycle : 0;
            initGridArray(width, height);
            requestAnimationFrame(animate);
        }
    }

);
