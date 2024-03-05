import path from 'path';
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useState} from "react";
import axios from "axios";
import {Input} from "@mantine/core";

path.resolve('./next.config.js');

export default function Page() {
    const [image, setImage] = useState(null);

    const handleImageChange = (e: any) => {
        const file = e.target.files[0];
        setImage(file);
    };

    const handleUpload = async () => {
        /*if (image) {
            const formData = new FormData();
            formData.append('image', image);

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                console.log('Image saved at:', data.imagePath);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }*/
        /*try {
            const formData = new FormData();
            formData.append('image', image);

            await axios.post('http://localhost:3001/api/upload', formData);

            // Дополнительные действия при успешной загрузке, например, обновление интерфейса
        } catch (error) {
            console.error(error);
        }*/
    };

    return (
        <div>
            <h1>Check Upload</h1>
            <Input type="file" accept="image/*" onChange={handleImageChange}/>
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export const getServerSideProps = async (ctx: any) => ({
    props: {
        ...(await serverSideTranslations(ctx.locale, ['common']))
    }
});