/*import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";
import IOperation from "@/src/types/IOperation";

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Tesseract = require('tesseract.js');

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { db } = await connectToDatabase();

    const checks = (await db
        .collection('checks')
        .find()
        .toArray()) as IOperation[];

    res.json({ users: checks});

    const {check_id, user_id, bankAccount_id} = req.body;

    try {
        const { buffer } = req.file;
        const { text } = await Tesseract.recognize(buffer, 'eng');

        const newCheck = new Check({
            text,
            imageUrl: `data:image/jpeg;base64,${buffer.toString('base64')}`,
        });

        await newCheck.save();
        res.status(200).json({ success: true, message: 'Check uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('image'), async (req: any, res: any) => {
    try {
        const { buffer } = req.file;
        const { text } = await Tesseract.recognize(buffer, 'eng');

        const newCheck = new Check({
            text,
            imageUrl: `data:image/jpeg;base64,${buffer.toString('base64')}`,
        });

        await newCheck.save();
        res.status(200).json({ success: true, message: 'Check uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});*/