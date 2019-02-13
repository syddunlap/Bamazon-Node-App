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
    console.log("Welcome to Bamazon Manager!".rainbow);
    console.log("\n\n\n");
    inquire();
});

// main inquiry asking the user if they want to PURCHASE or EXIT application
function inquire() {
    inquirer
        .prompt({
            name: "mainMenu",
            type: "list",
            message: "Select from the following options:".red,
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "EXIT"]
        })
        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            if (answer.mainMenu === "View Products for Sale") {
                availableProducts();
            } else if (answer.mainMenu === "View Low Inventory") {
                lowInventory();
            } else if (answer.mainMenu === "Add to Inventory") {
                addToInventory();
            } else if (answer.mainMenu === "Add New Product") {
                addNewProduct();
            } else {
                console.log("\n");
                console.log("-----------------------------------".green);
                console.log("\n");
                console.log("No problem. Thanks for checking in on your Bamazon today!".cyan);
                console.log("\n");
                console.log("-----------------------------------".green);
                console.log("\n");
                connection.end();
            }
        });
}

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
        inquire();
    })
}

// This shows all products with an inventory count lower than 5
function lowInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        console.log("\n " + "These products are currently running low on inventory: ".cyan.bold + " \n");
        for (let i = 0; i < res.length; i++) {
            if (res[i].stock_quantity < 5) {
                console.log(res[i].id + " | " + ("Item: " + res[i].product_name).magenta + " | " + ("Department: " + res[i].department_name).yellow + " | " + ("Price: $" + res[i].price).blue + " | " + ("Quantity Available: " + res[i].stock_quantity).cyan);
                console.log("-----------------------------------".green + " \n");
            }
        }
        inquire();
    })
}

// This allows the user to add more stock of any current product in the store
function addToInventory() {
    // have user select which product they want to add to
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
                message: "Which item would you like to add inventory to today?".red
            },
            {
                // have user type in a quantity 
                name: "quantity",
                type: "input",
                message: "What quantity would you like to add?".red
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
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: parseInt(chosenItem.stock_quantity) + parseInt(answer.quantity)
                        },
                        {
                            id: chosenItem.id
                        }
                    ],
                    function (error) {
                        if (error) throw err;
                    }
                );
                // let the user know they're addition was successful & some information about it
                console.log("-----------------------------------".green);
                console.log("Inventory addition was successful!".cyan);
                console.log(("Item: " + chosenItem.product_name).magenta);
                console.log(("Added Quantity: " + answer.quantity).blue);
                console.log("-----------------------------------".green + " \n");
                inquire();
            });
    });

}

// This allows the user to add a completely new product to the store
function addNewProduct() {
    inquirer
        .prompt([
            {
                name: "item",
                type: "input",
                message: "What is the item you would like to submit?"
            },
            {
                name: "department",
                type: "input",
                message: "What department would you like to place your auction in?"
            },
            {
                name: "price",
                type: "input",
                message: "What would you like the price of the item to be?",
            },
            {
                name: "quantity",
                type: "input",
                message: "How many of these items are you putting into inventory?"
            }
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: answer.item,
                    department_name: answer.department,
                    price: answer.price,
                    stock_quantity: answer.quantity
                },
                function (err) {
                    if (err) throw (err)
                    console.log("Your product was added successful!");
                    inquire();
                }
            )
        })
}