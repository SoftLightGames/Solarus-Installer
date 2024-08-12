var background = document.getElementById("background");
var main = document.getElementById("main");
var components = document.getElementById("components");
var folder = document.getElementById("folder");

var nextBtn = document.getElementById("nextBtn");
var prevBtn = document.getElementById("prevBtn");
var installBtn = document.getElementById("installBtn");

var launcher = document.getElementById("launcher");
var quest_editor = document.getElementById("quest_editor");
var size = document.getElementById("size");

var path = document.getElementById("path");
var shortcut = document.getElementById("shortcut");
var disabledElem = document.getElementById("disabledElem");

let data;

let state = 1;
let nxt = false;
let prv = false;

let launcher_checked = false;
let quest_editor_checked = false;
let shortcut_checked = true;

window.addEventListener("load", function(){
    main.style.opacity = "1";
});

window.electronAPI.onMessage((event, message) => {
    if(message.command == "data") {
        data = message.data;
    } else if(message.command == "path") {
        path.innerText = message.data;
    } else if (message == "cancel") {
        disabledElem.style.display = "none";
    } else if (message == "installing"){
        disabledElem.style.opacity = ".2";
        prevBtn.disabled = true;
        installBtn.disabled = true;
        document.getElementById("footer").style.cursor = "wait";
    }
});

launcher.addEventListener("change", function(){
    launcher_checked = launcher.checked;
    calcSize();
});

quest_editor.addEventListener("change", function(){
    quest_editor_checked = quest_editor.checked;
    calcSize();
});

shortcut.addEventListener("change", function(){
   shortcut_checked = shortcut.checked;
});

function install() {
    disabledElem.style.display = "block";
    window.electronAPI.sendMessage({
        command: "install",
        launcher: launcher_checked,
        quest_editor: quest_editor_checked,
        shortcut: shortcut_checked
    });
}

function browse(){
    window.electronAPI.sendMessage("setPath");
}

function aroundSize(number) {
    const megabytes = number / (1024 * 1024);
    return megabytes.toFixed(2);
}

function calcSize(){
    if (launcher_checked && !quest_editor_checked){
        size.innerText = aroundSize(data.solarus_launcher_data.size + 70000000);
    } else if (launcher_checked && quest_editor_checked){
        size.innerText = aroundSize(data.solarus_quest_editor_data.size + 70000000);
    } else if (!launcher_checked && quest_editor_checked){
        size.innerText = aroundSize(data.solarus_quest_editor_data.size + 68000000);
    } else if (!(launcher_checked && quest_editor_checked)){
        size.innerText = "_";
    }

    if (!launcher_checked && !quest_editor_checked){
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

function switchPage(){
    nextBtn.disabled = true;
    prevBtn.disabled = true;
    installBtn.disabled = true;

    if(state > 1){
        document.body.style.backgroundImage = "url('../../src/img/background.png')";
        background.style.display = "block";
    } else {
        document.body.style.backgroundImage = "url('../../src/img/homepage-cover.webp')";
        background.style.display = "none";
    }

    if(state == 3){
        nextBtn.style.display = "none";
        installBtn.style.display = "block";
    } else {
        nextBtn.style.display = "block";
        installBtn.style.display = "none";
    }

    if (state == 2 && nxt) {
        window.electronAPI.sendMessage("getData");
        main.style.transform = "translateX(-100%)";
        setTimeout(function(){
            main.style.display = "none";
            components.style.display = "flex";
        }, 1000);
    } else if (state == 1 && prv) {
        components.style.transform = "translateX(100%)";
        setTimeout(function(){
            components.style.display = "none";
            main.style.display = "flex";
        }, 1000);
    } else if (state == 3 && nxt) {
        components.style.transform = "translateX(-100%)";
        setTimeout(function(){
            components.style.display = "none";
            folder.style.display = "flex";
        }, 1000);
    } else if (state == 2 && prv) {
        folder.style.transform = "translateX(100%)";
        setTimeout(function(){
            folder.style.display = "none";
            components.style.display = "flex";
        }, 1000);
    }

    setTimeout(() => {
        main.style.transform = "translateX(0)";
        components.style.transform = "translateX(0)";
        folder.style.transform = "translateX(0)";

        nextBtn.disabled = false;
        installBtn.disabled = false;
        prevBtn.disabled = false;

        if(state == 2 && !launcher_checked && !quest_editor_checked){
            nextBtn.disabled = true;
        }

        if(state == 1) {
            prevBtn.disabled = true;
        }
    }, 1100);
}

function previous(){
    prv = true;
    nxt = false;
    state--;
    switchPage();
}

function next(){
    nxt = true;
    prv = false;
    state++;
    switchPage();
}

function openSolarusWebsite(){
    window.electronAPI.sendMessage({command: "href", url: "https://solarus-games.org/"});
}