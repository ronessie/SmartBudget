import { ObjectId } from 'bson';

export default interface IBankAccount {
    _id: ObjectId;
    user_id: number;
    secondUser_id?: number//?
    name?: string;
    currency?: string;
    balance?: number;
    lastUpdateDate?: Date
    invitingCode?: string;
}