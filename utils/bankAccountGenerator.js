const { customAlphabet } = require("nanoid");
const BankAccounts = require("../models/BankAccountsModel")

const nanoidNumeric = customAlphabet("0123456789", 10); // מחזיר פונקציה שמייצרת מספר רנדומלי בן 10 ספרות

exports.generateUniqueBankAccount = async () => { //יוצר מספר חשבון בנק
  const uniqueNumber = nanoidNumeric();
  console.log("hi");
  const accountNumberCheck = await BankAccounts.findOne({ account: uniqueNumber });

  if (accountNumberCheck) {
    console.log(`Number ${uniqueNumber} already exists.`);
    return generateUniqueBankAccount(); // קריאה רקורסיבית אם המספר כבר קיים
  }
    console.log(`Number ${uniqueNumber} is unique.`);
    return uniqueNumber; // החזרת המספר הייחודי
}