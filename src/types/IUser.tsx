import { ObjectId } from 'bson';

export default interface IUser {
    _id: ObjectId;
    fio: string;
    email: string;
    phone: string;
    password: string;
    country: string;
    language: string;
    status: string;
}