const mongoose = require("mongoose");
const Listing = require("../models/listings.js");
const initData = require("./data.js");



//mongo server
const MONGO_URL = "mongodb://127.0.0.1:27017/Roamora";


//Mongoose main function
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}



const initDB = async () => {
  await Listing.deleteMany({});
initData.data=initData.data.map((obj) =>({...obj,owner:"687c96788de2666d29f10b6d"}));
await Listing.insertMany(initData.data);
console.log("data was initialized");
};
initDB();
