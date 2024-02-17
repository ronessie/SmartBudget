import {ObjectId} from "bson";
import IUser from "@/src/types/IUser";
import IBankAccount from "@/src/types/IBankAccount";

export function createUserObj(fio: string, email: string, password: string, bankAccount_id: string): IUser {
    return {
        _id: new ObjectId().toString(),
        fio: fio,
        email: email,
        password: password,
        status: "Authorized",
        currentBankAccount: bankAccount_id,
        twoStepAuth: false
    };
}

export function createBankAccountObj(userId: string, bankAccount_id: string): IBankAccount {
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

export function generate2FAcode() {
    const characters = '0123456789';
    let password = '';
    for (let i = 0; i < 6; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}

export function generatePassword() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}
