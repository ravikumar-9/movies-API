const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

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
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const convertDbObjectToResponseObjects = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (eachDirector) => {
  return {
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  };
};

// Get Movies API

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      *
    FROM
      movie
    ORDER BY
      movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

// POST Movies API

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMoviesQuery = `
    INSERT INTO
    movie
      (director_id,movie_name,lead_actor )
    VALUES(
        '${directorId}',
         '${movieName}',
          '${leadActor}'
    )
    ;`;
  await db.all(addMoviesQuery);
  response.send("Movie Successfully Added");
});

//GET Movie API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `
    SELECT *
    FROM 
    movie
    WHERE
    movie_id=${movieId};`;
  const movieArray = await db.get(movieQuery);
  response.send(convertDbObjectToResponseObjects(movieArray));
});

// UPDATE Movie API
app.put("/movies/:movieId/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
    movie
     SET
     director_id='${directorId}',
     movie_name='${movieName}',
     lead_actor='${leadActor}'
     WHERE 
     movie_id='${movieId}';`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE Movie API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
   DELETE
    FROM 
    movie
    WHERE
    movie_id=${movieId};`;
  await db.get(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET Director API

app.get("/directors/", async (request, response) => {
  const { directorId } = request.params;
  const directorQuery = `
    SELECT *
    FROM 
    director
   ;`;
  const directorArray = await db.all(directorQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

// Get Movies API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie NATURAL JOIN director
    WHERE director_id='${directorId}'
    ORDER BY
      movie_id   
    ;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

module.exports = app;
