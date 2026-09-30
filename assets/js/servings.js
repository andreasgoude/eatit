// Portionsskalning: räknar om mängden i början av varje ingrediens när antalet portioner ändras.
// Bara den inledande mängden skalas ("2 dl mjölk", "ca 13 dl mjöl", "1-2 ägg", "½ burk"),
// så förpackningsstorlekar som "(400 g)" längre in i texten lämnas orörda.

const FRACTIONS = { "½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75, "⅛": 0.125 };
const NUM = String.raw`(?:\d+\s*[½⅓⅔¼¾⅛]|\d+\/\d+|\d+(?:[.,]\d+)?|[½⅓⅔¼¾⅛])`;
const QTY = new RegExp(String.raw`^((?:ca\.?\s+)?)(${NUM})(?:\s*[-–]\s*(${NUM}))?`, "i");

function parse(str) {
  str = str.replace(/\s+/g, "");
  const frac = str.match(/^(\d*)([½⅓⅔¼¾⅛])$/);
  if (frac) return (Number(frac[1]) || 0) + FRACTIONS[frac[2]];
  const slash = str.match(/^(\d+)\/(\d+)$/);
  if (slash) return Number(slash[1]) / Number(slash[2]);
  return Number(str.replace(",", "."));
}

function format(n) {
  if (n >= 10) return String(Math.round(n));
  const q = Math.round(n * 4) / 4; // närmaste kvart
  if (q === 0) return (Math.round(n * 100) / 100).toString().replace(".", ",");
  const whole = Math.floor(q);
  const rest = { 0.25: "¼", 0.5: "½", 0.75: "¾" }[q - whole] || "";
  return whole === 0 ? rest : `${whole}${rest}`;
}

function setup(control) {
  const base = Number(control.dataset.servings);
  const input = control.querySelector("input");
  const items = [...control.parentElement.querySelectorAll(".ingredients li")].map((li) => ({
    li,
    html: li.innerHTML,
    match: li.innerHTML.match(QTY),
  }));

  function update() {
    const servings = Math.min(99, Math.max(1, Number(input.value) || base));
    const factor = servings / base;
    for (const { li, html, match } of items) {
      if (!match) continue;
      const [all, prefix, a, b] = match;
      const scaled = format(parse(a) * factor) + (b ? "–" + format(parse(b) * factor) : "");
      // Behåll mellanslag om originalet hade det ("2 dl"), annars inte ("3dl").
      li.innerHTML = factor === 1 ? html : prefix + scaled + html.slice(all.length);
    }
  }

  control.addEventListener("click", (e) => {
    const step = Number(e.target.closest("[data-step]")?.dataset.step);
    if (!step) return;
    input.value = Math.min(99, Math.max(1, (Number(input.value) || base) + step));
    update();
  });
  input.addEventListener("input", update);
}

document.querySelectorAll(".servings-control").forEach(setup);
