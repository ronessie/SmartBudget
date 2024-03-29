import {DateTime} from "next-auth/providers/kakao";

export default interface ICheck {
    _id: string;
    user_id: string;
    bankAccount_id: string;
    filePath: any;
    checkText?: any;
    dateTime?: DateTime;
}
