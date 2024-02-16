import {ObjectId} from "bson";
import IUser from "@/src/types/IUser";
import IBankAccount from "@/src/types/IBankAccount";

export function createUserObj(fio: string, email: string, password: string, bankAccount_id: ObjectId): IUser {
    return {
        _id: new ObjectId(),
        fio: fio,
        email: email,
        password: password,
        status: "Authorized",
        currentBankAccount: bankAccount_id,
        twoStepAuth: false
    };
}

export function createBankAccountObj(userId: ObjectId, bankAccount_id: ObjectId): IBankAccount {
    return {
        _id: bankAccount_id,
        user_id: userId,
        name: "Счёт",
        currency: "BYN",
        balance: 0,
        invitingCode: inviteCode(),
    };
}

export function inviteCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let code = '';
    for (let i = 0; i < 16; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}
