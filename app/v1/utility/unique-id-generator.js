const GenerateUniqueId = () => {
    return Number(String(Date.now()) + String(Math.floor(Math.random() * 100000)))
}

module.exports = {
    GenerateUniqueId
}