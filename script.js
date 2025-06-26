// Chess piece Unicode symbols
const pieces = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
}

// Add promotion modal styles
const promotionStyles = `
.promotion-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.promotion-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.promotion-content h3 {
  margin-bottom: 15px;
  color: #333;
}

.promotion-pieces {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.promotion-piece {
  font-size: 3rem;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.promotion-piece:hover {
  border-color: #007bff;
  background: #e3f2fd;
  transform: scale(1.1);
}
`

// Add styles to document
if (!document.getElementById("promotion-styles")) {
  const styleSheet = document.createElement("style")
  styleSheet.id = "promotion-styles"
  styleSheet.textContent = promotionStyles
  document.head.appendChild(styleSheet)
}

// Initial board setup
let board = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
]

let currentPlayer = "white"
let selectedSquare = null
let possibleMoves = []
let gameHistory = []
let gameOver = false

// Initialize the game
function initGame() {
  createBoard()
  updateDisplay()
}

// Create promotion modal
function createPromotionModal() {
  const modal = document.createElement("div")
  modal.id = "promotion-modal"
  modal.className = "promotion-modal"
  modal.innerHTML = `
    <div class="promotion-content">
      <h3>Choose promotion piece:</h3>
      <div class="promotion-pieces">
        <div class="promotion-piece" data-piece="Q">♕</div>
        <div class="promotion-piece" data-piece="R">♖</div>
        <div class="promotion-piece" data-piece="B">♗</div>
        <div class="promotion-piece" data-piece="N">♘</div>
      </div>
    </div>
  `
  document.body.appendChild(modal)
}

// Create the chessboard HTML
function createBoard() {
  const chessboard = document.getElementById("chessboard")
  chessboard.innerHTML = ""

  for (let row = 0; row < 8; row++) {
    const boardRow = document.createElement("div")
    boardRow.className = "board-row"

    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div")
      square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`
      square.dataset.row = row
      square.dataset.col = col
      square.addEventListener("click", handleSquareClick)

      // Add touch support for mobile
      square.addEventListener("touchstart", handleSquareClick)

      boardRow.appendChild(square)
    }
    chessboard.appendChild(boardRow)
  }
}

// Update the visual display
function updateDisplay() {
  const squares = document.querySelectorAll(".square")
  squares.forEach((square) => {
    const row = Number.parseInt(square.dataset.row)
    const col = Number.parseInt(square.dataset.col)
    const piece = board[row][col]

    square.innerHTML = piece ? `<span class="piece">${pieces[piece]}</span>` : ""
    square.classList.remove("selected", "possible-move", "capture-move")
  })

  // Update player indicators
  document.getElementById("white-player").classList.toggle("active", currentPlayer === "white")
  document.getElementById("black-player").classList.toggle("active", currentPlayer === "black")
}

// Handle square clicks (simplified)
function handleSquareClick(event) {
  event.preventDefault()
  if (gameOver || currentPlayer === "black") return

  const square = event.currentTarget
  const row = Number.parseInt(square.dataset.row)
  const col = Number.parseInt(square.dataset.col)

  if (selectedSquare) {
    // Try to make a move
    if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
      makeMove(selectedSquare.row, selectedSquare.col, row, col)
      selectedSquare = null
      clearHighlights()
    } else {
      // Select new piece or deselect
      selectSquare(row, col)
    }
  } else {
    selectSquare(row, col)
  }
}

// Select a square
function selectSquare(row, col) {
  const piece = board[row][col]

  if (piece && isPlayerPiece(piece, currentPlayer)) {
    selectedSquare = { row, col }
    highlightSquare(row, col)
    showPossibleMoves(row, col)
  } else {
    selectedSquare = null
    clearHighlights()
  }
}

// Highlight selected square
function highlightSquare(row, col) {
  clearHighlights()
  const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
  if (square) {
    square.classList.add("selected")
  }
}

// Show possible moves
function showPossibleMoves(row, col) {
  possibleMoves = getPossibleMoves(row, col)
  possibleMoves.forEach((move) => {
    const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`)
    if (square) {
      if (board[move.row][move.col]) {
        square.classList.add("capture-move")
      } else {
        square.classList.add("possible-move")
      }
    }
  })
}

