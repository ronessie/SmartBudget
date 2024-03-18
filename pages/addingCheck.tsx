import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useState} from "react";
import {FileInput} from "@mantine/core";
import Header from "../components/header"
import styles from '../styles/pages.module.css'

export default function Page() {
    const [image, setImage] = useState(null);

    const handleImageChange = (e: any) => {
        const file = e.target.files[0];
        setImage(file);
    };

    const handleUpload = async () => {
        if (image) {
            try {
                const formData = new FormData();
                formData.append('image', image);

                const response = await fetch('/api/saveImageEndpoint', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Ошибка HTTP: ' + response.status);
                }

                const data = await response.json();
                console.log("Изображение успешно сохранено:", data);
                // Дополнительные действия, если необходимо
            } catch (error) {
                console.error("Ошибка при сохранении изображения:", error);
            }
        } else {
            console.warn("Изображение не выбрано");
        }
    };

    return (
        <div className={styles.page}>
            <Header/>
            <div style={{paddingTop: 70}}>
                <h1>Check Upload</h1>
                <FileInput accept="image/*" onChange={handleImageChange} placeholder="Выберите файл"
                           style={{width: 400}}/>
                <button onClick={handleUpload}>Upload</button>
            </div>
        </div>
    );
};

export const getServerSideProps = async (ctx: any) => ({
    props: {
        ...(await serverSideTranslations(ctx.locale, ['common']))
    }
});
