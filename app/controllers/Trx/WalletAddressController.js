const controller = require('../controller')
const hdAddress = require("hd-address")

class WalletAddressController extends controller {

    Generator(req, res) {


        let indexNumber = req.body.userid;
        let indexNumberStr = indexNumber.toString()

        const mnemonic = 'excuse bunker ugly surround giant bread eye utility coil abuse tattoo kiss'
        let hdpath = `m/0'/0/${indexNumberStr}`;
        let pwd = ''
        let hd = hdAddress.HD(mnemonic, hdAddress.keyType.mnemonic, pwd)

        let {address, pub, pri, path} = hd.TRX.getAddressByPath(hdpath)

        //    console.log(address, pub, pri, path)
        //  res.end(address + '-' + pub + '-' + pri + '-' + path)
        res.end(address)
    }

}

module.exports = new WalletAddressController;