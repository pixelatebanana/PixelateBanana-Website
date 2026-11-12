import ServiceCard from '../cards/ServiceCard';
import { SERVICES } from '@/lib/content';
export default function ServicesGrid() { return <div className="cards">{SERVICES.map((s) => <ServiceCard key={s.slug} s={s} />)}</div>; }
