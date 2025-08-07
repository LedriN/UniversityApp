import React, { useState } from 'react';
import { X, Save, Euro } from 'lucide-react';
import { PaymentRecord } from '../types';

interface PaymentRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: {
    amount: number;
    paymentDate: string;
    description?: string;
    receiptNumber?: string;
  }) => Promise<void>;
  studentName: string;
  remainingDebt: number;
  loading?: boolean;
}

const PaymentRecordModal: React.FC<PaymentRecordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  studentName,
  remainingDebt,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    description: '',
    receiptNumber: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});



  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Shuma duhet të jetë më e madhe se 0';
    } else if (parseFloat(formData.amount) > remainingDebt) {
      newErrors.amount = `Shuma nuk mund të jetë më e madhe se borxhi i mbetur (€${remainingDebt.toLocaleString()})`;
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Data e pagesës është e detyrueshme';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit({
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        description: formData.description.trim() || undefined,
        receiptNumber: formData.receiptNumber.trim() || undefined
      });

      // Reset form
      setFormData({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        description: '',
        receiptNumber: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error adding payment record:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 m-0">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Euro className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Shto Pagesë të Re
              </h2>
              <p className="text-sm text-gray-500">
                {studentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shuma (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={remainingDebt}
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Borxhi i mbetur: €{remainingDebt.toLocaleString()}
            </p>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data e Pagesës <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => handleInputChange('paymentDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.paymentDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.paymentDate && <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>}
          </div>



          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Përshkrimi (opsional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Përshkrimi i pagesës..."
              rows={3}
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/200 karaktere
            </p>
          </div>

          {/* Receipt Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numri i Faturës (opsional)
            </label>
            <input
              type="text"
              value={formData.receiptNumber}
              onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Numri i faturës..."
              maxLength={50}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.receiptNumber.length}/50 karaktere
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Anulo
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Duke ruajtur...' : 'Ruaj Pagesën'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentRecordModal; 