// Clear all highlights
function clearHighlights() {
  document.querySelectorAll(".square").forEach((square) => {
    square.classList.remove("selected", "possible-move", "capture-move")
  })
}

// Check if piece belongs to player
function isPlayerPiece(piece, player) {
  if (player === "white") {
    return piece === piece.toUpperCase()
  } else {
    return piece === piece.toLowerCase()
  }
}

// Get all possible moves for a piece
function getPossibleMoves(row, col) {
  const piece = board[row][col]
  if (!piece) return []

  const moves = []
  const pieceType = piece.toLowerCase()

  switch (pieceType) {
    case "p":
      moves.push(...getPawnMoves(row, col, piece))
      break
    case "r":
      moves.push(...getRookMoves(row, col, piece))
      break
    case "n":
      moves.push(...getKnightMoves(row, col, piece))
      break
    case "b":
      moves.push(...getBishopMoves(row, col, piece))
      break
    case "q":
      moves.push(...getQueenMoves(row, col, piece))
      break
    case "k":
      moves.push(...getKingMoves(row, col, piece))
      break
  }

  return moves.filter((move) => !wouldBeInCheck(row, col, move.row, move.col, piece))
}

// Pawn moves
function getPawnMoves(row, col, piece) {
  const moves = []
  const isWhite = piece === piece.toUpperCase()
  const direction = isWhite ? -1 : 1
  const startRow = isWhite ? 6 : 1

  // Forward move
  if (isValidPosition(row + direction, col) && !board[row + direction][col]) {
    moves.push({ row: row + direction, col })

    // Double move from start
    if (row === startRow && !board[row + 2 * direction][col]) {
      moves.push({ row: row + 2 * direction, col })
    }
  }
  // Captures
  ;[-1, 1].forEach((colOffset) => {
    const newRow = row + direction
    const newCol = col + colOffset
    if (
      isValidPosition(newRow, newCol) &&
      board[newRow][newCol] &&
      !isPlayerPiece(board[newRow][newCol], isWhite ? "white" : "black")
    ) {
      moves.push({ row: newRow, col: newCol })
    }
  })

  return moves
}

// Rook moves
function getRookMoves(row, col, piece) {
  const moves = []
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ]

  directions.forEach(([dRow, dCol]) => {
    for (let i = 1; i < 8; i++) {
      const newRow = row + dRow * i
      const newCol = col + dCol * i

      if (!isValidPosition(newRow, newCol)) break

      if (!board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol })
      } else {
        if (!isPlayerPiece(board[newRow][newCol], piece === piece.toUpperCase() ? "white" : "black")) {
          moves.push({ row: newRow, col: newCol })
        }
        break
      }
    }
  })

  return moves
}

// Knight moves
function getKnightMoves(row, col, piece) {
  const moves = []
  const knightMoves = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ]

  knightMoves.forEach(([dRow, dCol]) => {
    const newRow = row + dRow
    const newCol = col + dCol

    if (
      isValidPosition(newRow, newCol) &&
      (!board[newRow][newCol] ||
        !isPlayerPiece(board[newRow][newCol], piece === piece.toUpperCase() ? "white" : "black"))
    ) {
      moves.push({ row: newRow, col: newCol })
    }
  })

  return moves
}

// Bishop moves
function getBishopMoves(row, col, piece) {
  const moves = []
  const directions = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]

  directions.forEach(([dRow, dCol]) => {
    for (let i = 1; i < 8; i++) {
      const newRow = row + dRow * i
      const newCol = col + dCol * i

      if (!isValidPosition(newRow, newCol)) break

      if (!board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol })
      } else {
        if (!isPlayerPiece(board[newRow][newCol], piece === piece.toUpperCase() ? "white" : "black")) {
          moves.push({ row: newRow, col: newCol })
        }
        break
      }
    }
  })

  return moves
}

// Queen moves
function getQueenMoves(row, col, piece) {
  return [...getRookMoves(row, col, piece), ...getBishopMoves(row, col, piece)]
}

// King moves
function getKingMoves(row, col, piece) {
  const moves = []
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ]

  directions.forEach(([dRow, dCol]) => {
    const newRow = row + dRow
    const newCol = col + dCol

    if (
      isValidPosition(newRow, newCol) &&
      (!board[newRow][newCol] ||
        !isPlayerPiece(board[newRow][newCol], piece === piece.toUpperCase() ? "white" : "black"))
    ) {
      moves.push({ row: newRow, col: newCol })
    }
  })

  return moves
}

