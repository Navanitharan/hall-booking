const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());
const PORT = 5000;
const roomData = [];
const customerData=[];

app.get("/",(req,res)=>{
    res.send("Hello World!")
})

//API to Create the Halls
app.post("/createRoom",(req,res)=>{    
    const roomDetails = req.body;

    let newRoom= {...roomDetails,
                        roomid:`${roomData.length}`,
                        roomName:`room${roomData.length}`,
                        bookedStatus:"Not Booked"

                    }

    roomData.push(newRoom);

    res.json(newRoom);
})

//API to book the Halls
app.post("/bookRoom",(req,res)=>{
    const booking_dtl = req.body;
    const roomidTOBook = booking_dtl.roomid
    console.log("Roomid to book :",roomidTOBook)

    const roomToBook = roomData.find(room => room.roomid == roomidTOBook)
    //Check that the room is present
    if(!roomToBook){
        return res.status(404).json({error:"Room not found"});
    }
    //Condition to check that the room is available to book
    else if (roomToBook.bookedStatus === "booked"){
        let roomTOCheck=customerData.find((customer)=>customer.roomid === roomToBook.roomid )

        if(roomTOCheck.date === booking_dtl.date &&
            ((booking_dtl.startTime >= roomTOCheck.startTime && booking_dtl.startTime < roomTOCheck.endTime) ||
             (booking_dtl.endTime > roomTOCheck.startTime && booking_dtl.endTime <= roomTOCheck.endTime) ||
             (booking_dtl.startTime < roomTOCheck.startTime && booking_dtl.endTime > roomTOCheck.endTime))){
            return res.status(404).json({error:"Room not available"});
        }
    }
    // if the room is available it will change the status to booked
    roomToBook.bookedStatus = "booked";

    let newCustomer = {...booking_dtl,
                        customerid:`${customerData.length}`,
                        bookedDate: new Date(Date.now()),
                        bookingId:`${customerData.length+1}`
    }

    newCustomer.startTime=parseFloat(booking_dtl.startTime);
    newCustomer.endTime=parseFloat(booking_dtl.endTime);

    customerData.push(newCustomer);

    console.log("Booking Successfull ✅")

    res.json(newCustomer);
})
//API to list all the Halls
app.get("/allrooms",(req,res)=>{
    let bookedCustomer;
    let result = roomData.map((room)=>
        {   
            let {roomid,roomName,bookedStatus} = room
            bookedCustomer = customerData.find((customer) => {
                return customer.roomid === roomid;
            })

            let customerInfo = bookedCustomer ? {
                customerName: bookedCustomer.customerName,
                date: bookedCustomer.date,
                startTime: bookedCustomer.startTime,
                endTime: bookedCustomer.endTime,
            }:null;

            return {roomName,bookedStatus,...customerInfo};
        })
        
    res.json(result);
})
//API to list All the user
app.get("/allcustomers",(req,res)=>{

    let bookedRoom;
    let result = customerData.map((customer)=>{
        let{customerName,roomid,date,startTime,endTime} = customer

        bookedRoom = roomData.find((room)=> room.roomid === roomid);

        let roomName = bookedRoom.roomName;

        return {customerName,roomName,date,startTime,endTime}
    })

    res.json(result)
})
//API to lis the Booked Hall by the speacific user
app.get("/allcustomers/:customerName",(req,res)=>{
    let cust_Name = req.params.customerName
    console.log(cust_Name);
    let bookedRoom;
    let cust_Info = customerData.filter((customer)=> customer.customerName === cust_Name)
    console.log(cust_Info);

    if(cust_Info.length===0){
        return res.status(404).json({error:"Coustomer not available"});
    }
    
    let result = cust_Info.map((cust)=>{
        let {customerName, roomid, bookedDate, startTime, endTime, bookingId} = cust
        
        bookedRoom = roomData.filter((room)=> room.roomid == roomid)

        let {roomName, bookedStatus} = bookedRoom[0] || {}

        return {customerName, roomName, bookedDate, startTime, endTime, bookingId, bookedStatus}
    })
   

    console.log("Result ✅✅✅",result);

    res.json(result);
})

app.listen(PORT, ()=>{
    console.log("Server listening on port", PORT);
})