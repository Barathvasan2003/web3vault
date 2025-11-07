'use client';

import React, { useState } from 'react';

interface EmergencyCardProps {
    account: any;
}

export default function EmergencyCard({ account }: EmergencyCardProps) {
    const [formData, setFormData] = useState({
        bloodType: 'O+',
        allergies: '',
        medications: '',
        conditions: '',
        emergencyContact: '',
        emergencyPhone: '',
        doctorName: '',
        doctorPhone: '',
    });

    const [qrData, setQrData] = useState('');
    const [showCard, setShowCard] = useState(false);

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const generateCard = () => {
        const cardData = {
            name: account.meta?.name || 'Unknown',
            address: account.address,
            ...formData,
            generatedAt: new Date().toISOString(),
        };

        // Generate QR data (in production, this would be a URL to a secure page)
        const qrJson = JSON.stringify(cardData);
        setQrData(`data:text/plain;charset=utf-8,${encodeURIComponent(qrJson)}`);
        setShowCard(true);

        // Save to localStorage
        localStorage.setItem(`emergency_${account.address}`, JSON.stringify(cardData));
    };

    const downloadCard = () => {
        const cardHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Emergency Medical Card - ${account.meta?.name || 'Patient'}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 400px;
      margin: 20px auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .card {
      background: white;
      border-radius: 15px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    h1 {
      color: #E6007A;
      text-align: center;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .field {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .label {
      font-weight: bold;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
    }
    .value {
      color: #333;
      font-size: 16px;
      margin-top: 5px;
    }
    .blood-type {
      background: #E6007A;
      color: white;
      padding: 10px 20px;
      border-radius: 50px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      margin: 20px 0;
    }
    .emergency {
      background: #ff4444;
      color: white;
      padding: 15px;
      border-radius: 10px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #999;
      font-size: 10px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🆘 EMERGENCY MEDICAL CARD</h1>
    
    <div class="field">
      <div class="label">Patient Name</div>
      <div class="value">${account.meta?.name || 'Unknown'}</div>
    </div>

    <div class="blood-type">
      🩸 Blood Type: ${formData.bloodType}
    </div>

    ${formData.allergies ? `
    <div class="emergency">
      <div class="label" style="color: white;">⚠️ ALLERGIES</div>
      <div class="value" style="color: white; font-weight: bold;">${formData.allergies}</div>
    </div>
    ` : ''}

    ${formData.medications ? `
    <div class="field">
      <div class="label">Current Medications</div>
      <div class="value">${formData.medications}</div>
    </div>
    ` : ''}

    ${formData.conditions ? `
    <div class="field">
      <div class="label">Medical Conditions</div>
      <div class="value">${formData.conditions}</div>
    </div>
    ` : ''}

    ${formData.emergencyContact ? `
    <div class="field">
      <div class="label">Emergency Contact</div>
      <div class="value">${formData.emergencyContact}</div>
      <div class="value" style="color: #E6007A;">📞 ${formData.emergencyPhone}</div>
    </div>
    ` : ''}

    ${formData.doctorName ? `
    <div class="field">
      <div class="label">Primary Care Doctor</div>
      <div class="value">${formData.doctorName}</div>
      <div class="value">📞 ${formData.doctorPhone}</div>
    </div>
    ` : ''}

    <div class="footer">
      Generated: ${new Date().toLocaleDateString()}<br>
      Powered by WebVault3 🔐
    </div>
  </div>
</body>
</html>
    `;

        const blob = new Blob([cardHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `emergency-card-${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                    🆘
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Emergency Medical Card</h2>
                    <p className="text-sm text-gray-600">Quick access to critical health information</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Blood Type */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        🩸 Blood Type *
                    </label>
                    <select
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-gray-800 font-medium"
                    >
                        {bloodTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Allergies */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ⚠️ Allergies
                    </label>
                    <input
                        type="text"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleInputChange}
                        placeholder="Penicillin, Peanuts, etc."
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-gray-800"
                    />
                </div>

                {/* Current Medications */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        💊 Current Medications
                    </label>
                    <textarea
                        name="medications"
                        value={formData.medications}
                        onChange={handleInputChange}
                        placeholder="List your current medications..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none resize-none text-gray-800"
                    />
                </div>

                {/* Medical Conditions */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        🏥 Medical Conditions
                    </label>
                    <textarea
                        name="conditions"
                        value={formData.conditions}
                        onChange={handleInputChange}
                        placeholder="Diabetes, Hypertension, etc."
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none resize-none text-gray-800"
                    />
                </div>

                {/* Emergency Contact */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        👤 Emergency Contact Name
                    </label>
                    <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-gray-800"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📞 Emergency Contact Phone
                    </label>
                    <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleInputChange}
                        placeholder="+1 234 567 8900"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-gray-800"
                    />
                </div>

                {/* Doctor Info */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        👨‍⚕️ Primary Care Doctor
                    </label>
                    <input
                        type="text"
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleInputChange}
                        placeholder="Dr. Smith"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-gray-800"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📞 Doctor Phone
                    </label>
                    <input
                        type="tel"
                        name="doctorPhone"
                        value={formData.doctorPhone}
                        onChange={handleInputChange}
                        placeholder="+1 234 567 8900"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-gray-800"
                    />
                </div>
            </div>

            {/* Generate Button */}
            <button
                onClick={generateCard}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
                🆘 Generate Emergency Card
            </button>

            {/* Preview Card */}
            {showCard && (
                <div className="mt-8 p-8 bg-white border-2 border-red-200 rounded-3xl shadow-xl">
                    <div className="text-center mb-8">
                        <div className="inline-block bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-2xl px-6 py-3 mb-4">
                            <h3 className="text-2xl font-bold">
                                🆘 EMERGENCY MEDICAL INFORMATION
                            </h3>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Show this card to medical professionals in case of emergency
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border-2 border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 mb-2">Patient Name</p>
                            <p className="text-xl font-bold text-gray-800">{account.meta?.name || 'Unknown'}</p>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-5 rounded-2xl border-2 border-red-200">
                            <p className="text-xs font-semibold text-red-600 mb-2">Blood Type</p>
                            <p className="text-3xl font-bold text-red-500">🩸 {formData.bloodType}</p>
                        </div>

                        {formData.allergies && (
                            <div className="md:col-span-2 bg-gradient-to-br from-red-100 to-orange-100 p-5 rounded-2xl border-2 border-red-300">
                                <p className="text-xs font-bold text-red-600 mb-2">⚠️ ALLERGIES (CRITICAL)</p>
                                <p className="text-lg font-bold text-red-700">{formData.allergies}</p>
                            </div>
                        )}

                        {formData.medications && (
                            <div className="md:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-purple-200">
                                <p className="text-xs font-semibold text-purple-600 mb-2">💊 Current Medications</p>
                                <p className="text-base text-gray-700">{formData.medications}</p>
                            </div>
                        )}

                        {formData.conditions && (
                            <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border-2 border-blue-200">
                                <p className="text-xs font-semibold text-blue-600 mb-2">🏥 Medical Conditions</p>
                                <p className="text-base text-gray-700">{formData.conditions}</p>
                            </div>
                        )}

                        {formData.emergencyContact && (
                            <div className="md:col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-200">
                                <p className="text-xs font-semibold text-green-600 mb-2">👤 Emergency Contact</p>
                                <p className="text-base font-bold text-gray-800">{formData.emergencyContact}</p>
                                <p className="text-base text-green-600 font-semibold">📞 {formData.emergencyPhone}</p>
                            </div>
                        )}

                        {formData.doctorName && (
                            <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border-2 border-indigo-200">
                                <p className="text-xs font-semibold text-indigo-600 mb-2">👨‍⚕️ Primary Care Doctor</p>
                                <p className="text-base font-bold text-gray-800">{formData.doctorName}</p>
                                <p className="text-base text-indigo-600 font-semibold">📞 {formData.doctorPhone}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={downloadCard}
                        className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    >
                        💾 Download Emergency Card
                    </button>
                </div>
            )}

            {/* Info */}
            <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl">
                <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        💡
                    </div>
                    <div className="text-sm">
                        <p className="font-bold text-blue-600 mb-3 text-base">How to use your Emergency Card:</p>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2 font-bold">•</span>
                                <span>Fill in your medical information in the form above</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2 font-bold">•</span>
                                <span>Click "Generate Emergency Card" to create your card</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2 font-bold">•</span>
                                <span>Download and print it - keep it in your wallet or phone case</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2 font-bold">•</span>
                                <span>First responders can access your critical health info instantly</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
