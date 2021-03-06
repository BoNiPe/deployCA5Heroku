var fs = require('fs');
var mongoose = require('mongoose');
var model = require('./model');
//var dbUrl = 'mongodb://localhost/wiki';
var dbUrl = "mongodb://ca5:ca5@ds061200.mongolab.com:61200/ca5";

function readData(path) {
    var file = fs.readFileSync(path, 'utf8');
    var lines = file.split(/[\r]?[\n]/);
    var headers = lines[0].split(',');1
    var data = JSON.parse(lines[1]);
    var result = data.map(function (e) {
        var res = {};
        for (var i = 0; i < e.length; i++) {
            if (e[i] !== 'NULL')
                res[headers[i]] = e[i];
        }
        return res;
    })
    return result;
}

function getOrders() {
    return orders.map(function (e) {
        return {
            status : e.status,
            productID : e.productID,
            quantity : e.quantity,
            userAlias : e.userAlias
        };
    });
};

function getProducts() {
    return products.map(function (e) {
        return {
            productName: e.productName,
            productDescription : e.productDescription,
            unitPrice: e.unitPrice,
            userAlias : e.userAlias
        };
    });
}

function getPayments() {
    return payments.map(function (e) {
        return {
            userAlias: e.userAlias,
            orderID: e.orderID,
            paymentAmount: e.paymentAmount,
            isPayed: e.isPayed
        };
    });
};

var orders = readData('orders.json');
var products = readData('products.json');
var payments = readData('payments.json');

var db = mongoose.connect('mongodb://ca5:ca5@ds061200.mongolab.com:61200/ca5');
db.connection.once('open', function () {
    console.log("Connected");
});
db.connection.on('error', function (err) {
    console.log(err);
    console.log('Did you remember to start MongodDb?');
});

model.OrderModel.remove({}).exec();
model.ProductModel.remove({}).exec();
model.PaymentModel.remove({}).exec();

var done = [0, 0, 0, 0, 0, 0];


function closeDatabase() {
    for (var i = 0; i < done.length; i++) {
        if (done[i] == 0) {
            return;
        }
    }
    db.connection.close();
}

function addData(data, dataModel, doneIndex) {
    //console.log(data);
    var count = 0;
    data.forEach(function (e) {
        var element = new dataModel(e);
        element.save(function (err, order) {
            if (err) console.log(err);
            count++;
            if (count >= data.length) {
                done[doneIndex] = true;
                closeDatabase()
            }
        });
    });
}

addData(getOrders(), model.OrderModel, 0);
addData(getProducts(), model.ProductModel, 1);
addData(getPayments(), model.PaymentModel, 2);





