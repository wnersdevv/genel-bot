const { Schema, model } = require('mongoose');

const ticketSayacSchema = new Schema({
    guildId: { type: String, required: true, unique: true },
    sonTicketNo: { type: Number, default: 0 }
});

ticketSayacSchema.statics.sonrakiTicketNo = async function (guildId) {
    const sonuc = await this.findOneAndUpdate(
        { guildId },
        { $inc: { sonTicketNo: 1 } },
        { upsert: true, new: true }
    );
    return sonuc.sonTicketNo;
};

module.exports = model('TicketSayac', ticketSayacSchema);
