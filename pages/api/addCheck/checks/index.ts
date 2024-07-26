import {useState} from "react";
import {getDownloadURL, ref, uploadBytesResumable} from "firebase/storage";
import {storage} from "@/firebaseConfig";


// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/uploads'); // Папка, куда сохранять изображения
//     },
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname);
//         cb(null, `${Date.now()}${ext}`); // Имя файла, каким он будет сохранен
//     },
// });
//
// const upload = multer({storage: storage});

export default function UploadImage(req: any, res: any) {
    console.log("TEST TEST")
    const [progress, setProgress] = useState(0);
    const [url, setUrl] = useState("");
    if (!req.file) return;
    if (req.method === 'POST') {
        const storageRef = ref(storage, `Checks/${req.file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, req.file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
                res.status(200).json();
            },
            (error) => {
                console.error("Upload error: ", error);
                res.status(405).end(`Метод ${req.method} не разрешен. Используйте метод POST.`);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setUrl(downloadURL);
                });
            }
        );
    } else {
        res.status(405).end(`Метод ${req.method} не разрешен. Используйте метод POST.`);
    }
};