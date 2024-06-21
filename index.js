const express = require('express');
const { createClient } = require('redis');

const app = express();
const port = 3000;

const client = createClient({
  url: 'redis://localhost:6379'
});
client.connect();

app.use(express.json());

const randomkey = () => {
  const length = 6;
  let key = "";
  for (let i = 0; i < length; i++) {
    key += Math.floor(Math.random() * 10);
  }
  return key;
};

app.post('/objects', (req, res) => {
  const data = req.body;
  const key = randomkey(); 
  client.set(key, JSON.stringify(data));  
  res.json({ key });
});

app.get('/objects/:key', async (req, res) => {
  const key = req.params.key;
  const data = await client.get(key);
  res.json(JSON.parse(data));
});

app.get('/objects', async (req, res) => {
  const keys = await client.keys('*');
  const object = {};
  for (const key of keys) {
    const value = await client.get(key);
    object[key] = JSON.parse(value);
  }

  res.json(object);
});

app.delete('/objects/:key', async (req,res) => {
  const key = req.params.key;
  await client.del(key);
  res.json({succes: true});
});

app.patch('/objects/:key', async (req,res) =>{
  const key = req.params.key;
  const newData = req.body;
  await client.set(key, JSON.stringify(newData));
  res.json({succes: true});
});

app.listen(port, () => {
  console.log("Server start")
});
