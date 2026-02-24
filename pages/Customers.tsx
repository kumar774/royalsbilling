import React, { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useRestaurants } from '../context/RestaurantContext';
import { Order } from '../types';
import { MessageSquare, Download } from 'lucide-react';
import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  mostOrderedItem: string;
  lastOrderedAt: string;
  isVIP: boolean;
}

const Customers: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { selectedRestaurant: currentRestaurant } = useRestaurants();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("Special offer for our valued customers! Get 20% off on your next order.");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const ordersRef = collection(db, 'restaurants', restaurantId, 'orders');
        const q = query(ordersRef);
        const querySnapshot = await getDocs(q);

        const customerMap = new Map<string, CustomerData>();

        querySnapshot.forEach((doc) => {
          const order = doc.data() as Order;
          if (order.customerPhone && order.customerName) {
            const customerKey = order.customerPhone;
            let customer = customerMap.get(customerKey);

            if (!customer) {
              customer = {
                id: customerKey,
                name: order.customerName || 'Guest',
                phone: order.customerPhone,
                totalOrders: 0,
                totalSpent: 0,
                mostOrderedItem: 'N/A',
                lastOrderedAt: 'N/A',
                isVIP: false,
              };
            }

            customer.totalOrders += 1;
            customer.totalSpent += order.total;
            customer.lastOrderedAt = order.createdAt; // Assuming createdAt is latest order

            // Simple logic for most ordered item (can be improved)
            const firstItemName = order.items?.[0]?.name;
            if (firstItemName) {
              customer.mostOrderedItem = firstItemName;
            }

            if (new Date(order.createdAt) > new Date(customer.lastOrderedAt)) {
              customer.lastOrderedAt = order.createdAt;
            }

            // Simple logic for most ordered item (can be improved)
            if (order.items.length > 0) {
              const itemCounts = new Map<string, number>();
              order.items.forEach(item => {
                itemCounts.set(item.name, (itemCounts.get(item.name) || 0) + item.quantity);
              });
              let mostOrdered = '';
              let maxCount = 0;
              itemCounts.forEach((count, name) => {
                if (count > maxCount) {
                  maxCount = count;
                  mostOrdered = name;
                }
              });
              customer.mostOrderedItem = mostOrdered;
            }

            customerMap.set(customerKey, customer);
          }
        });

        const customersList = Array.from(customerMap.values()).map(customer => ({
          ...customer,
          isVIP: customer.totalSpent > 5000,
        }));
        setCustomers(customersList);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to fetch customer data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [restaurantId]);

  const sendWhatsAppMessage = (phone: string, customerName: string) => {
    const message = `Hello ${customerName}! We have a special offer for you. Use code 'VIP20' for 20% off your next order!`;
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBulkMessage = () => {
    const targets = customers.filter(c => selectedCustomers.includes(c.id));
    if (targets.length === 0) {
      toast.error("Please select at least one customer");
      return;
    }
    
    const first = targets[0];
    const whatsappUrl = `https://wa.me/${first.phone.replace(/\D/g, '')}?text=${encodeURIComponent(bulkMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    if (targets.length > 1) {
      toast.success(`Opening WhatsApp for ${first.name}. Please send manually for the other ${targets.length - 1} selected customers.`);
    }
    setShowBulkModal(false);
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.length === customers.length && customers.length > 0) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter(c => c !== id));
    } else {
      setSelectedCustomers([...selectedCustomers, id]);
    }
  };

  const exportToExcel = () => {
    if (customers.length === 0) {
      toast.error("No customers to export");
      return;
    }

    const exportData = customers.map(c => ({
      Name: c.name,
      Phone: c.phone,
      'Total Orders': c.totalOrders,
      'Total Spent': `Rs. ${c.totalSpent.toFixed(2)}`,
      'Most Ordered Item': c.mostOrderedItem,
      'Last Order Date': new Date(c.lastOrderedAt).toLocaleDateString(),
      'VIP Status': c.isVIP ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `Customers_${currentRestaurant?.name || 'Export'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Customers exported successfully");
  };

  if (loading) return <div className="p-4 text-center">Loading customers...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (customers.length === 0) return <div className="p-4 text-center">No customers found for this restaurant.</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Customer Relationship Management</h1>
          <p className="text-sm text-gray-600">Customers who have ordered from <span className="font-bold text-orange-600">{currentRestaurant?.name || 'this restaurant'}</span></p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-sm transition"
          >
            <Download className="h-4 w-4 mr-2" /> Export Customers Excel
          </button>
          <button 
            onClick={() => setShowBulkModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-sm transition"
          >
            <MessageSquare className="h-4 w-4 mr-2" /> Send Bulk Offer
          </button>
        </div>
      </div>

      {showBulkModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Send Bulk WhatsApp Offer</h3>
            <p className="text-sm text-gray-500 mb-4">Selected Customers: {selectedCustomers.length}</p>
            <textarea
              value={bulkMessage}
              onChange={(e) => setBulkMessage(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg h-32 text-sm focus:ring-orange-500 focus:border-orange-500 mb-4"
              placeholder="Type your offer message here..."
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowBulkModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkMessage}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700"
              >
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200">
              <th className="py-4 px-6 text-left">
                <input 
                  type="checkbox" 
                  checked={selectedCustomers.length === customers.length && customers.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </th>
              <th className="py-4 px-6 text-left">Customer</th>
              <th className="py-4 px-6 text-left">Total Orders</th>
              <th className="py-4 px-6 text-left">Total Spent</th>
              <th className="py-4 px-6 text-left">Last Ordered</th>
              <th className="py-4 px-6 text-left">Status</th>
              <th className="py-4 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-left">
                  <input 
                    type="checkbox" 
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => toggleSelect(customer.id)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </td>
                <td className="py-4 px-6 text-left">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{customer.name}</span>
                    <span className="text-xs text-gray-500">{customer.phone}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-left">
                  <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md font-bold text-xs">
                    {customer.totalOrders} Orders
                  </span>
                </td>
                <td className="py-4 px-6 text-left font-bold text-gray-900">₹{customer.totalSpent.toFixed(2)}</td>
                <td className="py-4 px-6 text-left text-xs text-gray-500">
                  {new Date(customer.lastOrderedAt).toLocaleDateString()}
                  <br/>
                  {new Date(customer.lastOrderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-4 px-6 text-left">
                  {customer.isVIP ? (
                    <span className="bg-yellow-100 text-yellow-700 py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-wide border border-yellow-200">VIP</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-wide border border-gray-200">Regular</span>
                  )}
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    onClick={() => sendWhatsAppMessage(customer.phone, customer.name)}
                    className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-2 px-4 rounded-lg inline-flex items-center transition-colors text-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-2" /> Message
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
