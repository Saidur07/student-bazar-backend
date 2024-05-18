const firebase = require('../../firebase/firebase')
// const Minio = require('minio')

// var minioClient = new Minio.Client({
//     endPoint: 'min-io.server.genres-agency.com',
//     port: 9000,
//     useSSL: true,
//     accessKey: 'iztt5IG3bIDf0sUT',
//     secretKey: 'TWObE7s557xvXQhdQnrdoXeGfAkR27qg',
// })

// console.log(minioClient)
// minioClient.makeBucket('europetrip', 'us-east-1', function (err) {
//     if (err) return console.log(err)

//     console.log('Bucket created successfully in "us-east-1".')
// });

const UploadToStorage = async (FilePath) => {
    if (!FilePath) {
        return {
            MediaURL: null,
        }
    }
    const PhotoInfo = await firebase
        .storage()
        .bucket(process.env.STORAGE_BUCKET_NAME)
        .upload(FilePath,
            {
                public: true
            }
        );
    return PhotoInfo;
}

// const UploadTOMinIO = async (FilePath) => {
//     if (!FilePath) {
//         return {
//             MediaURL: null,
//         }
//     }
//     // minioClient.fPutObject
// }

module.exports = UploadToStorage
