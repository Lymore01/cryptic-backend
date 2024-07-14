const bip39 = require('bip39')
const hdKey = require('hdkey')
const {privateToAddress} = require('ethereumjs-util')


const generateKeys = (phrase) =>{
    const mnemonic = phrase
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const hdWallet = hdKey.fromMasterSeed(seed)
    const path = "m/44'/60'/0'/0/0"
    const wallet = hdWallet.derive(path)
    const privateKey = wallet.privateKey.toString('hex')
    const address = privateToAddress(wallet.privateKey).toString('hex')
    const data = {
        "privateKey":privateKey,
        "address":address
    }

    return data
}

module.exports = generateKeys;



// Private Key:  2d18e9df117188b8c079a242174079119e77208c128b5f3d036f9b4383c7b93a
// Address:  81a3081b2c60574edca6501eb6ea2f76cdbb15a2