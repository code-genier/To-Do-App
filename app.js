const express = require("express");
const bodyparser = require("body-parser");
const date = require(__dirname + "/helper/datelogic");
const mongoose = require("mongoose");
const _ = require("lodash");
// if user enter Home or home he see two different pages to rectify this we need to install lodash

const app = express();
const today = date();
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect(
  "mongodb+srv://admin-Aayush:aayush1607@todoapp.kjnim.mongodb.net/todoDB"
);

const listSchema = new mongoose.Schema({
  name: String,
});
const sublistSchema = new mongoose.Schema({
  title: String,
  items: [listSchema],
});

const List = mongoose.model("List", listSchema);
const Sub_List = mongoose.model("SubList", sublistSchema);

const _default1 = new List({
  name: "Add new Items",
});

app.get("/", (req, res) => {
  //find -> returns array
  List.find({}, (err, founditems) => {
    if (founditems.length === 0) {
      List.insertMany([_default1], (err) => {
        if (!err) {
          console.log("sucessfully added");
        }
      });
      res.redirect("/");
    } else {
      res.render("index", {
        listTitle: "Today",
        newListItems: founditems,
      });
    }
  });
});

app.get("/:extended", (req, res) => {
  const ext = _.capitalize(req.params.extended);

  // creating new sublist if user enter new address
  // findOne -> return object back
  Sub_List.findOne({ title: ext }, (err, foundlist) => {
    if (!err) {
      if (!foundlist) {
        const list = new Sub_List({
          title: ext,
          items: [_default1],
        });
        list.save();
        res.redirect("/" + ext);
      } else {
        res.render("index", {
          listTitle: ext,
          newListItems: foundlist.items,
        });
      }
    }
  });
});

app.post("/", (req, res) => {
  const itemname = req.body.newItem;
  const listname = req.body.list;
  const item = new List({
    name: itemname,
  });

  if (listname == "Today") {
    List.insertMany([item], (err) => {
      if (!err) {
        console.log("inserted");
      }
    });
    res.redirect("/");
  } else {
    Sub_List.findOne({ title: listname }, (err, foundlist) => {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listname);
    });
  }
});

app.post("/delete", (req, res) => {
  const itemid = req.body.checked;
  const listname = req.body.listname;

  if (listname === "Today") {
    List.deleteOne({ id: itemid }, (err) => {
      if (!err) {
        console.log("deleted");
      }
    });
    res.redirect("/");
  } else {
    // [impt] step here, to easily delete the item from items array
    Sub_List.findOneAndUpdate(
      { title: listname },
      { $pull: { items: { _id: itemid } } },
      (err, result) => {
        if (!err) {
          res.redirect("/" + listname);
        }
      }
    );
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("active at port");
});