// Check if position is valid
function isValidPosition(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}

// Check if move is valid
function isValidMove(fromRow, fromCol, toRow, toCol) {
  const possibleMoves = getPossibleMoves(fromRow, fromCol)
  return possibleMoves.some((move) => move.row === toRow && move.col === toCol)
}

// Convert move to chess notation
function moveToNotation(fromRow, fromCol, toRow, toCol, piece, captured, isCheck, isCheckmate) {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"]
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"]

  const pieceSymbols = {
    K: "K",
    Q: "Q",
    R: "R",
    B: "B",
    N: "N",
    P: "",
    k: "K",
    q: "Q",
    r: "R",
    b: "B",
    n: "N",
    p: "",
  }

  let notation = ""
  const pieceType = piece.toLowerCase()

  // Add piece symbol (empty for pawns)
  notation += pieceSymbols[piece] || ""

  // For pawn captures, add the file letter
  if (captured && pieceType === "p") {
    notation += files[fromCol]
  }

  // Add capture symbol
  if (captured) {
    notation += "x"
  }

  // Add destination square
  notation += files[toCol] + ranks[toRow]

  // Add check/checkmate symbols
  if (isCheckmate) {
    notation += "#"
  } else if (isCheck) {
    notation += "+"
  }

  return notation
}

// Make a move (fixed promotion logic)
function makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
  const piece = board[fromRow][fromCol]
  const capturedPiece = board[toRow][toCol]

  // Check if this is a pawn promotion
  const isPawnPromotion =
    piece.toLowerCase() === "p" && ((piece === "P" && toRow === 0) || (piece === "p" && toRow === 7))

  if (isPawnPromotion && !promotionPiece) {
    // Show promotion modal for human player
    if (currentPlayer === "white") {
      showPromotionModal(fromRow, fromCol, toRow, toCol)
      return // Don't continue with the move until promotion is selected
    } else {
      // Auto-promote to queen for bot
      promotionPiece = "q"
    }
  }

  // Save the current board state before making the move
  const boardCopy = board.map((row) => [...row])

  // Make the move
  const finalPiece = promotionPiece || piece
  board[toRow][toCol] = finalPiece
  board[fromRow][fromCol] = null

  // Check for check/checkmate after the move
  const nextPlayer = currentPlayer === "white" ? "black" : "white"
  const isCheck = isKingInCheck(nextPlayer)
  const isCheckmate = isCheck && !hasAnyValidMoves(nextPlayer)

  // Generate notation
  let notation = moveToNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece, isCheck, isCheckmate)

  // Add promotion notation
  if (isPawnPromotion) {
    const promotionSymbol = promotionPiece.toUpperCase()
    notation = notation.replace(/[+#]?$/, `=${promotionSymbol}$&`)
  }

  // Save move to history with notation
  gameHistory.push({
    from: { row: fromRow, col: fromCol },
    to: { row: toRow, col: toCol },
    piece: piece,
    captured: capturedPiece,
    notation: notation,
    board: boardCopy,
    player: currentPlayer,
    promotion: promotionPiece,
  })

  // Switch players
  currentPlayer = nextPlayer
  updateDisplay()
  updateMovesLog()

  // Check for game end conditions
  checkGameEnd()

  // Trigger bot move if it's now bot's turn and game is not over
  if (currentPlayer === "black" && !gameOver) {
    setTimeout(() => {
      makeBotMove()
    }, 500)
  }
}

// Show promotion modal (fixed)
function showPromotionModal(fromRow, fromCol, toRow, toCol) {
  let modal = document.getElementById("promotion-modal")
  if (!modal) {
    createPromotionModal()
    modal = document.getElementById("promotion-modal")
  }

  // Update pieces for current player
  const isWhite = currentPlayer === "white"
  const promotionPieces = modal.querySelectorAll(".promotion-piece")
  promotionPieces.forEach((piece) => {
    const pieceType = piece.dataset.piece
    piece.textContent = pieces[isWhite ? pieceType : pieceType.toLowerCase()]
    piece.onclick = () => {
      const selectedPiece = isWhite ? pieceType : pieceType.toLowerCase()
      hidePromotionModal()
      // Complete the move with the selected promotion piece
      makeMove(fromRow, fromCol, toRow, toCol, selectedPiece)
    }
  })

  modal.style.display = "flex"
}

// Hide promotion modal
function hidePromotionModal() {
  const modal = document.getElementById("promotion-modal")
  if (modal) {
    modal.style.display = "none"
  }
}

// Update moves log display
function updateMovesLog() {
  const movesLog = document.getElementById("moves-log")

  if (gameHistory.length === 0) {
    movesLog.innerHTML = '<div class="no-moves">No moves yet</div>'
    return
  }

  let logHTML = ""

  // Process moves in pairs (white and black)
  for (let i = 0; i < gameHistory.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1
    const whiteMove = gameHistory[i]
    const blackMove = gameHistory[i + 1]

    logHTML += `
            <div class="move-entry">
                <span class="move-number">${moveNumber}.</span>
                <span class="move-white">${whiteMove ? whiteMove.notation : ""}</span>
                <span class="move-black">${blackMove ? blackMove.notation : ""}</span>
            </div>
        `
  }

  movesLog.innerHTML = logHTML

  // Auto-scroll to bottom
  movesLog.scrollTop = movesLog.scrollHeight
}

// Check if king would be in check after move
function wouldBeInCheck(fromRow, fromCol, toRow, toCol, piece) {
  // Make temporary move
  const originalPiece = board[toRow][toCol]
  board[toRow][toCol] = piece
  board[fromRow][fromCol] = null

  const isWhite = piece === piece.toUpperCase()
  const inCheck = isKingInCheck(isWhite ? "white" : "black")

  // Restore board
  board[fromRow][fromCol] = piece
  board[toRow][toCol] = originalPiece

  return inCheck
}

// Check if king is in check
function isKingInCheck(player) {
  const kingPos = findKing(player)
  if (!kingPos) return false

  // Check if any opponent piece can attack the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && !isPlayerPiece(piece, player)) {
        const moves = getPossibleMovesWithoutCheckValidation(row, col)
        if (moves.some((move) => move.row === kingPos.row && move.col === kingPos.col)) {
          return true
        }
      }
    }
  }
  return false
}

