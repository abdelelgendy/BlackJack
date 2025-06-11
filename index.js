let player = {
    name: "Per",
    chips: 200
}

let cards = []
let sum = 0
let hasBlackJack = false
let isAlive = false
let message = ""
let messageEl = document.getElementById("message-el")
let sumEl = document.getElementById("sum-el")
let cardsEl = document.getElementById("cards-el")
let playerEl = document.getElementById("player-el")

playerEl.textContent = player.name + ": $" + player.chips

function getRandomCard() {
    let randomNumber = Math.floor( Math.random()*13 ) + 1
    if (randomNumber > 10) {
        return 10
    } else if (randomNumber === 1) {
        return 11
    } else {
        return randomNumber
    }
}

function startGame() {
    isAlive = true
    let firstCard = getRandomCard()
    let secondCard = getRandomCard()
    cards = [firstCard, secondCard]
    sum = firstCard + secondCard
    renderGame()
}

function renderGame() {
  // recalc raw sum from the cards array:
  sum = cards.reduce((acc, c) => acc + c, 0)

  // adjust for Aces: if sum >21 and there are 11s, turn them into 1s (i.e. -10)
  for (let i = 0; i < cards.length; i++) {
    if (sum > 21 && cards[i] === 11) {
      cards[i] = 1      // flip this Ace from 11 to 1
      sum -= 10         // subtract the extra 10 points
    }
  }

  // now update the UI…
  cardsEl.textContent = "Cards: " + cards.join(" ")
  sumEl.textContent   = "Sum: " + sum

  if (sum < 21) {
    message = "Do you want to draw a new card?"
  } else if (sum === 21) {
    message = "You've got Blackjack!"
    hasBlackJack = true
  } else {
    message = "You're out of the game!"
    isAlive = false
  }
  messageEl.textContent = message
}


function newCard() {
    if (isAlive === true && hasBlackJack === false) {
        let card = getRandomCard()
        sum += card
        cards.push(card)
        renderGame()        
    }
}
