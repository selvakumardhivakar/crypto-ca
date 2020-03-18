const mongoose = require("mongoose");
// mongoose schema for card
const cardSchema = new mongoose.Schema(
  {
    card_name: {
      type: String,
      required: true
    },
    passphrase: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Your password can't be a password!");
        }
      }
    },
    card_details_private_key: {
      type: String,
      required: true
    },
    card_details_user_snap: {
      type: String,
      required: true
    },
    snapshot: {
      type: Buffer
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

cardSchema.methods.toJSON = function() {
  const card = this;
  const cardObject = card.toObject();
  delete cardObject.card_details_private_key;
  delete cardObject.snapshot;
  delete cardObject.owner;
  delete cardObject.passphrase;
  delete cardObject.card_details_user_snap;
  return cardObject;
};

const Card_details = mongoose.model("Cards", cardSchema);
// Exporting card model
module.exports = Card_details;
