import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { Admin, Cart, Orders, Product, User } from './Schema.js';

const app = express();
const PORT = 6001;

app.use(express.json());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());

mongoose.connect('mongodb://localhost:27017/shopez')
  .then(() => {
    console.log('✅ Connected to MongoDB');

    app.post('/register', async (req, res) => {
      const { username, email, usertype, password } = req.body;
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, usertype, password: hashedPassword });
        const userCreated = await newUser.save();
        return res.status(201).json(userCreated);
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server Error' });
      }
    });

    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
      try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        return res.json(user);
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server Error' });
      }
    });

    app.get('/fetch-banner', async (req, res) => {
      try {
        const admin = await Admin.findOne();
        res.json(admin?.banner || []);
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.get('/fetch-users', async (req, res) => {
      try {
        const users = await User.find();
        res.json(users);
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.get('/fetch-product-details/:id', async (req, res) => {
      try {
        const product = await Product.findById(req.params.id);
        res.json(product);
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.get('/fetch-products', async (req, res) => {
      try {
        const products = await Product.find();
        res.json(products);
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.get('/fetch-orders', async (req, res) => {
      try {
        const orders = await Orders.find();
        res.json(orders);
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.get('/fetch-categories', async (req, res) => {
      try {
        let admin = await Admin.findOne();
        if (!admin) {
          admin = new Admin({ banner: '', categories: [] });
          await admin.save();
        }
        res.json(admin.categories);
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.post('/add-new-product', async (req, res) => {
      const {
        productName, productDescription, productMainImg, productCarousel,
        productSizes, productGender, productCategory, productNewCategory,
        productPrice, productDiscount
      } = req.body;
      try {
        const category = productCategory === 'new category' ? productNewCategory : productCategory;

        if (productCategory === 'new category') {
          const admin = await Admin.findOne();
          admin.categories.push(productNewCategory);
          await admin.save();
        }

        const newProduct = new Product({
          title: productName,
          description: productDescription,
          mainImg: productMainImg,
          carousel: productCarousel,
          category,
          sizes: productSizes,
          gender: productGender,
          price: productPrice,
          discount: productDiscount
        });
        await newProduct.save();
        res.json({ message: 'product added!!' });
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.put('/update-product/:id', async (req, res) => {
      const {
        productName, productDescription, productMainImg, productCarousel,
        productSizes, productGender, productCategory, productNewCategory,
        productPrice, productDiscount
      } = req.body;
      try {
        const product = await Product.findById(req.params.id);

        const category = productCategory === 'new category' ? productNewCategory : productCategory;

        if (productCategory === 'new category') {
          const admin = await Admin.findOne();
          admin.categories.push(productNewCategory);
          await admin.save();
        }

        Object.assign(product, {
          title: productName,
          description: productDescription,
          mainImg: productMainImg,
          carousel: productCarousel,
          category,
          sizes: productSizes,
          gender: productGender,
          price: productPrice,
          discount: productDiscount
        });

        await product.save();
        res.json({ message: 'product updated!!' });
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.post('/update-banner', async (req, res) => {
      try {
        let admin = await Admin.findOne();
        if (!admin) {
          admin = new Admin({ banner: req.body.banner, categories: [] });
          await admin.save();
        } else {
          admin.banner = req.body.banner;
          await admin.save();
        }
        res.json({ message: 'banner updated' });
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.post('/buy-product', async (req, res) => {
      try {
        const order = new Orders(req.body);
        await order.save();
        res.json({ message: 'order placed' });
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.put('/cancel-order', async (req, res) => {
      try {
        const order = await Orders.findById(req.body.id);
        order.orderStatus = 'cancelled';
        await order.save();
        res.json({ message: 'order cancelled' });
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.put('/update-order-status', async (req, res) => {
      try {
        const order = await Orders.findById(req.body.id);
        order.orderStatus = req.body.updateStatus;
        await order.save();
        res.json({ message: 'order status updated' });
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.get('/fetch-cart', async (req, res) => {
      try {
        const items = await Cart.find();
        res.json(items);
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.post('/add-to-cart', async (req, res) => {
      try {
        const item = new Cart(req.body);
        await item.save();
        res.json({ message: 'Added to cart' });
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.put('/increase-cart-quantity', async (req, res) => {
      try {
        const item = await Cart.findById(req.body.id);
        item.quantity = parseInt(item.quantity) + 1;
        await item.save();
        res.json({ message: 'incremented' });
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.put('/decrease-cart-quantity', async (req, res) => {
      try {
        const item = await Cart.findById(req.body.id);
        item.quantity = parseInt(item.quantity) - 1;
        await item.save();
        res.json({ message: 'decremented' });
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.put('/remove-item', async (req, res) => {
      try {
        await Cart.deleteOne({ _id: req.body.id });
        res.json({ message: 'item removed' });
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.post('/place-cart-order', async (req, res) => {
      try {
        const { userId, name, mobile, email, address, pincode, paymentMethod, orderDate } = req.body;
        const cartItems = await Cart.find({ userId });

        for (const item of cartItems) {
          const newOrder = new Orders({
            userId,
            name,
            email,
            mobile,
            address,
            pincode,
            title: item.title,
            description: item.description,
            mainImg: item.mainImg,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
            paymentMethod,
            orderDate
          });
          await newOrder.save();
          await Cart.deleteOne({ _id: item._id });
        }

        res.json({ message: 'Order placed' });
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    app.listen(PORT, () => console.log(`🚀 Server running @ http://localhost:${PORT}`));
  })
  .catch((e) => console.log(`❌ Error in db connection: ${e}`));