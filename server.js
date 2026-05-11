const express = require("express");
const path = require("path");
const cors = require("cors");
const db = require("./db");
const Razorpay = require("razorpay");
const authRoutes = require("./auth");

const app = express();
const PORT = 5000;

const razorpay = new Razorpay({      
  key_id: "YOUR_KEY_ID",
  key_secret: "YOUR_KEY_SECRET"
});
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/api/auth", authRoutes);


app.get("/api/bookings", (req, res) => {

 const sql = "SELECT * FROM bookings";

 db.query(sql, (err, result) => {
   if (err) {
     res.status(500).json(err);
   } else {
     res.json(result);
   }
 });

});

app.post("/api/bookings", (req, res) => {

 const {
   guest_name,
   email,
   room_type,
   guests,
   check_in,
   check_out
 } = req.body;

 const sql = `
   INSERT INTO bookings
   (guest_name, email, room_type, guests, check_in, check_out)
   VALUES (?, ?, ?, ?, ?, ?)
 `;

 db.query(
   sql,
   [
     guest_name,
     email,
     room_type,
     guests,
     check_in,
     check_out
   ],
   (err, result) => {

     if (err) {
       res.status(500).json(err);
     } else {
       res.json({
         success: true,
         message: "Booking Confirmed"
       });
     }

   }
 );

});

app.post("/api/payment/order", async (req, res) => {

 const { amount } = req.body;

 const options = {
   amount: amount * 100, // paise
   currency: "INR",
   receipt: "receipt_" + Date.now()
 };

 const order = await razorpay.orders.create(options);

 res.json(order);

});

app.post("/api/payment/verify", (req, res) => {

 const {
   guest_name,
   email,
   room_type,
   guests,
   check_in,
   check_out,
   payment_id,
   amount
 } = req.body;

 const sql = `
 INSERT INTO bookings
 (guest_name, email, room_type, guests, check_in, check_out, payment_id, amount, status)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
 `;

 db.query(sql, [
   guest_name,
   email,
   room_type,
   guests,
   check_in,
   check_out,
   payment_id,
   amount
 ], (err) => {

   if (err) {
     return res.json({ success: false });
   }

   res.json({ success: true });

 });

});
app.post("/api/check-availability", (req, res) => {

  const { room_type, check_in, check_out } = req.body;

  const sql = `
    SELECT * FROM bookings
    WHERE room_type = ?
    AND (
      (check_in <= ? AND check_out >= ?)
    )
  `;

  db.query(sql, [room_type, check_out, check_in], (err, result) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error checking availability"
      });
    }

    if (result.length > 0) {
      res.json({ available: false });
    } else {
      res.json({ available: true });
    }

  });

});

app.get("/api/admin/bookings", (req, res) => {

 db.query("SELECT * FROM bookings", (err, result) => {
   res.json(result);
 });

});
app.delete("/api/delete-booking/:id", (req, res) => {

 const id = req.params.id;

 db.query("DELETE FROM bookings WHERE id=?", [id], () => {
   res.json({ success: true });
 });

});
app.get("/api/user-bookings/:email", (req, res) => {

 const email = req.params.email;

 db.query(
   "SELECT * FROM bookings WHERE email=?",
   [email],
   (err, result) => {
     res.json(result);
   }
 );

});
app.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT}`);
});
