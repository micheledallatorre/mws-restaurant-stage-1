module.exports = {
    "parserOptions": {
        "ecmaVersion": 8
    },
    "env": {
        "browser": true//,
        //"es6": true
    },
    "extends": "eslint:recommended",
    "rules": {
        /*
        "indent": [
            "warn",
            "tab"
        ],
        */

        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "warn",
            "always"
        ],
        "no-console": "off",
        "no-unused-vars": [2, { vars: "local", args: "none" }]
    }
};