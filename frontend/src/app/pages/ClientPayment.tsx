import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import { fetchPaymentById } from '../crm/services/paymentService';
import type { CRMPayment } from '../crm/services/paymentService';
import crmLogo from '../../assets/images/crm_ogo.png';
import websiteLogo from '../../assets/images/website_logo.png';

export function ClientPayment() {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<CRMPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Check query parameters first
    const params = new URLSearchParams(window.location.search);
    const qAmount = params.get('amount');
    const qCurrency = params.get('currency');
    const qDesc = params.get('desc');
    const qRzp = params.get('rzp');

    if (qAmount && qCurrency && qDesc && qRzp) {
      setPayment({
        id,
        amount: parseFloat(qAmount),
        currency: qCurrency,
        description: qDesc,
        razorpay_id: qRzp,
        status: 'pending',
        case_id: '',
        created_at: new Date().toISOString()
      } as CRMPayment);
      setLoading(false);
      return;
    }

    fetchPaymentById(id)
      .then(p => {
        if (!p) throw new Error('Payment not found');
        setPayment(p);
      })
      .catch(e => {
        console.error(e);
        setError('Payment link is invalid or expired.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRazorpayPayment = async () => {
    if (!payment) return;
    
    if (!payment.razorpay_id) {
        alert("No Razorpay order ID found for this payment.");
        return;
    }

    setPaying(true);

    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TKMzRZ167Z70fw',
        amount: payment.amount * 100,
        currency: payment.currency,
        description: payment.description || 'Service Payment',
      order_id: payment.razorpay_id, 
      handler: async function (response: any) {
        try {
          const verifyData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            payment_record_id: payment.id,
            case_id: payment.case_id,
            amount: payment.amount,
            currency: payment.currency
          };
          
          const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3006';
          const verifyRes = await fetch(`${API_URL}/api/payments/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verifyData)
          });
          
          if (verifyRes.ok) {
            // Update local state to show success
            setPayment({ ...payment, status: 'paid' });
          } else {
            alert('Payment verification failed.');
          }
        } catch (error) {
          console.error(error);
          alert('Error verifying payment.');
        } finally {
          setPaying(false);
        }
      },
      prefill: {
        name: 'Client', // Normally we'd prefill from case data, but skipping case fetch for simplicity
      }
    };
    
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        alert(response.error.description);
        setPaying(false);
      });
      rzp1.open();
    } catch (err) {
      console.error('Failed to initialize Razorpay:', err);
      alert('Failed to initialize payment gateway.');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center pt-32">
        <div className="animate-spin h-8 w-8 border-4 border-[#C9963C] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 pt-32 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-3xl max-w-md w-full border border-red-100 shadow-sm">
          <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold mb-2">Invalid Link</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (payment.status === 'paid') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 pt-32 bg-slate-50">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-xl border border-slate-100">
          <div className="flex justify-center mb-6">
            <img src={websiteLogo} alt="DNEX Logo" className="h-20 w-auto object-contain" />
          </div>
          <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">Payment Complete</h2>
          <p className="text-slate-500 mb-8 text-sm">Thank you for your payment. Your receipt has been sent to your email.</p>
          <div className="bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Amount Paid</span>
              <span className="font-bold text-slate-800 text-lg">{payment.currency} {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Description</span>
              <span className="font-medium text-slate-700 text-sm max-w-[200px] text-right truncate">{payment.description}</span>
            </div>
          </div>
          <div className="mt-8">
            <a href="/" className="inline-block text-[#C9963C] hover:text-[#b08030] font-semibold text-sm transition-colors">
              Return to Homepage &rarr;
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 pt-32 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-[#0A1628] p-8 text-center text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck size={64} />
          </div>
          <div className="flex justify-center mb-4"><img src={crmLogo} alt="DNEX Logo" className="h-10 w-auto object-contain" /></div>
          <h2 className="text-lg text-slate-300 mb-1">Secure Checkout</h2>
          <div className="text-4xl font-bold text-white tracking-tight mb-2">
            {payment.currency} {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-sm text-slate-400">Secure Payment Portal</p>
        </div>
        
        <div className="p-8">
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Payment Summary</h3>
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Service Description</span>
                <span className="font-medium text-slate-800 max-w-[150px] text-right truncate">{payment.description}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-800">{payment.currency} {payment.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRazorpayPayment}
            disabled={paying}
            className="w-full flex items-center justify-center space-x-2 bg-[#C9963C] hover:bg-[#b08030] text-white py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {paying ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Pay Securely Now</span>
              </>
            )}
          </button>
          
          <div className="mt-6 flex justify-center items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Payments are 256-bit encrypted and secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
