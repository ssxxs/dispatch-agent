import VerticalDemo from '@/components/VerticalDemo';
import { getVerticalMeta, listVerticalsMeta } from '@/lib/verticals/registry';

export default function DentalDemoPage() {
  return (
    <VerticalDemo
      vertical={getVerticalMeta('dental')}
      allVerticals={listVerticalsMeta()}
      publicKey={process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? ''}
      assistantId={process.env.NEXT_PUBLIC_VAPI_DENTAL_ASSISTANT_ID ?? ''}
    />
  );
}
