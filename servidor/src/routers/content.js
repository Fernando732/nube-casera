const router = require('express').Router();
const fs = require('fs-extra');

const processPath = require('../lib/path');

router.get('/{:path}', async (req, res, next) => {
    try {
        const dirPath = processPath(req.params.path);
        const dir = await fs.opendir(dirPath.absolutePath);
        const content = {archivos : [], directorios: [] };

        for await (const dirent of dir) {
            if(dirent.isDirectory) {
                content.directorios.push(dirent.name);
            }else{
                content.archivos.push(dirent.name);
            }
        }

        content.directorios.sort();
        content.archivos.sort();

        res.json({ruta: dirPath.relativePath, content, succes: true});
    } catch (error) {
        next(error);
    }
});

module.exports = router;