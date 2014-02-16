Infrastructure
==============
* handle disconnect on client
    * show message if connection lost with server
    * on reconnect emit 'subscribe' event
* sent/delivered/read receipts

Basic
=====
* timestamps
* page title includes domain and room name
* changed header and footer to absolute (with parent relative) at some min-height
* click dates to show full dates
* data algorithm
    - same day: show time
    - same week: show weekday and time
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
   - disable submit button until room is checked for password and inputs are valid
* show number of people currently in room
* use HTML5 keygen attribute to encrypt messages
