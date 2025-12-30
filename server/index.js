import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.js';
import socialRoutes from './routes/social.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads

// Routes
app.use('/api', aiRoutes);
app.use('/api/social', socialRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
