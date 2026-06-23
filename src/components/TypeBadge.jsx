import { TYPE_DETAILS } from '../constants/pokemonData';
import TypeIcon from './TypeIcon';

export default function TypeBadge({
    type,
    showIcon = true,
    className = '',
    isWeakness = false,
    multiplier = null
}) {
    const typeKey = type ? type.toLowerCase() : 'normal';
    const detail = TYPE_DETAILS[typeKey] || TYPE_DETAILS.normal;

    if (isWeakness) {
        let badgeColor = "bg-neutral-50 border-neutral-200/60 text-neutral-500";

        if (multiplier >= 2) {
            badgeColor = "bg-neutral-900 text-white border-neutral-950 font-bold";
        } else if (multiplier === 0) {
            badgeColor = "bg-neutral-100 text-neutral-300 border-neutral-200/40 line-through";
        } else if (multiplier < 1) {
            badgeColor = "bg-neutral-100 text-neutral-600 border-neutral-200/80";
        }

        return (
            <div className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${badgeColor} ${className}`}>
                {showIcon && <TypeIcon type={typeKey} className="w-3 h-3 flex-shrink-0" />}
                <span>{detail.label}</span>
                {multiplier !== null && <span className="font-mono opacity-85 ml-0.5">{multiplier}x</span>}
            </div>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1 uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border text-[9px] ${detail.color} ${className}`}>
            {showIcon && <TypeIcon type={typeKey} className="w-3 h-3 flex-shrink-0" />}
            {detail.label}
        </span>
    );
}
