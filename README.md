# BlackJack Game

A fully-featured BlackJack game built with vanilla JavaScript, featuring proper game rules, animations, and advanced gameplay options.

## Features

### Core BlackJack Rules
- **Standard 52-card deck** with proper shuffling
- **Dealer stands on all 17s** (configurable)
- **BlackJack pays 3:2** (21 with exactly 2 cards)
- **Push on ties** (player and dealer have same value)
- **Bust detection** (hand value over 21)
- **Ace handling** (can be 1 or 11, automatically optimized)

### Player Actions
- **Hit** - Draw another card
- **Stand** - Keep current hand
- **Double Down** - Double bet and receive exactly one more card
- **Split** - Split matching pairs into two separate hands
- **Surrender** - Give up hand and lose half the bet
- **Insurance** - Side bet when dealer shows Ace

### Betting System
- **Multiple chip denominations** ($1, $5, $25, $100)
- **Chip management** with refill option
- **Bet validation** ensures player has enough chips
- **Proper payouts** for different outcomes

### Advanced Features
- **Multiple hand support** when splitting
- **Insurance betting** when dealer shows Ace
- **Surrender option** on initial two cards
- **Hand value calculation** with soft/hard Ace logic
- **Game statistics** tracking wins, losses, pushes, and blackjacks

### Visual Features
- **Card animations** with dealing effects
- **3D card flip animations** 
- **Responsive design** works on desktop and mobile
- **Professional casino styling** with green felt background
- **Active hand indicators** when playing multiple hands

## Game Rules

### Basic Gameplay
1. Place your bet using the chip buttons
2. Click "START GAME" to begin the round
3. You'll receive 2 cards face-up, dealer gets 1 up and 1 down
4. Choose your action: Hit, Stand, Double Down, Split, or Surrender
5. Dealer reveals their hole card and plays according to house rules
6. Hands are compared and payouts distributed

### Winning Conditions
- **BlackJack** (21 with 2 cards): Pays 3:2
- **Regular Win** (beat dealer without busting): Pays 1:1
- **Push** (tie with dealer): Original bet returned
- **Insurance Win** (dealer has blackjack): Pays 2:1

### Hand Values
- **Number cards**: Face value (2-10)
- **Face cards**: 10 points each (Jack, Queen, King)
- **Aces**: 11 or 1 (automatically optimized)

### Special Actions

#### Double Down
- Available only on first 2 cards
- Doubles your bet
- Receive exactly one more card
- Must have enough chips to cover the additional bet

#### Split
- Available when first 2 cards have same value
- Creates two separate hands
- Must bet same amount on second hand
- Each hand played independently

#### Insurance
- Available when dealer shows Ace
- Costs half of original bet
- Pays 2:1 if dealer has blackjack
- Lost if dealer doesn't have blackjack

#### Surrender
- Available only on first 2 cards
- Forfeit hand and lose half the bet
- Useful when hand is very likely to lose

## Technology Stack

- **Vanilla JavaScript** with ES6+ features
- **CSS3** for animations and styling
- **HTML5** for semantic structure
- **Modular design** with separate game logic and UI files

## File Structure

```
├── index.html              # Main HTML file with game UI
├── index.js                # Main game logic and state management
├── blackjackCore.js        # Core game functions and rules
├── blackjackUI.js          # UI rendering helpers
├── assets/                 # Card images
└── README.md               # This file
```

## Running the Game

### Simple HTTP Server
```bash
# Using Python (recommended)
python3 -m http.server 8080

# Or using Node.js
npx http-server -p 8080

# Or using PHP
php -S localhost:8080
```

Then open http://localhost:8080 in your browser.

### Direct File Access
You can also open `index.html` directly in your browser, though some browsers may restrict loading local images.

## Game Statistics

The game tracks comprehensive statistics:
- **Wins**: Hands won against the dealer
- **Losses**: Hands lost to the dealer
- **Pushes**: Tied hands with the dealer
- **Blackjacks**: Natural 21s achieved

## Responsive Design

The game is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## Browser Compatibility

Compatible with all modern browsers:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Future Enhancements

Possible additions for future versions:
- **Multiple deck support** (4-8 decks)
- **Deck penetration settings**
- **Side bets** (21+3, Perfect Pairs)
- **Basic strategy hints**
- **Card counting practice mode**
- **Tournament mode**
- **Sound effects**
- **Multiplayer support**

## Performance

The game is optimized for performance:
- Minimal DOM manipulation
- Efficient card rendering
- Smooth animations at 60fps
- Fast game state updates
- Optimized for mobile devices
- Fast card shuffling algorithms
- Optimized bundle size

This BlackJack game provides an authentic casino experience with all the features and rules you'd expect from a professional implementation.
