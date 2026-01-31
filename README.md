# Movie-Wheel Discord Bot

## What is this Bot?
This Bot Simulates the functionality of a Digital Movie-Wheel or Movie-Spinner. 
It was designed so that me and my friends could all have the ability to add and store movie night suggestions, and then get a random movie to watch on movie night.

## How Does it Work?
This is a discord bot that lives in a server.
It stores a list of movies to be watched.
And, it can store multiple different lists of movies.
The each list of movies lives persistantly, being stored to a induvidual unique save file.

The user can use the bot by using the following slash command:

### /movie-menu
- Brings up the Discord Bot UI

## How do we create or select a Wheel?
The user will first be greeted with a dropdown menu, or select menu.
From here, the user can select a particular list of stored movies to interact with (a wheel)
Or, if this is their first time or they want to make a new wheel, they can create and name a new Wheel from the meny'

## How do we interact with a wheel
There are four easy to use buttons.

### Add Button
When clicked on, the user can add a movie to their current movie wheel by typing in its name. 
The user can add any name they want, as long as the same name does not already exist in the current movie wheel

### Remove Button
When clicked on, the user can remove a movie from their current movie wheel by typing in its name. 
The bot will catch and prevent attempts to remove non-existant movies in the current wheel

### List Button
When clicked on, the user can see all the movies currently in the wheel

### Spin Button
When clicked on, the user will randomly get a movie from their current movie wheel
The selected movie is then removed from the wheel

## Note:
When a movie is added, the bot will also store the username of the person who added the movie
Similarily, if a movie wheel is spun, then when the movie is retrieved, the name of the user who added the movie is also displayed by the bot
