const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let runs = 0;
let balls = 0;
let ballsArray = []; // Array to store runs scored in each ball
let currentOver = 1;
let wickets = 0; // Track the number of wickets taken

function simulateRuns() {
    const normalRuns = [0, 1, 2, 3];
    const boundaries = [4, 6];

    const isChance = Math.random() < 0.7 // posibillites;
    const runs = isChance ? boundaries : normalRuns
    const size = runs.length;
    return runs[Math.floor(Math.random() * size)];
}


// Function to update runs and overs every second
function updateScoreboard() {
    balls += 1;
    const isWicket = Math.random() < 0.09; // 9% chance of wicket
    if (isWicket) {
        wickets++; // Increment wickets count
        io.emit('wicketTaken', wickets);

        // Check if all wickets are taken
        if (wickets === 10) {
            io.emit('matchFinished');
            clearInterval(scoreInterval); // Stop the interval if all wickets are taken
        }
    }

    const currentRun = isWicket ? 0 : simulateRuns()
    runs += currentRun; // Simulate runs scored randomly

    // Convert balls to overs
    const overs = Math.floor(balls / 6) + '.' + (balls % 6);

    // Emit updated data to all connected clients
    io.emit('updateScoreboard', { runs, overs, wickets });

    // Add runs scored to the balls array
    ballsArray.push(isWicket ? "W" : currentRun);
    console.log({ runsArray: ballsArray, isWicket })
    io.emit('updateBalls', { runsArray: ballsArray, isWicket });

    // If the over is completed, emit balls array to all connected clients and reset ballsArray
    if (balls % 6 === 0) {
        ballsArray = []; // Reset ballsArray for the next over
        currentOver++;
    }
}

// Update scoreboard every second
const THREE_SECONDS = 3 * 1000;
var scoreInterval = setInterval(updateScoreboard, THREE_SECONDS);

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const PORT = 9000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
