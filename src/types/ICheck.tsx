import { ObjectId } from 'bson';
import {DateTime} from "next-auth/providers/kakao";

export default interface ICheck {
    _id: ObjectId;
    user_id: ObjectId;
    bankAccount_id: ObjectId;
    checkPhoto?: any;
    checkText?: any;
    dateTime?: DateTime;
}