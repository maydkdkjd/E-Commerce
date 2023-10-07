var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
var mysql = require('mysql')
var session = require('express-session')

var app = express()
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'ejs')
app.use(session({secret:"secret"}))
app.listen(8080)

function isProductInCart(cart, id) {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i.id] === id) {
            return true;
        }
    }
    return false;
}

function calculateTotal(cart, req) {
    total = 0
    for (let i = 0; i < cart.length; i++) {
        if (cart[i.sale_price]) {
            total = total + (cart[i].sale_price*cart[i].quantity)
        }
        else{
            total = total + (cart[i].price*cart[i].quantity)
        }
    }
    req.session.total = total
    return total;
}

app.get('/', function (req, res) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database:"node project"
    })
    con.query("select * from products", (err, result) => {
        res.render('pages/index', {result:result})
    })
})

app.post('/add_to_cart', (req, res) => {
    var id = req.body.id
    var name = req.body.name
    var quantity = req.body.quantity
    var image = req.body.image
    var price = req.body.price
    var sale_price = req.body.sale_price
    var product = { id: id, name: name, quantity: quantity, image: image, sale_price:sale_price, price:price }
    
    if (req.session.cart) {
        var cart = req.session.cart;
        if (!isProductInCart(cart, id)) {
            cart.push(product)
        }
        else {
            req.session.cart = [product]
            var cart = req.session.cart
            req.session.save((err, sessionCart) => {
                console.log(sessionCart);
                if (err) { throw err; }
                res.json(cart);
            })
        }
    }

    // calculate total
    calculateTotal(cart, req)
//return to cart page
    res.redirect('/cart')
})





app.get('/cart', (req, res) => {
    var cart = req.session.cart;
    var total = req.session.total;

    res.render('pages/cart', {cart:cart, total:total})
})


