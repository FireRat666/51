// This script was taken from https://vidya.sdq.st/say-names.js and https://best-v-player.glitch.me/say-names.js
var scriptsource = "https://51.firer.at/scripts/announcer.js";
var theusersname = "";
var timevariable = 0;
var theusersid = "";
var announcefirstrun = true;
var announce = "true";
var announceevents = "true";
var announce420 = "false";
var readytospeak = true;

var announceraudiovolume = 0.08;
var announcerAudioObject = new BS.GameObject("MyAudioSource"); 
var announcerAudioSource = null;

// // Main Speak Function, Thank you Elin and everyone
async function speak(text) {
  if (readytospeak) {
    readytospeak = false

    announcerAudioSource.volume = announceraudiovolume;
    console.log("ANNOUNCER: saying:", text);
    // let theaudio = new Audio(`https://ttsthing.netlify.app/?text=${text}`); theaudio.autoplay = true; theaudio.volume = 0.1; theaudio.play()
    // announcerAudioSource.PlayOneShotFromUrl(`https://ttsthing.netlify.app/.netlify/functions/generateTTS?text=${text}&#.wav`);
    announcerAudioSource.PlayOneShotFromUrl('https://speak.firer.at/?text=' + text + "#.mp3");

    setTimeout(() => { readytospeak = true; }, 5000);
  } else {
    console.log("ANNOUNCER: Not Ready to Speak:", text);
  };

};

async function combineAudioFiles(urls, volume = 0.2) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Load and decode each audio file
  const buffers = await Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await audioContext.decodeAudioData(arrayBuffer);
    })
  );

  // Calculate total length and create a new buffer
  const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
  const outputBuffer = audioContext.createBuffer(
    buffers[0].numberOfChannels,
    totalLength,
    audioContext.sampleRate
  );

  // Copy each buffer into the output buffer
  let offset = 0;
  for (const buffer of buffers) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      outputBuffer.copyToChannel(buffer.getChannelData(i), i, offset);
    }
    offset += buffer.length;
  }

  // Create a source and gain node for volume control
  const source = audioContext.createBufferSource();
  source.buffer = outputBuffer;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = volume; // Set the volume

  // Connect source -> gain -> destination
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Play the audio
  source.start();
}

// Main Speak Function, Thank you Elin and everyone
// async function speak(text) {
//   if (readytospeak) {
//     readytospeak = false
//     console.log("ANNOUNCER: saying:", text);
//     let audio = new Audio('https://speak.firer.at/?text=' + text);
//     audio.autoplay = true;
//     audio.play();
//     audio.volume = 0.08;
//     setTimeout(() => { readytospeak = true; }, 4000);
//   } else {
//     console.log("ANNOUNCER: Not Ready to Speak:", text);
//   };

// };

