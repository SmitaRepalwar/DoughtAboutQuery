const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

module.exports = app.get("/players/", async (request, response) => {
  const getPlayersDetails = `
       SELECT * FROM cricket_team
    `;
  const teamList = await db.all(getPlayersDetails);
  response.send(
    teamList.map((eachPlayer) => ({ playerName: eachPlayer.player_name }))
  );
});

module.exports = app.post("/players/", async (request, response) => {
  let toPostQuery = request.body;
  const { playerName, jerseyNumber, role } = toPostQuery;
  const postQuery = `
        INSERT INTO cricket_team (player_name, jersey_number, role)
        VALUES ('${playerName}', '${jerseyNumber}', '${role}');
    `;
  await db.run(postQuery);
  response.send("Player Added to Team");
});

module.exports = app.get("/players/:playerId/", async (request, response) => {
  const playerId = request.params;
  const getQuery = `SELECT * FROM cricket_team WHERE player_id = '${playerId}' ;`;
  const playerList = await db.all(getQuery);
  response.send(
    playerList.map((eachPlayer) => ({ playerName: eachPlayer.player_name }))
  );
});

module.exports = app.put("/players/:playerId/", async (request, response) => {
  const playerId = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const putQuery = `UPDATE cricket_team 
                      SET player_name = '${playerName}', 
                           jersey_number = '${jerseyNumber}', 
                           role = '${role}'
                      WHERE player_id = '${playerId}';`;
  await db.run(putQuery);
  response.send("Player Details Updated");
});

module.exports = app.delete(
  "/players/:playerId/",
  async (request, response) => {
    const playerId = request.params;
    const deleteQuery = `DELETE FROM cricket_team WHERE player_id = '${playerId}';
    `;
    await db.run(deleteQuery);
    response.send("Player Removed");
  }
);
