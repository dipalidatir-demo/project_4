const urlModel = require("../model/model.js")
const shortId = require("short-id")
const redis = require("redis");

const { promisify } = require("util");

let validUrl = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}
const redisClient = redis.createClient(
    18564,
    "redis-18564.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("ohE28BBnzW6RxUS7J1r36W3HROlQDQmI", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});




const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


// ===========================================================================create url========================================================

exports.createUrl = async function (req, res) {

    try {
        let longUrl=req.body.longUrl


        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, msg: "please enter a link as a value" })

        }
        if (!validUrl.test(longUrl)) {
            return res.status(404).send({ status: false, msg: "please enter a valid url" })
        }
        let cacheData = await GET_ASYNC(`${longUrl}`)

        if (cacheData) {
            let cacheUrlData = JSON.parse(cacheData)

            data = {
                longUrl: cacheUrlData.longUrl,
                shortUrl: cacheUrlData.shortUrl,
                urlCode: cacheUrlData.urlCode
            }
            return res.status(200).send({ status:true, message: "url already exist", data:data })
        } else {
            let urlCode = shortId.generate().toLowerCase()

            let shortUrl = "http://localhost:3000/" + urlCode

            let savedData = { longUrl, shortUrl, urlCode }
            let saveUrl = await urlModel.create(savedData)

            result = {
                longUrl: saveUrl.longUrl,
                shortUrl: saveUrl.shortUrl,
                urlCode: saveUrl.urlCode
            }
            await SET_ASYNC(`${longUrl}`, JSON.stringify(result))
            return res.status(201).send({ status: true, msg: "succesfully generated", data: result })

        }

    }

    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}



// ========================================================= get url ===============================================================================

exports.getUrl = async function (req, res) {

    try {
        urlCode = req.params.urlCode

       
        let url = await GET_ASYNC(`${urlCode}`)
        if (url) {
            return res.status(302).redirect(JSON.parse(url).longUrl)
        }
        let url1 = await urlModel.findOne({ urlCode })

        if (url1) {

            await SET_ASYNC(`${urlCode}`,JSON.stringify(url1))
            return res.status(302).redirect(url1.longUrl)
        }

        else {

            return res.status(404).send({ status: false, msg: "short url not found", })

        }

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}









































