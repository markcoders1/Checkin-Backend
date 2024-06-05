//! NOTE: this is where algorithms and strategies will be written down in order to keep the rest of the files clean

//head frontend
    //ToDo login loader
        //* add a loader to the button so that it tells the user that server is processing the request
    //ToDo logout prompt
        //* simple custom popup
    //ToDo break reminder
        //* will need to experiment with notifications from browser
    //ToDo stay logged in
        //* frontend will store token in redux
    //ToDo remember me deletion after logout
        //* clean cookies upon logout
    //ToDo location validation using gps
        //* google geolib npm module
        //* latitude and longetude of Markcoders (24.899659, 67.109078)
    
//head backend
    //ToDo failed log in attempts
        //* will need its own database collection
        //* frontend sends email and password
        //* if password incorrect, x number of times, user cannot login anymore for a set amount of time
    //ToDo log out after a period of time
        //* session IDs, will need to experiment with jwt expiry
    //ToDo edit user profile as user
        //* there are three ways to do this

        //* 1. to make multiple apis, one for each field
        //* 2. to make one api, with many if conditionals to change all
        //* 3. make one api that updates everything all at once, even if nothing has changed
    //ToDo update user details as admin
        //* same as above
    //ToDo account activity monitoring
        //* add account logs for each user on a seperate database model
    //ToDo additional information
        //* image
            //* will need S3 server
        //Done active/inactive
    //ToDo google account
        //! not possible due to the nature of the registration feature
        
//head hybrid
    //ToDo password strength as user
        //! not possible due to admin registration
        //* possible on change password
    //ToDo log out from all devices
        //* will need frontend device parser
        //* google ua-parser-js

//? total time spent in office for a specific time period
//? total time spent in break for a specific time period
//? total net time for a specific time period
//? required total time for a specific time period
//? efficiency Percentage based on the formula: total net time spent in office/expected total net time spent in office*100

//Done login using email password
//Done reset password
//Done password secure
//Done login error messages
//Done log out
//Done list of all users as admin
//Done view user profile as user
//Done change password
//Done break start
//Done break end
//Done break time summaries
//Done break reports
//Done check in
//Done check out
//Done attendance records as admin
//Done personal attendance history
//Done 6/6/24 generating a pdf using the data as a user
//Done 6/6/24 generating a pdf using the data as an admin
//Done 6/6/24 deactivate user account
    //* add active status on the user model