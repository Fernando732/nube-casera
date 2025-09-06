const router =  require('express').Router();
const multer = require('multer');
const fs = require('fs-extra');
const processPath = require('../lib/path');
const moveFile =  require('../lib/mv');

//consiguracion de multer
const upload = multer( {dest: '/temp'} );

router.post('/{:path}', upload.array('file'), async (req, res, next) => {

    if(!req.files || req.files.length === 0){
        return res.status(400).json( {succes: false, mensaje: 'No se cargaron archivos'} );
    }

    const dirPath = processPath(req.params.path);
    const files = req.files;

    const results = { succesful: [], skipped: [], failed: [] };

    for(const file of files) {
        try {
            const result = await moveFile(file, dirPath.absolutePath);
            if (result.succes) {
                results.succesful.push( {fileName: result.fileName, filePath: result.filePath} );
            }else if (result.skipped) {
                results.skipped.push( {fileName: result.fileName, reason: result.message} );
            }else{
                results.failed.push( {fileName: result.fileName, reason: result.message} );

                //limpia archivo temporal en caso de fallo
                await fs.remove(file.path).catch(() => {});
            }
        } catch (unexpectedError) {
            results.failed.push( {fileName: file.originalname, reason: `Error inesperado: ${unexpectedError.message}`} );

            await fs.remove(file.path).catch(() => {});
        }
    }

    const hasSuccessful = results.succesful.length > 0;
    const hasFailures  = results.failed.length > 0;
    const hasSkipped  = results.skipped.length > 0;

    if (!hasSuccessful && (hasFailures || hasSkipped)) {
        return res.status(400).json( {succes: false, message: 'No se pudo subir ningun archivo', results, path: dirPath.relativePath} );
    }

    let message = '';
    if(hasSuccessful && !hasFailures && !hasSkipped) {
        message: 'Todos los archivos e suboieron exitosamente';
    }else if (hasSuccessful) {
        message = `${results.successful.length} archivo(s) subido(s) exitosamente`;
        if (hasSkipped) message += `, ${results.skipped.length} omitido(s)`;
        if (hasFailures) message += `, ${results.failed.length} fallido(s)`;
    }

    res.json( {succes: true, message, results, path: dirPath.relativePath} );
});

async function cleanupTempFiles(files) {
    if(!files) return;

    for(const file of files) {
        if(file.path) {
            try {
                await fs.remove(file.path);
            }catch(cleanupError) {
                console.warn(`No se pudo limpiar el archivo tmeporal`);
            }
        }
    }
}

module.exports = router;