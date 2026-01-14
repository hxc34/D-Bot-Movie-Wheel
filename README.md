# Movie-Wheel Discord Bot

## What is this Bot?
This Bot Simulates the functionality of a Digital Movie-Wheel or Movie-Spinner. 
It was designed so that me and my friends could all have the ability to add and store movie night suggestions, and then get a random movie to watch on movie night.

## How Does it Work?
This is a discord bot that lives in a server.
It stores a list of movies to be watched.
The list of movies lives persistantly, being stored to a save file.

The user can use four slash commands:

### /movie-add [MOVIE_NAME_HERE]
- Add the specified movie to the wheel, if it does not already exist in the wheel
- If the movie did not exist in the wheel, the user will be told that the movie was sucessfully added
- If the movie did exist in the wheel, the user will be told that the movie is already in the wheel

### /movie-remove [MOVIE_NAME_HERE]
- Remove the specified movie from the wheel, if it exists in the wheel
- If the movie did not exist in the wheel, the user will be told that the movie does not exist
- If the movie did exist in the wheel, the user will be told that the movie was sucessfully removed

### /movie-list
- Return a list of movies stored in the wheel, if any

### /movie-spin
- Spins the wheel to retrun a random movie, and removes that movie from the wheel
- If no movies exist in the wheel, it will inform the user there is no movie to pick
