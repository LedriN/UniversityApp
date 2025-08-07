import React from 'react';
import { Trash2, Euro, Calendar, User, FileText } from 'lucide-react';
import { PaymentRecord } from '../types';

interface PaymentRecordsListProps {
  paymentRecords: PaymentRecord[];
  onDeleteRecord: (id: string) => Promise<void>;
  loading?: boolean;
}

const PaymentRecordsList: React.FC<PaymentRecordsListProps> = ({
  paymentRecords,
  onDeleteRecord,
  loading = false
}) => {


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Duke ngarkuar pagesat...</span>
      </div>
    );
  }

  if (paymentRecords.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
          <Euro className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk ka pagesa</h3>
        <p className="text-gray-500">Nuk u gjetën pagesa për këtë student.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Historiku i Pagesave ({paymentRecords.length})
        </h3>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shuma
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Përshkrimi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regjistruar nga
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veprime
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatDate(record.paymentDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-green-600">
                      €{record.amount.toLocaleString()}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {record.description ? (
                        <div className="flex items-start">
                          <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="truncate max-w-xs">{record.description}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                      {record.receiptNumber && (
                        <div className="text-xs text-gray-500 mt-1">
                          Fatura: {record.receiptNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {record.recordedBy.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Fshi pagesën"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Totali i pagesave:</span>
            <span className="ml-2 font-medium text-green-600">
              €{paymentRecords.reduce((sum, record) => sum + record.amount, 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Numri i pagesave:</span>
            <span className="ml-2 font-medium text-gray-900">
              {paymentRecords.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Pagesa e fundit:</span>
            <span className="ml-2 font-medium text-gray-900">
              {paymentRecords.length > 0 ? formatDate(paymentRecords[0].paymentDate) : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRecordsList; 