var mysql = require('mysql');
var inquirer = require('inquirer');
var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'root',
	database: 'bamazon'
});

connection.connect(function(err) {
	if (err) throw err;
	start();
});

var start = function() {
	var choiceArray = [];
	connection.query('SELECT * FROM products', function(err, res) {
		for(var i = 0; i < res.length; i++) {
			console.log(res[i].id + ' : ' + res[i].product_name + ' : $' + res[i].price);
			choiceArray.push(res[i]);
		}
	});

	inquirer.prompt({
		name: 'id',
		type: 'input',
		message: 'What is the product ID #?'
	}).then(function(answer) {
		var item;
		for(var i = 0; i < choiceArray.length; i++) {
			if(choiceArray[i].id === parseInt(answer.id)) {
				item = choiceArray[i];
			}
		}
		if(item === undefined) {
			console.log('Input not recognized.\n');
			start();
		}
		inquirer.prompt({
			name: 'qty',
			type: 'input',
			message: 'Please enter a quantity'
		}).then(function(answer) {
			if(item.stock_quantity >= parseInt(answer.qty)) {
				connection.query('UPDATE products SET ? WHERE ?', 
					[
						{stock_quantity: item.stock_quantity - parseInt(answer.qty)}, 
						{id: item.id}
					],
					function(err){
						if (err) throw err;
						console.log('Your total is $' + item.price * parseInt(answer.qty) + '.\n');
						start();
					});
			}
			else {
				console.log('Sorry, we only have ' + item.stock_quantity + ' in stock.\n');
				start();
			}
		})
	});
};
