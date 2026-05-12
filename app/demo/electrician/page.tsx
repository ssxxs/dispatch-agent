import VerticalDemo from '@/components/VerticalDemo';
import { getVerticalMeta, listVerticalsMeta } from '@/lib/verticals/registry';

export default function ElectricianDemoPage() {
  return (
    <VerticalDemo
      vertical={getVerticalMeta('electrician')}
      allVerticals={listVerticalsMeta()}
      publicKey={process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? ''}
      assistantId={process.env.NEXT_PUBLIC_VAPI_ELECTRICIAN_ASSISTANT_ID ?? ''}
    />
  );
}
