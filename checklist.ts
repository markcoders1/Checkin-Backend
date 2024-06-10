//! NOTE: this is where algorithms and strategies will be written down in order to keep the rest of the files clean

//head frontend
    //ToDo login loader
        //* add a loader to the button so that it tells the user that server is processing the request
    //ToDo logout prompt
        //* simple custom popup
    //ToDo break reminder
        //* will need to experiment with notifications from browser
    //ToDo stay logged in
        //* frontend will store token in localstorage
    //ToDo location validation using gps
        //* google geolib npm module
        //* latitude and longetude of Markcoders (24.899659, 67.109078)
        //* will need to sign a jwt with a secret code, which then the backend will decode and then validate the check in check out
    //ToDo get user information as admin
    //ToDo toggle user account active/inactive state
        //* "/api/admin/toggleUserAccount?userId=xyz"
    //ToDo add errors on registration page
    //ToDo add companyId on registration page
    //ToDo add Image on registration page
    
//head backend
    //ToDo failed log in attempts
        //* will need its own database collection
        //* frontend sends email and password
        //* if password incorrect, x number of times, user cannot login anymore for a set amount of time

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
    //ToDo forget checkout
        // * run every 6 hours and check
        // if any user has been checkin for 15 hours, make them checkout through cron
        // flag their checkin so its duration is not counted in average
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
//? admin can check in/ check out/break in/ break out for any user

//Done login using email password
//Done reset password
//Done password secure
//Done login error messages
//Done log out
//Done list of all users as admin
//Done view user profile as user
//Done change password
    //! not done in frontend
//Done break start
//Done break end
//Done break time summaries
//Done break reports
//Done check in
//Done check out
//Done attendance records as admin
//Done personal attendance history
//Done 6/6/24 generating a pdf using the data as a user
    //! not done in frontend
//Done 6/6/24 generating a pdf using the data as an admin
    //! not done in frontend
//Done 6/6/24 deactivate user account
    //* add active status on the user model
    //! not done in frontend
//Done 7/6/24 log out after a period of time
    //* session IDs, will need to experiment with jwt expiry
//Done 7/6/24 remember me deletion after logout
    //* clean cookies upon logout