import { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle, Loader, Shield, Zap } from 'lucide-react';
import { enrollmentAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const formatCardNumber = (val) =>
  val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (val) =>
  val.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/');

export default function PaymentModal({ course, onClose, onSuccess }) {
  const { updateUserXP } = useAuth();
  const [step, setStep] = useState('form'); // form | processing | success | error
  const [error, setError] = useState('');
  const [txnId, setTxnId] = useState('');
  const [form, setForm] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') return setForm((p) => ({ ...p, cardNumber: formatCardNumber(value) }));
    if (name === 'expiryDate') return setForm((p) => ({ ...p, expiryDate: formatExpiry(value) }));
    if (name === 'cvv') return setForm((p) => ({ ...p, cvv: value.replace(/\D/g, '').slice(0, 4) }));
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    setStep('processing');
    try {
      const res = await enrollmentAPI.pay({
        courseId: course.id,
        cardholderName: form.cardholderName,
        cardNumber: form.cardNumber.replace(/\s/g, ''),
        expiryDate: form.expiryDate,
        cvv: form.cvv,
      });
      setTxnId(res.data.transactionId);
      updateUserXP(50);
      setStep('success');
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setStep('form');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && step !== 'processing' && onClose()}>

      <div className="w-full max-w-md rounded-2xl overflow-hidden animate-slide-up"
        style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}>

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(139,92,246,0.1))' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Secure Checkout</h3>
              <p className="text-slate-400 text-xs flex items-center gap-1">
                <Lock className="w-3 h-3" /> 256-bit SSL encrypted
              </p>
            </div>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Course summary */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs mb-1">Enrolling in</p>
            <p className="text-white font-semibold text-sm">{course.title}</p>
            <p className="text-slate-500 text-xs">{course.subject} • by {course.instructor?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              ₹{course.monthlyPrice}
            </p>
            <p className="text-slate-500 text-xs">per month</p>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Cardholder Name</label>
                <input
                  name="cardholderName" value={form.cardholderName}
                  onChange={handleChange} placeholder="John Doe"
                  className="input-field text-sm" required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Card Number</label>
                <div className="relative">
                  <input
                    name="cardNumber" value={form.cardNumber}
                    onChange={handleChange} placeholder="1234 5678 9012 3456"
                    className="input-field text-sm pr-12 font-mono tracking-widest" required
                  />
                  <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Expiry</label>
                  <input
                    name="expiryDate" value={form.expiryDate}
                    onChange={handleChange} placeholder="MM/YY"
                    className="input-field text-sm font-mono" required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wider">CVV</label>
                  <input
                    name="cvv" value={form.cvv}
                    onChange={handleChange} placeholder="123"
                    type="password" className="input-field text-sm font-mono" required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Test card hint */}
              <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/20">
                <p className="text-sky-400 text-xs font-medium mb-1">Demo: Use any test card</p>
                <p className="text-slate-500 text-xs font-mono">4111 1111 1111 1111 · 12/26 · 123</p>
              </div>

              <button type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                <Lock className="w-4 h-4" />
                Pay ₹{course.monthlyPrice} Securely
              </button>

              <div className="flex items-center justify-center gap-4 text-slate-600 text-xs">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Instant Access</span>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-10 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-700" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-sky-500 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>Processing Payment</p>
                <p className="text-slate-400 text-sm mt-1">Please wait, do not close this window...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-6 flex flex-col items-center gap-5 text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.2)', border: '2px solid rgba(16,185,129,0.4)' }}>
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Payment Successful! 🎉
                </h3>
                <p className="text-slate-400 text-sm">
                  You're now enrolled in <span className="text-white font-medium">{course.title}</span>
                </p>
                <div className="mt-3 px-4 py-2 rounded-lg bg-slate-800/60 inline-block">
                  <p className="text-xs text-slate-500">Transaction ID</p>
                  <p className="text-xs font-mono text-sky-400">{txnId}</p>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-amber-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">+50 XP earned!</span>
                </div>
              </div>
              <button onClick={onSuccess}
                className="btn-primary px-8 py-3 flex items-center gap-2">
                Start Learning Now →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
