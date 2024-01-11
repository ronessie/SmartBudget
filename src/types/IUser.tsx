import { ObjectId } from 'bson';
import {DateTime} from "next-auth/providers/kakao";

export default interface IUser {
    _id: ObjectId;
    twoStepAuth?: boolean;
    twoStepAuthCode?: string;
    fio?: string;
    email?: string;
    password?: string;
    sum?: number;
    lastUpdateDate?: DateTime;
    balance?: number;
    currency?: string;
    category?: string;
    date?: DateTime;
    status: string;
    operationsStatus?: string;
}