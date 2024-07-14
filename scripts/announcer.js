// This script was taken from https://vidya.sdq.st/say-names.js and https://best-v-player.glitch.me/say-names.js
const welcomeMessages = [
    ", What the hell, you broke everything, it was just working, what did you do?!",
    " welcome message blah blah!",
    " has joined, what will they do now?",
    " was pushed into a portal, quick call the police",
    ", be careful of DedZed the fish overlord"
];
  
// Say Names, Thank you Elin and everyone
if(window.isBanter) {
    const now = Date.now();
    window.userJoinedCallback = async user => {
        if(Date.now() - now > 30000) {
        let randommessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        const name = (user.name ? user.name : user.id.substr(0, 6));
        const welcome = await fetch('https://say-something.glitch.me/say/' + name + randommessage);
        console.log("saying: " + name + random1);
        const url = await welcome.text();
        const audio = new Audio("data:audio/mpeg;base64," + url);
        audio.autoplay = true;
        audio.play();
        audio.volume = 0.08;
        }
    }
};