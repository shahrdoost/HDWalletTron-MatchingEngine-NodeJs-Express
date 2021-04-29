const controller = require('./controller')


class IndexController extends controller {

    index(req,res){
        res.json('welcome ma boy')
    }


}

module.exports = new IndexController;