import PropTypes from 'prop-types';
import { useModalBehavior } from '../hooks/useModalBehavior';

export default function ModalShell({ onClose, label, children, panelClassName = '' }) {
    useModalBehavior(true, onClose);

    return (
        <div
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-md bg-neutral-950/20 animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={label}
                className={`relative w-full overflow-y-auto overscroll-contain rounded-3xl border border-line bg-white text-slate-900 shadow-2xl scrollbar-none animate-scale-in ${panelClassName}`}
            >
                {children}
            </div>
        </div>
    );
}

ModalShell.propTypes = {
  onClose: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
  panelClassName: PropTypes.string,
};
