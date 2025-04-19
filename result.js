const params = new URLSearchParams(location.search);
const area = params.get("area");
const gender = params.get("gender");
const p1 = params.get("priority1");
const p2 = params.get("priority2");
const p3 = params.get("priority3");

function calcScore(staff) {
  let score = 0;
  let matches = [];
  if (staff.skills.includes(p1)) { score += 3; matches.push(p1); }
  if (staff.skills.includes(p2)) { score += 2; matches.push(p2); }
  if (staff.skills.includes(p3)) { score += 1; matches.push(p3); }
  return { ...staff, score, matches };
}

function skillLabel(code) {
  return {
    korini: "コリに的確",
    chikara: "力強い",
    rakuni: "動作が楽に",
    sukkiri: "スッキリ",
    teinei: "丁寧な接客",
    waza: "ワザが凄い"
  }[code] || code;
}

const container = document.getElementById("results");
const popup = document.getElementById("popup");
const popupContent = document.getElementById("popup-content");

function showPopup(staff) {
  popupContent.innerHTML = `
    <h2>${staff.name} さん</h2>
    <p>店舗：${staff.area} / 性別：${staff.gender === "male" ? "男性" : "女性"}</p>
    <p>マッチスコア：${staff.score}点</p>
    <p>一致した条件：${staff.matches.map(m => skillLabel(m)).join("・")}</p>
    <button onclick='location.href="${staff.url}"'>詳しく見る</button>
    <button onclick='closePopup()'>閉じる</button>
  `;
  popup.style.display = "block";
}

function closePopup() {
  popup.style.display = "none";
}

fetch("staff.json")
  .then(response => response.json())
  .then(data => {
    const matched = data
      .filter(s => !gender || s.gender === gender)
      .filter(s => !area || s.area === area)
      .map(calcScore)
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);

    if (matched.length === 0) {
      container.innerHTML = "<p>条件に合うスタッフが見つかりませんでした。</p>";
    } else {
      matched.forEach(s => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${s.image}" alt="${s.name}">
          <div class="info">
            <h2>${s.name}</h2>
            <p>店舗：${s.area} / 性別：${s.gender === "male" ? "男性" : "女性"}</p>
            <p class="score">マッチスコア：${s.score}点</p>
            <p>一致した条件：${s.matches.map(m => skillLabel(m)).join("・")}</p>
          </div>
        `;
        card.addEventListener("click", () => showPopup(s));
        container.appendChild(card);
      });
    }
  })
  .catch(error => {
    container.innerHTML = `<p>スタッフ情報の読み込みに失敗しました。</p>`;
    console.error(error);
  });
