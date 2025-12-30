import express from 'express';

const router = express.Router();

// Mock database for connected accounts
let connectedAccounts = [
    { id: '1', platform: 'Twitter', username: '@BrandBibleApp', status: 'connected', connectedAt: new Date().toISOString() }
];

// Get connected accounts
router.get('/accounts', (req, res) => {
    res.json(connectedAccounts);
});

// Connect an account (Mock)
router.post('/connect', (req, res) => {
    const { platform } = req.body;

    // Simulate a delay
    setTimeout(() => {
        const newAccount = {
            id: Math.random().toString(36).substr(2, 9),
            platform,
            username: `@MockUser_${platform}`,
            status: 'connected',
            connectedAt: new Date().toISOString()
        };

        // Remove existing account for this platform if any (simple toggle behavior for mock)
        connectedAccounts = connectedAccounts.filter(acc => acc.platform !== platform);
        connectedAccounts.push(newAccount);

        res.json(newAccount);
    }, 1000);
});

// Disconnect an account
router.post('/disconnect', (req, res) => {
    const { platform } = req.body;
    connectedAccounts = connectedAccounts.filter(acc => acc.platform !== platform);
    res.json({ success: true });
});

// Publish a post (Mock)
router.post('/publish', (req, res) => {
    const { platform, content, image } = req.body;

    console.log(`[Mock Social] Publishing to ${platform}:`, content.substring(0, 50) + '...');

    // Simulate API delay
    setTimeout(() => {
        // Randomly fail sometimes to test error handling (10% chance)
        if (Math.random() < 0.1) {
            res.status(500).json({ error: 'Random mock failure: API rate limit exceeded' });
        } else {
            res.json({
                success: true,
                postId: `post_${Math.random().toString(36).substr(2, 9)}`,
                platform,
                publishedAt: new Date().toISOString(),
                url: `https://mock-social.com/${platform}/status/123456789`
            });
        }
    }, 1500);
});

export default router;
