// src/components/PaymentForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaMoneyBillWave,
  FaCreditCard,
  FaUser,
  FaCalendarAlt,
  FaLock,
  FaTimes
} from "react-icons/fa";
import "./PaymentForm.css";

const luhnCheck = (num) => {
  const arr = (num + "")
    .split("")
    .reverse()
    .map((x) => parseInt(x, 10));
  const sum = arr.reduce((acc, val, idx) => {
    if (idx % 2 === 1) {
      let v = val * 2;
      if (v > 9) v -= 9;
      return acc + v;
    }
    return acc + val;
  }, 0);
  return sum % 10 === 0;
};

const PaymentForm = () => {
  const { id } = useParams(); // bookingId
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const [form, setForm] = useState({
    bookingId: "",
    method: "", // 'card' | 'cash'
    duration: 1,
    cardHolder: "",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });

  const [errors, setErrors] = useState({});

useEffect(() => {
  const fetchBookingAndSubscription = async () => {
    setLoadingBooking(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      // 1️⃣ Fetch booking first
      const bookingRes = await fetch(`http://localhost:2000/api/laborlink/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.message || "Failed to load booking");

      setBooking(bookingData);
      setForm((prev) => ({
        ...prev,
        bookingId: bookingData._id,
        duration: bookingData.hours || bookingData.days || 1,
      }));

      // 2️⃣ Fetch subscription using booking.customerId
      if (bookingData.customerId) {
        try {
          const subRes = await fetch(
            `http://localhost:2000/api/laborlink/subscriptions/${bookingData.customerId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const subData = await subRes.json();
          if (subRes.ok) setSubscription(subData);
          else setSubscription(null);
        } catch (subErr) {
          console.warn("No active subscription:", subErr);
          setSubscription(null);
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to load booking", "error");
    } finally {
      setLoadingBooking(false);
    }
  };

  fetchBookingAndSubscription();
}, [id]);


  const handleField = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((e) => ({ ...e, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.method) errs.method = "Please choose a payment method";
    if (!form.duration || form.duration <= 0) errs.duration = "Duration must be > 0";

    if (form.method === "card") {
      if (!form.cardHolder) errs.cardHolder = "Cardholder name required";
      if (!/^\d{13,19}$/.test(form.cardNumber) || !luhnCheck(form.cardNumber)) errs.cardNumber = "Invalid card number";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiryDate)) errs.expiryDate = "Invalid expiry (MM/YY)";
      if (!/^\d{3,4}$/.test(form.cvv)) errs.cvv = "Invalid CVV";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!validate()) return;

    const payload = {
      bookingId: form.bookingId,
      duration: Number(form.duration),
      paymentMethod: form.method,
      cardDetails: form.method === "card" ? {
        cardHolder: form.cardHolder,
        cardNumber: form.cardNumber,
        expiryDate: form.expiryDate,
        cvv: form.cvv
      } : undefined
    };

    setLoadingSubmit(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:2000/api/laborlink/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      // server returns JSON; but in some error cases it might be HTML; handle gracefully:
      let data;
      try { data = JSON.parse(text); } catch (err) { data = { message: text }; }

      if (!res.ok) {
        // Card declined or other error: show message
        Swal.fire("Payment Error", data.message || "Payment failed", "error");
        setLoadingSubmit(false);
        return;
      }

      // Success
      if (form.method === "card") {
        Swal.fire({
          icon: "success",
          title: "Payment Successful",
          text: "Your card was charged and booking is now ongoing."
        }).then(() => navigate("/customer/dashboard"));
      } else {
        // CASH flow
        Swal.fire({
          icon: "info",
          title: "Cash Payment Recorded",
          html: `Your booking is confirmed. Please pay <strong>Rs. ${data.payment?.totalAmount || ''}</strong> to the labor after the job is completed.`
        }).then(() => navigate("/customer/dashboard"));
      }
    } catch (err) {
      console.error("Payment submit error:", err);
      Swal.fire("Error", "Payment request failed", "error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingBooking) return <div className="payment-loading">Loading booking...</div>;
  if (!booking) return <div className="payment-error">Booking not found.</div>;

  // Calculate amount to show on UI (same logic as backend)
  const rate = booking.laborId?.paymentRate || booking.laborRate || 0;
  const paymentType = booking.paymentType || 'Hourly';
  const hours = booking.hours || 0;
  const days = booking.days || 0;

  const companyFee = subscription
    ? subscription.companyFee ?? 
        (subscription.planType === 'free' ? 1000 : subscription.planType === 'basic' ? 500 : 0)
    : 1000;

  const amount = paymentType === 'Hourly' ? rate * hours + companyFee : rate * days + companyFee;


  return (
    <div className="payment-form-container pro">
      <header className="payment-form-header">
        <h2><FaMoneyBillWave /> Checkout</h2>
        <div className="payment-summary">
          <div><strong>Service:</strong> {booking.service}</div>
          <div><strong>Labor:</strong> {booking.laborId?.name || '—'}</div>
          <div><strong>Duration:</strong> {form.duration} {booking.paymentType === 'Hourly' ? 'hour(s)' : 'day(s)'}</div>
          <div className="total-amt">Total: <strong>Rs. {amount.toLocaleString()}</strong></div>
        </div>
      </header>

      <form className="payment-form" onSubmit={submit}>
        <div className="field">
          <label>Duration</label>
          <input type="number" min="1" value={form.duration} onChange={(e) => handleField('duration', e.target.value)} disabled/>
          {errors.duration && <div className="err">{errors.duration}</div>}
        </div>

        <div className="method-select">
          <label>Payment Method</label>
          <div className="method-cards">
            <button
              type="button"
              className={`method-card ${form.method === 'card' ? 'selected' : ''}`}
              onClick={() => handleField('method', 'card')}
            >
              <FaCreditCard className="icon" />
              <div className="label">Card / Online</div>
              <div className="sub">Pay securely with card</div>
            </button>

            <button
              type="button"
              className={`method-card ${form.method === 'cash' ? 'selected' : ''}`}
              onClick={() => handleField('method', 'cash')}
            >
              <FaMoneyBillWave className="icon" />
              <div className="label">Cash on Service</div>
              <div className="sub">Pay labor in person after job</div>
            </button>
          </div>
          {errors.method && <div className="err">{errors.method}</div>}
        </div>

        {form.method === 'card' && (
          <div className="card-area">
            <div className="field">
              <label><FaUser /> Cardholder</label>
              <input type="text" value={form.cardHolder} onChange={(e) => handleField('cardHolder', e.target.value)} />
              {errors.cardHolder && <div className="err">{errors.cardHolder}</div>}
            </div>

            <div className="field">
              <label><FaCreditCard /> Card Number</label>
              <input type="text" maxLength="19" value={form.cardNumber} onChange={(e) => handleField('cardNumber', e.target.value.replace(/\s+/g, ''))} />
              {errors.cardNumber && <div className="err">{errors.cardNumber}</div>}
            </div>

            <div className="row">
              <div className="field small">
                <label><FaCalendarAlt /> Expiry (MM/YY)</label>
                <input type="text" placeholder="MM/YY" value={form.expiryDate} onChange={(e) => handleField('expiryDate', e.target.value)} />
                {errors.expiryDate && <div className="err">{errors.expiryDate}</div>}
              </div>
              <div className="field small">
                <label><FaLock /> CVV</label>
                <input type="password" maxLength="4" value={form.cvv} onChange={(e) => handleField('cvv', e.target.value)} />
                {errors.cvv && <div className="err">{errors.cvv}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Primary CTA */}
        <div className="actions">
          <button type="submit" className="btn primary" disabled={loadingSubmit}>
            {loadingSubmit ? 'Processing...' :
              (form.method === 'card' ? (<><FaCreditCard /> Pay Rs. {amount.toLocaleString()}</>) :
               (form.method === 'cash' ? (<><FaMoneyBillWave /> Confirm Cash Booking</>) :
               (<><FaTimes /> Select Method</>)))
            }
          </button>

          <button type="button" className="btn ghost" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
