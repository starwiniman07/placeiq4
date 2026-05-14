"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Download, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const transactions = [
  { id: "1", date: "Oct 24, 2023", student: "Rahul S.", amount: 800, status: "Cleared" },
  { id: "2", date: "Oct 22, 2023", student: "Anita K.", amount: 1200, status: "Cleared" },
  { id: "3", date: "Oct 20, 2023", student: "Kevin P.", amount: 800, status: "Pending" },
  { id: "4", date: "Oct 18, 2023", student: "Sanya M.", amount: 1500, status: "Cleared" },
];

export default function InterviewerEarningsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 lg:p-12 relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Earnings Tracker</h1>
            <p className="text-gray-400 mt-1">Track your income and payout history.</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-500">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
            <p className="text-sm text-gray-400 mb-2">Available for Payout</p>
            <p className="text-4xl font-bold text-emerald-400">₹4,200</p>
            <Button variant="outline" className="mt-6 w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">Withdraw Funds</Button>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
            <p className="text-sm text-gray-400 mb-2">Total Earned (Oct)</p>
            <p className="text-4xl font-bold text-white">₹12,500</p>
            <div className="flex items-center gap-1 text-emerald-400 text-sm mt-4">
              <TrendingUp className="w-4 h-4" /> 12% increase from last month
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
            <p className="text-sm text-gray-400 mb-2">Sessions Completed</p>
            <p className="text-4xl font-bold text-white">42</p>
            <p className="text-xs text-gray-500 mt-4">Across all domains</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/40 text-left text-xs uppercase text-gray-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-300">{txn.date}</td>
                    <td className="px-6 py-4 text-sm font-medium">{txn.student}</td>
                    <td className="px-6 py-4 text-sm font-bold">₹{txn.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        txn.status === 'Cleared' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs text-blue-400 hover:underline">View Receipt</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
