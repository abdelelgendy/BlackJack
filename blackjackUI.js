// blackjackUI.js: Rendering and UI helpers
export function cardImg(card){
  const map = {"♠":"spade","♥":"heart","♦":"diamond","♣":"club"};
  return `assets/${map[card.suit]}_${card.rank}.png`;
}
export function renderHand(cards, containerId){
  const cont = document.getElementById(containerId);
  cont.innerHTML = "";
  cards.forEach(c=>{
    const outer = document.createElement("div");
    outer.className = "card-outer";
    const inner = document.createElement("div");
    inner.className = "card-inner flipped";
    const front = document.createElement("img");
    front.className = "card-face card-front";
    front.src = cardImg(c);
    const back = document.createElement("img");
    back.className = "card-face card-back";
    back.src = (c.suit==="♠"||c.suit==="♣")? "assets/back_black.png":"assets/back_red.png";
    inner.appendChild(back); inner.appendChild(front);
    outer.appendChild(inner);
    cont.appendChild(outer);
  });
}
export function renderDealer(dealerHand, showAll, gameState, GameState){
  const cont = document.getElementById("dealer-cards");
  cont.innerHTML = "";
  dealerHand.forEach((c, idx)=>{
    const outer = document.createElement("div");
    outer.className = "card-outer";
    const inner = document.createElement("div");
    inner.className = "card-inner" + ((showAll||idx===0)? " flipped" : "");
    const front = document.createElement("img");
    front.className = "card-face card-front";
    front.src = cardImg(c);
    const back = document.createElement("img");
    back.className = "card-face card-back";
    back.src = (c.suit==="♠"||c.suit==="♣")? "assets/back_black.png":"assets/back_red.png";
    inner.appendChild(back); inner.appendChild(front);
    outer.appendChild(inner);
    cont.appendChild(outer);
  });
  const showTotal = showAll || gameState!==GameState.PLAYER;
  if (showTotal){
    let t = document.createElement("span");
    t.className = "dealer-total";
    t.textContent = ` (Total: ${dealerHand.length>0?dealerHand.reduce((a,c)=>a+c.val,0):0})`;
    cont.appendChild(t);
  }
}
