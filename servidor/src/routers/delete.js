const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');
const processPath = require('../lib/path');

router.delete('/{:path}', async (req, res, next) => {
    try {
        const filePath = processPath(req.params.path).absolutePath;

        const exists = await fs.pathExists(filePath);
        if(!exists) {
            return res.status(404).json( {success: false, message: 'Archivo no encontrado', path: req.params.path} );
        }

        const stats = await fs.stat(filePath);
        if(stats.isDirectory()) {
            return res.status(400).json({success: false, message:'No se puede eliminar un directorio con este endpoint', path:req.params.path});
        }

        await fs.remove(filePath);

        res.json({success: true, message: 'Archivo elimando correctamente', path: req.params.path});
    } catch (err) {
        next(err);
    }
});

// Eliminar múltiples archivos
router.delete('/', async (req, res, next) => {
    try {
        const { files } = req.body;
        
        // Validar que se enviaron archivos
        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de archivos para eliminar'
            });
        }

        const results = [];
        
        // Procesar cada archivo
        for (const filePath of files) {
            try {
                const absolutePath = processPath(filePath).absolutePath;
                
                // Verificar si existe
                const exists = await fs.pathExists(absolutePath);
                if (!exists) {
                    results.push({
                        path: filePath,
                        success: false,
                        message: 'Archivo no encontrado'
                    });
                    continue;
                }

                // Verificar si es archivo
                const stats = await fs.stat(absolutePath);
                if (stats.isDirectory()) {
                    results.push({
                        path: filePath,
                        success: false,
                        message: 'No se puede eliminar un directorio'
                    });
                    continue;
                }

                // Eliminar archivo
                await fs.remove(absolutePath);
                results.push({
                    path: filePath,
                    success: true,
                    message: 'Archivo eliminado correctamente'
                });

            } catch (error) {
                results.push({
                    path: filePath,
                    success: false,
                    message: `Error al eliminar: ${error.message}`
                });
            }
        }

        // Contar éxitos y fallos
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        res.json({
            success: failed === 0,
            message: `${successful} archivos eliminados, ${failed} fallos`,
            results: results
        });

    } catch (err) {
        next(err);
    }
});

// Eliminar directorio (opcional - con confirmación)
router.delete('/directory/:path', async (req, res, next) => {
    try {
        const { force } = req.query; // ?force=true para forzar eliminación
        const dirPath = processPath(req.params.path).absolutePath;
        
        // Verificar si existe
        const exists = await fs.pathExists(dirPath);
        if (!exists) {
            return res.status(404).json({
                success: false,
                message: 'Directorio no encontrado',
                path: req.params.path
            });
        }

        // Verificar si es directorio
        const stats = await fs.stat(dirPath);
        if (!stats.isDirectory()) {
            return res.status(400).json({
                success: false,
                message: 'La ruta no corresponde a un directorio',
                path: req.params.path
            });
        }

        // Verificar si está vacío (a menos que se fuerce)
        if (force !== 'true') {
            const contents = await fs.readdir(dirPath);
            if (contents.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El directorio no está vacío. Use ?force=true para eliminarlo',
                    path: req.params.path,
                    contents: contents.length
                });
            }
        }

        // Eliminar directorio
        await fs.remove(dirPath);
        
        res.json({
            success: true,
            message: 'Directorio eliminado correctamente',
            path: req.params.path
        });

    } catch (err) {
        next(err);
    }
});