// Get possible moves without check validation (to avoid infinite recursion)
function getPossibleMovesWithoutCheckValidation(row, col) {
  const piece = board[row][col]
  if (!piece) return []

  const moves = []
  const pieceType = piece.toLowerCase()

  switch (pieceType) {
    case "p":
      moves.push(...getPawnMoves(row, col, piece))
      break
    case "r":
      moves.push(...getRookMoves(row, col, piece))
      break
    case "n":
      moves.push(...getKnightMoves(row, col, piece))
      break
    case "b":
      moves.push(...getBishopMoves(row, col, piece))
      break
    case "q":
      moves.push(...getQueenMoves(row, col, piece))
      break
    case "k":
      moves.push(...getKingMoves(row, col, piece))
      break
  }

  return moves
}

// Find king position
function findKing(player) {
  const kingSymbol = player === "white" ? "K" : "k"
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === kingSymbol) {
        return { row, col }
      }
    }
  }
  return null
}

// Check for game end conditions
function checkGameEnd() {
  const inCheck = isKingInCheck(currentPlayer)
  const hasValidMoves = hasAnyValidMoves(currentPlayer)

  if (inCheck && !hasValidMoves) {
    gameOver = true
    const winner = currentPlayer === "white" ? "Black" : "White"
    updateStatusMessage(`Checkmate! ${winner} wins!`, "checkmate")
  } else if (!hasValidMoves) {
    gameOver = true
    updateStatusMessage("Stalemate! It's a draw!", "checkmate")
  } else if (inCheck) {
    updateStatusMessage(`${currentPlayer === "white" ? "White" : "Black"} is in check!`, "check")
  } else {
    updateStatusMessage(currentPlayer === "white" ? "Your turn - Move a white piece" : "Bot is thinking...")
  }
}

// Check if player has any valid moves
function hasAnyValidMoves(player) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && isPlayerPiece(piece, player)) {
        const moves = getPossibleMoves(row, col)
        if (moves.length > 0) {
          return true
        }
      }
    }
  }
  return false
}

