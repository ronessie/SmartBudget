import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useState } from "react";
import {FileInput} from "@mantine/core";
import Header from "../components/header"

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
        <div>
            <Header/>
            <h1>Check Upload</h1>
            <FileInput accept="image/*" onChange={handleImageChange} placeholder="Выберите файл" />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export const getServerSideProps = async (ctx: any) => ({
    props: {
        ...(await serverSideTranslations(ctx.locale, ['common']))
    }
});
