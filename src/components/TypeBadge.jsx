import PropTypes from 'prop-types';
import { TYPE_DETAILS } from '../constants/pokemonData';
import { textOn } from '../utils/typeColor';
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
        let badgeColor = "bg-slate-50 border-slate-200 text-slate-500";
        let badgeStyle;

        if (multiplier >= 2) {
            badgeColor = "border-black/5 font-bold";
            badgeStyle = { backgroundColor: detail.hex, color: textOn(detail.hex) };
        } else if (multiplier === 0) {
            badgeColor = "bg-slate-100 text-slate-300 border-slate-200 line-through";
        } else if (multiplier < 1) {
            badgeColor = "bg-slate-100 text-slate-600 border-slate-200";
        }

        return (
            <div style={badgeStyle} className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${badgeColor} ${className}`}>
                {showIcon && <TypeIcon type={typeKey} className="w-3 h-3 flex-shrink-0" />}
                <span>{detail.label}</span>
                {multiplier !== null && <span className="font-mono opacity-85 ml-0.5">{multiplier}x</span>}
            </div>
        );
    }

    return (
        <span style={{ backgroundColor: detail.hex, color: textOn(detail.hex) }} className={`inline-flex items-center gap-1 uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border border-black/5 text-[9px] ${className}`}>
            {showIcon && <TypeIcon type={typeKey} className="w-3 h-3 flex-shrink-0" />}
            {detail.label}
        </span>
    );
}

TypeBadge.propTypes = {
    type: PropTypes.string,
    showIcon: PropTypes.bool,
    className: PropTypes.string,
    isWeakness: PropTypes.bool,
    multiplier: PropTypes.number
};
