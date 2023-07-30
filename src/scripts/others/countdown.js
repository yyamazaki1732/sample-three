// var date = new Date();
// console.log(date.toLocaleString());
// console.log(date.toLocaleString("en-US", { timeZone: "America/New_York" }));
// console.log(date.toLocaleString("en-GB", { timeZone: "Europe/London" }));

const setAnimation = () => {
  const NOW = new Date(); //今の日時
  const TARGET = new Date("2023", "08", "01", "00", "00"); //ターゲット日時を取得
  let remainTime = TARGET - NOW; //差分を取る（ミリ秒で返ってくる）

  //指定の日時を過ぎていたら処理をしない
  if (remainTime < 0) return false;

  // 残り時間の単位とそれに対応するDOMのIDを配列で持つ
  const timeUnits = [
    { unit: 24 * 60 * 60 * 1000, id: "countdown-day" }, // 日
    { unit: 60 * 60 * 1000, id: "countdown-hour" }, // 時
    { unit: 60 * 1000, id: "countdown-min" }, // 分
    { unit: 1000, id: "countdown-sec" }, // 秒
  ];

  // 各単位ごとに処理を行う
  timeUnits.forEach((timeUnit) => {
    const time = Math.floor(remainTime / timeUnit.unit);
    remainTime %= timeUnit.unit; // 余りを次の計算に使用

    let displayTime = time.toString();
    if (timeUnit.unit !== 24 * 60 * 60 * 1000) {
      // '日'以外の単位は2桁に揃える
      displayTime = displayTime.padStart(2, "0");
    }

    document.getElementById(timeUnit.id).textContent = displayTime;
  });

  //指定の日時になればカウントを止める
  if (TARGET - NOW < 0) return;

  // 1秒後に再度setAnimationを呼び出す
  setTimeout(setAnimation, 1000);
};

const AUDIO = document.getElementById("audio");
const BUTTON_AUDIO = document.getElementById("click-handle");
let flag = true;

window.addEventListener("DOMContentLoaded", () => {
  setAnimation();
});

const clickHandle = () => {
  const playMusic = () => {
    AUDIO.play();
    flag = false;
  };
  const pauseMusic = () => {
    AUDIO.pause();
    flag = true;
  };
  flag == true ? playMusic() : pauseMusic();
};

BUTTON_AUDIO.addEventListener("click", clickHandle);
