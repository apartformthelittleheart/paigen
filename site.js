/* Shared by every page: nav, footer, news data, helpers, AI assistant */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const WMO=c=>c===0?["☀️","Clear"]:c<4?["⛅","Partly cloudy"]:c<50?["🌫","Fog"]:c<70?["🌧","Rain"]:c<80?["❄️","Snow"]:c<100?["⛈","Storm"]:["🌡","—"];

/* ===== NEWS (edit this list!) ===== */
const NEWS=[
 {cat:"International",type:"Article",title:"How Gen Z protests went global",txt:"From Nepal to Madagascar, Morocco and Peru, young people rallied over corruption, jobs and basic services. Many used the One Piece pirate flag as a shared symbol.",src:"Khaleej Times",url:"https://www.khaleejtimes.com/lifestyle/gen-z-rebellion-explained-how-youth-protests-went-global-in-2025"},
 {cat:"International",type:"Article",title:"Nepal: Gen Z protests and the PM's resignation",txt:"Anti-corruption protests in September 2025 led to Prime Minister KP Sharma Oli resigning. The country was set to vote in March 2026.",src:"Thomson Reuters Foundation",url:"https://www.context.news/money-power-people/a-year-of-gen-z-protests-can-they-bring-real-change-in-2026"},
 {cat:"International",type:"Article",title:"Bangladesh 2024: where the term 'Gen Z protest' took off",txt:"Student-led protests over a job quota system became a wider uprising, widely seen as the model that inspired later youth movements.",src:"Wikipedia",url:"https://en.wikipedia.org/wiki/Gen_Z_protests"},
 {cat:"International",type:"Article",title:"Kenya: Gen Z vs the Finance Bill",txt:"Protests that began in 2024 against heavy taxes on everyday goods were organised both online and on the streets.",src:"Khaleej Times",url:"https://www.khaleejtimes.com/lifestyle/gen-z-rebellion-explained-how-youth-protests-went-global-in-2025"},
 {cat:"International",type:"Article",title:"Why Gen Z is rising",txt:"Researchers link the wave to weak economies, high youth unemployment and anger at corruption, and note that young protesters often face harsh repression.",src:"Journal of Democracy",url:"https://ash.harvard.edu/wp-content/uploads/2026/01/project_muse_977940.pdf"},
 {cat:"International",type:"Article",title:"Are Gen Z's calls for change being heard?",txt:"How the 2025 'Year of Protest' toppled governments in Nepal and Madagascar, and what happened afterwards.",src:"Chatham House",url:"https://www.chathamhouse.org/publications/the-world-today/2026-06/are-gen-zs-calls-change-being-heard"},
 {cat:"India",type:"Article",title:"Add your India story here",txt:"Write about Indian youth issues such as exam paper leaks, jobs and student protests. Replace this card with a verified story and link the original report.",src:"Edit NEWS in site.js",url:"#"},
 {cat:"Videos",type:"Video",title:"Add a news video",txt:"Paste a link to a protest report video here. Use the url field and the 'Videos' category.",src:"Edit NEWS in site.js",url:"#"}
];
const newsCard=n=>`<div class="card tilt"><span class="tag ${n.cat==="India"?"in":n.type==="Video"?"vid":""}">${n.cat}</span><h3>${n.title}</h3><p>${n.txt}</p><a class="src" href="${n.url}" target="_blank" rel="noopener">${n.src} →</a></div>`;
function tilt(el){el.onpointermove=e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`rotateX(${-y*9}deg) rotateY(${x*9}deg) translateZ(8px)`};el.onpointerleave=()=>el.style.transform=""}
const tiltAll=()=>$$(".tilt").forEach(tilt);

/* ===== nav + footer + AI box ===== */
const PAGES=[["index.html","Home"],["news.html","News"],["videos.html","Videos"],["reels.html","Reels"],["chat.html","Chat & Calls"],["weather.html","Weather & Map"]];
const cur=location.pathname.split("/").pop()||"index.html";
document.body.insertAdjacentHTML("afterbegin",`<nav><div class="wrap"><a class="logo" href="index.html">pai<i>gen</i></a><div class="l">${PAGES.map(([h,t])=>`<a href="${h}" class="${h===cur?"on":""}">${t}</a>`).join("")}</div></div></nav>`);
document.body.insertAdjacentHTML("beforeend",`<footer>© ${new Date().getFullYear()} Paigen · Made for Gen Z</footer>
<button id="aiBtn" aria-label="Open Paigen AI">✨</button>
<div id="aiBox" role="dialog" aria-label="Paigen AI"><div class="hd"><div><b>Paigen AI</b><small id="aiMode"></small></div><button id="aiX" aria-label="Close">×</button></div>
<div id="aiLog"></div><div class="sugg" id="aiSugg"></div>
<form id="aiForm"><input type="text" id="aiIn" placeholder="Ask me anything…" autocomplete="off"><button class="btn" type="submit">Send</button></form></div>`);

