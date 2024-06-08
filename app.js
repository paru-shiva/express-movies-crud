const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

const filepath = path.join(__dirname, 'moviesData.db')

let db = null

const startDbServer = async () => {
  db = await open({
    filename: filepath,
    driver: sqlite3.Database,
  })
}

startDbServer()

/********************** TEST API ************************/

app.get('/', async (req, res) => {
  res.send(await db.all(`select * from movie order by movie_id desc`))
})

/********************** API - I ************************/

app.get('/movies/', async (req, res) => {
  const movieNamesQuery = `select movie_name from movie`
  let movieNames = await db.all(movieNamesQuery)

  const formatResult = movieObj => {
    return {
      movieName: movieObj.movie_name,
    }
  }

  movieNames = movieNames.map(eachObj => {
    return formatResult(eachObj)
  })

  res.send(movieNames)
})

/********************** API - II ************************/

app.post('/movies/', async (req, res) => {
  let lastId = (
    await db.all(`select * from movie order by movie_id desc limit 1`)
  )[0].movie_id

  let presentId = lastId + 1

  const addMovieQuery = `insert into movie values (${presentId}, ${req.body.directorId}, '${req.body.movieName}', '${req.body.leadActor}')`
  console.log(addMovieQuery)
  await db.run(addMovieQuery)
  res.send('Movie Successfully Added')
})

/********************** API - III ************************/

app.get('/movies/:movieId/', async (req, res) => {
  let {movieId} = req.params
  let queryToDisplayMovie = `select * from movie where movie_id = ${movieId};`
  let result = [await db.get(queryToDisplayMovie)]
  const formatDetails = obj => {
    return {
      movieId: obj.movie_id,
      directorId: obj.director_id,
      movieName: obj.movie_name,
      leadActor: obj.lead_actor,
    }
  }
  console.log(result)

  res.send(
    result.map(eachObj => {
      return formatDetails(eachObj)
    })[0],
  )
})

/********************** API - IV ************************/

app.put('/movies/:movieId/', async (req, res) => {
  let {movieId} = req.params
  console.log(movieId)
  let queryToDisplayMovie = `update movie set director_id = ${req.body.directorId}, movie_name = '${req.body.movieName}', lead_actor = '${req.body.leadActor}' where movie_id = ${movieId};`
  let result = await db.get(queryToDisplayMovie)
  res.send('Movie Details Updated')
})

/********************** API - V ************************/

app.delete('/movies/:movieId/', async (req, res) => {
  let {movieId} = req.params
  console.log(movieId)
  let queryToDisplayMovie = `delete from movie where movie_id = ${movieId};`
  let result = await db.run(queryToDisplayMovie)
  res.send('Movie Removed')
})

/********************** API - VI ************************/

app.get('/directors/', async (req, res) => {
  const movieDirectorsCmd = `select * from director`
  let movieDirectors = await db.all(movieDirectorsCmd)

  const formatResult = movieObj => {
    return {
      directorId: movieObj.director_id,
      directorName: movieObj.director_name,
    }
  }

  movieDirectors = movieDirectors.map(eachObj => {
    return formatResult(eachObj)
  })

  res.send(movieDirectors)
})

/********************** API - VII ************************/

app.get('/directors/:directorId/movies/', async (req, res) => {
  let {directorId} = req.params
  let directorMoviesQuery = `select movie_name from movie where director_id = ${directorId}`
  let result = await db.all(directorMoviesQuery)
  const myfunc = objGiven => {
    return {
      movieName: objGiven.movie_name,
    }
  }
  res.send(
    result.map(eo => {
      return myfunc(eo)
    }),
  )
})

app.listen(3000, () => console.log('Server Started.'))
module.exports = app
