var language;
var source_url_en = "https://solarus-games.org/";
let source_url;

async function fetchJSON(source, url) {
    try {
        const response = await fetch(source + url + "/index.json");
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

async function sendRequests(){
    const solarus_launcher_data = await fetchJSON(source_url_en, "download/solarus-launcher/windows");
    const solarus_quest_editor_data = await fetchJSON(source_url_en, "download/solarus-quest-editor/windows");
    const solarus_games_data = await fetchJSON(source_url, "games");

    window.electronAPI.sendMessage({
        command: "setData",
        data: {
            solarus_games_data: solarus_games_data.data,
            solarus_launcher_data: solarus_launcher_data.data,
            solarus_quest_editor_data: solarus_quest_editor_data.data
        }
    });
}

window.electronAPI.sendMessage("getLanguage");

window.electronAPI.onMessage((event, message) => {
    if(message == "fr") {
        source_url = source_url_en + "fr/";
        sendRequests();
    } else if(message == "en") {
        source_url = source_url_en;
        sendRequests();
    }
});