/* ===== AI assistant ===== */
// Paste your server URL here (see ai-worker-free.js). Empty = demo mode.
const AI_ENDPOINT="";
(function(){
  const box=$("#aiBox"),lg=$("#aiLog"),inp=$("#aiIn"),hist=[];
  $("#aiMode").textContent=AI_ENDPOINT?"AI connected":"Demo mode";
  const show=(t,u)=>{const d=document.createElement("div");d.className="ab"+(u?" u":"");d.innerHTML=esc(t).replace(/\n/g,"<br>");lg.appendChild(d);lg.scrollTop=lg.scrollHeight;return d};
  $("#aiBtn").onclick=()=>{box.classList.toggle("open");if(box.classList.contains("open")){inp.focus();if(!lg.children.length)show("Hi! I'm Paigen AI ✨ Ask me about Gen Z news, weather, videos, calls, or anything else.")}};
  $("#aiX").onclick=()=>box.classList.remove("open");
  $("#aiSugg").innerHTML=["Latest Gen Z news","Weather in Mumbai","Which news channels?","How do I make a call?"].map(t=>`<button>${t}</button>`).join("");
  $$("#aiSugg button").forEach(b=>b.onclick=()=>ask(b.textContent));
  async function cityWeather(q){
    const m=q.match(/(?:in|at|of|for|ka|ki|ke)\s+([a-zA-Z .]+?)\s*[?.!]*$/i),city=(m?m[1]:"New Delhi").trim();
    try{const g=await(await fetch("https://geocoding-api.open-meteo.com/v1/search?name="+encodeURIComponent(city)+"&count=1")).json();
      if(!g.results)return`I couldn't find "${city}". Try another city name.`;
      const p=g.results[0],j=await(await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`)).json(),c=j.current;
      return`${p.name}: ${Math.round(c.temperature_2m)}°C, ${WMO(c.weather_code)[1]}, humidity ${c.relative_humidity_2m}%, wind ${c.wind_speed_10m} km/h.`}
    catch(e){return"Couldn't load the weather right now. Check your internet."}}
  async function demo(q){
    const t=q.toLowerCase();
    if(/weather|mausam|temperature|barish|rain/.test(t))return cityWeather(q);
    if(/channel|bbc|jazeera|video|watch/.test(t))return"Open the Videos page: it has BBC News (English and Hindi), Al Jazeera, DW, France 24, Sky News, NDTV, Aaj Tak and more.";
    if(/news|khabar|protest|gen ?z|update/.test(t))return"Here are some stories from the News page:\n"+NEWS.filter(n=>n.url!=="#").slice(0,3).map(n=>"• "+n.title+" ("+n.src+")").join("\n");
    if(/call|voice/.test(t))return"Go to Chat & Calls, type a room name and tap Video call or Voice call. Then copy the link and send it to your friend.";
    if(/reel/.test(t))return"On the Reels page tap “Add reel”, pick a video, then scroll like on your phone.";
    if(/photo|document|file|location|chat/.test(t))return"On Chat & Calls you can send messages, photos, videos, documents and your location pin.";
    if(/^(hi|hello|hey|namaste|hii+)\b/.test(t))return"Hello! How can I help you today?";
    return"I'm in demo mode, so I only know about this site. To answer anything, the site owner needs to connect an AI service.";}
  async function real(){const r=await fetch(AI_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:hist.slice(-12)})});if(!r.ok)throw new Error(r.status);return(await r.json()).reply}
  async function ask(q){q=q.trim();if(!q)return;inp.value="";show(q,true);hist.push({role:"user",content:q});const w=show("…");
    try{const a=AI_ENDPOINT?await real():await demo(q);w.innerHTML=esc(a).replace(/\n/g,"<br>");hist.push({role:"assistant",content:a})}
    catch(e){w.textContent="Sorry, I couldn't reach the AI server. Please try again."}lg.scrollTop=lg.scrollHeight}
  $("#aiForm").onsubmit=e=>{e.preventDefault();ask(inp.value)};
})();
