const router = require('express').Router();
const mime = require('mime-types');
const processPath = require('../lib/path');

router.get('/{:path}', async (req, res, err) => {
    try {
        const file = processPath(req.params.path).absolutePath;
        const mimeType = mime.lookup(file);
        console.log(mimeType);
        res.setHeader('Content-Disposition',`attachment; filename=${file}`);
        res.setHeader('Content-Type', mimeType);
        res.download(file);
    } catch (err) {
        next(err);
    }
});

module.exports = router;