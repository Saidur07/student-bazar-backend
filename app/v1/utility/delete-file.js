const firebase = require('../../firebase/firebase');

const deleteFile = async (photoURL) => {
    try {
        const bucket = process.env.STORAGE_BUCKET_NAME

        const fileName = photoURL?.split('/')?.pop()?.split('?')[0]
        console.log(fileName)

        const file = await firebase?.storage()?.bucket(bucket)?.file(fileName)
        return await file?.delete()
    } catch (e) {
        console.log(e.message)
        return e.message
    }
}

module.exports = deleteFile;