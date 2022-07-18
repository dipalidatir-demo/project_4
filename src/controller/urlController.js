const urlModel = require("../model/model.js")
const shortId = require("short-id")


let validUrl = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}



const createUrl = async function (req, res) {

    try {
        let longUrl = req.body.longUrl


        if (!isValid(longUrl)) {
           return res.status(400).send({ status: false, msg: "please enter a link as a value" })

        }
     if(!validUrl.test(longUrl)){
       return res.status(400).send({ status: false, msg: "please enter a valid url" })
     }

        let urlCode = shortId.generate().toLowerCase()

        let shortUrl = "localhost:3000/" + urlCode


        let savedData = { longUrl, shortUrl, urlCode }
        let saveUrl = await urlModel.create(savedData)
     
        result = {
            longUrl: saveUrl.longUrl,
            shortUrl: saveUrl.shortUrl,
            urlCode: saveUrl.urlCode
        }

        return res.status(201).send({ status: true, msg: "succesfully generated", data: result })

    }

    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}


    const getUrl = async function (req, res) {
        urlCode = req.params.urlCode
        if(!urlCode) return res.status(400).send({status:false,msg:" please enter url code in req param"})
   
        let url = await urlModel.findOne({ urlCode })
        if (!url) {
           return  res.status(404).send({ status: false, msg: "url not found", })
        }

         res.status(302).redirect(url.longUrl)
    }

    module.exports.createUrl = createUrl
    module.exports.getUrl = getUrl

