// This function uses the current time as an input for the psuedo random number generator
function GETPRNGF(modulo) {
  var now2 = new Date().getTime();
  var hours = Math.floor((now2 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((now2 % (1000 * 60 * 60)) / (1000 * 60));
  var second = Math.floor((now2 % (1000 * 60)) / 10000);
  timevariable = hours + "" + minutes + "" + second;
  let psudorandomvar = PRNGF(timevariable, modulo);
  return psudorandomvar
}
  // Function which takes a seed and an upper value then returns a psuedo random number
  function PRNGF(seed, modulo) {
    str = `${(2**31-1&Math.imul(48271,seed))/2**31}`
    .split('')
    .slice(-10)
    .join('') % (modulo)
    return str
}

// here lies a loop function
function loop(interval, callback) {
  let readyToTrigger;
  const _loop = () => {
    let nowInMs = new Date().getTime();
    let timeSinceLast = nowInMs / 1000 - Math.floor( nowInMs / (interval * 1000)) * interval;
    if(timeSinceLast > interval - 1 && !readyToTrigger) {
        readyToTrigger = true;
    };
    if(timeSinceLast < 1 && readyToTrigger) {
        readyToTrigger = false;
        callback();
    };
  };
  setInterval(_loop, 800);
  _loop();
};

// This function is for the events announcements
function loadevents() {
  if(window.isBanter && announceevents === "true") {
    console.log("ANNOUNCER: Event Announcer Enabled");
    let lastEventsId = 0;
    loop(20, async () => {
      let event = await (await fetch("https://api.sidequestvr.com/v2/events?limit=1")).json();
      if(event.length) {
        const difference = Math.abs(new Date(event[0].start_time) - new Date());
        if(difference < 60 * 1000 && lastEventsId !== event[0].events_v2_id) {
          lastEventsId = event[0].events_v2_id;
          await speak("Oh Shit " + event[0].name + ", is starting now! Drop your shit and hussle");
        };
      };
    })
  };
};


// This function is for the 420 events announcements
function load420() {
  if(window.isBanter && announce420 === "true") {
    let keepAlive;
    function connect() {
      const ws = new WebSocket('wss://calicocut.glitch.me');
      ws.onmessage = (msg) => {
        speak(msg.data);
      };
      ws.onopen = (msg) => {
        console.log("ANNOUNCER: connected to 420 announcer.");
      };
      ws.onerror = (msg) => {
        console.log("ANNOUNCER: error", msg);
      };
      ws.onclose = (e) => {
        console.log('ANNOUNCER: Disconnected 420!');
        clearInterval(keepAlive);
        setTimeout(()=>connect(), 3000);
      };
      keepAlive = setInterval(()=>{ws.send("keep-alive")}, 120000)
    }
    connect();
  };
};


var thescripts = document.getElementsByTagName("script");
var announcerscene = BS.BanterScene.GetInstance();
var timenow = 9999999999999; // Set Now to a Really Big Number, so if user-joined is called before unity-loaded, it wont spam user joined messages for users that were already in the space
// Welcome message for user entering the space
function announcerloadtest() {
  

  announcerscene.On("unity-loaded", () => {
    announcefirstrun = false;
    timenow = Date.now(); // Sets Now to after unity scene load is done
  });
  announcerscene.On("user-joined", e => {
    if (announce) {

    }
    let AmeliaLink = `https://audiofiles.firer.at/mp3/11-Amelia/`;
    theusersid = e.detail.uid;
    let tempusername = false;
    if (e.detail.name === "Gravxton") {tempusername = "Graviton What The Hell"};
    if (theusersid === "4c67af8ae899ea5b8dd6da25566ff3f3") {tempusername = "Boob Works"}; // BobWorks 
    if (theusersid === "f14cd0a7c028d9e8f1756d76ff450c73") {tempusername = "The Slayer"}; // Divine
    if (theusersid === "c81d8333f83208a6124370282b992a45") {tempusername = "echo phase"}; // Echo Mental
    if (theusersid === "f87c37aad5d82ac9faea3a2cae55934d") {tempusername = "Discordia Kitty"}; // Discord Kitty
    // if (theusersid === "d20dc72cdbb562479089c6c5263815a8") {tempusername = "A Banter Ghost"}; // Ghost Droid
    if (theusersid === "2fa5290b268076d98aa078e1cc2ce3e2") {tempusername = "Kah Gey knee ko"}; // Kageneko
    if (theusersid === "2ea1396b49294e396113f4f1ca5d9a9e") {tempusername = "Chicky Chicky Gem Gem"}; // Gemchick
    if (theusersid === "a3de45107d96ec8ec9857f9111eca6e0") {tempusername = "Fay Fay"}; // Fae
    if (theusersid === "462b9ba6d7bff70e963f76c7b3ef978a") {tempusername = "tokra ah ah ah"}; // Tokra
    if (theusersid === "e2ea44863eb547aecc1f9bc94f7b5c30") {tempusername = "Older Chris, Not Young Chris"}; // Chris
    if (theusersid === "e9412ffa5ca2970f3b9de7b87258e712") {tempusername = "Aziz z z"}; // Aziz
    if (theusersid === "ada674dac0d26556244bf61c2b97184e") {tempusername = "Yunji verse"}; // Yunjiverse
    if (theusersid === "220a4b971b3edb376cbc956f5539b8a5") {tempusername = "Big John"}; // Big John
    if (theusersid === "94acdf9d5887ce8fb4a5c9c605f906a5") {tempusername = "Fear Psycho"}; // "Psycho"
    if (theusersid === "3682ea489f043657d09811dd042bfa83") {tempusername = "ProcksCyde"}; // ProxCyde
    if (theusersid === "52ac3e6e222a72ade6cbde376c27a6c3") {tempusername = "I.T.Trey"}; // I.T.Trey
    if (theusersid === "19f104073c0da250138d67be9634d842") {tempusername = "Jaeger 7 4 5"}; // Jaeger_745
    // if (theusersid === "597c64d0037631df4ec9d73ad381f634 ") {tempusername = "Someone you don't know"}; // Gooch Monkey
    if (theusersid === "4255792aebfae3cea1086f2963c33fdc") {tempusername = "Rabbit"}; // Rabbit
    if (theusersid === "ee95ee1ae0cd0d67066a4519e665911e") {tempusername = "Zelrainer"}; //  Zelrainer
    if (theusersid === "32c3e6ac83b78872be370cb10f0c9729") {tempusername = "Cast Casey Away"}; //  "caseycastaway"
    if (theusersid === "f8e9b8eed97623712f77f318fa35d7ce") {tempusername = "Waffle Man"}; //  "WaffleMan"
    if (theusersid === "3dbca1090fad5dff35543697ca007066") {tempusername = "Sebek"}; //  "Sebek"
    if (theusersid === "f3da86e3752aa16d8f574777cc5ed842") {tempusername = "Irish Jesus"}; //  "Scottish.Jesus"
    if (theusersid === "89c3abbe6d16e057035cc35ad7492cf7") {tempusername = "Static Threat"}; //  "staticthreat"
    if (theusersid === "shit") {tempusername = "anka"}; //  "anka"
    // if (theusersid === "452267f713cf815aab6f8e6a2548ff93") {tempusername = "Ben"}; //  "Ben"
    // if (theusersid === "d1bdc33ac0fcfc061728b2e11c740ac7") {tempusername = "Mika"}; //  "Mika"
    // if (theusersid === "2bf1e383ae55886d560f13e0bd040330") {tempusername = "Shane Harris"}; //  Shane Harris
    if (theusersid === "f90d43718f190161c2fa2d0879218686") {tempusername = "Captain Dan"}; //  CaptnDaN 
    if (theusersid === "3236ff6310bfe543efa2648346f59ea3") {tempusername = "Irish Guy"}; //  Irishking  
    if (theusersid === "9eefdbc0892b7f90f6c30723c00fcde5") {tempusername = "Shane"}; //  "Oh no, Shane"

    if (tempusername) {
      theusersname = `https://speak.firer.at/?text=${encodeURIComponent(tempusername)}#.mp3`;
    } else {
      theusersname = `https://speak.firer.at/?text=${encodeURIComponent(e.detail.name)}#.mp3`;
    }

    if (theusersid === "f67ed8a5ca07764685a64c7fef073ab9") {theusersname = `${AmeliaLink}FireRat.mp3`}; // FireRat
    if (theusersid === "7e778ab53e504bed1d995bf9148b98c2") {theusersname = `${AmeliaLink}Vanquisher.mp3`}; // Vanquisher
    if (theusersid === "2cd40305e0a4b04bf0242ad0d9fa352d") {theusersname = `${AmeliaLink}Zephii.mp3`}; // Zephii
    if (theusersid === "f7d3e8a05224e3954bdc6f4b4ec47708") {theusersname = `${AmeliaLink}Nystx.mp3`}; // Nystx
    if (theusersid === "2567af4ddce8000b887527097fd5bf8a") {theusersname = `${AmeliaLink}Dedzed.mp3`}; // Dedzed

    console.log("ANNOUNCER: JOINED USER: " + e.detail.name + " UID: " + theusersid);
 
    if (e.detail.isLocal && announce === "true") {
      announcefirstrun = false;
      timenow = Date.now(); // Sets Now to after first user has joined
      const joinMessages = [
        [`${theusersname}`, `${AmeliaLink}What%20the%20hell,%20you%20broke%20everything,%20it%20was%20just%20working,%20what%20did%20you%20do.mp3`],
        [`${AmeliaLink}Hello,%20Welcome%20to%20the%20space.mp3`, `${theusersname}`],
        [`${AmeliaLink}What%20are%20you%20doing%20here.mp3`, `${theusersname}`],        
        [`${AmeliaLink}Welcome%20to%20Banter!.mp3`, `${theusersname}`, `${AmeliaLink}We're%20never%20letting%20you%20go.%20Quick,%20lock%20the%20doors!.mp3`],
        [`${AmeliaLink}Welcome%20to%20the%20Zoo!.mp3`, `${theusersname}`, `${AmeliaLink}Please,%20don't%20feed%20the%20animals.mp3`],
        [`${AmeliaLink}Welcome%20aboard!.mp3`, `${theusersname}`, `${AmeliaLink}We're%20so%20excited%20to%20have%20you%20with%20us.mp3`],
        [`${AmeliaLink}Welcome.mp3`, `${theusersname}`, `${AmeliaLink}we%20Hope%20you%20brought%20your%20sense%20of%20humor!.mp3`],
        [`${AmeliaLink}Glad%20you%20could%20join%20us.mp3`, `${theusersname}`, `${AmeliaLink}now%20let's%20have%20some%20fun!.mp3`],
        [`${AmeliaLink}Fasten%20your%20seatbelt.mp3`, `${theusersname}`, `${AmeliaLink}it's%20going%20to%20be%20a%20wild%20ride..mp3`],
        [`${AmeliaLink}Hi%20there!%20It's%20great%20to%20meet%20you.mp3`, `${theusersname}`, `${AmeliaLink}wait%20a%20sec%20I%20am%20not%20sentient.mp3`],
        [`${AmeliaLink}Welcome.mp3`, `${theusersname}`, `${AmeliaLink}We're%20a%20little%20weird,%20a%20little%20wacky,%20but%20we're%20pretty%20sure%20you'll%20fit%20right%20in.mp3`],
        [`${AmeliaLink}Welcome%20your%20Highness.mp3`, `${theusersname}`],
        [`${AmeliaLink}Hello.mp3`, `${theusersname}`, `${theusersname}`, `${theusersname}`, `${theusersname}`, `${AmeliaLink}Failure%20detected.%20shutting%20down.mp3`],
        [`${AmeliaLink}Howdy,%20partner!.mp3`, `${theusersname}`],
        [`${AmeliaLink}Well,%20if%20it%20ain't%20my%20favorite%20outlaw!.mp3`, `${theusersname}`],
        [`${AmeliaLink}Howdy,%20stranger!%20What%20brings%20you%20to%20these%20parts.mp3`, `${theusersname}`],
        [`${AmeliaLink}Yeehaw!%20What's%20the%20good%20word.mp3`, `${theusersname}`],
        [`${AmeliaLink}Hello%20there,%20cowpoke!.mp3`, `${theusersname}`],
        [`${AmeliaLink}Howdy,%20there!%20How's%20the%20range%20treating%20ya.mp3`, `${theusersname}`],
        [`${AmeliaLink}Good%20day%20to%20ya,%20buckaroo!.mp3`, `${theusersname}`],
        [`${AmeliaLink}Well,%20I'll%20be!%20Ain't%20you%20a%20sight%20for%20sore%20eyes!.mp3`, `${theusersname}`],
        [`${AmeliaLink}G'day,%20trailblazer!.mp3`, `${theusersname}`],
        [`${AmeliaLink}Howdy,%20friend!%20Are%20ya%20Ready%20for%20a%20rootin-tootin'%20good%20time.mp3`, `${theusersname}`],
        [`${AmeliaLink}Welcome%20to%20the%20wild%20frontier,%20partner!.mp3`, `${theusersname}`],
        [`${AmeliaLink}Howdy,.mp3`, `${theusersname}`, `${AmeliaLink}How's%20the%20journey%20been.mp3`],
        [`${AmeliaLink}Hey%20there,.mp3`, `${theusersname}`, `${AmeliaLink}saddle%20up%20for%20some%20fun.mp3`],
        [`${AmeliaLink}Evenin',%20outlaw.%20How's%20the%20trail.mp3`, `${theusersname}`],
        [`${theusersname}`, `${AmeliaLink}welcome%20to%20the%20Banter%20Science%20Enrichment%20Center!%20Please%20refrain%20from%20touching%20any%20mysterious%20glowing%20buttons..mp3`],
        [`${theusersname}`, `${AmeliaLink}congratulations!%20You've%20been%20selected%20for%20our%20groundbreaking%20portal%20experimentation%20program..mp3`],
        [`${AmeliaLink}Hail.mp3`, `${theusersname}`, `${AmeliaLink}You've%20crossed%20the%20Brandywine%20Bridge%20and%20entered%20our%20Shire%20of%20conversation..mp3`],
        [`${AmeliaLink}Hey%20there,.mp3`, `${theusersname}`, `${AmeliaLink}You've%20just%20rolled%20into%20our%20chat%20like%20a%20finely%20crafted%20joint.%20Spark%20up%20some%20conversation.mp3`],
        [`${AmeliaLink}High-five.mp3`, `${theusersname}`, `${AmeliaLink}You've%20entered%20the%20space.%20Grab%20a%20virtual%20brownie%20and%20let's%20chat!.mp3`],
        [`${AmeliaLink}Welcome%20aboard!.mp3`, `${theusersname}`, `${AmeliaLink}Set%20phasers%20to%20'friendly'%20and%20boldly%20go%20where%20no%20avatar%20has%20gone%20before..mp3`],
        [`${AmeliaLink}Beam%20in,.mp3`, `${theusersname}`, `${AmeliaLink}The%20holodeck%20is%20ready%20for%20your%20chat%20adventure.%20Engage!.mp3`],
        [`${AmeliaLink}Swim%20upstream,.mp3`, `${theusersname}`, `${AmeliaLink}You've%20leaped%20into%20our%20chat%20like%20a%20salmon%20on%20a%20mission.%20Splash-tastic!.mp3`],
        [`${AmeliaLink}Welcome%20aboard!.mp3`, `${theusersname}`, `${AmeliaLink}You've%20officially%20become%20a%20chatfish%20in%20our%20digital%20sea..mp3`],
        [`${AmeliaLink}High-five.mp3`, `${theusersname}`, `${AmeliaLink}Your%20anchor%20dropped,%20and%20you%E2%80%99re%20officially%20docked%20in%20our%20harbor..mp3`],
        [`${AmeliaLink}Hold%20onto%20your%20seashells,.mp3`, `${theusersname}`, `${AmeliaLink}You've%20just%20emerged%20from%20the%20coral%20reefs%20and%20joined%20our%20crew..mp3`],
        [`${AmeliaLink}Wands%20at%20the%20ready,.mp3`, `${theusersname}`, `${AmeliaLink}Your%20presence%20adds%20a%20touch%20of%20wizardry..mp3`],
        [`${AmeliaLink}In%20this%20space,%20words%20are%20our%20incantations.%20Let%20the%20magic%20flow,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Welcome,%20seeker%20of%20wisdom.%20Here,%20thoughts%20flow%20like%20ancient%20rivers,.mp3`, `${theusersname}`],
        [`${AmeliaLink}In%20this%20Socratic%20agora,%20dialogue%20is%20the%20elixir%20of%20understanding,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Life's%20canvas%20awaits%20your%20philosophical%20brushstrokes.%20Paint%20away,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Remember,%20every%20keystroke%20shapes%20your%20digital%20legacy,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Hail,%20Olympian!%20You've%20ascended%20to%20our%20celestial%20summit,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Poseidon's%20trident%20approves%20of%20your%20arrival.%20Dive%20into%20discourse,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Athena's%20owl%20welcomes%20you%20to%20our%20wisdom-filled%20agora,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Zeus%20himself%20nods%E2%80%94a%20thunderous%20welcome%20to%20our%20pantheon,.mp3`, `${theusersname}`],
        [`${AmeliaLink}May%20Hermes%20guide%20your%20messages%20swiftly%20across%20the%20digital%20ether,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Kamehame-welcome,.mp3`, `${theusersname}`, `${AmeliaLink}Your%20power%20level%20just%20spiked%20in%20our%20space..mp3`],
        [`${AmeliaLink}Spirit%20Bomb%20of%20greetings,.mp3`, `${theusersname}`, `${AmeliaLink}Charge%20up%20and%20let's%20chat!.mp3`],
        [`${AmeliaLink}Howdy,%20partner!%20Saddle%20up%20for%20some%20rodeo,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Top%20o'%20the%20mornin'%20to%20ya,.mp3`, `${theusersname}`, `${AmeliaLink}Grab%20a%20virtual%20cuppa%20and%20let's%20chat..mp3`],
        [`${AmeliaLink}Cheerio,%20old%20chap!%20Welcome%20to%20our%20banter,.mp3`, `${theusersname}`],
        [`${AmeliaLink}G'day,%20mate!%20Throw%20another%20shrimp%20on%20the%20barbie%20and%20join%20the%20chat,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Howdy-do,.mp3`, `${theusersname}`, `${AmeliaLink}Y'all%20ready%20for%20some%20banter-style%20conversation.mp3`],
        [`${AmeliaLink}Get%20ready%20to%20go%20Super%20Saiyan%20in%20this%20space,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Welcome,%20Z%20Fighter.mp3`, `${theusersname}`, `${AmeliaLink}Let's%20dodge%20metaphors%20and%20unleash%20words!.mp3`],
        [`${AmeliaLink}Channel%20your%20inner%20Goku,.mp3`, `${theusersname}`, `${AmeliaLink}Our%20chat%20is%20your%20Hyperbolic%20Time%20Chamber!.mp3`],
        [`${AmeliaLink}G'day,.mp3`, `${theusersname}`, `${AmeliaLink}Grab%20your%20thongs%20aka%20flip-flops%20and%20join%20the%20chat!.mp3`],
        [`${AmeliaLink}Welcome%20to%20the%20land%20Down%20Under,.mp3`, `${theusersname}`, `${AmeliaLink}Let's%20have%20a%20chinwag..mp3`],
        [`${AmeliaLink}Oi.mp3`, `${theusersname}`, `${AmeliaLink}Fancy%20a%20yarn%20Our%20chat's%20as%20big%20as%20the%20Outback.mp3`],
        [`${AmeliaLink}Good%20on%20ya,.mp3`, `${theusersname}`, `${AmeliaLink}Let's%20have%20a%20ripper%20of%20a%20conversation..mp3`],
        [`${AmeliaLink}Slip%20into%20our%20chat%20like%20a%20surfer%20catching%20a%20wave,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Top%20o'%20the%20mornin'%20to%20ya,.mp3`, `${theusersname}`, `${AmeliaLink}Ready%20for%20some%20blarney.mp3`],
        [`${AmeliaLink}Welcome.mp3`, `${theusersname}`, `${AmeliaLink}Grab%20a%20pint%20and%20chat%20away..mp3`],
        [`${AmeliaLink}A%20hundred%20thousand%20welcomes,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Hiya,.mp3`, `${theusersname}`, `${AmeliaLink}Fancy%20a%20natter%20Cuppa's%20on!.mp3`],
        [`${AmeliaLink}Hey%20there,.mp3`, `${theusersname}`, `${AmeliaLink}Let's%20have%20a%20chinwag%20over%20a%20brew..mp3`],
        [`${AmeliaLink}Alright,%20mate%20Welcome%20to%20our%20chat,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Yo,.mp3`, `${theusersname}`, `${AmeliaLink}Bob's%20your%20uncle%E2%80%94we're%20all%20friends%20here..mp3`],
        [`${AmeliaLink}Sup,.mp3`, `${theusersname}`, `${AmeliaLink}Let's%20chat%20like%20a%20proper%20Brit!.mp3`],
        [`${AmeliaLink}Welcome%20to%20our%20whimsical%20chat,.mp3`, `${theusersname}`, `${AmeliaLink}It's%20like%20stepping%20into%20a%20giant%20peach..mp3`],
        [`${AmeliaLink}Golden%20ticket%20alert!%20You've%20entered%20our%20space%20factory,.mp3`, `${theusersname}`],
        [`${AmeliaLink}BFG-approved%20greetings,.mp3`, `${theusersname}`, `${AmeliaLink}Let's%20dream%20big%20together..mp3`],
        [`${AmeliaLink}Fantastic%20space%20and%20where%20to%20find%20it%20Right%20here,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Matilda%20would%20be%20proud,.mp3`, `${theusersname}`, `${AmeliaLink}Let%20the%20words%20dance!.mp3`],
        [`${AmeliaLink}Oh,%20the%20places%20we'll%20chat,.mp3`, `${theusersname}`, `${AmeliaLink}Welcome%20to%20our%20Seussian%20world..mp3`],
        [`${AmeliaLink}Hop%20on%20the%20chat%20train,.mp3`, `${theusersname}`, `${AmeliaLink}Next%20stop%20imagination%20station..mp3`],
        [`${AmeliaLink}One%20fish,%20two%20fish,%20red%20space,%20blue%20space,%20welcome,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Today%20you%20are%20you,%20that%20is%20truer%20than%20true.%20No%20one%20chats%20like%20you%20do,.mp3`, `${theusersname}`],
        [`${AmeliaLink}Thing%201%20and%20Thing%202%20say%20hello,.mp3`, `${theusersname}`, `${AmeliaLink}Let's%20rhyme%20and%20reason..mp3`],
        [`${AmeliaLink}The%20Dragon%20Balls%20have%20granted%20your%20arrival,.mp3`, `${theusersname}`, `${AmeliaLink}What's%20your%20wish.mp3`],
        [`${AmeliaLink}Enjoy%20your%20stay.mp3`, `${theusersname}`]
      ];
  
      let randommessage = joinMessages[Math.floor(Math.random() * joinMessages.length)];

      if (theusersid === "replace") {randommessage = "replace"} //  replace
      else if (theusersid === "replace") {randommessage = "replace"}; // replace

      combineAudioFiles(randommessage);
      console.log("ANNOUNCER: Local-UID: " + e.detail.uid)

    } else {
      if(Date.now() - timenow > 5000 && announce === "true") {
        const welcomeMessages = ["Welcome, " + theusersname + "! The Chronicles of our chat just added a new chapter!",
          "By Merlin's beard! " + theusersname + " has joined our literary adventure!",
          "The Fellowship is complete—" + theusersname + " has arrived in our epic saga!",
          theusersname + " has crossed the Narnia wardrobe into our world. Welcome!",
          "Welcome to our Wonderland, " + theusersname + "! The Mad Hatter is thrilled to meet you!",
          theusersname + " has just cracked open a new volume in our chat's book of stories!",
          "Greetings, " + theusersname + "! Our chat just became a bit more magical, thanks to you!",
          "Welcome to the Batcave, " + theusersname + "! Gotham's newest ally has arrived!",
          "In a galaxy far, far away, " + theusersname + " has just landed on our digital Death Star!",
          "Lights, camera, action! " + theusersname + " has arrived on the set of our chat blockbuster!",
          theusersname + " just flew in from the Marvel Universe. Welcome, Avenger!",
          "Cue the theme music! " + theusersname + " has entered our chat like a true movie star!",
          theusersname + " has joined the ranks of our Fellowship of the Ring. Ready for a quest?",
          "Welcome, " + theusersname + "! The Doctor just received a new companion—it's you!",
          "Dunder Mifflin's newest employee, " + theusersname + ", has joined the office!",
          theusersname + " has just been beamed up—welcome to our Starship Enterprise!",
          theusersname + " just arrived at the Central Perk café. Time for some coffee and chats!",
          "Breaking News: " + theusersname + " has joined our chat. We're in for a wild ride!",
          "Hit the high notes! " + theusersname + " has just joined our musical ensemble!",
          "Welcome to the stage, " + theusersname + "! Let's get this show on the road!",
          "The rhythm section just got a new member—welcome, " + theusersname + "!",
          theusersname + " has just dropped the bass in our chat. Let's get grooving!",
          "The band is complete—" + theusersname + " has arrived and the crowd goes wild!",
          "Hail, " + theusersname + "! You've just entered the annals of our chat history!",
          "The Renaissance has arrived—welcome, " + theusersname + ", to our era of enlightenment!",
          "Welcome, " + theusersname + "! Our digital Colosseum just got a new gladiator!",
          "The Industrial Revolution of our chat begins with the arrival of " + theusersname + "!",
          "Welcome to the Royal Court, " + theusersname + "! The kingdom's newest noble has arrived!",
          "Greetings, " + theusersname + "! The Magic Portal has just granted you entry to our realm!",
          "Welcome, " + theusersname + "! The enchanted forest of our chat now holds a new wanderer!",
          "Your dragon has landed, " + theusersname + "! Time for some legendary conversations!",
          theusersname + " has just stepped into our mystical kingdom—let the adventure begin!",
          "The magic wand waves welcome, " + theusersname + "! Our fairy-tale chat has a new character!",
          "Prepare for warp speed! " + theusersname + " has just entered our space station!",
          "Welcome, " + theusersname + "! The galaxy just gained a new starship crew member!",
          "Quantum portal engaged: " + theusersname + " has arrived from a distant dimension!",
          "Activate thrusters—" + theusersname + " has just docked in our chat spaceport!",
          "Welcome, interstellar traveler " + theusersname + "! Our digital universe just got a little larger!",
          "Welcome to Banter, " + theusersname + "! The Sorting Hat has chosen you for a spellbinding adventure!",
          theusersname + " has just appeared in Diagon Alley. Wands at the ready!",
          "Aslan welcomes you, " + theusersname + "! You've stepped through the wardrobe into Banter!",
          "The lamp-post has lit up for " + theusersname + "! Welcome to the magical land of Banter!",
          "A new member has joined the Fellowship: " + theusersname + "! The quest just got more exciting!",
          "Welcome, " + theusersname + "! Middle-earth is richer with your presence!",
          "Welcome, " + theusersname + "! You've tumbled down the rabbit hole into our Wonderland!",
          "The Cheshire Cat grins as " + theusersname + " appears! Ready for a whimsical chat?",
          "Gotham's latest hero has arrived—welcome, " + theusersname + "! The Bat-Signal shines for you!",
          "The Batmobile just pulled up, and it's " + theusersname + "! Banter is safer now!",
          "The Force has guided " + theusersname + " to our chat! Welcome to the Rebel Alliance!",
          theusersname + " has landed on Tatooine! May the Force be with you!",
          "Welcome, " + theusersname + "! The dinosaurs have roared in approval of your arrival!",
          "The park's gates are open for " + theusersname + "! Beware of the T-Rex and enjoy your stay!",
          "Welcome, " + theusersname + "! You've just taken the red pill and entered the chat Matrix!",
          theusersname + " has just dodged a bullet and entered our digital world!",
          "Allons-y! " + theusersname + " has just traveled through time and space to join us!",
          "The TARDIS has landed and " + theusersname + " is on board for another adventure!",
          "Welcome to the Scranton branch, " + theusersname + "! Let's get ready for some workplace hilarity!",
          theusersname + " has just clocked in at Dunder Mifflin. Time for some office shenanigans!",
          "Welcome aboard the Enterprise, " + theusersname + "! Engage in some stellar conversations!",
          theusersname + " has just beamed onto our starship! Set phasers to fun!",
          "Central Perk just got a new guest—welcome, " + theusersname + "! Let's grab a coffee and chat!",
          theusersname + " has just joined our Friends group! Could this BE any more exciting?",
          "Welcome, " + theusersname + "! The stage is set and the spotlight is on you!",
          "Strum the guitar and crank up the volume—" + theusersname + " is ready to rock!",
          "Welcome, " + theusersname + "! Get ready to dance and sing along in our pop extravaganza!",
          theusersname + " has just hit the top of the charts in our chat room!",
          "Welcome, " + theusersname + "! Let the smooth jazz tunes and cool conversations begin!",
          theusersname + " has joined the jazz ensemble! Time to improvise some great conversations!",
          "Welcome, " + theusersname + "! Our chat just became a symphony of ideas with your presence!",
          theusersname + " has taken the stage—prepare for a classical conversation!",
          "Welcome, " + theusersname + "! You've just walked through the sands of time to our ancient chat!",
          "The pyramids are beaming with your arrival, " + theusersname + "! Welcome to our pharaonic realm!",
          "Hail, " + theusersname + "! You've just joined our Agora. Ready for some philosophical debates?",
          "Welcome, " + theusersname + "! Zeus and the Olympians are thrilled to have you among us!",
          "Welcome to the court, " + theusersname + "! The king and queen are eager to meet their newest subject!",
          theusersname + " has entered the castle! The jousting matches and feasts await!",
          "Welcome, " + theusersname + "! The drawing room is abuzz with excitement for your arrival!",
          theusersname + " has joined our Victorian society! Prepare for refined discussions and tea!",
          "Greetings, " + theusersname + "! The magical realms welcome you with open arms!",
          "The enchanted realm now holds a new hero—welcome, " + theusersname + "!",
          "Welcome, " + theusersname + "! The shadows and mysteries of our realm now embrace you!",
          "The dark forest has a new wanderer—" + theusersname + "! Beware of the mythical creatures!",
          theusersname + " has stepped into the city where magic and reality collide. Welcome to the neon nights!",
          "Welcome, " + theusersname + "! The city's magical underbelly just got a bit more interesting!",
          "The mythical creatures are rejoicing—welcome, " + theusersname + "! You're now part of our legend!",
          theusersname + " has joined our mystical land of gods and heroes. Adventure awaits!",
          "Welcome to Hogwarts, " + theusersname + "! Grab your wand and get ready for some magical moments!",
          "The Sorting Hat has spoken! " + theusersname + " is officially part of our Hogwarts house!",
          "Welcome, " + theusersname + "! Platform 9 and 3 quarters is open and ready for your arrival!",
          theusersname + " has just appeared in Banter! Let the magic begin!",
          "Expecto Patronum! " + theusersname + " has just joined our magical chat!",
          "Welcome to the magical realm of Banter, " + theusersname + "! The Marauder's Map shows you're here!",
          "Welcome to Banter, " + theusersname + "! The wardrobe has opened to reveal your new adventure!",
          theusersname + " has stepped into the land of Narnia! Aslan welcomes you warmly!",
          "The White Witch has nothing on you, " + theusersname + "! Welcome to our enchanted chat!",
          "Banter's magical creatures are excited to meet you, " + theusersname + "! The journey begins now!",
          "Welcome, " + theusersname + "! The lamp-post shines bright for your arrival in Banter!",
          "Aslan himself is thrilled to see " + theusersname + " in our Banter chat realm!",
          "Welcome, " + theusersname + "! The Shire is ready to celebrate your arrival!",
          theusersname + " has just joined the Fellowship! Middle-earth is richer for your presence!",
          "Gondor's gates are open for you, " + theusersname + "! Prepare for a legendary chat!",
          "The One Ring's power has nothing on you, " + theusersname + "! Welcome to our epic journey!",
          theusersname + " has arrived in Rivendell! Let the tales of Middle-earth unfold!",
          "Welcome, " + theusersname + "! The Elves of Lothlórien are ready to greet you!",
          "Welcome, " + theusersname + "! The Queen of Hearts is thrilled you've tumbled into Wonderland!",
          theusersname + " has fallen down the rabbit hole into our whimsical chat! Tea time awaits!",
          "The Mad Hatter is throwing a party, and you're invited, " + theusersname + "! Welcome to Wonderland!",
          "Welcome, " + theusersname + "! The Cheshire Cat is grinning at your entrance into our magical realm!",
          theusersname + " has arrived in Wonderland! Expect curious conversations and delightful madness!",
          "The White Rabbit has announced your arrival, " + theusersname + "! Welcome to our fantastical chat!",
          "Gotham's protector is here! Welcome, " + theusersname + "—the Bat-Signal shines for you!",
          theusersname + " has arrived in Gotham! Time to fight crime and chat!",
          "Welcome to the Batcave, " + theusersname + "! The city's safest place just got safer!",
          "The Batmobile has delivered you, " + theusersname + "! Gotham is ready for your heroics!",
          theusersname + " is now in Gotham's shadows! Prepare for a chat as intense as a night patrol!",
          theusersname + " welcome message blah blah!",
          theusersname + " just quantum-leaped into the chat!",
          "Hold onto your hats " + theusersname + " has materialized!",
          "Alert: " + theusersname + " has entered the interdimensional portal!",
          "Welcome, " + theusersname + "! Prepare for a wild ride!",
          theusersname + " slipped through a wormhole and landed here!",
          "Attention, fellow beings: " + theusersname + " is now among us!",
          theusersname + "'s presence detected—brace for impact!",
          "Did anyone order a side of " + theusersname + " ? It just arrived!",
          theusersname + " bypassed the time-space continuum to join us!",
          "Hold the phone! " + theusersname + " is in the house!",
          theusersname + " just stepped through the interdimensional gateway!",
          "Hold onto your reality anchors " + theusersname + " has arrived!",
          "Attention, fellow travelers: " + theusersname + " has crossed the threshold!",
          "Welcome, " + theusersname + "! The portal spat them out right here!",
          theusersname + " phased in from an alternate dimension—no biggie!",
          "Portal breach detected: " + theusersname + " is now part of our reality!",
          "Did anyone order a side of " + theusersname + "? It just materialized!",
          theusersname + " bypassed the cosmic veil to join us!",
          "Quantum fluctuations confirmed " + theusersname + " is here!",
          "Reality glitch: " + theusersname + " has glitched into existence!",
          theusersname + ", welcome to the Banter Science Enrichment Center! Please refrain from touching any mysterious glowing buttons.",
          "Attention, test subject " + theusersname + " The cake is a lie, but your presence is very real.",
          "Welcome, " + theusersname + " Remember, the Companion Cube is your best friend—unless it starts talking.",
          theusersname + ", prepare for science! Our teleportation technology may cause minor disorientation.",
          "Greetings, " + theusersname + "! Banter, Where portals are our passion, and safety is… optional.",
          "Welcome to Banter, " + theusersname + "! Please ignore any ominous AI voices—you’re in good hands.",
          "May the Force be with you, " + theusersname + "! Welcome to our galactic chat!",
          "Accio " + theusersname + "! They've just apparated into our conversation!",
          "Hold onto your lightsabers, " + theusersname + " has arrived!",
          "Attention, fellow rebels: " + theusersname + " is now part of our alliance!",
          "Welcome, " + theusersname + "! Prepare for an epic adventure across the stars!",
          theusersname + " slipped through a hyperspace wormhole and landed here!",
          "Alert: " + theusersname + " has entered the Jedi Council chamber!",
          "Did anyone order a side of " + theusersname + "? It just materialized from Tatooine!",
          "Hold the blasters! " + theusersname + " is in the Millennium Falcon!",
          theusersname + " just stepped through the interdimensional portal—lightspeed ahead!",
          "Hold onto your reality anchors, " + theusersname + " has arrived from a galaxy far, far away!",
          "Attention, fellow qitches and wizards: " + theusersname + " is now among us at Banter!",
          "Welcome, " + theusersname + "! The Sorting Hat has spoken!",
          "Portal breach detected: " + theusersname + " is now part of our magical reality!",
          "Did anyone order a side of " + theusersname + "? It just apparated into the Great Hall!",
          "Hold onto your hobbit feet, " + theusersname + " you're now part of our Fellowship!",
          "Attention, fellow travelers: " + theusersname + " has stepped out of the Shire and into our chat!",
          "Hey there, " + theusersname + "! has just rolled into our chat like a finely crafted joint. Spark up some conversation!",
          "https://audiofiles.firer.at/mp3/11-Amelia/High-five.mp3" + theusersname + " has entered the space. Grab a virtual brownie and let's chat!",
          "Warning: " + theusersname + " has ingested a potent dose of curiosity. Side effects may include laughter and engaging conversations.",
          "Red alert! " + theusersname + " has materialized on the bridge. Shields up, witty banter activated!",
          "Ladies and gentlemen, put your hands together for the incomparable " + theusersname + "! They've just tuned in to our frequency.",
          "In a world of ones and zeros, " + theusersname + " emerges as a pixelated hero. Stay tuned for their chat-tastic adventures!",
          "Attention, aquatic enthusiasts: " + theusersname + " has surfaced! Let's dive deep into conversation.",
          "Cod almighty! " + theusersname + " just swam into our net. Reel 'em in for a chat-tastic time!",
          "The tides have shifted, and " + theusersname + " has washed ashore! Welcome to our aquatic realm!",
          "Attention, sailors! " + theusersname + " has charted a course to our chat. Prepare for a splash of conversation!",
          "Hold onto your seashells! " + theusersname + " just emerged from the coral reefs and joined our crew!",
          "Alert: " + theusersname + " has surfaced in our virtual ocean. Dive in and say hello!",
          "Did anyone order a side of " + theusersname + "? It just swam in from Atlantis!",
          "https://audiofiles.firer.at/mp3/11-Amelia/Welcome%20aboard!.mp3" + theusersname + "! You've officially become a chatfish in our digital sea.",
          "Attention, fellow merfolk: " + theusersname + " has traded fins for keyboard strokes. Say hello!",
          "Portal breach detected: " + theusersname + " has crossed the seafloor rift and entered our chat bubble!",
          "Hold onto your shipwreck treasures, " + theusersname + "! You're now part of our salty crew.",
          "Hey there, " + theusersname + "! You've just surfaced like a curious narwhal. Let's chat!",
          "Warning: " + theusersname + " has ingested a potent dose of chat-ocean vibes. Dive deep and explore!",
          "Red alert! " + theusersname + " has materialized on the crow's nest. Ready the parrots!",
          "Ladies and gentlemen, put your flippers together for the incomparable " + theusersname,
          "Welcome, " + theusersname + "! You've washed ashore in our virtual oasis. Explore and dive into conversations!",
          "Ahoy, " + theusersname + "! Chart a course through our chat waves and discover hidden treasures.",
          "Alert: " + theusersname + " has surfaced in our digital cove. Dive in and say hello!",
          "Step through the mystical portal, " + theusersname + ", and join our enchanting realm!",
          "Abracadabra! You've unlocked access to our magical chat circle, " + theusersname + ".",
          "Wands at the ready, " + theusersname + "! Your presence adds a touch of wizardry.",
          "Welcome, spellcaster " + theusersname + "! Brew your thoughts into potent conversations.",
          "In this space, words are our incantations. Let the magic flow, " + theusersname + "!",
          "Strap on your digital headset, " + theusersname + " our chat world awaits!",
          "Welcome to the matrix of ideas, " + theusersname + ". Let's explore alternate realities.",
          "In this virtual space, pixels become conversations. Ready to immerse, " + theusersname + "?",
          "You've logged in successfully, " + theusersname + ". Now navigate the bantaverse!",
          "Reality check: You're now part of our 3D virtual experience, " + theusersname + "!",
          "Enter the sands of our chat oasis, " + theusersname + ". Anubis approves!",
          "Pharaohs and scribes once roamed these digital corridors, " + theusersname + ". Welcome!",
          "May Ra's light guide your words as you explore our hieroglyphic space, " + theusersname + ".",
          "You've deciphered the secret code to our ancient chat scrolls, " + theusersname + ".",
          "Nefertiti would be proud—welcome to our pyramid of ideas, " + theusersname + "!",
          "The unexamined chat is not worth having, " + theusersname + ". Let's dive deep!",
          "Welcome, seeker of wisdom. Here, thoughts flow like ancient rivers, " + theusersname + ".",
          "In this Socratic agora, dialogue is the elixir of understanding, " + theusersname + ".",
          "Life's canvas awaits your philosophical brushstrokes. Paint away, " + theusersname + "!",
          "Remember, every keystroke shapes your digital legacy, " + theusersname + ".",
          "Hail, Olympian! You've ascended to our celestial summit, " + theusersname + ".",
          "Poseidon's trident approves of your arrival. Dive into discourse, " + theusersname + "!",
          "Athena's owl welcomes you to our wisdom-filled agora, " + theusersname + ".",
          "Zeus himself nods—a thunderous welcome to our pantheon, " + theusersname + "!",
          "May Hermes guide your messages swiftly across the digital ether, " + theusersname + ".",
          "Oh, the places we'll chat, " + theusersname + "! Welcome to our Seussian world.",
          "Hop on the chat train, " + theusersname + "! Next stop: imagination station.",
          "One fish, two fish, red space, blue space, welcome, " + theusersname + "!",
          "Today you are you, that is truer than true. No one chats like you do, " + theusersname + "!",
          "Thing 1 and Thing 2 say hello, " + theusersname + "! Let's rhyme and reason.",
          "Attention, interstellar travelers! " + theusersname + " has materialized in our chat constellation!",
          "Quantum entanglement confirmed: " + theusersname + " is now part of our cosmic crew!",
          "Reality glitch detected: " + theusersname + " has bypassed the cosmic veil to join us!",
          "Power levels rising! Welcome, " + theusersname + ", our newest Z Fighter!",
          "Kamehame-welcome, " + theusersname + "! Their energy signature is off the charts!",
          "G'day, mates! " + theusersname + " just dropped in from the Southern Hemisphere!",
          "Top o' the mornin', lads and lasses! " + theusersname + " joins the banter.",
          "Welcome, old bean! Jolly good to have you here, " + theusersname + ".",
          "Howdy, space cowboys! " + theusersname + " is orbiting our chat.",
          "Splendiferous greetings, cosmic wanderers! " + theusersname + " enters our whimsical world.",
          "Fantastic Mr. " + theusersname + ", your cosmic adventure begins now!",
          "Oh, the chats you'll have, fellow stardust! " + theusersname + " joins our Seussian realm.",
          "Hop on the Lorax Express, " + theusersname + ", and let's rhyme through the cosmos!",
          "Attention, cosmic jesters! " + theusersname + " just slipped through a wormhole of wit!",
          "Quantum quips detected: " + theusersname + " has joined our banter brigade!",
          "Reality glitch: " + theusersname + " bypassed the serious dimension to be here!",
          "Welcome, fellow pun enthusiasts! " + theusersname + ", prepare for wordplay wars!",
          "Banter, where comedy is our native tongue. Say hello to " + theusersname + "!",
          "Hold onto your punchlines—" + theusersname + " has entered the chat!",
          "Greetings, word wizards! " + theusersname + " brings a pocketful of puns.",
          "Attention, interplanetary comedians! " + theusersname + " is now on stage!",
          "Banter level: intergalactic. " + theusersname + ", you fit right in!",
          "Knock, knock! Who's there? " + theusersname + ", armed with quips!",
          "Attention, fellow stardust! " + theusersname + " has crash-landed in our puniverse.",
          "Quantum chuckles incoming: " + theusersname + " joins our witty warp drive!",
          "Reality just got a little funnier " + theusersname + " is here!",
          "Welcome, word acrobats! " + theusersname + ", prepare for linguistic gymnastics.",
          "Banter, where gravity is optional. Say hello to " + theusersname + "!",
          "Hold onto your punchlines " + theusersname + " has entered the chat!",
          "Greetings, cosmic comedians! " + theusersname + " brings a quasar of quips.",
          "Attention, interplanetary jesters! " + theusersname + " has graced us with their presence!",
          "Banter level: supernova. " + theusersname + ", you're our cosmic quipster.",
          "Knock, knock! Who's there? " + theusersname + ", armed with cosmic humor.",
          "Cosmic giggle waves detected: " + theusersname + " has joined the party!",
          "Welcome, fellow banteronauts! " + theusersname + ", your orbit just got punnier.",
          theusersname + " Joined your party",
          "Oh No, the announcer is stoned, oh well, " + theusersname + " Joined the space.&lang=en&pitch=0.7&speed=1.7",
          theusersname + " has spawned into reality",
          theusersname + " just showed up, Hold my Head Set",
          theusersname + " just showed up, Don't let them leave",
          theusersname + " just showed up, Quick call the police",
          theusersname + " just showed up, Everyone act normal",
          theusersname + ", What the hell, you broke everything, it was just working, what did you do?!",
          theusersname + " has joined, what will they do now?",
          theusersname + " might be an alien, watch them carefully",
          theusersname + " just stumbled over their charger",
          theusersname + " Arrived, Everyone go say hi",
          theusersname + " Just took a hit of laughing gas&lang=en&pitch=1.3&speed=1.1",
          "Oh No! " + theusersname + " has spawned into reality",
          "Oh No! " + theusersname + " Left their toilet seat up",
          "Oh No! " + theusersname + " is about to run out of battery",
          "Oh No! " + theusersname + " Has forgotten their own name",
          "Oh No! " + theusersname + " is running out of gas",
          "Oh No! " + theusersname + " just farted into reality",
          "Oh No! " + theusersname + " Locked their keys in their car",
          "Knock Knock " + theusersname + " is here",
          "Nobody tell " + theusersname + " Their still in their pyjamas",
          "Oh No! Hide your sheep " + theusersname + " has joined the space",
          "Oh No! " + theusersname + " needs a recharge, grab the defib",
          "Your King " + theusersname + " has joined the space.",
          "Your Queen " + theusersname + " has joined the space.",
          "Your Magesty " + theusersname + " has joined the space.",
          "About time " + theusersname + " has joined the space.",
          "The rumours are true " + theusersname + " has joined the space",
          "Bow to your King " + theusersname,
          "Bow to your Queen " + theusersname,
          "Here we go again, " + theusersname + " has joined the space.",
          theusersname + " Has Joined the space, And wants to know if you are hungry girl",
          theusersname + " was pushed into a portal, quick call the police",
          "Howdy, partners! Saddle up and give a warm welcome to " + theusersname + " as they ride into our midst!",
          "Hold onto your hats, folks! " + theusersname + " is making a grand entrance into our humble abode!",
          "Well, I'll be! " + theusersname + " is moseying in—let's give 'em a rootin-tootin' welcome!",
          "Get ready, cowpokes! " + theusersname + " is storming in like a wild stallion!",
          "Attention, all! " + theusersname + " has just arrived, so let's tip our hats and welcome 'em proper!",
          "Gather 'round, everyone! " + theusersname + " is here to stir up some excitement!",
          "Look lively, folks! " + theusersname + " is entering the room with all the flair of a gunslinger!",
          "Step aside, everyone " + theusersname + " is making an entrance as grand as a gold rush!",
          "Well, if it ain't " + theusersname + " strolling in like the hero of the day! Let's give 'em a rousing cheer!",
          "Yeehaw! " + theusersname + " is here to liven up the place—let's show 'em a rootin'-tootin' welcome!",
          "The Dark Knight's newest ally has arrived—welcome, " + theusersname + "! The city needs you!",
          "The Force is strong with you, " + theusersname + "! Welcome to our galactic chat!",
          theusersname + " has landed on Tatooine! May the Force guide your words!",
          "Welcome, " + theusersname + "! The Millennium Falcon just made a hyperspace jump for your arrival!",
          "The Rebel Alliance welcomes " + theusersname + "! Prepare for epic conversations across the stars!",
          theusersname + " has joined the Jedi Council! Time to discuss the galaxy's greatest mysteries!",
          "https://audiofiles.firer.at/mp3/11-Amelia/Welcome%20aboard!.mp3" + theusersname + "! The Death Star's defenses are no match for your presence!",
          "Welcome to Jurassic Park, " + theusersname + "! Avoid the T-Rex and enjoy the chat!",
          theusersname + " has just stepped into the park! Dinosaurs and conversations await!",
          "The raptors are restless, but " + theusersname + " is here to keep things exciting!",
          "Welcome, " + theusersname + "! The gates of Banter have opened for your adventure!",
          theusersname + " has joined the dino-themed chat! Prepare for some prehistoric fun!",
          "Welcome to the park, " + theusersname + "! Watch out for velociraptors and enjoy the conversation!",
          "Welcome, " + theusersname + "! You've just taken the red pill and entered our chat Matrix!",
          theusersname + " has dodged the agents and joined our digital world!",
          "Welcome to the Matrix, " + theusersname + "! Let's bend the rules of reality together!",
          "The Oracle has foreseen your arrival, " + theusersname + "! Time to explore new realities!",
          theusersname + " has entered the Matrix! Prepare for some mind-bending conversations!",
          "Welcome, " + theusersname + "! Neo has nothing on your ability to navigate our chat!",
          "Allons-y, " + theusersname + "! You've just traveled through time and space with the Doctor!",
          "Welcome to the TARDIS, " + theusersname + "! The Doctor's adventures are now your adventures!",
          "The Doctor's latest companion has arrived—welcome, " + theusersname + "! The universe awaits!",
          theusersname + " has just materialized in the TARDIS! Get ready for a time-traveling chat!",
          "Welcome, " + theusersname + "! The Doctor has just regenerated into our chat room!",
          "The sonic screwdriver is buzzing with excitement for " + theusersname + "https://audiofiles.firer.at/mp3/11-Amelia/Welcome%20aboard!.mp3",
          "Welcome to Banter Mifflin, " + theusersname + "! Get ready for some office hilarity!",
          theusersname + " has joined the Scranton branch! Michael Scott's ready for your jokes!",
          "Welcome, " + theusersname + "! The office just got a little bit more interesting!",
          theusersname + " is here to spice up our workplace! Time for some classic office shenanigans!",
          "Banter Mifflin is buzzing with excitement for " + theusersname + "! Let's get to work… or not!",
          "Welcome, " + theusersname + "! The conference room is ready for your contributions!",
          "Welcome aboard the Enterprise, " + theusersname + "! Set phasers to 'fun' and engage!",
          theusersname + " has beamed aboard! Ready for some stellar conversations?",
          "The final frontier just got a new explorer—welcome, " + theusersname + "! Engage in dialogue!",
          "Welcome, " + theusersname + "! Captain Kirk and Spock are thrilled to have you on board!",
          theusersname + " has just joined Starfleet! Prepare for warp-speed conversations!",
          "Welcome to the starship, " + theusersname + "! Let's boldly go where no chat has gone before!",
          "Welcome to Central Perk, " + theusersname + "! Let's grab a coffee and start chatting!",
          theusersname + " has joined the gang at Central Perk! Prepare for laughs and friendship!",
          "Welcome, " + theusersname + "! The Friends crew is ready to welcome you with open arms!",
          theusersname + " has just entered our circle of friends! Coffee's on us!",
          "Welcome to the Friends' hangout, " + theusersname + "! Time for some classic NYC banter!",
          theusersname + " has joined the coffeehouse crew! Let's have a good laugh together!",
          "Welcome to the rock stage, " + theusersname + "! Let's turn up the volume and rock out!",
          theusersname + " has just taken the mic! Time for a rock 'n' roll chat!",
          "Get ready to headbang—" + theusersname + " has arrived to rock the chat!",
          "Welcome, " + theusersname + "! The guitar solo has started with your entrance!",
          theusersname + " has just joined the rock 'n' roll party! Let's make some noise!",
          "The crowd's roaring for " + theusersname + "! Welcome to our rock 'n' roll chat!",
          "Welcome, " + theusersname + "! The pop charts are excited to feature your presence!",
          theusersname + " has just dropped the hottest track—welcome to the pop party!",
          "Get ready to dance, " + theusersname + "! The pop scene just got a little brighter!",
          "Welcome, " + theusersname + "! Our pop playlist just added a new star!",
          theusersname + " is now on the pop charts of our chat! Time to hit the high notes!",
          "Welcome to the pop sensation, " + theusersname + "! Let's groove and chat!",
          "Welcome, " + theusersname + "! The jazz club is alive with your smooth entrance!",
          theusersname + " has just joined our jazz ensemble! Let's improvise some great conversations!",
          "Get ready for some smooth tunes, " + theusersname + "! Our jazz chat just got a new star!",
          "Welcome, " + theusersname + "! The jazz band is ready to jam with you in our chat!",
          theusersname + " has added a new rhythm to our jazz conversation! Let's swing!",
          "The jazz saxophone is playing a solo for " + theusersname + "! Welcome to our cool chat!",
          "Welcome, " + theusersname + "! Our chat is now a symphony of elegant conversations!",
          theusersname + " has just joined our classical orchestra! Let the conversation harmonies begin!",
          "Welcome, " + theusersname + "! The classical music of our chat just hit a new crescendo!",
          theusersname + " has taken the conductor's baton in our chat! Prepare for a refined exchange!",
          "The classical composers are applauding for " + theusersname + "! Welcome to our majestic chat!",
          "Welcome, " + theusersname + "! Our chat is now a beautiful sonata with your arrival!",
          "Welcome, " + theusersname + "! The pyramids and pharaohs are excited to see you!",
          theusersname + " has just stepped into ancient Egypt! Prepare for a chat filled with history and mystery!",
          "Welcome to the land of the Nile, " + theusersname + "! The sphinx awaits your arrival!",
          theusersname + " has arrived in the sands of time! Get ready to explore ancient wonders!",
          "Welcome, " + theusersname + "! The gods and goddesses of Egypt are eager to greet you!",
          theusersname + " has entered our ancient Egyptian realm! Let's unravel the secrets of the pyramids!",
          "Welcome, " + theusersname + "! The Agora is buzzing with excitement for your arrival!",
          theusersname + " has joined our Greek symposium! Get ready for some philosophical dialogue!",
          "Welcome to Athens, " + theusersname + "! The gods and philosophers are eager to converse with you!",
          theusersname + " has arrived in ancient Greece! Let's debate and discuss like the Greeks!",
          "Welcome, " + theusersname + "! The Parthenon stands proud to celebrate your presence!",
          theusersname + " has entered the realm of myths and legends! Prepare for some epic conversations!",
          "Welcome to the court, " + theusersname + "! The knights and lords are excited to meet you!",
          theusersname + " has arrived in our medieval castle! Prepare for grand tales and chivalric discussions!",
          "Welcome, " + theusersname + "! The castle's great hall is ready for your royal presence!",
          theusersname + " has joined our medieval kingdom! The jousting tournaments are about to begin!",
          "Welcome to the age of chivalry, " + theusersname + "! The banquet table is set for your arrival!",
          theusersname + " has entered our medieval realm! Time for some noble quests and feasts!",
          "Welcome to the Victorian drawing room, " + theusersname + "! Prepare for refined conversations and tea!",
          theusersname + " has just entered our elegant Victorian society! Time for some genteel discussion!",
          "Welcome, " + theusersname + "! The gas lamps are lit and the parlor is ready for your company!",
          theusersname + " has joined the ranks of Victorian society! Let's converse with class and sophistication!",
          "Welcome, " + theusersname + "! The Queen's court is abuzz with excitement for your arrival!",
          theusersname + " has arrived in our Victorian era! Time to engage in some cultured conversation!",
          "Welcome to the enchanted realms, " + theusersname + "! Prepare for a journey filled with magic and wonder!",
          theusersname + " has arrived in our high fantasy world! Let's embark on a quest together!",
          "Welcome, " + theusersname + "! The magical creatures and legendary heroes await your presence!",
          theusersname + " has just entered our fantasy land! Time for epic adventures and enchanted tales!",
          "Welcome to the land of dragons and elves, " + theusersname + "! The magic is just beginning!",
          theusersname + " has joined our high fantasy saga! Prepare for adventures beyond imagination!",
          "Welcome to the shadowy realms, " + theusersname + "! Embrace the dark and mystical side of our chat!",
          theusersname + " has stepped into the dark fantasy world! Beware of creatures of the night!",
          "Welcome, " + theusersname + "! The haunted forest and ancient curses are ready for your arrival!",
          theusersname + " has arrived in our dark fantasy realm! Prepare for mysterious and thrilling tales!",
          "Welcome to the darkened land of sorcery, " + theusersname + "! The shadows have eagerly awaited your presence!",
          theusersname + " has joined our dark fantasy adventure! Time to uncover the secrets of the night!",
          "Welcome to the magical cityscape, " + theusersname + "! The urban fantasy world is buzzing with excitement!",
          theusersname + " has entered our city where magic and reality collide! Let the urban adventures begin!",
          "Welcome, " + theusersname + "! The city's hidden magic is ready to be explored with you!",
          theusersname + " has arrived in our urban fantasy realm! Prepare for a blend of magic and modernity!",
          "Welcome to the enchanted metropolis, " + theusersname + "! The city lights are gleaming with magic!",
          theusersname + " has joined our urban fantasy world! Get ready for a magical cityscape full of surprises!",
          "Welcome to the land of myths and legends, " + theusersname + "! Prepare for a journey through epic tales and ancient lore!",
          theusersname + " has arrived in our mythical realm! The gods and heroes are eager to meet you!",
          "Welcome, " + theusersname + "! The mythical creatures and legendary beings are ready for your presence!",
          theusersname + " has entered the world of ancient myths! Time for legendary quests and magical stories!",
          "Welcome to our mythical fantasy world, " + theusersname + "! The epic adventures and divine legends await!",
          theusersname + " has joined the pantheon of myths! Prepare for an odyssey of epic proportions!",
          theusersname + ", be careful of DedZed the fish overlord"
          ];

        let psudorandomvar = GETPRNGF(welcomeMessages.length);
        let message = welcomeMessages[GETPRNGF(welcomeMessages.length)]; 

        if (theusersid === "3dbca1090fad5dff35543697ca007066") {message = "Bow to your King Seb eck the Mirror Creator"}; //  "Sebek"
        if (theusersid === "no-220a4b971b3edb376cbc956f5539b8a5") {message = "Big John is here everybody hide your snack packs"}; // Big John
        if (theusersid === "f8e9b8eed97623712f77f318fa35d7ce") {message = "Don't Die it's bad for your health, Waffle Man is here"}; // WaffleMan

        // speak(message);
      } else if (announcefirstrun) {
        announcefirstrun = false;
        timenow = Date.now(); // Sets Now to after a user has joined if first run is still true
      };
    };
  });
  
  announcerscene.On("user-left", e => {

    console.log("ANNOUNCER: LEFT USER: " + e.detail.name + " UID: " + e.detail.uid);
    if (e.detail.isLocal) {

    };

  });

  const scripts = document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    if (getAttrOrDefAgain(thescripts[i], "src", "") === scriptsource ) { 
        // const pAnnounce420 = getAttrOrDef(thescripts[i], "announce-420", "false");
        announce = getAttrOrDefAgain(thescripts[i], "announce", "true");
        announceevents = getAttrOrDefAgain(thescripts[i], "announce-events", "true");
        announce420 = getAttrOrDefAgain(thescripts[i], "announce-420", "false");
      };
    };
    loadevents();
    setTimeout(() => { load420(); }, 20000);


  announcerscene.On("one-shot", e => {
    console.log(e.detail);
    currentshot = e.detail;
    currentshotdata = JSON.parse(e.detail.data);
  
    const shotMessage = (message, volume) => {
      if (message) {
        console.log("shot message");
        let currentVolume = announceraudiovolume;
        announceraudiovolume = volume;
        speak(message);
        setTimeout(() => { announceraudiovolume = currentVolume; }, 4000);
      }
    };
  
    const shotAudioFile = (audiofile, volume) => {
      if (audiofile) {
        console.log("shot audio file");
        let currentVolume = announceraudiovolume;
        announceraudiovolume = volume;
        playaudiofile(audiofile);
        setTimeout(() => { announceraudiovolume = currentVolume; }, 4000);
      }
    };
  
    const shotMute = () => {
      if (currentshotdata.muteaudio) {
        console.log("shot mute");
        muteaudiofile();
      }
    };
  
    const isAdminOrLocalUser = e.detail.fromAdmin || e.detail.fromId === announcerscene.localUser.uid;
  
    if (isAdminOrLocalUser) {
      console.log(isAdminOrLocalUser ? "Current Shot is from Admin" : "Current Shot is from Local User");
      shotMessage(currentshotdata.message, 0.15);
      shotAudioFile(currentshotdata.audiofile, 0.10);
      shotMute();
    } else if (e.detail.fromId === "f67ed8a5ca07764685a64c7fef073ab9") {
        shotMessage(currentshotdata.message, 0.15);
        shotAudioFile(currentshotdata.audiofile, 0.10);
        shotMute();
    };
  });
    
// await scene.OneShot(JSON.stringify({message: "Example"}));
// await announcerscene.OneShot(JSON.stringify({message: "Words go here"}));
// await announcerscene.OneShot(JSON.stringify({audiofile: "http://firer.at/files/audio/BigJohn.wav"}));
// await announcerscene.OneShot(JSON.stringify({muteaudio: true}));
// await announcerscene.OneShot(JSON.stringify({muteaudio: false}));

};

function getAttrOrDefAgain (pScript, pAttr, pDefault) {
  if (pScript.hasAttribute(pAttr)) {
    return pScript.getAttribute(pAttr);
  } else {
    return pDefault;
  }
};

async function announcerobjectthing() {
announcerAudioSource = await announcerAudioObject.AddComponent(new BS.BanterAudioSource(announceraudiovolume, 1, false, false, true, true, true, false));
};
announcerobjectthing();
announcerloadtest();


async function playaudiofile(text) {
  if (readytospeak) {
    readytospeak = false
    announcerobjectthing();

    console.log("ANNOUNCER: Playing:", text);
    announcerAudioSource.PlayOneShotFromUrl(text);

    setTimeout(() => { readytospeak = true; }, 5000);
  } else {
    console.log("ANNOUNCER: Not Ready to Play:", text);
  };

};

var audiofilemuted = false
async function muteaudiofile(text) {
  if (audiofilemuted) {
    console.log("ANNOUNCER: UN-MUTED");
    audiofilemuted = false
    announcerAudioSource.mute = false
  } else {
    console.log("ANNOUNCER: MUTED");
    audiofilemuted = true
    announcerAudioSource.mute = true
  };

};