//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://RakshithJ:STUDENT1996@cluster0.n3t4u7b.mongodb.net/todolistDB');

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item(
  {
    name: "Welcome to todolist!"
  }
);

const item2 = new Item({
  name: "Hit the + button"
});

const item3 = new Item({
  name: "Hit this delete button"
});

const defaultItems = [item1, item2, item3];


app.get("/", function (req, res) {
  // const day = date.getDate();
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("The Item inserted success")
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

// home page code post

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }  
});

app.post("/delete", function (req, res) {
  const checkitemId = req.body.checkboxName;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkitemId, function (err) {
      if (!err) {
        console.log("Item deleted Successfully");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkitemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName)
      }
    });
  }
});

// =================================================================================
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);



  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // create a new list 
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        // show an existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    }
  });
});


app.get("/about", function (req, res) {
  res.render("about");
});


app.listen(3000, function () {
  console.log("Server started on port 3000");
});
