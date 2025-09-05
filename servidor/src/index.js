const express = require('express');
const cors = require('cors');
const contentRouter = require('./routers/content');
const dirRouter = require('./routers/dir');
const uploadRouter = require('./routers/upload');
const downloadRouter = require('./routers/download');
//const enoent = require('./middlewares/enoent');
//const eexist = require('./middlewares/eexist');
//const err = require('./middlewares/err');

const port = process.env.PORT || 5000;
const app = express();

//Middleware para parsear JSON: Convierte el body en un objeto
app.use(express.json());
app.use(cors());

//Rutas
app.get('/', (req, res) => res.send('Hello World!'));
app.use('/content', contentRouter);
app.use('/dir', dirRouter);
app.use('/upload', uploadRouter);
app.use('/download', downloadRouter);

// Errors
//app.use(enoent);
//app.use(eexist);
//app.use(err);


app.listen(port, '0.0.0.0', () => {
  console.log(`Escuchando el servidor en el puerto ${port}`);
});
