// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


// console.log(date);//it will not run the function getDate that is in date.js it will just show function name
// console.log(date());// it will now run and display result of getDate function

const { urlencoded } = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
//To serve css styles by server (till now server was only serving files app.js package.json and views folder)
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin-ajay:ajay1214@ajay.eif5asu.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDo List!",
});

const item2 = new Item({
  name: "Hit the + button to add a new Item",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find().then((foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
        .then(() => {
          console.log("Successfully saved default items to DB");
        })
        .catch((err) => {
          console.error(err);
        });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.get("/:customListName", function (req, res) {
  // console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        // Show existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(() => {
      console.log("Succeccfully deleted checked item");
      res.redirect("/");
    })
    .catch((err) => {
      console.error(err);
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
        .then((foundList)=>{
            res.redirect("/" + listName);
        })
        .catch((err)=>{
            console.error(err);
        });
  }

  
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server is running on port 27017");
});
