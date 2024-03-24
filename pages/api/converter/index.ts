import {NextApiRequest, NextApiResponse} from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {sum, afterCurrency, beforeCurrency} = JSON.parse(req.body);

    fetch("https://api.apilayer.com/exchangerates_data/convert?to="+{beforeCurrency}+"&from="+{afterCurrency}+"&amount="+{sum}, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}