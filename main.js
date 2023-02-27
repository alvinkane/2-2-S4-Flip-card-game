// 設定遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardMatchFailed: "CardMatchFailed",
  CardMatched: "CardMatched",
  GameFinished: "GameFinished",
};

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];

// 採用MVC架構
const view = {
  //卡片內容
  getCardContent(index) {
    // 用index區分現在的數字
    const number = this.transFormNumber((index % 13) + 1);
    // 用index區分現在的花色
    const symbol = Symbols[Math.floor(index / 13)];
    return `<p>${number}</p>
        <img
          src="${symbol}"
          alt="symbol"
        />
        <p>${number}</p>`;
  },
  // 卡片樣式
  getCardElement(index) {
    return `<div data-index=${index} class="card back"></div>`;
  },
  // 產生卡片
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },
  // 將1,11,12,13改成A,J,Q,K
  transFormNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },
  // 翻牌
  // 在card前面加入...，可以輸入陣列值[1, 2, 3, 4, 5....]
  flipCards(...cards) {
    //對陣列中每一個進行相同動作
    cards.map((card) => {
      // 如果是背面，就翻到正面
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        // 取得的資料為字串，需要轉成數字
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }

      // 如果是正面，就翻到背面
      card.classList.add("back");
      // 兩種寫法應該都可以
      // card.innerHTML = "";
      card.innerHTML = null;
    });
  },
  // 配對成功
  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("pair");
    });
  },
  // 分數
  renderScore(score) {
    // 呼叫score，並代入需要加入的文字
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  // 嘗試次數
  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },
  // 動畫
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      // 運行完後，將該class移除
      card.addEventListener(
        "animationend",
        (event) => {
          card.classList.remove("wrong");
        }, // addEventListener執行一次後就刪除
        { once: true }
      );
    });
  },
  // 結束畫面
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
    console.log(header.before);
  },
};

// 外掛小程式
const utility = {
  // Fisher-Yates Shuffle洗牌
  getRandomNumberArray(count) {
    // 產生一個照著順序的陣列
    // Array.from(Array(52).keys())產生0~51的陣列
    const number = Array.from(Array(count).keys());
    // 將該陣列打亂，透過將最後一張跟前面某一張更換的方法
    // 只需要做到第二張就好了，因為第一張不用跟第一張煥
    for (let index = number.length - 1; index > 0; index--) {
      // index需加一再random
      let randomIndex = Math.floor(Math.random() * (index + 1));
      // 如果習慣是不要有分號的話，[]前面需要加分號
      // 解構賦值方法
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

// 資料
const model = {
  // 翻到的牌
  revealedCards: [],
  // 配對
  isRevealedCardMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },
  // 分數
  score: 0,
  // 嘗試次數
  triedTimes: 0,
};

// 控制器
const controller = {
  // 初始狀態
  currentState: GAME_STATE.FirstCardAwaits,
  // 呼叫執行程式，由controller去串接其他變數
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
    // view.renderScore(model.score);
    // view.renderTriedTimes(model.triedTimes);
  },
  // 根據遊戲狀態做不同動作
  disPatchCardAction(card) {
    // 確認按的牌是還沒翻過的
    if (!card.classList.contains("back")) return;
    // 根據狀態做事情
    switch (this.currentState) {
      //翻第一章牌
      case GAME_STATE.FirstCardAwaits: {
        //翻牌
        view.flipCards(card);
        //紀錄資料
        model.revealedCards.push(card);
        // 將狀態改至SecondCardAwaits
        this.currentState = GAME_STATE.SecondCardAwaits;
        // return 跳出函式，break 跳出switch
        return;
      }
      case GAME_STATE.SecondCardAwaits: {
        //次數+1，先+再代入值
        view.renderTriedTimes(++model.triedTimes);
        //翻牌
        view.flipCards(card);
        //紀錄資料
        model.revealedCards.push(card);
        if (model.isRevealedCardMatched()) {
          //配對成功
          // 加分
          view.renderScore((model.score += 10));
          // 狀態變更
          this.currentState = GAME_STATE.CardMatched;
          // 將配對成功的牌加入不同樣式
          // revealedCards為陣列，需在前面加入...，用於展開成各別值
          view.pairCards(...model.revealedCards);
          // 暫存器清空
          model.revealedCards = [];
          // 分數到達260分即代表完成
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished(); // 加在這裡
            return;
          }
          //將狀態變為初始狀態
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          //配對失敗
          //失敗動畫
          view.appendWrongAnimation(...model.revealedCards);
          //狀態變更
          this.currentState = GAME_STATE.CardMatchFailed;
          //經過1S後，將牌翻到背面
          //1000代表1s
          //setTimeout第一個參數為函數，所以不能在後面加括號，如果是括號代表代入是該函數的結果
          setTimeout(this.resetCards, 1000);
        }

        return;
      }
    }
  },
  resetCards() {
    view.flipCards(...model.revealedCards);
    // 暫存器清空
    model.revealedCards = [];
    //將狀態變為初始狀態
    //setTimeout呼叫resetCards時，this並不代表controller，會變成window，所以需要更改
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};

// 執行程式
controller.generateCards();

// 翻牌
// 對每一張卡片設定監聽器，所以用querySelectAll取得Node  List(Array-like)，再用forEach添加
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.disPatchCardAction(card);
  });
});
