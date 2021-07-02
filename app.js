const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const secrets = require(__dirname + "/secrets.js");


const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");


// Custom function for string

const capitalize = function (string) {
    return string.slice(0, 1).toUpperCase() + string.slice(1, string.length).toLowerCase();
}


// Datbase Connectivity

mongoose.connect(`mongodb+srv://${secrets.adminName}:${secrets.adminPass}@cluster0.pedkz.mongodb.net/todolistDB`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


// Creating Schema for Database Documents
const itemSchema = new mongoose.Schema({
    name: String,
});

// Creating Schema for List Document
const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema],
});


// Creating Model for Database Documents using Schema
const Item = mongoose.model("Item", itemSchema);

// Creating Model for list Collection
const List = mongoose.model("List", listSchema);


// Creating Documents for database
const item1 = new Item({
    name: "Welcome to ToDo List"
});
const item2 = new Item({
    name: "Hit the + button to add a new item"
});
const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultTask = [item1, item2, item3];

// Get Requests 
app.get("/", function (req, res) {

    Item.find({}, function (err, items) {
        if (!err) {
            if (items.length === 0) {

                // Inserting Default Documents to the database
                Item.insertMany(defaultTask, function (err) {
                    if (!err) {
                        console.log("Data inserted successfully");
                    }

                });
                res.redirect("/");
            } else {
                res.render("list", {
                    listTitle: "Home",
                    newItems: items
                });
            }
        } else {
            console.log(err);
        }
    });
});

app.get("/:customParameter", function (req, res) {
    const customParameter = capitalize(req.params.customParameter);


    // Creating documents for list Collection
    List.findOne({
        name: customParameter
    }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customParameter,
                    items: defaultTask
                });
                list.save();
                res.redirect("/" + customParameter);
            } else {
                res.render("list", {
                    listTitle: foundList.name,
                    newItems: foundList.items,
                });
            }
        } else {
            console.log(err);
        }
    });
});


// Post Requests

app.post("/", function (req, res) {
    const inputItem = req.body.newItem;
    const listTitle = req.body.list;


    // Creating document According to Item model
    const item = new Item({
        name: inputItem,
    });


    // Creating document and saving it to DB
    if (listTitle === "Home") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({
            name: listTitle
        }, function (err, foundList) {
            if (!err) {

                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listTitle);
            }
        });
    }
});


app.post("/delete", function (req, res) {
    const deleteId = req.body.checkbox;
    const listName = req.body.hiddenInput;

    // Deleting checkboxed item from DB
    if (listName === "Home") {
        Item.findByIdAndDelete({
            _id: deleteId
        }, function (err) {
            if (!err) {
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: deleteId
                }
            }
        }, function (err, result) {
            if (!err) {

                res.redirect("/" + listName);
            }
        });
    }
});




app.listen(process.env.PORT || 3000, function () {
    console.log("Server is running successfully");
});







// ToDo Project without DataBase---


// const express = require("express");
// const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");



// const listItems = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


// const app = express();
// app.use(express.static("public"));
// app.set("view engine", "ejs");
// app.use(bodyParser.urlencoded({
//     extended: true
// }));


// app.get("/", function (req, res) {


//     const day = date.getDate();


//     res.render("list", {
//         listTitle: day,
//         newItems: listItems,
//     });
// });

// app.post("/", function (req, res) {
//     const item = req.body.newItem;
//     if (req.body.list === "Work") {
//         workItems.push(item);
//         res.redirect("/work");
//     } else {
//         listItems.push(item);
//         res.redirect("/");
//     }

// });

// app.get("/work", function (req, res) {

//     res.render("list", {
//         listTitle: "Work",
//         newItems: workItems
//     });
// });

// app.get("/about", function (req, res) {
//     res.render("about");
// });



// app.listen(3000, function () {
//     console.log("Server is running on port : 3000");
// });