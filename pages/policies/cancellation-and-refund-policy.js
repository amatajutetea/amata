import Layout from '../../src/components/layout/Layout';

const title = "Cancellation & Refund Policy";
const content = [
  "3. Cancellation & Refund Policy",
  "3.1 Order Cancellation by Customer (Self-Service)",
  "Before Dispatch: You may cancel an order free of charge anytime before it is dispatched by using the instant 'Cancel Order' button inside your Amata Profile / Order History drawer.",
  "Alternatively, you can contact our support team via WhatsApp at +91 8777395787 or email contact@amatajutetea.com with your Order Reference ID (AMT-XXXXXX).",
  "After Dispatch: Once an order is handed over to our shipping courier (Delhivery), cancellation is no longer possible.",
  "3.2 Order Cancellation by Amata",
  "We reserve the right to cancel orders due to product unavailability, payment verification failure, pricing errors, or unserviceable delivery locations.",
  "In such cases, a 100% refund is automatically initiated to your original payment method.",
  "3.3 Consumables & Return Policy",
  "Due to FSSAI food safety, quality, and hygiene regulations, delivered Amata tea products are strictly non-returnable and non-refundable.",
  "However, if you receive a damaged product, incorrect tea flavour, or missing item, we will issue an immediate free replacement.",
  "3.4 Damaged / Defective / Incorrect Order Process (48-Hour Claim Window)",
  "If your package arrives damaged or contains an incorrect item:",
  "1. Take clear unboxing photo / video proof showing the damage or package label.",
  "2. Submit your claim within 48 hours of delivery using our interactive 'Facing problems with your order?' WhatsApp helper on your Track Order page or Order History drawer.",
  "3. Select your issue category (Damaged, Incorrect Flavour, Didn't Receive, or Something Else) to send an instant pre-formatted WhatsApp report to +91 8777395787.",
  "Our support team will review your claim and dispatch a free replacement within 24 hours.",
  "3.5 Refund Processing SLA via Razorpay",
  "For cancelled orders or payment gateway failures, refunds are automatically returned to your original payment source:",
  "• UPI Payments (GPay, PhonePe, Paytm): 3–5 business days.",
  "• Debit / Credit Cards & Net Banking: 5–7 business days.",
  "For refund status queries, you can track directly via Razorpay Support using your Payment ID."
];

export default function CancellationAndRefundPolicy() {
  return (
    <Layout title={`${title} | Amata`} navTheme="dark">
      <div style={{ padding: '150px 5vw 100px', maxWidth: '800px', margin: '0 auto', color: 'var(--c-deep)' }}>
        <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }} className="serif">{title}</h1>
        {content.map((paragraph, idx) => {
          if (/^\d+\./.test(paragraph)) {
            return <h2 key={idx} style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.5rem' }} className="serif">{paragraph}</h2>;
          }
          return <p key={idx} style={{ marginBottom: '1rem', lineHeight: '1.6' }}>{paragraph}</p>;
        })}
      </div>
    </Layout>
  );
}
