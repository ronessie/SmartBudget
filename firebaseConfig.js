import { initializeApp } from "firebase/app";
import {getStorage} from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAicdD45Q4uWzS3_oj9Vasaw5_1pdRk5-I",
    authDomain: "smartbudget-878b0.firebaseapp.com",
    projectId: "smartbudget-878b0",
    storageBucket: "smartbudget-878b0.appspot.com",
    messagingSenderId: "764783757546",
    appId: "1:764783757546:web:64931c70385bb3c2faef93",
    measurementId: "G-96TZTKVQ4V"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };