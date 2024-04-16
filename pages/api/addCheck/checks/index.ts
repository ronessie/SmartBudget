import multer from 'multer';
import path from "path";
import * as fs from "fs";

export const config = {
    api: {
        bodyParser: false
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // Папка, куда сохранять изображения
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`); // Имя файла, каким он будет сохранен
    },
});

const upload = multer({storage: storage});

export default async function handler(req: any, res: any) {
    if (req.method === 'POST') {
        await createDirIfNotExists('public/uploads');

        upload.single('image')(req, res, (err) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(500).json({error: 'Ошибка загрузки файла'});
            }

            // Путь к загруженному файлу
            const filePath = req.file.filename;
            console.log('File uploaded:', req.file);

            // Отправляем клиенту ответ с путем к загруженному файлу
            res.status(200).json({filePath});
        });
    } else {
        res.status(405).end(`Метод ${req.method} не разрешен. Используйте метод POST.`);
    }
}

const createDirIfNotExists = async (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
}