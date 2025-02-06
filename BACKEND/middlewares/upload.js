import multer from 'multer';

// Utilitzem la memòria per guardar el fitxer (no l'estem desant al disc)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;
