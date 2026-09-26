# Simple Chat

Add a simple chat.

* Display the chat on the left bottom corner
* Put the dev performance overlay on top of the chat
* Pressing enter, opens the chat and puts the focus on the input
* After typing a message, make enter write that message and keep focus on the input
* Keep the chat messages for 12 hours and delete all chat messages that are older than that
* Per default it writes messages to the room map (world in world, inside dungeon if in a dungeon).
* /sit, /walk or whatever animations are available on the low poly character asset 
* /party writes the message into the group that the user is a part of
  * Output a message when user is alone and writes to /party with the content: "You are not in a group, nobody can see your message".
* Make it possible to whisper to another user with: /whisper "{name}" {messageContent}
  * Don't forget to add quotes around the name.
  * On left click on another player it should display "Whisper" which opens the chat and prefills the chat with: /whisper {name} 
* Save the messages into a dedicated mongodb collection
* Filter the messages collection based on whispers etc. (make sure the user only sees messages they have access to)