const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const Date = require(__dirname + "/date.js");
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://huss1962:Husain%405253@cluster0.ntg8t.mongodb.net/todolistDB?retryWrites=true&w=majority");
const itemsSchema = new mongoose.Schema({
    name: String
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const Item = new mongoose.model("Item", itemsSchema);

const List = new mongoose.model("List", listSchema);

const item_1 = new Item({
    name: "Buy fruit"
});
const item_2 = new Item({
    name: "Buy vegetables"
});
const item_3 = new Item({
    name: "cook food"
});


const defaultItem = [item_1, item_2, item_3];

app.get("/", (req, res) => {
    const day = Date.getDate();
    Item.find(function (err, items) {
        if (err) {
            console.log(err);
        } else {
            if (items.length === 0) {
                Item.insertMany(defaultItem, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully added item");
                    }
                    res.redirect("/");
                });
            } else {
                res.render("list", {
                    TypeOfList: day,
                    newAddedItems: items
                });
            }

        }

    });
});

app.get("/:newList", function(req,res) {
    const newCustomList = _.capitalize(req.params.newList); 
    if (req.params.newList === "favicon.ico") return next();
    List.findOne({name: newCustomList}, function(err, foundItem){
        if(!err){
            if(!foundItem){
                const newList = new List({
                    name: newCustomList,
                    items: defaultItem
                });
                newList.save();
                res.redirect("/" + newCustomList);
            }
            else{
                res.render("list",{
                    TypeOfList: foundItem.name,
                    newAddedItems: foundItem.items
                });
            }
        }
        else{
            console.log(err);
        }
    });
    
});


app.post("/", function (req, res) {
    const list = req.body.list;
    const itemName = req.body.toDoList;
    const newItem = new Item({
        name: itemName
    });

    if(list == Date.getDate()){
        newItem.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: list}, function(err,foundList){
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + list);
        })
    }
    
});

app.post("/delete", function (req, res) {
    const list = _.capitalize(req.body.listName);
    if(list == Date.getDate()){
        Item.deleteOne({
            _id: req.body.checkbox
        }, function (err) {
            if (err) console.log(err);
            else console.log("Deleted");
        });
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name: list}, {$pull: {items: {_id: req.body.checkbox}}}, function(err, foundItem){
            if(!err){
                res.redirect("/" + list);
            }
            else{
                console.log(err);
            }
        });
    }
});

app.listen(3000, () => {
    console.log("Server is started on port 3000");
});