//! NOTE: this is where algorithms and strategies will be written down in order to keep the rest of the files clean

//head frontend
    //ToDo break reminder
        //* will need to experiment with notifications from browser

    //ToDo location validation using gps
        //* google geolib npm module
        //* latitude and longetude of Markcoders (24.899659, 67.109078)
        //* will need to sign a jwt with a secret code, which then the backend will decode and then validate the check in check out
    //ToDo logout specific devices
    
//head backend
    //ToDo account activity monitoring
        //* add account logs for each user on a seperate database model
    //ToDo get all devices user
    //ToDo get login/logout logs
    //ToDo add API to see a specific user's all logged in devices
    //ToDo when refresh token is expired or not ,of a current device it still gets forwarded, 
        // make it so that if its valid only then forward it, if it is expired then generate a new one and then forward it  

//head hybrid

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
//Done 7/6/24 log out after a period of time
    //* session IDs, will need to experiment with jwt expiry
//Done 7/6/24 remember me deletion after logout
    //* clean cookies upon logout
//Done forget checkout
    //* run every 6 hours and check using Easycron cron job
    //* if any user has been checkin for 15 hours, make them checkout through cron
    //* flag their checkin  
    //! missing: to not include the flagged attendance while calculating average
//Done edit user profile as user
    //* made one Api that accepts atleast one from (firstName, lastName, CNIC , DOB, phone) and updates current user
//Done update any user details as admin
    //* made one Api that accepts id and atleast one other field and updates it (except password, status, active, image, _id)
//Done delete user 
    //* made one Api for admin that takes id of any user and deletes said user along with their attendance
//Done get user information as admin
//Done toggle user account active/inactive state
    //* "/api/admin/toggleUserAccount?userId=xyz"
//Done add errors on registration page
//Done add companyId on registration page
//Done login loader
    //* add a loader to the button so that it tells the user that server is processing the request
//Done logout prompt
    //* simple custom popup
//Done password reset with link
    //* reset password 
    //* server makes a new token with payload and secret 
    //* email that token in url form
    //* that url hits an api for get request 
    //* params will return token 
    //* verify then check if its in database the token
    //* verify then delete then change password 
//Done stay logged in
    //* frontend will store token in localstorage
//Done password strength as user
    //*  add password complexity check in joi at registerUser and changePassword
//Done log out from all devices
    //* will need frontend device parser
    //* google ua-parser-js
//Done failed log in attempts
    //* will need its own database collection
    //* frontend sends email and password
    //* if password incorrect, x number of times, user cannot login anymore for a set amount of time