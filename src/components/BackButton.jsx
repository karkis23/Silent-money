import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * A premium, elegant back button for the Silent Money application.
 * Designed to provide a consistent, "rich aesthetic" navigation experience.
 * 
 * @param {Object} props
 * @param {string} props.to - Optional path to navigate to. If not provided, goes back in history.
 * @param {string} props.label - Optional text to display. Defaults to "Back".
 * @param {string} props.className - Additional CSS classes.
 */
export default function BackButton({ to, label = "Back", className = "" }) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <motion.button
            onClick={handleBack}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`group inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-400 hover:text-primary-600 transition-all duration-300 ${className}`}
        >
            <div className="w-10 h-10 rounded-full bg-white border border-charcoal-100 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-primary-100 group-hover:bg-primary-50 transition-all duration-300">
                <svg
                    className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </div>
            <span className="relative">
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </span>
        </motion.button>
    );
}
