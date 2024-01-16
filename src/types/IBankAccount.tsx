import { ObjectId } from 'bson';
import {DateTime} from "next-auth/providers/kakao";

export default interface IBankAccount {
    _id: ObjectId;
    user_id: ObjectId;
    secondUser_id?: ObjectId;
    name?: string;
    currency?: string;
    balance?: number;
    lastUpdateDate?: DateTime;
    invitingCode?: string;
}