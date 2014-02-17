Infrastructure
==============
* build control messages
    * design control look and feel of control messages (<em>? centered?)
* sent/delivered/read receipts

Basic
=====
* page title includes domain and room name
* changed header and footer to absolute (with parent relative) at some 
  max-height (320px?)
* animation: click dates to show full dates
* scroll to new message if user's scroll position is within one message of the 
  bottom
* data algorithm (look at using date.js)
    - 0 - 5 minutes ago: nothing
    - 0 - 1 hour ago: minutes ago
    - 1 - 1.5 hours ago: 1 hour ago
    - 1.5 - 2 hours ago: 2 hours ago
    - same day: show time
    - 3 days ago: show weekday and time
    - same month: show month/date
    - same year: show month/date
    - different year: show month/date/year


Storage
=======
* Password protected rooms:
    - check if room exists before submitting
    - require password if needed
        - show password box with help message only if room requires it
        - showing loading icon after typing in room name? or
        - only show icon on error
   - disable submit button until room is checked for password and inputs are 
     valid
* show number of people currently in room
* use HTML5 keygen attribute to encrypt messages
