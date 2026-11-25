const express = require("express");
const app = express();
const ExpressError = require("./ExpressError");



// app.use((req, res, next)=>{
//     console.log("Hi, I am 1st middleware");
//     next();
//     console.log("This is after next()");
// });

// app.use((req, res, next )=>{
//     console.log("Hi, I am 2nd middleware");
//     next();
// });


const checkToken = (req, res, next)=>{
    let {token} = req.query;
    if(token==="givenaccess"){
        next();
    }
    throw new ExpressError(401, "ACCESS DENIED!");
};

app.get("/api", checkToken, (req, res)=>{
    res.send("data");
});



// next() looks for the next non error handling middleware



app.get("/", (req, res)=>{
    res.send("Hi, I am root");
});
app.get("/random", (req, res)=>{
    res.send("This is a random page");
});

app.get("/err", (req, res)=>{
    abcd = abcd;
});

app.get("/admin", (req, res)=>{
    throw new ExpressError(403, "Access is forbidden");
})

app.use((err, req, res, next)=>{
    let {status, message} = err;
    res.status(status).send(message);
});

app.listen(5000, ()=>{
    console.log("Server listening to port 5000");
});