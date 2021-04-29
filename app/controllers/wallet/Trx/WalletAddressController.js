const controller = require('../../controller')
const hdAddress = require("hd-address")

const mnemonic = 'excuse bunker ugly surround giant bread eye utility coil abuse tattoo kiss'

class WalletAddressController extends controller {

    Generator(req, res) {

        let indexNumber = req.body.userid;
        let indexNumberStr = indexNumber.toString()

        let hdpath = `m/0'/0/${indexNumberStr}`;
        let pwd = ''
        let hd = hdAddress.HD(mnemonic, hdAddress.keyType.mnemonic, pwd)

        let {address, pub, pri, path} = hd.TRX.getAddressByPath(hdpath)

        console.log(address, pri)
        //  res.end(address + '-' + pub + '-' + pri + '-' + path)
        res.end(address)

    }

    GeneratorJust(userid) {

        let indexNumber = userid;
        let indexNumberStr = indexNumber.toString()

        let hdpath = `m/0'/0/${indexNumberStr}`;
        let pwd = ''
        let hd = hdAddress.HD(mnemonic, hdAddress.keyType.mnemonic, pwd)

        let {address, pub, pri, path} = hd.TRX.getAddressByPath(hdpath)

        //    console.log(address, pub, pri, path)
        //  res.end(address + '-' + pub + '-' + pri + '-' + path)
        return address

    }

    GetPriKey(userid) {

        let indexNumberStr = userid.toString();

        let hdpath = `m/0'/0/${indexNumberStr}`;
        let pwd = ''
        let hd = hdAddress.HD(mnemonic, hdAddress.keyType.mnemonic, pwd)

        let {address, pub, pri, path} = hd.TRX.getAddressByPath(hdpath)
        //console.log(address + '-' + path + '-' + pri)
        return pri
    }

}

module.exports = new WalletAddressController;