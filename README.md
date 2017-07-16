# SmarterHospital
This repository contains Group 1's code for their Smarter Hospital, an ENGG1000 project. 

The project utilises an Arduino Yun which operates as the "brains". The webpanel is a simple means of monitoring all the sensors from the Arduino. 

# Setup

1. Clone this repo
2. Upload restAPI.ino to an Arduino Yun that is connected to the same network as your computer.
3. Change the API keys and IP address of the Yun in the webpanel's code where necessary. 
4. Open the webpanel

TODO: Note the ports for each sensor here. 

# Webpanel
Contains all the code for the web interface. Jquery handles API calling. NB that a browser with CORS extension is needed if running locally
(Otherwise a properly configured server can do the trick)

# Arduino
Contains Arduino code that is uploaded onto the Arduino. 

# CSS
This web panel uses the Materialize CSS framework

# JS Libraries
This repository uses PushoverJS (avaliable from https://github.com/rniemand/PushoverJS) as well as Alex Schneider's Pushbullet JS.

API Keys for these services will need to be subbed in if using. 

Both are used freely under the MIT licence. 
