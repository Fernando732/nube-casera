const path = require('path');
const fs = require('fs-extra');

const moveFile  = async (file, storagePath) => {
    const fileName =  file.originalname;
    const filePath = path.join(storagePath, fileName);

    const exist =  await fs.pathExists(filePath);
    if (exist) {
        return { succes: false, fileName, message: `Archivo ${fileName} ya existe`, skipped: true };
    }

    try {
        await fs.ensureDir(storagePath);

        await fs.move(file.path, filePath);

        return { succes: true, fileName, filePath, skipped: false };
    } catch (moveError) {
        return { succes: false, fileName, message: `No se puedo mover el archivo: ${moveError.message}`, skipped: false };
    }
}

module.exports = moveFile ;