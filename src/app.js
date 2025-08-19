import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { engine } from 'express-handlebars';
import { connectMongo } from './config/mongoose.js';
import { productsRouter } from './routes/products.router.js';
import { cartsRouter } from './routes/carts.router.js';
import { viewsRouter } from './routes/views.router.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { cookies } from './middlewares/ensureCart.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares generales
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookies);
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));

// Handlebars
app.engine('handlebars', engine({
  helpers: {
    eq: (a, b) => a === b
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Rutas de vistas
app.use('/', viewsRouter);

// Health
app.get('/health', (_, res) => res.json({ ok: true }));

// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Falta MONGODB_URI en .env');
  process.exit(1);
}

connectMongo(MONGODB_URI).then(() => {
  app.listen(PORT, () => console.log(`🚀 Server http://localhost:${PORT}`));
});
