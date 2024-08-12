var container = document.getElementById("container");
var img = document.getElementById("img");
var title = document.getElementById("title");
var desc = document.getElementById("desc");

var progressText = document.getElementById("progressText");
var one = document.getElementById("one");
var two = document.getElementById("two");
var three = document.getElementById("three");
var progress = document.getElementById("progress");

let progressAnimationInterval;
let count = 1;
let url;

window.electronAPI.onMessage((event, message) => {
    if (message.command == "game") {
        url = message.data.url;
        container.style.display = "none";
        img.style.backgroundImage = "url(" + "https://solarus-games.org" + message.data.image + ")";
        title.innerText = message.data.name;
        desc.innerText = message.data.description;
        container.style.display = "flex";
    } else if (message.command == "progress"){
        progress.style.animation = "none";
        progress.style.filter = "drop-shadow(0 -4px 4px var(--primary-color))";
        progress.style.width = message.data.toString() + "%";
    } else if (message.command == "text"){
        progressText.innerText = message.data;
    } else if (message == "infiniteProgress"){
        progress.style.width = "10%";
        progress.style.animation = "moveProgressBar 3s infinite";
        progress.style.filter = "none";
    }
});

function watch(){
    window.electronAPI.sendMessage({command: "href", url: url});
}

function progressAnimation() {
    if(count == 0){
        one.style.opacity = "0";
        two.style.opacity = "0";
        three.style.opacity = "0";
    } else if(count == 1){
        one.style.opacity = "1";
        two.style.opacity = "0";
        three.style.opacity = "0";
    } else if(count == 2){
        one.style.opacity = "1";
        two.style.opacity = "1";
        three.style.opacity = "0";
    } else if(count == 3){
        one.style.opacity = "1";
        two.style.opacity = "2";
        three.style.opacity = "3";
        count = -1
    }

    count++;
}

setTimeout(function(){
    window.electronAPI.sendMessage("getGame");
}, 500);

setInterval(function(){
    window.electronAPI.sendMessage("getGame");
}, 5000);

progressAnimation();
progressAnimationInterval = setInterval(progressAnimation, 1000);