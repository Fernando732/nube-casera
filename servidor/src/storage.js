require('dotenv').config();

const almacenamiento = process.env.HOME_CLOUD_STORAGE;
if(!almacenamiento){
    console.log(
        'Ruta de almacenamiento no definida,',
        'Establesca un valor para la variable de entorno'
    );
    process.exit(1);
}
module.exports = almacenamiento;