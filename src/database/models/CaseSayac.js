const { Schema, model } = require('mongoose');

const caseSayacSchema = new Schema({
    guildId: { type: String, required: true, unique: true },
    sonCaseNo: { type: Number, default: 0 }
});

caseSayacSchema.statics.sonrakiCaseNo = async function (guildId) {
    const sonuc = await this.findOneAndUpdate(
        { guildId },
        { $inc: { sonCaseNo: 1 } },
        { upsert: true, new: true }
    );
    return sonuc.sonCaseNo;
};

module.exports = model('CaseSayac', caseSayacSchema);
