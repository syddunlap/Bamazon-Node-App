require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const colors = require("colors");
const keys = require("./keys");

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: keys.sql.password,
  database: "bamazon_db"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  // welcome user and run the inquire function which begins the program..
  console.log("\n\n\n");
  console.log("W E L C O M E    T O    B A M A Z O N !".rainbow);
  console.log("\n\n\n");
  inquire();
});

// this prints all the products for the user to view
function availableProducts() {
  connection.query("SELECT * FROM products", function (err, res) {
    console.log("\n " + "These are all available products at this time: ".cyan.bold + " \n");
    for (let i = 0; i < res.length; i++) {
      if (res[i].stock_quantity > 0) {
        console.log(res[i].id + " | " + ("Item: " + res[i].product_name).magenta + " | " + ("Department: " + res[i].department_name).yellow + " | " + ("Price: $" + res[i].price).blue + " | " + ("Quantity Available: " + res[i].stock_quantity).cyan);
        console.log("-----------------------------------".green + " \n");
      }
    }
  })
}

// main inquiry asking the user if they want to PURCHASE or EXIT application
function inquire() {
  inquirer
    .prompt({
      name: "buyOrNot",
      type: "list",
      message: "Would you like to PURCHASE an item or EXIT?".red,
      choices: ["PURCHASE", "EXIT"]
    })
    .then(function (answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.buyOrNot === "PURCHASE") {
        purchaseInquire();
      } else {
        console.log("\n");
        console.log("-----------------------------------".green);
        console.log("\n");
        console.log("No problem. Thanks for stopping by Bamazon today & come again soon!".cyan);
        console.log("\n");
        console.log("-----------------------------------".green);
        console.log("\n");
        connection.end();
      }
    });
}

// if user decides to purchase ...
function purchaseInquire() {
  // print available products
  availableProducts();
  // have user select which product the want
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([{
        name: "product",
        type: "rawlist",
        choices: function () {
          let choiceArray = [];
          for (let i = 0; i < res.length; i++) {
            choiceArray.push(res[i].product_name);
          }
          return choiceArray;
        },
        message: "Which item would you like to purchase today?".red
      },
      {
        // have user type in a quantity 
        name: "quantity",
        type: "input",
        message: "What quantity would you like to purchase?".red
      }
      ])
      .then(function (answer) {
        // get the information of the chosen item
        let chosenItem;
        for (let i = 0; i < res.length; i++) {
          if (res[i].product_name === answer.product) {
            chosenItem = res[i];
          }
        }

        // determine if enough products are available
        if (chosenItem.stock_quantity > parseInt(answer.quantity)) {
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: parseInt(chosenItem.stock_quantity) - parseInt(answer.quantity)
              },
              {
                id: chosenItem.id
              }
            ],
            function (error) {
              if (error) throw err;
            }
          );
          let totalCost = chosenItem.price * answer.quantity;
          // let the user know they're purchase was successful and how much they were charged
          console.log("-----------------------------------".green);
          console.log("Purchase was successful!".cyan);
          console.log(("Item: " + chosenItem.product_name).magenta);
          console.log(("Price per unit: $" + chosenItem.price).blue);
          console.log(("Quantity: " + answer.quantity).magenta);
          console.log(("Total Price: $" + totalCost).blue);
          console.log("-----------------------------------".green + " \n");
          inquire();
        } else {
          // Too much quanitity requested
          console.log("\n " + "We don't have that much product in stock. Try again".yellow + " \n");
          inquire();
        }
      });
  });
}