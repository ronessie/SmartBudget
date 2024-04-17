import * as Tesseract from "tesseract.js";
import {NextApiRequest, NextApiResponse} from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {path} = JSON.parse(req.body);
    let result;
    Tesseract.recognize(
        'public/' + path,
        'eng+rus',
        { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
        console.log(text);
        result = text
        return res.json({result: result});
    })
}