# Texplorer instructions

This is a brand new, empty React application. It's time to implement it.

## Overview

This is going to be a static site that allows users to play text adventure games I write in their browser.

## UI

The layout of the page will be simple: a menu bar at the top with the title of the website and the selected game (if one is selected) with a few links on the top right corner like Help which shows a modal with instructions.

Under the menu bar will be a terminal interface where the user will interact with the site. All actions, including listing games, selecting a game, and playing the game will be done through this terminal interface.

The style of the site should look like the VS Code interface.

The text output by the game and the user input should be different colors.

## System Architecture

I want the game logic of the application code to be separated from the UI as much as possible. This will make testing the game code easier because I won't need to open a browser to test it.

Also, if I wanted to, I could easily port the application to a terminal app, a desktop app, mobile app, etc.

Follow SOLID and DRY principles in the design of the application.

## Game Architecture

Design a text adventure game engine that is flexible enough to support a variety of games I may write. I would like to define games using YAML files where possible. I should be able to define rooms, long and short descriptions, items, special item abilities, barriers, and NPCs in the YAML files of the games. Each game may have multiple yaml files for each of these components.

Use 3rd party libraries where appropriate, for example for the natural language processing of user input.

For the intial implementation, generate two very simple games to demonstrate the functionality of the engine-- each game should have only about 10-15 connected rooms:

### Mine Explorer

A Colossal Cave style game with a bird in one room, a cage in another, and a dragon in another. The bird goes in the cage when you enter the room with it. The dragon flees when you drop the cage and the bird flies out. When the dragon flees, it reveals a door you couldn't enter before. That door leads to a maze. On the other end of the maze is a treasure room. When you reach the treasure room, you win.

### Space Quest

You're in a spaceship navigating between sectors of space. Only a few rooms-- this game is mainly to test loading multiple games.

## Testing

I want unit tests for individual components. I also want an integration test that loads a game into memory and interacts with it to make sure the game logic is working. I will also want an end-to-end test that runs the application in a headless browser and interacts with it to make sure the UI is working (but don't implement this yet).

## AI Development

As you implement the application, periodically run it in the browser and interact with it via the playwright MCP to check the behavior of the application.

Remember that running the Reach application from the CLI will block the terminal until Ctrl + C is pressed. So if you try to run that command and evaluate the output, you will get stuck.

Come up with a detailed implementation plan and get my approval before starting to write code.
