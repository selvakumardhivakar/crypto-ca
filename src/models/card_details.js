const mongoose = require("mongoose");
const steggy = require("steggy");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const User = require("../models/user");
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

cardSchema.statics.findByCredentials = async (owner, cardName, buffer, passphrase) => {
  var card = await Cards.findOne({ owner, card_name: cardName });
  if (!card) {
    throw new Error("Check the ownership!");
  }
  // await card.populate("cards").execPopulate();
  const isValid = await bcrypt.compare(passphrase, card.passphrase);
  if (!isValid) {
    throw new Error("Check the credentials");
  }
  const revealed = steggy
    .reveal()(buffer)
    .toString();
  console.log(revealed);

  return [card, revealed];
};

cardSchema.pre("save", async function(next) {
  const card = this;
  // await card.populate("cards").execPopulate();
  if (card.isModified("passphrase")) {
    card.passphrase = await bcrypt.hash(card.passphrase, 8);
  }
  next();
});

const Cards = mongoose.model("Cards", cardSchema);
// Exporting card model
module.exports = Cards;
