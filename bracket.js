let competitorType = null;
let size = 2;
let seeded = true;
let spotifyID = null;
let rounds = [];
let matchups = [];
let bracket = document.getElementById("tournament");

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
    if (/spotify:user:\w+:playlist:\w+/.test(URI) || /https?:\/\/open.spotify.com\/user\/\w+\/playlist\/\w+/.test(URI)) {
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

function updateBracketData(winnerElement) {
    let gameID = winnerElement.className.split("-")[2];
    let nextGameID = Math.floor(gameID / 2);
    let top = gameID % 2 === 0;
    let roundNode = winnerElement.parentNode;
    let otherCompetitor = roundNode.getElementsByClassName(winnerElement.className.replace(top ? "game-top" : "game-bottom", top ? "game-bottom" : "game-top"))[0];
    if (otherCompetitor.innerHTML !== '&nbsp;') {
        let nextRound = parseInt(winnerElement.parentNode.id.split("-")[1]) + 1;
        let nextRoundID = "round-" + nextRound;
        let nextRoundElement = document.getElementById(nextRoundID);
        let nextCompetitorElement;
        if (nextRound === Math.log2(matchups.length) + 2) {
            nextCompetitorElement = nextRoundElement.getElementsByClassName("game-top game-0")[0];
        } else {
            if (top) {
                nextCompetitorElement = nextRoundElement.getElementsByClassName("game-top game-" + nextGameID)[0];
            } else {
                nextCompetitorElement = nextRoundElement.getElementsByClassName("game-bottom game-" + nextGameID)[0];
            }
        }
        nextCompetitorElement.textContent = winnerElement.textContent;
        //Clear future rounds
        for (let i = nextRound; i < rounds.length - 1; i++) {
            gameID = nextGameID;
            top = gameID % 2 === 0;
            nextRound = nextRound + 1;
            nextRoundID = "round-" + nextRound;
            nextRoundElement = document.getElementById(nextRoundID);
            if (nextRound === Math.log2(matchups.length) + 2) {
                nextCompetitorElement = nextRoundElement.getElementsByClassName("game-top game-0")[0];
            } else {
                if (top) {
                    nextCompetitorElement = nextRoundElement.getElementsByClassName("game-top game-" + nextGameID)[0];
                } else {
                    nextCompetitorElement = nextRoundElement.getElementsByClassName("game-bottom game-" + nextGameID)[0];
                }
            }
            if (nextCompetitorElement != null && nextCompetitorElement.firstChild != null) {
                nextCompetitorElement.firstChild.parentElement.innerHTML = '&nbsp;';
            }
        }
    }
}

function getBracketData() {
    let xhttp = new XMLHttpRequest();

    xhttp.open("GET", "http://localhost:8000/bracket/" + competitorType + "/auto?from=" + spotifyID + "&size=" + size + "&seeded=" + seeded);
    xhttp.onload = function () {
        if (xhttp.status >= 200 && xhttp.status < 400) {
            let data = JSON.parse(xhttp.responseText);
            matchups = [];
            rounds = [];
            for (let i = 0; i < Math.ceil(Math.log2(data.length) + 2); i++) {
                rounds.push([]);
                for (let j = 0; j < Math.floor(data.length / Math.pow(2, i)); j++) {
                    rounds[i].push([]);
                }
            }
            for (let i = 0; i < data.length; i++) {
                matchups.push([data[i].TopCompetitor, data[i].BottomCompetitor]);
            }
            rounds[0] = matchups;
            while (bracket.firstChild) {
                bracket.removeChild(bracket.firstChild);
            }
            for (let round of rounds) {
                let roundNode = document.createElement("ul");
                roundNode.className = "round";
                roundNode.id = "round-" + rounds.indexOf(round);
                for (let i = 0; i < round.length; i++) {
                    let gameSpacerNode = document.createElement("li");
                    gameSpacerNode.innerHTML = '&nbsp;';
                    gameSpacerNode.className = "game game-spacer";

                    let spacerNode = document.createElement("li");
                    spacerNode.innerHTML = '&nbsp;';
                    spacerNode.className = "spacer";

                    roundNode.appendChild(spacerNode);
                    let topCompetitorNode = document.createElement("li");
                    let topCompetitorTextNode;
                    if (round[i][0] != null) {
                        topCompetitorTextNode = document.createTextNode(round[i][0].Title);
                    } else {
                        topCompetitorTextNode = document.createTextNode("");
                        topCompetitorNode.innerHTML = '&nbsp;';
                    }
                    topCompetitorNode.className = "game game-top game-" + i;
                    topCompetitorNode.appendChild(topCompetitorTextNode);
                    roundNode.appendChild(topCompetitorNode);
                    if (!(topCompetitorNode.textContent === "Bye")) {
                        topCompetitorNode.setAttribute("onclick", "updateBracketData(this)");
                    }

                    roundNode.appendChild(gameSpacerNode);

                    let bottomCompetitorNode = document.createElement("li");
                    let bottomCompetitorTextNode;
                    if (round[i][1] != null) {
                        bottomCompetitorTextNode = document.createTextNode(round[i][1].Title);
                    } else {
                        bottomCompetitorTextNode = document.createTextNode("");
                        bottomCompetitorNode.innerHTML = '&nbsp;';
                    }
                    bottomCompetitorNode.className = "game game-bottom game-" + i;
                    bottomCompetitorNode.appendChild(bottomCompetitorTextNode);
                    roundNode.appendChild(bottomCompetitorNode);
                    if (!(bottomCompetitorNode.textContent === "Bye")) {
                        bottomCompetitorNode.setAttribute("onclick", "updateBracketData(this)");
                    }
                }
                if (round.length === 0) {
                    let topCompetitorNode = document.createElement("li");
                    topCompetitorNode.className = "game game-top game-0";
                    roundNode.appendChild(topCompetitorNode);
                } else {
                    let spacerNode = document.createElement("li");
                    spacerNode.innerHTML = '&nbsp;';
                    spacerNode.className = "spacer";
                    roundNode.appendChild(spacerNode);
                }
                bracket.appendChild(roundNode);
            }
            for (let i = 0; i < rounds[0].length; i++) {
                let firstRound = document.getElementById("round-0");
                let winner;
                if (rounds[0][i][0].Title === "Bye") {
                    winner = firstRound.getElementsByClassName("game-bottom game-" + i)[0];
                }
                if (rounds[0][i][1].Title === "Bye") {
                    winner = firstRound.getElementsByClassName("game-top game-" + i)[0];
                }
                if (winner != null) {
                    updateBracketData(winner);
                }
            }
        } else {
            console.log(xhttp.responseText)
        }
    };
    xhttp.onerror = function () {
        console.log("Failed to get bracket")
    };
    xhttp.send();
}
