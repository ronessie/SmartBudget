const path = require('path')

module.exports = {
    i18n: {
        defaultLocale: 'ru',
        localeDetection: false,
        locales: ['ru', 'en'],
        localePath: path.resolve('./public/locales'),
    },
}