import * as Tesseract from "tesseract.js";
import {NextApiRequest, NextApiResponse} from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {path} = JSON.parse(req.body);
    Tesseract.recognize(
// this first argument is for the location of an image it can be a //url like below or you can set a local path in your computer
        'public/' + path,
// this second argument is for the language
        'eng',
        { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
        console.log(text);
    })

    return res.json({result: true});
}