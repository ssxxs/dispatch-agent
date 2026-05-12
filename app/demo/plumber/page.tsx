import VerticalDemo from '@/components/VerticalDemo';
import { getVerticalMeta, listVerticalsMeta } from '@/lib/verticals/registry';

export default function PlumberDemoPage() {
  return (
    <VerticalDemo
      vertical={getVerticalMeta('plumber')}
      allVerticals={listVerticalsMeta()}
      publicKey={process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? ''}
      assistantId=""
    />
  );
}
