const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.get('/api/products', (req, res) => {
  fs.readFile(path.join(__dirname, 'products.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products.json:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
    try {
      const products = JSON.parse(data);
      res.json(products);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      res.status(500).json({ error: 'Error parsing JSON' });
    }
  });
});

app.post('/api/products', (req, res) => {
  fs.readFile(path.join(__dirname, 'products.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products.json:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
    const products = JSON.parse(data);
    const newProducts = Array.isArray(req.body) ? req.body : [req.body];
    newProducts.forEach(product => {
      product.id = products.length ? products[products.length - 1].id + 1 : 1;
      products.push(product);
    });
    fs.writeFile(path.join(__dirname, 'products.json'), JSON.stringify(products, null, 2), (err) => {
      if (err) {
        console.error('Error writing products.json:', err);
        return res.status(500).json({ error: 'Server Error' });
      }
      res.status(201).json(newProducts);
    });
  });
});

app.put('/api/products/:id', (req, res) => {
  fs.readFile(path.join(__dirname, 'products.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products.json:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
    let products = JSON.parse(data);
    const productId = parseInt(req.params.id, 10);
    const updatedProduct = req.body;
    products = products.map(product => product.id === productId ? { ...product, ...updatedProduct } : product);
    fs.writeFile(path.join(__dirname, 'products.json'), JSON.stringify(products, null, 2), (err) => {
      if (err) {
        console.error('Error writing products.json:', err);
        return res.status(500).json({ error: 'Server Error' });
      }
      res.json(updatedProduct);
    });
  });
});

app.delete('/api/products/:id', (req, res) => {
  fs.readFile(path.join(__dirname, 'products.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products.json:', err);
      return res.status(500).json({ error: 'Server Error' });
    }
    let products = JSON.parse(data);
    const productId = parseInt(req.params.id, 10);
    products = products.filter(product => product.id !== productId);
    fs.writeFile(path.join(__dirname, 'products.json'), JSON.stringify(products, null, 2), (err) => {
      if (err) {
        console.error('Error writing products.json:', err);
        return res.status(500).json({ error: 'Server Error' });
      }
      res.status(204).send();
    });
  });
});

app.listen(PORT, () => {
  console.log(`Admin Server is running on http://localhost:${PORT}`);
});
