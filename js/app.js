'use strict';

var newform = document.querySelector("#booking-form");

newform.addEventListener("submit", formValidation);

// Validating Form 
function formValidation(evt) {
    evt.preventDefault();
    console.log("Start!");
    var firstname = document.getElementById("firstname").value;
    var lastname = document.getElementById("lastname").value;
    var tel = document.getElementById("tel").value;
    var partysize = document.getElementById("partysize").value;
    var date = document.getElementById("date").value;
    var time = document.getElementById("time").value;
    
    // console.log(firstname);
    // console.log(lastname);
    // console.log(tel);
    // console.log(partysize);
    // console.log(date);
    // console.log(time);
    
    
    // Firstname validation
    if(firstname.value == ""){
        window.alert("Please enter your first name.");
        firstname.focus();
        return false;
    }
    
     // Lastname validation
    if(lastname.value == ""){
        window.alert("Please enter your last name.");
        lastname.focus();
        return false;
    }
    
    // Phone Number validation for (123) 123-1234 format
    // var matchPhone = /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/;  
    
    // if(tel.value.match == matchPhone){
    //     window.alert("Please enter your phone number in (123) 123-1234 format.");
    //     tel.focus();
    //     return false;
    // }
    
    // Party Size or Guests range validation from 1 to 12 
    if((partysize.value < 1) && (partysize.value>12)){
       window.alert("Please enter a partysize between 1 and 14 guests");
       partysize.focus();
       return false; 
    }
    
    // Time format validation for HH:MM format
    // var hourformat = /([1-2]\d)/;
    // var minuteformat = /([0-5]\d)/;
    
    // if(hour.value.match == hourformat){
    //     window.alert("Please enter your phone number in HH:MM [AM/PM] format");
    //     hour.focus();
    //     return false;
    // }
    
    // if(minute.value.match == minuteformat){
    //     window.alert("Please enter your phone number in HH:MM [AM/PM] format");
    //     minute.focus();
    //     return false;
    // }

    createBooking(date,partysize,time,firstname, lastname, tel);   
}

// Checking if the user exists in the database already

function doesUserExist(phone) {

        // Checking if user exists in the dB already (by tel phone)
       firebase.database().ref('users/').once('value', function(snapshot) {

        for (var key in snapshot.val()) {
            // skip loop if the property is from prototype
            if (!snapshot.val().hasOwnProperty(key)) continue;
            var obj = snapshot.val()[key];
            
            if(phone.localeCompare(obj['tel'])==0){
                console.log("Found!");
                return true;
            }
        }
     });
     return false;
}

// New User Input Call
function newUser(first, last, phone) {
    if(doesUserExist(phone)){
        console.log("User Already Exists!");
    }else{
        console.log("User Doesn't Exists!");
        createUser(first, last, phone);
    }
}
   
// Creating New User   
function createUser(first, last, phone) {    
    var result;
   
    // A new user entry
    var newUser = {
        firstname: first,
        lastname: last,
        tel: phone
   };
    
  // Get a key for a new user.
  var newUserKey = firebase.database().ref().child('users/').push().key;

  // Write the new user's data
  var updates = {};
    updates['users/' + newUserKey] = newUser;

  return firebase.database().ref().update(updates);
}

// Creating a new booking or a reservation
function createBooking(date, party, at, first, last, phone) {
    
    /** Getting the slot of time when the table would be booked
    
    Here we are trying to split the booking times into 'slots' or 'time slices'
    Restaurant Open Hours are from 11:00 to 9:00
    Ten hours of working is split into 10 time slots, starting from 1 to 10
    Each Slot signifies an hour 
    
    */
    var slot = divSlot(at);
    
    /** Getting the table type
      
     */
    var tabletype = getTableType(party);
    
     // A new booking entry    
     var newBooking = {
        firstname: first,
        lastname: last,
        tel: phone,
        partysize: party,
        time: at
   };
   
   // Checking if the booking is possible 
    firebase.database().ref('bookings/' + date + '/' + slot + '/' + tabletype + '/bookings/').once('value', function(snapshot) {
        
        if(snapshot.val()!=undefined){
            // Each Table Type at any given time slot has a maximum of 10 tables available for online booking
            if(((Object.keys(snapshot.val()).length)>10)){
            window.alert("All tables booked, choose a different time!");
            }
        } else {
            
        // Booking is possible, continuing with booking     
        // Get a key for a new booking. 
        var newBookingKey = firebase.database().ref().child('bookings/' + date + '/' + slot + '/' + tabletype + '/bookings/').push().key;

        // Write the new booking's data
        var updates = {};
        updates['bookings/' + date + '/' + slot + '/' + tabletype + '/bookings/' + newBookingKey] = newBooking;
        
        // For a group of four or more - average time spent in the resturant is 2 hours. 
        // Thus we update the booking in two time slots to block the table for multiple time slots
        if(party>4){
            slot += 1;
            updates['bookings/' + date + '/' + slot + '/' + tabletype + '/bookings/' + newBookingKey] = newBooking;
        }
        
        window.alert("Booking Successfully Done!");

        // Updating firebase database
        return firebase.database().ref().update(updates);            
       } 
    });   
}

// Splitting the time into slots
function divSlot(time) {
    var timeArr = time.split(":");
    return(timeArr[0]%10);
}

// Assigning the type of table depending on the number of guests or party size
// Classification:
// Guests       Table Type
// 1 or 2       Two Top
// 3 or 4       Four Top
// 5 to 14      Eight Top

function getTableType(party) {
    if(party<3) return 'twotop';
    else if(party<5) return 'fourtop';
    else return 'eighttop';
}


// Showcasing Availability as per the selected date, time and guests size
function showAvailability(date, party, at) {
    var slot = divSlot(at);
    var tabletype = getTableType(party);
    
    firebase.database().ref('bookings/' + date + '/' + slot + '/' + tabletype + '/bookings/').once('value', function(snapshot) {
        if(snapshot.val()!=undefined){
            var available = 10 - Object.keys(snapshot.val()).length;
            window.alert(available + " Tables Available");
        }else{
            window.alert("10 Tables Available!");
        }
    });
}


// Test Functions 

// showAvailability("06-05-2016","2","11:30");

// createBooking("07-05-2016","2","12:00","Foo", "Bar", "(425) 943-4141");

// createUser("John", "Vincent", "(425) 943-4242");

// newUser("John", "Vincent", "(425) 943-4242");
