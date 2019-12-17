let competitorType = null;
let size = "auto";
let seeded = true;
let spotifyID = null;
let tournamentData = {
    "teams": [],
    "results": [],
};

let uriInput = document.getElementById("spotifyURI");
uriInput.addEventListener("input", updateSpotifyID);
uriInput.addEventListener("propertychange", updateSpotifyID);

let sizeInput = document.getElementById("size");
let node = document.createElement("option");
let text = document.createTextNode("Auto");
node.setAttribute("value", "auto");
node.appendChild(text);
sizeInput.appendChild(node);
for (let i = 1; i <= 10; i++) {
    let node = document.createElement("option");
    let text = document.createTextNode(Math.pow(2, i).toString());
    node.setAttribute("value", Math.pow(2, i).toString());
    node.appendChild(text);
    sizeInput.appendChild(node);
}

let createBracketButton = document.getElementById("getBracket");

updateSpotifyID();

function updateSize(sizeValue) {
    size = sizeValue
}

function updateSeeded(seededValue) {
    seeded = seededValue;
}

function updateSpotifyID() {
    let URI = uriInput.value;
    let validURI = false;
    if (/spotify:artist:\w+/.test(URI) || /https?:\/\/open.spotify.com\/artist\/\w+/.test(URI)) {
        validURI = true;
        competitorType = "album";
    }
    if (/spotify:playlist:\w+/.test(URI) || /https?:\/\/open.spotify.com\/playlist\/\w+/.test(URI)) {
        validURI = true;
        competitorType = "track";
    }
    if (validURI) {
        if (URI.startsWith("http")) {
            let splitURI = URI.split("/");
            spotifyID = splitURI[splitURI.length - 1].split("?")[0];
        } else {
            let splitURI = URI.split(":");
            spotifyID = splitURI[splitURI.length - 1];
        }
        createBracketButton.disabled = false;
    } else {
        spotifyID = null;
        createBracketButton.disabled = true;
    }
}

function getBracketData() {
    let xhttp = new XMLHttpRequest();

    xhttp.open("GET", "https://spotify-madness-api.herokuapp.com/bracket/" + competitorType + "?from=" + spotifyID + "&size=" + size + "&seeded=" + seeded);
    xhttp.onload = function () {
        if (xhttp.status >= 200 && xhttp.status < 400) {
            let data = JSON.parse(xhttp.responseText);
            tournamentData["teams"] = [];
            for (let i = 0; i < data.length; i++) {
                tournamentData["teams"].push([data[i].TopCompetitor.Title, data[i].BottomCompetitor.Title]);
            }
            $(function () {
                $('#tournament').bracket({
                    init: tournamentData,
                    save: function () {
                    },
                    centerConnectors: true,
                    disableScoring: true,
                    disableToolbar: true,
                    disableTeamEdit: true,
                    autoSizeTeamWidth: true,
                    skipConsolationRound: true,
                });
            });
        } else {
            console.log(xhttp.responseText);
        }
    };
    xhttp.onerror = function () {
        console.log(xhttp.responseText);
    };
    xhttp.send();
}
