# Mobile Support

Make the game playable on mobile.

## TODO

If user is on mobile / tablet:

* Figure out a way to reliably tell if a user is on mobile / tablet
* Render the game in landscape mode
* UI Adjustments:
  * Generally make the UI smaller
  * Move the action buttons from bottom center to right, bottom of the screen (so that the right thumb can reach the buttons easily)
    * The action buttons should be split up into two parts: 1 button and 2 on top, 3 and 4 on the bottom
  * Add jump button to the group
* Use library: `react-joystick-component` 
  * Display the joystick when the user presses in the bottom left area of the screen (make it the size of 50% of the viewport)
  * Don't display the joystick if the user isn't pressing the area
  * Make it gray and opacity 80%
  * Move the current character when the joystick is pressed in any direction