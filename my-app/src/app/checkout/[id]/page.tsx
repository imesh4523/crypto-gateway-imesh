// Backward compatibility redirect: /checkout/[id] → /pay/[id]
import { redirect } from 'next/navigation';

export default async function CheckoutRedirect({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    redirect(`/pay/${id}`);
}
