import multer from 'multer';
import path from 'path';
import {NextApiRequest, NextApiResponse} from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        // Конфигурация Multer для обработки загруженных файлов
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads/'); // Папка, куда сохранять изображения
            },
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname);
                cb(null, `${Date.now()}${ext}`);
            },
        });

        const upload = multer({ storage: storage }).single('image');

        // Вызываем multer middleware для обработки загруженного файла
        upload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                // Ошибка Multer при загрузке файла
                return res.status(500).json({ error: 'Ошибка при загрузке файла' });
            } else if (err) {
                // Прочие ошибки
                return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
            }

            // Если файл успешно загружен, вернем сообщение об успешном сохранении
            return res.json({ message: 'Изображение успешно сохранено' });
        });
    } catch (error) {
        // В случае ошибки вернем соответствующий статус и сообщение об ошибке
        res.status(500).json({ error: 'Ошибка при сохранении изображения' });
    }
};

export default handler;