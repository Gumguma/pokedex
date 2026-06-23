
export default function TypeIcon({ type, className = "w-3 h-3" }) {
    const normalizedType = type ? type.toLowerCase() : 'normal';

    const getIconSvg = () => {
        switch (normalizedType) {
            case 'normal':
                return (
                    <>
                        <circle cx="12" cy="12" r="8" stroke="currentColor" fill="none" strokeWidth="2.5" />
                        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                    </>
                );
            case 'fire':
                return (
                    <>
                        <path d="M12 2C12 2 17 6.5 17 11.5a5 5 0 0 1-10 0C7 6.5 12 2 12 2z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 15.5c1 0 2-1 2-2.5 0-1.5-1-2-2-3.5-1 1.5-2 2-2 3.5 0 1.5 1 2.5 2 2.5z" fill="currentColor" />
                    </>
                );
            case 'water':
                return (
                    <path d="M12 2.5C12 2.5 6 9 6 13a6 6 0 0 0 12 0c0-4-6-10.5-6-10.5z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                );
            case 'electric':
                return (
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                );
            case 'grass':
                return (
                    <>
                        <path d="M20 4s-5 0-10 5-5 11-5 11 7-1 11-5 4-11 4-11z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 19L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </>
                );
            case 'ice':
                return (
                    <>
                        <path d="M12 2L4 12l8 10 8-10L12 2z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </>
                );
            case 'fighting':
                return (
                    <path d="M16 14c0 1.66-1.34 3-3 3H9c-2.76 0-5-2.24-5-5V9c0-2.76 2.24-5 5-5h3c1.66 0 3 1.34 3 3v1h2c1.66 0 3 1.34 3 3v2c0 1.66-1.34 3-3 3z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                );
            case 'poison':
                return (
                    <>
                        <path d="M10 2h4M12 2v4M6 22h12a2 2 0 0 0 2-2.5L15 8V6H9v2L4 19.5A2 2 0 0 0 6 22z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="15" r="1.5" fill="currentColor" />
                        <circle cx="9" cy="18" r="1" fill="currentColor" />
                        <circle cx="15" cy="18" r="1" fill="currentColor" />
                    </>
                );
            case 'ground':
                return (
                    <path d="M4 18h16M7 13h10M9 8h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                );
            case 'flying':
                return (
                    <path d="M4 10c2-3 6-3 8 0 2-3 6-3 8 0-4.5.5-7 3.5-8 8-1-4.5-3.5-7.5-8-8z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                );
            case 'psychic':
                return (
                    <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" fill="none" strokeWidth="2" />
                    </>
                );
            case 'bug':
                return (
                    <>
                        <path d="M12 2v18M7 7h10M7 12h10M7 17h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="9" y="5" width="6" height="14" rx="3" stroke="currentColor" fill="none" strokeWidth="2.5" />
                    </>
                );
            case 'rock':
                return (
                    <>
                        <path d="M12 3L4 9l2 10 12 2 4-7-2-5-8-3z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 9l8 5 4-7M6 19l6-5 6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                );
            case 'ghost':
                return (
                    <>
                        <path d="M19 10a7 7 0 0 0-14 0v9a1 1 0 0 0 1.5.85L9 18l2.5 1.5L15 18l2.5 1.85A1 1 0 0 0 19 19v-9z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="9" cy="10" r="1.5" fill="currentColor" />
                        <circle cx="15" cy="10" r="1.5" fill="currentColor" />
                    </>
                );
            case 'dragon':
                return (
                    <>
                        <path d="M12 22C6.48 22 2 17.52 2 12S12 2 12 2s10 4.48 10 10-4.48 10-10 10z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 7c-2.5 2-3 4.5-3 6.5s1.5 2.5 3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </>
                );
            case 'steel':
                return (
                    <path d="M12 2L3 6v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6l-9-4z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                );
            case 'fairy':
                return (
                    <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                );
            case 'dark':
                return (
                    <path d="M12.3 2a10 10 0 0 0-1.9 20 10 10 0 0 0 9.5-6.5 1 1 0 0 0-1.2-1.2 8 8 0 1 1-7.6-11.1 1 1 0 0 0 1.2-1.2z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                );
            case 'legendary':
                return (
                    <path d="M2 4l4 6 6-8 6 8 4-6v12H2V4zm2 14h16v2H4v-2z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                );
            case 'mythical':
                return (
                    <path d="M12 2L9 9 2 12l7 3 3 7 3-7 7-3-7-3-3-7z" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                );
            default:
                return (
                    <>
                        <circle cx="12" cy="12" r="8" stroke="currentColor" fill="none" strokeWidth="2.5" />
                        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                    </>
                );
        }
    };

    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            {getIconSvg()}
        </svg>
    );
}
