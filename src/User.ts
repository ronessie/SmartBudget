import { ObjectId } from 'bson';

export type User = {
    _id: ObjectId;
    fio: string;
    email: string;
    phone: string;
    password: string;
    language: string;
    points: number;
}