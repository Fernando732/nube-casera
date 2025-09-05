const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');
const processPath = require('../lib/path');

router.post('/{:path}', async (req, res, next) => {
    const dirPath = processPath(req.params.path);
    const name =  req.body.name;
    if(!name) {
        return res.status(400).json({
            succes: false,
            mensaje: 'No se ha especificado un nombre'
        });
    }

    await creatDir(path.join(dirPath.absolutePath, name));

    res.json( {succes: true, mensaje: 'Directorio creado con exito'} );
});

async function creatDir(dirPath) {
    try {
        await fs.ensureDir(dirPath);
       console.log('Directorio creado con exito');
    } catch (error) {
        return next(error);
    }
}

module.exports = router;