import express from 'express';
import cors from 'cors';
import fileSystemRoutes from './routes/fileSystemRoutes.js';
import { getDb } from './db.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  await getDb();
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api', fileSystemRoutes);

app.listen(port, async () => {
  await getDb();
  console.log(`Backend listening on http://localhost:${port}`);
});