// Update status message
function updateStatusMessage(message, className = "") {
  const statusElement = document.getElementById("status-message")
  statusElement.textContent = message
  statusElement.className = `status-message ${className}`
}

// Evaluate move quality for bot (updated with promotion consideration)
function evaluateMove(fromRow, fromCol, toRow, toCol, piece) {
  let score = 0

  // Piece values
  const pieceValues = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  }

  // Capture bonus
  const capturedPiece = board[toRow][toCol]
  if (capturedPiece) {
    score += pieceValues[capturedPiece.toLowerCase()] * 10
  }

  // Pawn promotion bonus
  const isPawnPromotion =
    piece.toLowerCase() === "p" && ((piece === "P" && toRow === 0) || (piece === "p" && toRow === 7))
  if (isPawnPromotion) {
    score += 50 // High bonus for promotion
  }

  // Center control bonus
  if (toRow >= 3 && toRow <= 4 && toCol >= 3 && toCol <= 4) {
    score += 2
  }

  // Development bonus (move pieces from back rank)
  if (fromRow === 0 && toRow > 0) {
    score += 1
  }

  // Pawn advancement bonus
  if (piece.toLowerCase() === "p") {
    const advancement = piece === "P" ? 6 - toRow : toRow - 1
    score += advancement * 0.1
  }

  // Random factor for variety
  score += Math.random() * 0.5

  return score
}

// Bot AI - Make a move
function makeBotMove() {
  if (gameOver || currentPlayer !== "black") return

  const allMoves = []

  // Get all possible moves for black pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && isPlayerPiece(piece, "black")) {
        const moves = getPossibleMoves(row, col)
        moves.forEach((move) => {
          allMoves.push({
            from: { row, col },
            to: move,
            piece: piece,
            score: evaluateMove(row, col, move.row, move.col, piece),
          })
        })
      }
    }
  }

  if (allMoves.length === 0) return

  // Sort moves by score (best first)
  allMoves.sort((a, b) => b.score - a.score)

  // Add some randomness to make bot less predictable
  const topMoves = allMoves.slice(0, Math.min(3, allMoves.length))
  const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)]

  makeMove(selectedMove.from.row, selectedMove.from.col, selectedMove.to.row, selectedMove.to.col)
}

// New game
function newGame() {
  board = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ]
  currentPlayer = "white"
  selectedSquare = null
  possibleMoves = []
  gameHistory = []
  gameOver = false
  updateDisplay()
  updateMovesLog()
  updateStatusMessage("Your turn - Move a white piece")
}

// Undo last move
function undoMove() {
  if (gameHistory.length === 0 || gameOver) return

  // Undo bot move
  if (gameHistory.length > 0) {
    const lastMove = gameHistory.pop()
    board = lastMove.board.map((row) => [...row])
    currentPlayer = "black"
  }

  // Undo player move
  if (gameHistory.length > 0) {
    const lastMove = gameHistory.pop()
    board = lastMove.board.map((row) => [...row])
    currentPlayer = "white"
  }

  selectedSquare = null
  clearHighlights()
  updateDisplay()
  updateMovesLog()
  updateStatusMessage("Your turn - Move a white piece")
}

// Theme management
function initTheme() {
  const themeToggle = document.getElementById("theme-toggle")
  const body = document.body

  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem("chess-theme") || "light"

  if (savedTheme === "dark") {
    body.classList.add("dark-mode")
    themeToggle.textContent = "☀️"
    themeToggle.title = "Toggle Light Mode"
  } else {
    themeToggle.textContent = "🌙"
    themeToggle.title = "Toggle Dark Mode"
  }

  // Theme toggle event listener
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode")

    if (body.classList.contains("dark-mode")) {
      themeToggle.textContent = "☀️"
      themeToggle.title = "Toggle Light Mode"
      localStorage.setItem("chess-theme", "dark")
    } else {
      themeToggle.textContent = "🌙"
      themeToggle.title = "Toggle Dark Mode"
      localStorage.setItem("chess-theme", "light")
    }
  })
}

// Initialize the game when page loads
document.addEventListener("DOMContentLoaded", () => {
  initTheme()
  initGame()
})
