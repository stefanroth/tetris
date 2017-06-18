/*
 *
 * Original Tetris was invented by Алексей Леонидович Пажитнов in 1985
 * http://en.wikipedia.org/wiki/Alexey_Pajitnov
 * http://en.wikipedia.org/wiki/Tetris
 *
 */

window.onload = function() {
    document.getElementById(gb.selector).focus();
    gb.init();
};

document.onkeydown = function(event) {
    switch(event.keyCode) {
        case 13: // enter
            if(!gb.started) {
                gb.init();
            }
            break;
        case 27: // escape
            if(gb.intervalInstance != null) {
                window.clearInterval(gb.intervalInstance);
                gb.intervalInstance = null;
            } else {
                gb.doIt();
            }
            break;
        case 37: // left
            if(gb.started) {
                gb.moveStone('left');
            }
            break;
        case 38: // up
            if(gb.started) {
                gb.moveStone('rotate');
            }
            break;
        case 39: // right
            if(gb.started) {
                gb.moveStone('right');
            }
            break;
        case 40: // down
            if(gb.started) {
                gb.moveStone('down');
            }
            break;
    }
};

var gb = { // gameboard
    // adjust these settings as you like
    cellWidth :   22,           // pixel
    boardHeight : 21,           // cells
    boardWidth :  11,           // cells
    margin :       2,           // pixel
    interval :   700,           // milliseconds
    levelUp :     15,           // stones per level
    selector : "container",     // html id for the canvas element

    // game events
    onFullRow : function(fullRowCounter) {
        gb.score += fullRowCounter * fullRowCounter * 5;
    },

    onNewStone : function() {
        gb.score += 1;
    },

    onNewLevel : function() {
        gb.draw.level();
    },

    onGameOver : function() {
        gb.draw.gameOver();
        gb.started = false;
    },

    init : function() {
        gb.draw.container = document.getElementById(gb.selector).getContext('2d');
        gb.createStones();
        gb.score = 0;
        gb.level = 1;
        gb.stoneCounter = 0;
        gb.levelRunner = 0;
        gb.stoneX = 0;
        gb.stoneY = 0;
        gb.stoneKind = 0;
        gb.stoneState = 0;
        gb.interval = 700;
        gb.started = true;
        gb.board = gb.newBoard();
        gb.draw.board();
        gb.draw.score();
        gb.draw.level();
        gb.newStone();
        gb.doIt();
    },

    doIt : function() {
        window.clearInterval(gb.intervalInstance);
        gb.intervalInstance = window.setInterval(function() {
            gb.stoneCounter++;
            if(!gb.moveStone('down')) {
                gb.fixStone();
                gb.redraw();
                gb.newLevel();
                gb.onNewStone();
                gb.newStone();
                gb.draw.score();
                gb.draw.level();
            }
        }, gb.interval);
    },

    draw : {
        container : null,
        board : function() {
            // blank new canvas
            gb.draw.container.clearRect(0, 0, gb.draw.container.canvas.width, gb.draw.container.canvas.height);
            gb.draw.container.lineWidth = 1.0;
            gb.draw.container.beginPath();
            gb.draw.container.strokeRect(
                gb.margin,
                gb.margin,
                gb.cellWidth * gb.boardWidth + 2 * gb.margin,
                gb.cellWidth * gb.boardHeight +2 * gb.margin
            );
            // draw the board
            for(var i = 0; i < gb.boardHeight; i++) {
                for(var j = 0; j < gb.boardWidth; j++) {
                    gb.draw.container.fillStyle = gb.getStoneColor(gb.board[i][j]);
                    gb.draw.container.fillRect(
                        j * gb.cellWidth + gb.margin + 2,
                        i * gb.cellWidth + gb.margin + 2,
                        gb.cellWidth - 1,
                        gb.cellWidth - 1
                    );
                }
            }
            gb.draw.container.closePath();
        },
        stone : function(x, y, kind, state) {
            var stone = gb.stones[kind][state];
            for(var i = 0; i < stone.length; i++) {
                for(var j = 0; j < stone[i].length; j++) {
                    if(stone[i][j]) {
                        gb.draw.container.beginPath();
                        gb.draw.container.fillStyle = gb.getStoneColor(kind);
                        gb.draw.container.fillRect(
                            x * gb.cellWidth + i * gb.cellWidth + gb.margin + 2,
                            y * gb.cellWidth + j * gb.cellWidth + gb.margin + 2,
                            gb.cellWidth - 1,
                            gb.cellWidth - 1
                        );
                        gb.draw.container.closePath();
                    }
                }
            }
            gb.stoneX = x;
            gb.stoneY = y;
        },
        score : function() {
            gb.draw.container.beginPath();
            gb.draw.container.fillStyle = "white";
            gb.draw.container.fillRect(
                gb.cellWidth * gb.boardWidth + 2 * gb.margin - 98,
                gb.cellWidth * gb.boardHeight + 2 * gb.margin + 4,
                100,
                20
            );
            gb.draw.container.fillStyle = "red";
            gb.draw.container.font = 'bold 14px/16px Helvetica';
            gb.draw.container.textAlign = 'right';
            gb.draw.container.fillText(
                'Score: ' + gb.score,
                gb.cellWidth * gb.boardWidth + 2 * gb.margin,
                gb.cellWidth * gb.boardHeight + 2 * gb.margin + 20
            );
            gb.draw.container.closePath();
        },
        level : function() {
            gb.draw.container.beginPath();
            gb.draw.container.fillStyle = "white";
            gb.draw.container.fillRect(
                gb.margin,
                gb.cellWidth * gb.boardHeight + 2 * gb.margin + 4,
                70,
                20
            );
            gb.draw.container.fillStyle = "blue";
            gb.draw.container.font = 'bold 14px/16px Helvetica';
            gb.draw.container.textAlign = 'left';
            gb.draw.container.fillText(
                'Level: ' + gb.level,
                gb.margin,
                gb.cellWidth * gb.boardHeight + 2 * gb.margin + 20
            );
            gb.draw.container.closePath();
        },
        gameOver : function() {
            gb.draw.container.beginPath();
            for (var i = 0; i < gb.boardHeight; i++) {
                for (var j = 0; j < gb.boardWidth; j++) {
                    if (gb.board[i][j] == -1) {
                        var color = Math.floor(Math.random() * gb.stones.length);
                        gb.draw.container.fillStyle = gb.getStoneColor(color);
                        gb.draw.container.fillRect(
                            j * gb.cellWidth + gb.margin + 2,
                            i * gb.cellWidth + gb.margin + 2,
                            gb.cellWidth - 1,
                            gb.cellWidth - 1
                        );
                    }
                }
            }
            gb.draw.container.textAlign = 'center';
            gb.draw.container.font = 'bold 35px/40px Helvetica';
            gb.draw.container.fillStyle = 'white';
            gb.draw.container.fillText(
                'GAME OVER',
                gb.margin + 2 + (gb.cellWidth * gb.boardWidth) / 2,
                200 + 2
            );
            gb.draw.container.textAlign = 'center';
            gb.draw.container.font = 'bold 35px/40px Helvetica';
            gb.draw.container.fillStyle = 'red';
            gb.draw.container.fillText(
                'GAME OVER',
                gb.margin + (gb.cellWidth * gb.boardWidth) / 2,
                200
            );
            gb.draw.container.closePath();
        }
    },


    newLevel : function() {
        gb.levelRunner++;
        if(gb.levelRunner >= gb.levelUp) {
            gb.levelRunner = 0;
            gb.level++;
            gb.onNewLevel();
            gb.interval = Math.floor(gb.interval / 1.1);
            window.clearInterval(gb.intervalInstance);
            gb.doIt();
        }
    },

    newBoard : function() {
        var b = [];
        for(var i = 0; i < gb.boardHeight; i++) {
            b[i] = [];
            for(var j = 0; j < gb.boardWidth; j++) {
                b[i][j] = -1; // default value "no stone in this cell"
            }
        }
        return b;
    },

    redraw : function() {
        var newBoard = gb.newBoard();
        var nI = gb.boardHeight - 1;
        var fullRowCounter = 0;
        for (var i = gb.boardHeight - 1; i >= 0; i--) {
            var rowfull = true;
            for(var j = 0; j < gb.boardWidth; j++) {
                if(gb.board[i][j] == -1) {
                    rowfull = false;
                }
            }
            if(rowfull) {
                fullRowCounter ++;
            } else {
                newBoard[nI] = gb.board[i];
                nI--;
            }
        }
        if(fullRowCounter > 0) {
            gb.onFullRow(fullRowCounter);
            gb.board = newBoard;
            gb.draw.board();
        }
    },

    fixStone : function() {
        for(var i = 0; i < gb.stones[gb.stoneKind][gb.stoneState].length; i++) {
            for(var j = 0; j < gb.stones[gb.stoneKind][gb.stoneState][i].length; j++) {
                if(gb.stones[gb.stoneKind][gb.stoneState][i][j]) {
                    gb.board[gb.stoneY+j][gb.stoneX+i] = gb.stoneKind;
                }
            }
        }
    },

    removeStone : function() {
        var stone = gb.stones[gb.stoneKind][gb.stoneState];
        var container = document.getElementById(gb.selector).getContext('2d');
        for(var i = 0; i < stone.length; i++) {
            for(var j = 0; j < stone[i].length; j++) {
                if(stone[i][j]) {
                    container.beginPath();
                    container.fillStyle = gb.getStoneColor(-1);
                    container.fillRect(
                        gb.stoneX * gb.cellWidth + i * gb.cellWidth + gb.margin + 2,
                        gb.stoneY * gb.cellWidth + j * gb.cellWidth + gb.margin + 2,
                        gb.cellWidth - 1,
                        gb.cellWidth - 1
                    );
                    container.closePath();
                }
            }
        }
    },

    newStone : function() {
        gb.stoneKind = Math.floor(Math.random() * (gb.stones.length));
        gb.stoneState = 0;
        gb.stoneX = Math.floor(
            gb.boardWidth / 2
            - gb.stones[gb.stoneKind][0].length / 2
        );
        gb.stoneY = 0;
        if(gb.checkStonePosition(
                gb.stoneX, gb.stoneY,
                gb.stoneKind, gb.stoneState)
        ) {
            gb.draw.stone(
                gb.stoneX, gb.stoneY,
                gb.stoneKind, gb.stoneState
            );
        } else {
            window.clearInterval(gb.intervalInstance);
            gb.started = false;
            gb.onGameOver();
        }
    },

    checkStonePosition : function(x, y, kind, state) {
        for(var i = 0; i < gb.stones[kind][state].length; i++) {
            for (var j = 0; j < gb.stones[kind][state][i].length; j++) {
                if(gb.stones[kind][state][i][j]) {
                    // is the stone still in the board?
                    if(x+i < 0 || y + j < 0 || x+i > gb.boardWidth - 1 || y + j > gb.boardHeight - 1) {
                        return false;
                    }
                    // is there already another stone?
                    if(gb.board[y+j][x+i] > -1) {
                        return false;

                    }
                }
            }
        }
        return true;
    },

    moveStone : function(direction) {
        var state = gb.stoneState;
        var x, y;
        switch(direction) {
            case 'left':
                x = gb.stoneX - 1;
                y = gb.stoneY;
                break;
            case 'right':
                x = gb.stoneX + 1;
                y = gb.stoneY;
                break;
            case 'down':
                x = gb.stoneX;
                y = gb.stoneY + 1;
                break;
            case 'rotate':
                x = gb.stoneX;
                y = gb.stoneY;
                state++;
                if(state >= gb.stones[gb.stoneKind].length) {
                    state = 0;
                }
                break;
            default:
                break;
        }
        if(gb.checkStonePosition(x, y, gb.stoneKind, state)) {
            gb.removeStone();
            gb.draw.stone(x, y, gb.stoneKind, state);
            gb.stoneX = x;
            gb.stoneY = y;
            gb.stoneState = state;
        } else {
            return false;
        }
        return true;
    },

    getStoneColor : function(kind) {
        switch(kind) {
            case 0:
                return "#2EB800";
            case 1:
                return "#B82E00";
            case 2:
                return "#FFCC33";
            case 3:
                return "#008AB8";
            case 4:
                return "brown";
            case 5:
                return "#B8008A";
            case 6:
                return "olive";
            default:
                return "white";
        }
    },

    stoneRotate : function (stone) {
        // x|y => y|-x+h-1
        var h = stone.length;
        var result = [];
        for(var i = 0; i < h; i++) {
            result[i] = [];
        }
        for(var x = 0; x < h; x++) {
            for(var y = 0; y < h; y++) {
                result[y][(-1 * x) + h - 1] = stone[x][y];
            }
        }
        return result;
    },

    createStones : function() {
        // Stone definitions
        gb.stones = [[[
            //   █
            //  ███
            [false, true, false],
            [true, true, true],
            [false, false, false]
        ]],[[
            //  ████
            [false, false, false, false],
            [false, false, false, false],
            [true, true, true, true],
            [false, false, false, false]
        ]],[[
            //  ██
            //  ██
            [true, true],
            [true, true]
        ]],[[
            //   ██
            //  ██
            [false, true, true],
            [true, true, false],
            [false, false, false]
        ]],[[
            //  ██
            //   ██
            [true, true, false],
            [false, true, true],
            [false, false, false]
        ]],[[
            //  ███
            //  █
            [true, true, true],
            [true, false, false],
            [false, false, false]
        ]],[[
            //  ███
            //    █
            [true, true, true],
            [false, false, true],
            [false, false, false]
        ]]];

        // Stone rotations
        gb.stones[0][1] = gb.stoneRotate(gb.stones[0][0]);
        gb.stones[0][2] = gb.stoneRotate(gb.stones[0][1]);
        gb.stones[0][3] = gb.stoneRotate(gb.stones[0][2]);

        gb.stones[1][1] = gb.stoneRotate(gb.stones[1][0]);

        gb.stones[3][1] = gb.stoneRotate(gb.stones[3][0]);

        gb.stones[4][1] = gb.stoneRotate(gb.stones[4][0]);

        gb.stones[5][1] = gb.stoneRotate(gb.stones[5][0]);
        gb.stones[5][2] = gb.stoneRotate(gb.stones[5][1]);
        gb.stones[5][3] = gb.stoneRotate(gb.stones[5][2]);

        gb.stones[6][1] = gb.stoneRotate(gb.stones[6][0]);
        gb.stones[6][2] = gb.stoneRotate(gb.stones[6][1]);
        gb.stones[6][3] = gb.stoneRotate(gb.stones[6][2]);
    }
};