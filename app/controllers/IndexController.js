const controller = require('./controller')
const hdAddress = require("hd-address")

class IndexController extends controller {

    index(req, res) {

        //   res.json(this.message())

        res.render('./index/index.ejs')

    }

    addressGenerator(req, res) {


        const mnemonic = 'excuse bunker ugly surround giant bread eye utility coil abuse tattoo kiss'
        let hdpath = "m/0'/0/0"
        let pwd = ''
        let hd = hdAddress.HD(mnemonic,hdAddress.keyType.mnemonic,pwd)

        let {address, pub, pri, path} = hd.TRX.getAddressByPath(hdpath)
        console.log(address, pub, pri, path)
    }

    message() {

        return 'this message from messag func';
    }


}

module.exports = new IndexController;