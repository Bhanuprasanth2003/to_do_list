
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");//for uppercasr and lowercase routing we need to do 1) npm i lodash , it is defined as "_".

const app = express();

app.set('view engine', 'ejs');//With this configuration, Express will look for EJS templates in a views directory by default, and you can use EJS to render dynamic HTML content in your routes.

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));//Express will automatically map requests for static files to the corresponding files in the "public" directory, making it easy to serve assets like stylesheets, scripts, and images to your web application.

//database
mongoose.connect("mongodb+srv://bhanuprasanth3:BRMQPClCcSKUpanc@cluster0.9ustcal.mongodb.net/todolistDB" ,{useNewUrlParser:true});//mongodb://127.0.0.1:27017

const itemsSchema = new mongoose.Schema({name: String
                                        });
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({name: "welcome todo list"});
const item2 = new Item({name: "Hit the + button to add a new item"});
const item3 = new Item({name: "<-- hit this to delete an item"});

const ArrayItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({name: String,
                                        items : [itemsSchema]
                                        });

const List = mongoose.model("List" , listSchema);



app.get("/", function(req, res) {
  Item.find({}).then(foundItems => {
    if(foundItems.length === 0){
      Item.insertMany(ArrayItems)
     .then(()=>console.log("data Inserted successfully"))
     .catch(err => console.error("Error inserting data:", err));
     res.redirect("/");
    }else{
     res.render("list", {listTitle:"Today" , newListItems:foundItems}); //it's "list," which means that Express will look for a file named "list.ejs" in the specified view directory.
    }
    });
  });

//customlist items  and names
app.get("/:customListName", (req, res) => {
  const customListName =  _.capitalize(req.params.customListName);//using lodash

  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        // Creating a new list
        const list = new List({
          name: customListName,
          items: ArrayItems
        });
        list.save();
        res.redirect("/");
      } else {
        res.render("list", {  listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    .catch(err => {
      console.error("An error occurred:", err);
    });
});

//post route adding new items
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name:itemName
                        });
  
  if(listName === "Today"){
  item.save();
  res.redirect("/");
  }else{
    List.findOne({ name: listName })
    .then(foundList => { 
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
    .catch(err => {
      console.error("An error occurred:", err);
    });
  }
});


//delete route
app.post("/delete" , function(req, res) {

   const checkedItemID = req.body.checkbox;
   const listName = req.body.listName;

   if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID)
      .then(() => console.log("Data Checked deleted successfully"))
      .catch((err) => console.error("Error deleting data:", err))
       res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemID } } }
    )
      .then((foundList) => {
        console.log("List updated successfully");
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.error("Error updating list:", err);
      });
    }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
