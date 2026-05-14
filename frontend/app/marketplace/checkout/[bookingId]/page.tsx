"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";

export default function MockCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [roomId, setRoomId] = useState("");

  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Mock Initiate
      const initRes = await api.post("/api/payment/mock-initiate", {
        bookingId: params.bookingId,
        amount: 800 // Hardcoded for demo
      });
      
      // 2. Simulate delay for Luhn/Network
      await new Promise(res => setTimeout(res, 2000));
      
      // 3. Confirm Payment
      const confRes = await api.post("/api/payment/mock-confirm", {
        paymentId: initRes.data.paymentId,
      });

      setRoomId(confRes.data.booking.roomId);
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Payment Successful!</h1>
        <p className="text-gray-400 mb-8 text-center">Your mock interview slot has been confirmed.</p>
        
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl max-w-md w-full text-center">
          <p className="text-sm text-gray-400 mb-2">Your WebRTC Room ID</p>
          <div className="text-2xl font-mono font-bold text-emerald-400 tracking-widest mb-6">{roomId}</div>
          <Button 
            onClick={() => router.push(`/marketplace/room/${roomId}`)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Enter Interview Room Now <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2 flex justify-center items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" /> Secure Checkout
          </h1>
          <p className="text-gray-400 text-sm">Simulated Payment Gateway. Use any dummy details.</p>
        </div>

        <form onSubmit={handlePayment} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl">
          <div className="space-y-5 mb-8">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Card Number</label>
              <div className="relative">
                <CreditCard className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input 
                  required
                  type="text" 
                  maxLength={19}
                  placeholder="4111 1111 1111 1111" 
                  className="pl-10 bg-black/50 border-white/10"
                  value={cardData.number}
                  onChange={e => setCardData({...cardData, number: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Cardholder Name</label>
              <Input 
                required
                type="text" 
                placeholder="JOHN DOE" 
                className="bg-black/50 border-white/10 uppercase"
                value={cardData.name}
                onChange={e => setCardData({...cardData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Expiry Date</label>
                <Input 
                  required
                  type="text" 
                  placeholder="MM/YY" 
                  maxLength={5}
                  className="bg-black/50 border-white/10"
                  value={cardData.expiry}
                  onChange={e => setCardData({...cardData, expiry: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">CVV</label>
                <Input 
                  required
                  type="password" 
                  placeholder="***" 
                  maxLength={3}
                  className="bg-black/50 border-white/10"
                  value={cardData.cvv}
                  onChange={e => setCardData({...cardData, cvv: e.target.value})}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12 text-lg rounded-xl flex items-center justify-center relative overflow-hidden"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing Payment...
              </span>
            ) : (
              "Pay ₹800"
            )}
            {!loading && <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-white/20 to-transparent skew-x-[-20deg] transform translate-x-full group-hover:-translate-x-[500%] transition-transform duration-1000"></div>}
          </Button>
        </form>
      </div>
    </div>
  );
}
