// This script was taken from https://vidya.sdq.st/say-names.js and https://best-v-player.glitch.me/say-names.js
const welcomeMessages = [
    ", What the hell, you broke everything, it was just working, what did you do?!",
    " welcome message blah blah!",
    " has joined, what will they do now?",
    " was pushed into a portal, quick call the police",
    ", be careful of DedZed the fish overlord"
  ];


// Main Speak Function, Thank you Elin and everyone
let username = "";

async function speak(m) {
  console.log("saying:" + m);
  var msg = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  msg.voice = voices[2];
  console.log("Message Voice:" + voices[2]);
  msg.voiceURI = "native";
  msg.volume = 0.2;
  msg.rate = 1;
  msg.pitch = 0.8;
  msg.text = m;
  msg.lang = 'en-US';
  speechSynthesis.speak(msg);
}


// async function speak(text) {
//   console.log("saying:", text);
//   const welcome = await fetch('https://speak-something.glitch.me/say/' + text);
//   const url = await welcome.text();
//   let audio = new Audio("data:audio/mpeg;base64," + url);
//   audio.autoplay = true;
//   audio.play();
//   audio.volume = 0.08;
// };

// This function upon a user joining will select a random welcome message and call the speak function to say it
if(window.isBanter) {
  const now = Date.now();
  window.userJoinedCallback = async user => {
    if(Date.now() - now > 10000) {
      let randommessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      username = (user.name ? user.name : user.id.substr(0, 6));
      const message = username + " " + randommessage; 
      await speak(message);
    };
  }
};

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
let announceevents = true;
if(window.isBanter && announceevents === true) {
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


// Welcome message for user entering the space
window.loadDoneCallback = () => {
    // if(window.isBanter) {
    //     const username = (user.name ? user.name : user.id.substr(0, 6));
    //     let themessage = "Oh no, you broke everything " + username + " now what will we do"; 
    //     speak(themessage);
    //     console.log("Just testing, this should run after load done");
    // };
    console.log("Just testing, this should run after load done");
};

const scene = BS.BanterScene.getInstance();

scene.On("loaded", () => {
    console.log("TEST TEST TEST, this should run after scene load");
})

scene.On("unity-loaded", () => {
    setTimeout(() => { 

      username = (user.name ? user.name : user.id.substr(0, 6));
      
      const joinMessages = [
        username + ", What the hell, you broke everything, it was just working, what did you do? ",
        "Hello, Welcome to the space " + username,
        "What are you doing here " + username,
        "Enjoy your stay " + username
      ];
  
      let randommessage = joinMessages[Math.floor(Math.random() * joinMessages.length)];
      // let themessage = randommessage; 
      speak(randommessage);
    }, 8000);
    console.log("Just testing, this should run after unity scene load");
    console.log("unity-loaded Test user Id: " + window.user.id);
})


if(window.isBanter) {
    setTimeout(() => { 
        console.log("Test user Id: " + window.user.id);
    }, 10000);
};
