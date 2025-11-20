class PuzzleGame {
    constructor() {
        this.size = 4; // 4x4 棋盘
        this.board = [];
        this.emptyIndex = 15; // 空格的初始位置（最后一个位置）
        this.moves = 0;
        this.time = 0;
        this.timer = null;
        this.isGameStarted = false;
        
        // DOM 元素
        this.boardElement = document.getElementById('board');
        this.restartButton = document.getElementById('restart-btn');
        this.hintButton = document.getElementById('hint-btn');
        this.movesElement = document.getElementById('moves');
        this.timeElement = document.getElementById('time');
        this.messageElement = document.getElementById('message');
        
        // 初始化游戏
        this.init();
    }
    
    init() {
        // 生成初始棋盘
        this.generateBoard();
        // 打乱棋盘
        this.shuffleBoard();
        // 渲染棋盘
        this.renderBoard();
        // 添加事件监听
        this.addEventListeners();
    }
    
    generateBoard() {
        // 创建已解决状态的棋盘
        this.board = [];
        for (let i = 0; i < this.size * this.size - 1; i++) {
            this.board.push(i + 1);
        }
        this.board.push(null); // 空格
        this.emptyIndex = this.size * this.size - 1;
    }
    
    shuffleBoard() {
        // 使用 Fisher-Yates 洗牌算法打乱棋盘，但确保是可解的
        let attempts = 0;
        const maxAttempts = 1000;
        
        do {
            // Fisher-Yates 洗牌
            for (let i = this.board.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                if (this.board[i] !== null && this.board[j] !== null) {
                    [this.board[i], this.board[j]] = [this.board[j], this.board[i]];
                }
            }
            attempts++;
        } while (!this.isSolvable() && attempts < maxAttempts);
        
        // 更新空格位置
        this.emptyIndex = this.board.indexOf(null);
    }
    
    isSolvable() {
        // 计算逆序数来判断棋盘是否可解
        let inversions = 0;
        const flatBoard = this.board.filter(tile => tile !== null);
        
        for (let i = 0; i < flatBoard.length - 1; i++) {
            for (let j = i + 1; j < flatBoard.length; j++) {
                if (flatBoard[i] > flatBoard[j]) {
                    inversions++;
                }
            }
        }
        
        // 对于偶数大小的棋盘，需要考虑空格的位置
        if (this.size % 2 === 0) {
            const emptyRowFromBottom = this.size - Math.floor(this.emptyIndex / this.size);
            if (emptyRowFromBottom % 2 === 0) {
                return inversions % 2 === 1;
            } else {
                return inversions % 2 === 0;
            }
        }
        
        // 对于奇数大小的棋盘，逆序数必须是偶数
        return inversions % 2 === 0;
    }
    
    renderBoard() {
        this.boardElement.innerHTML = '';
        
        this.board.forEach((tile, index) => {
            const tileElement = document.createElement('div');
            tileElement.classList.add('tile');
            
            if (tile === null) {
                tileElement.classList.add('empty');
            } else {
                tileElement.textContent = tile;
                tileElement.dataset.index = index;
            }
            
            this.boardElement.appendChild(tileElement);
        });
    }
    
    addEventListeners() {
        // 点击方块移动
        this.boardElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('tile') && !e.target.classList.contains('empty')) {
                const index = parseInt(e.target.dataset.index);
                this.moveTile(index);
            }
        });
        
        // 重新开始按钮
        this.restartButton.addEventListener('click', () => {
            this.resetGame();
        });
        
        // 提示按钮
        this.hintButton.addEventListener('click', () => {
            this.showHint();
        });
        
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }
    
    moveTile(index) {
        // 检查是否可以移动
        if (this.canMove(index)) {
            // 开始计时（如果游戏刚开始）
            if (!this.isGameStarted) {
                this.startTimer();
                this.isGameStarted = true;
            }
            
            // 交换位置
            [this.board[index], this.board[this.emptyIndex]] = [this.board[this.emptyIndex], this.board[index]];
            this.emptyIndex = index;
            
            // 更新移动次数
            this.moves++;
            this.movesElement.textContent = `步数: ${this.moves}`;
            
            // 重新渲染
            this.renderBoard();
            
            // 检查游戏是否完成
            if (this.isGameComplete()) {
                this.completeGame();
            }
        }
    }
    
    canMove(index) {
        const emptyRow = Math.floor(this.emptyIndex / this.size);
        const emptyCol = this.emptyIndex % this.size;
        const tileRow = Math.floor(index / this.size);
        const tileCol = index % this.size;
        
        // 检查是否相邻（上下左右）
        return (
            (Math.abs(emptyRow - tileRow) === 1 && emptyCol === tileCol) ||
            (Math.abs(emptyCol - tileCol) === 1 && emptyRow === tileRow)
        );
    }
    
    handleKeyPress(e) {
        // 获取空格位置
        const emptyRow = Math.floor(this.emptyIndex / this.size);
        const emptyCol = this.emptyIndex % this.size;
        let targetIndex = -1;
        
        switch (e.key) {
            case 'ArrowUp':
                // 上箭头：空格下方的方块向上移动
                if (emptyRow < this.size - 1) {
                    targetIndex = (emptyRow + 1) * this.size + emptyCol;
                }
                break;
            case 'ArrowDown':
                // 下箭头：空格上方的方块向下移动
                if (emptyRow > 0) {
                    targetIndex = (emptyRow - 1) * this.size + emptyCol;
                }
                break;
            case 'ArrowLeft':
                // 左箭头：空格右侧的方块向左移动
                if (emptyCol < this.size - 1) {
                    targetIndex = emptyRow * this.size + (emptyCol + 1);
                }
                break;
            case 'ArrowRight':
                // 右箭头：空格左侧的方块向右移动
                if (emptyCol > 0) {
                    targetIndex = emptyRow * this.size + (emptyCol - 1);
                }
                break;
        }
        
        if (targetIndex !== -1 && this.board[targetIndex] !== null) {
            this.moveTile(targetIndex);
        }
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.time++;
            this.timeElement.textContent = `时间: ${this.time}s`;
        }, 1000);
    }
    
    stopTimer() {
        clearInterval(this.timer);
        this.timer = null;
    }
    
    isGameComplete() {
        // 检查是否所有方块都在正确的位置
        for (let i = 0; i < this.board.length - 1; i++) {
            if (this.board[i] !== i + 1) {
                return false;
            }
        }
        return this.board[this.board.length - 1] === null;
    }
    
    completeGame() {
        this.stopTimer();
        this.messageElement.textContent = `恭喜你完成了游戏！用时 ${this.time} 秒，移动了 ${this.moves} 步。`;
        this.isGameStarted = false;
    }
    
    resetGame() {
        this.stopTimer();
        this.moves = 0;
        this.time = 0;
        this.isGameStarted = false;
        this.movesElement.textContent = '步数: 0';
        this.timeElement.textContent = '时间: 0s';
        this.messageElement.textContent = '';
        
        this.generateBoard();
        this.shuffleBoard();
        this.renderBoard();
    }
    
    showHint() {
        // 简单提示：高亮显示可以移动的方块
        const tiles = document.querySelectorAll('.tile:not(.empty)');
        
        tiles.forEach(tile => {
            const index = parseInt(tile.dataset.index);
            if (this.canMove(index)) {
                tile.style.backgroundColor = '#e74c3c';
                setTimeout(() => {
                    tile.style.backgroundColor = '';
                }, 1000);
            }
        });
    }
}

// 当页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new PuzzleGame();
});