const form = document.getElementById("bookingForm");

function scrollBooking() {

 document
   .getElementById("booking")
   .scrollIntoView({
     behavior: "smooth"
   });

}

form.addEventListener("submit", async (e) => {

 e.preventDefault();

 const bookingData = {

   guest_name:
     document.getElementById("guest_name").value,

   email:
     document.getElementById("email").value,

   room_type:
     document.getElementById("room_type").value,

   guests:
     document.getElementById("guests").value,

   check_in:
     document.getElementById("check_in").value,

   check_out:
     document.getElementById("check_out").value

 };

 const response = await fetch("/api/bookings", {

   method: "POST",

   headers: {
     "Content-Type": "application/json"
   },

   body: JSON.stringify(bookingData)

 });

 const result = await response.json();

 if (result.success) {

   alert("Booking Confirmed!");

   form.reset();

 } else {

   alert("Booking Failed");

 }

});
async function pay(amount, bookingData) {

 const res = await fetch("/api/payment/order", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ amount })
 });

 const order = await res.json();

 const options = {
   key: "YOUR_KEY_ID",
   amount: order.amount,
   currency: "INR",
   name: "LuxuryStay Hotel",

   handler: async function (response) {

     await fetch("/api/payment/verify", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         ...bookingData,
         payment_id: response.razorpay_payment_id,
         amount
       })
     });

     alert("Booking Confirmed!");

   }
 };

 const rzp = new Razorpay(options);
 rzp.open();

}
async function checkAvailability() {

 const data = {
   room_type: document.getElementById("room_type").value,
   check_in: document.getElementById("check_in").value,
   check_out: document.getElementById("check_out").value
 };

 const res = await fetch("/api/check-availability", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(data)
 });

 const result = await res.json();

 if (result.available) {
   alert("Room is AVAILABLE ✅");
 } else {
   alert("Room NOT available ❌");
 }

}
async function makePayment(amount, bookingData) {

 const res = await fetch("/api/payment/order", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ amount })
 });

 const order = await res.json();

 const options = {
   key: "YOUR_KEY_ID",
   amount: order.amount,
   currency: "INR",
   name: "Hotel Booking",

   handler: async function (response) {

     alert("Payment Success ✅");

     console.log(response);

   }
 };

 const rzp = new Razorpay(options);
 rzp.open();

}