/* Engazy - app logic (plain JavaScript, no libraries). Data lives in localStorage. */

// ===== Translations (key|Arabic|English) =====
const D = `home|الرئيسية|Home
tasks|المهمات اليومية|Daily Tasks
subs|المواد الدراسية|Subjects
hw|المهمات الدراسية|Study Tasks
focus|مؤقت التركيز|Focus Timer
add|إضافة|Add
save|حفظ|Save
cancel|إلغاء|Cancel
title|العنوان|Title
note|ملاحظة|Note
lang|English|العربية
ts|مهمات اليوم|Today tasks
sp|تقدم الدروس|Lessons progress
hp|مهمات دراسية متبقية|Pending study tasks
fm|دقائق التركيز اليوم|Focus minutes today
wk|التركيز خلال آخر 7 أيام|Focus, last 7 days
up|أقرب المهمات الدراسية|Upcoming study tasks
nt|لا يوجد شيء بعد، اضغط إضافة للبدء|Nothing here yet. Tap Add to start.
nta|مهمة جديدة|New task
nsub|مادة جديدة|New subject
nles|درس جديد|New lesson
nhw|مهمة دراسية جديدة|New study task
name|اسم المادة|Subject name
due|تاريخ التسليم|Due date
subj|المادة|Subject
none|بدون مادة|No subject
lessons|الدروس|Lessons
back|رجوع|Back
conf|تحذير! سيتم الحذف نهائيًا. هل أنت متأكد؟|Warning! This will be deleted permanently. Are you sure?
start|ابدأ|Start
pause|إيقاف مؤقت|Pause
reset|إعادة|Reset
fo|تركيز|Focus
sb|استراحة قصيرة|Short break
lb|استراحة طويلة|Long break
done|انتهى الوقت، أحسنت!|Time is up. Well done!
min|د|min
tot|إجمالي التركيز|Total focus
edit|تعديل|Edit
del|حذف|Delete
ls|درس|lessons
notes|الملاحظات|Notes
nnote|ملاحظة جديدة|New note
dark|الوضع الليلي|Dark mode
light|الوضع النهاري|Light mode
qt|إضافة مهمة|Add task
qs|إضافة مادة|Add subject
qh|إضافة مهمة دراسية|Add study task
qn|إضافة ملاحظة|Add note
color|اللون|Color
nn|لا توجد ملاحظة بعد|No note yet
warn|احذر! سوف تفقد تقدمك. هل أنت متأكد؟|Careful! You will lose your progress. Are you sure?
sure|نعم، متأكد|Yes, I am sure
secname|اسم القسم|Section name
icon|الأيقونة|Icon
nsec|قسم جديد|New section
qz|إضافة قسم|Add section
secs|أقسامي|My sections
rep|التكرار|Repeat
once|مرة واحدة|Once
daily|يوميًا|Daily
sfocus|وقت التركيز على المادة|Focus time on this subject`;
const L = { ar: {}, en: {} };
D.split("\n").forEach((l) => {
  const [a, b, c] = l.split("|");
  L.ar[a] = b;
  L.en[a] = c;
});
// ===== State and small helpers =====
let S;
try {
  S = JSON.parse(localStorage.getItem("tm"));
} catch (e) {
}
S = Object.assign({ lang: "ar", tasks: [], subs: [], hw: [], notes: [], secs: [], sl: {}, log: {}, v: null, theme: null }, S || {});
const save = () => {
  try {
    localStorage.setItem("tm", JSON.stringify(S));
  } catch (e) {
  }
};
const $ = (s) => document.querySelector(s), t = (k) => L[S.lang][k] || k, uid = () => Math.random().toString(36).slice(2, 9), td = () => (/* @__PURE__ */ new Date()).toLocaleDateString("sv");
const I = (n, c) => `<i class="ic fa-solid fa-fw fa-${n}"${c ? ` style="color:${c}"` : ""}></i>`, E = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const pc = (s) => s.ls.length ? Math.round(s.ls.filter((l) => l.x).length / s.ls.length * 100) : 0;
const sub = () => S.subs.find((s) => s.id == S.v);
// ===== Subject colours, highlight palette and rich-text cleaning =====
const COL = ["#4a9fd0", "#1a8a5f", "#8b7fd6", "#e08a6b", "#e0a93b", "#d96b9a", "#2fb5b0", "#7a8fa3", "#9bbf3e", "#b5805a"];
const sc = (s) => COL[(s.c != null && s.c !== "" ? +s.c : S.subs.indexOf(s)) % 10];
const PAL = ["#fde68a", "#bff0d6", "#bfe3f8", "#fbcfe0", "#dcd3f7", "#fcd9bd"];
let SR = null;
const hx = (bg) => {
  if (!bg) return null;
  if (bg[0] == "#") return PAL.includes(bg) ? bg : PAL[0];
  const m = bg.match(/[\d.]+/g);
  if (!m || m.length < 3 || m.length > 3 && +m[3] == 0) return null;
  const h = "#" + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, "0")).join("");
  return PAL.includes(h) ? h : PAL[0];
};
function clean(h, ed) {
  const mk = (bg, i) => {
    const c = hx(bg);
    return !c ? i : ed ? `<span style="background-color:${c}">${i}</span>` : `<mark style="background:${c}">${i}</mark>`;
  };
  const w = (n) => {
    let o = "";
    n.childNodes.forEach((c) => {
      if (c.nodeType == 3) o += E(c.nodeValue);
      else if (c.nodeType == 1) {
        const g = c.tagName.toLowerCase(), i = w(c);
        let r = i;
        if (g == "br") r = "<br>";
        else if (g == "b" || g == "strong") r = "<b>" + i + "</b>";
        else if (g == "u") r = "<u>" + i + "</u>";
        else if (g == "s" || g == "strike" || g == "del") r = "<s>" + i + "</s>";
        else if (g == "mark") r = mk(c.style.backgroundColor || PAL[0], i);
        else if (g == "div" || g == "p") r = "<div>" + i + "</div>";
        else if (g == "span") {
          const s = c.style;
          r = mk(s.backgroundColor, r);
          if (s.fontWeight == "bold" || +s.fontWeight >= 600) r = "<b>" + r + "</b>";
          const d = s.textDecorationLine || s.textDecoration || "";
          if (/underline/.test(d)) r = "<u>" + r + "</u>";
          if (/line-through/.test(d)) r = "<s>" + r + "</s>";
        }
        o += r;
      }
    });
    return o;
  };
  return w(new DOMParser().parseFromString(h, "text/html").body);
}
const show = (h, ed) => h ? /<(b|u|s|mark|br|div)\b/.test(h) ? clean(h, ed) : E(h).replace(/\n/g, "<br>") : "";
const RICH = (f) => `<div class="rtw"><div class="tb">${[["bold", "bold"], ["underline", "underline"], ["strikeThrough", "strikethrough"]].map(([c, i]) => `<button type="button" class="ib" data-a="cmd" data-c="${c}" aria-label="${c}">${I(i)}</button>`).join("")}<button type="button" class="ib" data-a="cmd" data-c="hlt" aria-label="highlight"><span class="mkb">ab</span></button></div><div class="hlr" hidden>${PAL.map((c) => `<button type="button" class="hs" data-a="cmd" data-c="hl" data-v="${c}" style="background:${c}" aria-label="${c}"></button>`).join("")}<button type="button" class="ib" data-a="cmd" data-c="hl" data-v="" aria-label="clear">${I("droplet-slash")}</button></div><div class="ed" contenteditable="true" role="textbox" aria-multiline="true">${show(f.v, 1)}</div></div>`;
const SW = (f) => `<div><div class="mu" style="margin-bottom:6px">${t(f.l)}</div><div class="sw">${COL.map((c, i) => `<label class="swl"><input type="radio" name="${f.k}" value="${i}"${i == f.v ? " checked" : ""}><span style="background:${c}"></span></label>`).join("")}</div></div>`;
const ICONS = ["folder", "briefcase", "house", "dumbbell", "graduation-cap", "cart-shopping", "heart", "star", "money-bill-wave", "plane", "utensils", "code", "palette", "music", "book-open", "futbol", "paw", "wrench", "car", "pills", "spa", "calendar-days", "lightbulb", "earth-americas"];
const IC = (f) => `<div><div class="mu" style="margin-bottom:6px">${t(f.l)}</div><div class="sw">${ICONS.map((n) => `<label class="icl"><input type="radio" name="${f.k}" value="${n}"${n == f.v ? " checked" : ""}><span>${I(n)}</span></label>`).join("")}</div></div>`;
const hsec = () => S.secs.length ? `<h2 style="margin:22px 0 12px">${t("secs")}</h2><div class="grid">${S.secs.map((z) => {
  const c = COL[(+z.c || 0) % 10], n = z.ls.filter((x) => x.x).length, p = z.ls.length ? Math.round(n / z.ls.length * 100) : 0;
  return `<div class="card cd2" style="border-inline-start:6px solid ${c}" data-a="go" data-i="sec:${z.id}"><div class="ln" style="padding-top:0"><h3 style="margin:0;display:flex;align-items:center;gap:8px"><span style="color:${c};display:inline-flex">${I(z.i)}</span>${E(z.t)}</h3><b>${p}%</b></div><p class="mu">${n}/${z.ls.length}</p><div class="bar"><i style="width:${p}%;background:${c}"></i></div></div>`;
}).join("")}<div class="card cd2" style="border-style:dashed;display:grid;place-items:center;color:var(--mu);text-align:center" data-a="add" data-k="z"><div>${I("plus")}<div>${t("qz")}</div></div></div></div>` : "";
const roll = () => {
  [...S.tasks, ...S.secs.flatMap((z) => z.ls)].forEach((x) => {
    if (x.r && x.d != td()) {
      x.x = 0;
      x.d = td();
    }
  });
};
function nview(id) {
  const s = S.subs.find((x) => x.id == id);
  if (!s) return;
  $("#md").innerHTML = `<div class="mo"><div class="fm"><div class="ph"><h3 style="margin:0"><span class="dot" style="background:${sc(s)}"></span>${t("notes")} - ${E(s.t)}</h3><button class="ib" data-a="cx" aria-label="close">${I("xmark")}</button></div><div class="nb2">${s.n ? show(s.n) : `<span class="mu">${t("nn")}</span>`}</div><div class="ac"><button class="bt sc" data-a="sne" data-i="${id}">${I("pen")}${t(s.n ? "edit" : "qn")}</button>${s.n ? `<button class="bt sc" data-a="snd" data-i="${id}">${I("trash")}${t("del")}</button>` : ""}</div></div></div>`;
}
const cs = () => S.secs.find((s) => "sec:" + s.id == P);
const Ls = (k) => k == "t" ? S.tasks : k == "h" ? S.hw : k == "n" ? S.notes : k == "l" ? sub().ls : k == "g" ? cs().ls : k == "z" ? S.secs : S.subs;
const dt = (d) => d ? (/* @__PURE__ */ new Date(d + "T00:00")).toLocaleDateString(S.lang, { day: "numeric", month: "short" }) : "";
// ===== Navigation, form fields and list rows =====
const NV = [["home", "house"], ["tasks", "list-check"], ["subs", "book-open"], ["hw", "clipboard-list"], ["notes", "note-sticky"], ["focus", "stopwatch"]];
let P = "home";
const fl = (k, o = {}) => {
  const a = [{ k: "t", l: k == "s" ? "name" : k == "z" ? "secname" : "title", v: o.t, r: 1 }];
  if (k == "h") a.push({ k: "s", l: "subj", type: "sel", v: o.s || "", o: [["", t("none")], ...S.subs.map((s) => [s.id, s.t])] }, { k: "d", l: "due", type: "date", v: o.d });
  if (k == "t" || k == "g") a.push({ k: "r", l: "rep", type: "sel", v: o.r || "", o: [["", t("once")], ["1", t("daily")]] });
  if (k == "z") a.push({ k: "i", l: "icon", type: "icon", v: o.i || ICONS[0] });
  if (k == "s" || k == "z") a.push({ k: "c", l: "color", type: "color", v: o.c != null ? o.c : (k == "s" ? S.subs : S.secs).length % 10 });
  else a.push({ k: "n", l: "note", type: k == "n" ? "rich" : "area", v: o.n });
  return a;
};
const row = (k, it, ex = "") => `<div class="row${it.x ? " dn" : ""}"><button class="ck" data-a="tog" data-k="${k}" data-i="${it.id}">${I("check")}</button><div class="rt"><b>${E(it.t)}</b>${it.r ? `<span class="chip" style="margin-inline-start:8px">${t("daily")}</span>` : ""}${ex}${it.n ? `<p>${E(it.n)}</p>` : ""}</div><button class="ib" data-a="ed" data-k="${k}" data-i="${it.id}" aria-label="edit">${I("pen")}</button><button class="ib" data-a="rm" data-k="${k}" data-i="${it.id}" aria-label="delete">${I("trash")}</button></div>`;
const hd = (h, k) => `<div class="hd"><h1>${h}</h1><button class="bt" data-a="add" data-k="${k}">${I("plus")}${t("add")}</button></div>`;
const em = () => `<div class="empty">${t("nt")}</div>`;
const stat = (ic, v, l) => `<div class="card st">${I(ic)}<div><b>${v}</b><div class="mu">${l}</div></div></div>`;
// ===== Pages =====
const pages = {
  home() {
    const tt = S.tasks.filter((x) => x.d == td() || !x.x), ls = S.subs.flatMap((s) => s.ls), lp = ls.length ? Math.round(ls.filter((x) => x.x).length / ls.length * 100) : 0, hp = S.hw.filter((x) => !x.x), days = [...Array(7)].map((_, i) => {
      const d = new Date(Date.now() - (6 - i) * 864e5);
      return [d.toLocaleDateString("sv"), d.toLocaleDateString(S.lang, { weekday: "short" })];
    }), mx = Math.max(1, ...days.map((d) => S.log[d[0]] || 0)), tot = Object.values(S.log).reduce((a, b) => a + b, 0), up = [...hp].sort((a, b) => (a.d || "9").localeCompare(b.d || "9")).slice(0, 4);
    return `<div class="pg"><div class="hd"><h1>${t("home")}</h1></div><div class="grid">${stat("list-check", tt.filter((x) => x.x).length + "/" + tt.length, t("ts"))}${stat("book-open", lp + "%", t("sp"))}${stat("clipboard-list", hp.length, t("hp"))}${stat("stopwatch", (S.log[td()] || 0) + " " + t("min"), t("fm"))}</div>${hsec()}
 <div class="grid g2"><div class="card"><h3>${t("wk")}</h3><div class="chart">${days.map((d) => `<div><i style="height:${Math.round((S.log[d[0]] || 0) / mx * 100)}%"></i>${d[1]}</div>`).join("")}</div><p class="mu" style="margin-top:8px">${t("tot")}: ${tot} ${t("min")}</p></div>
 <div class="card"><h3>${t("up")}</h3>${up.length ? up.map((x) => `<div class="ln"><b>${E(x.t)}</b><span class="mu">${dt(x.d)}</span></div>`).join("") : em()}</div>
 <div class="card"><h3>${t("subs")}</h3>${S.subs.length ? S.subs.map((s) => `<div style="margin-bottom:10px"><div class="ln" style="padding:0 0 4px"><span><span class="dot" style="background:${sc(s)}"></span>${E(s.t)}</span><span class="mu">${pc(s)}%</span></div><div class="bar"><i style="width:${pc(s)}%;background:${sc(s)}"></i></div></div>`).join("") : em()}</div></div></div>`;
  },
  tasks() {
    const a = S.tasks.filter((x) => x.d == td() || !x.x).sort((a2, b) => a2.x - b.x);
    return `<div class="pg"><div class="hd"><h1>${t("tasks")}</h1><span class="bs"><button class="bt sc" data-a="add" data-k="z">${I("folder-plus")}${t("qz")}</button><button class="bt" data-a="add" data-k="t">${I("plus")}${t("add")}</button></span></div>${a.length ? a.map((x) => row("t", x)).join("") : em()}</div>`;
  },
  subs() {
    const s = S.v && sub();
    if (!s) return `<div class="pg">${hd(t("subs"), "s")}${S.subs.length ? `<div class="grid">${S.subs.map((s2) => `<div class="card cd2" style="border-inline-start:6px solid ${sc(s2)}" data-a="open" data-i="${s2.id}"><div class="ln" style="padding-top:0"><h3 style="margin:0">${E(s2.t)}</h3><button class="ib" data-a="sn" data-i="${s2.id}" aria-label="notes" style="${s2.n ? "color:" + sc(s2) : ""}">${I("note-sticky")}</button></div><p class="mu">${s2.ls.length} ${t("ls")}</p><div class="ln"><span class="mu">${t("sp")}</span><b>${pc(s2)}%</b></div><div class="bar"><i style="width:${pc(s2)}%;background:${sc(s2)}"></i></div></div>`).join("")}</div>` : em()}</div>`;
    return `<div class="pg"><button class="bt sc" data-a="back">${I(S.lang == "ar" ? "arrow-right" : "arrow-left")}${t("back")}</button>
 <div class="hd" style="margin-top:14px"><h1><span class="dot" style="background:${sc(s)}"></span>${E(s.t)}</h1><span><button class="ib" data-a="sn" data-i="${s.id}" aria-label="notes" style="${s.n ? "color:" + sc(s) : ""}">${I("note-sticky")}</button><button class="ib" data-a="ed" data-k="s" data-i="${s.id}" aria-label="edit">${I("pen")}</button><button class="ib" data-a="rm" data-k="s" data-i="${s.id}" aria-label="delete">${I("trash")}</button></span></div>
 <div class="card"><div class="ln" style="padding-top:0"><span>${t("sp")}</span><b>${pc(s)}%</b></div><p class="mu" style="margin-bottom:8px">${t("sfocus")}: ${S.sl[s.id] || 0} ${t("min")}</p><div class="bar"><i style="width:${pc(s)}%;background:${sc(s)}"></i></div></div>
 <div class="hd" style="margin-top:20px"><h2>${t("lessons")}</h2><button class="bt" data-a="add" data-k="l">${I("plus")}${t("add")}</button></div>${s.ls.length ? s.ls.map((x) => row("l", x)).join("") : em()}</div>`;
  },
  hw() {
    const a = [...S.hw].sort((a2, b) => a2.x - b.x || (a2.d || "9").localeCompare(b.d || "9"));
    return `<div class="pg">${hd(t("hw"), "h")}${a.length ? a.map((x) => {
      const s = S.subs.find((s2) => s2.id == x.s);
      return row("h", x, `<div>${s ? `<span class="chip"><span class="dot" style="background:${sc(s)}"></span>${E(s.t)}</span>` : ""}${x.d ? `<span class="chip">${I("calendar-days")} ${dt(x.d)}</span>` : ""}</div>`);
    }).join("") : em()}</div>`;
  },
  notes() {
    return `<div class="pg">${hd(t("notes"), "n")}${S.notes.length ? `<div class="grid notes">${[...S.notes].reverse().map((x) => `<div class="card cd2" data-a="ed" data-k="n" data-i="${x.id}"><div class="ln" style="padding-top:0"><b>${E(x.t)}</b><button class="ib" data-a="rm" data-k="n" data-i="${x.id}" aria-label="delete">${I("trash")}</button></div><div class="nb">${show(x.n)}</div><p class="mu" style="margin-top:8px">${dt(x.d)}</p></div>`).join("")}</div>` : em()}</div>`;
  },
  sec(z) {
    const c = COL[(+z.c || 0) % 10], n = z.ls.filter((x) => x.x).length, p = z.ls.length ? Math.round(n / z.ls.length * 100) : 0;
    return `<div class="pg"><div class="hd"><h1 style="display:flex;align-items:center;gap:8px"><span style="color:${c};display:inline-flex">${I(z.i)}</span>${E(z.t)}</h1><span class="bs"><button class="ib" data-a="ed" data-k="z" data-i="${z.id}" aria-label="edit">${I("pen")}</button><button class="ib" data-a="rm" data-k="z" data-i="${z.id}" aria-label="delete">${I("trash")}</button><button class="bt" data-a="add" data-k="g">${I("plus")}${t("add")}</button></span></div><div class="card" style="margin-bottom:14px"><div class="ln" style="padding-top:0"><span class="mu">${n}/${z.ls.length}</span><b>${p}%</b></div><div class="bar"><i style="width:${p}%;background:${c}"></i></div></div>${z.ls.length ? z.ls.map((x) => row("g", x)).join("") : em()}</div>`;
  },
  focus() {
    const m = T.m, nm = { f: "fo", s: "sb", l: "lb" };
    return `<div class="pg"><div class="hd"><h1>${t("focus")}</h1></div><div class="card tmr"><div class="tabs">${Object.keys(nm).map((k) => `<button class="bt${k == m ? "" : " sc"}" data-a="fm" data-i="${k}">${t(nm[k])}</button>`).join("")}</div>
 <label style="width:min(100%,280px)">${t("subj")}<select id="fsub"><option value="">${t("none")}</option>${S.subs.map((s) => `<option value="${s.id}"${s.id == T.sub ? " selected" : ""}>${E(s.t)}</option>`).join("")}</select></label><div class="rgw"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" class="tk"/><circle id="rg" cx="60" cy="60" r="54" class="pr" style="stroke-dashoffset:${339.3 * (1 - T.left / (T.len[m] * 60))}"/></svg><div id="tm">${fmt(T.left)}</div></div>
 <div class="tabs"><button class="bt sc" data-a="fadj" data-i="-5">${I("minus")}5</button><button class="bt" data-a="fs">${I(T.run ? "pause" : "play")}${t(T.run ? "pause" : "start")}</button><button class="bt sc" data-a="fadj" data-i="5">${I("plus")}5</button><button class="bt sc" data-a="fr">${I("rotate-right")}${t("reset")}</button></div>
 <p class="mu">${t("fm")}: ${S.log[td()] || 0} ${t("min")}</p></div></div>`;
  }
};
// ===== Rendering =====
function R() {
  roll();
  const h = document.documentElement;
  h.lang = S.lang;
  h.dir = S.lang == "ar" ? "rtl" : "ltr";
  $("#lt").textContent = t("lang");
  if (P.slice(0, 4) == "sec:" && !cs()) P = "home";
  $("#ttl").textContent = cs() ? cs().t : t(P);
  if (S.theme) h.dataset.theme = S.theme;
  const th = eff();
  document.querySelectorAll(".thi").forEach((i) => i.className = "ic thi fa-solid fa-fw fa-" + (th == "dark" ? "sun" : "moon"));
  document.querySelectorAll(".tht").forEach((i) => i.textContent = th == "dark" ? t("light") : t("dark"));
  $("#fmn").innerHTML = [["z", "folder-plus", "qz"], ["s", "book-open", "qs"], ["h", "clipboard-list", "qh"], ["t", "list-check", "qt"], ["n", "note-sticky", "qn"]].map(([k, ic, l]) => `<button class="fi" data-a="fadd" data-k="${k}">${t(l)}${I(ic)}</button>`).join("");
  const nb = (k, ic, l, c) => `<button class="nv${P == k ? " on" : ""}" data-a="go" data-i="${k}">${I(ic, c)}${l}</button>`;
  $("#nav").innerHTML = NV.map(([k, ic]) => nb(k, ic, t(k)) + (k == "tasks" ? S.secs.map((z) => nb("sec:" + z.id, z.i, E(z.t), COL[(+z.c || 0) % 10])).join("") : "")).join("") + `<button class="nv" data-a="add" data-k="z">${I("circle-plus")}${t("qz")}</button>`;
  $("#mn").innerHTML = cs() ? pages.sec(cs()) : (pages[P] || pages.home)();
}
// ===== Modal form =====
function form(h, fs, cb, bn) {
  const m = $("#md");
  m.innerHTML = `<div class="mo"><form class="fm${fs.some((f2) => f2.type == "rich") ? " wide" : ""}"><h3>${h}</h3>${fs.map((f2) => f2.type == "rich" ? RICH(f2) : f2.type == "color" ? SW(f2) : f2.type == "icon" ? IC(f2) : `<label>${t(f2.l)}${f2.type == "area" ? `<textarea name="${f2.k}">${E(f2.v)}</textarea>` : f2.type == "sel" ? `<select name="${f2.k}">${f2.o.map((o) => `<option value="${E(o[0])}"${o[0] == f2.v ? " selected" : ""}>${E(o[1])}</option>`).join("")}</select>` : `<input name="${f2.k}" type="${f2.type || "text"}" value="${E(f2.v)}"${f2.r ? " required" : ""}>`}</label>`).join("")}<div class="ac"><button type="button" class="bt sc" data-a="cx">${t("cancel")}</button><button class="bt">${t(bn || "save")}</button></div></form></div>`;
  const fm = m.querySelector("form");
  fm.onsubmit = (e) => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(fm));
    fs.forEach((f2) => {
      if (f2.type == "rich") {
        const d = clean(fm.querySelector(".ed").innerHTML);
        o[f2.k] = d.replace(/<[^>]*>|&nbsp;|\s/g, "") ? d : "";
      }
    });
    m.innerHTML = "";
    cb(o);
    save();
    R();
  };
  SR = null;
  const f = m.querySelector("input:not([type=radio]),textarea,.ed");
  if (f) f.focus();
}
const eff = () => S.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
const prog = () => T.run || T.left < T.len[T.m] * 60;
const guard = (fn) => {
  if (prog()) form(t("warn"), [], () => {
    T.run = 0;
    fn();
  }, "sure");
  else {
    fn();
    R();
  }
};
const toast = (s) => {
  const e = $("#ts");
  e.textContent = s;
  e.classList.add("on");
  setTimeout(() => e.classList.remove("on"), 3e3);
};
// ===== Click actions (data-a attributes) =====
const A = {
  go(d) {
    P = d.i;
    S.v = null;
    document.body.classList.remove("open");
    scrollTo(0, 0);
    R();
  },
  drawer() {
    document.body.classList.toggle("open");
  },
  lang() {
    S.lang = S.lang == "ar" ? "en" : "ar";
    save();
    R();
  },
  cx() {
    $("#md").innerHTML = "";
  },
  sn(d) {
    nview(d.i);
  },
  sne(d) {
    const s = S.subs.find((x) => x.id == d.i);
    form(t("notes") + " - " + E(s.t), [{ k: "n", l: "note", type: "rich", v: s.n }], (o) => {
      s.n = o.n;
      nview(s.id);
    });
  },
  snd(d) {
    const s = S.subs.find((x) => x.id == d.i);
    form(t("conf"), [], () => {
      s.n = "";
    }, "del");
  },
  cmd(d) {
    const c = d.c;
    if (c == "hlt") {
      const r = $(".hlr");
      r.hidden = !r.hidden;
      return;
    }
    const ed = $(".ed");
    ed.focus();
    if (SR) {
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(SR);
    }
    document.execCommand("styleWithCSS", false, c == "hl");
    if (c == "hl") {
      document.execCommand("hiliteColor", false, d.v || "transparent");
      $(".hlr").hidden = true;
    } else document.execCommand(c);
  },
  theme() {
    S.theme = eff() == "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = S.theme;
    save();
    R();
  },
  fab() {
    $("#fab").classList.toggle("on");
  },
  fadd(d) {
    $("#fab").classList.remove("on");
    if (d.k == "t" && cs()) return A.add({ k: "g" });
    P = { t: "tasks", s: "subs", h: "hw", n: "notes" }[d.k] || P;
    S.v = null;
    R();
    A.add(d);
  },
  open(d) {
    S.v = d.i;
    scrollTo(0, 0);
    R();
  },
  back() {
    S.v = null;
    R();
  },
  add(d) {
    const k = d.k;
    form(t({ t: "nta", s: "nsub", l: "nles", h: "nhw", n: "nnote", g: "nta", z: "nsec" }[k]), fl(k), (o) => {
      const it = Object.assign({ id: uid(), x: 0 }, o);
      if (k == "t" || k == "n" || k == "g") it.d = td();
      if (k == "s" || k == "z") it.ls = [];
      Ls(k).push(it);
      if (k == "z") {
        P = "sec:" + it.id;
        document.body.classList.remove("open");
      }
    });
  },
  ed(d) {
    const it = Ls(d.k).find((x) => x.id == d.i);
    form(t("edit"), fl(d.k, it), (o) => Object.assign(it, o));
  },
  tog(d) {
    const it = Ls(d.k).find((x) => x.id == d.i);
    it.x = it.x ? 0 : 1;
    save();
    R();
  },
  rm(d) {
    const l = Ls(d.k);
    form(t("conf"), [], () => {
      l.splice(l.findIndex((x) => x.id == d.i), 1);
      if (d.k == "s") S.v = null;
      if (d.k == "z" && P == "sec:" + d.i) P = "home";
    }, "del");
  },
  fm(d) {
    guard(() => {
      T.m = d.i;
      T.run = 0;
      T.left = T.len[T.m] * 60;
    });
  },
  fs() {
    if (T.run) T.run = 0;
    else {
      T.run = 1;
      T.end = Date.now() + T.left * 1e3;
    }
    R();
  },
  fr() {
    guard(() => {
      T.run = 0;
      T.left = T.len[T.m] * 60;
    });
  },
  fadj(d) {
    if (T.run) return;
    guard(() => {
      T.len[T.m] = Math.min(90, Math.max(5, T.len[T.m] + +d.i));
      T.left = T.len[T.m] * 60;
    });
  }
};
document.addEventListener("click", (e) => {
  if (!e.target.closest("#fab")) $("#fab").classList.remove("on");
  if (e.target.classList.contains("mo")) {
    A.cx();
    return;
  }
  const b = e.target.closest("[data-a]");
  if (b && A[b.dataset.a]) A[b.dataset.a](b.dataset);
});
// ===== Focus timer =====
const T = { m: "f", sub: "", len: { f: 25, s: 5, l: 15 }, left: 1500, run: 0, end: 0 };
const fmt = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
function beep() {
  try {
    const c = new AudioContext(), o = c.createOscillator();
    o.connect(c.destination);
    o.frequency.value = 660;
    o.start();
    setTimeout(() => {
      o.stop();
      c.close();
    }, 450);
  } catch (e) {
  }
  try {
    navigator.vibrate && navigator.vibrate(250);
  } catch (e) {
  }
}
setInterval(() => {
  if (!T.run) return;
  T.left = Math.max(0, Math.round((T.end - Date.now()) / 1e3));
  const a = $("#tm"), r = $("#rg");
  if (a && r) {
    a.textContent = fmt(T.left);
    r.style.strokeDashoffset = 339.3 * (1 - T.left / (T.len[T.m] * 60));
  }
  if (T.left <= 0) {
    T.run = 0;
    if (T.m == "f") {
      S.log[td()] = (S.log[td()] || 0) + T.len.f;
      if (T.sub && S.subs.some((s) => s.id == T.sub)) S.sl[T.sub] = (S.sl[T.sub] || 0) + T.len.f;
      save();
    }
    beep();
    toast(t("done"));
    T.left = T.len[T.m] * 60;
    R();
  }
}, 500);
document.addEventListener("mousedown", (e) => {
  if (e.target.closest(".tb")) e.preventDefault();
});
document.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".tb")) e.preventDefault();
});
document.addEventListener("selectionchange", () => {
  const s = getSelection();
  if (!s.rangeCount) return;
  const n = s.anchorNode, el = n && (n.nodeType == 1 ? n : n.parentElement);
  if (el && el.closest(".ed")) SR = s.getRangeAt(0).cloneRange();
});
document.addEventListener("paste", (e) => {
  if (e.target.closest && e.target.closest(".ed")) {
    e.preventDefault();
    document.execCommand("insertText", false, (e.clipboardData || window.clipboardData).getData("text/plain"));
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id == "fsub") T.sub = e.target.value;
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) R();
});
addEventListener("beforeunload", (e) => {
  if (prog()) {
    e.preventDefault();
    e.returnValue = "";
  }
});
R();
